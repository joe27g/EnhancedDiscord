const Plugin = require('../plugin');

const getComponentFromFluxContainer = component => {
	return (new component({})).render().type
}

const getReact = (returnEntireReact = false) => { // WHY. THE. FUCK. https://github.com/joe27g/EnhancedDiscord/commit/976849e47fd0bd72af8e503bf2a593194bab2051
	const React = window.req.c[0].exports
	return returnEntireReact ? React : React.createElement;
}

const join = (...args) => args.join(" ");

const shouldPluginRender = id => {
	let shouldRender = true;

	// BetterDiscord plugins settings render in their own modal activated in their listing.
	if (window.ED.plugins[id].getSettingsPanel && typeof window.ED.plugins[id].getSettingsPanel == 'function') {
		shouldRender = false;
	}

	if (!window.ED.plugins[id].config || window.ED.config[id].enabled === false || !window.ED.plugins[id].generateSettings) {
		shouldRender = false;
	}

	return shouldRender;
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
		this.settingsSections = this._getDefaultSections(); // Easily allow plugins to add in their own sections if need be.

		this.unpatch = EDApi.monkeyPatch(
			UserSettings.prototype,
			"generateSections",
			data => {
				const sections = data.originalMethod.call(data.thisObject);
				// We use the devIndex as a base so that should Discord add more sections later on, our stuff shouldn't be going anywhere.
				const devIndex = this._getDevIndex(sections, discordConstants);

				sections.splice(devIndex + 2, 0, ...this.settingsSections);

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
			const { FormSection, Divider, Flex } = ED.discordComponents;


			return e(FormSection, {title: "EnhancedDiscord Plugins", tag: "h2"},
					e(Flex, {},
						e(EDSettings.components.OpenPluginDirBtn)
					),
				e(Divider, {className: join(ED.classMaps.margins.marginTop20, ED.classMaps.margins.marginBottom20)})
			)
		},
		SettingsPage () {
			const { createElement:e, Fragment } = getReact(true);
			const { FormSection } = ED.discordComponents;

			return e(Fragment, null,
				e(FormSection, {title: "EnhancedDiscord Settings", tag: "h2"},
					e(module.exports.components.BDPluginToggle),
					Object
						.keys(ED.plugins)
						.filter(shouldPluginRender)
						.map((id, index) => e(module.exports.components.PluginSettings, {id, plugin: ED.plugins[id], index})),
				)
			)
		},
		PluginListing () {
			const e = getReact();
			const { FormSection, Switch } = ED.discordComponents;

			return e("div", null, "xd")
		},
		PluginSettings (props) {
			const { createElement:e, Fragment } = getReact(true);
			const { Divider, Title } = ED.discordComponents;
			const { _VariableTypeRenderer: VTR } = module.exports.components;


			return e(Fragment, null,
				e(Divider, { style:{ marginTop: props.index === 0 ? "0px" : undefined}, className: join(ED.classMaps.margins.marginTop8, ED.classMaps.margins.marginBottom20)}),
				e(Title, {tag: "h2"}, props.plugin.name),
				new VTR(props.plugin).render()
			)
		},
		_VariableTypeRenderer: class {
			static get DOMStringRenderer () {
				const { createElement:e, Component } = getReact(true);

				return class DOMString extends Component {
					componentDidMount() {
						this.props.listeners.forEach(listener => {
							document.querySelector(listener.el).addEventListener(listener.type, listener.eHandler)
						});
					}
					render () {
						return e("div", {dangerouslySetInnerHTML:{__html: this.props.html}});
					}
				}
			}
			static get HTMLElementInstanceRenderer () {
				const { createElement:e, Component, createRef } = getReact(true);

				return class HTMLElementInstance extends Component {
					constructor() {
						super();

						this.ref = createRef();
					}
					componentDidMount() {
						this.ref.current.appendChild(this.props.instance)
					}
					render () {
						return e("div", {ref: this.ref});
					}
				}
			}
			constructor(plugin) {
				const { isValidElement } = getReact(true);
				this._p = plugin;
				let typeOf = null;

				const settings = plugin.generateSettings();

				if (typeof settings === "string") typeOf = "domstring";
				if (isValidElement(settings)) typeOf = "react";
				if (settings instanceof HTMLElement) typeOf = "htmlelement-instance";

				if (typeOf === null) module.exports.error("Unable to figure out how to render value returned by Plugin.generateSettings for", plugin.name, ". Please check the plugins.md file in the ED github repo for more information.");

				this.typeOf = typeOf;
			}
			render () {
				const e = getReact();
				const { DOMStringRenderer, HTMLElementInstanceRenderer } = this.constructor;

				switch(this.typeOf) {
					case "domstring": return e(DOMStringRenderer, {html: this._p.generateSettings(), listeners: this._p.settingListeners});
					case "react": return this._p.generateSettings();
					case "htmlelement-instance": return e(HTMLElementInstanceRenderer, {instance: this._p.generateSettings()})
				}
			}
		},
		BDPluginToggle () {
			const { createElement:e, useState , useEffect } = getReact(true);
			const { SwitchItem } = ED.discordComponents;

			const [ enabled, setEnabled ] = useState(window.ED.config.bdPlugins);
			useEffect(() => {
				window.ED.config.bdPlugins = enabled;
				window.ED.config = window.ED.config;
			})

			return e(SwitchItem, {
				onChange: () => setEnabled(!enabled),
				value: enabled,
				hideBorder: true,
				note: "Allows EnhancedDiscord to load BetterDiscord plugins natively. Reload (ctrl+r) for changes to take effect."
			},
				"BetterDiscord Plugins"
			)
		},
		OpenPluginDirBtn () {
			const { createElement:e, useState } = getReact(true);
			const { Button } = ED.discordComponents;
			const [ string, setString ] = useState("Open Plugins Directory");

			return e(Button, {size: Button.Sizes.SMALL, color: Button.Colors.GREEN, onClick: () => {
				setString("Opening...");
				const sucess = require("electron").shell.openItem(
					require("path").join(process.env.injDir, "plugins")
				);

				if (sucess) setString("Opened!");
				else setString("Failed to open...");

				setTimeout(() => {
					setString("Open Plugins Directory")
				}, 1500)
			}}, string);
		}
	}
}

module.exports = new Plugin(EDSettings);
