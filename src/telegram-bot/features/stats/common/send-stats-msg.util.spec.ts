import { TestingModule, Test } from '@nestjs/testing';

import * as TelegramBot from 'node-telegram-bot-api';

import { Template } from '.';
jest.mock('../common');
import { sendMessageHTML } from '../../../common';
jest.mock('../../../../telegram-bot/common');
import { User } from '@core/users/shared/models';

import { INMPStats } from '@core/npm-stats/shared/api-npm.model';
import { NpmStatsService } from '@core/npm-stats/npm-stats.service';
jest.mock('@core/npm-stats/npm-stats.service');
import { NpmStatsService as NpmStatsServiceMock } from '@core/npm-stats/__mocks__/npm-stats.service';

import { UsersService } from '@core/users/service/users.service';
jest.mock('@core/users/service/users.service');

import { sendStatsMsg } from './send-stats-msg.util';
import { plainToClass } from 'class-transformer';
import { of } from 'rxjs';

describe('Send Message', () => {
  let npmStatsService: NpmStatsService;
  let usersService: UsersService;

  let bot: TelegramBot;

  let user: User;
  let chatId: number;

  let getStatsForYesterdaySpy: jasmine.Spy;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    ((UsersService as unknown) as jest.SpyInstance).mockClear();
    ((sendMessageHTML as unknown) as jest.SpyInstance).mockClear();
  });

  beforeEach(() => {
    chatId = 123456;

    const plainUser = {
      chatId,
      packages: {
        angular: { npmSlug: 'angular' },
        'ngx-sticky-directive': { npmSlug: 'ngx-sticky-directive' },
      },
    };
    user = plainToClass(User, plainUser);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NpmStatsService, UsersService],
    }).compile();

    npmStatsService = module.get<NpmStatsService>(NpmStatsService);
    usersService = module.get<UsersService>(UsersService);

    bot = new TelegramBot('randomToken');

    getStatsForYesterdaySpy = spyOn(
      npmStatsService,
      'getStatsForYesterday',
    ).and.callThrough();
  });

  describe('Stats Sending', () => {
    beforeEach(() => {
      sendStatsMsg(bot, user, npmStatsService);
    });

    it('should send the disclaimer', () => {
      expect(sendMessageHTML).toHaveBeenCalledWith(
        bot,
        user.chatId,
        Template.disclaimer,
      );
    });

    describe('Get Stats', () => {
      it('should get the stats for every package', () => {
        expect(getStatsForYesterdaySpy).toHaveBeenCalledTimes(user.nPackages);
      });
    });

    describe('Send Message', () => {
      beforeEach(() => {
        ((npmStatsService as unknown) as NpmStatsServiceMock).getStatsForYesterdaySuccess();
      });

      it('should send the message for every package', () => {
        expect(sendMessageHTML).toHaveBeenCalledTimes(user.nPackages + 1);
      });

      it('should send the message', () => {
        expect(sendMessageHTML).toHaveBeenCalledWith(
          bot,
          user.chatId,
          jasmine.any(String),
        );
      });

      it('should send the right message', () => {
        ((npmStatsService as unknown) as NpmStatsServiceMock).getStatsForYesterdaySuccess();

        const infoSent = ((npmStatsService as unknown) as NpmStatsServiceMock)
          .infoSent;

        infoSent.forEach(({ downloads, end, start }: INMPStats) => {
          expect(Template.stat).toHaveBeenLastCalledWith({
            downloads,
            end,
            package: jasmine.any(String),
            start,
          });
        });
      });
    });
  });

  describe('Passing Chat ID', () => {
    let getUserSpy: jasmine.Spy;

    beforeEach(() => {
      getUserSpy = spyOn(usersService, 'getUser').and.returnValue(of(user));
      sendStatsMsg(bot, chatId, npmStatsService, usersService);
    });

    it('should get the user', () => {
      expect(getUserSpy).toHaveBeenCalledWith(chatId);
    });
  });
});
