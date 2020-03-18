import { Observable } from 'rxjs';
import { isArray } from 'util';

export const buildNPMLink = (slug: string) =>
  `https://www.npmjs.com/package/${slug}`;

export type bindCallback_1A_2R<A1, R1, R2> = (
  a1: A1,
) => Observable<[null, R2] | R1>;
export type bindCallback_3A_3R<A1, A2, A3, R1, R2, R3> = (
  a1: A1,
  a2: A2,
  a3: A3,
) => Observable<[null, R2, R3] | R1>;

type IDBResponse<T> = [null, ...T[]];

export function handleDBError<T>(dbResp: IDBResponse<T> | Error): T[] {
  if (isArray(dbResp)) {
    const [_, ...rest] = dbResp;

    return rest;
  } else {
    throw dbResp;
  }
}
