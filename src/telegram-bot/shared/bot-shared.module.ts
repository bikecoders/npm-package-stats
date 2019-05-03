import { Module } from '@nestjs/common';

import { BotService } from './bot/bot.service';

@Module({
  providers: [BotService],
  exports: [BotService],
})
export class BotSharedModule {}
