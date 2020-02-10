const Plugin = require('../plugin');
const path = require('path');
const fs = require('fs');
const readFile = require('util').promisify(fs.readFile);

module.exports = new Plugin({
    name: 'CSS Loader',
    author: 'Joe 🎸#7070',
    description: 'Loads and hot-reloads CSS.',
    preload: true, //load this before Discord has finished starting up
    color: 'blue',

    defaultSettings: {path: './plugins/style.css'},
    resetSettings: function(toastText) {
        EDApi.showToast(toastText);
        this.settings = this.defaultSettings;
    },
    onSettingsUpdate: function() {
        const filePath = (this.settings || {}).path;
        if (!filePath) {
            return this.resetSettings('Empty path. Settings have been reset.');
        }
        if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
            return this.resetSettings('Invalid file path. Must be a local CSS file (stored on your computer, not a URL.)');
        }
        if (!filePath.endsWith('.css')) {
            return this.resetSettings('Invalid file path. Must be a CSS file.');
        }
        if (path.isAbsolute(filePath)) {
            if (!fs.existsSync(filePath)) {
                return this.resetSettings('Invalid file path. File does not exist.');
            }
        } else {
            const p = path.join(process.env.injDir, filePath);
            if (!fs.existsSync(p)) {
                return this.resetSettings('Invalid file path. File does not exist.');
            }
        }
        return this.reload();
    },

    load: async function() {
        const filePath = (this.settings || {}).path;
        if (!filePath) return;
        const cssPath = path.isAbsolute(filePath) ? filePath : path.join(process.env.injDir, filePath);

        readFile(cssPath).then(css => {
            if (!ED.customCss) {
                ED.customCss = document.createElement('style');
                document.head.appendChild(ED.customCss);
            }
            ED.customCss.innerHTML = css;
            this.info('Custom CSS loaded!', ED.customCss);

            if (ED.cssWatcher == null) {
                ED.cssWatcher = fs.watch(cssPath, { encoding: 'utf-8' },
                eventType => {
                    if (eventType == 'change') {
                        readFile(cssPath).then(newCss => ED.customCss.innerHTML = newCss);
                    }
                });
            }
        }).catch(() => console.info('Custom CSS not found. Skipping...'));
    },
    unload: function() {
        if (ED.customCss) {
            document.head.removeChild(ED.customCss);
            ED.customCss = null;
        }
        if (ED.cssWatcher) {
            ED.cssWatcher.close();
            ED.cssWatcher = null;
        }
    },
    generateSettings: function() { return [{
        type: "input:text",
        configName: "path",
        title: "Custom CSS Path",
        desc: "This can be relative to the EnhancedDiscord directory (e.g. `./big_gay.css`) or absolute (e.g. `C:/theme.css`.)",
        placeholder: this.defaultSettings.path
    }]}
});
