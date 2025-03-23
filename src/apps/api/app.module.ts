import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { configNames } from 'src/common/constants/configNames'
import appConfig, { IAppConfig } from '../../common/config/appConfig'
import { AuthModule } from './modules/auth/auth.module'
import { ChatModule } from './modules/chat/chat.module'
import { DrizzleModule } from './modules/drizzle/drizzle.module'
import { MessagesModule } from './modules/messages/messages.module'
import { OpenAiModule } from './modules/openai/openai.module'
import { UserModule } from './modules/user/user.module'

@Module({
  imports: [
    DrizzleModule,
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
    }),
    OpenAiModule,
    MessagesModule,
    ChatModule,
    UserModule,
    AuthModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { bull } = configService.getOrThrow<IAppConfig>(configNames.APP)
        console.log('bull api', bull)

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
  ],
})
export class AppModule {}
