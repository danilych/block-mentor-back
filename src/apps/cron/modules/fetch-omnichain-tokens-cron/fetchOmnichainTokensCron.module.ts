import { Module } from '@nestjs/common'
import { FetchTokensCronService } from './fetchOmnichainTokensCron.service'
import { ConfigModule } from '@nestjs/config'
import { drizzleProvider } from '../../../api/modules/drizzle/drizzle.provider'

@Module({
  imports: [ConfigModule],
  providers: [...drizzleProvider, FetchTokensCronService],
})
export class FetchTokensCronModule {}
