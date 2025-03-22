import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import { TUser } from 'src/common/constants/types'
import { PrivyGuard } from '../auth/guards/privy-auth.guard'
import { User } from '../user/decorators/user.params'
import { ChatService } from './chat.service'

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('')
  @ApiBearerAuth()
  @UseGuards(PrivyGuard)
  @HttpCode(HttpStatus.OK)
  async getOrCreateChat(@User() user: TUser) {
    return await this.chatService.getOrCreateChat(user.id)
  }
}
