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
        if (!window.ED.classMaps) {
            window.ED.classMaps = {};
		}

		if (!window.ED.discordComponents) {
			window.ED.discordComponents = {};
		}
		
		this.initClassMaps(window.ED.classMaps);
		this.initDiscordComponents(window.ED.discordComponents);

		const UserSettings = getComponentFromFluxContainer(
			EDApi.findModule('getUserSettingsSections').default
		);

		this.unpatch = EDApi.monkeyPatch(
			UserSettings.prototype,
			"generateSections",
			data => {
				const sections = data.originalMethod.call(data.thisObject);

				sections.push({
					section: "HEADER",
					label: "YOU'RE GAY"
				})

				return sections;
			}
		)
	},
	unload () {
		this.unpatch();
	},
	initClassMaps(obj) {
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
	initDiscordComponents(obj) {
			obj.Textbox = EDApi.findModuleByDisplayName("TextInput"),
			obj.Select = EDApi.findModuleByDisplayName("SelectTempWrapper"),
			obj.Switch = EDApi.findModuleByDisplayName("SwitchItem"),
			obj.RadioGroup = EDApi.findModuleByDisplayName("RadioGroup"),
			obj.Divider = EDApi.findModuleByDisplayName("FormDivider"), // FIX
			obj.Title = EDApi.findModuleByDisplayName("FormTitle"),
			obj.Text = EDApi.findModuleByDisplayName("FormText"),
			obj.Icon = EDApi.findModuleByDisplayName("Icon"),
			obj.LoadingSpinner = EDApi.findModuleByDisplayName("Spinner"),
			obj.Card = EDApi.findModuleByDisplayName("FormNotice"),
			obj.Flex = EDApi.findModuleByDisplayName("Flex")
	},
	components: {
		PluginPage () {
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
