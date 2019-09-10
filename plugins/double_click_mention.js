const Plugin = require('../plugin');
let userM = {}, taM = {}, popM = {}, ree;

module.exports = new Plugin({
    name: 'Double-Click Mention',
    author: 'Joe 🎸#7070',
    description: 'Allows you to double-click a user\'s name to mention them.',
    color: '#00bbff',

    _userTag: '',
    load: async function() {
        taM = findModule('textArea');
        userM = findModule('username');
        popM = findModule('userPopout');
        ree = this;

        document.addEventListener("click", this.clickListener);
        document.addEventListener("dblclick", this.doubleListener);
    },
    unload: async function() {
        document.removeEventListener("dblclick", this.doubleListener);
    },

    clickListener: function(e) {
        if (!e || !e.target || !e.target.className || !e.target.className.includes || !e.target.className.includes(userM.username)) return;

        const pop = document.querySelector('.'+popM.userPopout);
        if (!pop) { ree._userTag = null; return; }

        const userTag = pop.querySelector('.'+(popM.headerTag || 'bite_my_shiny_metal_ass').split(' ').join('.'));
        if (!userTag) return;

        ree._userTag = userTag.textContent;
    },
    doubleListener: function(e) {
        if (!ree._userTag || !e || !e.target || !e.target.className || !e.target.className.includes || !e.target.className.includes(userM.username)) return;

        const ta = document.querySelector('.'+taM.textArea);
        if (!ta) return;
        ta.value = `${ta.value || ''}@${ree._userTag} `;
        ree._userTag = null;
    }
});
