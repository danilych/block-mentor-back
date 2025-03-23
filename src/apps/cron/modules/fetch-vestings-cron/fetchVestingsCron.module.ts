import { Module } from '@nestjs/common'
import { FetchVestingsCronService } from './fetchVestingsCron.service'
import { ConfigModule } from '@nestjs/config'
import { drizzleProvider } from '../../../api/modules/drizzle/drizzle.provider'

@Module({
  imports: [ConfigModule],
  providers: [...drizzleProvider, FetchVestingsCronService],
})
export class FetchVestingsCronModule {}
