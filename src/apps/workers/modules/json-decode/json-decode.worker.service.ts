import { Processor, Process } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'
import { JSON_DECODE } from 'src/common/constants/queues'

@Processor({ name: JSON_DECODE })
export class JSONDecodeWorkerService {
  private readonly logger = new Logger(JSONDecodeWorkerService.name)

  constructor() {}

  @Process({ concurrency: 1 })
  async handlePurchase(
    job: Job<{
      name: string
      ticker: string
      initialAmount: string //wei
    }>
  ) {
    this.logger.log(`New job received in ${JSON_DECODE}`)
    const { name, ticker, initialAmount } = job.data

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
