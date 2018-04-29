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
        let result = `<div class="description-3_Ncsb formText-3fs7AJ marginBottom8-AtZOdT marginTop8-1DLZ1n modeDefault-3a2Ph1 primary-jw0I4K">Replace Discord's emojis with a set stolen from somewhere else :^)<br>NOTE: the emoji packs are incomplete. If you know a better place to obtain the images, say so in the support server.</div><h5 class="h5-18_1nd title-3sZWYQ size12-3R0845 height16-2Lv3qA weightSemiBold-NJexzi defaultMarginh5-2mL-bP marginBottom8-AtZOdT marginTop8-1DLZ1n">[Requires restart to take full effect]</h5><div class="radioGroup-1GBvlr margin-bottom-40" id="ed-emoji-pack">`;
        for (let key in stuff) {
            result += `<div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyBetween-2tTqYu alignCenter-1dQNNs noWrap-3jynv6 item-3eFBNF${current == key || (!current && this.config.pack.default) == key ? ' selected-2DeaDa' : ''}" style="flex: 1 1 auto;"><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 label-1ZuVT-" style="flex: 0 1 auto;"><label class="checkboxWrapper-SkhIWG checkbox-3qBG_9 flexChild-faoVW3"><input type="checkbox" class="inputReadonly-rYU97L input-3ITkQf" value="on"><div id="${key}" class="ed-emoji-pack checkbox-1ix_J3 flexCenter-3_1bcw flex-1O1GKY justifyCenter-3D2jYp alignCenter-1dQNNs round-2jCFai${current == key || (!current && this.config.pack.default) == key ? ' checked-3_4uQ9' : ''}" style="flex: 1 1 auto;${current == key || (!current && this.config.pack.default) == key ? ' background-color: rgb(67, 181, 129); border-color: rgb(67, 181, 129);' : ''}"><svg name="Checkmark" width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><polyline stroke="transparent" stroke-width="2" points="3.5 9.5 7 13 15 5"></polyline></g></svg></div></label><h3 class="h3-3PDeKG title-3sZWYQ size16-14cGz5 height24-3XzeJx weightMedium-2iZe9B defaultColor-1_ajX0 labelText-2kBs7x marginReset-2pBy6s marginReset-236NPn" style="flex: 1 1 auto;">${stuff[key].split(' | ')[0]}</h3></div><div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6" style="flex: 0 1 auto;"><div class="description-3_Ncsb formText-3fs7AJ marginReset-2pBy6s marginReset-236NPn modeDefault-3a2Ph1 primary-jw0I4K" style="flex: 1 1 auto;">${stuff[key].split(' | ')[1]}</div>`+/*<img src="/assets/3590df6f2ae2f7202dab15c0bd3aca9a.png" class="image-z8whH4 noUserDrag-5Mb43F flexChild-faoVW3" style="flex: 1 1 auto;">*/`</div></div>`;
        }
        result += '</div>';
        return result;
    },
    settingListeners: {
        '#ed-emoji-pack': function(e) {
            //console.log(e.target, this);
            if (!e.target.className || e.target.className.indexOf('flex-1xMQg5') == -1) return;

            let gay = document.querySelector('.selected-2DeaDa');
            if (gay)
                gay.className = gay.className.replace(' selected-2DeaDa', '');
            e.target.className += ' selected-2DeaDa';

            let cs = document.querySelector('.ed-emoji-pack.checked-3_4uQ9');
            if (cs) {
                cs.className = cs.className.replace(' checked-3_4uQ9', '');
            /*let cb = document.querySelector('[style="flex: 1 1 auto; background-color: rgb(67, 181, 129); border-color: rgb(67, 181, 129);"]');*/
            //if (cb)
                cs.style = 'flex: 1 1 auto;';
            }

            //cs = e.target.previousElementSibling;
            let cb = e.target.querySelector('.ed-emoji-pack');
            if (cb) {
                cb.className += ' checked-3_4uQ9';
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
