import { Injectable } from '@nestjs/common';
import { tap } from 'rxjs/operators';

import * as TelegramBot from 'node-telegram-bot-api';

import { BotService } from '../../core/bot/bot.service';

import { BaseCommand } from '../base.command';
import { Template } from './common';
import { UsersService } from '../../../core/users/service/users.service';
import { sendMessage } from '../../common';
import { NpmStatsService } from '../../../core/npm-stats/npm-stats.service';

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
    const packageSlug = this.sanitizePackageSlug(msgWithoutSpaces);

    if (!!packageSlug) {
      this.addPackage(packageSlug, chatId, msg);
    } else {
      sendMessage(
        this.bot,
        chatId,
        Template.tellMeThePackage,
        msg.message_id,
        null,
        true,
      )
        .pipe(
          tap(message => {
            this.bot.onReplyToMessage(
              message.chat.id,
              message.message_id,
              messageReplied => {
                const packageSlugToAdd = this.sanitizePackageSlug(
                  messageReplied.text,
                  false,
                );
                this.addPackage(packageSlugToAdd, chatId, message);
              },
            );
          }),
        )
        .subscribe();
    }
  }

  private addPackage(
    packageSlug: string,
    chatId: number,
    msg: TelegramBot.Message,
  ) {
    this.npmStatsService
      .validateSlug(packageSlug)
      .subscribe(isAValidPackage => {
        if (isAValidPackage) {
          this.userService.addPackage(chatId, packageSlug).subscribe(() => {
            sendMessage(
              this.bot,
              chatId,
              Template.success(packageSlug),
              msg.message_id,
            );
          });
        } else {
          sendMessage(
            this.bot,
            chatId,
            Template.packageNotFound(packageSlug),
            msg.message_id,
          );
        }
      });
  }

  private sanitizePackageSlug(
    msgWithoutSpaces: string,
    cameDirectlyFromAdd = true,
  ) {
    const packageSlug =
      msgWithoutSpaces.trim().split(' ')[cameDirectlyFromAdd ? 1 : 0] || '';

    return packageSlug;
  }
}
