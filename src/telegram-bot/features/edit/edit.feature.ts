import { Injectable } from '@nestjs/common';

import * as TelegramBot from 'node-telegram-bot-api';

import { sendMessageHTMLInlineKeyboard } from '../../../telegram-bot/common';

import { BaseCommand } from '../../../telegram-bot/features/base.command';
import { BotService } from '../../../telegram-bot/shared/bot/bot.service';
// import { UsersService } from '../../../shared/users/service/users.service';

@Injectable()
export class EditFeature extends BaseCommand {
  public static readonly COMMAND = /\/mypackages/;

  constructor(
    botService: BotService,
    // private usersService: UsersService,
  ) {
    super(botService.bot, EditFeature.COMMAND);
  }

  protected commandFunction(msg: TelegramBot.Message, match: RegExpExecArray) {
    const chatId = msg.chat.id;

    console.log(':)');

    sendMessageHTMLInlineKeyboard(this.bot, chatId, 'just a edit test');

    this.bot.on('callback_query', (query) => {
      console.log('*******************************');
      console.log('mypackages', query);
      console.log('*******************************');
    });
  }
}
