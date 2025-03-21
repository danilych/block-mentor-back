import { Injectable, Logger, Inject } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import * as schema from "../../../api/modules/drizzle/schema";
import { DrizzleAsyncProvider } from "../../../api/modules/drizzle/drizzle.provider";

interface TokenCreated {
  blockNumber: string;
  blockTimestamp: string;
  initialAmount: string;
  name: string;
  owner: string;
  ticker: string;
  token: string;
  transactionHash: string;
}

interface GraphQLResponse {
  data?: {
    tokenCreateds: TokenCreated[];
  };
  errors?: Array<{
    message: string;
  }>;
}

interface AppConfig {
  graphQl: string;
}

// Type for database insertion
interface DbToken {
  blockTimestamp: string;
  initialAmount: string;
  name: string;
  ticker: string;
  owner: string;
  token_address: string;
}

@Injectable()
export class FetchTokensCronService {
  private readonly logger = new Logger(FetchTokensCronService.name);
  private readonly graphQlEndpoint: string;

  constructor(
    private configService: ConfigService,
    @Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof schema>,
  ) {
    const config = this.configService.get<AppConfig>("app");
    this.graphQlEndpoint = config?.graphQl || "";
  }

  private async getLastCheckedBlockNumber(): Promise<string> {
    try {
      // Query the last checked block for token fetching
      const result = await this.db
        .select({ blockNumber: schema.lastCheckedBlocks.blockNumber })
        .from(schema.lastCheckedBlocks)
        .where(eq(schema.lastCheckedBlocks.type, "TOKENS_FETCH"))
        .limit(1);

      if (result.length > 0) {
        this.logger.debug(
          `Found last checked block number: ${result[0].blockNumber}`,
        );
        return result[0].blockNumber;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Error getting last checked block: ${errorMessage}`);
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async fetchTokens(): Promise<TokenCreated[] | null> {
    this.logger.log("Fetching tokens");

    try {
      // Get the last checked block number
      const lastBlockNumber = await this.getLastCheckedBlockNumber();
      
      const query = `
        query MyQuery {
          tokenCreateds(block: {number_gte: ${lastBlockNumber}}) {
            blockNumber
            blockTimestamp
            initialAmount
            name
            owner
            ticker
            token
            transactionHash
          }
        }
      `;

      this.logger.debug(`GraphQL endpoint: ${this.graphQlEndpoint}`);
      this.logger.debug(`Querying tokens from block: ${lastBlockNumber}`);

      const response = await fetch(this.graphQlEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const result = (await response.json()) as GraphQLResponse;
      const fetchedTokens = result.data?.tokenCreateds || [];

      if (fetchedTokens.length === 0) {
        this.logger.debug("No new tokens found");
        return null;
      }

      // Process tokens here
      this.logger.log(`Successfully fetched ${fetchedTokens.length} tokens`);
      
      // Map GraphQL tokens to database schema format
      const tokensForDb: DbToken[] = fetchedTokens.map((token) => ({
        blockTimestamp: token.blockTimestamp,
        initialAmount: token.initialAmount,
        name: token.name,
        ticker: token.ticker,
        owner: token.owner,
        token_address: token.token,
      }));

      // If we got new tokens, update the last checked block
      if (fetchedTokens.length > 0) {
        // Find the highest block number among fetched tokens
        const latestBlock = Math.max(
          ...fetchedTokens.map((w) => {
            return parseInt(w.blockNumber);
          }),
        );
        
        await this.updateLastCheckedBlock(latestBlock.toString());
      }

      // Save tokens to database
      if (tokensForDb.length > 0) {
        this.logger.debug(`Saving ${tokensForDb.length} tokens to database`);
        await this.db.insert(schema.createdTokens).values(tokensForDb);
      }

      return fetchedTokens;
    } catch (error) {
      const errorMessage = 
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to fetch tokens: ${errorMessage}`);
      return null;
    }
  }

  private async updateLastCheckedBlock(blockNumber: string): Promise<void> {
    try {
      // First try to update existing record
      const updateResult = await this.db
        .update(schema.lastCheckedBlocks)
        .set({ blockNumber })
        .where(eq(schema.lastCheckedBlocks.type, "TOKENS_FETCH"))
        .returning();
      
      // If no record was updated, insert a new one
      if (updateResult.length === 0) {
        await this.db.insert(schema.lastCheckedBlocks).values({
          type: "TOKENS_FETCH",
          blockNumber,
        });
        this.logger.debug(
          `Created new last checked block record: ${blockNumber}`,
        );
      } else {
        this.logger.debug(`Updated last checked block to: ${blockNumber}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to update last checked block: ${errorMessage}`);
    }
  }
}
