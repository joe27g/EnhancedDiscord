const Plugin = require('../plugin');

module.exports = new Plugin({
	name: 'Hide Disabled Emojis',
	id: "HideDisabledEmojis",
	author: 'Zerebos#7790',
	description: "Hides disabled emojis from the emoji picker.",
	color: '#206694',

	load: async function() {
		while (!window.findModule('isEmojiDisabled', true))
			await this.sleep(1000);
		
		let EmojiInfo = window.findModule('isEmojiDisabled', true);
		let EmojiPicker = this.find(m => m.displayName == "EmojiPicker");
		
		window.monkeyPatch(EmojiInfo, "isEmojiFiltered", (data) => {
			data.callOriginalMethod()
			data.returnValue = data.returnValue || EmojiInfo.isEmojiDisabled(data.methodArguments[0], data.methodArguments[1]);
			return data.returnValue;
		});
		
		window.monkeyPatch(EmojiPicker.prototype, "render", (data) => {
			let cats = data.thisObject.categories;
			let filtered = data.thisObject.computeMetaData();
			let newcats = {};

			for (let c of filtered) newcats[c.category] ? newcats[c.category] += 1 : newcats[c.category] = 1;

			let i = 0;
			for (let cat of cats) {
				if (!newcats[cat.category]) cat.offsetTop = 999999;
				else {
					cat.offsetTop = i * 32;
					i += newcats[cat.category] + 1;
				}
				data.thisObject.categoryOffsets[cat.category] = cat.offsetTop;
			}

			cats.sort((a,b) => a.offsetTop - b.offsetTop);
			data.callOriginalMethod();
			return data.returnValue;
		});
	},
	unload: function() {
		let EmojiInfo = window.findModule('isEmojiDisabled', true).isEmojiFiltered;
		let EmojiPicker = this.find(m => m.displayName == "EmojiPicker").prototype.render;
		if (EmojiInfo && EmojiInfo.__monkeyPatched) EmojiInfo.unpatch();
		if (EmojiPicker && EmojiPicker.__monkeyPatched) EmojiPicker.unpatch();
	},	
	find: function(filter) {
		let req = window.req;
		for (let i in req.c) {
			if (req.c.hasOwnProperty(i)) {
				let m = req.c[i].exports;
				if (m && m.__esModule && m.default && filter(m.default)) return m.default;
				if (m && filter(m))	return m;
			}
		}
		this.warn('Cannot find module');
		return null;
	}
});
