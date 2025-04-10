import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import { IAppConfig } from 'src/common/config/appConfig'
import { configNames } from 'src/common/constants/configNames'
import { Response } from 'express'
import { TUser } from 'src/common/constants/types'
import { UserService } from '../user/user.service'
import { PromptService } from './prompt/prompt.service'
import { JsonProcessorService } from './json-processor/json-processor.service'
import { IJsonState, IToken, IVesting } from './openai.types'

@Injectable()
export class OpenAiService {
  private openai: OpenAI
  private readonly appConfig: IAppConfig
  private readonly logger = new Logger(OpenAiService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly promptService: PromptService,
    private readonly jsonProcessorService: JsonProcessorService
  ) {
    this.appConfig = configService.getOrThrow<IAppConfig>(configNames.APP)
    this.openai = new OpenAI({ apiKey: this.appConfig.openAi })
  }

  async chat(
    prompt: string,
    res: Response,
    user: TUser,
    callback: (fullText: string) => void
  ) {
    this.setupResponseHeaders(res)
    const jsonState: IJsonState = {
      isCapturingJson: false,
      jsonBuffer: '',
      openBraces: 0,
      closeBraces: 0,
      visibleText: '',
    }

    const { userTokens, userVestings, walletAddress } =
      await this.getUserData(user)

    const userDataPrompt = this.promptService.formatUserDataForPrompt(
      userTokens,
      userVestings,
      walletAddress || ''
    )

    const messages = this.promptService.getCompleteChatPrompt(
      prompt,
      userDataPrompt
    )

    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      messages: messages as any,
      stream: true,
    })

    await this.processStream(stream, res, jsonState, walletAddress, callback)
  }

  private setupResponseHeaders(res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()
  }

  private async getUserData(user: TUser): Promise<{
    userTokens: IToken[]
    userVestings: IVesting[]
    walletAddress: string | null
  }> {
    let userTokens: IToken[] = []
    let userVestings: IVesting[] = []
    const walletAddress = user.wallet?.toLowerCase() || null

    if (!walletAddress) {
      this.logger.log('User wallet address is missing')
      return { userTokens, userVestings, walletAddress }
    }

    try {
      userTokens = await this.userService.getTokensByUser(walletAddress)
    } catch {
      this.logger.log(`No tokens found for user: ${walletAddress}`)
    }

    try {
      userVestings = await this.userService.getVestingsByUser(walletAddress)
    } catch {
      this.logger.log(`No vestings found for user: ${walletAddress}`)
    }

    return { userTokens, userVestings, walletAddress }
  }

  private async processStream(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
    res: Response,
    initialJsonState: IJsonState,
    walletAddress: string | null,
    callback: (fullText: string) => void
  ): Promise<void> {
    let jsonState = { ...initialJsonState }

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || ''

      jsonState = await this.jsonProcessorService.processStreamContent(
        text,
        jsonState,
        res,
        walletAddress || undefined
      )
    }

    if (jsonState.jsonBuffer.length > 0) {
      jsonState.visibleText += jsonState.jsonBuffer
      res.write(jsonState.jsonBuffer)
    }

    callback(jsonState.visibleText)
    res.end()
  }
}
