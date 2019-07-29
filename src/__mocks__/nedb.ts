import { Subject } from 'rxjs';

class NedbMock {
  databaseOptions: any;

  static instance: NedbMock;

  triggerAction$: Subject<any>;

  persistence: any;

  indexRestrictions;

  autocompactionInterval: number;

  findOneParameter: any;

  findParameter: any;

  updateParameter: any;

  constructor(dbOptions) {
    this.databaseOptions = dbOptions;

    this.persistence = {
      setAutocompactionInterval: (interval: number) => {
        this.autocompactionInterval = interval;
      },
    };

    NedbMock.instance = this;
  }

  ensureIndex(options) {
    this.indexRestrictions = options;
  }

  insert<T>(document: T, callback: (err: any, res: T) => void) {
    const newDoc = {
      ...document,
      _id: new Date().getTime(),
    };

    callback(null, newDoc);
  }

  findOne<T>(query: any, callback: (err: any, res: T) => void) {
    this.findOneParameter = query;
    this.triggerAction$ = new Subject();

    this.triggerAction$.subscribe((res) => {
      callback(null, res);
    });
  }

  find<T>(query: any, callback: (err: any, res: T) => void) {
    this.findParameter = query;
    this.triggerAction$ = new Subject();

    this.triggerAction$.subscribe((res) => {
      callback(null, res);
    });
  }

  update(query: any, update: any, options: any, callback: (err: any, numberOfUpdated: number, upsert: boolean) => void) {
    this.updateParameter = {
      options,
      query,
      update,
    };
    this.triggerAction$ = new Subject();

    this.triggerAction$.subscribe((res) => {
      callback(null, 1, false);
    });
  }

  triggerAction(document: any) {
    this.triggerAction$.next(document);
    this.triggerAction$.complete();
  }
}

export = NedbMock;
