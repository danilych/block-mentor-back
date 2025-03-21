import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { GetOrCreateChatDto } from './dtos/getOrCreateChat.dto';

@Controller('chats')
export class ChatController {

    constructor(
        private readonly chatService: ChatService
        ) {}

    @Get('')
    @HttpCode(HttpStatus.OK)
    async getOrCreateChat(@Query() query: GetOrCreateChatDto) {
      return await this.chatService.getOrCreateChat(query.userId);
    }
}
