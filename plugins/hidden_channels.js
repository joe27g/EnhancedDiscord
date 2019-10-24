const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Hidden Channels',
    description: 'Shows hidden channels and lets you view server permissions.',
    color: 'magenta',
    author: 'Joe 🎸#7070',

    load: async function() {
        if (!window.ED._readOnlyPerms)
            window.ED._readOnlyPerms = [];
        if (!window.ED._hiddenChans)
            window.ED._hiddenChans = [];

        const gcu = window.EDApi.findModule('getCurrentUser').getCurrentUser, gc = window.EDApi.findModule('getChannels').getChannels, gg = window.EDApi.findModule('getGuilds').getGuilds;

        function disButt() { // disable perm buttons cause u can't use them :P
            //console.log('executing disButt();');
            const r = document.getElementById('app-mount');
            if (!r) return;
            const permButtons = r.getElementsByClassName('item-3T2z1R');
            if (permButtons && permButtons.length > 0) {
                for (const i in permButtons) {
                    permButtons[i].disabled = true;
                }
            }
            const redButton = r.querySelector('.content-1rPSz4 .colorRed-1TFJan');
            hide(redButton);

            const syncButton = r.querySelector('.sidebarScrollable-1qPI87 .card-2j1p1_ .button-1dUBJq');
            hide(syncButton);

            const addPermOverw = r.querySelector('.sidebarScrollable-1qPI87 img.sidebarHeader-2uiNOo');
            hide(addPermOverw);

            const switches = r.getElementsByClassName('checkbox-2tyjJg');
            if (switches && switches.length > 0) {
                for (const i in switches) {
                    if (!switches[i]) continue;
                    switches[i].className = 'checkboxDisabled-1MA81A checkbox-2tyjJg';
                    //console.log(switches[i].parentElement);
                    if (switches[i].parentElement)
                        switches[i].parentElement.className = (switches[i].parentElement.className || '').replace('switchEnabled-V2WDBB', 'switchDisabled-3HsXAJ');
                }
            }
            const addRoleButtons = r.getElementsByClassName('addButton-pcyyf6');
            if (addRoleButtons && addRoleButtons.length > 0) {
                for (const i in addRoleButtons) {
                    hide(addRoleButtons[i]);
                }
            }
        }
        function hide(element) { // these elements need to be hidden, NOT removed. Removing causes React to crash
            if (!element) return;
            //console.log('hiding', element);
            const hiddenClass = 'roleRemoveIcon-2-TeGW';
            if (element.className && element.className.indexOf('roleRemoveIcon-2-TeGW') > -1) return;
            else if (element.className)
                element.className += ' '+hiddenClass;
            else element.className = hiddenClass;
            return element;
        }

        const cp = window.EDApi.findModule('computePermissions');
        window.EDApi.monkeyPatch(cp, 'computePermissions', function(b) {
            const member = b.methodArguments[0]; // member to get perms for, object or ID
            const thing = b.methodArguments[1]; // this can be a channel, guild, category, ... object or ID
            const original = b.callOriginalMethod(arguments[0].methodArguments); // original (correct) perms

            if (member.id !== gcu().id) { // checking for someone else
                return original;
            }
            const chans = gc(), guilds = gg();
            if (chans[thing.id] || guilds[thing.id]) { // checking perms for a channel or guild

                if (original & 1024) { // can already wiew channel
                    if (window.ED._hiddenChans.indexOf(thing.id) >= 0)
                        window.ED._hiddenChans.splice(window.ED._hiddenChans.indexOf(thing.id), 1);
                } else { // can't view channel
                    if (window.ED._hiddenChans.indexOf(thing.id) == -1)
                        window.ED._hiddenChans.push(thing.id);
                }
                if (original & 268435456) { // can already edit perms
                    if (window.ED._readOnlyPerms.indexOf(thing.id) >= 0)
                        window.ED._readOnlyPerms.splice(window.ED._readOnlyPerms.indexOf(thing.id), 1);
                } else { // can't edit perms, but let me view them
                    if (window.ED._readOnlyPerms.indexOf(thing.id) == -1)
                        window.ED._readOnlyPerms.push(thing.id);
                }

                return (original | 1024 | 1048576 | 268435456); // add READ_MESSAGES, CONNECT, and MANAGE_ROLES to make it visible & allow viewing perms
            }
            return original;
        });
        window.EDApi.monkeyPatch(cp, 'getGuildPermissionProps', function(b) {
            const retVal = b.callOriginalMethod(b.methodArguments);
            if (!retVal) return;
            //console.log(b.methodArguments);
            const guild = b.methodArguments[0];
            const member = b.methodArguments[1];
            if (member.id !== gcu().id) { // checking for someone else
                return retVal;
            }
            if (retVal.canManageRoles) {
                if (window.ED._readOnlyPerms.indexOf(guild.id) > -1)
                    window.ED._readOnlyPerms.splice(window.ED._readOnlyPerms.indexOf(guild.id), 1);
                return retVal;
            } else { // can't edit roles, but let me view their perms
                if (window.ED._readOnlyPerms.indexOf(guild.id) == -1)
                    window.ED._readOnlyPerms.push(guild.id);
            }
            disButt();
            retVal.canManageRoles = true;
            return retVal;
        });
        //TODO: ^ This method is triggered very often while settings are open. That can cause a lot of lag. Could be partially replaced with the patched version of generateGuildGeneralPermissionSpec if it worked. Perhaps set an interval on disButt instead, but make sure to stop it when settings are closed.

        window.EDApi.monkeyPatch(cp, 'generateChannelGeneralPermissionSpec', function(b) {
            //console.log('channel permissions pane opened', b);
            const guildID = window.EDApi.findModule('getGuildId').getGuildId();
            if (window.ED._readOnlyPerms.indexOf(guildID) > -1) {
                disButt();
                setTimeout(disButt, 690);
            }
            return b.callOriginalMethod(b.methodArguments);
        });
        //TODO: ^ This method tells when channel permissions are opened, but not what channel. Figure out how to get said channel, and make the check channel-specific instead of only checking guild perms

        /*monkeyPatch(cp, 'generateGuildGeneralPermissionSpec', function(b) {
            console.log('guild permissions pane opened', b);
            //if (window.ED._readOnlyPerms.indexOf( magical guild ID ) > -1)
                //setTimeout(disButt, 420);
            return b.callOriginalMethod(b.methodArguments);
        });*/
        //TODO: ^ This method tells when guild permissions are opened, but not what guild. Figure out how to get said guild

        window.EDApi.monkeyPatch(window.EDApi.findModule('hasUnread').__proto__, 'hasUnread', function(b) {
            if (window.ED._hiddenChans.indexOf(b.methodArguments[0]) > -1)
                return false; // don't show hidden channels as unread.
            return b.callOriginalMethod(b.methodArguments);
        });
        window.EDApi.monkeyPatch(window.EDApi.findModule('hasUnread').__proto__, 'hasUnreadPins', function(b) {
            if (window.ED._hiddenChans.indexOf(b.methodArguments[0]) > -1)
                return false; // don't show icon on hidden channel pins.
            return b.callOriginalMethod(b.methodArguments);
        });

        window.EDApi.findModule("dispatch").subscribe("CHANNEL_SELECT", module.exports.dispatchSubscription);

        window.EDApi.monkeyPatch(window.EDApi.findModule("fetchMessages"), "fetchMessages", function(d) {
            if (window.ED._hiddenChans.includes(d.methodArguments[0])) return;
            else return d.callOriginalMethod();
        })
    },

    unload: function() {
        let m = window.EDApi.findModule('hasUnread').__proto__.hasUnread;
        if (m.__monkeyPatched && m.unpatch)
            m.unpatch();
        m = window.EDApi.findModule('hasUnread').__proto__.hasUnreadPins;
        if (m.__monkeyPatched && m.unpatch)
            m.unpatch();
        m = window.EDApi.findModule('fetchMessages').fetchMessages;
        if (m.__monkeyPatched && m.unpatch)
            m.unpatch();
        m = window.EDApi.findModule('computePermissions');

        const shitToUnpatch = ['computePermissions', 'generateChannelGeneralPermissionSpec', 'generateGuildGeneralPermissionSpec'];
        for (const meme of shitToUnpatch) {
            const mod = m[meme];
            if (mod && mod.__monkeyPatched && mod.unpatch)
                mod.unpatch();
        }

        window.EDApi.findModule("dispatch").unsubscribe("CHANNEL_SELECT", module.exports.dispatchSubscription);
    },
    dispatchSubscription: function (data) {
        if (data.type !== "CHANNEL_SELECT") return;

        if (window.ED._hiddenChans.includes(data.channelId)) {
            setTimeout(module.exports.attachHiddenChanNotice,100); // This value could be brought down however I don't know if lower spec users would suffer.
        }
    },
    attachHiddenChanNotice: function () {
        const messagesWrapper = document.querySelector(`.${window.EDApi.findModule("messages").messagesWrapper}`);

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

        hiddenChannelNotif.className = flx.flexCenter; // yikes american spelling
        hiddenChannelNotif.style.width = "100%";

        hiddenChannelNotif.innerHTML = `
        <div class="${flx.flex} ${flx.directionColumn} ${flx.alignCenter}">
        <h2 class="${txt.h2} ${txt.defaultColor}">This is a hidden channel.</h2>
        <h5 class="${txt.h5} ${txt.defaultColor}">You cannot see the contents of this channel. However, you may see its name and topic.</h5>
        </div>
        `

        messagesWrapper.appendChild(hiddenChannelNotif);
    }
});
