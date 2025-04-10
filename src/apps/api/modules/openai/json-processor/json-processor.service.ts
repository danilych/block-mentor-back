import { Injectable, Logger } from '@nestjs/common'
import { Response } from 'express'
import { QueueDispatcherService } from '../queue-dispatcher/queue-dispatcher.service'
import { EJobs } from 'src/common/constants/jobs_type'

@Injectable()
export class JsonProcessorService {
  private readonly logger = new Logger(JsonProcessorService.name)

  constructor(private readonly queueDispatcher: QueueDispatcherService) {}

  async processStreamContent(
    text: string,
    jsonState: {
      isCapturingJson: boolean
      jsonBuffer: string
      openBraces: number
      closeBraces: number
      visibleText: string
    },
    res: Response,
    walletAddress?: string
  ): Promise<{
    isCapturingJson: boolean
    jsonBuffer: string
    openBraces: number
    closeBraces: number
    visibleText: string
  }> {
    const {
      isCapturingJson,
      jsonBuffer,
      openBraces,
      closeBraces,
      visibleText,
    } = jsonState
    let newIsCapturingJson = isCapturingJson
    let newJsonBuffer = jsonBuffer
    let newOpenBraces = openBraces
    let newCloseBraces = closeBraces
    let newVisibleText = visibleText

    for (let i = 0; i < text.length; i++) {
      const char = text[i]

      if (char === '{' && !newIsCapturingJson && newOpenBraces === 0) {
        newIsCapturingJson = true
        newOpenBraces++
        newJsonBuffer += char
        continue
      }

      if (newIsCapturingJson) {
        newJsonBuffer += char

        if (char === '{') {
          newOpenBraces++
        } else if (char === '}') {
          newCloseBraces++
        }

        if (newOpenBraces > 0 && newOpenBraces === newCloseBraces) {
          newIsCapturingJson = false
          newOpenBraces = 0
          newCloseBraces = 0

          const processed = await this.processCompleteJson(
            newJsonBuffer,
            walletAddress
          )

          if (processed) {
            newJsonBuffer = ''
          } else {
            newVisibleText += newJsonBuffer
            res.write(newJsonBuffer)
            newJsonBuffer = ''
          }
        }
      } else {
        newVisibleText += char
        res.write(char)
      }
    }

    return {
      isCapturingJson: newIsCapturingJson,
      jsonBuffer: newJsonBuffer,
      openBraces: newOpenBraces,
      closeBraces: newCloseBraces,
      visibleText: newVisibleText,
    }
  }

  private async processCompleteJson(
    jsonBuffer: string,
    walletAddress?: string
  ): Promise<boolean> {
    try {
      const regex =
        /\{(?:\s*"[^"]*"\s*:\s*"[^"]*"\s*,?)*\s*"[^"]*"\s*:\s*"[^"]*"\s*\}/g
      const matches = jsonBuffer.match(regex)

      if (matches?.length) {
        const parsedObject = JSON.parse(matches[0]) as Record<string, string>
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
          return true
        }
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Error processing JSON: ${err.message}`)
    }

    return false
  }
}
