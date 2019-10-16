const Plugin = require("../plugin");
const Clipboard = require("electron").clipboard;

const Dispatcher = findModule("dispatch");
const ImageResolver = findModule("getUserAvatarURL");
const ContextMenuActions = findModule("closeContextMenu");

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
        ContextMenuActions.closeContextMenu();
    }
}

async function checkMenu() {
    // Make sure it's already in the DOM
    await new Promise(r => {setTimeout(r, 5)});
    const theMenu = document.querySelector(".contextMenu-HLZMGh");
    const reactData = theMenu.__reactInternalInstance$;

    let label = "";
    let url = "";
    let props = {onHeightUpdate: () => {}};
    
    // For users
    if (
        reactData.return &&
        reactData.return.return &&
        reactData.return.return.return &&
        reactData.return.return.return.return &&
        reactData.return.return.return.return.memoizedProps &&
        reactData.return.return.return.return.memoizedProps.user &&
        reactData.return.return.return.return.memoizedProps.type &&
        reactData.return.return.return.return.memoizedProps.type.startsWith("USER_")
    ) {
        props = reactData.return.return.return.return.memoizedProps;
        label = "Copy Avatar URL";
        const user = props.user;
        const imageType = ImageResolver.hasAnimatedAvatar(user) ? "gif" : "jpg";

        // Internal module maxes at 1024 hardcoded, so do that and change to 2048.
        url = ImageResolver.getUserAvatarURL(user, imageType, 1024).replace("size=1024", "size=2048");

        // For default avatars
        if (!url.startsWith("http") && url.startsWith("/assets")) url = `https://discordapp.com${url}`;
    }
    
    // For guilds
    if (
        reactData.return &&
        reactData.return.memoizedProps &&
        reactData.return.memoizedProps.guild &&
        reactData.return.memoizedProps.type == "GUILD_ICON_BAR"
    ) {
        props = reactData.return.memoizedProps;
        label = "Copy Icon URL";
        const guild = props.guild;

        // Internal module maxes at 1024 hardcoded, so do that and change to 2048.
        url = ImageResolver.getGuildIconURL({id: guild.id, icon: guild.icon, size: 1024}).replace("size=1024", "size=2048");

        // No way to make it return the animated version, do it manually
        if (ImageResolver.hasAnimatedGuildIcon(guild)) url = url.replace(".webp?", ".gif?");
    }
    
    // Assume it is already in the DOM and add item ASAP
    if (label && url) addMenuItem(url, label, props);
}

module.exports = new Plugin({
    name: "Avatar Links",
    author: "Joe 🎸#7070",
    description: "Lets you copy a user or guild's avatar URL by right-clicking on their avatar.",
    color: "#ffe000",

    load: async function() {
        Dispatcher.subscribe("CONTEXT_MENU_OPEN", checkMenu);
    },

    unload: function() {
        Dispatcher.unsubscribe("CONTEXT_MENU_OPEN", checkMenu);
    }
});
