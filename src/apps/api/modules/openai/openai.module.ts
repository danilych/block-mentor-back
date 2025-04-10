import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import {
  CREATE_OMNICHAIN_TOKEN,
  CREATE_TOKEN,
  CREATE_VESTING,
} from 'src/common/constants/queues'
import { OpenAiService } from './openai.service'
import { QueueDispatcherService } from './queue-dispatcher/queue-dispatcher.service'
import { UserService } from '../user/user.service'
import { drizzleProvider } from '../drizzle/drizzle.provider'
import { PromptService } from './prompt/prompt.service'
import { JsonProcessorService } from './json-processor/json-processor.service'

@Module({
  providers: [
    OpenAiService,
    QueueDispatcherService,
    UserService,
    PromptService,
    JsonProcessorService,
    ...drizzleProvider,
  ],
  exports: [OpenAiService, QueueDispatcherService],
  imports: [
    BullModule.registerQueue({
      name: CREATE_TOKEN,
    }),
    BullModule.registerQueue({
      name: CREATE_VESTING,
    }),
    BullModule.registerQueue({
      name: CREATE_OMNICHAIN_TOKEN,
    }),
  ],
})
export class OpenAiModule {}
