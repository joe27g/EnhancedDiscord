const path = window.require('path');
const fs = window.require('fs');
const electron = window.require('electron');
const BDManager = require('./bd_shit');
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
    
    await BDManager.setup(currentWindow);
        
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



/* BD/ED joint api */
window.EDApi = window.BdApi = class EDApi {
    static get React() { return this.findModuleByProps('createElement'); }
    static get ReactDOM() { return this.findModuleByProps('findDOMNode'); }

    static escapeID(id) {
        return id.replace(/^[^a-z]+|[^\w-]+/gi, "");
    }

    static injectCSS(id, css) {
        $("head").append($("<style>", {id: this.escapeID(id), html: css}));
    }

    static clearCSS(id) {
        $("#" + this.escapeID(id)).remove();
    }

    static linkJS(id, url) {
        $("head").append($("<script>", {id: this.escapeID(id), src: url, type: "text/javascript"}));
    }

    static unlinkJS(id) {
        $("#" + this.escapeID(id)).remove();
    }

    static getPlugin(name) {
        const plugin = Object.values(window.ED.plugins).find(p => p.name == name);
        return plugin || null;
    }

    static alert(title, body) {
        const ModalStack = EDApi.findModuleByProps("push", "update", "pop", "popWithKey");
        const AlertModal = EDApi.findModule(m => m.prototype && m.prototype.handleCancel && m.prototype.handleSubmit && m.prototype.handleMinorConfirm);
        if (!ModalStack || !AlertModal) return window.alert(body);
        ModalStack.push(function(props) {
            return EDApi.React.createElement(AlertModal, Object.assign({title, body}, props));
        });
    }

    static loadData(pluginName, key) {
        if (!window.ED.config[pluginName]) window.ED.config[pluginName] = {};
        return window.ED.config[pluginName][key];
    }

    static saveData(pluginName, key, data) {
        if (!window.ED.config[pluginName]) window.ED.config[pluginName] = {};
        window.ED.config[pluginName][key] = data;
        window.ED.config = window.ED.config;
    }

    static getData(pluginName, key) {
        return EDApi.loadData(pluginName, key);
    }

    static setData(pluginName, key, data) {
        EDApi.saveData(pluginName, key, data);
    }

    static getInternalInstance(node) {
        if (!(node instanceof window.jQuery) && !(node instanceof Element)) return undefined;
        if (node instanceof jQuery) node = node[0];
        return node[Object.keys(node).find(k => k.startsWith("__reactInternalInstance"))];
    }

    static showToast(content, options = {}) {
        if (!document.querySelector(".toasts")) {
            let toastWrapper = document.createElement("div");
            toastWrapper.classList.add("toasts");
            let boundingElement = document.querySelector(".chat-3bRxxu form, #friends, .noChannel-Z1DQK7, .activityFeed-28jde9");
            toastWrapper.style.setProperty("left", boundingElement ? boundingElement.getBoundingClientRect().left + "px" : "0px");
            toastWrapper.style.setProperty("width", boundingElement ? boundingElement.offsetWidth + "px" : "100%");
            toastWrapper.style.setProperty("bottom", (document.querySelector(".chat-3bRxxu form") ? document.querySelector(".chat-3bRxxu form").offsetHeight : 80) + "px");
            document.querySelector(".app").appendChild(toastWrapper);
        }
        const {type = "", icon = true, timeout = 3000} = options;
        let toastElem = document.createElement("div");
        toastElem.classList.add("toast");
        if (type) toastElem.classList.add("toast-" + type);
        if (type && icon) toastElem.classList.add("icon");
        toastElem.innerText = content;
        document.querySelector(".toasts").appendChild(toastElem);
        setTimeout(() => {
            toastElem.classList.add("closing");
            setTimeout(() => {
                toastElem.remove();
                if (!document.querySelectorAll(".toasts .toast").length) document.querySelector(".toasts").remove();
            }, 300);
        }, timeout);
    }

    static findModule(filter, silent = true) {
        for (let i in req.c) {
            if (req.c.hasOwnProperty(i)) {
                let m = req.c[i].exports;
                if (m && m.__esModule && m.default && filter(m.default)) return m.default;
                if (m && filter(m))	return m;
            }
        }
        if (!silent) c.warn(`Could not find module ${module}.`, {name: 'Modules', color: 'black'})
        return null;
    }

    static findAllModules(filter) {
        const modules = [];
        for (let i in req.c) {
            if (req.c.hasOwnProperty(i)) {
                let m = req.c[i].exports;
                if (m && m.__esModule && m.default && filter(m.default)) modules.push(m.default);
                else if (m && filter(m)) modules.push(m);
            }
        }
        return modules;
    }

    static findModuleByProps(...props) {
        return EDApi.findModule(module => props.every(prop => module[prop] !== undefined));
    }

    static findModuleByDisplayName(name) {
        return EDApi.findModule(module => module.displayName === name);
    }
    
    static monkeyPatch(what, methodName, options) {
        const {before, after, instead, once = false, silent = false, force = false} = options;
        const displayName = options.displayName || what.displayName || what.name || what.constructor.displayName || what.constructor.name;
        if (!silent) console.log("patch", methodName, "of", displayName); // eslint-disable-line no-console
        if (!what[methodName]) {
            if (force) what[methodName] = function() {};
            else return console.error(methodName, "does not exist for", displayName); // eslint-disable-line no-console
        }
        const origMethod = what[methodName];
        const cancel = () => {
            if (!silent) console.log("unpatch", methodName, "of", displayName); // eslint-disable-line no-console
            what[methodName] = origMethod;
        };
        what[methodName] = function() {
            const data = {
                thisObject: this,
                methodArguments: arguments,
                cancelPatch: cancel,
                originalMethod: origMethod,
                callOriginalMethod: () => data.returnValue = data.originalMethod.apply(data.thisObject, data.methodArguments)
            };
            if (instead) {
                const tempRet = EDApi.suppressErrors(instead, "`instead` callback of " + what[methodName].displayName)(data);
                if (tempRet !== undefined) data.returnValue = tempRet;
            }
            else {
                if (before) EDApi.suppressErrors(before, "`before` callback of " + what[methodName].displayName)(data);
                data.callOriginalMethod();
                if (after) EDApi.suppressErrors(after, "`after` callback of " + what[methodName].displayName)(data);
            }
            if (once) cancel();
            return data.returnValue;
        };
        what[methodName].__monkeyPatched = true;
        what[methodName].displayName = "patched " + (what[methodName].displayName || methodName);
        return cancel;
    }

    static testJSON(data) {
        try {
            JSON.parse(data);
            return true;
        }
        catch (err) {
            return false;
        }
    }

    static suppressErrors(method, description) {
        return (...params) => {
            try { return method(...params);	}
            catch (e) { console.error("Error occurred in " + description, e); }
        };
    }

    static formatString(string, values) {
        for (let val in values) {
            string = string.replace(new RegExp(`\\{\\{${val}\\}\\}`, 'g'), values[val]);
        }
        return string;
    };
};