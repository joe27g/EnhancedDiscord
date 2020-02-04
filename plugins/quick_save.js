const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Quick Save',
    author: 'Joe 🎸#7070',
    description: 'Use Ctrl+S or Cmd+S to save server, channel, or account settings.',
    color: 'salmon',

    load: async function() {
        const hcModules = EDApi.findAllModules('hasChanges');
        this._listener = function(e) {
          if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) && e.keyCode == 83) {
            e.preventDefault();
            const types = ['GUILD', 'CHANNEL', 'ACCOUNT', 'GUILD ROLES', 'CHANNEL OVERWRITES'];
            let hasChanges = false;
            for (const i in types) {
                if (hcModules[i] && hcModules[i].hasChanges()) {
                    hasChanges = true;
                    //module.exports.log(`saving ${types[i]} settings`);
                    break;
                }
            }
            if (!hasChanges) {
                //module.exports.log('No setting changes detected. Aborting.');
                return;
            }
            const saveButton = document.querySelector('[class*="lookFilled-"][class*="colorGreen-"]');
            if (saveButton)
                try { saveButton.click(); } catch(err) { module.exports.error(err); }
            return;
          }
        }
        document.addEventListener("keydown", this._listener, false);
    },
    unload: function() {
        document.removeEventListener("keydown", this._listener);
        delete this._listener;
    }
});
