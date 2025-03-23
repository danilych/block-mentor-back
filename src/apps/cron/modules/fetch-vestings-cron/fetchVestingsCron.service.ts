import { Injectable, Logger, Inject } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ConfigService } from '@nestjs/config'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import * as schema from '../../../api/modules/drizzle/schema'
import { DrizzleAsyncProvider } from '../../../api/modules/drizzle/drizzle.provider'

interface VestingScheduleCreated {
  blockNumber: string
  beneficiary: string
  blockTimestamp: string
  periodDuration: string
  start: string
  token: string
  tokenName: string
  tokenSymbol: string
  totalAmount: string
  totalPeriods: string
  vestingContract: string
}

interface GraphQLResponse {
  data?: {
    vestingScheduleCreateds: VestingScheduleCreated[]
  }
  errors?: Array<{
    message: string
  }>
}

interface AppConfig {
  graphQl: string
}

// Type for database insertion
interface DbVesting {
  blockTimestamp: string
  token_address: string
  token_name: string
  token_ticker: string
  owner: string
  amount: string
  total_periods: number
  period_duration: number
  start_timestamp: string
}

@Injectable()
export class FetchVestingsCronService {
  private readonly logger = new Logger(FetchVestingsCronService.name)
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
        .where(eq(schema.lastCheckedBlocks.type, 'VESTINGS_FETCH'))
        .limit(1)

      if (result.length > 0) {
        this.logger.debug(
          `Found last checked block number: ${result[0].blockNumber}`
        )
        return result[0].blockNumber
      }

      await this.db.insert(schema.lastCheckedBlocks).values({
        type: 'VESTINGS_FETCH',
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
  async fetchVestings(): Promise<VestingScheduleCreated[] | null> {
    this.logger.log('Fetching vestings')

    try {
      // Get the last checked block number
      const lastBlockNumber = await this.getLastCheckedBlockNumber()

      console.log(lastBlockNumber)

      const query = `
      query MyQuery {
          vestingScheduleCreateds(where: {blockNumber_gt: ${lastBlockNumber}}) {
          beneficiary
          blockNumber
          blockTimestamp
          periodDuration
          start
          token
          tokenName
          tokenSymbol
          totalAmount
          totalPeriods
          vestingContract
        }
      }
    `

      const response = await fetch(this.graphQlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      const result = (await response.json()) as GraphQLResponse
      const fetchedVestings = result.data?.vestingScheduleCreateds || []

      if (fetchedVestings.length === 0) {
        this.logger.debug('No new vestings found')
        return null
      }

      // Process vestings here
      this.logger.log(`Successfully fetched ${fetchedVestings.length} vestings`)

      // Map GraphQL vestings to database schema format
      const vestingsForDb: DbVesting[] = fetchedVestings.map(vesting => ({
        blockTimestamp: vesting.blockTimestamp,
        token_address: vesting.token.toLowerCase(),
        token_name: vesting.tokenName,
        token_ticker: vesting.tokenSymbol,
        owner: vesting.beneficiary.toLowerCase(),
        amount: vesting.totalAmount,
        total_periods: parseInt(vesting.totalPeriods),
        period_duration: parseInt(vesting.periodDuration),
        start_timestamp: vesting.start,
      }))

      console.log(vestingsForDb)

      // If we got new vestings, update the last checked block
      if (fetchedVestings.length > 0) {
        // Find the highest block number among fetched vestings
        const latestBlock = Math.max(
          ...fetchedVestings.map(w => {
            return parseInt(w.blockNumber)
          })
        )

        await this.updateLastCheckedBlock(latestBlock.toString())
      }

      // Save vestings to database
      if (vestingsForDb.length > 0) {
        this.logger.debug(`Saving ${vestingsForDb.length} vestings to database`)
        await this.db.insert(schema.vestings).values(vestingsForDb)
      }

      return fetchedVestings
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
        .where(eq(schema.lastCheckedBlocks.type, 'VESTINGS_FETCH'))
        .returning()

      // If no record was updated, insert a new one
      if (updateResult.length === 0) {
        await this.db.insert(schema.lastCheckedBlocks).values({
          type: 'VESTINGS_FETCH',
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
