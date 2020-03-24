import { Injectable } from '@nestjs/common';

import { Subject, Observable } from 'rxjs';

import * as cron from 'node-cron';

@Injectable()
export class CronService {
  // UTC 2pm hour
  public readonly cronExpression = '0 0 14 * * *';

  get cronAnnouncer(): Observable<void> {
    return this.cronAnnouncer$.asObservable();
  }

  private cronAnnouncer$: Subject<void>;

  private cron: cron.ScheduledTask;

  constructor() {
    this.cronAnnouncer$ = new Subject();

    this.cron = cron.schedule(this.cronExpression, () =>
      this.cronAnnouncer$.next(),
    );
    this.cron.start();
  }
}
