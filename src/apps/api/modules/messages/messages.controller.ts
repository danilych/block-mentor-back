import { Body, Controller, Inject, Post } from '@nestjs/common';
import { SendMessageDto } from './dtos/sendMessage.dto';
import { MessagesService } from './messages.service';


@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {
        
      }
    
      @Post()
      async sendMessage(@Body() body: SendMessageDto): Promise<any> {
       return await this.messagesService.addMessage(body.prompt, body.chatId, body.role)
      }
}
