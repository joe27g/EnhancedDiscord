const Plugin = require('../plugin');

module.exports = new Plugin({
    name: 'Double-Click Edit',
    author: 'Joe 🎸#7070',
    description: 'Allows you to double-click a message to edit it.',
    color: '#ff5900',

    load: async function() {
        this._listener = function(e) {
            let messageElem = e.target.closest('[class*="message-"]');
            if (!messageElem) return;

            let dots = messageElem.querySelector('[class^="buttonContainer-"] [class^="button-"]');
            if (dots) dots.click();

            let messageOpts = document.querySelectorAll('[class^="theme-dark popouts-"] [role="menu"] [role="menuitem"]');
            if (!messageOpts) return;

            let hasEditOption = false;
            for (let i in messageOpts) {
                if (messageOpts[i].innerText == 'Edit\n') {
                    messageOpts[i].click(); hasEditOption = true; break;
                }
            }
            if (!hasEditOption && dots)
                dots.click(); // hide the menu again

            //console.log('double-clicked: ', e.target, this);
        }
        document.addEventListener("dblclick", this._listener, false);

        this._deletePressed = false;
        document.addEventListener("keydown", function(e) {
            if (e.keyCode == 46)
                module.exports._deletePressed = true;
        });
        document.addEventListener("keyup", function(e) {
            if (e.keyCode == 46)
                module.exports._deletePressed = false;
        });
        this._listener2 = function(e) {
            if (!module.exports._deletePressed) return;

            let messageElem = e.target.closest('[class*="message-"]');
            if (!messageElem) return;

            let dots = messageElem.querySelector('[class^="buttonContainer-"] [class^="button-"]');
            if (dots) dots.click();

            let messageOpts = document.querySelectorAll('[class^="theme-dark popouts-"] [role="menu"] [role="menuitem"]');
            console.log(messageOpts);
            if (!messageOpts) return;

            let hasDeleteOption = false;
            for (let i in messageOpts) {
                if (messageOpts[i].innerText == 'Delete\n') {
                    messageOpts[i].click(); hasDeleteOption = true; break;
                }
            }
            if (!hasDeleteOption && dots)
                return dots.click(); // hide the menu again

            let confirmationModalButton = document.querySelector('[class="theme-dark"] > [class^="backdrop-"] + [class^="modal-"] form button[type="submit"]');
            if (confirmationModalButton)
                confirmationModalButton.click();
        }
        document.addEventListener("click", this._listener2);
    },
    unload: function() {
        document.removeEventListener("dblclick", this._listener);
        delete this._listener;
        document.removeEventListener("keydown", function(e) {
            if (e.keyCode == 46)
                module.exports._deletePressed = true;
        });
        document.removeEventListener("keyup", function(e) {
            if (e.keyCode == 46)
                module.exports._deletePressed = false;
        });
        document.removeEventListener("click", this._listener2);
        delete this._listener2;
    }
});
