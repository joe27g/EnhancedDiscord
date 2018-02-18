const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'CSS Loader',
    author: 'Joe 🎸#7070',
    description: 'Loads and hot-reloads CSS.',
    preload: true, //load this before Discord hqs finished starting up
    color: 'blue',
    load: async function() {
        const path = window.require('path');
        const fs = window.require('fs');

        function readFile(path, encoding = 'utf-8') {
            return new Promise((resolve, reject) => {
                fs.readFile(path, encoding, (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });
        }
        readFile(path.join(__dirname, 'style.css')).then(css => {
            if (!window.customCss) {
                window.customCss = document.createElement('style');
                document.head.appendChild(window.customCss);
            }
            window.customCss.innerHTML = css;
            this.info('Custom CSS loaded!', window.customCss);

            if (window.cssWatcher == null) {
                window.cssWatcher = fs.watch(path.join(__dirname, 'style.css'), { encoding: 'utf-8' },
                    eventType => {
                        if (eventType == 'change') {
                            readFile(path.join(__dirname, 'style.css')).then(newCss => window.customCss.innerHTML = newCss);
                        }
                    });
            }
        }).catch(e => console.info('Custom CSS not found. Skipping...'));
    },
    unload: function() {
        document.head.removeChild(window.customCss);
        window.customCss = null;
    }
});