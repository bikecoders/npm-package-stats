import * as TelegramBot from 'node-telegram-bot-api';

import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { sendMessage } from '../../../common';
import { Template } from '.';

import { User } from '../../../../core/users/shared/models';
import { NpmStatsService } from '../../../../core/npm-stats/npm-stats.service';
import { UsersService } from '../../../../core/users/service/users.service';

export function sendStatsMsg(
  bot: TelegramBot,
  chatId: number,
  npmStatsService: NpmStatsService,
  userService: UsersService,
): void;
export function sendStatsMsg(
  bot: TelegramBot,
  user: User,
  npmStatsService: NpmStatsService,
): void;
export function sendStatsMsg(
  bot: TelegramBot,
  user: number | User,
  npmStatsService: NpmStatsService,
  userService?: UsersService,
): void {
  let chatId: number;
  let user$: Observable<User>;

  if (user instanceof User) {
    chatId = user.chatId;
    user$ = of(user);
  } else {
    chatId = user;
    user$ = userService.getUser(chatId);
  }

  // Indicate some stuff
  sendMessage(bot, chatId, Template.disclaimer);

  user$
    .pipe(
      // Iterate the packages
      mergeMap(u => u.packagesIterative),
      // Get the stats of that package
      mergeMap(pack => npmStatsService.getStatsForYesterday(pack.npmSlug)),
    )
    .subscribe(info => sendMessage(bot, chatId, Template.stat(info)));
}
