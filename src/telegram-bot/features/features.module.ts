import { Module } from '@nestjs/common';

import { AddFeature } from './add/add.feature';
import { StartFeature } from './start/start.feature';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [StatsModule],
  providers: [AddFeature, StartFeature],
})
export class FeaturesModule {}
