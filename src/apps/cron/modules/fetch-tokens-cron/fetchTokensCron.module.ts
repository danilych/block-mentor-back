import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { FetchTokensCronService } from './fetchTokensCron.service'
import { ConfigModule } from '@nestjs/config'
import { drizzleProvider } from '../../../api/modules/drizzle/drizzle.provider'

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule],
  providers: [...drizzleProvider, FetchTokensCronService],
})
export class FetchTokensCronModule {}
