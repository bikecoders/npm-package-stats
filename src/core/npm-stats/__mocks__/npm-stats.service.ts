import { Subject } from 'rxjs';

import { INMPStats, INMPStatsError } from '../shared/api-npm.model';
import { map } from 'rxjs/operators';

export class NpmStatsService {
  // ---------- getStatsForYesterday ----------------
  private getStatsForYesterdayTrigger = new Subject<INMPStats>();

  public getStatsForYesterday = jest.fn().mockImplementation((slug: string) => {
    return this.getStatsForYesterdayTrigger.asObservable().pipe(
      map(() => {
        const info = {
          downloads: 1234,
          start: '1991-08-08',
          end: '1991-08-09',
          package: slug,
        } as INMPStats;

        return info;
      }),
    );
  });

  getStatsForYesterdaySuccess() {
    this.getStatsForYesterdayTrigger.next();
  }

  getStatsForYesterdayError() {
    const info = {
      error: 'some random error',
    } as INMPStatsError;

    this.getStatsForYesterdayTrigger.error(info);
  }
  // ---------- getStatsForYesterday ----------------

  // ---------- validateSlug ----------------
  private validateSlugTrigger = new Subject<boolean>();

  public validateSlug = jest.fn().mockImplementation(() => {
    return this.validateSlugTrigger.asObservable();
  });

  validateSlugSuccess() {
    this.validateSlugTrigger.next(true);
  }

  validateSlugFalse() {
    this.validateSlugTrigger.next(false);
  }
  // ---------- validateSlug ----------------
}
