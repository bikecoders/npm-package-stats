import { Module } from '@nestjs/common';
import { NpmStatsService } from './npm-stats/npm-stats.service';

@Module({
  providers: [NpmStatsService],
  exports: [NpmStatsService],
})
export class SharedModule {}
