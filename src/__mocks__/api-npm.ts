import { INMPStats, INMPStatsError } from '../shared/npm-stats/shared/api-npm.model';

type getStatCallback = (data: INMPStats | INMPStatsError) => void;

class APINode {
  slug: string;
  from: string;
  to: string;
  callback: getStatCallback;

  successData: INMPStats;

  errorData: INMPStatsError = {
    error: 'a wild error appear',
  };

  getstat(slug: string, from: string, to: string, callback: getStatCallback) {
    this.slug = slug;
    this.from = from;
    this.to = to;
    this.callback = callback;

    this.successData = {
      downloads: 1234,
      start: this.from,
      end: this.to,
      package: this.slug,
    };
  }

  executeSuccessCallback() {
    this.callback(this.successData);
  }

  executeErrorCallback() {
    this.callback(this.errorData);
  }
}

export = new APINode();
