const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Magane',
    author: 'Kana#0001',
    description: 'Embeds Magane into Discord',
    color: '#696080',
    load: async function() {
        fetch('https://magane.moe/api/dist/magane')
            .then(response => response.text())
            .then((data) => {
                eval(data);
            });
    }
});
