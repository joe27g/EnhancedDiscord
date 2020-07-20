const Plugin = require('../plugin');
let sep = {}, ms = {}, kb = {}, sub;

module.exports = new Plugin({
    name: 'Friend Count',
    author: 'Joe 🎸#7070',
    description: "Adds the number of friends/online friends under the \"Home\" button in the top left.",
    color: 'cornflowerblue',

    defaultSettings: {onlineOnly: false},
    onSettingsUpdate: function() { return this.reload(); },

    addFriendCount: function() {
        if (!sep) return;
        const o = (this.settings || {}).onlineOnly;
        const num = o ? EDApi.findModule("getOnlineFriendCount").getOnlineFriendCount() : EDApi.findModule("getFriendIDs").getFriendIDs().length;

        let friendCount = document.getElementById('ed_friend_count');
        if (friendCount) {
            if (num === this._num) return; // don't update if # is the same as before
            friendCount.innerHTML = num + (o ? ' Online' : ' Friends');
            this._num = num;
            return;
        }
        const separator = document.querySelector(`.${sep.guildSeparator}`);
        if (separator) {
            friendCount = document.createElement('div');
            friendCount.className = `${ms ? ms.description+' ' : ''}${sep.listItem} ${kb.keybind}`;
            friendCount.innerHTML = num + (o ? ' Online' : ' Friends');
            friendCount.id = 'ed_friend_count';
            try {
                separator.parentElement.parentElement.insertBefore(friendCount, separator.parentElement)
                this._num = num;
            } catch(err) {
                this.error(err);
            }
        }
    },

    load: async function() {
        sep = EDApi.findModule('guildSeparator');
        ms = EDApi.findModule('modeSelectable');
        kb = EDApi.findModule('keybind');
        sub = EDApi.findModule('subscribe');

        sub.subscribe('CONNECTION_OPEN', this.addFriendCount);
        sub.subscribe('CONNECTION_RESUMED', this.addFriendCount);
        sub.subscribe('DISPATCH_APPLICATION_STATE_UPDATE', this.addFriendCount);
        sub.subscribe('PRESENCE_UPDATE', this.addFriendCount);
        sub.subscribe('RELATIONSHIP_ADD', this.addFriendCount);
        sub.subscribe('RELATIONSHIP_REMOVE', this.addFriendCount);

        this.addFriendCount();
    },
    unload: function() {
        const friendCount = document.getElementById('ed_friend_count');
        if (friendCount) friendCount.remove();

        sub.unsubscribe('CONNECTION_OPEN', this.addFriendCount);
        sub.unsubscribe('CONNECTION_RESUMED', this.addFriendCount);
        sub.unsubscribe('PRESENCE_UPDATE', this.addFriendCount);
        sub.unsubscribe('RELATIONSHIP_ADD', this.addFriendCount);
        sub.unsubscribe('RELATIONSHIP_REMOVE', this.addFriendCount);
    },
    generateSettings: () => ([{
        type: "input:boolean",
        configName: "onlineOnly",
        title: "Online Only",
        note: "Only show the number of friends online rather than all friends.",
    }])
});
