# How to make plugins

Let's start by showing the basic format:

```js
const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'A Plugin', /* Human-readable plugin name. */
    author: 'Joe', /* [Optional] Put your name here to give yourself credit for making it :) */
    description: 'Does absolutely nothing, lol', /* Description of what this plugin does. */
    preload: false, /* [Optional] If true, load this before Discord has finished starting up */
    color: '#666', /* [Optional] The color that this plugin shows in logs and in the plugin settings tab. Any valid CSS color will work here. */

    load: () => {
        /* What your plugin does when Discord is loaded, or when the plugin is reloaded. */
    },
    unload: () => {
        /* What your plugin does when it is disabled or being reloaded. */
    }
});
```

### Helper functions reference

The Plugin class adds the following functions to your plugin:

* **`log`, `info`, `warn`, `error`**: same as `console.log`, `console.info`, etc., except it adds the name and color of your plugin to the log statement. Example: `this.log('Successfully loaded!')`

* **`sleep(ms)`**: Returns a Promise that resolves after `ms` milliseconds. Usage: `await this.sleep(5000);` __[Make sure you make `load()` an async function first!]__

### Storing settings

The Plugin class and settings plugin offer the following helpers for plugin settings:

* **`settings`**: Stores your plugin's settings in the config file. It is done using getters and setters, so loading and saving your plugin's settings are as easy as reading and writing `this.settings`.

* **`config`**: Integrates with `settings`. This should essentially store all your default settings, and these will be saved to the config file the first time your plugin is loaded, or when the user resets their settings. Use this when creating your plugin, in the object that is used in `new Plugin({})`.

   * This should be located in the object you used to create the plugin (i.e. between the `id` property and `load` function.)

   * The format is as follows:
   ```js
   config: {
      'settingName': {
         default: 'default value for this setting'
         /* I highly recommend you add extra properties here to help you create the settings section, if you wish to do so. */
      }
   }
   ```

### Global helper functions

The following functions/variables are available from the `window` object to help you make plugins:

* `findModule(name, silent)`: Looks for a module with a function called `name`. Using this can be trial-and-error sometimes. Example: `findModule('sendMessage').sendMessage('415248292767727616', {content: 'random shit'})` would send the message 'random shit' in #shitposting in the EnhancedDiscord server. The `silent` argument tells whether to send a warning in console if the module is not found.

* `findModules(name)`: Same as above, but returns an Array of modules.

* `monkeyPatch(module, functionName, newFunction)`: Replaces a function by the name of `functionName` inside a `module` with a new one (`newFunction`). **This has special properties regarding the original method - Details below.**

   * To access the original arguments, use `arguments[0].methodArguments`. For example, in sendMessage, `arguments[0].methodArguments[0]` is the channel ID.

   * To access the "this" object used internally, use `arguments[0].thisObject`.

   * To access the original function, use `arguments[0].originalMethod`.

   * To run the original function, use `arguments[0].callOriginalMethod(arguments[0].methodArguments)`.

   * To undo your patch, use the `unpatch()` function; for example, `findModule('sendMessage').sendMessage.unpatch();`. The `__monkeyPatched` property, located in the same place, can be used to determine if a function is already patched.

Original versions of these two functions are from [samogot](https://github.com/samogot)'s [Lib Discord Internals](https://github.com/samogot/betterdiscord-plugins/blob/master/v2/1Lib%20Discord%20Internals/plugin.js).

### Advanced plugin functionality

You can also add your own section to EnhancedDiscord's settings in your plugin, but you'll have to do all the grunt work.

* **You must have a `config` for the following to work.** Set it to an empty object if you do not need it.

* `generateSettings`: a function that is called when EnhancedDiscord settins are opened. This should return HTML to be placed in your setttings section.

* `settingListeners`: an Object mapping selectors to click listeners.
   * For example, if your `generateSettings` function has an element `<input type="checkbox" id="memez">`, you might use the following format:
   ```js
   settingListeners: {
      '#memez': () => {
         alert('some dumb text');
      }
   }
   ```

#### For more examples, just browse the included plugins, namely `emoji_packs`.
