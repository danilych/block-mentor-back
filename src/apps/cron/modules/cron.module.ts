import { Module } from '@nestjs/common';
import { CronController } from './cron/cron.controller';
import { CronService } from './cron/cron.service';

@Module({
  imports: [],
  controllers: [CronController],
  providers: [CronService],
})
export class CronModule {}
