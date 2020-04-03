import { Observable } from 'rxjs';

export type bindCallback1A2R<A1, R1, R2> = (
  a1: A1,
) => Observable<[null, R2] | R1>;

export type bindCallback3A3R<A1, A2, A3, R1, R2, R3> = (
  a1: A1,
  a2: A2,
  a3: A3,
) => Observable<[null, R2, R3] | R1>;

export type bindCallback3A1R<A1, A2, A3, R1> = (
  a1: A1,
  a2: A2,
  a3: A3,
) => Observable<R1>;
