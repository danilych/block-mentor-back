import { Body, Controller, Inject, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TUser } from 'src/common/constants/types';
import { PrivyGuard } from '../auth/guards/privy-auth.guard';
import { User } from '../user/decorators/user.params';
import { SendMessageDto } from './dtos/sendMessage.dto';
import { MessagesService } from './messages.service';
import { Response } from 'express';

@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {
        
      }
    
      @Post()
      @ApiBearerAuth()
      @UseGuards(PrivyGuard)
      async sendMessage(@Body() body: SendMessageDto, @User() user: TUser, @Res() res: Response): Promise<any> {
       return await this.messagesService.addMessage(body.prompt, user, body.role, res)
      }
}
