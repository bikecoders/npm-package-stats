import { Observable } from 'rxjs';

export const buildNPMLink = (slug: string) =>
  `https://www.npmjs.com/package/${slug}`;

export type bindCallback_1A_2R<A1, R1, R2> = (a1: A1) => Observable<[R1, R2]>;
export type bindCallback_3A_3R<A1, A2, A3, R1, R2, R3> = (a1: A1, a2: A2, a3: A3) => Observable<[R1, R2, R3]>;

interface IDBResponse extends Array<any> {
  [index: number]: any;
  0: Error;
}

export function handleDBError([err, ...rest]: IDBResponse): any[] {
  if (!!err) {
    throw err;
  }

  return rest;
}
