const path = require('path');
//set up global functions
var c = {
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
//load and validate plugins
var plugins = require('require-all')(path.join(process.env.injDir, 'plugins'));
for (var name in plugins) {
    if (!plugins[name] || !plugins[name].name || typeof plugins[name].load !== 'function') {
        c.info(`Skipping invalid plugin: ${name}`); plugins[name] = null; continue;
    }
    //Object.assign(plugins[name], c);
}
function loadPlugin(plugin) {
    try {
        console.log(`%c[EnhancedDiscord] %cLoading plugin %c${plugin.name}`, 'color: red;', '', `color: ${plugin.color}`, `by ${plugin.author}...`);
        plugin.load();
    } catch(err) {
        c.error(`Failed to load:\n${err.stack}`, plugin);
    }
}

process.once("loaded", async () => {
	c.log('Loading v0.7.0...');

    for (var name in plugins) {
        if (plugins[name] && plugins[name].preload)
            loadPlugin(plugins[name]);
    }

	while (typeof window.webpackJsonp != 'function')
		await c.sleep(1000); // wait until this is loaded in order to use it for modules

	/* Add helper functions that make plugins easy to create */
	window.req = webpackJsonp([], {
            '__extra_id__': (module, exports, req) => exports.default = req
        }, ['__extra_id__']).default;
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
        /*console.warn(`Cannot find module ${module} in cache. Attempting to load all modules...`);
        for (let i = 0; i < req.m.length; ++i) {
            let m = req(i);
            if (m && m.__esModule && m.default && m.default[module] !== undefined)
                return m.default;
            if (m && m[module] !== undefined)
                return m;
        }*/
        if (!silent) c.warn(`Could not find module ${module}.`, {name: 'Modules', color: 'black'});
        return null;
    };
    window.findModules = (module) => {
        var mods = [];
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

    while (!window.findModule('sendMessage', true))
        await c.sleep(1000); // wait until essential modules are loaded

    /* Load plugins */
	for (var name in plugins) {
        if (plugins[name] && !plugins[name].preload)
            loadPlugin(plugins[name]);
	}
})