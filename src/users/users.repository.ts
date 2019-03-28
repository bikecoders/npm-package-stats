import { Injectable } from '@nestjs/common';

import * as Datastore from 'nedb-promises';

import { from, Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { User } from '../models/user.interface';

import path = require('path');

@Injectable()
export class UsersRepository {

  private db: Datastore;

  constructor() {
    // TODO: environment to manage db base filepath
    const databaseOptions = {
      filename: path.resolve(__dirname + '../../../database/users.db'),
      autoload: true,
    };

    this.db = Datastore.create(databaseOptions);
    this.db.ensureIndex({ fieldName: 'chatId', unique: true });
  }

  create(user: User): Observable<User> {
    return from(this.db.insert(user)).pipe(
      catchError<User, User>((err) => {
        if (err.errorType === 'uniqueViolated') {
          return of(user);
        }

        return throwError(err);
      }),
    );
  }
}
