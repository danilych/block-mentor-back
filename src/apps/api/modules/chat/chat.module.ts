import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { drizzleProvider } from '../drizzle/drizzle.provider';

@Module({
  providers: [ChatService, ...drizzleProvider],
  controllers: [ChatController]
})
export class ChatModule {}
