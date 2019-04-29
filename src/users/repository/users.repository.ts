import { Injectable } from '@nestjs/common';

import * as Datastore from 'nedb-promises';

import { from, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { User, IPackage } from '../shared/models';

import path = require('path');
import { plainToClass } from 'class-transformer';

@Injectable()
export class UsersRepository {

  // Every 24h
  static readonly AUTOCOMPATION_INTERVAL = 1000 * 60 * 60 * 24;

  private db: Datastore;

  constructor() {
    const databaseOptions = {
      filename: path.resolve(process.env.DATABASE_PATH + 'users.db'),
      autoload: true,
    };

    this.db = Datastore.create(databaseOptions);
    this.db.ensureIndex({ fieldName: 'chatId', unique: true });

    this.db.persistence.setAutocompactionInterval(UsersRepository.AUTOCOMPATION_INTERVAL);
  }

  create(user: User): Observable<User> {
    const insertPromise: Promise<User> = this.db.insert(user.toJson());

    return from(insertPromise).pipe(
      catchError<User, Observable<User>>((err) => {
        if (err.errorType === 'uniqueViolated') {
          return of(user);
        }

        return throwError(err);
      }),
    );
  }

  /**
   * Given a chat ID get the user in the DB
   *
   * @param chatId The chat id of the user that you want to get
   */
  getUser(chatId: number): Observable<User> {
    const query = { chatId } as User;

    const queryPromise = this.db.findOne(query);

    return from(queryPromise).pipe(
      map((user: User) => plainToClass(User, user)),
    );
  }

  /**
   * Add a package to the given user
   *
   * @param user The user that adds the package
   * @param pack The package to add
   */
  addPackage(user: User, pack: IPackage): Observable<any> {
    const query = { chatId: user.chatId } as User;
    const update = {
      $set: { [`packages.${pack.npmSlug}`]: pack },
    };

    const updatePromise: Promise<any> = this.db.update(query, update);

    return from(updatePromise);
  }
}
