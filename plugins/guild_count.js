const Plugin = require('../plugin');

let sep = {}, ms = {}, gg, sub;

module.exports = new Plugin({
    name: 'Server Count',
    author: 'Joe 🎸#7070',
    description: "Adds the number of servers you're currently in right above the list.",
    color: 'indigo',

    load: async function() {
		sep = window.EDApi.findModule('guildSeparator');
        ms = window.EDApi.findModule('modeSelectable');
        gg = window.EDApi.findModule('getGuilds');
        sub = window.EDApi.findModule('subscribe');

        window.EDApi.monkeyPatch(gg, 'getGuilds', {after: this.refreshCount, silent: true});
        sub.subscribe('CONNECTION_OPEN', gg.getGuilds);
    },
    refreshCount: function(b) {
        if (!sep) return;
        const num = Object.keys(b.returnValue).length;

        let guildCount = document.getElementById('ed_guild_count');
        if (guildCount) {
            if (num === this._num) return; // don't update if # is the same as before
            guildCount.innerHTML = num + ' Servers';
            this._num = num;
            return;
        }
        const separator = document.querySelector(`.${sep.guildSeparator}`);
        if (separator) {
            guildCount = document.createElement('div');
            guildCount.className = `${ms ? ms.description+' ' : ''}${sep.listItem}`;
            guildCount.innerHTML = num + ' Servers';
            guildCount.id = 'ed_guild_count';
            try {
                separator.parentElement.insertAdjacentElement('beforebegin', guildCount);
                this._num = num;
            } catch(err) {
                this.error(err);
            }
        }
        return;
    },
    unload: function() {
        gg.getGuilds.unpatch();
        const guildCount = document.getElementById('ed_guild_count');
        if (guildCount)
            guildCount.remove();
        sub.unsubscribe('CONNECTION_OPEN', gg.getGuilds);
    }
});
