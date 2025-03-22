import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import appConfig from '../../common/config/appConfig'
import { FetchTokensCronModule } from './modules/fetch-tokens-cron/fetchTokensCron.module'
import { BullModule } from '@nestjs/bull'
import { configNames } from 'src/common/constants/configNames'
import { IAppConfig } from '../../common/config/appConfig'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { bull } = configService.getOrThrow<IAppConfig>(configNames.APP)

        return {
          redis: {
            family: +bull.family,
            host: bull.host,
            port: +bull.port,
            db: +bull.db,
            username: bull.username,
            password: bull.password,
          },
        }
      },
    }),
    FetchTokensCronModule,
  ],
})
export class AppModule {}
