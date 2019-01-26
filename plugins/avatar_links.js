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
        const d = findModule('dispatch');

        monkeyPatch(d, 'dispatch', function(b) {
            let og = b.callOriginalMethod(b.methodArguments);
            if (b.methodArguments[0] && b.methodArguments[0].type == 'CONTEXT_MENU_OPEN') {
                let elem = b.methodArguments[0].contextMenu.target;
                //console.log(elem);
                if (elem && elem.tagName == 'STRONG' && elem.parentElement.className && elem.parentElement.className == 'activityText-OW8WYb') {
                    elem.className = 'strongTempClass';
                }
                if (elem && elem.tagName == 'STRONG' && elem.parentElement.className && elem.parentElement.className == 'activityText-sLG0UL') {
                    elem.className = 'strongTempClass2';
                }
                else if (elem && elem.tagName == 'path' && elem.parentElement.parentElement.getAttribute("class") && elem.parentElement.parentElement.getAttribute("class").indexOf('ownerIcon-uZ6mE7') > -1){
                    elem.setAttribute('class', 'pathTempClass');
                }
                else if (elem && elem.tagName == 'A' && elem.href && elem.href.startsWith('https://discordapp.com/channels/@me/')){
                    elem.className = 'dmTempClass';
                }

                let cn = elem ? elem.getAttribute("class") : null;
                if (!elem || !cn || typeof cn !== 'string') return og;

                let isGuild = (elem.tagName == 'DIV' && cn.indexOf('guildIcon-CT-ZDq') > -1);

                let imageElem;
                if (cn.indexOf('large-3ChYtB') > -1 || cn.indexOf('image-33JSyf') > -1 || isGuild || cn.startsWith('inner-1W0Bkn')) {
                    imageElem = elem;
                } else if (cn.indexOf('status-oxiHuE') > -1) {
                    imageElem = elem.previousElementSibling;
                } else if (cn.indexOf('avatar-16XVId') > -1 || cn.indexOf('small-5Os1Bb') > -1 || cn == 'dmTempClass') {
                    imageElem = elem.firstElementChild;
                } else if ((cn == 'name-2WpE7M' && elem.parentElement.className !== 'nameWrapper-10v56U') || cn == 'headerCozyMeta-rdohGq') {
                    imageElem = elem.previousElementSibling.firstElementChild;
                } else if ((elem.tagName == 'BUTTON' && cn == 'close-3hZ5Ni') || cn == 'nameWithActivity-1ceSyU' || cn.indexOf('activity-525YDR') > -1 || (cn == 'name-2WpE7M' && elem.parentElement.className == 'nameWrapper-10v56U')) {
                    imageElem = elem.parentElement.previousElementSibling.firstElementChild;
                } else if (cn == 'avatarWrapper-3B0ndJ' || cn == 'headerCozy-2N9HOL' || cn == 'guildInner-3DSoA4') {
                    imageElem = elem.firstElementChild.firstElementChild;
                } else if (cn == 'content-OzHfo4' || cn.indexOf('channel-2QD9_O') > -1) {
                    imageElem = elem.firstElementChild.firstElementChild.firstElementChild;
                } else if (cn.indexOf('member-3W1lQa') > -1 || cn == 'guild-1EfMGQ') {
                    imageElem = elem.firstElementChild.firstElementChild.firstElementChild.firstElementChild;
                } else if (cn == 'memberInner-2CPc3V') {
                    imageElem = elem.parentElement.firstElementChild.firstElementChild.firstElementChild;
                } else if (cn.indexOf('nameTag-m8r81H') > -1 || cn.indexOf('activity-1IYsbk') > -1) {
                    imageElem = elem.parentElement.parentElement.firstElementChild.firstElementChild.firstElementChild;
                } else if (cn.indexOf('username-1cB_5E') > -1 || cn.indexOf('ownerIcon-uZ6mE7') > -1) {
                    imageElem = elem.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.firstElementChild;
                } else if (cn == 'pathTempClass') {
                    imageElem = elem.parentElement.parentElement.parentElement.parentElement.parentElement.firstElementChild.firstElementChild.firstElementChild;
                } else if (cn == 'activityText-OW8WYb' || cn == 'username-_4ZSMR' || cn == 'activityIcon-1mtTk4') {
                    imageElem = elem.parentElement.parentElement.previousElementSibling.firstElementChild;
                } else if (cn == 'strongTempClass') {
                    imageElem = elem.parentElement.parentElement.parentElement.previousElementSibling.firstElementChild;
                } else if (cn == 'activityText-sLG0UL' || cn == 'activityIcon-S3CciC' || cn.indexOf('botTagRegular-2HEhHi') > -1) {
                    imageElem = elem.parentElement.parentElement.previousElementSibling.firstElementChild.firstElementChild;
                } else if (cn == 'strongTempClass2') {
                    imageElem = elem.parentElement.parentElement.parentElement.previousElementSibling.firstElementChild.firstElementChild;
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
