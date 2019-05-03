import { Test, TestingModule } from '@nestjs/testing';

import * as TelegramBot from 'node-telegram-bot-api';

import { NEVER, of } from 'rxjs';

import { sendMessageHTML } from '../../common';
jest.mock('../../common');

import { StatsFeature } from './stats.feature';
import { UsersService } from '../../../shared/users/service/users.service';
jest.mock('../../../shared/users/service/users.service');
import { User, IPackage } from '../../../shared/users/shared/models';

import { BaseCommand as BaseCommandMock } from '../__mocks__/base.command';
import { BaseCommand } from '../base.command';
jest.mock('../base.command');

import { BotService } from '../../shared/bot/bot.service';
jest.mock('../../shared/bot/bot.service');
import { NpmStatsService } from '../../../shared/npm-stats/npm-stats.service';
jest.mock('../../../shared/npm-stats/npm-stats.service');
import { NpmStatsService as NpmStatsServiceMock } from '../../../shared/npm-stats/__mocks__/npm-stats.service';

import * as Messages from './common/messages.template';
jest.mock('./common/messages.template');
import { INMPStats } from '../../../shared/npm-stats/shared/api-npm.model';

describe('Start', () => {
  let feature: StatsFeature;

  let botService: BotService;
  let npmStatsService: NpmStatsService;
  let usersService: UsersService;
  // Telegram bot instance
  let bot;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    (sendMessageHTML as unknown as jest.SpyInstance).mockClear();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsFeature,

        BotService,
        NpmStatsService,
        UsersService,
      ],
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
    });

    it('should indicate the disclaimer before sent anything', () => {
      // Do not trigger anything
      spyOn(usersService, 'getUser').and.returnValue(NEVER);

      (feature as unknown as BaseCommandMock).triggerCommand(messageReceived);

      expect(sendMessageHTML).toHaveBeenCalledWith(
        bot,
        messageReceived.chat.id, Messages.disclaimer,
      );
    });

    describe('Send Stats', () => {
      let userFound: User;
      let pack1: IPackage;
      let pack2: IPackage;

      // spies
      let getStatsForYesterdaySpy: jasmine.Spy;

      beforeEach(() => {
        pack1 = { npmSlug: 'angular' } as IPackage;
        pack2 = { npmSlug: 'ngx-input-search' } as IPackage;

        userFound = new User(chatId);
        userFound.addPackage(pack1);
        userFound.addPackage(pack2);

        spyOn(usersService, 'getUser').and.returnValue(of(userFound));
        getStatsForYesterdaySpy = spyOn(npmStatsService, 'getStatsForYesterday').and.callThrough();

        (feature as unknown as BaseCommandMock).triggerCommand(messageReceived);
      });

      it('should get the stats for every package', () => {
        expect(getStatsForYesterdaySpy).toHaveBeenCalledTimes(2);
        expect(getStatsForYesterdaySpy).toHaveBeenCalledWith(pack1.npmSlug);
        expect(getStatsForYesterdaySpy).toHaveBeenCalledWith(pack2.npmSlug);
      });

      it('should send the stats for every package registered', () => {
        (npmStatsService as unknown as NpmStatsServiceMock).getStatsForYesterdaySuccess();

        // Should count 1 because the disclaimer message we sent
        expect(sendMessageHTML).toHaveBeenCalledTimes(userFound.nPackages + 1);
        expect(sendMessageHTML).toHaveBeenCalledWith(
          bot,
          messageReceived.chat.id,
          jasmine.any(String),
        );
      });

      it('should send the right message', () => {
        (npmStatsService as unknown as NpmStatsServiceMock).getStatsForYesterdaySuccess();

        const infoSent = (npmStatsService as unknown as NpmStatsServiceMock).infoSent;

        infoSent.forEach(({ downloads, end, start }: INMPStats) => {
          expect(Messages.stat).toHaveBeenLastCalledWith({
            downloads,
            end,
            package: jasmine.any(String),
            start,
          });
        });
      });
    });
  });
});
