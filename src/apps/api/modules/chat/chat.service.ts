import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider'
import { chats } from '../drizzle/schema'
import * as schema from '../drizzle/schema'
import { eq } from 'drizzle-orm'

@Injectable()
export class ChatService {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof schema>
  ) {}

  async getOrCreateChat(userId: string) {
    // const chat = await this.db
    //   .select({
    //     id: chats.id,
    //     userId: chats.userId,
    //     messages: schema.messages,
    //   })
    //   .from(chats)
    //   .leftJoin(schema.messages, eq(chats.id, schema.messages.chatId))
    //   .where(eq(chats.userId, userId))
    //   .then(res => res[0] || null)

    const chat = await this.db.query.chats.findFirst({
      where: (chats, { eq }) => eq(chats.userId, userId),
      with: {
        messages: true,
      },
    })

    if (!chat) {
      const newChat = await this.db
        .insert(chats)
        .values({
          userId: userId,
        })
        .returning()

      return newChat
    }

    return chat
  }
}
