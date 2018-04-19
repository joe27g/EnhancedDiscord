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
        let current = this.settings.pack, stuff = this.config.pack.allowed;
        let result = `<div class="description-3MVziF formText-1L-zZB marginBottom8-1mABJ4 marginTop8-2gOa2N modeDefault-389VjU primary-2giqSn">Replace Discord's emojis with a set stolen from somewhere else :^)<br>NOTE: the emoji packs are incomplete. If you know a better place to obtain the images, say so in the support server.</div><h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom8-1mABJ4 marginTop8-2gOa2N">[Requires restart to take full effect]</h5><div class="radioGroup-2P3MJo margin-bottom-40" id="ed-emoji-pack">`;
        for (let key in stuff) {
            result += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyBetween-1d1Hto alignCenter-3VxkQP noWrap-v6g9vO item-3tXG-o${current == key || (!current && this.config.pack.default) == key ? ' selected-3XmEtI' : ''}" style="flex: 1 1 auto;"><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO label-1e_dsR" style="flex: 0 1 auto;"><label class="checkboxWrapper-2Yvr_Y checkbox-3TvRoo flexChild-1KGW5q"><input type="checkbox" class="inputReadonly-1t0gSm input-oWyROL" value="on"><div id="${key}" class="ed-emoji-pack checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP round-30vw42${current == key || (!current && this.config.pack.default) == key ? ' checked-2TahvT' : ''}" style="flex: 1 1 auto;${current == key || (!current && this.config.pack.default) == key ? ' background-color: rgb(67, 181, 129); border-color: rgb(67, 181, 129);' : ''}"><svg name="Checkmark" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><polyline stroke="transparent" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg></div></label><h3 class="h3-gDcP8B title-1pmpPr size16-3IvaX_ height24-2pMcnc weightMedium-13x9Y8 defaultColor-v22dK1 labelText-16HDq2 marginReset-3ymHSV marginReset-3hwONl" style="flex: 1 1 auto;">${stuff[key].split(' | ')[0]}</h3></div><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO" style="flex: 0 1 auto;"><div class="description-3MVziF formText-1L-zZB marginReset-3ymHSV marginReset-3hwONl modeDefault-389VjU primary-2giqSn" style="flex: 1 1 auto;">${stuff[key].split(' | ')[1]}</div>`+/*<img src="/assets/3590df6f2ae2f7202dab15c0bd3aca9a.png" class="image-1ileLu noUserDrag-aLJFCB flexChild-1KGW5q" style="flex: 1 1 auto;">*/`</div></div>`;
        }
        result += '</div>';
        return result;
    },
    settingListeners: {
        '#ed-emoji-pack': function(e) {
            //console.log(e.target, this);
            if (!e.target.className || e.target.className.indexOf('flex-lFgbSz') == -1) return;

            let gay = document.querySelector('.selected-3XmEtI');
            if (gay)
                gay.className = gay.className.replace(' selected-3XmEtI', '');
            e.target.className += ' selected-3XmEtI';

            let cs = document.querySelector('.ed-emoji-pack.checked-2TahvT');
            if (cs) {
                cs.className = cs.className.replace(' checked-2TahvT', '');
            /*let cb = document.querySelector('[style="flex: 1 1 auto; background-color: rgb(67, 181, 129); border-color: rgb(67, 181, 129);"]');*/
            //if (cb)
                cs.style = 'flex: 1 1 auto;';
            }

            //cs = e.target.previousElementSibling;
            let cb = e.target.querySelector('.ed-emoji-pack');
            if (cb) {
                cb.className += ' checked-2TahvT';
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
