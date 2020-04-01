import { Observable, Subject } from 'rxjs';

import { INMPStats, INMPStatsError } from '../shared/api-npm.model';

export class NpmStatsService {
  public requests: {
    sub: Subject<any>;
    slug: string;
  }[] = [];

  public slugToGetStats: string[] = [];

  public infoSent: (INMPStats | INMPStatsError)[] = [];

  // ---------- getStatsForYesterday ----------------
  getStatsForYesterday(slug: string): Observable<INMPStats | INMPStatsError> {
    const sub = new Subject<any>();

    this.requests.push({ sub, slug });
    this.slugToGetStats.push(slug);

    return sub.asObservable();
  }

  getStatsForYesterdaySuccess() {
    this.requests.forEach(data => {
      const info = {
        downloads: 1234,
        start: '1991-08-08',
        end: '1991-08-09',
        package: data.slug,
      } as INMPStats;

      this.infoSent.push(info);
      data.sub.next(info);

      data.sub.complete();
    });
  }

  getStatsForYesterdayError() {
    this.requests.forEach(data => {
      const info = {
        error: 'some random error',
      } as INMPStatsError;

      this.infoSent.push(info);
      data.sub.error(info);

      data.sub.complete();
    });
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
