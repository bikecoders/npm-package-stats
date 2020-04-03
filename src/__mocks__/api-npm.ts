import {
  INMPStats,
  INMPStatsError,
} from '../core/npm-stats/shared/api-npm.model';

type getStatCallback = (data: INMPStats | INMPStatsError) => void;

class APINode {
  callback: getStatCallback;

  successData: INMPStats;

  errorData: INMPStatsError = {
    error: 'a wild error appear',
  };

  getstat = jest
    .fn()
    .mockImplementation(
      (slug: string, from: string, to: string, callback: getStatCallback) => {
        this.successData = {
          downloads: 1234,
          start: from,
          end: to,
          package: slug,
        };

        this.callback = callback;
      },
    );

  executeSuccessCallback() {
    this.callback(this.successData);
  }

  executeErrorCallback() {
    this.callback(this.errorData);
  }
}

export = new APINode();
