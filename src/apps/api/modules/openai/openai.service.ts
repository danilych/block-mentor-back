import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import { IAppConfig } from 'src/common/config/appConfig'
import { configNames } from 'src/common/constants/configNames'
import { Response } from 'express'

@Injectable()
export class OpenAiService {
  private openai: OpenAI
  private readonly appConfig: IAppConfig

  constructor(private readonly configService: ConfigService) {
    this.appConfig = configService.getOrThrow<IAppConfig>(configNames.APP)
    this.openai = new OpenAI({ apiKey: this.appConfig.openAi })
  }

  async chat(prompt: string, res: Response, callback) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    let fullText = ''

    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: true,
    })
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || ''
      fullText += text
      res.write(`data: ${text}\n\n`)
    }
    callback(fullText)
    res.end()
  }
}
