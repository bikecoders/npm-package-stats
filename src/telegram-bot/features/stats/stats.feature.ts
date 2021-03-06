import { Injectable } from '@nestjs/common';

import * as TelegramBot from 'node-telegram-bot-api';

import { BaseCommand } from '../base.command';

import { BotService } from '../../core/bot/bot.service';

import { NpmStatsService } from '../../../core/npm-stats/npm-stats.service';
import { UsersService } from '../../../core/users/service/users.service';

import { sendStatsMsg } from './common';

@Injectable()
export class StatsFeature extends BaseCommand {
  public static readonly COMMAND = /\/stats/;

  constructor(
    botService: BotService,
    private npmStatsService: NpmStatsService,
    private userService: UsersService,
  ) {
    super(botService.bot, StatsFeature.COMMAND);
  }

  protected commandFunction(msg: TelegramBot.Message) {
    const chatId = msg.chat.id;

    sendStatsMsg(this.bot, chatId, this.npmStatsService, this.userService);
  }
}
