import * as TelegramBot from 'node-telegram-bot-api';

import { BaseCommand } from '../base.command';

import { UsersService } from '@shared/users/service/users.service';
import { User } from '@shared/users/shared/models';

import { Template } from './common';
import { sendMessageHTML } from '../../common';

export class StartCommand extends BaseCommand {
  public static readonly COMMAND = /\/start/;

  constructor(
    bot: TelegramBot,
    private userService: UsersService,
  ) {
    super(bot, StartCommand.COMMAND);
  }

  protected commandFunction(msg: TelegramBot.Message, match: RegExpExecArray) {
    const chatId = msg.chat.id;
    const user: User = new User(chatId);

    // TODO catch any error
    this.userService.create(user)
      .subscribe(_ => {
        sendMessageHTML(this.bot, chatId, Template.welcome);
      });
  }
}
