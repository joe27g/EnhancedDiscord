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
        cm = findModule('contextMenu');
        Dispatcher = findModule("dispatch");
        ImageResolver = findModule("getUserAvatarURL");
        ContextMenuActions = findModule("closeContextMenu");

        Dispatcher.subscribe("CONTEXT_MENU_OPEN", this.checkMenu);
    },

    unload: function() {
        Dispatcher.unsubscribe("CONTEXT_MENU_OPEN", this.checkMenu);
    },

    checkMenu: async function() {
        // Make sure it's already in the DOM
        await new Promise(r => {setTimeout(r, 5)});
        const theMenu = document.querySelector('.'+cm.contextMenu);
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
            const imageType = ImageResolver.hasAnimatedAvatar(user) ? "gif" : "png";

            // Internal module maxes at 1024 hardcoded, so do that and change to 2048.
            url = ImageResolver.getUserAvatarURL(user, imageType, 1024).replace("size=1024", "size=2048");

            // For default avatars
            if (!url.startsWith("http") && url.startsWith("/assets"))
                url = `https://discordapp.com${url}`;
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
        let cmGroups = document.getElementsByClassName(cm.itemGroup);
        if (!cmGroups || cmGroups.length == 0) return;

        let newCmItem = document.createElement("div");
        newCmItem.className = cm.item+' '+cm.clickable;
        let newCmItemContent = document.createElement("div");
        newCmItemContent.className = cm.label;
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
});
