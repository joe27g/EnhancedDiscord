const Plugin = require('../plugin');

function makeToggle() {
    const a = window.ED.classMaps.alignment;
    const sw = window.ED.classMaps.switchItem;
    const cb = window.ED.classMaps.checkbox;
    const b = window.ED.classMaps.buttons;
    const d = window.ED.classMaps.description;

    return `<div class="${window.ED.classMaps.divider} ${sw.dividerDefault}"></div>
<div id="fc_online_wrap" class="${a.vertical} ${a.justifyStart} ${a.alignStretch} ${a.noWrap} ${sw.switchItem}" style="flex: 1 1 auto;">
    <div class="${a.horizontal} ${a.justifyStart} ${a.alignStart} ${a.noWrap}" style="flex: 1 1 auto;">
        <h3 class="${sw.titleDefault}" style="flex: 1 1 auto;">Online Friends</h3>
        
        
        <div id="fc_online" class="${cb.switchEnabled} ${(module.exports.settings || {}).onlineOnly ? cb.valueChecked : cb.valueUnchecked} ${cb.sizeDefault} ${cb.themeDefault}">
            <input type="checkbox" class="${cb.checkboxEnabled}" value="on">
        </div>
    </div>
    <div class="${d.description} ${d.modeDefault}" style="flex: 1 1 auto;">Only show the number of friends online rather than all friends.</div>
</div>`;
}

module.exports = new Plugin({
    name: 'Friend Count',
    author: 'Joe 🎸#7070',
    description: "Adds the number of friends/online friends under the \"Home\" button in the top left.",
    color: 'cornflowerblue',

    config: {
        onlineOnly: {default: false}
    },

    load: async function() {
		const sep = window.findModule('guildSeparator'), ms = window.findModule('modeSelectable');

        const gg = function(b) {
            if (!sep) return;
            const o = (module.exports.settings || {}).onlineOnly;
            const num = o ? window.findModule("getOnlineFriendCount").getOnlineFriendCount() : window.findModule("getFriendIDs").getFriendIDs().length;

            let friendCount = document.getElementById('ed_friend_count');
            if (friendCount) {
            	if (num === this._num) return; // don't update if # is the same as before
                friendCount.innerHTML = num + (o ? ' Online' : ' Friends');
            	this._num = num;
                return;
            }
            let separator = document.querySelector(`.${sep.guildSeparator}`);
            if (separator) {
                friendCount = document.createElement('div');
                friendCount.className = `${ms ? ms.description+' ' : ''}${sep.listItem}`;
                friendCount.innerHTML = num + (o ? ' Online' : ' Friends');
                friendCount.id = 'ed_friend_count';
                try {
                	separator.parentElement.insertAdjacentElement('beforebegin', friendCount);
                	this._num = num;
                } catch(err) {
                	this.error(err);
                }
            }
        };
        const x = window.findModule('getGuilds');
        findModule('subscribe').subscribe('CONNECTION_OPEN', x.getGuilds);
        window.monkeyPatch(x, 'getGuilds', {silent: true, after: gg});
    },
    unload: function() {
        let m = window.findModule('getGuilds').getGuilds;
        if (m && m.__monkeyPatched)
            m.unpatch();
        let friendCount = document.getElementById('ed_friend_count');
        if (friendCount)
        	friendCount.remove();
    },
    generateSettings: makeToggle,
    settingListeners: [{
        el: '#fc_online',
        type: 'click',
        eHandler: function(e) {
            const cb = window.ED.classMaps.checkbox;
            module.exports.settings = {onlineOnly: !(module.exports.settings || {}).onlineOnly};
            if (module.exports.settings.onlineOnly) {
                this.classList.remove(cb.valueUnchecked.split(' ')[0]);
                this.classList.add(cb.valueChecked.split(' ')[0]);
            } else {
                this.classList.remove(cb.valueChecked.split(' ')[0]);
                this.classList.add(cb.valueUnchecked.split(' ')[0]);
            }
        }
    }]
});
