const Plugin = require('../plugin');

const getComponentFromFluxContainer = component => {
	return (new component({})).render().type
}

const getReact = () => window.req.c[0].exports.createElement;

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
			element: [react-renderable (either a funuction or a class)] the page that will be rendered on the right when the section is clicked
			color: [optional] [string (hex)] a colour to be applied to the section (see the log out / discord nitro btn)
			onClick: [optional] [function] a function to be executed whenever the element is clicked

		special sections
			headers
				section: "HEADER"
				label: [string]
			divider
				section: "DIVIDER"
			custom element
				section: "CUSTOM"
				element: [react-renderable]

		All sections regardless of type can have a optional .predicate property which should be a fn returning a boolean as to whether to show the section or not

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
			element: this.components.SettingsPage
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
	},
	_initDiscordComponents(obj) {
		const e = getReact(); 

		obj.Textbox = EDApi.findModuleByDisplayName("TextInput");
		obj.Select = EDApi.findModuleByDisplayName("SelectTempWrapper");
		obj.Switch = EDApi.findModuleByDisplayName("SwitchItem");
		obj.RadioGroup = EDApi.findModuleByDisplayName("RadioGroup");
		obj.Title = EDApi.findModuleByDisplayName("FormTitle");
		obj.Text = EDApi.findModuleByDisplayName("FormText");
		obj.Icon = EDApi.findModuleByDisplayName("Icon");
		obj.LoadingSpinner = EDApi.findModuleByDisplayName("Spinner");
		obj.Card = EDApi.findModuleByDisplayName("FormNotice");
		obj.Flex = EDApi.findModuleByDisplayName("Flex");
		obj.Switch = EDApi.findModuleByDisplayName("Switch");
		
		obj.Divider = props => {
			props.className = props.className ? props.className + " " + ED.classMaps.divider : ED.classMaps.divider
			return e("div", Object.assign({}, props))
		}
	},
	components: {
		PluginsPage () {
			const e = getReact(); 
			return e("div")
		},
		SettingsPage () {
			const e = getReact();
			return e("div")
		},
		Plugin () {

		}
	}
}

module.exports = new Plugin(EDSettings);
