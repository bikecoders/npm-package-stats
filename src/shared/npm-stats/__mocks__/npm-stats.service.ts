import npmAPI = require('api-npm');

import { Observable, Subject } from 'rxjs';

import { INMPStats, INMPStatsError } from '../shared/api-npm.model';

export class NpmStatsService {

  public subject = new Subject<any>();

  public slugToValidate: string;
  public slugToGetStats: string;

  // ---------- getStatsForYesterday ----------------
  getStatsForYesterday(slug: string): Observable<INMPStats | INMPStatsError> {
    this.slugToGetStats = slug;
    return this.subject.asObservable();
  }

  getStatsForYesterdaySuccess() {
    this.subject.next({
      downloads: 1234,
      start: '1991-08-08',
      end: '1991-08-09',
      package: this.slugToGetStats,
    } as INMPStats);

    this.subject.complete();
  }

  getStatsForYesterdayError() {
    this.subject.error({
      error: 'some random error',
    } as INMPStatsError);

    this.subject.complete();
  }
  // ---------- getStatsForYesterday ----------------

  // ---------- validateSlug ----------------
  validateSlug(slug: string): Observable<boolean> {
    this.slugToValidate = slug;
    return this.subject.asObservable();
  }

  validateSlugSuccess() {
    this.subject.next(true);
    this.subject.complete();
  }

  validateSlugFalse() {
    this.subject.next(false);
    this.subject.complete();
  }
  // ---------- validateSlug ----------------

}
