const path = window.require('path');
const fs = window.require('fs');
const electron = window.require('electron');
const currentWindow = electron.remote.getCurrentWindow();
if (currentWindow.__preload) require(currentWindow.__preload);

//set up global functions
let c = {
    log: function(msg, plugin) {
        if (plugin && plugin.name)
            console.log(`%c[EnhancedDiscord] %c[${plugin.name}]`, 'color: red;', `color: ${plugin.color}`, msg);
    	else console.log('%c[EnhancedDiscord]', 'color: red;', msg);
    },
    info: function(msg, plugin) {
        if (plugin && plugin.name)
            console.info(`%c[EnhancedDiscord] %c[${plugin.name}]`, 'color: red;', `color: ${plugin.color}`, msg);
    	else console.info('%c[EnhancedDiscord]', 'color: red;', msg);
    },
    warn: function(msg, plugin) {
        if (plugin && plugin.name)
            console.warn(`%c[EnhancedDiscord] %c[${plugin.name}]`, 'color: red;', `color: ${plugin.color}`, msg);
    	else console.warn('%c[EnhancedDiscord]', 'color: red;', msg);
    },
    error: function(msg, plugin) {
        if (plugin && plugin.name)
            console.error(`%c[EnhancedDiscord] %c[${plugin.name}]`, 'color: red;', `color: ${plugin.color}`, msg);
    	else console.error('%c[EnhancedDiscord]', 'color: red;', msg);
    },
    sleep: function(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
}
// config util
window.ED = {plugins: {}};
Object.defineProperty(window.ED, 'config', {
    get: function() {
        return require('./config.json') || {};
    },
    set: function(newSets = {}) {
        try {
            fs.writeFileSync(require.resolve('./config.json'), JSON.stringify(newSets));
            delete require.cache[require.resolve('./config.json')];
        } catch(err) {
            c.error(err);
        }
        return this.config;
    }
});

function loadPlugin(plugin) {
    /*if (window.ED.plugins[plugin.name]) {
        console.log(`%c[EnhancedDiscord] %cSkipped plugin %c${plugin.name}`, 'color: red;', '', `color: ${plugin.color}`, `because it was already loaded.`);
        return false;
    }*/
    try {
        console.log(`%c[EnhancedDiscord] %cLoading plugin %c${plugin.name}`, 'color: red;', '', `color: ${plugin.color}`, `by ${plugin.author}...`);
        plugin.load();
        //window.ED.plugins[plugin.id] = plugin;
    } catch(err) {
        c.error(`Failed to load:\n${err.stack}`, plugin);
    }
}

process.once("loaded", async () => {
	while (typeof window.webpackJsonp === 'undefined')
		await c.sleep(1000); // wait until this is loaded in order to use it for modules

	c.log('Loading v2.1.0...');

    let x = setInterval(() => {
        if (window._ws) {
            window.ED.webSocket = window._ws;
            clearInterval(x);
        }
    }, 100);

    let y = setInterval(() => {
        if (window.localStorage) {
            window.ED.localStorage = window.localStorage;
            clearInterval(y);
        }
    }, 100);

	/* Add helper functions that make plugins easy to create */
	window.req = webpackJsonp.push([[], {
	    '__extra_id__': (module, exports, req) => module.exports = req
	}, [['__extra_id__']]]);
	delete req.m['__extra_id__'];
	delete req.c['__extra_id__'];

    window.findModule = (module, silent) => {
        for (let i in req.c) {
            if (req.c.hasOwnProperty(i)) {
                let m = req.c[i].exports;
                if (m && m.__esModule && m.default && m.default[module] !== undefined)
                    return m.default;
                if (m && m[module] !== undefined)
                    return m;
            }
        }
        if (!silent) c.warn(`Could not find module ${module}.`, {name: 'Modules', color: 'black'});
        return null;
    };
    window.findModules = (module) => {
        let mods = [];
        for (let i in req.c) {
            if (req.c.hasOwnProperty(i)) {
                let m = req.c[i].exports;
                if (m && m.__esModule && m.default && m.default[module] !== undefined)
                    mods.push(m.default);
                if (m && m[module] !== undefined)
                    mods.push(m);
            }
        }
        return mods;
    };
    window.findRawModule = (module, silent) => {
        for (let i in req.c) {
            if (req.c.hasOwnProperty(i)) {
                let m = req.c[i].exports;
                if (m && m.__esModule && m.default && m.default[module] !== undefined)
                    return req.c[i];
                if (m && m[module] !== undefined)
                    return req.c[i];
            }
        }
        if (!silent) c.warn(`Could not find module ${module}.`, {name: 'Modules', color: 'black'});
        return null;
    };
    window.monkeyPatch = function(what, methodName, newFunc) {
        if (!what || typeof what !== 'object')
            return c.error(`Could not patch ${methodName} - Invalid module passed!`, {name: 'Modules', color: 'black'});
        const displayName = what.displayName || what.name || what.constructor.displayName || what.constructor.name;
        const origMethod = what[methodName];
        const cancel = () => {
            what[methodName] = origMethod;
            console.log(`%c[EnhancedDiscord] %c[Modules]`, 'color: red;', `color: black;`, `Unpatched ${methodName} in module:`, what);
            return true;
        };
        what[methodName] = function() {
            const data = {
                thisObject: this,
                methodArguments: arguments,
                //cancelPatch: cancel,
                originalMethod: origMethod,
                callOriginalMethod: () => data.returnValue = data.originalMethod.apply(data.thisObject, data.methodArguments)
            };
            return newFunc(data);
        };
        what[methodName].__monkeyPatched = true;
        what[methodName].displayName = 'patched ' + (what[methodName].displayName || methodName);
        what[methodName].unpatch = cancel;
        console.log(`%c[EnhancedDiscord] %c[Modules]`, 'color: red;', `color: black;`, `Patched ${methodName} in module:`, what);
        return true;
    };

    while (!window.findModule('sendTyping', true) || !window.findModule('track', true))
        await c.sleep(1000); // wait until essential modules are loaded

    if (window.ED.config.silentTyping)
        window.monkeyPatch(window.findModule('sendTyping'), 'sendTyping', () => {});

    if (window.ED.config.antiTrack !== false)
        window.monkeyPatch(window.findModule('track'), 'track', () => {});
	
    while (Object.keys(window.req.c).length < 5000)
        await c.sleep(1000); // wait until most modules are loaded for plugins
	
	    //load and validate plugins
    let pluginFiles = fs.readdirSync(path.join(process.env.injDir, 'plugins'));
    let plugins = {};
    for (let i in pluginFiles) {
        if (!pluginFiles[i].endsWith('.js')) continue;
        let p, pName = pluginFiles[i].replace(/\.js$/, '');
        try {
            p = require(path.join(process.env.injDir, 'plugins', pName));
            if (typeof p.name !== 'string' || typeof p.load !== 'function') {
                throw new Error('Plugin must have a name and load() function.');
            }
            plugins[pName] = Object.assign(p, {id: pName});
        }
        catch (err) {
            c.warn(`Failed to load ${pluginFiles[i]}: ${err}\n${err.stack}`, p);
        }
    }
	
    for (let id in plugins) {
        if (!plugins[id] || !plugins[id].name || typeof plugins[id].load !== 'function') {
            c.info(`Skipping invalid plugin: ${id}`); plugins[id] = null; continue;
        }
        plugins[id].settings; // this will set default settings in config if necessary
        if (window.ED.config[id] && window.ED.config[id].enabled == false) continue;
        loadPlugin(plugins[id]);
	}
	
	window.ED.plugins = plugins;
})
