const Plugin = require('../plugin');

let getChannel, g_dc, g_cat, ha, disp, chanM, fm, reb, sv, cs, csp, ghp, gs, gsr, pf, sw = {}, g = {}, ai = {};

module.exports = new Plugin({
    name: 'Hidden Channels',
    description: 'Shows hidden channels and lets you view server permissions.',
    color: 'magenta',
    author: 'Joe 🎸#7070',

    load: async function() {
        disp = EDApi.findModule("dispatch");
        getChannel = EDApi.findModule('getChannel').getChannel;
        sw = EDApi.findModule('switchItem');
        g = EDApi.findModule(m => m.group && m.item);
        ai = EDApi.findModule('actionIcon');

        const getUser = EDApi.findModule('getCurrentUser').getCurrentUser;
        const getAllChannels = EDApi.findModule('getGuildChannels').getGuildChannels;
        const can = EDApi.findModule('computePermissions').can;

        g_dc = EDApi.findModule('getDefaultChannel');
        EDApi.monkeyPatch(g_dc, 'getChannels', b => {
            const og = b.callOriginalMethod(b.methodArguments);
            if (!b.methodArguments[0]) return og;
            const hidden = [], allChans = getAllChannels();
            for (const i in allChans) {
                if (allChans[i].guild_id === b.methodArguments[0]) {
                    if (allChans[i].type !== 4 && !can({data: 1024n}, getUser(), getChannel(allChans[i].id))) {
                        hidden.push(allChans[i]);
                    }
                }
            }
            og.HIDDEN = hidden;
            return og;
        });
        chanM = EDApi.findModule(m => m.prototype && m.prototype.isManaged);
        chanM.prototype.isHidden = function() {
            return [0, 4, 5].includes(this.type) && !can({data: 1024n}, getUser(), this);
        }

        g_cat = EDApi.findModule(m => m.getCategories && !m.EMOJI_NAME_RE);
        EDApi.monkeyPatch(g_cat, 'getCategories', b => {
            const og = b.callOriginalMethod(b.methodArguments);
            const chs = g_dc.getChannels(b.methodArguments[0]);
            chs.HIDDEN.forEach(c => {
                const result = og[c.parent_id || "null"].filter(item => item.channel.id === c.id);
                if (result.length) return; // already added
                og[c.parent_id || "null"].push({channel: c, index: 0})
            });
            return og;
        });

        ha = EDApi.findModule('hasUnread').__proto__;
        EDApi.monkeyPatch(ha, 'hasUnread', function(b) {
            if (getChannel(b.methodArguments[0]) && getChannel(b.methodArguments[0]).isHidden())
                return false; // don't show hidden channels as unread.
            return b.callOriginalMethod(b.methodArguments);
        });
        EDApi.monkeyPatch(ha, 'hasUnreadPins', function(b) {
            if (getChannel(b.methodArguments[0]) && getChannel(b.methodArguments[0]).isHidden())
                return false; // don't show icon on hidden channel pins.
            return b.callOriginalMethod(b.methodArguments);
        });

        disp.subscribe("CHANNEL_SELECT", module.exports.dispatchSubscription);

        fm = EDApi.findModule("fetchMessages");
        EDApi.monkeyPatch(fm, "fetchMessages", function(b) {
            if (getChannel(b.methodArguments[0]) && getChannel(b.methodArguments[0]).isHidden()) return;
            return b.callOriginalMethod(b.methodArguments);
        });

        const clk = window.EDApi.findModuleByDisplayName("Clickable")
        const Tooltip = window.EDApi.findModule('TooltipContainer').TooltipContainer;
        const { Messages } = window.EDApi.findModule('Messages');
        const getIcon = window.EDApi.findModule(m => m.id && typeof m.keys === 'function' && m.keys().includes('./Gear'));
        const Gear = getIcon('./Gear').default;

        reb = window.EDApi.findModule(m => m.default && m.default.prototype && m.default.prototype.renderEditButton).default.prototype;
        window.EDApi.monkeyPatch(reb, "renderEditButton", function(b) {
            return window.EDApi.React.createElement(Tooltip, { text: Messages.EDIT_CHANNEL }, window.EDApi.React.createElement(clk, {
                className: ai.iconItem,
                onClick: function() {
                    module.exports._editingGuild = null;
                    module.exports._editingChannel = b.thisObject.props.channel.id;
                    return b.thisObject.handleEditClick.apply(b.thisObject, arguments);
                },
                onMouseEnter: b.thisObject.props.onMouseEnter,
                onMouseLeave: b.thisObject.props.onMouseLeave
            }, window.EDApi.React.createElement(Gear, {
                width: 16,
                height: 16,
                className: ai.actionIcon
            })));
        });

        sv = EDApi.findModuleByDisplayName("SettingsView").prototype;
        EDApi.monkeyPatch(sv, 'getPredicateSections', {before: b => {
            const permSect = b.thisObject.props.sections.find(item => item.section === 'PERMISSIONS');
            if (permSect) permSect.predicate = () => true;
        }, silent: true});

        cs = EDApi.findModuleByDisplayName("FluxContainer(ChannelSettings)").prototype;
        EDApi.monkeyPatch(cs, 'render', b => {
            const egg = b.callOriginalMethod(b.methodArguments);
            egg.props.canManageRoles = true;
            return egg;
        });

        csp = EDApi.findModuleByDisplayName("FluxContainer(ChannelSettingsPermissions)").prototype;
        EDApi.monkeyPatch(csp, 'render', b => {
            const egg = b.callOriginalMethod(b.methodArguments);
            const chan = getChannel(egg.props.channel.id);
            if (!chan || !chan.isHidden()) return egg;
            egg.props.canSyncChannel = false;
            egg.props.locked = true;
            setTimeout(() => {
                document.querySelectorAll('.'+g.group).forEach(elem => elem.style = "opacity: 0.5; pointer-events: none;");
            });
            return egg;
        });

        /*ghp = EDApi.findModuleByDisplayName("FluxContainer(GuildHeaderPopout)").prototype;
        EDApi.monkeyPatch(ghp, 'render', b => {
            const egg = b.callOriginalMethod(b.methodArguments);
            egg.props.canAccessSettings = true;
            return egg;
        });

        gs = EDApi.findModuleByDisplayName("FluxContainer(GuildSettings)").prototype;
        EDApi.monkeyPatch(gs, 'render', b => {
            const egg = b.callOriginalMethod(b.methodArguments);
            module.exports._editingChannel = null;
            module.exports._editingGuild = egg.props.guild.id;
            egg.props.canManageRoles = true;
            return egg;
        });*/

        const cancan = EDApi.findModuleByProps('can', 'canUser').can;
        gsr = EDApi.findModuleByDisplayName("FluxContainer(GuildSettingsRoles)").prototype;
        EDApi.monkeyPatch(gsr, 'render', b => {
            const egg = b.callOriginalMethod(b.methodArguments);
            const hasPerm = cancan({data: 268435456n}, { guildId: egg.props.guild.id });
            if (hasPerm) return;
            setTimeout(() => {
                document.querySelectorAll('.'+sw.switchItem).forEach(elem => elem.classList.add(sw.disabled));
            });
            return egg;
        });

        const getGuild = EDApi.findModule('getGuild').getGuild;
        pf = EDApi.findModuleByDisplayName("PermissionsForm").prototype;
        EDApi.monkeyPatch(pf, 'render', b => {
            const egg = b.callOriginalMethod(b.methodArguments);
            const guild = module.exports._editingGuild ? getGuild(module.exports._editingGuild) : null;
            const channel = module.exports._editingChannel ? getChannel(module.exports._editingChannel) : null;
            if (!guild && !channel) return egg;
            const hasPerm = cancan({data: 268435456n}, guild ? { guildId: guild.id } : { channelId: channel.id });
            if (hasPerm) return egg;

            if (!egg.props.children || !egg.props.children[1]) return egg;
            egg.props.children[1].forEach(item => {item.disabled = true; item.props.disabled = true;});
            return egg;
        });
    },
    unload: function() {
        g_dc.getChannels.unpatch();
        g_cat.getCategories.unpatch();
        ha.hasUnread.unpatch();
        ha.hasUnreadPins.unpatch();
        fm.fetchMessages.unpatch();
        reb.renderEditButton.unpatch();

        for (const mod of [sv, cs, csp, ghp, gs, gsr, pf])
            if (mod && mod.render && mod.render.unpatch) mod.render.unpatch();

        disp.unsubscribe("CHANNEL_SELECT", module.exports.dispatchSubscription);
    },
    dispatchSubscription: function (data) {
        if (data.type !== "CHANNEL_SELECT") return;

        if (getChannel(data.channelId) && getChannel(data.channelId).isHidden()) {
            setTimeout(module.exports.attachHiddenChanNotice);
        }
    },
    attachHiddenChanNotice: function () {
        const messagesWrapper = document.querySelector(`.${EDApi.findModule("messagesWrapper").messagesWrapper}`);
        if (!messagesWrapper) return;

        messagesWrapper.firstChild.style.display = "none"; // Remove messages shit.
        messagesWrapper.parentElement.children[1].style.display = "none"; // Remove message box.
        messagesWrapper.parentElement.parentElement.children[1].style.display = "none"; // Remove user list.

        const toolbar = document.querySelector("."+EDApi.findModule(m => {
            if (m instanceof Window) return;
            if (m.toolbar && m.selected) return m;
        }).toolbar);

        toolbar.style.display = "none";

        const hiddenChannelNotif = document.createElement("div");

        // Class name modules
        const txt = EDApi.findModule("h5");
        const flx = EDApi.findModule("flex");

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
