const Plugin = require('../plugin');
const path = window.require('path');
const fs = window.require('fs');

module.exports = new Plugin({
    name: 'CSS Loader',
    author: 'Joe 🎸#7070',
    description: 'Loads and hot-reloads CSS.',
    preload: true, //load this before Discord has finished starting up
    color: 'blue',
    id: 'css_loader',

    config: {
        path: {
            default: './plugins/style.css',
            parse: function(filePath) {
                if (!filePath || !filePath.endsWith('.css')) {
                    return false;
                }
                if (path.isAbsolute(filePath)) {
                    if (!fs.existsSync(filePath)) {
                        return false;
                    }
                    return path.relative(process.env.injDir, filePath);
                } else {
                    let p = path.join(process.env.injDir, filePath);
                    if (!fs.existsSync(p)) {
                        return false;
                    }
                    return path.relative(process.env.injDir, p);
                }
            }
        }
    },

    load: async function() {
        function readFile(path, encoding = 'utf-8') {
            return new Promise((resolve, reject) => {
                fs.readFile(path, encoding, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });
        }
        let cssPath = path.join(process.env.injDir, this.settings.path || this.config.path.default);

        readFile(cssPath).then(css => {
            if (!window.customCss) {
                window.customCss = document.createElement('style');
                document.head.appendChild(window.customCss);
            }
            window.customCss.innerHTML = css;
            this.info('Custom CSS loaded!', window.customCss);

            if (window.cssWatcher == null) {
                window.cssWatcher = fs.watch(cssPath, { encoding: 'utf-8' },
                    eventType => {
                        if (eventType == 'change') {
                            readFile(cssPath).then(newCss => window.customCss.innerHTML = newCss);
                        }
                    });
            }
        }).catch(e => console.info('Custom CSS not found. Skipping...'));
    },
    unload: function() {
        if (window.customCss) {
            document.head.removeChild(window.customCss);
            window.customCss = null;
        }
        if (window.cssWatcher) {
            window.cssWatcher.close();
            window.cssWatcher = null;
        }
    },
    generateSettings: function() {
        let result = `<div class="description-3MVziF formText-1L-zZB marginBottom8-1mABJ4 marginTop8-2gOa2N modeDefault-389VjU primary-2giqSn">Custom CSS Path<br>This can be relative to the EnhancedDiscord directory (e.g. <code class="inline">./big_gay.css</code>) or absolute (e.g. <code class="inline">C:/theme.css</code>.)</div><input type="text" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_" value="${this.settings.path || this.config.path.default}" maxlength="2000" placeholder="${this.config.path.default}" id="custom-css-path"><button type="button" id="save-css-path" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE marginBottom8-1mABJ4 marginTop8-2gOa2N" style="height:24px;margin-right:10px;"><div class="contents-4L4hQM">Save</div></button>`;
        return result;
    },
    settingListeners: {
        '#save-css-path': function(e) {
            console.log(this, e.target);
            let pathInput = document.getElementById('custom-css-path');
            if (!pathInput) return;
            if (pathInput.value && module.exports.config.path.parse(pathInput.value) == false) {
                let cont = this.firstElementChild;
                cont.innerHTML = 'Invalid file.';
                setTimeout(() => {
                    try { cont.innerHTML = 'Save'; } catch(err){}
                }, 3000);
                return;
            }
            let newPath = module.exports.config.path.parse(pathInput.value) || module.exports.config.path.default;
            let s = module.exports.settings;
            if (s.path == newPath) {
                let cont = this.firstElementChild;
                cont.innerHTML = 'Path was already saved.';
                setTimeout(() => {
                    try { cont.innerHTML = 'Save'; } catch(err){}
                }, 3000);
                return;
            }
            s.path = newPath;
            module.exports.settings = s;
            module.exports.unload();
            module.exports.load();
            let cont = this.firstElementChild;
            cont.innerHTML = 'Saved!';
            setTimeout(() => {
                try { cont.innerHTML = 'Save'; } catch(err){}
            }, 3000);
        }
    }
});