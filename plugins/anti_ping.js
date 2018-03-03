const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Anti-Ping',
    author: 'Joe 🎸#7070',
    description: 'Removes ping box for any server that is muted and has @everyone surpressed.',
    color: 'aqua',

    load: async function() {

        while (!findModule('getMentionCount', true) || !findModule('isMuted', true) || !findModule('getChannels', true))
            await this.sleep(1000);

        monkeyPatch(findModule('getMentionCount'), 'getMentionCount', function () {
            let ch = findModule('getChannels').getChannels()[arguments[0].methodArguments[0]];
            if (ch && ch.guild_id && findModule('isMuted').isMuted(ch.guild_id) && findModule('isMuted').isSuppressEveryoneEnabled(ch.guild_id)) {
                return 0;
            }
            return arguments[0].callOriginalMethod(arguments[0].methodArguments);
        });
    },
    unload: function() {
        findModule('getMentionCount').getMentionCount.unpatch();
    }
});