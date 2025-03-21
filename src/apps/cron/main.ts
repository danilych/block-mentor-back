import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { IAppConfig } from "src/common/config/appConfig";
import { configNames } from "src/common/constants/configNames";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const config = configService.getOrThrow<IAppConfig>(configNames.APP);

  await app.listen(+config.port + 2);
}
bootstrap();
