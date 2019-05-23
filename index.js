#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const hjson = require('hjson');

const main = async () => {
  try {
    await doNpmInit();
    await doUpdatePackage();
    await doNpmInstall();
    await doNpmInstallDev();
    await doTscInit();
    await updateTsconfig();
    await doMkdir();
    await doCopy();
  } catch (error) {
    console.log('error');
    console.log(error);
  }
};

const doNpmInit = () => {
  return new Promise((resolve, reject) => {
    const npmInit = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm',
      ['init']);

    npmInit.stdout.on('data', data => {
      process.stdout.write(data.toString());
      npmInit.stdin.write('\n');
    });
    npmInit.stderr.on('data', data => reject(data.toString()));
    npmInit.stdout.on('end', () => resolve());
  });
};

const doUpdatePackage = () => {
  return new Promise((resolve) => {
    const package = JSON.parse(fs.readFileSync('./package.json').toString());

    package.scripts.main = 'nodemon --watch src --delay 1 --exec ts-node src/bin/www.ts';
    package.scripts.test = 'mocha --require ts-node/register --exit ./test/*.spec.ts';

    fs.writeFileSync('./package.json', JSON.stringify(package, null, 2));

    resolve();
  });
};

const doNpmInstall = () => {
  return new Promise((resolve, reject) => {
    const npmInstall = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm',
      ['i', 'express', 'dotenv']);

    npmInstall.stdout.on('data', data => process.stdout.write(data.toString()));
    //npmInstall.stderr.on('data', data => reject(data.toString()));
    npmInstall.stdout.on('end', () => resolve());
  });
};

const doNpmInstallDev = () => {
  return new Promise((resolve, reject) => {
    const npmInstallDev = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm',
      ['i', '-D', 'typescript', 'nodemon', 'mocha', '@types/express', '@types/dotenv']);

    npmInstallDev.stdout.on('data', data => process.stdout.write(data.toString()));
    //npmInstallDev.stderr.on('data', data => reject(data.toString()));
    npmInstallDev.stdout.on('end', () => resolve());
  });
};

const doTscInit = () => {
  return new Promise((resolve, reject) => {
    const tscInit = spawn(/^win/.test(process.platform) ? 'tsc.cmd' : 'tsc', ['--init']);

    tscInit.stdout.on('data', data => process.stdout.write(data.toString()));
    tscInit.stdout.on('end', () => resolve());
  });
};

const updateTsconfig = () => {
  return new Promise((resolve, reject) => {
    const tsconfig = hjson.parse(fs.readFileSync('./tsconfig.json').toString());

    tsconfig.compilerOptions.outDir = 'dist';
    tsconfig.include = ['src/**/*'];

    fs.writeFileSync('./tsconfig.json', JSON.stringify(tsconfig, null, 2));

    resolve();
  });
};

const doMkdir = () => {
  return new Promise((resolve, reject) => {
    const mkdir = spawn('mkdir',
      ['src', 'dist', 'test', 'log',
      'src/bin', 'src/model', 'src/routes', 'src/util']);

    mkdir.stdout.on('data', data => process.stdout.write(data.toString()));  
    mkdir.stderr.on('data', data => reject(data.toString()));
    mkdir.stdout.on('end', () => resolve())
  })
};

const doCopy = () => {
  return new Promise((resolve) => {
    copyTemplate('app.ts', 'src');
    copyTemplate('config.ts', 'src');
    copyTemplate('www.ts', 'src/bin');
    copyTemplate('index.ts', 'src/routes');
    resolve();
  });
};

const copyTemplate = (fileName, filePath) => {
  const file = fs.readFileSync(path.join(__dirname, 'templates', fileName));
  fs.writeFileSync(`./${filePath}/${fileName}`, file);
};

program
  .name('teg')
  .version('0.0.1', '-v, --version')
  .usage('[option]');
 
program
  .command('*', { noHelp: true })
  .action(() => {
    console.log('해당 명령어를 찾을 수 없습니다!!') ;
    program.help();
  });

program.parse(process.argv);

main();
