const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Hidden Channels',
    description: 'Shows hidden channels n stuff.',
    color: 'magenta',
    author: 'Joe 🎸#7070',
    id: 'hidden_channels',

    load: async function() {
        while (!document.querySelector(".channels-3g2vYe") || !findModule('getGuild', true) || !findModule('getChannels', true) || !findModule('getCurrentUser', true) || !findModule('computePermissions', true) || !findModule('getLastSelectedGuildId', true))
            await this.sleep(1000);

        this.mo = new MutationObserver(this.rebuildHidden.bind(this));
        this.mo.observe(document.querySelector(".channels-3g2vYe"), { childList: true, subtree: true });

        this.m = { //modules ~ only find them once
            gg: findModule('getGuild'),
            lg: findModule('getLastSelectedGuildId'),
            gc: findModule('getChannels'),
            gu: findModule('getCurrentUser'),
            cp: findModule('computePermissions')
        };
    },

    rebuildHidden: function() {
        const $ = require('jquery');

        this.mo.disconnect(); // Prevent loop

        var guildID = this.m.lg.getLastSelectedGuildId();
        var g = this.m.gg.getGuild(guildID);
        
        if (g && !document.getElementById(`hc-${guildID}`)) {
            $('.hidden-channels').remove();

            let globalChans = this.m.gc.getChannels();
            let me = this.m.gu.getCurrentUser();
            let hiddenChans = [];
            for (let id in globalChans) {
                if (globalChans[id].guild_id == guildID && !(this.m.cp.computePermissions(me, globalChans[id]) & 1024))
                    hiddenChans.push(globalChans[id]);
            }
            //this.log(hiddenChans);

            //var hiddenChans = g.channels.filter(c => !c.permissionsFor(DI.client.user).has('READ_MESSAGES'));
            $('.scroller-NXV0-d').append(`<div class="hidden-channels" id="hc-${guildID}">`);

            /*$('hidden-channels .nameDefault-Lnjrwm').hover((e) => {
                $(e.target).addClass('nameHovered-1FYSWq');
            }, (e) => {
                $(e.target).removeClass('nameHoveredCollapsed-2c-EHI');
            });*/
            

            if (hiddenChans.length > 0 && $('.hidden-channels').length < 2) {
                $('.hidden-channels').append('<div class="containerDefault-1bbItS" draggable="true"><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO wrapperDefault-1Dl4SS cursorPointer-3oKATS" style="flex: 1 1 auto;"><svg class="iconDefault-xzclSQ iconTransition-VhWJ85" width="12" height="12" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 10L12 15 17 10"></path></svg><div class="nameDefault-Lnjrwm colorTransition-2iZaYd overflowEllipsis-2ynGQq" style="flex: 1 1 auto;">Hidden Channels</div></div></div>');

                for (let i in hiddenChans) {
                    let c = hiddenChans[i];
                    if (document.getElementById('hidden-'+c.id)) continue;
                    $('.hidden-channels').append(`<div class="containerDefault-7RImuF" id="hidden-${c.id}"><div class="wrapperDefaultText-3M3F1R wrapper-fDmxzK"><div class="contentDefaultText-2elG3R content-2mSKOj"><div class="marginReset-1YolDJ" style="flex: 0 0 auto;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="colorDefaultText-2v6rRX icon-3tVJnl"><path class="background-2nyTH_" fill="currentColor" d="M7.92,4.66666667 L6.50666667,4.66666667 L6.98,2 L5.64666667,2 L5.17333333,4.66666667 L2.50666667,4.66666667 L2.27333333,6 L4.94,6 L4.23333333,10 L1.56666667,10 L1.33333333,11.3333333 L4,11.3333333 L3.52666667,14 L4.86,14 L5.33333333,11.3333333 L9.33333333,11.3333333 L8.86,14 L10.1933333,14 L10.6666667,11.3333333 L13.3333333,11.3333333 L13.5666667,10 L12.2333333,10 L8.74333333,10 L5.56666667,10 L6.27333333,6 L7.92,6 L7.92,4.66666667 Z"></path><path class="foreground-2zy1hc" fill="currentColor" fill-rule="nonzero" d="M15.1,3.2 L15.1,2 C15.1,0.88 14.05,0 13,0 C11.95,0 10.9,0.88 10.9,2 L10.9,3.2 C10.45,3.2 10,3.68 10,4.16 L10,6.96 C10,7.52 10.45,8 10.9,8 L15.025,8 C15.55,8 16,7.52 16,7.04 L16,4.24 C16,3.68 15.55,3.2 15.1,3.2 Z M14,3 L12,3 L12,1.92857143 C12,1.35714286 12.4666667,1 13,1 C13.5333333,1 14,1.35714286 14,1.92857143 L14,3 Z"></path></svg></div><div class="nameDefaultText-QoumjC name-2SL4ev overflowEllipsis-3Rxxjf" style="flex: 1 1 auto;">${c.name}</div><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginReset-1YolDJ" style="flex: 0 1 auto;"></div></div></div></div>`);
                };
            }
        }
        
        this.mo.observe(document.querySelector(".channels-3g2vYe"), { childList: true, subtree: true });
    },
    
    unload: function() {
        let hc = document.querySelector('.hidden-channels');
        if (hc)
            hc.parentElement.removeChild(hc);
        if (this.mo)
            this.mo.disconnect();
    }
});