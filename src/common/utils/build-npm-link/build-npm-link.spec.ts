import { buildNPMLink } from './build-npm-link';

describe('Build NPM Link', () => {
  it('should return the right url structure given a package name', () => {
    const link = buildNPMLink('ngx-deploy-npm');

    expect(link).toEqual('https://www.npmjs.com/package/ngx-deploy-npm');
  });
});
