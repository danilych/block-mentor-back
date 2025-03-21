import { Controller, Get, HttpCode, HttpStatus, Query } from "@nestjs/common";
import { OpenAiService } from "./openai.service";

@Controller('chat')
export class OpenAiController {
  constructor(
    private readonly openAiChat: OpenAiService
    ) {}

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getOpenAiChat(@Query() query: {text:string}) {
    return await this.openAiChat.chat(query.text);
  }
}
