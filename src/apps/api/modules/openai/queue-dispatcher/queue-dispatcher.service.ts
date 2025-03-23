import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { EJobs } from 'src/common/constants/jobs_type'
import { CREATE_TOKEN } from 'src/common/constants/queues'

@Injectable()
export class QueueDispatcherService {
  constructor(@InjectQueue(CREATE_TOKEN) private createTokenQueue: Queue) {}
  async prepareAndProcceed(
    userWallet: string,
    json: { type: EJobs; [key: string]: string }
  ) {
    const jobs = {
      [EJobs.CREATE_TOKEN]: () =>
        this.createTokenQueue.add({
          components: json,
          userWalletAddress: userWallet,
        }),
    }

    await jobs[json.type]()
  }
}
