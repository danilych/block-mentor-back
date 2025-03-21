import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from '../../common/config/appConfig';
import { DrizzleModule } from './modules/drizzle/drizzle.module';
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
    OpenAiModule
  ],
})
export class AppModule {}
