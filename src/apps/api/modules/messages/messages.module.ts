import { Module } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { MessagesController } from './messages.controller'
import { OpenAiService } from '../openai/openai.service'
import { drizzleProvider } from '../drizzle/drizzle.provider'
import { AuthService } from '../auth/auth.service'

@Module({
  providers: [MessagesService, OpenAiService, ...drizzleProvider, AuthService],
  controllers: [MessagesController],
})
export class MessagesModule {}
