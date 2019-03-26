import { Test, TestingModule } from '@nestjs/testing';

import { User } from '../models/user.interface';

import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

jest.mock('./users.repository');

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        UsersRepository,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create User', () => {
    it('should create an user', () => {
      const userToCreate: User = {
        chatId: '12345',
      };

      service.create(userToCreate);

      expect(userRepo.create).toHaveBeenCalledWith(userToCreate);
    });
  });
});
