import { Utils } from '../../../../common';

export const tellMeThePackage =
  'Tell me the <b>package slug</b> that you want to add 📦';

export const success = (
  slug: string,
) => `Your package seems to be ${Utils.buildNPMLink(slug)}

<b>It has added successfully</b> 🎉

You can check the stats using /stats

Try it out 😸!!! /stats`;

export const packageNotFound = (slug: string) => `I couldn't find it! 😔

The package <code>${slug}\</code> doesn't exits, try it by yourself ${Utils.buildNPMLink(
  slug,
)} 🙁

Check it out again and come back`;
