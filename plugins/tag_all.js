const Plugin = require('../plugin');

let gg = {}, gc = {}, gu = {}, cp = {}, lg = {}, gsc = {};

module.exports = new Plugin({
    name: 'TagAll',
    author: 'Joe 🎸#7070',
    description: `Allows you to mention roles and channels you can't normally.`,
    color: 'yellow',

    load: async function() {
        await this.sleep(1000); // wait for hidden channels to load

        gg = EDApi.findModule('getGuild');
        gc = EDApi.findModule('getChannels');
        gu = EDApi.findModule('getCurrentUser');
        cp = EDApi.findModule('computePermissions');
        lg = EDApi.findModule('getLastSelectedGuildId');
        gsc = EDApi.findModule('getChannel');

        this.lis = function(e) {
            let text = e.target.value;

            const guildID = lg.getLastSelectedGuildId();
            const g = gg.getGuild(guildID);

            if (!guildID || !g || !text) return;

            // mention unmentionable roles
            const unMen = [];
            for (const id in g.roles)
                if (!g.roles[id].mentionable && !g.roles[id].managed) // ignore bot roles
                    unMen.push(g.roles[id]);

            const roles = unMen.map(r => r.name.toLowerCase().replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&"));
            for (const i in roles) {
                if (!roles[i]) continue; // empty role names
                try {
                    text = text.replace( new RegExp('@'+roles[i]+'([^#])', 'gi'), `<@&${unMen[i].id}>$1`);
                } catch(err) {/*do nothing*/}
            }

            const hiddenChans = [];
            if (ED._hiddenChans) { // work with "hidden channels" plugin
                for (const i in ED._hiddenChans) {
                    const c = gsc.getChannel(ED._hiddenChans[i]);
                    if (c && c.guild_id === guildID) {
                        hiddenChans.push(gsc.getChannel(ED._hiddenChans[i]));
                    }
                }
            } else {
                const globalChans = gc.getChannels();
                const me = gu.getCurrentUser();

                const hiddenChans = [];
                for (const id in globalChans) {
                    if (globalChans[id].guild_id == guildID && !(cp.computePermissions(me, globalChans[id]) & 1024))
                        hiddenChans.push(globalChans[id]);
                }
            }
            // mention channels you can't see
            const chans = hiddenChans.map(c => c.name ? c.name.toLowerCase().replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&") : '');
            for (const i in chans) {
                if (!chans[i]) continue;
                text = text.replace( new RegExp('#'+chans[i]+'(\\s)', 'gi'), `<#${hiddenChans[i].id}>$1`);
            }
            if (e.target.value == text) return;

            e.target.value = text;
        };
        document.addEventListener("input", this.lis);
    },

    unload: function() {
        document.removeEventListener("input", this.lis);
        this.lis = null;
    }
});
