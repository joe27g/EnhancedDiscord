const Plugin = require('../plugin');

let sep = {}, ms = {}, kb = {}, gg, sub;

module.exports = new Plugin({
    name: 'Server Count',
    author: 'Joe 🎸#7070',
    description: "Adds the number of servers you're currently in right above the list.",
    color: 'indigo',

    load: async function() {
		sep = EDApi.findModule('guildSeparator');
        ms = EDApi.findModule('modeSelectable');
        kb = EDApi.findModule('keybind');
        gg = EDApi.findModule('getGuilds');
        sub = EDApi.findModule('subscribe');

        sub.subscribe('CONNECTION_OPEN', this.refreshCount);
        sub.subscribe('CONNECTION_RESUMED', this.refreshCount);
        sub.subscribe('DISPATCH_APPLICATION_STATE_UPDATE', this.refreshCount);
        sub.subscribe('CHANNEL_PRELOAD', this.refreshCount);
        sub.subscribe('GUILD_CREATE', this.refreshCount);
        sub.subscribe('GUILD_DELETE', this.refreshCount);
        sub.subscribe('GUILD_JOIN', this.refreshCount);
        this.refreshCount();
    },
    refreshCount: function() {
        if (!sep) return;
        const num = Object.keys(gg.getGuilds()).length;

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
            guildCount.className = `${ms ? ms.description+' ' : ''}${sep.listItem} ${kb.keybind}`;
            guildCount.innerHTML = num + ' Servers';
            guildCount.id = 'ed_guild_count';
            try {
                separator.parentElement.parentElement.insertBefore(guildCount, separator.parentElement)
                this._num = num;
            } catch(err) {
                this.error(err);
            }
        }
        return;
    },
    unload: function() {
        const guildCount = document.getElementById('ed_guild_count');
        if (guildCount) guildCount.remove();

        sub.unsubscribe('CONNECTION_OPEN', this.refreshCount);
        sub.unsubscribe('GUILD_CREATE', this.refreshCount);
        sub.unsubscribe('GUILD_DELETE', this.refreshCount);
        sub.unsubscribe('GUILD_JOIN', this.refreshCount);
    }
});
