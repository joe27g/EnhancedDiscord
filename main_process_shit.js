const electron = require('electron');
const ipcMain = require('electron').ipcMain;
const path = require('path');

ipcMain.on('main-process-info', (event, arg) => {
    event.returnValue = `{
        "originalNodeModulesPath": "${path.resolve(electron.app.getAppPath(), 'node_modules')}",
        "originalPreloadScript": "${event.sender.__preload}"
    }`
});

ipcMain.on('current-web-contents', (event, arg) => {
    event.returnValue = event.sender.__currentWebContents
});

ipcMain.on('main-process-utils', (event, arg) => {
    event.returnValue = `{
        "dialog": "${electron.dialog}"
    }`
});