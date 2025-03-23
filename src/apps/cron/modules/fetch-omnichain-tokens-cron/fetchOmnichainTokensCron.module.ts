import { Module } from '@nestjs/common'
import { FetchOmnichainTokensCronService } from './fetchOmnichainTokensCron.service'
import { ConfigModule } from '@nestjs/config'
import { drizzleProvider } from '../../../api/modules/drizzle/drizzle.provider'

@Module({
  imports: [ConfigModule],
  providers: [...drizzleProvider, FetchOmnichainTokensCronService],
})
export class FetchOmnichainTokensCronModule {}
