import { Processor, Process } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'
import { JSON_DECODE } from 'src/common/constants/queues'

@Processor({ name: JSON_DECODE })
export class JSONDecodeService {
  private readonly logger = new Logger(JSONDecodeService.name)

  constructor() {}

  @Process({ concurrency: 1 })
  async handlePurchase(
    job: Job<{
      payload: object
    }>
  ) {
    this.logger.log(`New job received in ${JSON_DECODE}`)
    const { payload } = job.data

    // TODO: Add service to decode JSON

    try {
      this.logger.log('JSON Decode finished, proceed action...')
      return { success: true }
    } catch (err) {
      if (job.attemptsMade === 3) {
      }
    }
  }
}
