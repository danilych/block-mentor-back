import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { CREATE_TOKEN } from 'src/common/constants/queues'
import { OpenAiService } from './openai.service'
import { QueueDispatcherService } from './queue-dispatcher/queue-dispatcher.service'

@Module({
  providers: [OpenAiService, QueueDispatcherService],
  exports: [OpenAiService, QueueDispatcherService],
  imports: [
    BullModule.registerQueue({
      name: CREATE_TOKEN,
    }),
  ],
})
export class OpenAiModule {}
