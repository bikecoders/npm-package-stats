import { Module } from '@nestjs/common';

import { SharedModule } from '@shared/shared.module';
import { UsersModule } from '@shared/users/users.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramBotController } from './telegram-bot/telegram-bot.controller';

@Module({
  imports: [UsersModule, SharedModule],
  controllers: [AppController, TelegramBotController],
  providers: [AppService],
})
export class AppModule {}
