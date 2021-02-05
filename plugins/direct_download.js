const Plugin = require('../plugin');

// contains modified code from https://stackoverflow.com/a/47820271
const { dialog } = require('electron').remote;
const http = require('https');
const fs = require('fs');
let ttM = {}, iteM = {};

function saveAs(url, filename, fileExtension) {
    dialog.showSaveDialog({ defaultPath: filename, title: 'Where would you like to store the stolen memes?', buttonLabel: 'Steal this meme', filters: [{ name: 'Stolen meme', extensions: [fileExtension] }] })
    .then(e => {
        if (!e.canceled) {
            download(url, e.filePath, () => {
                const wrap = document.createElement('div');
                wrap.className = 'theme-dark';
                const gay = document.createElement('div');
                gay.style = 'position: fixed; bottom: 10%; left: calc(50% - 88px);'
                gay.className = `${ttM.tooltip} ${ttM.tooltipTop} ${ttM.tooltipBlack}`;
                gay.innerHTML = 'Successfully downloaded | ' + e.filePath;
                document.body.appendChild(wrap);
                wrap.appendChild(gay);
                setTimeout(() => wrap.remove(), 2000);
            });
        }
    });
}
function download (url, dest, cb) {
    const file = fs.createWriteStream(dest);
    http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb);
        });
    }).on('error', function(err) {
        fs.unlink(dest);
        if (cb) cb(err.message);
    });
}

function addMenuItem(url, text, filename = true, fileExtension) {
    const cmGroups = document.querySelectorAll(`.${iteM.menu} [role='group']`);
    if (!cmGroups || cmGroups.length == 0) return;

    const newCmItem = document.createElement('div');
    newCmItem.className = `${iteM.item} ${iteM.labelContainer} ${iteM.colorDefault}`;

    // Discord uses JS to add classes, not sure how to recreate
    newCmItem.onmouseenter = function() {
        this.classList.add(iteM.focused);
    };
    newCmItem.onmouseleave = function() {
        this.classList.remove(iteM.focused);
    };

    const newCmItemLabel = document.createElement('div');
    newCmItemLabel.className = iteM.label;
    newCmItemLabel.innerText = text;

    newCmItem.appendChild(newCmItemLabel);

    const lastGroup = cmGroups[cmGroups.length-1];
    lastGroup.appendChild(newCmItem);
    newCmItem.onclick = () => saveAs(url, filename, fileExtension);
}

// contains code modified from https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/SaveTo.plugin.js

module.exports = new Plugin({
    name: 'Direct Download',
    author: 'Joe 🎸#7070',
    description: `<del>Download files</del> Steal memes without opening a browser.`,
    color: '#18770e',

    load: async function() {
        this._cmClass = EDApi.findModule('hideInteraction').menu;
        this._contClass = EDApi.findModule('embedWrapper').container;
        ttM = EDApi.findModule('tooltipPointer');
        iteM = EDApi.findModule('hideInteraction');
        Dispatcher = EDApi.findModule("dispatch");
        Dispatcher.subscribe("CONTEXT_MENU_OPEN", this.listener);
    },
    listener(e) {
        if (document.getElementsByClassName(this._cmClass).length == 0) setTimeout(() => module.exports.onContextMenu(e), 0);
        else this.onContextMenu(e);
    },
    onContextMenu(e) {
        e = e.contextMenu;
        const messageGroup = e.target.closest('.'+this._contClass);
        const parentElem = e.target.parentElement;
        const guildWrapper = EDApi.findModule('childWrapper').wrapper;
        const memberAvatar = EDApi.findModule('nameAndDecorators').avatar;
    
        if (e.target.localName != 'a' && e.target.localName != 'img' && e.target.localName != 'video' && !messageGroup && !e.target.className.includes(guildWrapper) && !parentElem.className.includes(memberAvatar) && !e.target.className.includes('avatar-')) return;
        let saveLabel = 'Download',
            url = e.target.poster || e.target.style.backgroundImage.substring(e.target.style.backgroundImage.indexOf(`'`) + 1, e.target.style.backgroundImage.lastIndexOf(`'`)) || e.target.href || e.target.src;

        if (e.target.className.includes(guildWrapper)) {
            saveLabel = 'Download Icon';
            if (e.target.firstChild.src) { // Make sure guild box has an icon
                url = e.target.firstChild.src;
            }
        }
        else if (e.target.className.includes('avatar-') || (parentElem.nodeName == 'DIV' && parentElem.className.includes(memberAvatar))) {
            saveLabel = 'Download Avatar';
            
            if (parentElem.className.includes(memberAvatar)) {
                url = e.target.firstChild.firstChild.firstChild.src;
            }
        }

        if (!url || e.target.classList.contains('emote') || url.includes('youtube.com/watch?v=') || url.includes('youtu.be/') || url.lastIndexOf('/') > url.lastIndexOf('.')) return;

        url = url.split('?')[0];

        url = url.replace('.webp', '.png');

        let fileName = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));
        const fileExtension = url.substr(url.lastIndexOf('.') + 1, url.length);

        if (saveLabel.includes('Avatar') || saveLabel.includes('Icon')) url += '?size=2048';

        if (e.target.classList.contains('emoji')) {
            saveLabel = 'Download Emoji';
            fileName = e.target.alt.replace(/[^A-Za-z_-]/g, '');
        }
        //console.log({url, saveLabel, fileName, fileExtension});

        setTimeout(() => addMenuItem(url, saveLabel, fileName, fileExtension), 5);
    },
    unload: function() {
        Dispatcher.unsubscribe("CONTEXT_MENU_OPEN", this.listener);
    }
});
