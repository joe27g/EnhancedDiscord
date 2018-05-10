const Plugin = require('../plugin');

function copyToClipboard(text) {
    let textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();
    document.execCommand('copy');

    document.body.removeChild(textArea);
}
function addMenuItem(imageURL, d, text) {
    let cmGroups = document.getElementsByClassName('itemGroup-1tL0uz');
    if (!cmGroups || cmGroups.length == 0) return;

    let newCmItem = document.createElement('div');
    newCmItem.className = 'item-1Yvehc';
    let newCmItemContent = document.createElement('span');
    newCmItemContent.innerHTML = text;
    newCmItem.appendChild(newCmItemContent);

    let lastGroup = cmGroups[cmGroups.length-1];
    lastGroup.appendChild(newCmItem);

    // adjust context menu placement
    let cm = lastGroup.parentElement;
    let top = parseInt(cm.style.top);
    cm.style.top = (top - 28)+'px';

    newCmItem.onclick = function(e) {
        copyToClipboard(imageURL);
        d.dispatch({ type: "CONTEXT_MENU_CLOSE" });
    }
}

module.exports = new Plugin({
    name: 'Avatar Links',
    author: 'Joe 🎸#7070',
    description: `Lets you copy a user or guild's avatar URL by right-clicking on their avatar.`,
    color: '#ffe000',

    load: async function() {
        while (!findModule('dispatch', true))
            await this.sleep(1000);

        let d = findModule('dispatch');

        monkeyPatch(d, 'dispatch', function(b) {
            let og = b.callOriginalMethod(b.methodArguments);
            if (b.methodArguments[0] && b.methodArguments[0].type == 'CONTEXT_MENU_OPEN') {
                let elem = b.methodArguments[0].contextMenu.target;
                //console.log(elem);
                if (elem && elem.tagName == 'STRONG' && elem.parentElement.className && elem.parentElement.className == 'activityText-258pdj') {
                    elem.className = 'strongTempClass';
                }
                else if (elem && elem.tagName == 'path' && elem.parentElement.parentElement.getAttribute("class") && elem.parentElement.parentElement.getAttribute("class").indexOf('ownerIcon-uZ6mE7') > -1){
                    elem.setAttribute('class', 'pathTempClass');
                }
                else if (elem && elem.tagName == 'A' && elem.href && elem.href.startsWith('https://discordapp.com/channels/@me/')){
                    elem.className = 'dmTempClass';
                }

                let cn = elem ? elem.getAttribute("class") : null;
                if (!elem || !cn || typeof cn !== 'string') return og;

                let isGuild = (elem.tagName == 'A' && cn == 'avatar-small' && elem.href && elem.href.startsWith('https://discordapp.com/channels/'));

                let imageElem;
                if (cn.indexOf('avatar-large') > -1 || cn.indexOf('image-33JSyf') > -1 || isGuild || cn.startsWith('avatar-small')) {
                    imageElem = elem;
                } else if (cn.indexOf('avatar-16XVId') > -1 || cn == 'dmTempClass') {
                    imageElem = elem.firstElementChild;
                } else if (cn.indexOf('status-oxiHuE') > -1 || cn == 'channel-name') {
                    imageElem = elem.previousElementSibling;
                } else if (elem.tagName == 'BUTTON' && cn == 'close') {
                    imageElem = elem.parentElement.firstElementChild;
                } else if (cn == 'avatarWrapper-3B0ndJ') {
                    imageElem = elem.firstElementChild.firstElementChild;
                } else if (cn == 'content-OzHfo4') {
                    imageElem = elem.firstElementChild.firstElementChild.firstElementChild;
                } else if (cn.indexOf('member-3W1lQa') > -1) {
                    imageElem = elem.firstElementChild.firstElementChild.firstElementChild.firstElementChild;
                } else if (cn == 'memberInner-2CPc3V') {
                    imageElem = elem.parentElement.firstElementChild.firstElementChild.firstElementChild;
                } else if (cn.indexOf('nameTag-m8r81H') > -1 || cn.indexOf('activity-1IYsbk') > -1) {
                    imageElem = elem.parentElement.parentElement.firstElementChild.firstElementChild.firstElementChild;
                } else if (cn.indexOf('username-1cB_5E') > -1 || cn.indexOf('ownerIcon-uZ6mE7') > -1) {
                    imageElem = elem.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.firstElementChild;
                } else if (cn == 'pathTempClass') {
                    imageElem = elem.parentElement.parentElement.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.firstElementChild;
                } else if (cn == 'activityText-sLG0UL') {
                    imageElem = elem.parentElement.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.firstElementChild.firstElementChild;
                } else if (cn == 'username-wrapper') {
                    imageElem = elem.parentElement.parentElement.parentElement.parentElement.parentElement.firstElementChild;
                } else if (cn == 'user-name') {
                    imageElem = elem.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.firstElementChild;
                } else if (cn == 'strongTempClass') {
                    imageElem = elem.parentElement.parentElement.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.firstElementChild.firstElementChild;
                }
                //console.log(imageElem);
                if (!imageElem || !imageElem.style || !imageElem.style['background-image']) return og;

                let avatarURL = imageElem.style['background-image']
                    .replace('url("/', 'https://discordapp.com/')
                    .replace('url("', '')
                    .replace('128")', '2048')
                    .replace('")', '');

                if (isGuild)
                    avatarURL = avatarURL.replace('.webp', '.png?size=2048');

                setTimeout(() => addMenuItem(avatarURL, d, isGuild ? 'Copy Icon URL' : 'Copy Avatar URL'), 5);
            }
            return og;
        });
    },

    unload: function() {
        let d = findModule('dispatch').dispatch;
        if (d && d.__monkeyPatched && d.unpatch)
            d.unpatch();
    }
});
