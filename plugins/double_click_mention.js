const Plugin = require('../plugin');
let userM = {}, taM = {}, avM = {}, wM = {}, ree;

module.exports = new Plugin({
    name: 'Double-Click Mention',
    author: 'Joe 🎸#7070',
    description: 'Allows you to double-click a user\'s name to mention them.',
    color: '#00bbff',

    _userTag: '',
    load: async function() {
        taM = EDApi.findModule('textArea');
        userM = EDApi.findModule('username');
        avM = EDApi.findModule('avatar');
        wM = EDApi.findModule(m => m.wrapper && m.avatar);
        ree = this;

        document.addEventListener("dblclick", this.doubleListener);
    },
    unload: async function() {
        document.removeEventListener("dblclick", this.doubleListener);
    },

    doubleListener: function(e) {
        if (!e || !e.target || !e.target.parentElement) return;
        let tag;
        try {
            if (e.target.className === userM.username)
                tag = e.target.parentElement.__reactInternalInstance$.return.return.memoizedProps.message.author.tag;
            else if (e.target.className === wM.wrapper && e.target.parentElement.className === avM.avatar)
                tag = e.target.parentElement.__reactInternalInstance$.return.return.memoizedProps.user.tag;
        } catch(err) {
            ree.error(err);
            tag = null;
        }
        if (!tag) return;

        const ta = document.querySelector('.'+taM.textArea);
        if (!ta) return;
        ta.value = `${ta.value ? ta.value.endsWith(' ') ? ta.value : ta.value+' ' : ''}@${tag} `;
    }
});
