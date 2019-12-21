const Plugin = require('../plugin');

let ml = {}, cta = {}, ta, gs, em, gc, gci, gcu, cm;

module.exports = new Plugin({
    name: 'Character Count',
    author: 'Joe 🎸#7070',
    description: `Shows the number of characters next to the message you're typing. Takes into account the extra length of resolved emojis, mentions, etc.`,
    color: 'violet',

    load: async function() {
        ml = window.EDApi.findModule('maxLength');
        cta = window.EDApi.findModule('channelTextArea');
        ta = window.EDApi.findModuleByDisplayName('ChannelEditorContainer').prototype;
        gs = window.EDApi.findModule('getAllSettings');
        em = window.EDApi.findModule(m => m.checkbox && m.errorMessage);
        gc = window.EDApi.findModule('getChannel');
        gci = window.EDApi.findModule('getChannelId');
        gcu = window.EDApi.findModule('getCurrentUser');
        cm = window.EDApi.findModule('createBotMessage');

        window.EDApi.monkeyPatch(ta, 'render', {after: this.onRender, silent: true});
        window.EDApi.findModule('dispatch').subscribe("MESSAGE_CREATE", this.msgListener);
    },

    onRender: function(b) {
        const ctaElem = document.querySelector('.' + cta.channelTextArea);
        if (!ctaElem) return;
        if (!gs.useRichChatTextBox) return module.exports.inputListener(ctaElem); // legacy support
        const txt = b.thisObject.props.textValue;
        const parent = ctaElem.parentElement;
        let charCountElem = parent.querySelector('.' + ml.maxLength);
        if (!charCountElem) {
            charCountElem = document.createElement('div');
            charCountElem.style = "bottom:3px;right:5px;";
            parent.appendChild(charCountElem);
        }
        const len = (txt || '').trim().length;
        charCountElem.innerHTML = len + '/2000';
        charCountElem.className = `ed_char_count ${ml.maxLength}${len > 2000 ? ' '+em.errorMessage : ''}`;
    },

    msgListener: function(event) {
        // if message is not by current user or in different channel, cancel
        if (event.message.author.id !== gcu.getCurrentUser().id || event.message.channel_id !== gci.getChannelId()) return;
        const charCounters = document.querySelectorAll('.ed_char_count');
        charCounters.forEach(cc => cc.remove());
    },

    inputListener: function(elem) {
        if (!elem) return;
        const taElem = elem.querySelector('textarea');
        if (!taElem) return;
        const parent = elem.parentElement;
        if (!parent || !elem.className || !elem.className.includes(cta.channelTextArea)) return;
        let charCountElem = parent.querySelector('.' + ml.maxLength);
        if (!charCountElem) {
            charCountElem = document.createElement('div');
            charCountElem.style = "bottom:3px;right:5px;";
            parent.appendChild(charCountElem);
        }
        const chan = gc.getChannel(gci.getChannelId());
        let len = (taElem.value || '').trim().length;
        if (chan && taElem.value) {
            const msgObj = cm.parse(chan, taElem.value);
            if (msgObj && msgObj.content)
                len = msgObj.content.trim().length;
        }
        charCountElem.innerHTML = len + '/2000';
        charCountElem.className = `ed_char_count ${ml.maxLength}${len > 2000 ? ' '+em.errorMessage : ''}`;
    },

    unload: function() {
        ta.render.unpatch();
        window.EDApi.findModule('dispatch').unsubscribe("MESSAGE_CREATE", this.msgListener);
    }
});
