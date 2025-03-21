import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import appConfig from '../../common/config/appConfig'
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
  ],
})
export class AppModule {}
