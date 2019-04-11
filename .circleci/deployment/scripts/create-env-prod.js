'use strict';

// if is not on circleci do nothing
if (!amIInCircleCI()) {
  console.log('Not in CircleCI, envProd file will not created');
  return;
}

const fs = require('fs');
const envDevExampleFilePath = 'src/environments/.envExample';
const envProdFilePath = 'src/environments/.envProd';

fs.readFile(envDevExampleFilePath, (err, data) => {
  if (err) throw err;

  const dataStr = data.toString();

  const envVariables = dataStr
    .split('\n')
    .map((line) => line.split('=')[0]);

  // The content of the new file
  const newEnvProdFile = envVariables
    .map((envVar) => generateEnvVar(envVar))
    .join('\n');

  // Write the new file
  fs.writeFile(envProdFilePath, newEnvProdFile, (err) => {
    if (err) throw err;

    console.log('Env Production file created successfully');
  });
});

function generateEnvVar(envVar) {
  return `${envVar}=${process.env[envVar]}`;
}

function amIInCircleCI() {
  const CIRCLECI = process.env.CIRCLECI;
  return CIRCLECI && CIRCLECI.toLowerCase() == 'true' ? true : false;
}