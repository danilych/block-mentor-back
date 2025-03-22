import { Processor, Process } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'
import { CREATE_TOKEN } from 'src/common/constants/queues'

@Processor({ name: CREATE_TOKEN })
export class CreateTokenService {
  private readonly logger = new Logger(CreateTokenService.name)

  @Process({ concurrency: 1 })
  async handlePurchase(
    job: Job<{
      payload: object
    }>
  ) {
    this.logger.log(`New job received in ${CREATE_TOKEN}`)
    const { payload } = job.data

    // TODO: Add service to decode JSON

    try {
      this.logger.log('Create token job finished, proceed action...')
      return { success: true }
    } catch (err) {
      if (job.attemptsMade === 3) {
      }
    }
  }
}
