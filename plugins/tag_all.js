const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'TagAll',
    author: 'Joe 🎸#7070',
    description: `Allows you to mention roles and channels you can't normally.`,
    color: 'yellow',
    id: 'tag_all',

    load: async function() {
        const $ = require('jquery');

        while (!findModule('getGuild', true) || !findModule('getChannels', true) || !findModule('getCurrentUser', true) || !findModule('computePermissions', true) || !findModule('getLastSelectedGuildId', true))
            await this.sleep(1000);

        let gg = findModule('getGuild'), gc = findModule('getChannels'), gu = findModule('getCurrentUser'), cp = findModule('computePermissions'), lg = findModule('getLastSelectedGuildId');

        this.lis = function(e) {
            let text = e.target.value;

            let guildID = lg.getLastSelectedGuildId();
            let g = gg.getGuild(guildID);

            if (!guildID || !g || !text) return;

            // mention unmentionable roles
            let unMen = [];
            for (let id in g.roles)
                if (!g.roles[id].mentionable && !g.roles[id].managed) // ignore bot roles
                    unMen.push(g.roles[id].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));

            let roles = unMen.map(r => r.name.toLowerCase());
            for (let i in roles) {
                try {
                    text = text.replace( new RegExp('@'+roles[i]+'([^#])?', 'gi'), `<@&${unMen[i].id}>$1`);
                } catch(err) {}
            }

            // mention channels you can't see
            let globalChans = gc.getChannels();
            let me = gu.getCurrentUser();

            let hiddenChans = [];
            for (let id in globalChans) {
                if (globalChans[id].guild_id == guildID && !(cp.computePermissions(me, globalChans[id]) & 1024))
                    hiddenChans.push(globalChans[id].replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));
            }

            let chans = hiddenChans.map(c => c.name.toLowerCase());
            for (let i in chans) {
                text = text.replace('#'+chans[i], `<#${hiddenChans[i].id}>`);
            }
            if (e.target.value == text) return;

            e.target.value = text;
        };
        $(document).on("keypress.ts", this.lis);
    },

    unload: function() {
        document.removeEventListener("keypress.ts", this.lis);
        this.lis = null;
    }
});