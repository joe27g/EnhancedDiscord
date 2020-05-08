const Plugin = require('../plugin');
const fs = require('fs');
const path = require('path');
const propMap = {
    bg_color: 'bg',
    bg_opacity: 'bg-overlay'
}

module.exports = new Plugin({
    name: 'CSS Settings',
    author: 'Joe 🎸#7070',
    description: 'Allows you to modify options for the default theme.',
    color: 'blue',

    load: () => {},
    unload: () => {},

    customLoad: function(prop) {
        const st = ED.plugins.css_loader.settings;
        if (!prop || !st || !st.path) return;
        const cssPath = path.isAbsolute(st.path) ? st.path : path.join(process.env.injDir, st.path);

        let content;
        try {
            content = fs.readFileSync(cssPath, 'utf-8');
        } catch (e) {
            this.error(e);
            return null;
        }

        const lines = content.split(/[\r\n][\r\n]?/).filter(l => l);
        for (const i in lines) {
            if (lines[i] && lines[i].match(/^\s*(?:\/\*)?\s*--/)) {
                const reg = new RegExp(`--${propMap[prop] || prop}: ([^;]+);`);
                const matches = lines[i].match(reg);
                if (!matches) continue;
                const raw = matches[1];
                if (!raw) continue;

                if (prop === 'bg' && raw.startsWith('url(')) {
                    return raw.substring(4, raw.length - 1)
                } else if (prop === 'bg') {
                    return null;
                }
                if (prop === 'bg_color' && !raw.startsWith('url(')) {
                    return raw;
                } else if (prop === 'bg_color') {
                    return null;
                }
                if (prop === 'bg_opacity' && raw.startsWith('rgba(')) {
                    const str = raw.substring(5, raw.length - 1).split(',').pop();
                    if (!str) return null;
                    return 100 - Math.round(parseFloat(str)*100);
                } else if (prop === 'bg_opacity') {
                    return 100;
                } else if (prop === 'gift-button' || prop === 'gif-picker') {
                    return raw === 'none' ? false : true;
                }
                // TODO: proper transparency support?
                return raw;
            }
        }
    },
    customSave: function(prop, data) {
        let varName = prop, finalValue = data;
        switch (prop) {
            case 'bg':
                if (data) {
                    if (!data.startsWith('https://') && !data.startsWith('http://'))
                        EDApi.showToast('Warning: This location probably won\'t work - it needs to be a remote URL, not a local file.')
                    finalValue = `url(${data})`;
                } else {
                    finalValue = 'transparent'
                }
                break;
            case 'bg_color':
                varName = 'bg';
                finalValue = data || 'transparent';
                break;
            case 'bg_opacity':
                varName = 'bg-overlay';
                finalValue = `rgba(0, 0, 0, ${(100 - data) / 100.0})`;
                break;
            case 'typing-height':
                finalValue = finalValue || 0;
                break;
            case 'gift-button':
            case 'gif-picker':
                finalValue = finalValue ? 'flex' : 'none';
                break;
            default:
                finalValue = data || 'transparent';
            // TODO: proper transparency support?
        }
        const reg = new RegExp(`--${varName}: ([^;]+);`);

        const st = ED.plugins.css_loader.settings;
        if (!st || !st.path) return;
        const cssPath = path.isAbsolute(st.path) ? st.path : path.join(process.env.injDir, st.path);

        fs.readFile(cssPath, 'utf-8', (err, content) => {
            if (err) return module.exports.error(err);
            const lines = content.split(/\r\n/g);
            let changed = false;
            for (const i in lines) {
                if (lines[i] && reg.test(lines[i])) {
                    lines[i] = lines[i].replace(reg, `--${varName}: ${finalValue};`);
                    changed = true;
                }
            }
            if (changed) {
                fs.writeFile(cssPath, lines.join('\n'), err => {
                    if (err) {
                        EDApi.showToast('Error saving: '+err);
                        return module.exports.error(err);
                    }
                    EDApi.showToast('Saved.');
                    return;
                })
            } else {
                return EDApi.showToast('Already saved.');
            }
        });
    },

    settingsSectionName: 'Theme Settings',
    generateSettingsSection: function() {
        if (!ED.plugins.css_loader || !ED.customCss || !ED.customCss.innerHTML || (!ED.customCss.innerHTML.includes("enhanceddiscord.com/theme") && !ED.customCss.innerHTML.includes("EnhancedDiscord Theme"))) return;

        const els = [{
            type: "input:text",
            configName: "bg",
            title: "Background Image",
            desc: "Must be a remote URL, not a local file."
        }, {
            type: "input:colorpicker",
            title: 'Background Color',
            configName: "bg_color",
            desc: "Set your background to a simple color rather than an image. See the list of [valid css colors](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value).",
            colors: [0x3C0D0D, 0x0D3C13, 0x0D193C, 0x250D3C, 0x4B1741, 0x552A13, 0x2D261F, 0x153538, 0x000000, 0x151515],
            defaultColor: 0x36393F
        }, {
            type: "input:slider",
            configName: "bg_opacity",
            title: "Background Opacity",
            desc: "Opacity of the background image underneath other elements. Lowering it increases readability.",
            defaultValue: 20,
            highlightDefaultValue: true,
            markers: [
                0,10,20,30,40,50,60,69,80,90,100
            ],
            formatTooltip: e => e.toFixed(0)+'%',
            minValue: 0,
            maxValue: 100,
        }, {
            type: "input:boolean",
            title: "Nitro gift button",
            configName: "gift-button",
            note: "Show Nitro gift button in the chat textarea (next to emoji picker or gif picker)"
        }, {
            type: "input:boolean",
            title: "GIF picker",
            configName: "gif-picker",
            note: "Show GIF picker button in the chat textarea (next to emoji picker)"
        }, {
            type: "input:colorpicker",
            title: 'Accent Color',
            configName: "accent",
            desc: "Prominent color in the UI. Affects buttons, switches, mentions, etc.",
            colors: [0x7390DB], // TODO: need more defaults
            defaultColor: 0x990000
        }, {
            type: "input:colorpicker",
            title: 'Accent Background',
            configName: "accent-back",
            desc: "Background for mentions and other misc. things.",
            colors: [], // TODO: need more defaults
            defaultColor: 0x660000
        }, {
            type: "input:colorpicker",
            title: 'Bright Accent Color',
            configName: "accent-bright",
            desc: "Color of mentions while hovering and other misc. things.",
            colors: [0xFFFFFF], // TODO: need more defaults
            defaultColor: 0xFF0000
        }, {
            type: "input:colorpicker",
            title: 'Bright Accent Background',
            configName: "accent-back-bright",
            desc: "Background for mentions while hovering and other misc. things.",
            colors: [], // TODO: need more defaults
            defaultColor: 0x880000
        }, {
            type: "input:colorpicker",
            title: 'Icon Color',
            configName: "icon-color",
            desc: "Color of icons for channels, home sections, etc.",
            colors: [], // TODO: need more defaults
            defaultColor: 0xFAA61A
        }, {
            type: "input:colorpicker",
            title: 'Link Color',
            configName: "link-color",
            desc: "Color of links.",
            colors: [], // TODO: need more defaults
            defaultColor: 0xFAA61A
        }, {
            type: "input:colorpicker",
            title: 'Hovered Link Color',
            configName: "link-color-hover",
            desc: "Color of links while hovering over them.",
            colors: [], // TODO: need more defaults
            defaultColor: 0xFAD61A
        }, {
            type: "input:colorpicker",
            title: 'Popup Background',
            configName: "popup-background",
            desc: "Background color of modals and popups, such as pinned messages, context menus, and confirmation dialogs.",
            colors: [], // TODO: need more defaults
            defaultColor: 0x222222
        }, {
            type: "input:colorpicker",
            title: 'Popup Headers & Footers',
            configName: "popup-highlight",
            desc: "Background color of headers and footers on modals and popups.",
            colors: [], // TODO: need more defaults
            defaultColor: 0x333333
        }, {
            type: "input:colorpicker",
            title: 'Unread Color',
            configName: "unread-color",
            desc: "Color of channel/server unread or selected indicators.",
            colors: [0xFFFFFF], // TODO: need more defaults
            defaultColor: 0x990000
        }, {
            type: "input:text",
            configName: "typing-height",
            title: "Typing Height",
            desc: "Height of typing element and margin underneath chat to allow space for it."
        }];
        els.forEach(item => {
            let dat = this.customLoad(item.configName);
            if (dat && /^#\d{3}$/.test(dat)) {
                dat = dat[0]+dat[1]+dat[1]+dat[2]+dat[2]+dat[3]+dat[3];
            }
            // TODO: proper transparency support?
            if (item.type === "input:colorpicker")
                item.currentColor = dat ? parseInt(dat.substr(1), 16) : null;
        });
        return els;
    }
});
