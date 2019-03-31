import { Subject } from 'rxjs';

export class DataBase {
  persistence: any;

  indexRestrictions;

  autocompactionInterval: number;

  triggerAction$: Subject<any>;

  findOneParameter: any;

  updateParameter: any;

  constructor() {
    this.persistence = {
      setAutocompactionInterval: (interval: number) => {
        this.autocompactionInterval = interval;
      },
    };
  }

  ensureIndex(options) {
    this.indexRestrictions = options;
  }

  async insert(document) {
    return {
      ...document,
      _id: new Date().getTime(),
    };
  }

  findOne(query) {
    this.findOneParameter = query;
    this.triggerAction$ = new Subject();

    return this.triggerAction$.toPromise();
  }

  update(query: any, update: any, options: any) {
    this.updateParameter = {
      options,
      query,
      update,
    };
    this.triggerAction$ = new Subject();

    return this.triggerAction$.toPromise();
  }

  triggerAction(document: any) {
    this.triggerAction$.next(document);
    this.triggerAction$.complete();
  }
}

export let databaseOptions;
export let dbCreated: DataBase;

export function create(options) {
  databaseOptions = options;
  return dbCreated = new DataBase();
}
