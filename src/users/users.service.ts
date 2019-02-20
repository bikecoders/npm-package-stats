import { Injectable } from '@nestjs/common';
import { User } from '../models/user.interface';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {

  constructor(private usersRepository: UsersRepository) { }

  create(user: User) {
    return this.usersRepository.create(user);
  }
}
