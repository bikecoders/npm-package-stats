import { Injectable } from '@nestjs/common';

import { Observable, Subject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import npmAPI = require('api-npm');
import { INMPStats, INMPStatsError } from './shared/api-npm.model';

@Injectable()
export class NpmStatsService {

  validateSlug(slug: string): Observable<boolean> {
    return this.getStatsForYesterday(slug).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  getStatsForYesterday(slug: string): Observable<INMPStats> {
    const subject = new Subject<INMPStats>();

    const callback = (data: INMPStats | INMPStatsError) => {
      // If there is an error
      if (!!(data as INMPStatsError).error) {
        subject.error(data);
      } else {
        subject.next(data as INMPStats);
      }

      subject.complete();
    };

    npmAPI.getstat(slug, this.getDateOfXPassedDays(2), this.getDateOfXPassedDays(1), callback);

    return subject.asObservable();
  }

  /**
   * To the actual date subtract the days specified.
   *
   * @return the format would be 'YYYY-MM-DD'
   *
   * @param days how many days passed
   */
  private getDateOfXPassedDays(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
}
