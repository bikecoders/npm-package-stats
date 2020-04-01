import { Module } from '@nestjs/common';

import { AddFeature } from './add/add.feature';
import { StartFeature } from './start/start.feature';
import { StatsModule } from './stats/stats.module';
import { RemoveFeature } from './remove-package/remove-package.feature';

@Module({
  imports: [StatsModule],
  providers: [AddFeature, StartFeature, RemoveFeature],
})
export class FeaturesModule {}
