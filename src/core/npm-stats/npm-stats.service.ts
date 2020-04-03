import { Injectable } from '@nestjs/common';

import { Observable, of, bindCallback, throwError } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';

import npmAPI = require('api-npm');
import {
  INMPStats,
  INMPStatsError,
  instanceOfNMPStats,
} from './shared/api-npm.model';
import { bindCallback3A1R } from 'src/common/utils';

@Injectable()
export class NpmStatsService {
  validateSlug(slug: string): Observable<boolean> {
    return this.getStatsForYesterday(slug).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  getStatsForYesterday(slug: string): Observable<INMPStats> {
    const getStats = (bindCallback<
      string,
      string,
      string,
      INMPStats | INMPStatsError
    >(npmAPI.getstat.bind(npmAPI)) as unknown) as bindCallback3A1R<
      string,
      string,
      string,
      INMPStats | INMPStatsError
    >;

    return getStats(
      slug,
      this.getDateOfXPassedDays(1),
      this.getDateOfXPassedDays(0),
    ).pipe(
      mergeMap(resp => {
        if (instanceOfNMPStats(resp)) {
          return of(resp);
        } else {
          return throwError(resp.error);
        }
      }),
    );
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
