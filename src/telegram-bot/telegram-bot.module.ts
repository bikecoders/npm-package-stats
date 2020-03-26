import { Module } from '@nestjs/common';
import { TelegramBotController } from './telegram-bot.controller';
import { FeaturesModule } from './features/features.module';
import { BotCoreModule } from './core/bot-core.module';

@Module({
  imports: [FeaturesModule, BotCoreModule],
  controllers: [TelegramBotController],
})
export class TelegramBotModule {}
