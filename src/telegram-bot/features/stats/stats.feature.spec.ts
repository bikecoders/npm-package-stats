import { Test, TestingModule } from '@nestjs/testing';

import * as TelegramBot from 'node-telegram-bot-api';

import { sendMessageHTML } from '../../common';
jest.mock('../../common');

import { StatsFeature } from './stats.feature';
import { UsersService } from '@core/users/service/users.service';
jest.mock('@core/users/service/users.service');

import { BaseCommand as BaseCommandMock } from '../__mocks__/base.command';
jest.mock('../base.command');

import { BotService } from '../../core/bot/bot.service';
jest.mock('../../core/bot/bot.service');
import { NpmStatsService } from '@core/npm-stats/npm-stats.service';
jest.mock('@core/npm-stats/npm-stats.service');

import { sendStatsMsg } from './common';
jest.mock('./common');

describe('Start', () => {
  let feature: StatsFeature;

  let botService: BotService;
  let npmStatsService: NpmStatsService;
  let usersService: UsersService;
  // Telegram bot instance
  let bot;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    ((sendMessageHTML as unknown) as jest.SpyInstance).mockClear();
    ((sendStatsMsg as unknown) as jest.SpyInstance).mockClear();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatsFeature, BotService, NpmStatsService, UsersService],
    }).compile();

    botService = module.get<BotService>(BotService);
    npmStatsService = module.get<NpmStatsService>(NpmStatsService);
    usersService = module.get<UsersService>(UsersService);

    bot = botService.bot;
    feature = module.get<StatsFeature>(StatsFeature);
  });

  it('should be defined', () => {
    expect(feature).toBeDefined();
  });

  describe('Command', () => {
    let messageReceived: TelegramBot.Message;

    let chatId: number;

    beforeEach(() => {
      chatId = 123;

      messageReceived = {
        chat: { id: chatId },
        text: '/stats',
      } as TelegramBot.Message;

      ((feature as unknown) as BaseCommandMock).triggerCommand(messageReceived);
    });

    it('should send the stats', () => {
      expect(sendStatsMsg).toHaveBeenCalledWith(
        bot,
        chatId,
        npmStatsService,
        usersService,
      );
    });
  });
});
