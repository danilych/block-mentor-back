import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
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

  async chat(prompt: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
          role: "user",
          content: "Write a one-sentence bedtime story about a unicorn.",
      }],
  });
    return completion.choices[0].message.content as string;
  }
}
