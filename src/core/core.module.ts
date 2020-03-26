import { Module, Global } from '@nestjs/common';

import { NpmStatsService } from './npm-stats/npm-stats.service';
import { UsersModule } from './users/users.module';

@Global()
@Module({
  imports: [UsersModule],
  providers: [NpmStatsService],
  exports: [NpmStatsService, UsersModule],
})
export class CoreModule {}
