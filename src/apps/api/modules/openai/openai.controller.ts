import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { OpenAiService } from "./openai.service";

@Controller('chat')
export class OpenAiController {
  constructor(
    private readonly openAiChat: OpenAiService
    ) {}

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getOpenAiChat() {
    return await this.openAiChat.chat('hello mate');
  }
}
