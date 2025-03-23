import { Inject, Injectable } from '@nestjs/common'
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider'
import { eq } from 'drizzle-orm/expressions'
import * as schema from '../drizzle/schema'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

@Injectable()
export class UserService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>
  ) {}

  async getTokensByUser(wallet: string) {
    const tokens = await this.db
      .select()
      .from(schema.createdTokens)
      .where(eq(schema.createdTokens.owner, wallet.toLowerCase()))

    if (!tokens.length) {
      throw new Error('User has no tokens')
    }

    return tokens
  }

  async getVestingsByUser(wallet: string) {
    const vestings = await this.db
      .select()
      .from(schema.vestings)
      .where(eq(schema.vestings.owner, wallet.toLowerCase()))

    if (!vestings.length) {
      throw new Error('User has no vestings')
    }

    return vestings
  }
}
