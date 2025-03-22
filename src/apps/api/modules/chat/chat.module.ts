import { Module } from '@nestjs/common'
import { ChatService } from './chat.service'
import { ChatController } from './chat.controller'
import { drizzleProvider } from '../drizzle/drizzle.provider'
import { AuthService } from '../auth/auth.service'

@Module({
  providers: [ChatService, ...drizzleProvider, AuthService],
  controllers: [ChatController],
})
export class ChatModule {}
