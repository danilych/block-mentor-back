import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import { IAppConfig } from 'src/common/config/appConfig'
import { configNames } from 'src/common/constants/configNames'
import { Response } from 'express'
import { basicPrompt } from 'src/common/constants/basicPrompt'
import { QueueDispatcherService } from './queue-dispatcher/queue-dispatcher.service'
import { TUser } from 'src/common/constants/types'

@Injectable()
export class OpenAiService {
  private openai: OpenAI
  private readonly appConfig: IAppConfig
  private readonly logger = new Logger(OpenAiService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly queueDispatcher: QueueDispatcherService
  ) {
    this.appConfig = configService.getOrThrow<IAppConfig>(configNames.APP)
    this.openai = new OpenAI({ apiKey: this.appConfig.openAi })
  }

  async chat(prompt: string, res: Response, user: TUser, callback) {
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
        {
          role: 'system',
          content: basicPrompt,
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

    const jsonStringStartIdx = fullText.indexOf('{')
    const jsonStringEndIdx = fullText.indexOf('}')
    const jsonString = fullText
      .slice(jsonStringStartIdx, jsonStringEndIdx + 1)
      .replaceAll('\n', '')

    try {
      await this.queueDispatcher.prepareAndProcceed(
        user.wallet as string,
        JSON.parse(jsonString)
      )
    } catch (err) {
      this.logger.log(`Error to procced queues ${JSON.stringify(err.message)}`)
    }
  }
}
