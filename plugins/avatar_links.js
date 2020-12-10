const Plugin = require("../plugin");
const Clipboard = require("electron").clipboard;

let cm = {}, Dispatcher, ImageResolver, ContextMenuActions, ree;

module.exports = new Plugin({
    name: "Avatar Links",
    author: "Joe 🎸#7070",
    description: "Lets you copy a user or guild's avatar URL by right-clicking on it.",
    color: "#ffe000",

    load: async function() {
        ree = this;
        cm = EDApi.findModule('menu');
        Dispatcher = EDApi.findModule("dispatch");
        ImageResolver = EDApi.findModule("getUserAvatarURL");
        ContextMenuActions = EDApi.findModule("closeContextMenu");

        Dispatcher.subscribe("CONTEXT_MENU_OPEN", this.checkMenu);
    },

    unload: function() {
        Dispatcher.unsubscribe("CONTEXT_MENU_OPEN", this.checkMenu);
    },

    checkMenu: async function() {
        // Make sure it's already in the DOM
        await new Promise(r => {setTimeout(r, 5)});
        const theMenu = document.querySelector('.'+cm.menu);

        const reactData = theMenu[Object.keys(theMenu).find(key => key.startsWith("__reactInternalInstance") || key.startsWith("__reactFiber"))];

        let label = "";
        let url = "";
        let props = {onHeightUpdate: () => {}};

        // For users
        if (
            reactData.return &&
            reactData.return.return &&
            reactData.return.return.return &&
            reactData.return.return.return.return &&
            reactData.return.return.return.return.return &&
            reactData.return.return.return.return.return.memoizedProps &&
            reactData.return.return.return.return.return.memoizedProps.user
        ) {
            props = reactData.return.return.return.return.return.memoizedProps;
            label = "Copy Avatar URL";
            const user = props.user;
            const imageType = ImageResolver.hasAnimatedAvatar(user) ? "gif" : "png";

            // Internal module maxes at 1024 hardcoded, so do that and change to 4096.
            url = ImageResolver.getUserAvatarURL(user, imageType, 1024).replace("size=1024", "size=4096");
            // For default avatars
            if (!url.startsWith("http") && url.startsWith("/assets"))
                url = `https://discordapp.com${url}`;
        }

        // For guilds
        if (
            reactData.return &&
            reactData.return.return &&
            reactData.return.return.memoizedProps &&
            reactData.return.return.memoizedProps.guild &&
            !reactData.return.return.memoizedProps.channel

        ) {
            props = reactData.return.return.memoizedProps;
            label = "Copy Icon URL";
            const guild = props.guild;

            // Internal module maxes at 1024 hardcoded, so do that and change to 4096.
            url = ImageResolver.getGuildIconURL({id: guild.id, icon: guild.icon, size: 1024}).replace("size=1024", "size=4096");

            // No way to make it return the animated version, do it manually
            if (ImageResolver.hasAnimatedGuildIcon(guild))
                url = url.replace(".webp?", ".gif?");
            else
                url = url.replace(".webp?", ".png?");
        }

        // Assume it is already in the DOM and add item ASAP
        if (label && url)
            ree.addMenuItem(url, label, props);
    },

    addMenuItem: function(imageURL, text, menu) {
        const cmGroups = document.getElementsByClassName(cm.scroller);
        if (!cmGroups || cmGroups.length == 0) return;

        const newCmItem = document.createElement("div");
        newCmItem.className = cm.item+' '+cm.labelContainer+' '+cm.colorDefault;
        const newCmItemContent = document.createElement("div");
        newCmItemContent.className = cm.label;
        newCmItemContent.innerHTML = text;
        newCmItem.appendChild(newCmItemContent);
        const lastGroup = cmGroups[cmGroups.length-1];
        lastGroup.appendChild(newCmItem);

        menu.onHeightUpdate();

        newCmItem.onclick = () => {
            Clipboard.write({text: imageURL});
            ContextMenuActions.closeContextMenu();
        }
    }
});
