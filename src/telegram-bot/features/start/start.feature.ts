import { Injectable } from '@nestjs/common';

import * as TelegramBot from 'node-telegram-bot-api';

import { BaseCommand } from '../base.command';

import { BotService } from '../../core/bot/bot.service';
import { UsersService } from '@core/users/service/users.service';

import { User } from '@core/users/shared/models';
import { Template } from './common';
import { sendMessage } from '../../common';

@Injectable()
export class StartFeature extends BaseCommand {
  public static readonly COMMAND = /\/start/;

  constructor(botService: BotService, private userService: UsersService) {
    super(botService.bot, StartFeature.COMMAND);
  }

  protected commandFunction(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;
    const user: User = new User(chatId);

    // TODO catch any error
    this.userService.create(user).subscribe(() => {
      sendMessage(this.bot, chatId, Template.welcome);
    });
  }
}
