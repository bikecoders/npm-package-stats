import { isArray } from 'util';

type IDBResponse<T> = [null, ...T[]];

export function handleDBError<T>(dbResp: IDBResponse<T> | Error): T[] {
  if (isArray(dbResp)) {
    const [_, ...rest] = dbResp;

    return rest;
  } else {
    throw dbResp;
  }
}
