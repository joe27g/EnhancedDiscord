const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Character Count',
    author: 'Joe 🎸#7070',
    description: `Shows the number of characters next to the message you're typing. Takes into account the extra length of resolved emojis, mentions, etc.`,
    color: 'violet',

    load: async function () {
        this._rm = EDApi.findRawModule(m => m.displayName == "SlateCharacterCount");
        this._cc = EDApi.findModule('characterCount') || {};
        this._c = findModule('ActionTypes');

        monkeyPatch(this._rm.exports, 'default', {
            silent: true,
            before: () => {
                this._c.MAX_MESSAGE_LENGTH = 0; // this forces the char count element to appear
            },
            after: () => setTimeout(() => {
                this._c.MAX_MESSAGE_LENGTH = 2000;
                const cc = document.querySelector(`.${this._cc.characterCount} > span`);
                if (!cc) return;

                const num = parseInt(cc.innerHTML);
                if (isNaN(num)) return; // empty message

                const posNum = Math.abs(num); // this combined with the max length being 0 = actual char count
                cc.innerHTML = posNum || '';

                if (posNum > 2000) {
                    cc.parentElement.classList.add(this._cc.error);
                } else {
                    cc.parentElement.classList.remove(this._cc.error);
                }
            })
        });
    },
    unload: function () {
        if (this._rm.exports.default.unpatch)
            this._rm.exports.default.unpatch();
    }
});