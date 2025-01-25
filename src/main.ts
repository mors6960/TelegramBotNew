import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BotService } from './api/telegram/bot.service';
import * as dotenv from 'dotenv';
import * as cors from 'cors';
import helmet from "helmet";
import { NestExpressApplication } from "@nestjs/platform-express";



async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set("trust proxy", true);
  app.use(cors());
  app.use(helmet());
  app.enableCors();
  // app.setGlobalPrefix("bot/api/v1");
  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
