import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  @Cron(CronExpression.EVERY_10_SECONDS)
  dummyCron() {
    this.logger.log("Dummy cron executed");
  }
}
