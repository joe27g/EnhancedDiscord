# Installing the hard way

#### Recommended for people that have trouble with the installers or really like wasting time.

1. Download/clone this repo to wherever you want your ED files to reside.

2. Find your appdata folder:
- For PC: `%appdata%/discord`
- For Mac: `~/Library/Application Support`
- For Linux: `$XDG_CONFIG_HOME/discord` or `~/.config/discord/`
 - *Replace `discord` with `discordcanary` etc. as needed.*

 3. In the appdata folder, find `/x.x.xxx/modules/discord_desktop_core/index.js`, where `x.x.xxx` is your current version of the Discord client, and open it.

 4. At the top, add these lines:
 ```js
 process.env.injDir = '<path>';
 require(`${process.env.injDir}/injection.js`);
 ```
 where `<path>` is the location of the ED folder.
 
 Make sure to escape paths, for example `C:\Users\<Username>\Documents\EnhancedDiscord\EnhancedDiscord` should be `C:\\Users\\<Username>\\Documents\\EnhancedDiscord\\EnhancedDiscord`

5. Create `config.json` in your ED folder and set its contents to `{}`.

6. Restart your Discord client and installation should be complete.
