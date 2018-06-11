const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Emoji Packs',
    author: 'Joe 🎸#7070',
    description: "Replaces Discord's default emojis with different ones of your choice.",
    color: 'maroon',

    config: {
        pack: {
            default: 'none',
            allowed: {
                none: 'Default | Default emojis used by Discord (and Twitter.)',
                blobs: 'Blobs | Google Blob Emoji (Android Lollipop and earlier.) <a href="https://emojipedia.org/google/android-7.1/" target="_blank">Preview</a>',
                emojione: 'EmojiOne | A simple emoji pack built for use by apps and web services. <a href="https://emojipedia.org/emojione/" target="_blank">Preview</a>',
                windows: 'Windows | Emoji pack used by Windows and other Microsoft products. <a href="https://emojipedia.org/microsoft/" target="_blank">Preview</a>',
                samsung: 'Samsung | Emojis used in Samsung phones and devices. <a href="https://emojipedia.org/samsung/" target="_blank">Preview</a>',
                apple: 'Apple | Emojis used on iPhones, macOS, etc. [NOTE: incomplete ~ many emojis won\'t work] <a href="https://emojipedia.org/apple/" target="_blank">Preview</a>',
                google: 'Google | Google Emoji (Android Oreo and later.) <a href="https://emojipedia.org/google/" target="_blank">Preview</a>',
                facebook: 'Facebook | Emoji used on Facebook. <a href="https://emojipedia.org/facebook/" target="_blank">Preview</a>',
                fbmessenger: 'Facebook Messenger | Emoji used in the older versions of Facebook Messenger. <a href="https://emojipedia.org/messenger/" target="_blank">Preview</a>'
            }
        }
    },

    load: async function() {

        while (!findModule('getURL', true) || !findModule('convert', true))
            await this.sleep(1000);

        let formats = {
            'blobs': 'https://raw.githubusercontent.com/googlei18n/noto-emoji/563fa14298e103d54b81b370668f1c92370273da/png/128/emoji_u{code_}.png',
            'emojione': 'https://www.emojiok.com/resolution/static/img/emoji/std/one/{code}.png',
            'windows': 'https://www.emojiok.com/resolution/static/img/emoji/wind/20170529/{code}.png',
            'samsung': 'https://www.emojiok.com/resolution/static/img/emoji/sams/20170529/{code}.png',
            'apple': 'https://www.emojiok.com/resolution/static/img/emoji/appl/20170514/u{codE}.png', // UNRELIABLE
            'google': 'https://github.com/googlei18n/noto-emoji/blob/master/png/128/emoji_u{code_}.png?raw=true', // after redesign
            'facebook': 'https://www.emojiok.com/resolution/static/img/emoji/std/fb/{code}.png',
            'fbmessenger': 'https://www.emojiok.com/resolution/static/img/emoji/std/fbm/{code}.png',
        };

        window.emojiMode = 'blobs';

        const c = findModule('convert').convert;

        let thiss = this;

        monkeyPatch( findModule('getURL'), 'getURL', function() {
            if (!thiss.settings.pack || !formats[thiss.settings.pack])
                return arguments[0].callOriginalMethod(arguments[0].methodArguments);

            return formats[thiss.settings.pack]
                .replace('{code}', c.toCodePoint(arguments[0].methodArguments[0]))
                .replace('{codE}', c.toCodePoint(arguments[0].methodArguments[0]).toUpperCase())
                .replace('{code_}', c.toCodePoint(arguments[0].methodArguments[0]).replace(/-/g, '_'))
        })
    },
    unload: function() {
        findModule('getURL').getURL.unpatch();
    },
    generateSettings: function() {
        const a = window.ED.classMaps.alignment;
        const d = window.ED.classMaps.description;
        const h = window.ED.classMaps.headers;
        const l = window.ED.classMaps.labels = findModule('labelText');
        const cbw = window.ED.classMaps.cbWrapper = findModule('checkboxWrapper');
        const fc = findModule('flexChild');

        let current = this.settings.pack, stuff = this.config.pack.allowed;
        let result = `<div class="${d.description} ${d.modeDefault}">Replace Discord's emojis with a set stolen from somewhere else :^)<br>NOTE: the emoji packs are incomplete. If you know a better place to obtain the images, say so in the support server.</div><h5 class="${h.h5}">[Requires restart to take full effect]</h5><div class="radioGroup-2P3MJo margin-bottom-40" id="ed-emoji-pack">`;
        for (let key in stuff) {
            result += `<div class="${a.horizontal} ${a.justifyBetween} ${a.alignCenter} ${a.noWrap} ${l.item}${current == key || (!current && this.config.pack.default) == key ? ' ' + l.selected : ''}" style="flex: 1 1 auto;"><div class="${fc.horizontal} ${a.justifyStart} ${a.alignStretch} ${a.noWrap} ${l.label}" style="flex: 0 1 auto;"><label class="${cbw.checkboxWrapper} ${l.checkbox} ${fc.flexChild}"><input type="checkbox" class="${cbw.inputReadonly}" value="on"><div id="${key}" class="ed-emoji-pack ${cbw.checkbox} ${cbw.round}${current == key || (!current && this.config.pack.default) == key ? ' ' + cbw.checked : ''}" style="flex: 1 1 auto;${current == key || (!current && this.config.pack.default) == key ? ' background-color: rgb(67, 181, 129); border-color: rgb(67, 181, 129);' : ''}"><svg name="Checkmark" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><polyline stroke="transparent" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg></div></label><h3 class="${h.h3} ${h.defaultColor} ${l.labelText}" style="flex: 1 1 auto;">${stuff[key].split(' | ')[0]}</h3></div><div class="${a.horizontal} ${a.justifyStart} ${a.alignStretch} ${a.noWrap}" style="flex: 0 1 auto;"><div class="${d.description} ${d.modeDefault}" style="flex: 1 1 auto;">${stuff[key].split(' | ')[1]}</div>`+/*<img src="/assets/3590df6f2ae2f7202dab15c0bd3aca9a.png" class="image-1ileLu noUserDrag-aLJFCB flexChild-1KGW5q" style="flex: 1 1 auto;">*/`</div></div>`;
        }
        result += '</div>';
        return result;
    },
    settingListeners: {
        '#ed-emoji-pack': function(e) {
            const l = window.ED.classMaps.labels;
            const cbw = window.ED.classMaps.cbWrapper;

            //console.log(e.target, this);
            if (!e.target.className || e.target.className.indexOf('horizontal-') == -1) return;

            let gay = document.querySelector('.' + l.selected);
            if (gay)
                gay.className = gay.className.replace(' ' + l.selected, '');
            e.target.className += ' ' + l.selected;

            let cs = document.querySelector('.ed-emoji-pack.' + cbw.checked);
            if (cs) {
                cs.className = cs.className.replace(' ' + cbw.checked, '');
            /*let cb = document.querySelector('[style="flex: 1 1 auto; background-color: rgb(67, 181, 129); border-color: rgb(67, 181, 129);"]');*/
            //if (cb)
                cs.style = 'flex: 1 1 auto;';
            }

            //cs = e.target.previousElementSibling;
            let cb = e.target.querySelector('.ed-emoji-pack');
            if (cb) {
                cb.className += ' ' + cbw.checked;
            //cb = cs.querySelector(`#${cb.id}[style="flex: 1 1 auto;"]`);
            //if (cb)
                cb.style = "flex: 1 1 auto; background-color: rgb(67, 181, 129); border-color: rgb(67, 181, 129);";
            }
            let ssssss = module.exports.settings || {};
            ssssss.pack = cb.id || 'none';
            module.exports.settings = ssssss;
        }
    }
});
