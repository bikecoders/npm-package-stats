// jest.config.js
const { pathsToModuleNameMapper } = require('ts-jest/utils');
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const { compilerOptions } = require('./tsconfig');

module.exports = {
  moduleFileExtensions: [
    "js",
    "json",
    "ts"
  ],
  rootDir: "src",
  testRegex: ".spec.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  testResultsProcessor: "jest-sonar-reporter",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/../' } )
};
