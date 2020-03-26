import { Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { BotSharedModule } from '../shared/bot-shared.module';

import { AddFeature } from './add/add.feature';
import { StartFeature } from './start/start.feature';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [BotSharedModule, SharedModule, StatsModule],
  providers: [AddFeature, StartFeature],
})
export class FeaturesModule {}
