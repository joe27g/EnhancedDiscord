const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Double-Click Edit',
    author: 'Joe 🎸#7070',
    description: 'Allows you to double-click a message to edit or hold delete + click to delete.',
    color: '#ff5900',

    deletePressed: false,
    load: function() {
        this._mm = findRawModule(m => m.displayName == "Message");
        this._edm = EDApi.findModule('startEditMessage');
        monkeyPatch(this._mm.exports, 'default', {
            silent: true,
            before: e => e.methodArguments[0].onClick = () => this.handleClick(e.methodArguments[0])
        });
        
        document.addEventListener("keydown", this.keyDownListener);
        document.addEventListener("keyup", this.keyUpListener);
    },
    unload: function() {
        if (this._mm.exports.default)
            this._mm.exports.default.unpatch();
        document.removeEventListener("keydown", this.keyDownListener);
        document.removeEventListener("keyup", this.keyUpListener);
    },

    handleDoubleClick: function(message) {
        const msgObj = message.childrenMessageContent.props.message;
        return this._edm.startEditMessage(msgObj.channel_id, msgObj.id, msgObj.content || '');
    },

    handleClick: function(message) {
        if (Date.now() - message._lastClick < 250)
            return this.handleDoubleClick(message);
        message._lastClick = Date.now();
        console.log(this.deletePressed);
        if (!this.deletePressed) return;
        const msgObj = message.childrenMessageContent.props.message;
        return this._edm.deleteMessage(msgObj.channel_id, msgObj.id);
    },

    keyUpListener: e => {
        if (e.keyCode == 46)
            module.exports.deletePressed = false;
    },
    keyDownListener: e => {
        if (e.keyCode == 46)
            module.exports.deletePressed = true;
    }
});
