const path = require('path');
const fs = require('fs');
const Module = require('module').Module;
const originalRequire = Module._extensions['.js'];
const EDPlugin = require('./plugin');

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
            window.EDApi.injectCSS('BDManager', text);
        })

        Module._extensions['.js'] = this.pluginRequire();
    }

    static destroy() {
        window.EDApi.clearCSS('BDManager');
        this.observer.disconnect();
        this.currentWindow.webContents.removeEventListener('did-navigate-in-page', BDManager.onSwitch);
        this.jqueryElement.remove();
        Module._extensions['.js'] = originalRequire;
    }

    static onSwitch() {
        BDManager.fireEvent('onSwitch');
    }

    static extractMeta(content) {
        const meta = content.split('\n')[0];
        const rawMeta = meta.substring(meta.lastIndexOf('//META') + 6, meta.lastIndexOf('*//'));
        if (meta.indexOf('META') < 0) throw new Error('META was not found.');
        if (!window.EDApi.testJSON(rawMeta)) throw new Error('META could not be parsed.');

        const parsed = JSON.parse(rawMeta);
        if (!parsed.name) throw new Error('META missing name data.');
        return parsed;
    }

    static pluginRequire() {
        return function(moduleWrap, filename) {
            if (!filename.endsWith('.plugin.js') || path.dirname(filename) !== path.resolve(process.env.injDir, 'plugins')) return Reflect.apply(originalRequire, this, arguments);
            let content = fs.readFileSync(filename, 'utf8');
            if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1); // Strip BOM
            const meta = BDManager.extractMeta(content);
            meta.filename = path.basename(filename);
            content += `\nmodule.exports = ${meta.name};`;
            moduleWrap._compile(content, filename);
            moduleWrap.exports = BDManager.convertPlugin(new moduleWrap.exports());
        };
    }

    static fireEvent(event, ...args) {
        const plugins = Object.values(window.ED.plugins);
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
            load: function() {plugin.start();},
            unload: function() {plugin.stop();},
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
        if (typeof plugin.getSettingsPanel == 'function') newPlugin.getSettingsPanel = function() {return plugin.getSettingsPanel();};
        if (typeof plugin.onSwitch == 'function') newPlugin.onSwitch = function() {return plugin.onSwitch();};
        if (typeof plugin.observer == 'function') newPlugin.observer = function(e) {return plugin.observer(e);};
        return newPlugin;
    }

    static defineGlobals() {
        window.bdConfig = {dataPath: process.env.injDir};
        window.bdplugins = window.bdthemes = window.pluginCookie = window.themeCookie = window.settingsCookie = {};
        window.bdpluginErrors = window.bdthemeErrors = [];

        window.bdPluginStorage = {get: window.EDApi.getData, set: window.EDApi.setData};
        window.Utils = {monkeyPatch: window.EDApi.monkeyPatch, suppressErrors: window.EDApi.suppressErrors, escapeID: window.EDApi.escapeID};

        window.BDV2 = class V2 {
            static get WebpackModules() {return {find: window.EDApi.findModule, findAll: window.EDApi.findAllModules, findByUniqueProperties: window.EDApi.findModuleByProps, findByDisplayName: window.EDApi.findModuleByDisplayName};}
            static getInternalInstance(node) {return window.EDApi.getInternalInstance(node);}
            static get react() {return window.EDApi.React;}
            static get reactDom() {return window.EDApi.ReactDOM;}
        };
    }

    static showSettingsModal(plugin) {
        const baseModalClasses = window.EDApi.findModule(m => m.modal && m.inner && !m.sizeMedium) || {modal: "modal-36zFtW", inner: "inner-2VEzy9"};
        const modalClasses = window.EDApi.findModuleByProps("sizeMedium") || {modal: "backdrop-1wrmKb", sizeMedium: "sizeMedium-ctncE5", content: "content-2KoCOZ", header: "header-2nhbou", footer: "footer-30ewN8", close: "close-hhyjWJ", inner: "inner-2Z5QZX"};
        const backdrop = window.EDApi.findModuleByProps("backdrop") || {backdrop: "backdrop-1wrmKb"};
        const modalHTML = `<div id="bd-settingspane-container" class="theme-dark">
                <div class="backdrop ${backdrop.backdrop}" style="background-color: rgb(0, 0, 0); opacity: 0.85;"></div>
                <div class="modal ${baseModalClasses.modal}" style="opacity: 1;">
                    <div class="${baseModalClasses.inner}">
                        <div class="${modalClasses.modal} ${modalClasses.sizeMedium}" style="overflow: hidden;">
                            <div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6 ${modalClasses.header}">
                                <h4 class="title h4-AQvcAz title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh4-2vWMG5 marginReset-236NPn">{{modalTitle}}</h4>
                                <svg viewBox="0 0 12 12" name="Close" width="18" height="18" class="close-button ${modalClasses.close} flexChild-faoVW3"><g fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg>
                            </div>
                            <div class="scrollerWrap-2lJEkd scrollerThemed-2oenus themeGhostHairline-DBD-2d ${modalClasses.content}">
                                <div id="{{id}}" class="scroller-2FKFPG ${modalClasses.inner} selectable plugin-settings" data-no-focus-lock="true">

                                </div>
                            </div>
                            <div class="flex-1xMQg5 flex-1O1GKY horizontalReverse-2eTKWD horizontalReverse-3tRjY7 flex-1O1GKY directionRowReverse-m8IjIq justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 ${modalClasses.footer}" style="flex: 0 0 auto;"><button type="button" class="done-button button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN"><div class="contents-18-Yxp">Done</div></button></div>
                        </div>
                    </div>
                </div>
            </div>`;

        const panel = plugin.getSettingsPanel();
        if (!panel) return;
        const modal = window.$(window.EDApi.formatString(modalHTML, {modalTitle: `${plugin.name} Settings`, id: `plugin-settings-${plugin.name}`}));
        if (typeof panel == 'string') modal.find('.plugin-settings').html(panel);
        else modal.find('.plugin-settings').append(panel);
        modal.find('.backdrop, .close-button, .done-button').on('click', () => {
            modal.addClass('closing');
			setTimeout(() => { modal.remove(); }, 300);
        });
        modal.appendTo('#app-mount');
    }
};
