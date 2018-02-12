module.exports = {
    name: 'Silence',
    author: 'Joe 🎸#7070',
    description: 'No more typing or NSA data collection.',
    color: 'yellow',
    load: function() {
        window.monkeyPatch(window.findModule('track'), 'track', () => {});
        window.monkeyPatch(window.findModule('sendTyping'), 'sendTyping', () => {});
    },
    unload: function() {
        window.findModule('track').unpatch();
        window.findModule('sendTyping').unpatch();
    }
}