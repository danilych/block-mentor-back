import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { CREATE_TOKEN } from 'src/common/constants/queues'
import { CreateTokenService } from './create-token.service'

@Module({
  providers: [CreateTokenService],
  imports: [
    BullModule.registerQueue({
      name: CREATE_TOKEN,
    }),
  ],
  exports: [],
})
export class CreateTokenModule {}
