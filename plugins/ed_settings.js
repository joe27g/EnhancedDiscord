const Plugin = require('../plugin');

function makePluginToggle(opts = {}) {
    const a = window.ED.classMaps.alignment;
    const sw = window.ED.classMaps.switchItem;
    const cb = window.ED.classMaps.checkbox;
    const b = window.ED.classMaps.buttons;
    const d = window.ED.classMaps.description;

    return `<div id="${opts.id}-wrap" class="${a.vertical} ${a.justifyStart} ${a.alignStretch} ${a.noWrap} ${sw.switchItem}" style="flex: 1 1 auto;"><div class="${a.horizontal} ${a.justifyStart} ${a.alignStart} ${a.noWrap}" style="flex: 1 1 auto;"><h3 class="${sw.titleDefault}" style="flex: 1 1 auto;">${opts.title}</h3>${opts.color ? ` <div class="status" style="background-color:${opts.color}; box-shadow:0 0 5px 2px ${opts.color};margin-left: 5px; border-radius: 50%; height: 10px; width: 10px; position: relative; top: 6px; margin-right: 8px;"></div>` : ''}${opts.id == 'silentTyping' || opts.id == 'antiTrack' ? '' : `<button type="button" class="${b.button} ${b.lookFilled} ${b.colorBrand} ed-plugin-reload" style="height:24px;margin-right:10px;"><div class="${b.contents}">Reload</div></button>`}<div id="${opts.id}" class="${cb.switchEnabled} ${cb.valueUnchecked} ${cb.sizeDefault} ${cb.themeDefault}"><input type="checkbox" class="${cb.checkboxEnabled}" value="on"></div></div><div class="${d.description} ${d.modeDefault}" style="flex: 1 1 auto;">${opts.desc ? opts.desc : '<i>No Description Provided</i<'}</div><div class="${ED.classMaps.divider} ${sw.dividerDefault}"></div></div>`;
}

module.exports = new Plugin({
    name: 'ED Settings',
    author: 'Joe 🎸#7070',
    description: 'Adds an EnhancedDiscord tab in user settings.',
    color: 'darkred',

    load: async function() {
        let parentThis = this; //Allow use of parent methods in sub functions

        while (!findModule('getUserSettingsSections', true) || !findModule('UserSettingsSections', true))
            await this.sleep(1000);

        /*let constr = findModule('getUserSettingsSections').getUserSettingsSections()[0].element.prototype.constructor;

        monkeyPatch(findModule('getUserSettingsSections'), 'getUserSettingsSections', function () {
            let currentSections = arguments[0].callOriginalMethod(arguments[0].methodArguments);
            currentSections.push({section: "ENHANCED_DISCORD", label: "EnhancedDiscord", color: '#0000bb'});
            return currentSections;
        });

        findModule('UserSettingsSections').UserSettingsSections.ENHANCED_DISCORD = 'ENHANCED_DISCORD';*/

        // get proper this object to call with
        //let count = 0;
        if (!window.ED.classMaps) {
            window.ED.classMaps = {};
        }
        const tabsM = findModule('itemSelected');
        const contentM = ED.classMaps.headers = findModule('defaultMarginh2');
        const div = ED.classMaps.divider = findModules('divider')[1].divider;
        const swiM = ED.classMaps.switchItem = findModule('switchItem');
        const alignM = ED.classMaps.alignment = findModule('horizontalReverse');
        const cbM = ED.classMaps.checkbox = findModule('checkboxEnabled');
        const buttM = ED.classMaps.buttons = findModule('lookFilled');
        const descM = ED.classMaps.description = findModule('formText');
        const concentCol = findModule('contentColumn');
        
        // use this function to trigger the loading of the settings tabs. No MutationObservers this way :)
        monkeyPatch( findModule('getUserSettingsSections').default.prototype, 'render', function() {

            /*console.log('before:', arguments[0].thisObject);
            if (arguments[0].thisObject.state.section == 'ACCOUNT') {
                count++;
                if (count < 2) {
                    console.log('patching it | count =', count);
                    arguments[0].thisObject.state.section = 'DEVELOPER_OPTIONS'; //'ENHANCED_DISCORD';
                } else {
                    //arguments[0].thisObject.state.section = 'ACCOUNT';
                }
            }
            console.log('after:', arguments[0].thisObject.state);
            findModule('cloneElement').cloneElement(arguments[0].thisObject);*/
            //console.log('settings opened - doing tab work');

            let tab = document.getElementsByClassName('ed-settings');
            //console.log(tab);
            if (!tab || tab.length < 1) {
                let parent = document.querySelector('.' + tabsM.side);
                if (!parent)
                    return arguments[0].callOriginalMethod(arguments[0].methodArguments);
                //let anchor = parent.querySelector(`[class="${tabsM.separator}"]:nth-child(${process.platform == 'win32' ? 20 : 18})`);
                let anchor = parent.querySelectorAll(`[class="${tabsM.separator}"]`)[3];
                if (!anchor)
                    return arguments[0].callOriginalMethod(arguments[0].methodArguments);

                let header = document.createElement('div');
                header.className = tabsM.header + ' ed-settings';
                header.innerHTML = 'EnhancedDiscord';
                anchor.parentNode.insertBefore(header, anchor.nextSibling);

                let pluginsTab = document.createElement('div');
                pluginsTab.className = tabsM.itemDefault + ' ed-settings';
                pluginsTab.innerHTML = 'Plugins';
                header.parentNode.insertBefore(pluginsTab, header.nextSibling);

                let settingsTab = document.createElement('div');
                settingsTab.className = tabsM.itemDefault + ' ed-settings';
                settingsTab.innerHTML = 'Settings';
                pluginsTab.parentNode.insertBefore(settingsTab, pluginsTab.nextSibling);

                let sep = document.createElement('div');
                sep.className = tabsM.separator;
                settingsTab.parentNode.insertBefore(sep, settingsTab.nextSibling);

                parent.onclick = function(e) {
                    if (!e.target.className || e.target.className.indexOf(tabsM.itemDefault) == -1) return;
                    console.log(e.target);

                    for (let i in tab) {
                        tab[i].className = (tab[i].className || '')
                            //.replace(tabsM.selected, tabsM.notSelected)
                            .replace(tabsM.itemSelected, tabsM.itemDefault)
                    };
                }

                //let settingsPane = document.querySelector('.ui-standard-sidebar-view .content-column > div');

                pluginsTab.onclick = function(e) {
                    let settingsPane = document.querySelector(`.${concentCol.standardSidebarView} .${concentCol.contentColumn} > div`);
                    let otherTab = document.querySelector('.' + tabsM.item + '.' + tabsM.selected);
                    if (otherTab) {
                        otherTab.className = otherTab.className.replace(tabsM.itemSelected, tabsM.itemDefault);
                    }
                    //console.log(otherTab);
                    this.className = this.className.replace(tabsM.itemDefault, tabsM.itemSelected);

                    if (settingsPane) {
                        settingsPane.innerHTML = `<h2 class="${contentM.h2} ${contentM.defaultColor}">EnhancedDiscord Plugins</h2><div class="${div} ${contentM.marginBottom20}"></div>`;
                        for (let id in window.ED.plugins) {
                            //if (id == 'ed_settings') continue;

                            settingsPane.innerHTML += makePluginToggle({id, title: window.ED.plugins[id].name, desc: window.ED.plugins[id].description, color: window.ED.plugins[id].color || 'orange'});
                            if (!window.ED.plugins[id].settings || window.ED.plugins[id].settings.enabled !== false) {
                                let cb = document.getElementById(id);
                                if (cb && cb.className)
                                    cb.className = cb.className.replace(cbM.valueUnchecked, cbM.valueChecked);
                            }
                        }
                    }
                    e.stopPropagation(); // prevent from going to parent click handler
                }

                settingsTab.onclick = function(e) {
                    let settingsPane = document.querySelector(`.${concentCol.standardSidebarView} .${concentCol.contentColumn} > div`);
                    let otherTab = document.querySelector('.' + tabsM.item + '.' + tabsM.selected);
                    if (otherTab) {
                        otherTab.className = otherTab.className.replace(tabsM.itemSelected, tabsM.itemDefault);
                    }
                    //console.log(otherTab);
                    this.className = this.className.replace(tabsM.itemDefault, tabsM.itemSelected);

                    if (settingsPane) {
                        settingsPane.innerHTML = `<h2 class="${contentM.h2} ${contentM.defaultColor}">EnhancedDiscord Configuration</h2><div class="${div} ${contentM.marginBottom20}"></div>`;
                        settingsPane.innerHTML += makePluginToggle({id: 'silentTyping', title: 'Silent Typing', desc: "Never appear as typing in any channel."});
                        settingsPane.innerHTML += makePluginToggle({id: 'antiTrack', title: 'Anti-Track', desc: 'Prevent Discord from sending "tracking" data that they may be selling to advertisers or otherwise sharing.'});

                        let st = document.getElementById('silentTyping');
                        if (st && window.ED.config.silentTyping == true)
                            st.className = st.className.replace(cbM.valueUnchecked, cbM.valueChecked);
                        let at = document.getElementById('antiTrack');
                        if (at && window.ED.config.antiTrack !== false)
                            at.className = at.className.replace(cbM.valueUnchecked, cbM.valueChecked);
                        //console.log(st, at);
                        for (let id in window.ED.plugins) {
                            if (!window.ED.plugins[id].config || !window.ED.plugins[id].generateSettings) continue;

                            settingsPane.innerHTML += `<h2 class="${contentM.h2} ${contentM.defaultColor}">${window.ED.plugins[id].name}</h2>`;

                            settingsPane.innerHTML += window.ED.plugins[id].generateSettings();

                            settingsPane.innerHTML += `<div class="${div}"></div>`;
                            if (window.ED.plugins[id].settingListeners) {
                                setTimeout(() => { // let shit render
                                        for(let eventObject in window.ED.plugins[id].settingListeners){
                                            let currentSettingListener = window.ED.plugins[id].settingListeners[eventObject];
                                            //Check if plugin is using the old format

                                            if(Array.isArray(window.ED.plugins[id].settingListeners)){
                                                let elem = settingsPane.querySelector(currentSettingListener.el);
                                                if (elem)
                                                    elem.addEventListener(currentSettingListener.type, currentSettingListener.eHandler);
                                            } else {
                                                let elem = settingsPane.querySelector(eventObject);
                                                if (elem){
                                                    parentThis.warn(`Plugin ${window.ED.plugins[id].name} is using a deprecated plugin format (New format: https://github.com/joe27g/EnhancedDiscord/blob/beta/plugins.md#advanced-plugin-functionality). Ignore this unless you're the plugin dev`)
                                                    elem.onclick = window.ED.plugins[id].settingListeners[eventObject];
                                                }
                                            }
                                        }
                                }, 5);
                            }
                        }
                    }
                    e.stopPropagation(); // prevent from going to parent click handler
                }

                document.querySelector(`.${concentCol.standardSidebarView} .${concentCol.contentColumn}`).onclick = function(e) {
                    let parent = e.target.parentElement;

                    if (e.target.className && (e.target.className === buttM.contents || e.target.className.indexOf('ed-plugin-reload') > -1)) {
                        let button = e.target.className === buttM.contents ? e.target : e.target.firstElementChild;
                        let plugin = e.target.className === buttM.contents ? e.target.parentElement.nextElementSibling : e.target.nextElementSibling;
                        //console.log(plugin);
                        if (!plugin || !plugin.id || !window.ED.plugins[plugin.id] || plugin.className.indexOf(cbM.valueChecked) == -1) return;
                        button.innerHTML = 'Reloading...';
                        window.ED.plugins[plugin.id].unload();
                        try {
                            delete require.cache[require.resolve(`./${plugin.id}`)];
                            let newPlugin = require(`./${plugin.id}`);
                            window.ED.plugins[plugin.id] = newPlugin;
                            button.innerHTML = 'Reloaded!';
                        } catch(err) {
                            console.error(err);
                            button.innerHTML = `Failed to reload (${err.name} - see console.)`;
                        }
                        window.ED.plugins[plugin.id].load();
                        setTimeout(() => {
                            try { button.innerHTML = 'Reload'; } catch(err){}
                        }, 3000);
                        return;
                    }

                    if (e.target.tagName !== 'INPUT' || e.target.type !== 'checkbox' || !parent || !parent.className || !parent.id) return;
                    let p = window.ED.plugins[parent.id];
                    if (!p && parent.id !== 'silentTyping' && parent.id !== 'antiTrack') return;
                    //console.log('settings for '+p.id, p.settings);

                    if (parent.className.indexOf(cbM.valueChecked) > -1) {
                        if (p) {
                            if (p.settings.enabled === false) return;

                            p.settings.enabled = false;
                            window.ED.plugins[parent.id].settings = p.settings;
                            p.unload();
                        }
                        else {
                            let edc = window.ED.config;
                            if (edc[parent.id] === false || (parent.id == 'silentTyping' && edc[parent.id] === undefined)) return;
                            edc[parent.id] = false;
                            window.ED.config = edc;
                            let mod = parent.id == 'antiTrack' ? 'track' : 'sendTyping';
                            //console.log(parent);
                            if (findModule(mod, true) && findModule(mod, true)[mod] && findModule(mod, true)[mod].__monkeyPatched)
                                findModule(mod)[mod].unpatch();
                        }
                        parent.className = parent.className.replace(cbM.valueChecked, cbM.valueUnchecked);
                    } else {
                        if (p) {
                            if (p.settings.enabled !== false) return;

                            p.settings.enabled = true;
                            window.ED.plugins[parent.id].settings = p.settings;
                            p.load();
                        }
                        else {
                            let edc = window.ED.config;
                            if (edc[parent.id] === true || (parent.id == 'antiTrack' && edc[parent.id] === undefined)) return;
                            edc[parent.id] = true;
                            window.ED.config = edc;
                            let mod = parent.id == 'antiTrack' ? 'track' : 'sendTyping';
                            //console.log(parent);
                            monkeyPatch(findModule(mod), mod, () => {});
                        }
                        parent.className = parent.className.replace(cbM.valueUnchecked, cbM.valueChecked);
                    }
                }
            }
            return arguments[0].callOriginalMethod(arguments[0].methodArguments);
        })
    },

    unload: function() {
        findModule('getUserSettingsSections').default.prototype.render.unpatch();
    }
});
