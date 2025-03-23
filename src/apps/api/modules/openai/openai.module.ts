import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { CREATE_TOKEN, CREATE_VESTING } from 'src/common/constants/queues'
import { OpenAiService } from './openai.service'
import { QueueDispatcherService } from './queue-dispatcher/queue-dispatcher.service'

@Module({
  providers: [OpenAiService, QueueDispatcherService],
  exports: [OpenAiService, QueueDispatcherService],
  imports: [
    BullModule.registerQueue({
      name: CREATE_TOKEN,
    }),
    BullModule.registerQueue({
      name: CREATE_VESTING,
    }),
  ],
})
export class OpenAiModule {}
