export class DataBase {
  indexRestrictions;

  ensureIndex(options) {
    this.indexRestrictions = options;
  }

  async insert(document) {
    return {
      ...document,
      _id: new Date().getTime(),
    };
  }
}

export let databaseOptions;
export let dbCreated: DataBase;

export function create(options) {
  this.databaseOptions = options;
  return this.dbCreated = new DataBase();
}
