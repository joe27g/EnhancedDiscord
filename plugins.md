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

    load: function() {
        /* What your plugin does when Discord is loaded, or when the plugin is reloaded. */
    },
    unload: function() {
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

* `generateSettings`: a function that is called when EnhancedDiscord settings are opened. This should return any of the following:
	* `DOMString` A HTML string paired with a `plugin.settingsListeners` property.
	*  _`instanceof`_`HTMLElement` The value returned by any call to `document.createElement(...)`, you can modify this class before returning it, e.g. setting inner children by `HTMLElement.appendChild`
	* `ReactNode` Any valid react element. **Make sure you call call React.createElement on your component**, if you return a function or a class this will not work.
	* `DiscordUIElement[]` An array of elements for the ED's Discord UI generator to create. See the link below for more information
	* ***[Click here for more information on creating settings user interface within EnhancedDiscord](https://gist.github.com/jakuski/995ae48530f3527285f4c23c3de74237)***
