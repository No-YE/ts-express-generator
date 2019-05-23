#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

const main = async () => {
  const destinationPath = program.args.shift() || __dirname;
  const appPath = path.resolve(path.join(destinationPath));

  try {
    await doMkdir(appPath);
    await doCopy(appPath);
    await updatePacket(appPath);
  } catch (error) {
    console.log('error');
    console.log(error);
  }
};

const doMkdir = (appPath) => {
  return new Promise((resolve) => {
    const mkdir = spawn('mkdir', ['-p', String.raw`${appPath}\{dist,test,log,src\{bin,model,routes,util}}`]);

    mkdir.stdout.on('data', data => process.stdout.write(data.toString()));  
    mkdir.stdout.on('end', () => resolve());
  });
};

const doCopy = (appPath) => {
  return new Promise((resolve) => {
    copyTemplate('package.json', `${appPath}`);
    copyTemplate('tsconfig.json', `${appPath}`);
    copyTemplate('app.ts', `${appPath}/src`);
    copyTemplate('config.ts', `${appPath}/src`);
    copyTemplate('www.ts', `${appPath}/src/bin`);
    copyTemplate('index.ts', `${appPath}/src/routes`);
    resolve();
  });
};

const updatePacket = (appPath) => {
  const splitedPath = appPath.split('\\');
  const appName = splitedPath[splitedPath.length-1];

  const package = JSON.parse(fs.readFileSync(path.join(appPath, 'package.json')).toString());
  
  package.name = appName;

  fs.writeFileSync(path.join(appPath, 'package.json'), JSON.stringify(package, null, 2));
};

const copyTemplate = (fileName, filePath) => {
  const file = fs.readFileSync(path.join(__dirname, 'templates', fileName));
  fs.writeFileSync(`${filePath}/${fileName}`, file);
};

program
  .name('teg')
  .usage('[option] [dir]');

program.parse(process.argv);

main();
