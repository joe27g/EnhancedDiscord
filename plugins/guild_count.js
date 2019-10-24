const Plugin = require('../plugin');

let sep = {}, ms = {};

module.exports = new Plugin({
    name: 'Server Count',
    author: 'Joe 🎸#7070',
    description: "Adds the number of servers you're currently in right above the list.",
    color: 'indigo',

    load: async function() {
		sep = window.EDApi.findModule('guildSeparator');
        ms = window.EDApi.findModule('modeSelectable');

        const gg = function(b) {
            const og = b.callOriginalMethod(b.methodArguments);
            if (!sep) return og;
            const num = Object.keys(og).length;

            let guildCount = document.getElementById('ed_guild_count');
            if (guildCount) {
                if (num === this._num) return og; // don't update if # is the same as before
                guildCount.innerHTML = num + ' Servers';
                this._num = num;
                return og;
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
            return og;
        };

        window.EDApi.findModule('subscribe').subscribe('CONNECTION_OPEN', gg);

        window.EDApi.monkeyPatch(window.EDApi.findModule('getGuilds'), 'getGuilds', gg);
    },
    unload: function() {
        const m = window.EDApi.findModule('getGuilds').getGuilds;
        if (m && m.__monkeyPatched)
            m.unpatch();
        const guildCount = document.getElementById('ed_guild_count');
        if (guildCount)
            guildCount.remove();
    }
});
