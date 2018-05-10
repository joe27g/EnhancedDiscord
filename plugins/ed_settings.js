const Plugin = require('../plugin');

function makePluginToggle(opts = {}) {
    return `<div id="${opts.id}-wrap" class="flex-1xMQg5 flex-1O1GKY vertical-V37hAW flex-1O1GKY directionColumn-35P_nr justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 switchItem-2hKKKK marginBottom20-32qID7" style="flex: 1 1 auto;"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStart-H-X2h- noWrap-3jynv6" style="flex: 1 1 auto;"><h3 class="titleDefault-a8-ZSr title-31JmR4 marginReset-236NPn weightMedium-2iZe9B size16-14cGz5 height24-3XzeJx flexChild-faoVW3" style="flex: 1 1 auto;">${opts.title}${opts.color ? ` <div class="status" style="background-color:${opts.color}; box-shadow:0 0 5px 2px ${opts.color};margin-left: 5px;"></div>` : ''}</h3>${opts.id == 'silentTyping' || opts.id == 'antiTrack' ? '' : '<button type="button" class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 ed-plugin-reload" style="height:24px;margin-right:10px;"><div class="contents-18-Yxp">Reload</div></button>'}<div id="${opts.id}" class="switchEnabled-V2WDBB switch-3wwwcV valueUnchecked-2lU_20 value-2hFrkk sizeDefault-2YlOZr size-3rFEHg themeDefault-24hCdX"><input type="checkbox" class="checkboxEnabled-CtinEn checkbox-2tyjJg" value="on"></div></div><div class="description-3_Ncsb formText-3fs7AJ note-1V3kyJ marginTop4-2BNfKC modeDefault-3a2Ph1 primary-jw0I4K" style="flex: 1 1 auto;">${opts.desc}</div><div class="divider-3573oO dividerDefault-3rvLe- marginTop20-3TxNs6"></div></div>`;
}

module.exports = new Plugin({
    name: 'ED Settings',
    author: 'Joe 🎸#7070',
    description: 'Adds an EnhancedDiscord tab in user settings.',
    color: 'darkred',

    load: async function() {

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
                let parent = document.querySelector('.side-8zPYf6');
                if (!parent)
                    return arguments[0].callOriginalMethod(arguments[0].methodArguments);
                let anchor = parent.querySelector(`.separator-gCa7yv:nth-child(${process.platform == 'win32' ? 20 : 18})`);
                if (!anchor)
                    return arguments[0].callOriginalMethod(arguments[0].methodArguments);

                let header = document.createElement('div');
                header.className = 'header-2RyJ0Y ed-settings';
                header.innerHTML = 'EnhancedDiscord';
                anchor.parentNode.insertBefore(header, anchor.nextSibling);

                let newTab = document.createElement('div');
                newTab.className = 'itemDefault-3Jdr52 item-PXvHYJ notSelected-1N1G5p ed-settings';
                newTab.innerHTML = 'Plugins';
                header.parentNode.insertBefore(newTab, header.nextSibling);

                let tab2 = document.createElement('div');
                tab2.className = 'itemDefault-3Jdr52 item-PXvHYJ notSelected-1N1G5p ed-settings';
                tab2.innerHTML = 'Settings';
                newTab.parentNode.insertBefore(tab2, newTab.nextSibling);

                let sep = document.createElement('div');
                sep.className = 'separator-gCa7yv marginTop8-1DLZ1n marginBottom8-AtZOdT';
                tab2.parentNode.insertBefore(sep, tab2.nextSibling);

                parent.onclick = function(e) {
                    if (!e.target.className || e.target.className.indexOf('itemDefault-3Jdr52 item-PXvHYJ') == -1) return;
                    console.log(e.target);

                    for (let i in tab) {
                        tab[i].className = (tab[i].className || '')
                            .replace('selected-3s45Ha', 'notSelected-1N1G5p')
                            .replace('itemSelected-1qLhcL', 'itemDefault-3Jdr52')
                    };
                }

                //let settingsPane = document.querySelector('.ui-standard-sidebar-view .content-column > div');

                newTab.onclick = function(e) {
                    let settingsPane = document.querySelector('.ui-standard-sidebar-view .content-column > div');
                    let otherTab = document.querySelector('.item-PXvHYJ.selected-3s45Ha');
                    if (otherTab) {
                        otherTab.className = otherTab.className
                            .replace('selected-3s45Ha', 'notSelected-1N1G5p')
                            .replace('itemSelected-1qLhcL', 'itemDefault-3Jdr52');
                    }
                    //console.log(otherTab);
                    this.className = this.className
                        .replace('notSelected-1N1G5p', 'selected-3s45Ha')
                        .replace('itemDefault-3Jdr52', 'itemSelected-1qLhcL');

                    if (settingsPane) {
                        settingsPane.innerHTML = '<h2 class="h2-2gWE-o title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh2-2LTaUL marginBottom20-32qID7">EnhancedDiscord Plugins</h2>';
                        for (let id in window.ED.plugins) {
                            if (id == 'ed_settings') continue;

                            settingsPane.innerHTML += makePluginToggle({id, title: window.ED.plugins[id].name, desc: window.ED.plugins[id].description, color: window.ED.plugins[id].color || 'orange'});
                            if (!window.ED.plugins[id].settings || window.ED.plugins[id].settings.enabled !== false) {
                                let cb = document.getElementById(id);
                                if (cb && cb.className)
                                    cb.className = cb.className.replace('valueUnchecked-2lU_20', 'valueChecked-m-4IJZ');
                            }
                        }
                    }
                    e.stopPropagation(); // prevent from going to parent click handler
                }

                tab2.onclick = function(e) {
                    let settingsPane = document.querySelector('.ui-standard-sidebar-view .content-column > div');
                    let otherTab = document.querySelector('.item-PXvHYJ.selected-3s45Ha');
                    if (otherTab) {
                        otherTab.className = otherTab.className
                            .replace('selected-3s45Ha', 'notSelected-1N1G5p')
                            .replace('itemSelected-1qLhcL', 'itemDefault-3Jdr52');
                    }
                    //console.log(otherTab);
                    this.className = this.className
                        .replace('notSelected-1N1G5p', 'selected-3s45Ha')
                        .replace('itemDefault-3Jdr52', 'itemSelected-1qLhcL');

                    if (settingsPane) {
                        settingsPane.innerHTML = '<h2 class="h2-2gWE-o title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh2-2LTaUL marginBottom20-32qID7">EnhancedDiscord Configuration</h2><div class="divider-3573oO margin-bottom-40"></div>';
                        settingsPane.innerHTML += makePluginToggle({id: 'silentTyping', title: 'Silent Typing', desc: "Never appear as typing in any channel."});
                        settingsPane.innerHTML += makePluginToggle({id: 'antiTrack', title: 'Anti-Track', desc: 'Prevent Discord from sending "tracking" data that they may be selling to advertisers or otherwise sharing.'});

                        let st = document.getElementById('silentTyping');
                        if (st && window.ED.config.silentTyping == true)
                            st.className = st.className.replace('valueUnchecked-2lU_20', 'valueChecked-m-4IJZ');
                        let at = document.getElementById('antiTrack');
                        if (at && window.ED.config.antiTrack !== false)
                            at.className = at.className.replace('valueUnchecked-2lU_20', 'valueChecked-m-4IJZ');
                        //console.log(st, at);

                        for (let id in window.ED.plugins) {
                            if (!window.ED.plugins[id].config || !window.ED.plugins[id].generateSettings) continue;

                            settingsPane.innerHTML += `<h2 class="h2-2gWE-o title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh2-2LTaUL">${window.ED.plugins[id].name}</h2>`;

                            settingsPane.innerHTML += window.ED.plugins[id].generateSettings();

                            settingsPane.innerHTML += '<div class="divider-3573oO margin-bottom-20"></div>';

                            if (window.ED.plugins[id].settingListeners) {
                                setTimeout(() => { // let shit render
                                    for (let sel in window.ED.plugins[id].settingListeners) {
                                        let elem = settingsPane.querySelector(sel);
                                        if (sel)
                                            elem.onclick = window.ED.plugins[id].settingListeners[sel];
                                    }
                                }, 5);
                            }
                        }
                    }
                    e.stopPropagation(); // prevent from going to parent click handler
                }

                document.querySelector('.ui-standard-sidebar-view .content-column').onclick = function(e) {
                    let parent = e.target.parentElement;

                    if (e.target.className && (e.target.className == 'contents-18-Yxp' || e.target.className.indexOf('ed-plugin-reload') > -1)) {
                        let button = e.target.className == 'contents-18-Yxp' ? e.target : e.target.firstElementChild;
                        let plugin = e.target.className == 'contents-18-Yxp' ? e.target.parentElement.nextElementSibling : e.target.nextElementSibling;
                        //console.log(plugin);
                        if (!plugin || !plugin.id || !window.ED.plugins[plugin.id] || plugin.className.indexOf('valueChecked-m-4IJZ') == -1) return;
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

                    if (parent.className.indexOf('valueChecked-m-4IJZ') > -1) {
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
                        parent.className = parent.className.replace('valueChecked-m-4IJZ', 'valueUnchecked-2lU_20');
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
                        parent.className = parent.className.replace('valueUnchecked-2lU_20', 'valueChecked-m-4IJZ');
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
