const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'TagAll',
    author: 'Joe 🎸#7070',
    description: `Allows you to mention roles and channels you can't normally.`,
    color: 'yellow',

    load: async function() {
        await this.sleep(1000); // wait for hidden channels to load

        const gg = findModule('getGuild'), gc = findModule('getChannels'), gu = findModule('getCurrentUser'), cp = findModule('computePermissions'), lg = findModule('getLastSelectedGuildId'), gsc = findModule('getChannel');

        this.lis = function(e) {
            let text = e.target.value;

            let guildID = lg.getLastSelectedGuildId();
            let g = gg.getGuild(guildID);

            if (!guildID || !g || !text) return;

            // mention unmentionable roles
            let unMen = [];
            for (let id in g.roles)
                if (!g.roles[id].mentionable && !g.roles[id].managed) // ignore bot roles
                    unMen.push(g.roles[id]);

            let roles = unMen.map(r => r.name.toLowerCase().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));
            for (let i in roles) {
                try {
                    text = text.replace( new RegExp('@'+roles[i]+'([^#])', 'gi'), `<@&${unMen[i].id}>$1`);
                } catch(err) {}
            }

            let hiddenChans = [];
            if (window.ED._hiddenChans) { // work with "hidden channels" plugin
                for (let i in window.ED._hiddenChans) {
                    let c = gsc.getChannel(window.ED._hiddenChans[i]);
                    if (c && c.guild_id === guildID) {
                        hiddenChans.push(gsc.getChannel(window.ED._hiddenChans[i]));
                    }
                }
            } else {
                let globalChans = gc.getChannels();
                let me = gu.getCurrentUser();

                let hiddenChans = [];
                for (let id in globalChans) {
                    if (globalChans[id].guild_id == guildID && !(cp.computePermissions(me, globalChans[id]) & 1024))
                        hiddenChans.push(globalChans[id]);
                }
            }
            // mention channels you can't see
            let chans = hiddenChans.map(c => c.name ? c.name.toLowerCase().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") : '');
            for (let i in chans) {
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
