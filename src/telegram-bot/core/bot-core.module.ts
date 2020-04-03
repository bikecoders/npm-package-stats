import { Module, Global } from '@nestjs/common';

import { BotService } from './bot/bot.service';
import { InlineResponsesService } from './inline-responses/inline-responses.service';
import { InlineSearchService } from './inline-search/inline-search.service';

@Global()
@Module({
  providers: [BotService, InlineResponsesService, InlineSearchService],
  exports: [BotService, InlineResponsesService],
})
export class BotCoreModule {}
