import { Module } from '@nestjs/common';

import { CronService } from './cron/cron.service';
import { SendStatsService } from './cron/send-stats/send-stats.service';
import { StatsFeature } from './stats.feature';

@Module({
  providers: [StatsFeature, CronService, SendStatsService],
})
export class StatsModule {}
