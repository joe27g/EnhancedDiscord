const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Server Count',
    author: 'Joe 🎸#7070',
    description: "Adds the number of servers you're currently in right above the list.",
    color: 'indigo',

    load: async function() {
		const guildClasses = window.findModule('friendsOnline');

        const gg = function(b) {
            let og = b.callOriginalMethod(b.methodArguments);

            let guildCount = document.getElementById('ed_guild_count');
            if (guildCount) {
                guildCount.innerHTML = Object.keys(og).length + ' Servers';
                return og;
            }
            let separator = document.querySelector(`.${guildClasses.guildSeparator}`);
            if (separator) {
                guildCount = document.createElement('div');
                guildCount.className = `${guildClasses.friendsOnline} ${guildClasses.listItem}`;
                guildCount.innerHTML = Object.keys(og).length + ' Servers';
                guildCount.id = 'ed_guild_count';
                try { separator.parentElement.insertAdjacentElement('beforebegin', guildCount); } catch(err) { this.error(err); }
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
    }
});
