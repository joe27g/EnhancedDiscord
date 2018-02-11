# EnhancedDiscord
A simple way to load plugins and themes on Discord without token stealing and lag.

Loosely based off of [DiscordInjections](https://github.com/DiscordInjections/DiscordInjections/); all the injection/installation was modified from it.

### To install: 

1. Install Node.js if you haven't already. Google can help you with this

2. Download + extract or clone this repo to wherever you want its files to stay.
  *(Once you inject, the path to these files is saved, and plugins and other files will be loaded from that location.)*
  
3. Open a console window and set the location to the path mentioned above. Again, Google is your friend here if you're a noob.

4. Run `npm install` to install dependencies.

5. Run `node index.js` to start the installer.

### Explanation of files:

- `dom_shit.js` ~ File that's loaded when Discord starts. This file loads all plugins, etc.

- `plugins` ~ Directory to store custom plugins. Examples/guides on how to create plugins coming soon:tm:.

   - `plugins/css_shit.js` ~ Loads a custom theme from `plugins/style.css`, and hot-reloads the file when it's changed.
   
   - `plugins/splash_stuff.js` ~ Loads a "theme" and changes random messages in the splash screen. Easy way to add messages coming soon:tm:.
   
