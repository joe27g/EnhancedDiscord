const Plugin = require('../plugin');
const path = window.require('path');
const fs = window.require('fs');

module.exports = new Plugin({
    name: 'CSS Settings',
    author: 'Joe 🎸#7070',
    description: 'Allows you to modify options for the default theme.',
    color: 'blue',

    config: {},
    load: async function() {
        // yeet
    },
    unload: function() {
        // yeet
    },
    generateSettings: function() {
        if (!window.ED.plugins.css_loader) return;
        const d = window.ED.classMaps.description;
        const b = window.ED.classMaps.buttons;
        const id = window.EDApi.findModule('inputDefault');
        const m = window.EDApi.findModule('marginTop8');
        if (!window.customCss || !window.customCss.innerHTML) return;

        const mm = window.customCss.innerHTML.match(/--bg: url\(([^)]+)\)/);
        const overlayM = window.customCss.innerHTML.match(/--bg-overlay: ([^;]+);/);
        if (!mm || !mm[1]) return;

        return `<div class="${d.description} ${d.modeDefault}">
Background Image<br>
Must be a remote URL, not a local file.
</div>
<input type="text" class="${id.inputDefault}" value="${mm[1]}" maxlength="2000" placeholder="https://i.imgur.com/ybRUHPc.jpg" id="custom-bg-url">
<button type="button" id="save-bg-url" class="${b.button} ${b.lookFilled} ${b.colorBrand} ${m.marginTop8} ${m.marginBottom8}" style="height:24px;margin-right:10px;">
<div class="${b.contents}">Save</div>
</button>
<div class="${d.description} ${d.modeDefault}">
Background Overlay<br>
Used to darken the background by default. Change the alpha value (default 0.8) to change the background brightness.
</div>
<div style="height:24px;width:24px;display:inline-block;margin:5px;border-radius:5px;background-image:url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='2'%3E%3Cpath d='M1,0H0V1H2V2H1' fill='lightgrey'/%3E%3C/svg%3E&quot;), url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Cpath d='M1,0H0V1H2V2H1' fill='white'/%3E%3C/svg%3E&quot;);background-size:40%;vertical-align:top;">
<div id="preview-bg-overlay" style="width:100%;height:100%;border-radius:5px;background-color:${overlayM[1]}"></div>
</div>
<input type="text" class="${id.inputDefault}" value="${overlayM[1]}" placeholder="rgba(0, 0, 0, 0.8)" id="custom-bg-overlay" style="width:auto;">
<button type="button" id="save-bg-overlay" class="${b.button} ${b.lookFilled} ${b.colorBrand} ${m.marginTop8} ${m.marginBottom8}" style="height:24px;display:inline-block;">
<div class="${b.contents}">Save</div>
</button>`;
    },
    settingListeners: [
        {
            el: '#save-bg-url',
            type: 'click',
            eHandler: function() {
                //console.log(this, e.target);
                const pathInput = document.getElementById('custom-bg-url');
                if (!pathInput) return;
                const cont = this.firstElementChild;
                if (pathInput.value && !pathInput.value.startsWith('https://') && !pathInput.value.startsWith('http://')) {
                    cont.innerHTML = 'Invalid URL.';
                    setTimeout(() => {
                        try { cont.innerHTML = 'Save'; } catch(err){/*do nothing*/}
                    }, 3000);
                    return;
                }
                const newPath = pathInput.value;
                const cl = window.ED.plugins.css_loader;
                const st = cl.settings;
                if (!st || !st.path) return;
                const p = path.join(process.env.injDir, cl.config.path.parse(st.path));
                fs.readFile(p, 'utf-8', (err, content) => {
                    if (err) return module.exports.error(err);
                    const lines = content.split(/\r\n/g).filter(l => l);
                    let changed = false;
                    for (const i in lines) {
                        if (lines[i].indexOf('--bg:') !== -1) {
                            lines[i] = lines[i].replace(/\/\*(\s+)--bg/, '$1--bg');
                            lines[i] = lines[i].replace(/--bg:\s+.*;/, `--bg: url(${newPath});`);
                            changed = true;
                        }
                    }
                    if (changed) {
                        fs.writeFile(p, lines.join('\n'), err => {
                            if (err) return module.exports.error(err);
                            cont.innerHTML = 'Saved.';
                            setTimeout(() => {
                                try { cont.innerHTML = 'Save'; } catch(err){/*do nothing*/}
                            }, 3000);
                            return;
                        })
                    } else {
                        cont.innerHTML = 'Already saved.';
                        setTimeout(() => {
                            try { cont.innerHTML = 'Save'; } catch(err){/*do nothing*/}
                        }, 3000);
                        return;
                    }
                });
            }
        },
        {
            el: '#custom-bg-overlay',
            type: 'input',
            eHandler: function() {
                const box = document.getElementById('preview-bg-overlay');
                if (box && this.value)
                    box.style['background-color'] = this.value;
            }
        },
        {
            el: '#save-bg-overlay',
            type: 'click',
            eHandler: function() {
                //console.log(this, e.target);
                const input = document.getElementById('custom-bg-overlay');
                if (!input) return;
                const cont = this.firstElementChild;

                const cl = window.ED.plugins.css_loader;
                const st = cl.settings;
                if (!st || !st.path) return;
                const p = path.join(process.env.injDir, cl.config.path.parse(st.path));
                fs.readFile(p, 'utf-8', (err, content) => {
                    if (err) return module.exports.error(err);
                    const lines = content.split(/\r\n/g).filter(l => l);
                    let changed = false;
                    for (const i in lines) {
                        if (lines[i].indexOf('--bg-overlay:') !== -1) {
                            lines[i] = lines[i].replace(/\/\*(\s+)--bg-overlay/, '$1--bg-overlay');
                            lines[i] = lines[i].replace(/--bg-overlay:\s+.*;/, `--bg-overlay: ${input.value};`);
                            changed = true;
                        }
                    }
                    if (changed) {
                        fs.writeFile(p, lines.join('\n'), err => {
                            if (err) return module.exports.error(err);
                            cont.innerHTML = 'Saved.';
                            setTimeout(() => {
                                try { cont.innerHTML = 'Save'; } catch(err){/*do nothing*/}
                            }, 3000);
                            return;
                        })
                    } else {
                        cont.innerHTML = 'Already saved.';
                        setTimeout(() => {
                            try { cont.innerHTML = 'Save'; } catch(err){/*do nothing*/}
                        }, 3000);
                        return;
                    }
                });
            }
        }
    ]

});
