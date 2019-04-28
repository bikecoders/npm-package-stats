import { Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { BotSharedModule } from '../shared/bot-shared.module';

import { AddFeature } from './add/add.feature';
import { StartFeature } from './start/start.feature';
import { StatsFeature } from './stats/stats.feature';

@Module({
  imports: [
    BotSharedModule,
    SharedModule,
  ],
  providers: [
    AddFeature,
    StartFeature,
    StatsFeature,
  ],
})
export class FeaturesModule {}
