import { Test, TestingModule } from '@nestjs/testing';

import { of } from 'rxjs';

import { User, IPackage } from '../shared/models';

import { UsersRepository } from '../repository/users.repository';
jest.mock('../repository/users.repository');
import { UsersService } from './users.service';

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
      const userToCreate: User = new User(12345);

      service.create(userToCreate);

      expect(userRepo.create).toHaveBeenCalledWith(userToCreate);
    });
  });

  describe('Add Package', () => {
    let userFound: User;
    let pack: IPackage;

    // Spies
    let getUserSpy: jasmine.Spy;
    let hasPackageSpy: jasmine.Spy;

    const addPackage = (chatId: number, packageSlug: string) => {
      service.addPackage(chatId, packageSlug)
        .subscribe();
    };

    beforeEach(() => {
      userFound = new User(1234);
      pack = { npmSlug: 'angular'};
      userFound.addPackage(pack);

      // Spies
      getUserSpy = spyOn(userRepo, 'getUser').and
        .returnValue(of(userFound));
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
});
