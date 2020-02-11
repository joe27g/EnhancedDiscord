const Plugin = require('../plugin');
const fs = require('fs');
const path = require('path');
const propMap = {
    bg_color: 'bg',
    bg_opacity: 'bg-overlay'
}
let picker;

module.exports = new Plugin({
    name: 'CSS Settings',
    author: 'Joe 🎸#7070',
    description: 'Allows you to modify options for the default theme.',
    color: 'blue',

    load: () => {
        picker = EDApi.findModuleByDisplayName("ColorPicker");
    },
    unload: () => {},

    customLoad: function(prop) {
        const st = ED.plugins.css_loader.settings;
        if (!st || !st.path) return;
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
                console.log(prop, raw);

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
                if (prop == 'bg_opacity' && raw.startsWith('rgba(')) {
                    const str = raw.substring(5, raw.length - 1).split(',').pop();
                    if (!str) return null;
                    return 100 - Math.round(parseFloat(str)*100);
                } else if (prop == 'bg_opacity') {
                    return 100;
                }
            }
        }
    },
    customSave: function(prop, data) {
        const updateObj = {};
        switch (prop) {
            case 'bg':
                if (data) {
                    if (!data.startsWith('https://') && !data.startsWith('http://'))
                        EDApi.showToast('Warning: This location probably won\'t work - it needs to be a remote URL, not a local file.')
                    updateObj.bg = `url(${data})`;
                } else {
                    updateObj.bg = 'transparent'
                }
                break;
            case 'bg_color':
                updateObj.bg = data || 'transparent';
                //updateObj['bg-overlay'] = 'transparent';
                break;
            case 'bg_opacity':
                updateObj['bg-overlay'] = `rgba(0, 0, 0, ${(100 - data) / 100.0})`;
                break;
        }
        const regexObj = {};
        for (const varName in updateObj) {
            regexObj[varName] = new RegExp(`--${varName}: ([^;]+);`)
        }

        const st = ED.plugins.css_loader.settings;
        if (!st || !st.path) return;
        const cssPath = path.isAbsolute(st.path) ? st.path : path.join(process.env.injDir, st.path);

        fs.readFile(cssPath, 'utf-8', (err, content) => {
            if (err) return module.exports.error(err);
            const lines = content.split(/\r\n/g).filter(l => l);
            let changed = false;
            for (const i in lines) {
                for (const varName in regexObj) {
                    if (regexObj[varName].test(lines[i])) {
                        lines[i] = lines[i].replace(regexObj[varName], `--${varName}: ${updateObj[varName]};`);
                        changed = true;
                    }
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

    generateSettings: function() {
        if (!ED.plugins.css_loader || !ED.customCss || !ED.customCss.innerHTML || !ED.customCss.innerHTML.includes("EnhancedDiscord Theme")) return;

        const bgColor = this.customLoad('bg_color');
        const bgColorDec = bgColor ? parseInt(bgColor.substr(1), 16) : null;

        return [{
            type: "input:text",
            configName: "bg",
            title: "Background Image",
            desc: "Must be a remote URL, not a local file."
        },{
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
            type: 'std:title',
            content: 'Background Color'
        }, EDApi.React.createElement(picker, {
            onChange: value => {
                const hexValue = '#'+value.toString(16).padStart(6, '0');
                const inp = document.getElementById('ed_bg_color');
                if (inp) inp.value = hexValue;
                this.customSave('bg_color', hexValue);
            },
            colors: [3935501, 867347, 858428, 2428220, 4921153, 5581331, 2958879, 1389880, 0, 1381653],
            defaultColor: 3553599,
            customColor: bgColorDec,
            value: bgColorDec
        }), {
            type: 'std:spacer',
            space: 10
        }, {
            type: "input:text",
            id: 'ed_bg_color',
            configName: "bg_color",
            desc: "Set your background to a simple color rather than an image. See the list of [valid css colors](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value).",
            mini: true
        }];
    }
});
