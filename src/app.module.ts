import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { TelegramBotService } from './telegram-bot/telegram-bot.service';

@Module({
  imports: [UsersModule],
  controllers: [AppController],
  providers: [AppService, TelegramBotService],
})
export class AppModule {}
