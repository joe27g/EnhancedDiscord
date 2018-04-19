const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Shut up, Clyde',
    author: 'Joe 🎸#7070',
    description: "Silences Clyde saying stupid shit about Nitro, for users that don't have it.",
    color: '#7289da',

    load: async function() {

        while (!findModule('sendBotMessage', true) || !findModule('Messages', true) || !findModule('getCurrentUser', true))
            await this.sleep(1000);

        let me = findModule('getCurrentUser').getCurrentUser();
        if (me && me.premium) return; //user has nitro

        let bs = findModule('Messages').Messages;

        window.monkeyPatch(findModule('sendBotMessage'), 'sendBotMessage', function () {
            let message = arguments[0].methodArguments[1];
            if (message == bs.INVALID_ANIMATED_EMOJI_BODY_UPGRADE || message == bs.INVALID_ANIMATED_EMOJI_BODY || message == bs.INVALID_EXTERNAL_EMOJI_BODY_UPGRADE || message == bs.INVALID_EXTERNAL_EMOJI_BODY) return;
            return arguments[0].callOriginalMethod(arguments[0].methodArguments);
        })
    },
    unload: function() {
        window.findModule('sendBotMessage').sendBotMessage.unpatch();
    }
});
