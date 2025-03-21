import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from '../../common/config/appConfig';
import { ChatModule } from './modules/chat/chat.module';
import { DrizzleModule } from './modules/drizzle/drizzle.module';
import { MessagesModule } from './modules/messages/messages.module';
import { OpenAiModule } from './modules/openai/openai.module';

@Module({
  imports: [
    DrizzleModule,
    ConfigModule.forRoot({
      load: [
        appConfig,
      ],
      isGlobal: true,
    }),
    OpenAiModule,
    MessagesModule,
    ChatModule
  ],
})
export class AppModule {}
