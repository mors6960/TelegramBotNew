// src/app.module.ts
import { Module } from '@nestjs/common';
import { HealthModule } from './api/health/health.module';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from './api/telegram/bot.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),
    HealthModule,
    BotModule
  ],
  controllers: [],
  // providers: [BotService],
})
export class AppModule { }
