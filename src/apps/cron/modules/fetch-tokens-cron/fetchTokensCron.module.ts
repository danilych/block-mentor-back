import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { FetchTokensCronService } from './fetchTokensCron.service'
import { ConfigModule } from '@nestjs/config'
import { drizzleProvider } from '../../../api/modules/drizzle/drizzle.provider'
import { BullModule } from '@nestjs/bull'
import { CREATE_TOKEN } from 'src/common/constants/queues'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    BullModule.registerQueue({
      name: CREATE_TOKEN,
    }),
  ],
  providers: [...drizzleProvider, FetchTokensCronService],
})
export class FetchTokensCronModule {}
