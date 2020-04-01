import { User, IPackage } from '@core/users/shared/models';

function createUUID() {
  let dt = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

export const generatePackage = (
  packageName: string = createUUID(),
): IPackage => ({
  npmSlug: packageName,
});

export const predeterminedChatId = 123;

export function generateUserWithNPackage(
  nPackages: number,
  chatId = predeterminedChatId,
): User {
  const user = new User(chatId);

  for (let index = 0; index < nPackages; index++) {
    user.addPackage(generatePackage());
  }

  return user;
}

export function generateUserWithEmptyPackages(
  chatId = predeterminedChatId,
): User {
  return generateUserWithNPackage(0, chatId);
}
