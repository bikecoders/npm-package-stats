export const noPackage = `You don't have any package to delete 😅
Try to add some with /add`;

export const packageNoLongerYours = (npmPackageSlug: string) =>
  `The Package "${npmPackageSlug}" is not longer on your list 🤷‍♂️`;

export const packageRemoved = (npmPackageSlug: string) =>
  `Package "${npmPackageSlug}" Removed ✅`;

export const selectPackageToDelete =
  'Select the package that you want to delete 🗑️';
