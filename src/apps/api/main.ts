import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { IAppConfig } from 'src/common/config/appConfig';
import { configNames } from 'src/common/constants/configNames';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.use(json({ limit: '64mb' }));
  app.use(
    urlencoded({ extended: true, limit: '64mb', parameterLimit: 10_000 }),
  );

  const configService = app.get(ConfigService);
  const config = configService.get<IAppConfig>(configNames.APP);

  app.enableCors({
    credentials: true,
    origin: true,
  });

  if (!config) {
    throw new Error('App config does not exists');
  }

  const logger = new Logger('App');

  await app.listen(config.port, () => {
    logger.log(`Server successfully started on port ${config.port}`);
  });
}
bootstrap();
