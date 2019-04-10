import { Controller } from '@nestjs/common';

import * as TelegramBot from 'node-telegram-bot-api';

import { NpmStatsService } from '../shared/npm-stats/npm-stats.service';
import { UsersService } from '../users/service/users.service';

import { AddCommand } from './commands/add/add.command';
import { StartCommand } from './commands/start/start.command';

@Controller()
export class TelegramBotController {
  /**
   * Telegram bot instance
   */
  bot: TelegramBot;

  // Commands
  private startCommand: StartCommand;
  private addCommand: AddCommand;

  constructor(
    private userService: UsersService,
    private npmStatsService: NpmStatsService,
    ) {
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
    this.startCommand = new StartCommand(this.bot, this.userService);
    this.addCommand = new AddCommand(this.bot, this.npmStatsService, this.userService);
  }
}
