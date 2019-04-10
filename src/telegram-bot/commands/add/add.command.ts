import * as TelegramBot from 'node-telegram-bot-api';

import { BaseCommand } from '../base.command';
import { Template } from './common';
import { NpmStatsService } from '../../../shared/npm-stats/npm-stats.service';
import { sendMessageHTML } from '../../common';
import { UsersService } from '../../../users/service/users.service';

export class AddCommand extends BaseCommand {
  public static readonly COMMAND = /\/add/;

  constructor(
    bot: TelegramBot,
    private npmStatsService: NpmStatsService,
    private userService: UsersService,
  ) {
    super(bot, AddCommand.COMMAND);
  }

  protected commandFunction(msg: TelegramBot.Message, match: RegExpExecArray) {
    const chatId = msg.chat.id;
    // Remove multiple spaces just for one
    const msgWithoutSpaces = msg.text.replace(/\s+/g, ' ').trim();
    const packageSlug = msgWithoutSpaces.split(' ')[1] || '';

    if (!!packageSlug) {
      this.npmStatsService.validateSlug(packageSlug)
        .subscribe((isAValidPackage) => {
          if (isAValidPackage) {
            this.userService.addPackage(chatId, packageSlug)
              .subscribe((_) => {
                sendMessageHTML(this.bot, chatId, Template.success(packageSlug), msg.message_id);
              });
          } else {
            sendMessageHTML(this.bot, chatId, Template.packageNotFound(packageSlug), msg.message_id);
          }
        });
    } else {
      sendMessageHTML(this.bot, chatId, Template.wrongCommand, msg.message_id);
    }
  }
}
