const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Anti-Ping',
    author: 'Joe 🎸#7070',
    description: 'Removes ping box for any server that is muted and has @everyone surpressed.',
    color: 'aqua',
    id: 'anti_ping',

    load: async function() {

        while (!findModule('getMentionCount', true) || !findModule('isMuted', true) || !findModule('getChannels', true))
            await this.sleep(1000);

        let m = findModule('isMuted');
        let c = findModule('getChannels');

        monkeyPatch(findModule('getMentionCount'), 'getMentionCount', function () {
            let ch = c.getChannels()[arguments[0].methodArguments[0]];
            if (ch && ch.guild_id && m.isMuted(ch.guild_id) && m.isSuppressEveryoneEnabled(ch.guild_id)) {
                return 0;
            }
            return arguments[0].callOriginalMethod(arguments[0].methodArguments);
        });
    },
    unload: function() {
        this.log(findModule('getMentionCount').getMentionCount.unpatch);
    }
});