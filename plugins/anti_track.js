const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Anti-Track',
    author: 'Joe 🎸#7070',
    description: `Prevent Discord from sending "tracking" data that they may be selling to advertisers or otherwise sharing.`,
    color: 'white',

    load: async function() {
        window.EDApi.monkeyPatch(window.EDApi.findModule('track'), 'track', () => {});
        window.EDApi.monkeyPatch(window.EDApi.findModule('submitLiveCrashReport'), 'submitLiveCrashReport', () => {});
    },
    unload: async function() {
        window.EDApi.findModule('track').track.unpatch();
        window.EDApi.findModule('submitLiveCrashReport').submitLiveCrashReport.unpatch();
    }
});
