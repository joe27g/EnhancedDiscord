const electron = require('electron');
const ipcMain = require('electron').ipcMain;
const path = require('path');

ipcMain.on('main-process-info', (event, arg) => {
    switch(arg) {
        case "original-node-modules-path":
            event.returnValue = path.resolve(electron.app.getAppPath(), 'node_modules');
        case "original-preload-script":
            event.returnValue = event.sender.__preload;
    }
});

ipcMain.on('main-process-utils', (event, arg) => {
    switch(arg) {
        case "dialog":
            event.returnValue = `${electron.dialog}`;
    }
});

ipcMain.handle('custom-devtools-warning', (event, arg) => {
    let wc = event.sender.getOwnerBrowserWindow().webContents;
    wc.removeAllListeners('devtools-opened');
    wc.on('devtools-opened', () => {
        wc.executeJavaScript(`
            console.log('%cHold Up!', 'color: #FF5200; -webkit-text-stroke: 2px black; font-size: 72px; font-weight: bold;');
            console.log("%cIf you're reading this, you're probably smarter than most Discord developers.", 'font-size: 16px;');
            console.log('%cPasting anything in here could actually improve the Discord client.', 'font-size: 18px; font-weight: bold; color: red;');
            console.log("%cUnless you understand exactly what you're doing, keep this window open to browse our bad code.", 'font-size: 16px;');
            console.log("%cIf you don't understand exactly what you\'re doing, you should come work with us: https://discordapp.com/jobs", 'font-size: 16px;');
        `)
    });
});

ipcMain.handle('bd-navigate-page-listener', (event, arg) => {
    event.sender.getOwnerBrowserWindow().webContents.on('did-navigate-in-page', arg);
})

ipcMain.handle('remove-bd-navigate-page-listener', (event, arg) => {
    event.sender.getOwnerBrowserWindow().webContents.removeEventListener('did-navigate-in-page', arg);
})