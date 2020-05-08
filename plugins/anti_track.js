const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Anti-Track',
    author: 'Joe 🎸#7070',
    description: `Prevent Discord from sending "tracking" data that they may be selling to advertisers or otherwise sharing.`,
    color: 'white',

    load: async function() {
        EDApi.monkeyPatch(EDApi.findModule('track'), 'track', () => {});
        EDApi.monkeyPatch(EDApi.findModule('submitLiveCrashReport'), 'submitLiveCrashReport', () => {});
    },
    unload: async function() {
        EDApi.findModule('track').track.unpatch();
        EDApi.findModule('submitLiveCrashReport').submitLiveCrashReport.unpatch();
    }
});
