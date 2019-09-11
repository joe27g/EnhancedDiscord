const Plugin = require('../plugin');
let contM = {}, iteM = {}, buttM = {};

module.exports = new Plugin({
    name: 'Double-Click Edit',
    author: 'Joe 🎸#7070',
    description: 'Allows you to double-click a message to edit it, and hold delete + click to delete it.',
    color: '#ff5900',

    _deletePressed: false,
    load: async function() {
        contM = findModule('messageCompact');
        iteM = findModule('itemBase');
        buttM = findModule(m => m.buttonSpacing && m.button);

        document.addEventListener("dblclick", this.editListener, false);
        document.addEventListener("keydown", this.keyDownListener);
        document.addEventListener("keyup", this.keyUpListener);  
        document.addEventListener("click", this.deleteListener);
    },
    unload: async function() {
        document.removeEventListener("dblclick", this.editListener);
        document.removeEventListener("keydown", this.keyDownListener);
        document.removeEventListener("keyup", this.keyUpListener); 
        document.removeEventListener("click", this.deleteListener);
    },

    editListener: function(e) {
        //let messageElem = e.target.closest('.'+contM.container);
        //if (!messageElem) return;

        let dots = document.querySelector('.'+(buttM.button || 'bite_my_shiny_metal_ass').split(' ').join('.'));
        if (dots) dots.click();

        /*setTimeout(() => {
            let messageOpts = document.querySelectorAll('.'+(iteM.item || 'bite_my_shiny_metal_ass').split(' ').join('.'));
            console.log(iteM.item, messageOpts)
        }, 69)*/
        let messageOpts = document.querySelectorAll('.'+(iteM.item || 'bite_my_shiny_metal_ass').split(' ').join('.'));
        //console.log(iteM.item, messageOpts)
        if (!messageOpts) return;

        let hasEditOption = false;
        for (let i in messageOpts) {
            console.log(messageOpts[i].innerText || messageOpts[i]);
            if (messageOpts[i].innerText == 'Edit') {
                messageOpts[i].click(); hasEditOption = true; break;
            }
        }
        if (!hasEditOption && dots)
            dots.click(); // hide the menu again

        //console.log('double-clicked: ', e.target, this);
    },
    deleteListener: function(e) {
        if (!this._deletePressed) return;

        let messageElem = e.target.closest('.'+contM.container);
        if (!messageElem) return;

        let dots = messageElem.querySelector('.'+(buttM.button || 'bite_my_shiny_metal_ass').split(' ').join('.'));
        if (dots) dots.click();

        let messageOpts = document.querySelectorAll('.'+iteM.item);
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
    },
    keyUpListener: function(e) {
        if (e.keyCode == 46)
            this._deletePressed = false;
    },
    keyDownListener: function(e) {
        if (e.keyCode == 46)
            this._deletePressed = true;
    }
});
