import { Test, TestingModule } from '@nestjs/testing';
import npmAPI = require('api-npm');
import { advanceTo } from 'jest-date-mock';

import { NpmStatsService } from './npm-stats.service';

import { INMPStats, INMPStatsError } from './shared/api-npm.model';

describe('NpmStatsService', () => {
  let service: NpmStatsService;

  let randomSlug: string;

  beforeEach(() => {
    randomSlug = 'ngx-sticky-directive';

    advanceTo(new Date(2020, 0, 25));
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NpmStatsService],
    }).compile();

    service = module.get<NpmStatsService>(NpmStatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Stats for yesterday', () => {
    describe("'getstats' parameters", () => {
      beforeEach(() => {
        service.getStatsForYesterday(randomSlug).subscribe();
        npmAPI.executeSuccessCallback();
      });

      it("should call 'getstats' with the right slug", () => {
        expect(npmAPI.getstat).toHaveBeenCalledWith(
          randomSlug,
          jasmine.any(String),
          jasmine.any(String),
          jasmine.any(Function),
        );
      });

      it("should call 'getstats' with the right start and end date", () => {
        expect(npmAPI.getstat).toHaveBeenCalledWith(
          jasmine.any(String),
          '2020-1-24',
          '2020-1-25',
          jasmine.any(Function),
        );
      });
    });

    describe('Data Returned', () => {
      it('should get the stats given an slug', () => {
        let dataSent: INMPStats;

        service
          .getStatsForYesterday(randomSlug)
          .subscribe(data => (dataSent = data as INMPStats));

        npmAPI.executeSuccessCallback();

        expect(npmAPI.successData).toEqual(dataSent);
      });

      it('should return an error when the slug is wrong', () => {
        let errorThrown: INMPStatsError;

        service.getStatsForYesterday(randomSlug).subscribe({
          error: error => (errorThrown = error),
        });

        npmAPI.executeErrorCallback();

        expect(npmAPI.errorData.error).toEqual(errorThrown);
      });
    });
  });

  describe('Validate slug', () => {
    let isValid: boolean;

    beforeEach(() => {
      service.validateSlug(randomSlug).subscribe(valid => (isValid = valid));
    });

    it('should return true if the slug is right', () => {
      npmAPI.executeSuccessCallback();

      expect(isValid).toBeTruthy();
    });

    it('should return false if the slug is wrong', () => {
      npmAPI.executeErrorCallback();

      expect(isValid).toBeFalsy();
    });
  });
});
