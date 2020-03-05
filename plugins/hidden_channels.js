const Plugin = require('../plugin');

let getChannel, g_dc, g_cat, ha, disp, chanM, fm, reb, sv, cs, csp, ghp, gs, gsr, pf, sw = {}, g = {}, ai = {};

// copied from Discord's minified JS
function N(e,o,l,n){let r;r||(r="function"==typeof Symbol&&Symbol.for&&Symbol.for("react.element")||60103);const t=e&&e.defaultProps,f=arguments.length-3;if(o||0===f||(o={children:void 0}),o&&t)for(const e in t)void 0===o[e]&&(o[e]=t[e]);else o||(o=t||{});if(1===f)o.children=n;else if(f>1){const e=new Array(f);for(let o=0;o<f;o++)e[o]=arguments[o+3];o.children=e}return{$$typeof:r,type:e,key:void 0===l?null:""+l,ref:null,props:o,_owner:null}}

module.exports = new Plugin({
    name: 'Hidden Channels',
    description: 'Shows hidden channels and lets you view server permissions.',
    color: 'magenta',
    author: 'Joe 🎸#7070',

    load: async function() {
        disp = window.EDApi.findModule("dispatch");
        getChannel = window.EDApi.findModule('getChannel').getChannel;
        sw = window.EDApi.findModule('switchItem');
        g = window.EDApi.findModule(m => m.group && m.item);
        ai = window.EDApi.findModule('actionIcon');

        const getUser = window.EDApi.findModule('getCurrentUser').getCurrentUser;
        const getAllChannels = window.EDApi.findModule('getChannels').getChannels;
        const can = window.EDApi.findModule('computePermissions').can;

        g_dc = window.EDApi.findModule('getDefaultChannel');
        window.EDApi.monkeyPatch(g_dc, 'getChannels', b => {
            const og = b.callOriginalMethod(b.methodArguments);
            if (!b.methodArguments[0]) return og;
            const hidden = [], allChans = getAllChannels();
            for (const i in allChans) {
                if (allChans[i].guild_id === b.methodArguments[0]) {
                    if (allChans[i].type !== 4 && !can(1024, getUser(), getChannel(allChans[i].id))) {
                        hidden.push(allChans[i]);
                    }
                }
            }
            og.HIDDEN = hidden;
            return og;
        });
        chanM = window.EDApi.findModule(m => m.prototype && m.prototype.isManaged);
        chanM.prototype.isHidden = function() {
            return [0, 4, 5].includes(this.type) && !can(1024, getUser(), this);
        }

        g_cat = window.EDApi.findModule(m => m.getCategories && !m.EMOJI_NAME_RE);
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

        ha = window.EDApi.findModule('hasUnread').__proto__;
        window.EDApi.monkeyPatch(ha, 'hasUnread', function(b) {
            if (getChannel(b.methodArguments[0]) && getChannel(b.methodArguments[0]).isHidden())
                return false; // don't show hidden channels as unread.
            return b.callOriginalMethod(b.methodArguments);
        });
        window.EDApi.monkeyPatch(ha, 'hasUnreadPins', function(b) {
            if (getChannel(b.methodArguments[0]) && getChannel(b.methodArguments[0]).isHidden())
                return false; // don't show icon on hidden channel pins.
            return b.callOriginalMethod(b.methodArguments);
        });

        disp.subscribe("CHANNEL_SELECT", module.exports.dispatchSubscription);

        fm = window.EDApi.findModule("fetchMessages");
        window.EDApi.monkeyPatch(fm, "fetchMessages", function(b) {
            if (getChannel(b.methodArguments[0]) && getChannel(b.methodArguments[0]).isHidden()) return;
            return b.callOriginalMethod(b.methodArguments);
        });

        const clk = window.EDApi.findModuleByDisplayName("Clickable")
        //const icon = window.EDApi.findModuleByDisplayName("Icon");

        reb = window.EDApi.findModule(m => m.default && m.default.prototype && m.default.prototype.renderEditButton).default.prototype;
        /*window.EDApi.monkeyPatch(reb, "renderEditButton", function(b) {
            return N(clk, {
                className: ai.iconItem,
                onClick: function() {
                    module.exports._editingGuild = null;
                    module.exports._editingChannel = b.thisObject.props.channel.id;
                    return b.thisObject.handleEditClick.apply(b.thisObject, arguments);
                },
                onMouseEnter: b.thisObject.props.onMouseEnter,
                onMouseLeave: b.thisObject.props.onMouseLeave
            }, void 0, N(icon, {
                name: "Gear",
                width: 16,
                height: 16,
                className: ai.actionIcon
            }));
        });*/

        sv = window.EDApi.findModuleByDisplayName("SettingsView").prototype;
        window.EDApi.monkeyPatch(sv, 'getPredicateSections', {before: b => {
            const permSect = b.thisObject.props.sections.find(item => item.section === 'PERMISSIONS');
            if (permSect) permSect.predicate = () => true;
        }, silent: true});

        cs = window.EDApi.findModuleByDisplayName("FluxContainer(ChannelSettings)").prototype;
        window.EDApi.monkeyPatch(cs, 'render', b => {
            const egg = b.callOriginalMethod(b.methodArguments);
            egg.props.canManageRoles = true;
            return egg;
        });

        csp = window.EDApi.findModuleByDisplayName("FluxContainer(ChannelSettingsPermissions)").prototype;
        window.EDApi.monkeyPatch(csp, 'render', b => {
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

        ghp = window.EDApi.findModuleByDisplayName("FluxContainer(GuildHeaderPopout)").prototype;
        window.EDApi.monkeyPatch(ghp, 'render', b => {
            const egg = b.callOriginalMethod(b.methodArguments);
            egg.props.canAccessSettings = true;
            return egg;
        });

        gs = window.EDApi.findModuleByDisplayName("FluxContainer(GuildSettings)").prototype;
        window.EDApi.monkeyPatch(gs, 'render', b => {
            const egg = b.callOriginalMethod(b.methodArguments);
            module.exports._editingChannel = null;
            module.exports._editingGuild = egg.props.guild.id;
            egg.props.canManageRoles = true;
            return egg;
        });

        const cancan = window.EDApi.findModuleByProps('can', 'canUser').can;
        gsr = window.EDApi.findModuleByDisplayName("FluxContainer(GuildSettingsRoles)").prototype;
        window.EDApi.monkeyPatch(gsr, 'render', b => {
            const egg = b.callOriginalMethod(b.methodArguments);
            const hasPerm = cancan(268435456, { guildId: egg.props.guild.id });
            if (hasPerm) return;
            setTimeout(() => {
                document.querySelectorAll('.'+sw.switchItem).forEach(elem => elem.classList.add(sw.disabled));
            });
            return egg;
        });

        const getGuild = window.EDApi.findModule('getGuild').getGuild;
        pf = window.EDApi.findModuleByDisplayName("PermissionsForm").prototype;
        window.EDApi.monkeyPatch(pf, 'render', b => {
            const egg = b.callOriginalMethod(b.methodArguments);
            const guild = module.exports._editingGuild ? getGuild(module.exports._editingGuild) : null;
            const channel = module.exports._editingChannel ? getChannel(module.exports._editingChannel) : null;
            if (!guild && !channel) return egg;
            const hasPerm = cancan(268435456, guild ? { guildId: guild.id } : { channelId: channel.id });
            if (hasPerm) return;

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
