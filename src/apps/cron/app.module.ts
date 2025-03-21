import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import appConfig from "../../common/config/appConfig";
import { CronModule } from "./modules/cron/cron.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
    }),
    CronModule,
  ],
})
export class AppModule {}
