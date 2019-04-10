export const wrongCommand = `I didn't understand 🤔
You need to use the command <code>/add</code> in the following way:

<code>add you_package_slug</code>

You can find the slug on the URL's package on npm.
For example for Angular, the npm URL is <code>https://www.npmjs.com/package/angular</code> and the slug is <i>angular</i>

Try again 😸`;

export const success = (slug: string) => `Your package seems to be https://www.npmjs.com/package/${slug}

<b>It has added successfully</b> 🎉

You can check the stats using /stats

Try it out 😸!!! /stats`;

export const packageNotFound = (slug: string) => `I couldn't find it! 😔

The package <code>${slug}\</code> doesn't exits, try it by yourself https://www.npmjs.com/package/${slug} 🙁

Check it out again and come back`;
