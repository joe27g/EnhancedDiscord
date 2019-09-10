const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Server Count',
    author: 'Joe 🎸#7070',
    description: "Adds the number of servers you're currently in right above the list.",
    color: 'indigo',

    load: async function() {
		const sep = window.findModule('guildSeparator'), ms = window.findModule('modeSelectable');

        const gg = function(b) {
            let og = b.callOriginalMethod(b.methodArguments);
            if (!sep) return og;
            const num = Object.keys(og).length;

            let guildCount = document.getElementById('ed_guild_count');
            if (guildCount) {
            	if (num === this._num) return og; // don't update if # is the same as before
                guildCount.innerHTML = num + ' Servers';
            	this._num = num;
                return og;
            }
            let separator = document.querySelector(`.${sep.guildSeparator}`);
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

        findModule('subscribe').subscribe('CONNECTION_OPEN', gg);
		
        window.monkeyPatch(window.findModule('getGuilds'), 'getGuilds', gg);
    },
    unload: function() {
        let m = window.findModule('getGuilds').getGuilds;
        if (m && m.__monkeyPatched)
            m.unpatch();
        let guildCount = document.getElementById('ed_guild_count');
        if (guildCount)
        	guildCount.remove();
    }
});
