import { Module } from '@nestjs/common';
import { NpmStatsService } from './npm-stats/npm-stats.service';
import { UsersModule } from './users/users.module';

@Module({
  imports: [UsersModule],
  providers: [NpmStatsService],
  exports: [NpmStatsService, UsersModule],
})
export class SharedModule {}
