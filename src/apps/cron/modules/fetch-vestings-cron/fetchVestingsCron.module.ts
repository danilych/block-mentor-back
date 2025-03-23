import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { FetchVestingsCronService } from './fetchVestingsCron.service'
import { ConfigModule } from '@nestjs/config'
import { drizzleProvider } from '../../../api/modules/drizzle/drizzle.provider'

@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule],
  providers: [...drizzleProvider, FetchVestingsCronService],
})
export class FetchVestingsCronModule {}
