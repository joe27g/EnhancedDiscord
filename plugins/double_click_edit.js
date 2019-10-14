const Plugin = require('../plugin');
let contM = {}, iteM = {}, buttM = {}, cM, eM, dM, ree;

module.exports = new Plugin({
    name: 'Double-Click Edit',
    author: 'Joe 🎸#7070',
    description: 'Allows you to double-click a message to edit or hold delete + click to delete.',
    color: '#ff5900',

    deletePressed: false,
    load: async function() {
        contM = findModule(m => m.container && m.containerCozy);
        iteM = findModule('itemBase');
        buttM = findModule(m => m.buttonSpacing && m.button);
        cM = findModule('getChannelId');
        eM = findModule('startEditMessage');
        dM = findModule('deleteMessage');
        if (!cM || !eM || !dM) {
            return this.error('Aborted loading - Failed to find required modules!');
        }
        ree = this;

        document.addEventListener("dblclick", this.editListener, false);
        document.addEventListener("keydown", this.keyDownListener);
        document.addEventListener("keyup", this.keyUpListener);
        document.addEventListener("click", this.deleteListener);
    },
    unload: async function() {
        document.removeEventListener("dblclick", this.editListener);
        document.removeEventListener("keydown", this.keyDownListener);
        document.removeEventListener("keyup", this.keyUpListener);
        document.removeEventListener("click", this.deleteListener);
    },

    editListener: function(e) {
        let messageElem = e.target.closest('.'+contM.container);
        if (!messageElem) return;
        let msgObj;
        try {
            msgObj = messageElem.__reactInternalInstance$.return.return.memoizedProps.message;
        } catch(err) {
            ree.error(err);
        }
        if (!msgObj) return;
        const channelId = cM.getChannelId();
        if (!channelId) return;
        return eM.startEditMessage(channelId, msgObj.id, msgObj.content || '');
    },
    deleteListener: function(e) {
        if (!ree.deletePressed) return;

        let messageElem = e.target.closest('.'+contM.container);
        if (!messageElem) return;
        let msgObj;
        try {
            msgObj = messageElem.__reactInternalInstance$.return.return.memoizedProps.message;
        } catch(err) {
            ree.error(err);
        }
        if (!msgObj) return;
        const channelId = cM.getChannelId();
        if (!channelId) return;
        return dM.deleteMessage(channelId, msgObj.id);
    },
    keyUpListener: function(e) {
        if (e.keyCode == 46)
            ree.deletePressed = false;
    },
    keyDownListener: function(e) {
        if (e.keyCode == 46)
            ree.deletePressed = true;
    }
});
