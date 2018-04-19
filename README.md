# EnhancedDiscord
A simple way to load plugins and themes on Discord without token stealing and lag.

**Now with a brand-new graphical installer!**

### Installing the easy way:

*Currently, only Windows is supported for the new installer. More binaries will be made soon.*

***If you would like to contribute, download [Mono](http://www.mono-project.com/download/stable/) for Mac or Linux and compile the installer(s).*** I don't have a Linux machine with a GUI or a Mac, so I am unable to compile and test these.

- For PC: https://enhanceddiscord.com/EnhancedDiscord_BETA.exe
- For Mac: *soon*
- For Linux: *soon*

### Installing the old way:

You can also use the console installer (no GUI.)

`Note that this method will most likely be faster and less buggy for Macs!`

*Currently, only Windows is supported for the new installer. More binaries will be made soon.*

***If you have a Mac would like to contribute, download [Mono](http://www.mono-project.com/download/stable/) and compile the installer.*** I don't have a Mac, so I am unable to compile and test this.

- For PC: https://enhanceddiscord.com/ED_cmdline_BETA.exe
- For Mac: *soon*
- For Linux: *soon*

### Installing the hard way:

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

 5. Between the line you just added and the original contents, add the following:
 ```js
 const { BrowserWindow } = require('electron');
const path = require('path');

class PatchedBrowserWindow extends BrowserWindow {
    constructor(originalOptions) {
        const options = Object.create(originalOptions);
        options.webPreferences = Object.create(options.webPreferences);

        // Make sure Node integration is enabled
        options.webPreferences.nodeIntegration = true;
        options.webPreferences.preload = path.join(process.env.injDir, 'dom_shit.js');
        options.webPreferences.transparency = true;

        return new BrowserWindow(options);
    }
}

const electron_path = require.resolve('electron');
const browser_window_path = require.resolve(path.resolve(electron_path, '..', '..', 'browser-window.js'));
require.cache[browser_window_path].exports = PatchedBrowserWindow;
```

6. Restart your Discord client and installation should be complete.

### Explanation of files:

- `theme.css` ~ CSS file that's imported by the main CSS file (`plugins/style.css` by default) in order to allow auto-updating. Not useful by itself.

- `dom_shit.js` ~ File that's loaded when Discord starts. This file loads all plugins, etc.

- `plugins` ~ Directory to store custom plugins. Examples/guides on how to create plugins coming soon:tm:.

   - `plugins/anti_ping.js` ~ Hides ping icon for servers that are muted & @everyone is suppressed.

   - `plugins/avatar_links.js` ~ Adds "Copy Avatar URL" to the context menu for users, and "Copy Icon URL" to the context menu for guilds.

   - `plugins/css_loader.js` ~ Loads a custom theme from `plugins/style.css`, and hot-reloads the file when it's changed.

   - `plugins/ed_settings.js` ~ Shows a tab for EnhancedDiscord settings in your user settings.

   - `plugins/emoji_packs.js` ~ Allows you to replace Discord's emojis with a new set.

   - `plugins/experiments.js` ~ Enables Discord staff "experiments."

   - `plugins/guild_count.js` ~ Shows the number of servers you're in under your number of online friends.

   - `plugins/hidden_channels.js` ~ Shows a list of hidden channels (where you can't view messages) in every server.

   - `plugins/quick_save.js` ~ Adds support for saving guild or channel settings with Ctrl+S.

   - `plugins/silence.js` ~ Makes Clyde shut the fuck up about buying Nitro.

   - `plugins/tag_all.js` ~ Lets you tag (mention) channels and roles you normally can't.

### Custom plugins

To create your own plugin, check out [the plugin readme](/plugins.md).
