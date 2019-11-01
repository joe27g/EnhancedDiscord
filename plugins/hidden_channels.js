const Plugin = require('../plugin');

let getUser, getChannel, getAllChannels, g_dc, g_cat, can, ha, disp, fm;

module.exports = new Plugin({
    name: 'Hidden Channels',
    description: 'Shows hidden channels and lets you view server permissions.',
    color: 'magenta',
    author: 'Joe 🎸#7070',

    load: async function() {
        getUser = window.EDApi.findModule('getCurrentUser').getCurrentUser;
        getChannel = window.EDApi.findModule('getChannel').getChannel;
        getAllChannels = window.EDApi.findModule('getChannels').getChannels;
        g_dc = window.EDApi.findModule('getDefaultChannel');
        g_cat = window.EDApi.findModule(m => m.getCategories && !m.EMOJI_NAME_RE);
        can = window.findModule('computePermissions').can;
        ha = window.EDApi.findModule('hasUnread').__proto__;
        disp = window.EDApi.findModule("dispatch");
        fm = window.EDApi.findModule("fetchMessages");

        window.EDApi.monkeyPatch(g_dc, 'getChannels', b => {
            const og = b.callOriginalMethod(b.methodArguments);
            if (!b.methodArguments[0]) return og;
            const hidden = [], allChans = getAllChannels();
            for (const i in allChans) {
                if (allChans[i].guild_id === b.methodArguments[0]) {
                    if (allChans[i].type !== 4 && !can(1024, getUser(), getChannel(allChans[i].id))) {
                        allChans[i].hidden = true;
                        hidden.push(allChans[i]);
                    }
                }
            }
            og.HIDDEN = hidden;
            return og;
        });
        window.EDApi.monkeyPatch(g_cat, 'getCategories', b => {
            const og = b.callOriginalMethod(b.methodArguments);
            const chs = g_dc.getChannels(b.methodArguments[0]);
            chs.HIDDEN.forEach(c => {
                const result = og[c.parent_id || "null"].filter(item => item.channel.id === c.id);
                if (result.length) return; // already added
                og[c.parent_id || "null"].push({channel: c, index: 0})
            });
            return og;
        });

        window.EDApi.monkeyPatch(ha, 'hasUnread', function(b) {
            if (getChannel(b.methodArguments[0]).hidden)
                return false; // don't show hidden channels as unread.
            return b.callOriginalMethod(b.methodArguments);
        });
        window.EDApi.monkeyPatch(ha, 'hasUnreadPins', function(b) {
            if (getChannel(b.methodArguments[0]).hidden)
                return false; // don't show icon on hidden channel pins.
            return b.callOriginalMethod(b.methodArguments);
        });

        disp.subscribe("CHANNEL_SELECT", module.exports.dispatchSubscription);

        window.EDApi.monkeyPatch(fm, "fetchMessages", function(b) {
            if (getChannel(b.methodArguments[0]).hidden) return;
            else return b.callOriginalMethod();
        })
    },

    unload: function() {
        g_dc.getChannels.unpatch();
        g_cat.getCategories.unpatch();
        ha.hasUnread.unpatch();
        ha.hasUnreadPins.unpatch();
        fm.fetchMessages.unpatch();

        disp.unsubscribe("CHANNEL_SELECT", module.exports.dispatchSubscription);
    },
    dispatchSubscription: function (data) {
        if (data.type !== "CHANNEL_SELECT") return;

        if (getChannel(data.channelId).hidden) {
            setTimeout(module.exports.attachHiddenChanNotice, 100); // This value could be brought down however I don't know if lower spec users would suffer.
        }
    },
    attachHiddenChanNotice: function () {
        const messagesWrapper = document.querySelector(`.${window.EDApi.findModule("messages").messagesWrapper}`);
        if (!messagesWrapper) return;

        messagesWrapper.firstChild.style.display = "none"; // Remove messages shit.
        messagesWrapper.parentElement.children[1].style.display = "none"; // Remove message box.
        messagesWrapper.parentElement.parentElement.children[1].style.display = "none"; // Remove user list.

        const toolbar = document.querySelector("."+window.EDApi.findModule(m => {
            if (m instanceof Window) return;
            if (m.toolbar && m.selected) return m;
        }).toolbar);

        toolbar.style.display = "none";

        const hiddenChannelNotif = document.createElement("div");

        // Class name modules
        const txt = window.EDApi.findModule("h5");
        const flx = window.EDApi.findModule("flex");

        hiddenChannelNotif.className = flx.flexCenter;
        hiddenChannelNotif.style.width = "100%";

        hiddenChannelNotif.innerHTML = `
        <div class="${flx.flex} ${flx.directionColumn} ${flx.alignCenter}">
        <h2 class="${txt.h2} ${txt.defaultColor}">This is a hidden channel.</h2>
        <h5 class="${txt.h5} ${txt.defaultColor}">You cannot see the contents of this channel. However, you may see its name and topic.</h5>
        </div>`;

        messagesWrapper.appendChild(hiddenChannelNotif);
    }
});
