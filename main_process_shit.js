const electron = require('electron');
const ipcMain = require('electron').ipcMain;
const path = require('path');

ipcMain.on('main-process-info', (event, arg) => {
    event.returnValue = `{
        "originalNodeModulesPath": "${path.resolve(electron.app.getAppPath(), 'node_modules')}",
        "originalPreloadScript": "${event.sender.__preload}"
    }`
});

ipcMain.on('main-process-utils', (event, arg) => {
    event.returnValue = `{
        "dialog": "${electron.dialog}"
    }`
});

ipcMain.handle('bd-navigate-page-listener', (event, arg) => {
    event.sender.getOwnerBrowserWindow().webContents.on('did-navigate-in-page', arg);
})

ipcMain.handle('remove-bd-navigate-page-listener', (event, arg) => {
    event.sender.getOwnerBrowserWindow().webContents.removeEventListener('did-navigate-in-page', arg);
})