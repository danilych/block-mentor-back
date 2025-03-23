import { Module } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { MessagesController } from './messages.controller'
import { drizzleProvider } from '../drizzle/drizzle.provider'
import { AuthService } from '../auth/auth.service'
import { OpenAiModule } from '../openai/openai.module'

@Module({
  providers: [MessagesService, ...drizzleProvider, AuthService],
  controllers: [MessagesController],
  imports: [OpenAiModule],
})
export class MessagesModule {}
