const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
const mkdirp = require('mkdirp');
var appPath;
var isReinstall = false; // eslint-disable-line no-unused-vars

function closeClient(proc, close) {
    if (!close) return new Promise((res => res(path.join(proc.command, '..', 'resources'))));
    return new Promise((resolve, reject) => {
        console.log('Closing client...');
        if (process.platform === 'win32') {
            for (const pid of proc.pid) {
                try {
                    process.kill(pid);
                } catch (err) {
                    console.error(err);
                }
            }
            resolve(path.join(proc.command, '..', 'resources'));
        } else {
            childProcess.exec('killall -9 ' + proc.command, (err) => {
                if (err) reject(err);
                resolve(path.join(proc.command, '..', 'resources'));
            });
        }
    });
}

function injectClient(_path) {
    return new Promise((resolve) => {
        console.log('Creating injector...');
        mkdirp.sync(path.join(_path, 'app'));
        const file = fs.readFileSync(path.join(__dirname, 'inject.js'), { encoding: 'utf8' });
        fs.writeFileSync(path.join(_path, 'app', 'index.js'), `process.env.injDir = '${__dirname.replace(/\\/g, '\\\\')}';\n${file}`);
        const pkgShit = fs.readFileSync(path.join(__dirname, 'package.json'), { encoding: 'utf8' });
        fs.writeFileSync(path.join(_path, 'app', 'package.json'), pkgShit);
        
        resolve();
    });
}

function relaunchClient() {
    return new Promise((resolve) => {
        console.log('Relaunching client');
        let child = childProcess.spawn(appPath, { detached: true });
        child.unref();
        resolve();
    });
}

module.exports = function (proc, close = true, reinstall = false) {
    appPath = proc.command;
    isReinstall = reinstall;
    return closeClient(proc, close)
        .then(injectClient)
        .then(relaunchClient)
        .then(() => console.log('Install complete.'))
        .catch(err => {
            if (err === false) return 0;
            console.error('An error has occurred. ' + err.stack);
            return 1;
        });
};