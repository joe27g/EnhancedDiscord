const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Silent Typing',
    author: 'Joe 🎸#7070',
    description: `Never appear as typing in any channel.`,
    color: 'grey',
    disabledByDefault: true,

    load: async function() {
        EDApi.monkeyPatch(EDApi.findModule('startTyping'), 'startTyping', () => {});
    },
    unload: function() {
        EDApi.findModule('startTyping').startTyping.unpatch();
    }
});
