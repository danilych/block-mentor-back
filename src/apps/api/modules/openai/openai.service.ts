import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'
import { IAppConfig } from 'src/common/config/appConfig'
import { configNames } from 'src/common/constants/configNames'
import { Response } from 'express'
import { basicPrompt } from 'src/common/constants/basicPrompt'
import { QueueDispatcherService } from './queue-dispatcher/queue-dispatcher.service'
import { TUser } from 'src/common/constants/types'
import { UserService } from '../user/user.service'
import { EJobs } from 'src/common/constants/jobs_type'

interface IToken {
  id: string
  blockTimestamp: string
  initialAmount: string
  name: string
  ticker: string
  owner: string
  token_address: string
}

interface IVesting {
  id: string
  blockTimestamp: string
  token_address: string
  token_name: string
  token_ticker: string
  owner: string
  amount: string
  total_periods: number
  period_duration: number
  start_timestamp: string
  base_address: string | null
}

@Injectable()
export class OpenAiService {
  private openai: OpenAI
  private readonly appConfig: IAppConfig
  private readonly logger = new Logger(OpenAiService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly queueDispatcher: QueueDispatcherService,
    private readonly userService: UserService
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
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    let jsonBuffer = ''
    let isCapturingJson = false
    let openBraces = 0
    let closeBraces = 0
    let visibleText = ''

    let userTokens: IToken[] = []
    let userVestings: IVesting[] = []

    const walletAddress = user.wallet?.toLowerCase() as string

    if (!walletAddress) {
      this.logger.log('User wallet address is missing')
    } else {
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
    }

    const userDataPrompt = this.formatUserDataForPrompt(
      userTokens,
      userVestings,
      walletAddress
    )

    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
        {
          role: 'developer',
          content: basicPrompt + '\n\n' + userDataPrompt,
        },
      ],
      stream: true,
    })

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || ''

      for (let i = 0; i < text.length; i++) {
        const char = text[i]

        if (char === '{' && !isCapturingJson && openBraces === 0) {
          isCapturingJson = true
          openBraces++
          jsonBuffer += char
          continue
        }

        if (isCapturingJson) {
          jsonBuffer += char

          if (char === '{') {
            openBraces++
          } else if (char === '}') {
            closeBraces++
          }

          if (openBraces > 0 && openBraces === closeBraces) {
            isCapturingJson = false
            openBraces = 0
            closeBraces = 0

            try {
              const regex =
                /\{(?:\s*"[^"]*"\s*:\s*"[^"]*"\s*,?)*\s*"[^"]*"\s*:\s*"[^"]*"\s*\}/g
              const matches = jsonBuffer.match(regex)

              if (matches?.length) {
                const parsedObject = JSON.parse(matches[0]) as Record<
                  string,
                  string
                >
                const keys = Object.keys(parsedObject)

                for (const key of keys) {
                  parsedObject[key] = parsedObject[key].replaceAll(' ', '')
                }

                if (
                  'type' in parsedObject &&
                  typeof parsedObject.type === 'string' &&
                  walletAddress
                ) {
                  await this.queueDispatcher.prepareAndProcceed(
                    walletAddress,
                    parsedObject as { type: EJobs; [key: string]: string }
                  )

                  const feedbackMessage =
                    '\n\nЯ запланировал выполнение вашего запроса. Результаты будут доступны в ближайшее время.\n\n'
                  visibleText += feedbackMessage
                  res.write(feedbackMessage)
                } else {
                  visibleText += jsonBuffer
                  res.write(jsonBuffer)
                }

                jsonBuffer = ''
              } else {
                visibleText += jsonBuffer
                res.write(jsonBuffer)
                jsonBuffer = ''
              }
            } catch (_err) {
              visibleText += jsonBuffer
              res.write(jsonBuffer)
              jsonBuffer = ''
            }
          }
        } else {
          visibleText += char
          res.write(char)
        }
      }
    }

    if (jsonBuffer.length > 0) {
      visibleText += jsonBuffer
      res.write(jsonBuffer)
    }

    callback(visibleText)
    res.end()
  }

  private formatUserDataForPrompt(
    tokens: IToken[],
    vestings: IVesting[],
    wallet: string
  ): string {
    let promptData = `USER WALLET DATA:\n`
    promptData += `Wallet address: ${wallet}\n\n`

    if (tokens && tokens.length > 0) {
      promptData += `USER TOKENS:\n`
      tokens.forEach((token, index) => {
        const readableAmount = this.convertWeiToEther(token.initialAmount)
        promptData += `${index + 1}. Token Name: ${token.name}\n`
        promptData += `   Symbol: ${token.ticker}\n`
        promptData += `   Initial Amount: ${readableAmount}\n`
        promptData += `   Contract Address: ${token.token_address}\n`
        promptData += `   Created: ${this.formatTimestamp(token.blockTimestamp)}\n\n`
      })
    } else {
      promptData += `USER TOKENS: None\n\n`
    }

    if (vestings && vestings.length > 0) {
      promptData += `USER VESTINGS:\n`
      vestings.forEach((vesting, index) => {
        const readableAmount = this.convertWeiToEther(vesting.amount)
        promptData += `${index + 1}. Token Name: ${vesting.token_name}\n`
        promptData += `   Symbol: ${vesting.token_ticker}\n`
        promptData += `   Vesting Amount: ${readableAmount}\n`
        promptData += `   Total Periods: ${vesting.total_periods}\n`
        promptData += `   Period Duration: ${vesting.period_duration} seconds\n`
        promptData += `   Start Time: ${this.formatTimestamp(vesting.start_timestamp)}\n`
        promptData += `   Contract Address: ${vesting.base_address || 'Not deployed'}\n\n`
      })
    } else {
      promptData += `USER VESTINGS: None\n\n`
    }

    promptData += `INSTRUCTIONS FOR DISPLAYING USER DATA:\n`
    promptData += `When asked about tokens or vestings, please provide this information in a user-friendly format.\n`
    promptData += `You can mention the token names, symbols, amounts, and other relevant details as shown above.\n`
    promptData += `Always reference the user's actual data rather than asking them to check the left panel only.\n`

    return promptData
  }

  private convertWeiToEther(weiAmount: string): string {
    try {
      return (BigInt(weiAmount) / BigInt(10 ** 18)).toString()
    } catch {
      return '0'
    }
  }

  private formatTimestamp(timestamp: string): string {
    try {
      return new Date(parseInt(timestamp) * 1000).toLocaleString()
    } catch {
      return 'Unknown date'
    }
  }
}
