import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Stream } from 'openai/streaming';
import { IAppConfig } from 'src/common/config/appConfig';
import { configNames } from 'src/common/constants/configNames';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;
  private readonly appConfig: IAppConfig;

  constructor(private readonly configService: ConfigService) {
    this.appConfig = configService.getOrThrow<IAppConfig>(
      configNames.APP,
    );
    this.openai = new OpenAI({ apiKey: this.appConfig.openAi });
  }

  async chat(prompt: string): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    const stream = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
          role: "user",
          content: prompt,
      }],
      stream: true
  });
    return stream;
  }
}
