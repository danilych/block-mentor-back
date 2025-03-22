import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Response } from 'express'
import { TUser } from 'src/common/constants/types'
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider'
import * as schema from '../drizzle/schema'
import { OpenAiService } from '../openai/openai.service'

@Injectable()
export class MessagesService {
  constructor(
    private readonly openAiService: OpenAiService,
    @Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof schema>
  ) {}

  async addMessage(
    prompt: string,
    user: TUser,
    role,
    res: Response
  ): Promise<any> {
    const chat = await this.db.query.chats
      .findFirst({
        where: (chats, { eq }) => eq(chats.userId, user.id),
        with: {
          messages: true,
        },
      })
      .then(res => res || null)

    if (!chat) return

    const combinedPrompt = [
      ...chat.messages.map(message => ({
        content: message.content,
        role: message.role,
      })),
      { role: role, content: prompt },
    ]

    await this.db.insert(schema.messages).values({
      content: prompt,
      chatId: chat.id,
      role: role,
    })

    if (role === 'USER') {
      return await this.openAiService.chat(combinedPrompt, res, prompt =>
        this.saveAgentMessage(prompt, chat)
      )
    }
  }

  private async saveAgentMessage(prompt, chat) {
    await this.db.insert(schema.messages).values({
      content: prompt,
      chatId: chat.id,
      role: 'assistant',
    })
  }
}
