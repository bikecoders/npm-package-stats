import { Test, TestingModule } from '@nestjs/testing';

import { of } from 'rxjs';

import { User, IPackage } from '../shared/models';

import { UsersRepository } from '../repository/users.repository';
jest.mock('../repository/users.repository');
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: UsersRepository;

  let userFound: User;
  let pack: IPackage;

  beforeEach(() => {
    userFound = new User(1234);
    pack = { npmSlug: 'angular' };

    userFound.addPackage(pack);
  });

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    ((UsersRepository as unknown) as jest.SpyInstance).mockClear();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, UsersRepository],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create User', () => {
    it('should create an user', () => {
      const userToCreate: User = new User(12345);

      service.create(userToCreate);

      expect(userRepo.create).toHaveBeenCalledWith(userToCreate);
    });
  });

  describe('Add Package', () => {
    // Spies
    let getUserSpy: jasmine.Spy;
    let hasPackageSpy: jasmine.Spy;

    const addPackage = (chatId: number, packageSlug: string) => {
      service.addPackage(chatId, packageSlug).subscribe();
    };

    beforeEach(() => {
      // Spies
      getUserSpy = spyOn(service, 'getUser').and.returnValue(of(userFound));

      hasPackageSpy = spyOn(userFound, 'hasPackage').and.callThrough();
    });

    it('should get the user to add a package', () => {
      addPackage(userFound.chatId, pack.npmSlug);

      expect(getUserSpy).toHaveBeenCalledWith(userFound.chatId);
    });

    it('should check if the user already has that package', () => {
      addPackage(userFound.chatId, pack.npmSlug);

      expect(hasPackageSpy).toHaveBeenLastCalledWith(pack.npmSlug);
    });

    it('should return the same user and do nothing if the package is already added', () => {
      const addPackageSpy = spyOn(userRepo, 'addPackage');

      addPackage(userFound.chatId, pack.npmSlug);

      expect(addPackageSpy).not.toHaveBeenCalled();
    });

    describe('Add package', () => {
      let newPackage: IPackage;
      let addPackageSpy: jasmine.Spy;

      beforeEach(() => {
        newPackage = { npmSlug: 'nest' };
        addPackageSpy = spyOn(userRepo, 'addPackage').and.returnValue(of({}));
      });

      it('should add the package to the data base', () => {
        addPackage(userFound.chatId, newPackage.npmSlug);

        expect(addPackageSpy).toHaveBeenCalledWith(userFound, newPackage);
      });

      it('should have add the package to the user', () => {
        expect(userFound.hasPackage(newPackage.npmSlug)).toBeFalsy();

        addPackage(userFound.chatId, newPackage.npmSlug);

        expect(userFound.hasPackage(newPackage.npmSlug)).toBeTruthy();
      });
    });
  });

  describe('Get User', () => {
    let chatId: number;

    beforeEach(() => {
      chatId = 1234;

      // Spies
      spyOn(userRepo, 'getUser').and.returnValue(of(userFound));
    });

    it('should get the user using the repository', () => {
      service.getUser(chatId);

      expect(userRepo.getUser).toHaveBeenCalledWith(chatId);
    });

    it('should return the user gotten', () => {
      let userGotten: User;

      service.getUser(chatId).subscribe(uFound => (userGotten = uFound));

      expect(userFound).toEqual(userGotten);
    });
  });

  describe('Get All Users', () => {
    let randomUsers: User[];
    const nUsers = 4;

    beforeEach(() => {
      randomUsers = [];

      for (let index = 0; index < nUsers; index++) {
        const newUser = new User(index);
        randomUsers.push(newUser);
      }

      // Spies
      spyOn(userRepo, 'getAllUsers').and.returnValue(of(randomUsers));
    });

    it('should get the users using the repository', () => {
      service.getAllUsers();

      expect(userRepo.getAllUsers).toHaveBeenCalled();
    });

    it('should return the user gotten', () => {
      let usersFound: User[];

      service.getAllUsers().subscribe(uFound => (usersFound = uFound));

      expect(usersFound).toEqual(randomUsers);
    });
  });
});
