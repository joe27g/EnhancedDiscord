# Installing the hard way

#### Recommended for people that have trouble with the installers or really like wasting time.

1. Download/clone this repo to wherever you want your ED filed to reside.

2. Find your appdata folder:
- For PC: `%appdata%/discord`
- For Mac: `~/Library/Application Support`
- For Linux: `$XDG_CONFIG_HOME/discord` or `~/.config/discord/`
 - *Replace `discord` with `discordcanary` etc. as needed.*

 3. In the appdata folder, find `/x.x.xxx/modules/discord_desktop_core/index.js`, where `x.x.xxx` is your current version of the Discord client, and open it.

 4. At the top, add the line:
 ```js
 process.env.injDir = '<path>';
 ```
 where `<path>` is the location of the ED folder.
 
 Make sure to escape paths, for example `C:\Users\<Username>\Documents\EnhancedDiscord\EnhancedDiscord` should be `C:\\Users\\<Username>\\Documents\\EnhancedDiscord\\EnhancedDiscord`
 
 5. Between the line you just added and the original contents, add the following:
 ```js
const { BrowserWindow, session } = require('electron');
const path = require('path');

session.defaultSession.webRequest.onHeadersReceived(function(details, callback) {

    if (!details.responseHeaders["content-security-policy-report-only"] && !details.responseHeaders["content-security-policy"]) return callback({cancel: false});
    delete details.responseHeaders["content-security-policy-report-only"];

    delete details.responseHeaders["content-security-policy"];

    callback({cancel: false, responseHeaders: details.responseHeaders})
;
});

class PatchedBrowserWindow extends BrowserWindow {
    constructor(originalOptions) {
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
const browser_window_path = require.resolve(path.resolve(electron_path, '..', '..', 'browser-window.js'));
require.cache[browser_window_path].exports = PatchedBrowserWindow;
```

6. Create `config.json` in your ED folder and set its contents to `{}`.

7. Restart your Discord client and installation should be complete.
