import { Injectable } from '@nestjs/common';

// This is the module in __mocks__ at /src
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class BotService {
  bot: TelegramBot;

  readonly randomToken = 'random';

  constructor() {
    // Create a bot that uses 'polling' to fetch new updates
    this.bot = new TelegramBot(this.randomToken, { polling: true });
  }
}
