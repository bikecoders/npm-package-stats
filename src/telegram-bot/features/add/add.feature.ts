import { Injectable } from '@nestjs/common';

import * as TelegramBot from 'node-telegram-bot-api';

import { BotService } from '../../shared/bot/bot.service';

import { BaseCommand } from '../base.command';
import { Template } from './common';
import { UsersService } from '../../../shared/users/service/users.service';
import { sendMessageHTML } from '../../common';
import { NpmStatsService } from '../../../shared/npm-stats/npm-stats.service';

@Injectable()
export class AddFeature extends BaseCommand {
  public static readonly COMMAND = /\/add/;

  constructor(
    botService: BotService,
    private npmStatsService: NpmStatsService,
    private userService: UsersService,
  ) {
    super(botService.bot, AddFeature.COMMAND);
  }

  protected commandFunction(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    // Remove multiple spaces just for one
    const msgWithoutSpaces = msg.text.replace(/\s+/g, ' ').trim();
    const packageSlug = msgWithoutSpaces.split(' ')[1] || '';

    if (!!packageSlug) {
      this.npmStatsService
        .validateSlug(packageSlug)
        .subscribe(isAValidPackage => {
          if (isAValidPackage) {
            this.userService.addPackage(chatId, packageSlug).subscribe(() => {
              sendMessageHTML(
                this.bot,
                chatId,
                Template.success(packageSlug),
                msg.message_id,
              );
            });
          } else {
            sendMessageHTML(
              this.bot,
              chatId,
              Template.packageNotFound(packageSlug),
              msg.message_id,
            );
          }
        });
    } else {
      sendMessageHTML(this.bot, chatId, Template.wrongCommand, msg.message_id);
    }
  }
}
