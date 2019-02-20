import { Injectable } from '@nestjs/common';

import { of } from 'rxjs';

import { User } from '../models/user.interface';

@Injectable()
export class UsersRepository {
  create(user: User) {
    return of('Ok');
  }
}
