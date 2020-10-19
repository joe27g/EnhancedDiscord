const path = require('path');
const fs = require('fs');
const Module = require('module').Module;
const originalRequire = Module._extensions['.js'];
const EDPlugin = require('./plugin');

const splitRegex = /[^\S\r\n]*?(?:\r\n|\n)[^\S\r\n]*?\*[^\S\r\n]?/;
const escapedAtRegex = /^\\@/;
module.exports = class BDManager {

    static async setup(currentWindow) {
        this.currentWindow = currentWindow;
        this.defineGlobals();
        this.jqueryElement = document.createElement('script');
        this.jqueryElement.src = `//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js`;
        await new Promise(resolve => {
            this.jqueryElement.onload = resolve;
            document.head.appendChild(this.jqueryElement);
        });

        this.observer = new MutationObserver((mutations) => {
            for (let i = 0, mlen = mutations.length; i < mlen; i++) this.fireEvent('observer', mutations[i]);
        });
        this.observer.observe(document, {childList: true, subtree: true});

        this.currentWindow.webContents.on('did-navigate-in-page', BDManager.onSwitch);

        fs.readFile(path.join(process.env.injDir, 'bd.css'), (err, text) => {
            if (err) return console.error(err);
            EDApi.injectCSS('BDManager', text);
        });

        Module._extensions['.js'] = this.pluginRequire();
    }

    static destroy() {
        EDApi.clearCSS('BDManager');
        this.observer.disconnect();
        this.currentWindow.webContents.removeEventListener('did-navigate-in-page', BDManager.onSwitch);
        this.jqueryElement.remove();
        Module._extensions['.js'] = originalRequire;
    }

    static onSwitch() {
        BDManager.fireEvent('onSwitch');
    }

    static extractMeta(content) {
        const firstLine = content.split('\n')[0];
        const hasOldMeta = firstLine.includes('//META');
        if (hasOldMeta) return BDManager.parseOldMeta(content);
        const hasNewMeta = firstLine.includes('/**');
        if (hasNewMeta) return BDManager.parseNewMeta(content);
        throw new Error('META was not found.');
    }

    static parseOldMeta(content) {
        const meta = content.split('\n')[0];
        const rawMeta = meta.substring(meta.lastIndexOf('//META') + 6, meta.lastIndexOf('*//'));
        if (meta.indexOf('META') < 0) throw new Error('META was not found.');
        const parsed = EDApi.testJSON(rawMeta);
        if (!parsed) throw new Error('META could not be parsed.');
        if (!parsed.name) throw new Error('META missing name data.');
        parsed.format = 'json';
        return parsed;
    }

    static parseNewMeta(content) {
        const block = content.split('/**', 2)[1].split('*/', 1)[0];
        const out = {};
        let field = '';
        let accum = '';
        for (const line of block.split(splitRegex)) {
            if (line.length === 0) continue;
            if (line.charAt(0) === '@' && line.charAt(1) !== ' ') {
                out[field] = accum;
                const l = line.indexOf(' ');
                field = line.substr(1, l - 1);
                accum = line.substr(l + 1);
            }
            else {
                accum += ' ' + line.replace('\\n', '\n').replace(escapedAtRegex, '@');
            }
        }
        out[field] = accum.trim();
        delete out[''];
        out.format = 'jsdoc';
        return out;
    }

    static isEmpty(obj) {
        if (obj == null || obj == undefined || obj == '') return true;
        if (typeof(obj) !== 'object') return false;
        if (Array.isArray(obj)) return obj.length == 0;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) return false;
        }
        return true;
    }

    static pluginRequire() {
        return function(moduleWrap, filename) {
            if (!filename.endsWith('.plugin.js') || path.dirname(filename) !== path.resolve(process.env.injDir, 'plugins')) return Reflect.apply(originalRequire, this, arguments);
            let content = fs.readFileSync(filename, 'utf8');
            if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1); // Strip BOM
            const meta = BDManager.extractMeta(content);
            meta.filename = path.basename(filename);

            moduleWrap._compile(content, filename);
            const noExport = BDManager.isEmpty(moduleWrap.exports);
            if (noExport) {
                content += `\nmodule.exports = ${meta.name};`;
                moduleWrap._compile(content, filename);
            }
            if (moduleWrap.exports.default) moduleWrap.exports = moduleWrap.exports.default;
            moduleWrap.exports = BDManager.convertPlugin(new moduleWrap.exports());
        };
    }

    static fireEvent(event, ...args) {
        const plugins = Object.values(ED.plugins);
        for (let p = 0; p < plugins.length; p++) {
            const plugin = plugins[p];
            if (!plugin[event] || typeof plugin[event] !== 'function') continue;
            try { plugin[event](...args); }
            catch (error) { throw new Error(`Could not fire ${event} for plugin ${plugin.name}.`); }
        }
    }

    static convertPlugin(plugin) {
        const newPlugin = new EDPlugin({
            name: plugin.getName(),
            load: function() {
				if (plugin.load) plugin.load();
				plugin.start();
			},
            unload: function() {plugin.stop();},
            config: {},
            bdplugin: plugin
        });
        Object.defineProperties(newPlugin, {
            name: {
                enumerable: true, configurable: true,
                get() {return plugin.getName();}
            },
            author: {
                enumerable: true, configurable: true,
                get() {return plugin.getAuthor();}
            },
            description: {
                enumerable: true, configurable: true,
                get() {return plugin.getDescription();}
            }
        });
        if (typeof plugin.getSettingsPanel == 'function') {
            newPlugin.settingsSectionName = plugin.getName();
            newPlugin.generateSettingsSection = function() {return plugin.getSettingsPanel();};
            newPlugin.getSettingsPanel = function() {return plugin.getSettingsPanel();};
        }
        if (typeof plugin.onSwitch == 'function') newPlugin.onSwitch = function() {return plugin.onSwitch();};
        if (typeof plugin.observer == 'function') newPlugin.observer = function(e) {return plugin.observer(e);};
        return newPlugin;
    }

    static defineGlobals() {
        window.bdConfig = {dataPath: process.env.injDir};
        window.bdplugins = window.bdthemes = window.pluginCookie = window.themeCookie = window.settingsCookie = {};
        window.bdpluginErrors = window.bdthemeErrors = [];

        window.bdPluginStorage = {get: EDApi.getData, set: EDApi.setData};
        window.Utils = {monkeyPatch: EDApi.monkeyPatch, suppressErrors: EDApi.suppressErrors, escapeID: EDApi.escapeID};

        window.BDV2 = class V2 {
            static get WebpackModules() {return {find: EDApi.findModule, findAll: EDApi.findAllModules, findByUniqueProperties: EDApi.findModuleByProps, findByDisplayName: EDApi.findModuleByDisplayName};}
            static getInternalInstance(node) {return EDApi.getInternalInstance(node);}
            static get react() {return EDApi.React;}
            static get reactDom() {return EDApi.ReactDOM;}
        };
    }
};
