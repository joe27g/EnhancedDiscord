const path = window.require('path');
const fs = window.require('fs');
const electron = window.require('electron');
const Module =  window.require('module').Module;
Module.globalPaths.push(path.resolve(electron.remote.app.getAppPath(), 'node_modules'));
const currentWindow = electron.remote.getCurrentWindow();
if (currentWindow.__preload) require(currentWindow.__preload);

//Get inject directory
if (!process.env.injDir) process.env.injDir = __dirname;

//set up global functions
const c = {
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
window.ED = { plugins: {}, version: '2.8' };
Object.defineProperty(ED, 'config', {
    get: function() {
        let conf;
        try{
            conf = require('./config.json');
        } catch (err) {
            if(err.code !== 'MODULE_NOT_FOUND')
                c.error(err);
            conf = {};
        }
        return conf;
    },
    set: function(newSets = {}) {
        let confPath;
        let bDelCache;
        try{
            confPath = require.resolve('./config.json');
            bDelCache = true;
        } catch (err) {
            if(err.code !== 'MODULE_NOT_FOUND')
                c.error(err);
            confPath = path.join(process.env.injDir, 'config.json');
            bDelCache = false;
        }

        try {
            fs.writeFileSync(confPath, JSON.stringify(newSets));
            if(bDelCache)
                delete require.cache[confPath];
        } catch(err) {
            c.error(err);
        }
        return this.config;
    }
});

function loadPlugin(plugin) {
    try {
        if (plugin.preload)
            console.log(`%c[EnhancedDiscord] %c[PRELOAD] %cLoading plugin %c${plugin.name}`, 'color: red;', 'color: yellow;', '', `color: ${plugin.color}`, `by ${plugin.author}...`);
        else console.log(`%c[EnhancedDiscord] %cLoading plugin %c${plugin.name}`, 'color: red;', '', `color: ${plugin.color}`, `by ${plugin.author}...`);
        plugin.load();
    } catch(err) {
        c.error(`Failed to load:\n${err.stack}`, plugin);
    }
}

ED.localStorage = window.localStorage;

process.once("loaded", async () => {
    c.log(`v${ED.version} is running. Validating plugins...`);

    const pluginFiles = fs.readdirSync(path.join(process.env.injDir, 'plugins'));
    const plugins = {};
    for (const i in pluginFiles) {
        if (!pluginFiles[i].endsWith('.js') || pluginFiles[i].endsWith(".plugin.js")) continue;
        let p;
        const pName = pluginFiles[i].replace(/\.js$/, '');
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
    for (const id in plugins) {
        if (!plugins[id] || !plugins[id].name || typeof plugins[id].load !== 'function') {
            c.info(`Skipping invalid plugin: ${id}`); delete plugins[id]; continue;
        }
        plugins[id].settings; // this will set default settings in config if necessary
    }
    ED.plugins = plugins;
    c.log(`Plugins validated.`);

	while (!window.webpackJsonp)
		await c.sleep(100); // wait until this is loaded in order to use it for modules

    ED.webSocket = window._ws;

	/* Add helper functions that make plugins easy to create */
	window.req = window.webpackJsonp.push([[], {
        '__extra_id__': (module, exports, req) => module.exports = req
	}, [['__extra_id__']]]);
	delete window.req.m['__extra_id__'];
	delete window.req.c['__extra_id__'];

    window.findModule = EDApi.findModule;
    window.findModules = EDApi.findAllModules;
    window.findRawModule = EDApi.findRawModule;
    window.monkeyPatch = EDApi.monkeyPatch;

    while (!EDApi.findModule('dispatch'))
        await c.sleep(100);

    c.log(`Loading preload plugins...`);
    for (const id in plugins) {
        if (ED.config[id] && ED.config[id].enabled == false) continue;
        if (!plugins[id].preload) continue;
        loadPlugin(plugins[id]);
    }

    const d = {resolve: () => {}};
    window.monkeyPatch(window.findModule('dispatch'), 'dispatch', {before: b => {
        // modules seem to all be loaded when RPC server loads
        if (b.methodArguments[0].type === 'RPC_SERVER_READY') {
            window.findModule('dispatch').dispatch.unpatch();
            d.resolve();
        }
    }});

    await new Promise(resolve => {
        d.resolve = resolve;
    })
    c.log(`Modules done loading (${Object.keys(window.req.c).length})`);

    if (ED.config.bdPlugins) {
        await require('./bd_shit').setup(currentWindow);
        c.log(`Preparing BD plugins...`);
        for (const i in pluginFiles) {
            if (!pluginFiles[i].endsWith('.js') || !pluginFiles[i].endsWith(".plugin.js")) continue;
            let p;
            const pName = pluginFiles[i].replace(/\.js$/, '');
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
        for (const id in plugins) {
            if (!plugins[id] || !plugins[id].name || typeof plugins[id].load !== 'function') {
                c.info(`Skipping invalid plugin: ${id}`); delete plugins[id]; continue;
            }
        }
    }

    c.log(`Loading plugins...`);
    for (const id in plugins) {
        if (ED.config[id] && ED.config[id].enabled == false) continue;
        if (plugins[id].preload) continue;
        if (ED.config[id] && ED.config[id].enabled !== true && plugins[id].disabledByDefault) {
            plugins[id].settings.enabled = false; continue;
        }
        loadPlugin(plugins[id]);
    }


    const ht = EDApi.findModule('hideToken')
    // prevent client from removing token from localstorage when dev tools is opened, or reverting your token if you change it
    EDApi.monkeyPatch(ht, 'hideToken', () => {});
    window.fixedShowToken = () => {
        // Only allow this to add a token, not replace it. This allows for changing of the token in dev tools.
        if (!ED.localStorage || ED.localStorage.getItem("token")) return;
        return ED.localStorage.setItem("token", '"'+ht.getToken()+'"');
    };
    EDApi.monkeyPatch(ht, 'showToken', window.fixedShowToken);
    if (!ED.localStorage.getItem("token") && ht.getToken())
        window.fixedShowToken(); // prevent you from being logged out for no reason

    // change the console warning to be more fun
    const wc = require('electron').remote.getCurrentWebContents();
    wc.removeAllListeners("devtools-opened");
    wc.on("devtools-opened", () => {
        console.log("%cHold Up!", "color: #FF5200; -webkit-text-stroke: 2px black; font-size: 72px; font-weight: bold;");
        console.log("%cIf you're reading this, you're probably smarter than most Discord developers.", "font-size: 16px;");
        console.log("%cPasting anything in here could actually improve the Discord client.", "font-size: 18px; font-weight: bold; color: red;");
        console.log("%cUnless you understand exactly what you're doing, keep this window open to browse our bad code.", "font-size: 16px;");
        console.log("%cIf you don't understand exactly what you're doing, you should come work with us: https://discordapp.com/jobs", "font-size: 16px;");
    });
})



/* BD/ED joint api */
window.EDApi = window.BdApi = class EDApi {
    static get React() { return this.findModuleByProps('createElement'); }
    static get ReactDOM() { return this.findModuleByProps('findDOMNode'); }

    static escapeID(id) {
        return id.replace(/^[^a-z]+|[^\w-]+/gi, "");
    }

    static injectCSS(id, css) {
        const style = document.createElement("style");
		style.id = this.escapeID(id);
		style.innerHTML = css;
		document.head.append(style);
    }

    static clearCSS(id) {
		const element = document.getElementById(this.escapeID(id));
		if (element) element.remove();
    }

    static linkJS(id, url) {
        return new Promise(resolve => {
			const script = document.createElement("script");
			script.id = this.escapeID(id);
			script.src = url;
			script.type = "text/javascript";
			script.onload = resolve;
			document.head.append(script);
		});
    }

    static unlinkJS(id) {
        const element = document.getElementById(this.escapeID(id));
		if (element) element.remove();
    }

    static getPlugin(name) {
        const plugin = Object.values(ED.plugins).find(p => p.name == name);
        if (!plugin) return null;
        return plugin.bdplugin ? plugin.bdplugin : plugin;
    }

    static alert(title, body) {
        const ModalStack = this.findModuleByProps("push", "update", "pop", "popWithKey");
        const AlertModal = this.findModule(m => m.prototype && m.prototype.handleCancel && m.prototype.handleSubmit && m.prototype.handleMinorConfirm);
        if (!ModalStack || !AlertModal) return window.alert(body);
        ModalStack.push(function(props) {
            return EDApi.React.createElement(AlertModal, Object.assign({title, body}, props));
        });
    }

    static loadPluginSettings(pluginName) {
        const pl = ED.plugins[pluginName];
        if (!pl) return null;

        if (!ED.config[pluginName]) {
            this.savePluginSettings(pluginName, pl.defaultSettings || {enabled: !pl.disabledByDefault});
        }
        return ED.config[pluginName];
    }

    static savePluginSettings(pluginName, data) {
        const pl = ED.plugins[pluginName];
        if (!pl) return null;
        ED.config[pluginName] = data;
        ED.config = ED.config;
    }

    static loadData(pluginName, key) {
        if (!ED.plugins[pluginName]) return null;
        return this.loadPluginSettings(pluginName)[key];
    }

    static saveData(pluginName, key, data) {
        const obj = this.loadPluginSettings(pluginName);
        obj[key] = data;
        return this.savePluginSettings(pluginName, obj);
    }

    static getData(pluginName, key) {
        return this.loadData(pluginName, key);
    }

    static setData(pluginName, key, data) {
        this.saveData(pluginName, key, data);
    }

    static getInternalInstance(node) {
        if (!(node instanceof window.jQuery) && !(node instanceof Element)) return undefined;
        if (node instanceof window.jQuery) node = node[0];
        return node[Object.keys(node).find(k => k.startsWith("__reactInternalInstance"))];
    }

    static showToast(content, options = {}) {
        if (!document.querySelector(".toasts")) {
            const toastWrapper = document.createElement("div");
            toastWrapper.classList.add("toasts");
            const boundingElement = document.querySelector(".chat-3bRxxu form, #friends, .noChannel-Z1DQK7, .activityFeed-28jde9");
            toastWrapper.style.setProperty("left", boundingElement ? boundingElement.getBoundingClientRect().left + "px" : "0px");
            toastWrapper.style.setProperty("width", boundingElement ? boundingElement.offsetWidth + "px" : "100%");
            toastWrapper.style.setProperty("bottom", (document.querySelector(".chat-3bRxxu form") ? document.querySelector(".chat-3bRxxu form").offsetHeight : 80) + "px");
            document.querySelector("." + this.findModule('app').app).appendChild(toastWrapper);
        }
        const {type = "", icon = true, timeout = 3000} = options;
        const toastElem = document.createElement("div");
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
        const moduleName = typeof filter === 'string' ? filter : null;
        for (const i in window.req.c) {
            if (window.req.c.hasOwnProperty(i)) {
                const m = window.req.c[i].exports;
                if (m && m.__esModule && m.default && (moduleName ? m.default[moduleName] : filter(m.default))) return m.default;
                if (m && (moduleName ? m[moduleName] : filter(m)))	return m;
            }
        }
        if (!silent) c.warn(`Could not find module ${module}.`, {name: 'Modules', color: 'black'})
        return null;
    }

    static findRawModule(filter, silent = true) {
        const moduleName = typeof filter === 'string' ? filter : null;
        for (const i in window.req.c) {
            if (window.req.c.hasOwnProperty(i)) {
                const m = window.req.c[i].exports;
                if (m && m.__esModule && m.default && (moduleName ? m.default[moduleName] : filter(m.default)))
                    return window.req.c[i];
                if (m && (moduleName ? m[moduleName] : filter(m)))
                    return window.req.c[i];
            }
        }
        if (!silent) c.warn(`Could not find module ${module}.`, {name: 'Modules', color: 'black'})
        return null;
    }

    static findAllModules(filter) {
        const moduleName = typeof filter === 'string' ? filter : null;
        const modules = [];
        for (const i in window.req.c) {
            if (window.req.c.hasOwnProperty(i)) {
                const m = window.req.c[i].exports;
                if (m && m.__esModule && m.default && (moduleName ? m.default[moduleName] : filter(m.default))) modules.push(m.default);
                else if (m && (moduleName ? m[moduleName] : filter(m))) modules.push(m);
            }
        }
        return modules;
    }

    static findModuleByProps(...props) {
        return this.findModule(module => props.every(prop => module[prop] !== undefined));
    }

    static findModuleByDisplayName(name) {
        return this.findModule(module => module.displayName === name);
    }

    static monkeyPatch(what, methodName, options) {
        if (typeof options === 'function') {
            const newOptions = {instead: options, silent: true};
            options = newOptions;
        }
        const {before, after, instead, once = false, silent = false, force = false} = options;
        const displayName = options.displayName || what.displayName || what.name || what.constructor ? (what.constructor.displayName || what.constructor.name) : null;
        if (!silent) console.log(`%c[EnhancedDiscord] %c[Modules]`, 'color: red;', `color: black;`, `Patched ${methodName} in module ${displayName || '<unknown>'}:`, what); // eslint-disable-line no-console
        if (!what[methodName]) {
            if (force) what[methodName] = function() {};
            else return console.warn(`%c[EnhancedDiscord] %c[Modules]`, 'color: red;', `color: black;`, `Method ${methodName} doesn't exist in module ${displayName || '<unknown>'}`, what); // eslint-disable-line no-console
        }
        const origMethod = what[methodName];
        const cancel = () => {
            if (!silent) console.log(`%c[EnhancedDiscord] %c[Modules]`, 'color: red;', `color: black;`, `Unpatched ${methodName} in module ${displayName || '<unknown>'}:`, what); // eslint-disable-line no-console
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
        what[methodName].unpatch = cancel;
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
        for (const val in values) {
            string = string.replace(new RegExp(`\\{\\{${val}\\}\\}`, 'g'), values[val]);
        }
        return string;
    }

	static isPluginEnabled(name) {
		const plugins = Object.values(ED.plugins);
		const plugin = plugins.find(p => p.id == name || p.name == name);
		if (!plugin) return false;
		return !(plugin.settings.enabled === false);
	}

	static isThemeEnabled() {
		return false;
	}

	static isSettingEnabled(id) {
		return ED.config[id];
	}
};
