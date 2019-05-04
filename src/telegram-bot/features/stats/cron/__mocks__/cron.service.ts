import { Injectable } from '@nestjs/common';

import { Subject, Observable } from 'rxjs';

import cronMock = require('../../../../../__mocks__/node-cron');

export class CronService {
  public readonly cronExpression = '* * * * * *';

  get cronAnnouncer(): Observable<void> {
    return this.cronAnnouncer$.asObservable();
  }

  public cronAnnouncer$: Subject<void>;

  constructor() {
    this.cronAnnouncer$ = new Subject();
    cronMock.schedule(this.cronExpression, () => this.cronAnnouncer$.next());
  }

  triggerCallback() {
    cronMock.triggerCallback();
  }
}
