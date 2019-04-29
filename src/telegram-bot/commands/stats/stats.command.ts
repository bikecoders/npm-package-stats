import * as TelegramBot from 'node-telegram-bot-api';

import { BaseCommand } from '../base.command';

import { map, switchMap, mergeMap } from 'rxjs/operators';

import { NpmStatsService } from 'src/shared/npm-stats/npm-stats.service';
import { UsersService } from '../../../users/service/users.service';
import { sendMessageHTML } from '../../common';
import * as Messages from './common/messages.template';

export class StatsCommand extends BaseCommand {
  public static readonly COMMAND = /\/stats/;

  constructor(
    bot: TelegramBot,
    private npmStatsService: NpmStatsService,
    private userService: UsersService,
  ) {
    super(bot, StatsCommand.COMMAND);
  }

  protected commandFunction(msg: TelegramBot.Message, match: RegExpExecArray) {
    const chatId = msg.chat.id;

    // Indicate some stuff
    sendMessageHTML(this.bot, chatId, Messages.disclaimer);

    // Get the user
    this.userService.getUser(chatId).pipe(
      // Iterate the packages
      switchMap(user => user.packagesIterative),
      // Get the stats of that package
      mergeMap((pack) => this.npmStatsService.getStatsForYesterday(pack.npmSlug)),
      // Sent the message
      map((info) => sendMessageHTML(this.bot, chatId, Messages.stat(info))),
      // In case you need telling something at the end uncomment these lines
      // toArray(),
      // mergeMap((sentMsj$) => forkJoin(sentMsj$)),
    )
      .subscribe();
  }
}
