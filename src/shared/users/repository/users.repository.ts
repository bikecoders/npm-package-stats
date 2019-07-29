import { Injectable } from '@nestjs/common';

import Datastore = require('nedb');

import { bindCallback_1A_2R, handleDBError, bindCallback_3A_3R } from '../../../common/utils';

import { Observable, bindCallback, of, throwError } from 'rxjs';
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
    const databaseOptions: Datastore.DataStoreOptions = {
      filename: path.resolve(process.env.DATABASE_PATH + 'users.db'),
      autoload: true,
    };

    this.db = new Datastore(databaseOptions);
    this.db.ensureIndex({ fieldName: 'chatId', unique: true });

    this.db.persistence.setAutocompactionInterval(
      UsersRepository.AUTOCOMPATION_INTERVAL,
    );
  }

  create(user: User): Observable<any> {
    const insert = (bindCallback<any, Error, User>(
      this.db.insert.bind(this.db),
    ) as unknown) as bindCallback_1A_2R<any, Error, User>;

    return insert(user.toJson()).pipe(
      map(handleDBError),
      map((rest) => rest[0]),
      catchError<User, Observable<User>>(err => {
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

    const findOne = (bindCallback<any, Error, User>(
      this.db.findOne.bind(this.db),
    ) as unknown) as bindCallback_1A_2R<any, Error, User>;

    return findOne(query).pipe(
      map(handleDBError),
      map((rest) => rest[0]),
      map((user: User) => plainToClass(User, user)),
    );
  }

  getAllUsers(): Observable<User[]> {
    const findAll = (bindCallback<any, Error, User[]>(
      this.db.find.bind(this.db),
    ) as unknown) as bindCallback_1A_2R<any, Error, User[]>;

    return findAll({}).pipe(
      map(handleDBError),
      map((rest) => rest[0]),
      map((users: User[]) => plainToClass(User, users)),
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
    const updateCondition = {
      $set: { [`packages.${pack.npmSlug}`]: pack },
    };

    const update = (bindCallback<any, any, Nedb.UpdateOptions, Error, number, boolean>(
      this.db.update.bind(this.db),
    ) as unknown) as bindCallback_3A_3R<any, any, Nedb.UpdateOptions, Error, number, boolean>;

    return update(query, updateCondition, {}).pipe(
      map(handleDBError),
    );
  }
}
