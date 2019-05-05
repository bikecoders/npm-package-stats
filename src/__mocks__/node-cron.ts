interface ISchedule {
  start: () => void;
}

class CronMock {
  cronExpression: string;
  callback: () => void;

  scheduleReturned: ISchedule = {
    start: jest.fn(),
  };

  schedule(cronExpression: string, callback: () => void): ISchedule {
    this.cronExpression = cronExpression;
    this.callback = callback;

    return this.scheduleReturned;
  }

  triggerCallback() {
    this.callback.call(null);
  }
}

export = new CronMock();
