const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');
var appPath;
var isReinstall = false;

function closeClient(proc) {
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

var deleteFolderRecursive = function (path) {
    if (fs.existsSync(path) && path != '/') {
        fs.readdirSync(path).forEach(function (file) {
            var curPath = path + '/' + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

function restoreClient(_path) {
    return new Promise((resolve) => {
        const folder = path.join(_path, 'app');
        if (fs.existsSync(folder)) {
            console.log('Deleting the app folder...');
            deleteFolderRecursive(folder);
        } else console.log('DI folder does not exist, skipping...');
        resolve();
    });
}

function relaunchClient() {
    return new Promise((resolve) => {
        if (isReinstall) {
            console.log('Not relaunching client yet, because reinstalling.');
        } else {
            console.log('Relaunching client...');
            let child = childProcess.spawn(appPath, { detached: true });
            child.unref();
        }
        resolve();
    });
}

module.exports = function (proc, reinstall = false) {
    isReinstall = reinstall;
    appPath = proc.command;
    return closeClient(proc)
        .then(restoreClient)
        .then(relaunchClient)
        .then(() => console.log('Uninstall complete.'))
        .catch(err => {
            console.error('An error has occurred. ' + err.message);
            return 1;
        });
};