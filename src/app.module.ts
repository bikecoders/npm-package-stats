import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [TelegramBotModule, CoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
