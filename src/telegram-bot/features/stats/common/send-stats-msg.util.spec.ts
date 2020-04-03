import { TestingModule, Test } from '@nestjs/testing';

import * as TelegramBot from 'node-telegram-bot-api';

import { Template } from '.';
jest.mock('../common');
import { sendMessage } from '../../../common';
jest.mock('../../../../telegram-bot/common');
import { User } from '../../../../core/users/shared/models';

import { NpmStatsService } from '../../../../core/npm-stats/npm-stats.service';
jest.mock('../../../../core/npm-stats/npm-stats.service');
import { NpmStatsService as NpmStatsServiceMock } from '../../../../core/npm-stats/__mocks__/npm-stats.service';

import { UsersService } from '../../../../core/users/service/users.service';
jest.mock('../../../../core/users/service/users.service');

import { sendStatsMsg } from './send-stats-msg.util';
import { of } from 'rxjs';
import { generateUserWithNPackage } from '../../../../__mocks__/data';

describe('Send Message', () => {
  let npmStatsService: NpmStatsService;
  let usersService: UsersService;

  let bot: TelegramBot;
  let user: User;
  let getStatsForYesterdaySpy: jasmine.Spy;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    user = generateUserWithNPackage(4);
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
      expect(sendMessage).toHaveBeenCalledWith(
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
        expect(sendMessage).toHaveBeenCalledTimes(user.nPackages + 1);
      });

      it('should send the message', () => {
        expect(sendMessage).toHaveBeenCalledWith(
          bot,
          user.chatId,
          jasmine.any(String),
        );
      });
    });
  });

  describe('Passing Chat ID', () => {
    let getUserSpy: jasmine.Spy;

    beforeEach(() => {
      getUserSpy = spyOn(usersService, 'getUser').and.returnValue(of(user));
      sendStatsMsg(bot, user.chatId, npmStatsService, usersService);
    });

    it('should get the user', () => {
      expect(getUserSpy).toHaveBeenCalledWith(user.chatId);
    });
  });
});
