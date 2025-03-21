import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import * as schema from "../drizzle/schema";
import { OpenAiService } from '../openai/openai.service';

@Injectable()
export class MessagesService {
    constructor(private readonly openAiService: OpenAiService, @Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof schema>) {
      }
    
      async addMessage(prompt: string, chatId: string, role): Promise<any> {
        await this.db.insert(schema.messages).values({
            content: prompt,
            chatId: chatId,
            role: role
        })

        if (role === 'USER') {
            return await this.openAiService.chat(prompt)
        }
      }
}
