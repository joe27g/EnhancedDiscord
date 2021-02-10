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

ipcMain.handleOnce('end-of-support-notice', (event, arg) => {
    const endOfSupportMessage = () => {
        return electron.dialog.showMessageBoxSync(event.sender.getOwnerBrowserWindow(), {
            type: 'info',
            title: 'ED - End of Support Notice',
            buttons: ['Help Me Uninstall', 'Continue Anyway', 'Quit'],
            message: `EnhancedDiscord will end all support on February 28th, 2021.
Bug fixes only. (no more fixes for major discord updates)`,
            cancelId: 1
        });
    };
    switch(endOfSupportMessage()) {
        case 0:
            electron.shell.openExternal('https://github.com/joe27g/EnhancedDiscord/wiki/FAQ');
            electron.app.quit();
            break;
        case 1:
            break;
        case 2:
            electron.app.quit();
    };
})
