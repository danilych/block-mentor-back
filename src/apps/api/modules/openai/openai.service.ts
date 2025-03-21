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
    const response = await this.openai.completions.create({
      model: 'gpt-4',
      prompt,
      max_tokens: 150,
    });
    return response.choices[0].text.trim();
  }
}
