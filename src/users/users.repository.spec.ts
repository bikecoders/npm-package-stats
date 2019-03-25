import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';

import * as Datastore from 'nedb-promises';
import { User } from 'dist/models/user.interface';

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
      expect(Datastore.databaseOptions.filename).toContain('database/users.db');
      expect(Datastore.databaseOptions.autoload).toBeTruthy();
    });

    it('should ensure the right index', () => {
      const indexRestrictions = Datastore.dbCreated.indexRestrictions;

      expect(indexRestrictions.fieldName).toEqual('chatId');
      expect(indexRestrictions.unique).toBeTruthy();
    });
  });

  describe('Create User', () => {
    let userToCreate;

    const createUser = (newUser: User) => repository.create(newUser).toPromise();

    beforeEach(() => {
      userToCreate = {
        chatId: '122345',
      };
    });

    it('should create the user', async () => {
      userToCreate = {
        chatId: '122345',
      };
      const userCreated = await createUser(userToCreate);

      expect(userCreated.chatId).toEqual(userToCreate.chatId);
    });

    describe('Error', () => {
      const mockInsertAndThrowError = (errorType: string) => {
        const error = {
          errorType,
        };

        spyOn(Datastore.dbCreated, 'insert').and.returnValue(Promise.reject(error));

        return error;
      };

      it('should catch the error when creating a repeated user', async () => {
        mockInsertAndThrowError('uniqueViolated');

        const userCreated = await createUser(userToCreate);

        expect(userCreated.chatId).toEqual(userToCreate.chatId);
      });

      it ('should throw an error when is different than \'uniqueViolated\'', async () => {
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
});
