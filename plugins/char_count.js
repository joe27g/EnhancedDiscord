const Plugin = require('../plugin');

let ml = {}, ce = {}, cta = {}, gc, gci, gcu, cm;

module.exports = new Plugin({
    name: 'Character Count',
    author: 'Joe 🎸#7070',
    description: `Shows the number of characters next to the message you're typing. Takes into account the extra length of resolved emojis, mentions, etc.`,
    color: 'violet',

    load: async function() {
        ml = window.EDApi.findModule('maxLength');
        em = window.EDApi.findModule(m => m.checkbox && m.errorMessage);
        cta = window.EDApi.findModule('channelTextArea');
        gc = window.EDApi.findModule('getChannel');
        gci = window.EDApi.findModule('getChannelId');
        gcu = window.EDApi.findModule('getCurrentUser');
        cm = window.EDApi.findModule('createBotMessage');

        document.addEventListener("input", this.inputListener);
        document.addEventListener("keydown", this.keydownListener);
        findModule('dispatch').subscribe("MESSAGE_CREATE", this.msgListener);
    },

    msgListener: function(event) {
        // if message is not by current user or in different channel, cancel
        if (event.message.author.id !== gcu.getCurrentUser().id || event.message.channel_id !== gci.getChannelId()) return;
        const charCounters = document.querySelectorAll('.ed_char_count');
        charCounters.forEach(cc => cc.remove());
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
        charCountElem.className = `ed_char_count ${ml.maxLength}${len > 2000 ? ' '+em.errorMessage : ''}`;
    },

    keydownListener: function(e) {
        if ((e.keyCode || e.which) === 13) // update char count when enter is pressed. used for autocomplete.
            return module.exports.inputListener(e);
    },

    unload: function() {
        document.removeEventListener("input", this.inputListener);
        document.removeEventListener("keydown", this.keydownListener);
        findModule('dispatch').unsubscribe("MESSAGE_CREATE", this.msgListener);
    }
});
