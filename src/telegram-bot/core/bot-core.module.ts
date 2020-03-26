import { Module, Global } from '@nestjs/common';

import { BotService } from './bot/bot.service';

@Global()
@Module({
  providers: [BotService],
  exports: [BotService],
})
export class BotCoreModule {}
