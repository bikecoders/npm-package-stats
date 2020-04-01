import { Module, Global } from '@nestjs/common';

import { BotService } from './bot/bot.service';
import { InlineResponsesService } from './inline-responses/inline-responses.service';

@Global()
@Module({
  providers: [BotService, InlineResponsesService],
  exports: [BotService, InlineResponsesService],
})
export class BotCoreModule {}
