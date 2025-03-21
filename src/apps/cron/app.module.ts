import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import appConfig from "../../common/config/appConfig";
import { FetchTokensCronModule } from "./modules/fetch-tokens-cron/fetchTokensCron.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
    }),
    FetchTokensCronModule,
  ],
})
export class AppModule {}
