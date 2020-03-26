import { Injectable } from '@nestjs/common';

import { switchMap, map, tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

import { User, IPackage } from '../shared/models';
import { UsersRepository } from '../repository/users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  create(user: User): Observable<User> {
    return this.usersRepository.create(user);
  }

  /**
   * Add a package. We validate first if the package is not already
   * added
   *
   * @param chatId The chat ID that is making the request
   * @param slug THe slug of the npm package
   */
  addPackage(chatId: number, slug: string): Observable<User> {
    return this.getUser(chatId).pipe(
      switchMap(user => {
        if (!user.hasPackage(slug)) {
          const pack: IPackage = {
            npmSlug: slug,
          };

          return this.usersRepository.addPackage(user, pack).pipe(
            tap(() => user.addPackage(pack)),
            map(() => user),
          );
        } else {
          return of(user);
        }
      }),
    );
  }

  getUser(chatId: number): Observable<User> {
    return this.usersRepository.getUser(chatId);
  }

  getAllUsers(): Observable<User[]> {
    return this.usersRepository.getAllUsers();
  }
}
