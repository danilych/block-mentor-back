import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { JSON_DECODE } from 'src/common/constants/queues'
import { JSONDecodeWorkerService } from './json-decode.worker.service'

@Module({
  providers: [JSONDecodeWorkerService],
  imports: [
    BullModule.registerQueue({
      name: JSON_DECODE,
    }),
  ],
  exports: [],
})
export class JsonDecodeModule {}
