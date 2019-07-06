const path = require('path');
const fs = require('fs');
const Module = require('module').Module;
const originalRequire = Module._extensions['.js'];
const EDPlugin = require('./plugin');

const css = `#bd-settingspane-container h2.ui-form-title {
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
    text-transform: uppercase;
    display: inline-block;
    margin-bottom: 20px;
}
#bd-settingspane-container h2.ui-form-title {
    color: #f6f6f7;
}
.theme-light #bd-settingspane-container h2.ui-form-title {
    color: #4f545c;
}

#bd-settingspane-container .ui-switch-item {
    flex-direction: column;
    margin-top: 8px;
}

#bd-settingspane-container .ui-switch-item h3 {
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    flex: 1;
}
#bd-settingspane-container .ui-switch-item h3 {
    color: #f6f6f7;
}
.theme-light #bd-settingspane-container .ui-switch-item h3 {
    color: #4f545c;
}

#bd-settingspane-container .ui-switch-item .style-description {
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    margin-bottom: 10px;
	padding-bottom: 10px;
	border-bottom: 1px solid hsla(218,5%,47%,.3);
}
#bd-settingspane-container .ui-switch-item .style-description {
    color: #72767d;
}
.theme-light #bd-settingspane-container .ui-switch-item .style-description {
    color: rgba(114,118,125,.6);
}

#bd-settingspane-container .ui-switch-item .ui-switch-wrapper {
	-webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    position: relative;
    width: 44px;
    height: 24px;
    display: block;
    flex: 0 0 auto;
}

#bd-settingspane-container .ui-switch-item .ui-switch-wrapper input {
	position: absolute;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
    z-index: 1;
}

#bd-settingspane-container .ui-switch-item .ui-switch-wrapper .ui-switch {
	background: #7289da;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: #72767d;
    border-radius: 14px;
    transition: background .15s ease-in-out,box-shadow .15s ease-in-out,border .15s ease-in-out;
}

#bd-settingspane-container .ui-switch-item .ui-switch-wrapper .ui-switch:before {
	content: '';
    display: block;
    width: 18px;
    height: 18px;
    position: absolute;
    top: 3px;
    left: 3px;
    bottom: 3px;
    background: #f6f6f7;
    border-radius: 10px;
    transition: all .15s ease;
    box-shadow: 0 3px 1px 0 rgba(0,0,0,.05),0 2px 2px 0 rgba(0,0,0,.1),0 3px 3px 0 rgba(0,0,0,.05);
}

#bd-settingspane-container .ui-switch-item .ui-switch-wrapper .ui-switch.checked {
	background: #7289da;
}

#bd-settingspane-container .ui-switch-item .ui-switch-wrapper .ui-switch.checked:before {
	transform: translateX(20px);
}

#bd-settingspane-container .plugin-settings {
    padding: 0 12px 12px 20px;
}

@keyframes bd-modal-backdrop {
    to { opacity: 0.85; }
}

@keyframes bd-modal-anim {
    to { transform: scale(1); opacity: 1; }
}

@keyframes bd-modal-backdrop-closing {
    to { opacity: 0; }
}

@keyframes bd-modal-closing {
    to { transform: scale(0.7); opacity: 0; }
}

#bd-settingspane-container .backdrop {
    animation: bd-modal-backdrop 250ms ease;
    animation-fill-mode: forwards;
    background-color: rgb(0, 0, 0);
    transform: translateZ(0px);
}

#bd-settingspane-container.closing .backdrop {
    animation: bd-modal-backdrop-closing 200ms linear;
    animation-fill-mode: forwards;
    animation-delay: 50ms;
    opacity: 0.85;
}

#bd-settingspane-container.closing .modal {
    animation: bd-modal-closing 250ms cubic-bezier(0.19, 1, 0.22, 1);
    animation-fill-mode: forwards;
    opacity: 1;
    transform: scale(1);
}

#bd-settingspane-container .modal {
    animation: bd-modal-anim 250ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
    animation-fill-mode: forwards;
    transform: scale(0.7);
    transform-origin: 50% 50%;
}
/* Toast CSS */

.toasts {
  position: fixed;
  display: flex;
  top: 0;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  pointer-events: none;
  z-index: 4000;
}

@keyframes toast-up {
  from {
      transform: translateY(0);
      opacity: 0;
  }
}

.toast {
  animation: toast-up 300ms ease;
  transform: translateY(-10px);
  background: #36393F;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 0 1px rgba(32,34,37,.6), 0 2px 10px 0 rgba(0,0,0,.2);
  font-weight: 500;
  color: #fff;
  user-select: text;
  font-size: 14px;
  opacity: 1;
  margin-top: 10px;
  pointer-events: none;
  user-select: none;
}

@keyframes toast-down {
  to {
      transform: translateY(0px);
      opacity: 0;
  }
}

.toast.closing {
  animation: toast-down 200ms ease;
  animation-fill-mode: forwards;
  opacity: 1;
  transform: translateY(-10px);
}


.toast.icon {
  padding-left: 30px;
  background-size: 20px 20px;
  background-repeat: no-repeat;
  background-position: 6px 50%;
}

.toast.toast-info {
  background-color: #4a90e2;
}

.toast.toast-info.icon {
  background-image: url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPiAgICA8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMSAxNWgtMnYtNmgydjZ6bTAtOGgtMlY3aDJ2MnoiLz48L3N2Zz4=);
}

.toast.toast-success {
  background-color: #43b581;
}

.toast.toast-success.icon {
  background-image: url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPiAgICA8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTIgMTVsLTUtNSAxLjQxLTEuNDFMMTAgMTQuMTdsNy41OS03LjU5TDE5IDhsLTkgOXoiLz48L3N2Zz4=);
}
.toast.toast-danger,
.toast.toast-error {
  background-color: #f04747;
}

.toast.toast-danger.icon,
.toast.toast-error.icon {
  background-image: url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTEyIDJDNi40NyAyIDIgNi40NyAyIDEyczQuNDcgMTAgMTAgMTAgMTAtNC40NyAxMC0xMFMxNy41MyAyIDEyIDJ6bTUgMTMuNTlMMTUuNTkgMTcgMTIgMTMuNDEgOC40MSAxNyA3IDE1LjU5IDEwLjU5IDEyIDcgOC40MSA4LjQxIDcgMTIgMTAuNTkgMTUuNTkgNyAxNyA4LjQxIDEzLjQxIDEyIDE3IDE1LjU5eiIvPiAgICA8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+PC9zdmc+);
}

.toast.toast-warning,
.toast.toast-warn {
  background-color: #FFA600;
  color: white;
}

.toast.toast-warning.icon,
.toast.toast-warn.icon {
  background-image: url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPiAgICA8cGF0aCBkPSJNMSAyMWgyMkwxMiAyIDEgMjF6bTEyLTNoLTJ2LTJoMnYyem0wLTRoLTJ2LTRoMnY0eiIvPjwvc3ZnPg==);
}`;

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

        EDApi.injectCSS('BDManager', css);

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
        const meta = content.split('\n')[0];
        const rawMeta = meta.substring(meta.lastIndexOf('//META') + 6, meta.lastIndexOf('*//'));
        if (meta.indexOf('META') < 0) throw new Error('META was not found.');
        if (!EDApi.testJSON(rawMeta)) throw new Error('META could not be parsed.');

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

        window.bdPluginStorage = {get: EDApi.getData, set: EDApi.setData};
        window.Utils = {monkeyPatch: EDApi.monkeyPatch, suppressErrors: EDApi.suppressErrors, escapeID: EDApi.escapeID};

        window.BDV2 = class V2 {
            static get WebpackModules() {return {find: EDApi.findModule, findAll: EDApi.findAllModules, findByUniqueProperties: EDApi.findModuleByProps, findByDisplayName: EDApi.findModuleByDisplayName};}
            static getInternalInstance(node) {return EDApi.getInternalInstance(node);}
            static get react() {return EDApi.React;}
            static get reactDom() {return EDApi.ReactDOM;}
        };
    }

    static showSettingsModal(plugin) {
        const baseModalClasses = EDApi.findModule(m => m.modal && m.inner && !m.sizeMedium) || {modal: "modal-36zFtW", inner: "inner-2VEzy9"};
        const modalClasses = EDApi.findModuleByProps("sizeMedium") || {modal: "backdrop-1wrmKb", sizeMedium: "sizeMedium-ctncE5", content: "content-2KoCOZ", header: "header-2nhbou", footer: "footer-30ewN8", close: "close-hhyjWJ", inner: "inner-2Z5QZX"};
        const backdrop = EDApi.findModuleByProps("backdrop") || {backdrop: "backdrop-1wrmKb"};
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
        let modal = $(EDApi.formatString(modalHTML, {modalTitle: `${plugin.name} Settings`, id: `plugin-settings-${plugin.name}`}));
        if (typeof panel == 'string') modal.find('.plugin-settings').html(panel);
        else modal.find('.plugin-settings').append(panel);
        modal.find('.backdrop, .close-button, .done-button').on('click', () => {
            modal.addClass('closing');
			setTimeout(() => { modal.remove(); }, 300);
        });
        modal.appendTo('#app-mount');
    }
};
