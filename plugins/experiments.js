const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Experiments',
    author: 'Joe 🎸#7070',
    description: 'Enables Discord Staff "experiments." (super-secret dev features)',
    color: 'limegreen',
    id: 'experiments',

    load: function() {
        findModule('isDeveloper').__proto__ = {
            constructor: findModule('isDeveloper').__proto__,
            getExperimentDescriptor: findModule('isDeveloper').__proto__.getExperimentDescriptor,
            isDeveloper: true,
            __proto__: findModule('isDeveloper').__proto__.__proto__
        };
    },
    unload: function() {
        findModule('isDeveloper').__proto__.isDeveloper = false;
    }
});