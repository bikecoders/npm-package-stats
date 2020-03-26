import { Test, TestingModule } from '@nestjs/testing';

import { BotService } from '../../../../core/bot/bot.service';
jest.mock('../../../../core/bot/bot.service');

import { SendStatsService } from './send-stats.service';
import { CronService } from '../cron.service';
jest.mock('../cron.service');
import { CronService as CronServiceMock } from '../__mocks__/cron.service';

import { Template, sendStatsMsg } from '../../common';
jest.mock('../../common');

import { UsersService } from '@core/users/service/users.service';
jest.mock('@core/users/service/users.service');
import { NpmStatsService } from '@core/npm-stats/__mocks__/npm-stats.service';
import { Subject, of } from 'rxjs';
import { User } from '@core/users/shared/models';
jest.mock('@core/npm-stats/__mocks__/npm-stats.service');

describe('SendStatsService', () => {
  let service: SendStatsService;

  let botService: BotService;
  let cronService: CronService;
  let npmStatsService: NpmStatsService;
  let usersService: UsersService;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    ((Template.stat as unknown) as jest.SpyInstance).mockClear();
    ((UsersService as unknown) as jest.SpyInstance).mockClear();
    ((sendStatsMsg as unknown) as jest.SpyInstance).mockClear();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendStatsService,

        BotService,
        CronService,
        NpmStatsService,
        UsersService,
      ],
    }).compile();

    service = module.get<SendStatsService>(SendStatsService);

    botService = module.get<BotService>(BotService);
    cronService = module.get<CronService>(CronService);
    npmStatsService = module.get<NpmStatsService>(NpmStatsService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Init', () => {
    it('should subscribe to the cron announcer', () => {
      const cronSub = ((cronService as unknown) as CronServiceMock)
        .cronAnnouncer.source as Subject<void>;

      expect(cronSub.observers.length).toEqual(1);
    });
  });

  describe('On Cron execution', () => {
    let usersFound: User[];

    beforeEach(() => {
      usersFound = [new User(1), new User(2)];

      spyOn(usersService, 'getAllUsers').and.returnValue(of(usersFound));

      ((cronService as unknown) as CronServiceMock).triggerCallback();
    });

    it('should send messages', () => {
      expect(sendStatsMsg).toHaveBeenCalledWith(
        botService.bot,
        jasmine.any(User),
        npmStatsService,
      );
    });

    it('should call send stats as many users was found', () => {
      expect(sendStatsMsg).toHaveBeenCalledTimes(usersFound.length);
    });
  });
});
