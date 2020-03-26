import { Injectable } from '@nestjs/common';

import { mergeMap } from 'rxjs/operators';

import { sendStatsMsg } from '../../common';

import { BotService } from '../../../../../telegram-bot/shared/bot/bot.service';
import { CronService } from '../cron.service';
import { UsersService } from '../../../../../shared/users/service/users.service';
import { NpmStatsService } from '../../../../../shared/npm-stats/npm-stats.service';

@Injectable()
export class SendStatsService {
  constructor(
    private botService: BotService,
    private cronService: CronService,
    private usersService: UsersService,
    private npmStatsService: NpmStatsService,
  ) {
    this.cronService.cronAnnouncer.subscribe(() => this.sendMessage());
  }

  private sendMessage() {
    this.usersService
      .getAllUsers()
      .pipe(mergeMap(users => users))
      .subscribe(user =>
        sendStatsMsg(this.botService.bot, user, this.npmStatsService),
      );
  }
}
