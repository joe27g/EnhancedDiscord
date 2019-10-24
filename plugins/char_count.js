const Plugin = require('../plugin');

let ml = {}, ce = {}, cta = {}, gc, gci, cm;

module.exports = new Plugin({
    name: 'Character Count',
    author: 'Joe 🎸#7070',
    description: `Shows the number of characters next to the message you're typing. Takes into account the extra length of resolved emojis, mentions, etc.`,
    color: 'violet',

    load: async function() {
        ml = window.EDApi.findModule('maxLength');
        ce = window.EDApi.findModule('colorError');
        cta = window.EDApi.findModule('channelTextArea');
        gc = window.EDApi.findModule('getChannel');
        gci = window.EDApi.findModule('getChannelId');
        cm = window.EDApi.findModule('createBotMessage');

        document.addEventListener("input", this.inputListener);
        document.addEventListener("keydown", this.keydownListener);
    },

    inputListener: function(e) {
        const ctaElem = e.target.closest('.' + cta.channelTextArea);
        if (!ctaElem) return;
        const parent = ctaElem.parentElement;
        if (!parent || !ctaElem.className || !ctaElem.className.startsWith('channelTextArea-')) return;
        let charCountElem = parent.querySelector('.' + ml.maxLength);
        if (!charCountElem) {
            charCountElem = document.createElement('div');
            charCountElem.style = "bottom:3px;right:5px;";
            parent.appendChild(charCountElem);
        }
        const chan = gc.getChannel(gci.getChannelId());
        let len = (e.target.value || '').trim().length;
        if (chan && e.target.value) {
            const msgObj = cm.parse(chan, e.target.value);
            if (msgObj && msgObj.content)
                len = msgObj.content.trim().length;
        }
        charCountElem.innerHTML = len + '/2000';
        if (len > 2000) {
            charCountElem.className = ml.maxLength + ' ' + ce.colorError;
        } else {
            charCountElem.className = ml.maxLength;
        }
    },

    keydownListener: function(e) {
        if ((e.keyCode || e.which) === 13) return this.lis(e);
    },

    unload: function() {
        document.removeEventListener("input", this.inputListener);
        document.removeEventListener("keydown", this.keydownListener);
    }
});
