import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';

import * as Datastore from 'nedb';

import { User, IPackage } from '../shared/models';
import { classToPlain } from 'class-transformer';

describe('UsersRepository', () => {
  let repository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersRepository],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('Database config', () => {
    it('should create the database with the right options', () => {
      process.env.DATABASE_PATH = '/some/base/';

      expect((Datastore as any).instance.databaseOptions.filename).toContain('users.db');
      expect((Datastore as any).instance.databaseOptions.autoload).toBeTruthy();
    });

    it('should ensure the right index', () => {
      const indexRestrictions = (Datastore as any).instance.indexRestrictions;

      expect(indexRestrictions.fieldName).toEqual('chatId');
      expect(indexRestrictions.unique).toBeTruthy();
    });
  });

  describe('Create User', () => {
    let userToCreate: User;

    const createUser = (newUser: User) => repository.create(newUser).toPromise();

    beforeEach(() => {
      userToCreate = new User(12345);
    });

    it('should create the user', async () => {
      const userCreated = await createUser(userToCreate);

      expect(userCreated.chatId).toEqual(userToCreate.chatId);
    });

    it('should insert the plain version of the user', async () => {
      const toJsonSpy = spyOn(userToCreate, 'toJson');

      await createUser(userToCreate);

      expect(toJsonSpy).toHaveBeenCalled();
    });

    describe('Error', () => {
      const mockInsertAndThrowError = (errorType: string) => {
        const error = {
          errorType,
        };

        spyOn(Datastore.prototype, 'insert').and.callFake(
          (_, callback: (e, d) => void) => {
            callback(error, _);
          },
        );

        return error;
      };

      it('should catch the error when creating a repeated user', async () => {
        mockInsertAndThrowError('uniqueViolated');

        const userCreated = await createUser(userToCreate);

        expect(userCreated.chatId).toEqual(userToCreate.chatId);
      });

      it('should throw an error when is different than \'uniqueViolated\'', async () => {
        const errorToThrow = mockInsertAndThrowError('runOutSpace');
        let errorThrown;

        try {
          await createUser(userToCreate);
        } catch (err) {
          errorThrown = err;
        }

        expect(errorToThrow).toBe(errorThrown);
      });
    });
  });

  describe('Get User', () => {
    let chatId: number;
    let userFound: User;
    let randomUser: User;

    beforeEach(() => {
      chatId = 1234;
      randomUser = new User(chatId);

      repository.getUser(chatId)
        .subscribe((user) => (userFound = user));
      (Datastore as any).instance.triggerAction(randomUser.toJson());
    });

    it('should try find the user given the chatID', async () => {
      const expectedFind = { chatId };

      expect((Datastore as any).instance.findOneParameter).toEqual(expectedFind);
    });

    it('should return a instance of user', () => {
      expect(userFound instanceof User).toBeTruthy();
      expect(randomUser).toEqual(userFound);
    });
  });

  describe('Get All Users', () => {
    let randomUsers: User[];
    const nUsers = 4;

    let usersFound: User[];

    beforeEach(() => {
      randomUsers = [];

      for (let index = 0; index < nUsers; index++) {
        const newUser = new User(index);
        randomUsers.push(newUser);
      }
    });

    beforeEach(() => {
      repository.getAllUsers()
        .subscribe((users) => (usersFound = users));

      const plainRandomUsers = randomUsers
        .map((u) => classToPlain(u));

      (Datastore as any).instance.triggerAction(plainRandomUsers);
    });

    it('should send the right query to find all users', async () => {
      const expectedFind = {};

      expect((Datastore as any).instance.findParameter).toEqual(expectedFind);
    });

    it('should return a instance of user', () => {
      const allInstancesOfUser = usersFound.every((u) => u instanceof User);

      expect(allInstancesOfUser).toBeTruthy();
      expect(randomUsers).toEqual(usersFound);
    });
  });

  describe('Add Package', () => {
    let chatId: number;
    let packToAdd: IPackage;
    let randomUser: User;

    beforeEach(() => {
      chatId = 1234;
      packToAdd = { npmSlug: 'angular' };
      randomUser = new User(chatId);

      repository.addPackage(randomUser, packToAdd)
        .subscribe();
      (Datastore as any).instance.triggerAction();
    });

    it('should try to add a package given the user', () => {
      const expectedQuery = { chatId };
      const expectedUpdate = { $set: { [`packages.${packToAdd.npmSlug}`]: packToAdd } };

      let query: any;
      let update: any;
      ({ query, update } = (Datastore as any).instance.updateParameter);

      expect(query).toEqual(expectedQuery);
      expect(update).toEqual(expectedUpdate);
    });
  });
});
