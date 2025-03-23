import { Injectable, Logger, Inject } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ConfigService } from '@nestjs/config'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import * as schema from '../../../api/modules/drizzle/schema'
import { DrizzleAsyncProvider } from '../../../api/modules/drizzle/drizzle.provider'

interface TokenCreated {
  blockNumber: string
  blockTimestamp: string
  initialAmount: string
  name: string
  owner: string
  ticker: string
  token: string
  transactionHash: string
}

interface GraphQLResponse {
  data?: {
    omnichainTokenCreateds: TokenCreated[]
  }
  errors?: Array<{
    message: string
  }>
}

interface AppConfig {
  graphQl: string
}

// Type for database insertion
interface DbToken {
  blockTimestamp: string
  initialAmount: string
  name: string
  ticker: string
  owner: string
  token_address: string
  base_address?: string
}

@Injectable()
export class FetchOmnichainTokensCronService {
  private readonly logger = new Logger(FetchOmnichainTokensCronService.name)
  private readonly graphQlEndpoint: string

  constructor(
    private configService: ConfigService,
    @Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof schema>
  ) {
    const config = this.configService.get<AppConfig>('app')
    this.graphQlEndpoint = config?.graphQl || ''
  }

  private async getLastCheckedBlockNumber(): Promise<string> {
    try {
      // Query the last checked block for token fetching
      const result = await this.db
        .select({ blockNumber: schema.lastCheckedBlocks.blockNumber })
        .from(schema.lastCheckedBlocks)
        .where(eq(schema.lastCheckedBlocks.type, 'OMNICHAIN_TOKENS_FETCH'))
        .limit(1)

      if (result.length > 0) {
        this.logger.debug(
          `Found last checked block number: ${result[0].blockNumber}`
        )
        return result[0].blockNumber
      }

      await this.db.insert(schema.lastCheckedBlocks).values({
        type: 'OMNICHAIN_TOKENS_FETCH',
        blockNumber: '0',
      })

      return '0'
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new Error(`Error getting last checked block: ${errorMessage}`)
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async fetchTokens(): Promise<TokenCreated[] | null> {
    this.logger.log('Fetching tokens')

    try {
      // Get the last checked block number
      const lastBlockNumber = await this.getLastCheckedBlockNumber()

      const query = `
        query MyQuery {
        omnichainTokenCreateds(where: {blockNumber_gt: "${lastBlockNumber}"}) {
        blockNumber
        initialAmount
        name
        owner
        ticker
        token
      }
    }
      `

      const response = await fetch(
        'https://api.studio.thegraph.com/query/107388/block-mentor-base/version/latest',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        }
      )

      const result = (await response.json()) as GraphQLResponse
      const fetchedTokens = result.data?.omnichainTokenCreateds || []

      if (fetchedTokens.length === 0) {
        this.logger.debug('No new omnichain tokens found')
        return null
      }

      // Process tokens here
      this.logger.log(`Successfully fetched ${fetchedTokens.length} tokens`)

      // Map GraphQL tokens to database schema format
      const tokensForDb: DbToken[] = fetchedTokens.map(token => ({
        blockTimestamp: token.blockTimestamp,
        initialAmount: token.initialAmount,
        name: token.name,
        ticker: token.ticker,
        owner: token.owner.toLowerCase(),
        token_address: token.token.toLowerCase(),
      }))

      for (const token of tokensForDb) {
        const query2 = `
        query MyQuery {
        omnichainTokenCreated
        omnichainTokenCreateds(where: {name: ${token.name}}) {
        token
        }
      }
      `

        const responseV2 = await fetch(this.graphQlEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query2 }),
        })

        const resultV2 = (await responseV2.json()) as GraphQLResponse
        const fetchedTokensV2 = resultV2.data?.omnichainTokenCreateds || []

        token.base_address = fetchedTokensV2[0]?.token
      }

      // If we got new tokens, update the last checked block
      if (fetchedTokens.length > 0) {
        // Find the highest block number among fetched tokens
        const latestBlock = Math.max(
          ...fetchedTokens.map(w => {
            return parseInt(w.blockNumber)
          })
        )

        await this.updateLastCheckedBlock(latestBlock.toString())
      }

      // Save tokens to database
      if (tokensForDb.length > 0) {
        this.logger.debug(`Saving ${tokensForDb.length} tokens to database`)
        await this.db.insert(schema.createdTokens).values(tokensForDb)
      }

      return fetchedTokens
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      this.logger.error(`Failed to fetch tokens: ${errorMessage}`)
      return null
    }
  }

  private async updateLastCheckedBlock(blockNumber: string): Promise<void> {
    try {
      // First try to update existing record
      const updateResult = await this.db
        .update(schema.lastCheckedBlocks)
        .set({ blockNumber })
        .where(eq(schema.lastCheckedBlocks.type, 'OMNICHAIN_TOKENS_FETCH'))
        .returning()

      // If no record was updated, insert a new one
      if (updateResult.length === 0) {
        await this.db.insert(schema.lastCheckedBlocks).values({
          type: 'OMNICHAIN_TOKENS_FETCH',
          blockNumber,
        })
        this.logger.debug(
          `Created new last checked block record: ${blockNumber}`
        )
      } else {
        this.logger.debug(`Updated last checked block to: ${blockNumber}`)
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      this.logger.error(`Failed to update last checked block: ${errorMessage}`)
    }
  }
}
