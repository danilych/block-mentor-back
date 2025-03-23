import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { configNames } from 'src/common/constants/configNames'
import appConfig, { IAppConfig } from '../../common/config/appConfig'
import { BullModule } from '@nestjs/bull'
import { CreateTokenModule } from './modules/create-token/create-token.module'

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
        console.log('bull w', bull)

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
    CreateTokenModule,
  ],
})
export class AppModule {}
