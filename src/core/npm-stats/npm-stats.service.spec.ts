import { Test, TestingModule } from '@nestjs/testing';
import { NpmStatsService } from './npm-stats.service';

import npmAPI = require('api-npm');
import { INMPStats, INMPStatsError } from './shared/api-npm.model';

describe('NpmStatsService', () => {
  let service: NpmStatsService;

  let randomSlug: string;

  beforeEach(() => {
    randomSlug = 'ngx-sticky-directive';
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
      const getDateOfXPassedDays = (days: number): string => {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      };

      beforeEach(() => {
        service.validateSlug(randomSlug);
      });

      it("should call 'getstats' with the right slug", () => {
        expect(npmAPI.slug).toEqual(randomSlug);
      });

      it("should call 'getstats' with the right start and end date", () => {
        expect(npmAPI.from).toEqual(getDateOfXPassedDays(1));
        expect(npmAPI.to).toEqual(getDateOfXPassedDays(0));
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

        expect(npmAPI.errorData).toEqual(errorThrown);
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
