const electron = require('electron');
const path = require('path');

electron.session.defaultSession.webRequest.onHeadersReceived(function(details, callback) {
    if (!details.responseHeaders["content-security-policy-report-only"] && !details.responseHeaders["content-security-policy"]) return callback({cancel: false});
    delete details.responseHeaders["content-security-policy-report-only"];
    delete details.responseHeaders["content-security-policy"];
    callback({cancel: false, responseHeaders: details.responseHeaders});
});

class BrowserWindow extends electron.BrowserWindow {
    constructor(originalOptions) {
		if (!originalOptions || !originalOptions.webPreferences|| !originalOptions.title) return super(originalOptions);
        const options = Object.create(originalOptions);
        options.webPreferences = Object.create(options.webPreferences);
		
		const originalPreloadScript = options.webPreferences.preload;

        // Make sure Node integration is enabled
        options.webPreferences.nodeIntegration = true;
        options.webPreferences.preload = path.join(process.env.injDir, 'dom_shit.js');
        options.webPreferences.transparency = true;

        super(options);
        this.__preload = originalPreloadScript;
    }
}

const electron_path = require.resolve('electron');
Object.assign(BrowserWindow, electron.BrowserWindow); // Assigns the new chrome-specific ones

if (electron.deprecate && electron.deprecate.promisify) {
	const originalDeprecate = electron.deprecate.promisify; // Grab original deprecate promisify
	electron.deprecate.promisify = (originalFunction) => originalFunction ? originalDeprecate(originalFunction) : () => void 0; // Override with falsey check
}

const newElectron = Object.assign({}, electron, {BrowserWindow});
// Tempfix for Injection breakage due to new version of Electron on Canary (Electron 7.x)
// Found by Zerebos (Zack Rauen)
delete require.cache[electron_path].exports;
// /Tempfix
require.cache[electron_path].exports = newElectron;
//const browser_window_path = require.resolve(path.resolve(electron_path, '..', '..', 'browser-window.js'));
//require.cache[browser_window_path].exports = BrowserWindow;
