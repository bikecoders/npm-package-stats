import { Injectable } from '@nestjs/common';

import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class BotService {
  /**
   * Telegram bot instance
   */
  bot: TelegramBot;

  constructor() {
    // replace the value below with the Telegram token you receive from @BotFather
    const token = process.env.TELEGRAM_BOT_KEY;

    // Create a bot that uses 'polling' to fetch new updates
    this.bot = new TelegramBot(token, { polling: true });
  }
}
