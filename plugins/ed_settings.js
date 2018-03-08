const Plugin = require('../plugin');

function makePluginToggle(opts = {}) {
    return `<div id="${opts.id}-wrap" class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO switchItem-1uofoz marginBottom20-2Ifj-2" style="flex: 1 1 auto;"><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${opts.title}${opts.color ? ` <div class="status" style="background-color:${opts.color}; box-shadow:0 0 5px 2px ${opts.color};margin-left: 5px;"></div>` : ''}</h3>${opts.id == 'silentTyping' || opts.id == 'antiTrack' ? '' : '<button type="button" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE ed-plugin-reload" style="height:24px;margin-right:10px;"><div class="contents-4L4hQM">Reload</div></button>'}<div id="${opts.id}" class="switchEnabled-3CPlLV switch-3lyafC valueUnchecked-XR6AOk value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU"><input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm" value="on"></div></div><div class="description-3MVziF formText-1L-zZB note-UEZmbY marginTop4-2rEBfJ modeDefault-389VjU primary-2giqSn" style="flex: 1 1 auto;">${opts.desc}</div><div class="divider-1G01Z9 dividerDefault-77PXsz marginTop20-3UscxH"></div></div>`;
}

module.exports = new Plugin({
    name: 'ED Settings',
    author: 'Joe 🎸#7070',
    description: 'Adds an EnhancedDiscord tab in user settings.',
    color: 'darkred',
    id: 'ed_settings',

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
                let parent = document.querySelector('.side-2nYO0F');
                let anchor = document.querySelector('.side-2nYO0F > .separator-3z7STW:nth-child(20)');

                //console.log(parent, anchor);

                if (!parent || !anchor)
                    return arguments[0].callOriginalMethod(arguments[0].methodArguments);

                let header = document.createElement('div');
                header.className = 'header-1-f9X5 ed-settings';
                header.innerHTML = 'EnhancedDiscord';
                anchor.parentNode.insertBefore(header, anchor.nextSibling);

                let newTab = document.createElement('div');
                newTab.className = 'itemDefault-3NDwnY item-3879bf notSelected-PgwTMa ed-settings';
                newTab.innerHTML = 'Plugins';
                header.parentNode.insertBefore(newTab, header.nextSibling);

                let tab2 = document.createElement('div');
                tab2.className = 'itemDefault-3NDwnY item-3879bf notSelected-PgwTMa ed-settings';
                tab2.innerHTML = 'Settings';
                newTab.parentNode.insertBefore(tab2, newTab.nextSibling);

                let sep = document.createElement('div');
                sep.className = 'separator-3z7STW marginTop8-2gOa2N marginBottom8-1mABJ4';
                tab2.parentNode.insertBefore(sep, tab2.nextSibling);

                parent.onclick = function(e) {
                    if (!e.target.className || e.target.className.indexOf('itemDefault-3NDwnY item-3879bf') == -1) return;
                    console.log(e.target);

                    for (let i in tab) {
                        tab[i].className = (tab[i].className || '')
                            .replace('selected-eNoxEK', 'notSelected-PgwTMa')
                            .replace('itemSelected-3XxAMf', 'itemDefault-3NDwnY')
                    };
                }

                //let settingsPane = document.querySelector('.ui-standard-sidebar-view .content-column > div');

                newTab.onclick = function(e) {
                    let settingsPane = document.querySelector('.ui-standard-sidebar-view .content-column > div');
                    let otherTab = document.querySelector('.item-3879bf.selected-eNoxEK');
                    if (otherTab) {
                        otherTab.className = otherTab.className
                            .replace('selected-eNoxEK', 'notSelected-PgwTMa')
                            .replace('itemSelected-3XxAMf', 'itemDefault-3NDwnY');
                    }
                    //console.log(otherTab);
                    this.className = this.className
                        .replace('notSelected-PgwTMa', 'selected-eNoxEK')
                        .replace('itemDefault-3NDwnY', 'itemSelected-3XxAMf');

                    if (settingsPane) {
                        settingsPane.innerHTML = '<h2 class="h2-2ar_1B title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh2-37e5HZ marginBottom20-2Ifj-2">EnhancedDiscord Plugins</h2>';
                        for (let id in window.ED.plugins) {
                            if (id == 'ed_settings') continue;

                            settingsPane.innerHTML += makePluginToggle({id, title: window.ED.plugins[id].name, desc: window.ED.plugins[id].description, color: window.ED.plugins[id].color || 'orange'});
                            if (!window.ED.plugins[id].settings || window.ED.plugins[id].settings.enabled !== false) {
                                let cb = document.getElementById(id);
                                if (cb && cb.className)
                                    cb.className = cb.className.replace('valueUnchecked-XR6AOk', 'valueChecked-3Bzkbm');
                            }
                        }
                    }
                    e.stopPropagation(); // prevent from going to parent click handler
                }

                tab2.onclick = function(e) {
                    let settingsPane = document.querySelector('.ui-standard-sidebar-view .content-column > div');
                    let otherTab = document.querySelector('.item-3879bf.selected-eNoxEK');
                    if (otherTab) {
                        otherTab.className = otherTab.className
                            .replace('selected-eNoxEK', 'notSelected-PgwTMa')
                            .replace('itemSelected-3XxAMf', 'itemDefault-3NDwnY');
                    }
                    //console.log(otherTab);
                    this.className = this.className
                        .replace('notSelected-PgwTMa', 'selected-eNoxEK')
                        .replace('itemDefault-3NDwnY', 'itemSelected-3XxAMf');

                    if (settingsPane) {
                        settingsPane.innerHTML = '<h2 class="h2-2ar_1B title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh2-37e5HZ marginBottom20-2Ifj-2">EnhancedDiscord Configuration</h2><div class="divider-1G01Z9 margin-bottom-40"></div>';
                        settingsPane.innerHTML += makePluginToggle({id: 'silentTyping', title: 'Silent Typing', desc: "Never appear as typing in any channel."});
                        settingsPane.innerHTML += makePluginToggle({id: 'antiTrack', title: 'Anti-Track', desc: 'Prevent Discord from sending "tracking" data that they may be selling to advertisers or otherwise sharing.'});

                        let st = document.getElementById('silentTyping');
                        if (st && window.ED.config.silentTyping == true)
                            st.className = st.className.replace('valueUnchecked-XR6AOk', 'valueChecked-3Bzkbm');
                        let at = document.getElementById('antiTrack');
                        if (at && window.ED.config.antiTrack !== false)
                            at.className = at.className.replace('valueUnchecked-XR6AOk', 'valueChecked-3Bzkbm');
                        //console.log(st, at);

                        for (let id in window.ED.plugins) {
                            if (!window.ED.plugins[id].config || !window.ED.plugins[id].generateSettings) continue;

                            settingsPane.innerHTML += `<h2 class="h2-2ar_1B title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh2-37e5HZ">${window.ED.plugins[id].name}</h2>`;

                            settingsPane.innerHTML += window.ED.plugins[id].generateSettings();

                            settingsPane.innerHTML += '<div class="divider-1G01Z9 margin-bottom-20"></div>';

                            if (window.ED.plugins[id].settingListeners) {
                                for (let sel in window.ED.plugins[id].settingListeners) {
                                    let elem = document.querySelector(sel);
                                    if (sel)
                                        elem.onclick = window.ED.plugins[id].settingListeners[sel];
                                }
                            }
                        }
                    }
                    e.stopPropagation(); // prevent from going to parent click handler
                }

                document.querySelector('.ui-standard-sidebar-view .content-column').onclick = function(e) {
                    let parent = e.target.parentElement;

                    if (e.target.className && (e.target.className == 'contents-4L4hQM' || e.target.className.indexOf('ed-plugin-reload') > -1)) {
                        let plugin = e.target.className == 'contents-4L4hQM' ? e.target.parentElement.nextElementSibling : e.target.nextElementSibling;
                        //console.log(plugin);
                        if (!plugin || !plugin.id || !window.ED.plugins[plugin.id] || plugin.className.indexOf('valueChecked-3Bzkbm') == -1) return;
                        window.ED.plugins[plugin.id].unload();
                        window.ED.plugins[plugin.id].load();
                        return;
                    }

                    if (e.target.tagName !== 'INPUT' || e.target.type !== 'checkbox' || !parent || !parent.className || !parent.id) return;
                    let p = window.ED.plugins[parent.id];
                    if (!p && parent.id !== 'silentTyping' && parent.id !== 'antiTrack') return;
                    //console.log('settings for '+p.id, p.settings);

                    if (parent.className.indexOf('valueChecked-3Bzkbm') > -1) {
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
                        parent.className = parent.className.replace('valueChecked-3Bzkbm', 'valueUnchecked-XR6AOk');
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
                        parent.className = parent.className.replace('valueUnchecked-XR6AOk', 'valueChecked-3Bzkbm');
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