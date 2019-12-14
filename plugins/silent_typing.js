const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Silent Typing',
    author: 'Joe 🎸#7070',
    description: `Never appear as typing in any channel.`,
    color: 'grey',
    disable: true,

    load: async function() {
        window.EDApi.monkeyPatch(window.EDApi.findModule('startTyping'), 'startTyping', () => {});
    },
    unload: function() {
        window.EDApi.findModule('startTyping').startTyping.unpatch();
    }
});