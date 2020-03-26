import { Module } from '@nestjs/common';

import { UsersService } from './service/users.service';
import { UsersRepository } from './repository/users.repository';

@Module({
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
