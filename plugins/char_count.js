const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Character Count',
    author: 'Joe 🎸#7070',
    description: `Shows the number of characters next to the message you're typing. Takes into account the extra length of resolved emojis, mentions, etc.`,
    color: 'violet',

    load: async function() {
        const ml = findModule('maxLength'), ce = findModule('colorError'), cta = findModule('channelTextArea'), gc = findModule('getChannel'), gci = findModule('getChannelId'), cm = findModule('createBotMessage');

        this.lis = function(e) {
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
        };
        this.lis2 = e => {
        	if ((e.keyCode || e.which) === 13) return this.lis(e);
        }
        document.addEventListener("input", this.lis);
        document.addEventListener("keydown", this.lis2);
    },

    unload: function() {
        document.removeEventListener("input", this.lis);
        document.removeEventListener("keydown", this.lis2);
    }
});
