import { Module } from '@nestjs/common';
import { TelegramBotController } from './telegram-bot.controller';
import { FeaturesModule } from './features/features.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    FeaturesModule,
    SharedModule,
  ],
  controllers: [TelegramBotController],
})
export class TelegramBotModule {}
