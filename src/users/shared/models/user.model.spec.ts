import { User, IPackage } from './user.model';
import { classToPlain } from 'class-transformer';
jest.mock('class-transformer');

describe('User Model', () => {
  let user: User;

  let randomChatID: number;
  let randomPack: IPackage;

  beforeEach(() => {
    randomPack = {
      npmSlug: 'randomSlug',
    };
    randomChatID = 12345;

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
      const pack2: IPackage = {
        npmSlug: 'randomSlug2',
      };

      user.addPackage(Object.assign({}, randomPack));
      user.addPackage(Object.assign({}, pack2));
      user.addPackage(Object.assign({}, pack2));

      expect(Object.keys(user.packages).length).toEqual(2);
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

    describe('To Json', () => {
      it('should return the right json format', () => {
        const userJson = user.toJson();

        expect(classToPlain).toHaveBeenCalledWith(user);
      });
    });
  });
});
