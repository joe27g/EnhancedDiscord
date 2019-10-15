const Plugin = require("../plugin");
const Clipboard = require("electron").clipboard;

function addMenuItem(imageURL, text, menu) {
    let cmGroups = document.getElementsByClassName("itemGroup-1tL0uz");
    if (!cmGroups || cmGroups.length == 0) return;

    let newCmItem = document.createElement("div");
    newCmItem.className = "item-1Yvehc itemBase-tz5SeC clickable-11uBi-";
    let newCmItemContent = document.createElement("div");
    newCmItemContent.className = "label-JWQiNe";
    newCmItemContent.innerHTML = text;
    newCmItem.appendChild(newCmItemContent);

    let lastGroup = cmGroups[cmGroups.length-1];
    lastGroup.appendChild(newCmItem);

    menu.onHeightUpdate();

    newCmItem.onclick = function(e) {
        Clipboard.write({text: imageURL});
        findModule("closeContextMenu").closeContextMenu();
    }
}

async function checkMenu() {
    await new Promise(r => {setTimeout(r, 5)});
    const theMenu = document.querySelector(".contextMenu-HLZMGh");
    const reactData = theMenu.__reactInternalInstance$;
    
    let label = "";
    let url = "";
    let props = {};
    
    // For users
    if (
        reactData.return &&
        reactData.return.return &&
        reactData.return.return.return &&
        reactData.return.return.return.return &&
        reactData.return.return.return.return.memoizedProps &&
        reactData.return.return.return.return.memoizedProps.user
    ) {
        props = reactData.return.return.return.return.memoizedProps;
        label = "Copy Avatar URL";
        url = props.user.avatarURL.replace("size=128", "size=2048");
    }
    
    // For guilds
    if (
        reactData.return &&
        reactData.return.memoizedProps &&
        reactData.return.memoizedProps.guild
    ) {
        props = reactData.return.memoizedProps;
        label = "Copy Icon URL";
        url = props.guild.getIconURL().replace("size=128", "size=2048");
    }
    
    setTimeout(() => addMenuItem(url, label, props), 5);
}

module.exports = new Plugin({
    name: "Avatar Links",
    author: "Joe 🎸#7070",
    description: "Lets you copy a user or guild's avatar URL by right-clicking on their avatar.",
    color: "#ffe000",

    load: async function() {
        const dispatcher = findModule("dispatch");
        dispatcher.subscribe("CONTEXT_MENU_OPEN", checkMenu);
    },

    unload: function() {
        const dispatcher = findModule("dispatch");
        dispatcher.unsubscribe("CONTEXT_MENU_OPEN", checkMenu);
    }
});
