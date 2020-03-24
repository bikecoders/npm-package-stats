import { Test, TestingModule } from '@nestjs/testing';
import { CronService } from './cron.service';

import cronMock = require('../../../../__mocks__/node-cron');

describe('CronService', () => {
  let service: CronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CronService],
    }).compile();

    service = module.get<CronService>(CronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Init', () => {
    it('should create the schedule', () => {
      expect(cronMock.cronExpression).toEqual(service.cronExpression);
    });

    it('should init the cron', () => {
      expect(cronMock.scheduleReturned.start).toHaveBeenCalled();
    });
  });

  describe('Cron execution', () => {
    let executed: boolean;

    beforeEach(() => {
      executed = false;

      service.cronAnnouncer.subscribe(() => (executed = true));
    });

    it('should emit next when the cron executed', () => {
      cronMock.triggerCallback();

      expect(executed).toBeTruthy();
    });
  });
});
