const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'TagAll',
    author: 'Joe 🎸#7070',
    description: `Allows you to mention roles and channels you can't normally.`,
    color: 'yellow',

    load: async function() {
        const gg = EDApi.findModule('getGuild');
        const lg = EDApi.findModule('getLastSelectedGuildId');
        this._gdc = EDApi.findModule('getDefaultChannel');
        this._txt = findModule('ReactMarkdown').defaultRules.text;
        this._rtemp = [];
        
        monkeyPatch(this._txt, 'match', {
            silent: true,
            before: () => {
                const guildID = lg.getLastSelectedGuildId();
                const g = gg.getGuild(guildID);
                if (!g || !g.roles) return;
                
                for (const id in g.roles) {
                    if (!g.roles[id].mentionable) {
                        g.roles[id].mentionable = true;
                        this._rtemp.push(id);
                    }
                }
                /*const chanShit = gdc.getChannels(guildID);
                //console.log(chanShit);
                
                if (!chanShit || !chanShit.HIDDEN) return;
                monkeyPatch(gdc, 'getTextChannelNameDisambiguations', b => {
                    const val = b.callOriginalMethod(b.methodArguments); 
                    console.log(val);
                            
                    for (const i in chanShit.HIDDEN) {
                        val[chanShit[i].id] = {id: chanShit[i].id, name: chanShit[i].name};
                    }

                    console.log(val);
                    
                    return val;
                });*/
            },
            after: () => setTimeout(() => {
                const guildID = lg.getLastSelectedGuildId();
                const g = gg.getGuild(guildID);
                
                while (this._rtemp.length) {
                    g.roles[this._rtemp.pop()].mentionable = false;
                }
                /*if (gdc.getTextChannelNameDisambiguations.unpatch)
                    gdc.getTextChannelNameDisambiguations.unpatch();*/
            }),
        })


        monkeyPatch(this._gdc, 'getTextChannelNameDisambiguations', b => {
            const val = b.callOriginalMethod(b.methodArguments);
            const guildID = lg.getLastSelectedGuildId();
            if (!guildID) return val;
            const chanShit = this._gdc.getChannels(guildID);
            if (!chanShit || !chanShit.HIDDEN) return val;
                    
            for (const c of chanShit.HIDDEN) {
                val[c.id] = {id: c.id, name: c.name};
            }
            
            return val;
        });
    },

    unload: function() {
        if (this._gdc.getTextChannelNameDisambiguations.unpatch)
            this._gdc.getTextChannelNameDisambiguations.unpatch();
        if (this._txt.match.unpatch)
            this._txt.match.unpatch();
    }
});
