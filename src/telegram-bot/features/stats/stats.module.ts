import { Module } from '@nestjs/common';

import { BotSharedModule } from '../../../telegram-bot/shared/bot-shared.module';
import { CronService } from './cron/cron.service';
import { SendStatsService } from './cron/send-stats/send-stats.service';
import { SharedModule } from '../../../shared/shared.module';
import { StatsFeature } from './stats.feature';

@Module({
  imports: [
    BotSharedModule,
    SharedModule,
  ],
  providers: [StatsFeature, CronService, SendStatsService],
})
export class StatsModule {}
