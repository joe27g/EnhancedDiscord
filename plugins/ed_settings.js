const Plugin = require('../plugin');

const getComponentFromFluxContainer = component => {
	return (new component({})).render().type
}

const getReact = (returnEntireReact = false) => { // WHY. THE. FUCK. https://github.com/joe27g/EnhancedDiscord/commit/976849e47fd0bd72af8e503bf2a593194bab2051
	const React = window.req.c[0].exports
	return returnEntireReact ? React : React.createElement;
}

const join = (...args) => args.join(" ");

const get = moduleName => {
	switch(moduleName) {
		case "animated": return findModule("createAnimatedComponent");
		case "react": return findModule("createElement");
		case "react-ce": return findModule("createElement").createElement;
	}
}

const EDSettings = {
	name: 'ED Settings (React)',
    author: 'Joe 🎸#7070 & jakuski#9191',
    description: 'Adds an EnhancedDiscord tab in user settings.',
	color: 'darkred',
	async load () {
		const discordConstants = EDApi.findModule("API_HOST");
		const UserSettings = getComponentFromFluxContainer(
			EDApi.findModule('getUserSettingsSections').default
		);

        if (!window.ED.classMaps) {
            window.ED.classMaps = {};
		}

		if (!window.ED.discordComponents) {
			window.ED.discordComponents = {};
		}
		
		this._initClassMaps(window.ED.classMaps);
		this._initDiscordComponents(window.ED.discordComponents);
		this._noticeStore = new this.NoticeStoreMimic();
		this.settingsSections = this._getDefaultSections(); // Easily allow plugins to add in their own sections if need be.

		this.unpatch = EDApi.monkeyPatch(
			UserSettings.prototype,
			"generateSections",
			data => {
				const sections = data.originalMethod.call(data.thisObject);
				const devIndex = this._getDevIndex(sections, discordConstants);

				sections.splice(devIndex + 2, 0, ...this.settingsSections);

				console.log(sections)

				return sections;
			}
		)
	},
	unload () {
		if (this.unpatch && typeof this.unpatch === "function") this.unpatch();
	},
	_getDevIndex(sections, constants) {
		const indexOf = sections.indexOf(
			sections.find(sect => sect.section === constants.UserSettingsSections.DEVELOPER_OPTIONS)
		);

		if (indexOf !== -1) return indexOf;
		else return 28; // Hardcoded index fallback incase Discord mess with something
	},
	_getDefaultSections() {
		/*

		For future reference:

		normal sections / pages
			section: [string] an id string of some sort, must be unique.
			label: [string] self-explanatory
			element: [optional] [react-renderable] the page that will be rendered on the right when the section is clicked
			color: [optional] [string (hex)] a colour to be applied to the section (see the log out / discord nitro btn)
			onClick: [optional] [function] a function to be executed whenever the element is clicked
			notice: [notice-obj (see below)] object to determine whether to have notices (like the careful you have unsaved changes popups)

			notice-obj
				element: [react-renderable]
				store: [redux store | NoticeStoreMimic] store that the setin

		special sections
			headers
				section: "HEADER"
				label: [string]
			divider
				section: "DIVIDER"
			custom element
				section: "CUSTOM"
				element: [react-renderable]
		
		all sections regardless of type can have the following
			predicate: [function => boolean] determine whether the section should be shown

		*/
		return [{
			section: "HEADER",
			label: "EDR"
		},{
			section: "ED/Plugins",
			label: "Plugins",
			element: this.components.PluginsPage
		},{
			section: "ED/Settings",
			label: "Settings",
			element: this.components.SettingsPage,
			notice: {
				element: this.components.Notice,
				store: this._noticeStore
			}
		},{
			section: "DIVIDER"
		}];
	},
	_initClassMaps(obj) {
        const divM = EDApi.findModule(m => m.divider && Object.keys(m).length === 1)
        obj.headers = EDApi.findModule('defaultMarginh2');
        obj.margins = EDApi.findModule('marginBottom8');
        obj.divider = divM ? divM.divider : '';
        obj.checkbox = EDApi.findModule('checkboxEnabled');
        obj.buttons = EDApi.findModule('lookFilled');
        obj.switchItem = EDApi.findModule('switchItem');
        obj.alignment = EDApi.findModule('horizontalReverse');
		obj.description = EDApi.findModule('formText');
		// New
		obj.shadows = findModule("elevationHigh");
	},
	_initDiscordComponents(obj) {
		const e = getReact(); 

		obj.Textbox = EDApi.findModuleByDisplayName("TextInput");
		obj.Select = EDApi.findModuleByDisplayName("SelectTempWrapper");
		obj.Switch = EDApi.findModuleByDisplayName("SwitchItem");
		obj.RadioGroup = EDApi.findModuleByDisplayName("RadioGroup");
		obj.Title = EDApi.findModuleByDisplayName("FormTitle");
		obj.Text = EDApi.findModuleByDisplayName("FormText");
		obj.FormSection = EDApi.findModuleByDisplayName("FormSection");
		obj.Icon = EDApi.findModuleByDisplayName("Icon");
		obj.LoadingSpinner = EDApi.findModuleByDisplayName("Spinner");
		obj.Card = EDApi.findModuleByDisplayName("FormNotice");
		obj.Flex = EDApi.findModuleByDisplayName("Flex");
		obj.Switch = EDApi.findModuleByDisplayName("Switch");
		obj.SwitchItem = EDApi.findModuleByDisplayName("SwitchItem");
		obj.Button = findModule("Sizes");
		
		obj.Divider = props => {
			props.className = props.className ? props.className + " " + ED.classMaps.divider : ED.classMaps.divider
			return e("div", Object.assign({}, props))
		}
	},
	components: {
		PluginsPage () {
			const e = getReact();
			const { FormSection, Divider } = ED.discordComponents;


			return e(FormSection, {title: "EnhancedDiscord Plugins", tag: "h2"},
				e(EDSettings.components.OpenPluginDirBtn),
				e(Divider, {className: join(ED.classMaps.margins.marginTop20, ED.classMaps.margins.marginBottom20)})
			)
		},
		SettingsPage () {
			const e = getReact();
			const { FormSection, SwitchItem } = ED.discordComponents;

			return e(FormSection, {title: "EnhancedDiscord Settings", tag: "h2"},
				e(SwitchItem, {note: "Allows EnhancedDiscord to load BetterDiscord plugins natively. Reload (ctrl+r) for changes to take effect."}, "BetterDiscord Plugins")
			)
		},
		Plugin () {
			const e = getReact();
			const { FormSection, SwitchItem } = ED.discordComponents;

			return e("div", null, "xd")
		},
		BaseSettingsNotice (props) { // Component for other plugins to use
			const e = getReact();
			const noticeClassMap = findModule("resetButton");

			return e("div", {className: noticeClassMap.container}, "xd")
		},
		OpenPluginDirBtn () {
			const { createElement:e, useState } = getReact(true);
			const { Button } = ED.discordComponents;
			const [ string, setString ] = useState("Open Plugins Directory");

			return e("div", null,
				e(Button, {size: Button.Sizes.SMALL, color: Button.Colors.GREEN, onClick: () => {
					console.log("dab")
				}}, string));
		}
	},
	NoticeStoreMimic: class { // Used to mimic a Redux? store for form notices.
		constructor() {
			this._cb = null;
			this._shouldShowNotice = false;
		}
		/* To be used by the component */
		setState(shouldShow) {
			this._shouldShowNotice = shouldShow;
			if (this._cb != null) this._cb();
		}
		/* Methods used by Discord */
		showNotice() {
			return this._shouldShowNotice;
		}
		addChangeListener(fn) {
			this._cb = fn;
		}
		removeChangeListener() {
			this._cb = null;
		}
	}
}

module.exports = new Plugin(EDSettings);
