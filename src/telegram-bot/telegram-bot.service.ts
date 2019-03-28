import { Injectable } from '@nestjs/common';

import * as TelegramBot from 'node-telegram-bot-api';

import { User } from '../models/user.interface';
import { UsersService } from '../users/users.service';
import * as Messages from '../shared/messages.template';

@Injectable()
export class TelegramBotService {
  /**
   * Telegram bot instance
   */
  bot: TelegramBot;

  readonly startCommand = /\/start/;

  constructor(private userService: UsersService) {
    // replace the value below with the Telegram token you receive from @BotFather
    const token = process.env.TELEGRAM_BOT_KEY;

    // Create a bot that uses 'polling' to fetch new updates
    this.bot = new TelegramBot(token, { polling: true });

    this.createCommandListeners();
  }

  /**
   * Create listeners for all the supported commands
   */
  private createCommandListeners() {
    this.commandListenerStart();
  }

  /**
   * /start command listener
   */
  private commandListenerStart() {
    this.bot.onText(this.startCommand, msg => {
      const chatId = msg.chat.id;
      const user: User = { chatId: chatId.toString() };

      // TODO catch any error
      this.userService.create(user)
        .subscribe(_ => {
          this.sendMessageMarkdown(chatId, Messages.welcome);
        });
    });
  }

  private sendMessageMarkdown(chatId: string | number, message: string) {
    this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  }
}
