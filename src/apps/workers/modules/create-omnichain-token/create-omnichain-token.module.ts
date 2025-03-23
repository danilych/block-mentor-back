import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { CREATE_OMNICHAIN_TOKEN } from 'src/common/constants/queues'
import { CreateOmnichainTokenService } from './create-omnichain-token.service'

@Module({
  providers: [CreateOmnichainTokenService],
  imports: [
    BullModule.registerQueue({
      name: CREATE_OMNICHAIN_TOKEN,
    }),
  ],
  exports: [],
})
export class CreateOmnichainTokenModule {}
