import { User, IPackage } from './user.model';
import {
  generatePackage,
  predeterminedChatId,
  generateUserWithEmptyPackages,
} from '../../../../__mocks__/data/user.mock-data';

describe('User Model', () => {
  let user: User;

  let randomChatID: number;
  let randomPack: IPackage;

  beforeEach(() => {
    randomPack = generatePackage();
    randomChatID = predeterminedChatId;

    user = new User(randomChatID);
  });

  it('should be defined', () => {
    expect(user).toBeDefined();
  });

  describe('Packages', () => {
    it('should add a package', () => {
      user.addPackage(randomPack);

      expect(user.packages).toEqual({ [randomPack.npmSlug]: randomPack });
    });

    it('should not add a repeated package', () => {
      const pack2 = generatePackage();

      user.addPackage(randomPack);
      user.addPackage(pack2);
      user.addPackage(pack2);

      expect(user.nPackages).toEqual(2);
    });

    describe('Have Package', () => {
      it('should indicate that does not have a package', () => {
        expect(user.hasPackage(randomPack.npmSlug)).toBeFalsy();
      });

      it('should indicate if have a package', () => {
        user.addPackage(randomPack);

        expect(user.hasPackage(randomPack.npmSlug)).toBeTruthy();
      });
    });

    describe('Packages Iterable', () => {
      let randomPack2: IPackage;

      beforeEach(() => {
        randomPack2 = generatePackage();

        user.addPackage(randomPack);
        user.addPackage(randomPack2);
      });

      it('should return the package in an array', () => {
        const expectedPackagesIterable = [randomPack, randomPack2];

        const packagesIt = user.packagesIterative;

        expect(packagesIt).toEqual(expectedPackagesIterable);
      });

      describe('N Packages', () => {
        it('should return the number of packages', () => {
          expect(user.nPackages).toEqual(2);
        });
      });
    });

    describe('Remove Package', () => {
      let packageToRemove: IPackage;

      beforeEach(() => {
        packageToRemove = generatePackage();

        user.addPackage(randomPack);
        user.addPackage(packageToRemove);
        user.addPackage(generatePackage());
      });

      it('should remove the package form the list', () => {
        const userPackages = user.packages;
        delete userPackages[packageToRemove.npmSlug];

        user.removePackage(packageToRemove.npmSlug);

        expect(userPackages).toEqual(user.packages);
      });
    });
  });

  describe('To JSON', () => {
    let user: User;
    let expectedUser: Partial<User>;

    beforeEach(() => {
      user = generateUserWithEmptyPackages();
      user.addPackage({ npmSlug: '@angular/cli' });

      expectedUser = {
        chatId: predeterminedChatId,
        packages: {
          '@angular/cli': { npmSlug: '@angular/cli' },
        },
      };
    });

    it('should return the user in right json format', () => {
      const plainUser = user.toJson();

      expect(plainUser).toEqual(expectedUser);
    });
  });
});
