import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { CREATE_VESTING } from 'src/common/constants/queues'
import { CreateVestingService } from './create-vesting.service'

@Module({
  providers: [CreateVestingService],
  imports: [
    BullModule.registerQueue({
      name: CREATE_VESTING,
    }),
  ],
  exports: [],
})
export class CreateVestingModule {}
