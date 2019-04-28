import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [TelegramBotModule, SharedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
