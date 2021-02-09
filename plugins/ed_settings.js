const Plugin = require('../plugin');
const BD = require('../bd_shit');

const edSettingsID = require("path").parse(__filename).name;

module.exports = new Plugin({
	name: 'ED Settings (React)',
	author: 'jakuski#9191',
	description: 'Adds an EnhancedDiscord tab in user settings.',
	color: 'darkred',
	async load () {
		const discordConstants = EDApi.findModule("API_HOST");
		const UserSettings = module.exports.utils.getComponentFromFluxContainer(
			EDApi.findModule('getUserSettingsSections').default
		);

		if (!ED.classMaps) {
			ED.classMaps = {};
		}

		if (!ED.discordComponents) {
			ED.discordComponents = {};
		}

		this._initClassMaps(ED.classMaps);
		this._initDiscordComponents(ED.discordComponents);
		this.components = this._initReactComponents();
		this.settingsSections = this._getDefaultSections(); // Easily allow plugins to add in their own sections if need be.

		this.unpatch = EDApi.monkeyPatch(
			UserSettings.prototype,
			"generateSections",
			data => {
				const sections = data.originalMethod.call(data.thisObject);
				// We use the devIndex as a base so that should Discord add more sections later on, our sections shouldn't move possibly fucking up the UI.
				const devIndex = this._getDevSectionIndex(sections, discordConstants);
				let workingIndex = devIndex + 2;

				sections.splice(workingIndex, 0, ...this.settingsSections);
				workingIndex += this.settingsSections.length;

				const customSections = this._getPluginSections();
				if (customSections.length) {
					sections.splice(workingIndex, 0, ...customSections);
					workingIndex += customSections.length;
				}

				sections.splice(workingIndex, 0, { section: "DIVIDER" });
				
				return sections;
			}
		)
	},
	unload () {
		if (this.unpatch && typeof this.unpatch === "function") this.unpatch();
	},
	utils: {
		join (...args) {
			return args.join(" ")
		},
		getComponentFromFluxContainer (component) {
			return (new component({})).render().type;
		},
		shouldPluginRender (id) {
			let shouldRender = true;

			// BetterDiscord plugins settings render in their own modal activated in their listing.
			if (ED.plugins[id].getSettingsPanel && typeof ED.plugins[id].getSettingsPanel == 'function') {
				shouldRender = false;
			}

			if (ED.plugins[id].settings.enabled === false || !ED.plugins[id].generateSettings) {
				shouldRender = false;
			}

			return shouldRender;
		}
	},
	_getDevSectionIndex(sections, constants) {
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
			section: "CUSTOM",
			element: () => {
				const { join } = module.exports.utils;
				const { header } = EDApi.findModule("topPill");

				return EDApi.React.createElement("div", { className: join(header, "ed-settings") }, "EnhancedDiscord")
			}
		},{
			section: "ED/Plugins",
			label: "Plugins",
			element: this.components.PluginsPage
		},{
			section: "ED/Settings",
			label: "Settings",
			element: this.components.SettingsPage
		}];
	},
	_getPluginSections() {
		const arr = [];
		for (const key in ED.plugins) {
			if (typeof ED.plugins[key].generateSettingsSection !== 'function') continue;

			const label = ED.plugins[key].settingsSectionName || ED.plugins[key].name;
			arr.push({
				section: 'ED/'+key,
				label,
				element: () => EDApi.React.createElement(this.components.PluginSection, {id: key, label})
			});
		}
		return arr;
	},
	_initClassMaps(obj) {
		const divM = EDApi.findModule(m => m.divider && Object.keys(m).length === 1)
		obj.headers = EDApi.findModule('defaultMarginh2');
		obj.margins = EDApi.findModule('marginBottom8');
		obj.divider = divM ? divM.divider : '';
		obj.checkbox = EDApi.findModule('checkboxEnabled');
		obj.buttons = EDApi.findModule('lookFilled');
		obj.switch = EDApi.findModule('switch');
		obj.alignment = EDApi.findModule('horizontalReverse');
		obj.description = EDApi.findModule('formText');
		// New
		obj.shadows = EDApi.findModule("elevationHigh");
	},
	_initDiscordComponents(obj) {
		obj.Textbox = EDApi.findModuleByDisplayName("TextInput");
		obj.Select = EDApi.findModuleByDisplayName("SelectTempWrapper");
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
		obj.Slider = EDApi.findModuleByDisplayName("Slider");
		obj.Select = EDApi.findModuleByDisplayName("SelectTempWrapper");
		obj.Tooltip = EDApi.findModuleByDisplayName("Tooltip");
		obj.Button = EDApi.findModule("Sizes");
		//obj.ColorPicker = EDApi.findModuleByDisplayName("ColorPicker");

		/*
		Props: any valid props you can apply to a div element
		*/
		obj.Divider = props => {
			props.className = props.className ? props.className + " " + ED.classMaps.divider : ED.classMaps.divider
			return EDApi.React.createElement("div", Object.assign({}, props))
		}
	},
	_initReactComponents () {
		const { createElement:e, Component, Fragment, useState, useEffect, useReducer, createRef, isValidElement } = EDApi.React;
		const { FormSection, Divider, Flex, Switch, Title, Text, Button, SwitchItem, Textbox, RadioGroup, Select, Slider /*, ColorPicker*/ } = ED.discordComponents;
		const { margins } = ED.classMaps;
		const { join } = module.exports.utils;

		const PluginsPage = () => {
			return e(FormSection, {title: "EnhancedDiscord Plugins", tag: "h2"},
					e(Flex, {},
						e(OpenPluginDirBtn)
					),
				e(Divider, {className: join(margins.marginTop20, margins.marginBottom20)}),
				Object
					.keys(ED.plugins)
					.map(id => e(PluginListing, {id, plugin: ED.plugins[id]}))
			)
		}

		const SettingsPage = () => {
			return e(Fragment, null,
				e(FormSection, {title: "EnhancedDiscord Settings", tag: "h2"},
					e(BDPluginToggle),
					Object
						.keys(ED.plugins)
						.filter(module.exports.utils.shouldPluginRender)
						.map((id, index) => e(PluginSettings, {id, index})),
				)
			)
		}

		class PluginListing extends Component {
			constructor(props) {
				super(props);

				this.state = {
					reloadBtnText: "Reload"
				}

				this.canBeManagedByUser = this.canBeManagedByUser.bind(this);
				this.isPluginEnabled = this.isPluginEnabled.bind(this);
				this.handleReload = this.handleReload.bind(this);
				this.handleToggle = this.handleToggle.bind(this);
				this.handleLoad = this.handleLoad.bind(this);
				this.handleUnload = this.handleUnload.bind(this);
			}
			isPluginEnabled() {
				return this.props.plugin.settings.enabled !== false;
			}
			canBeManagedByUser () {
				return !(this.props.id === edSettingsID)
			}
			handleReload () {
				this.setState({reloadBtnText: "Reloading..."});
				try {
					this.props.plugin.reload();
					this.setState({reloadBtnText: "Reloaded!"});
				} catch (err) {
					module.exports.error(err);
					this.setState({reloadBtnText: `Failed to reload (${err.name} - see console.)`})
				}

				setTimeout(
					setState => setState({reloadBtnText: "Reload"}),
					3000,
					this.setState.bind(this)
				)
			}
			handleToggle(newStatus) {
				if (newStatus) this.handleLoad();
				else this.handleUnload();

				this.forceUpdate();
			}
			handleLoad () {
				if (this.isPluginEnabled()) return;

				this.props.plugin.settings.enabled = true;
				ED.plugins[this.props.id].settings = this.props.plugin.settings;
				this.props.plugin.load();
			}
			handleUnload () {
				if (!this.isPluginEnabled()) return;

				this.props.plugin.settings.enabled = false;
				ED.plugins[this.props.id].settings = this.props.plugin.settings;
				this.props.plugin.unload();
			}
			render () {
				const { plugin } = this.props;
				const { MarginRight, ColorBlob } = this.constructor;

				return e(Fragment, null,
					e(Flex, { direction: Flex.Direction.VERTICAL},
						e(Flex, {align: Flex.Align.CENTER},
							e(Title, {tag: "h3", className: ""}, plugin.name),
							e(ColorBlob, {color: plugin.color || "orange"}),
							e(MarginRight, null,
								e(Button, {size: Button.Sizes.NONE, onClick: this.handleReload}, this.state.reloadBtnText)
							),
							this.canBeManagedByUser() && e(Switch, {checked: this.isPluginEnabled(), onChange: this.handleToggle})
						),
						e(Text, {type: Text.Types.DESCRIPTION},
							VariableTypeRenderer.render(plugin.description)
						)
					),
					e(Divider, {className: join(margins.marginTop20, margins.marginBottom20)})
				)
			}
		}

		PluginListing.MarginRight = props => e("div", {style:{marginRight: "10px"}}, props.children);
		PluginListing.ColorBlob = props => e("div", {style: {
			backgroundColor: props.color,
			boxShadow: `0 0 5px 2px ${props.color}`,
			borderRadius: "50%",
			height: "10px",
			width: "10px",
			marginRight: "8px"
		}});

		const PluginSettings = props => {
			const plugin = ED.plugins[props.id];

			return e(Fragment, null,
				e(Divider, { style:{ marginTop: props.index === 0 ? "0px" : undefined}, className: join(margins.marginTop8, margins.marginBottom20)}),
				e(Title, {tag: "h2"}, plugin.name),
				VariableTypeRenderer.render(
					plugin.generateSettings(),
					plugin.settingsListeners,
					props.id
				)
			)
		}

		const PluginSection = props => {
			const plugin = ED.plugins[props.id];

			return e(Fragment, null,
				e(Title, {tag: "h2"}, props.label),
				VariableTypeRenderer.render(
					plugin.generateSettingsSection(),
					plugin.settingsListeners,
					props.id
				)
			)
		}

		const BDPluginToggle = () => {
			const [ enabled, setEnabled ] = useState(ED.config.bdPlugins);

			useEffect(() => {
				if (enabled === ED.config.bdPlugins) return; // Prevent unneccesary file write

				ED.config.bdPlugins = enabled;
				ED.config = ED.config;
			});

			return e(SwitchItem, {
				onChange: () => setEnabled(!enabled),
				value: enabled,
				hideBorder: true,
				note: "Allows EnhancedDiscord to load BetterDiscord plugins natively. Reload (ctrl+r) for changes to take effect."
			},
				"BetterDiscord Plugins"
			);
		}

		const OpenPluginDirBtn = () => {
			const [ string, setString ] = useState("Open Plugins Directory");

			return e(Button, {size: Button.Sizes.SMALL, color: Button.Colors.GREEN, style: {margin: '0 5px', display: 'inline-block'}, onClick: e => {
				setString("Opening...");
				const sucess = require("electron").shell.openPath(
					e.shiftKey ?
					process.env.injDir :
					require("path").join(process.env.injDir, "plugins")
				);

				if (sucess) setString("Opened!");
				else setString("Failed to open...");

				setTimeout(() => {
					setString("Open Plugins Directory")
				}, 1500)
			}}, string)
		}

		class VariableTypeRenderer {
			static render (value, listeners, plugin) {
				const { DOMStringRenderer, HTMLElementInstanceRenderer } = this;

				let typeOf = null;

				if (typeof value === "string") typeOf = "domstring";
				if (isValidElement(value)) typeOf = "react";
				if (value instanceof HTMLElement) typeOf = "htmlelement-instance";
				if (Array.isArray(value)) typeOf = "auto";
				if (value == null) typeOf = "blank";

				if (typeOf === null) return module.exports.error("Unable to figure out how to render value ", value);

				switch(typeOf) {
					case "domstring": return e(DOMStringRenderer, {html: value, listeners});
					case "react": return value;
					case "htmlelement-instance": return e(HTMLElementInstanceRenderer, {instance: value});
					case "auto": return DiscordUIGenerator.render(value, plugin);
					case "blank": return e(Fragment);
				}
			}
		}
		VariableTypeRenderer.DOMStringRenderer = class DOMString extends Component {
			componentDidMount() {
				if (!this.props.listeners) return;

				this.props.listeners.forEach(listener => {
					document.querySelector(listener.el).addEventListener(listener.type, listener.eHandler)
				});
			}
			render () {
				return e("div", {dangerouslySetInnerHTML:{__html: this.props.html}});
			}
		}
		VariableTypeRenderer.HTMLElementInstanceRenderer = class HTMLElementInstance extends Component {
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

		const DiscordUIGenerator = {
			reactMarkdownRules: (() => {
				const simpleMarkdown = EDApi.findModule("markdownToReact");
				const rules = require("electron").webFrame.top.context.window._.clone(simpleMarkdown.defaultRules);

				rules.paragraph.react = (node, output, state) => {
					return e(Fragment, null, output(node.content, state))
				}

				rules.em.react = (node, output, state) => {
					return e("i", null, output(node.content, state))
				}

				rules.link.react = (node, output, state) => {
					return e("a", {
						href: node.target,
						target: "_blank",
						rel: "noreferrer noopener"
					}, output(node.content, state))
				}

				return rules;
			})(),
			render (ui, pluginID) {
				const { _types } = DiscordUIGenerator;

				return e("div", {},
					ui.map(element => {
						if (isValidElement(element)) return element;

						const component = _types[element.type];
						if (!component) return module.exports.error("[DiscordUIGenerator] Invalid element type:", element.type);

						return e(component, Object.assign({}, element, {pluginID}))
					})
				)
			},
			_parseMD (content) {
				const { reactMarkdownRules } = DiscordUIGenerator;
				const { markdownToReact } = EDApi.findModule("markdownToReact");

				return markdownToReact(content, reactMarkdownRules);
			},
			_loadData (props) {
				const plug = ED.plugins[props.pluginID];
				if (!plug) return;
				if (plug.customLoad) { // custom function for loading settings
					return plug.customLoad(props.configName)
				}
				return EDApi.loadData(props.pluginID, props.configName)
			},
			_saveData (props, data) {
				const plug = ED.plugins[props.pluginID];
				if (!plug) return;
				if (plug.customSave) { // custom function for saving settings
					return plug.customSave(props.configName, data)
				}
				const r = EDApi.saveData(props.pluginID, props.configName, data)
				if (plug.onSettingsUpdate) { // custom function to run after settings have updated
					plug.onSettingsUpdate(props.configName, data)
				}
				return r;
			},
			_cfgNameCheck(props, name) {
				if (!props.configName || typeof props.configName !== "string") {
					module.exports.error(`[DiscordUIGenerator] Input component (${name}) was not passed a configName value!`);
					throw new Error("Stopping react render. Please fix above error");
				}
			},
			_inputWrapper (props) {
				const { _parseMD } = DiscordUIGenerator;

				return e(Fragment, null,
					props.title && e(Title, { tag: "h5"}, props.title),
					props.children,
					props.desc && e(Text, {type: Text.Types.DESCRIPTION, className: join(margins.marginTop8, margins.marginBottom20)}, _parseMD(props.desc))
				)
			},
			_types: {
				"std:title": props => {
					return e(Title, { id: props.id, tag: props.tag || "h5" },
						props.content
					)
				},
				"std:description": props => {
					const {_parseMD} = DiscordUIGenerator;

					return e(Text, { id: props.id, type: props.descriptionType || "description" }, _parseMD(props.content))
				},
				"std:divider": props => {
					return e(Divider, {id: props.id, style: {marginTop: props.top, marginBottom: props.bottom}})
				},
				"std:spacer": props => {
					return e("div", {id: props.id, style: {marginBottom: props.space}})
				},
				"input:text": props => {
					const {_loadData: load, _saveData: save, _cfgNameCheck, _inputWrapper} = DiscordUIGenerator;

					_cfgNameCheck(props, "input:text");

					const [value, setValue] = useState(load(props));

					return e(_inputWrapper, {title: props.title, desc: props.desc},
						e(Textbox, {
							id: props.id,
							onChange: val => setValue(val),
							onBlur: e => save(props, e.currentTarget.value),
							value,
							placeholder: props.placeholder,
							size: props.mini ? "mini" : "default",
							disabled: props.disabled,
							type: props.number ? "number" : "text"
						})
					)
				},
				"input:button": props => {
					const [ string, setString ] = useState(props.name);
		
					return e(Button, {
						id: props.id,
						size: Button.Sizes[(props.size || '').toUpperCase() || 'SMALL'],
						color: Button.Colors[(props.color || '').toUpperCase() || 'BRAND'],
						look: Button.Looks[(props.look || '').toUpperCase() || 'FILLED'],
						style: {margin: '0 5px', display: 'inline-block'},
						disabled: props.disabled,
						onClick: () => props.onClick(setString)
					}, string)
				},
				"input:colorpicker": props => {
					// TODO: proper transparency support? would need to use different/modified component
					const {_loadData: load, _saveData: save, _cfgNameCheck, _inputWrapper} = DiscordUIGenerator;

					_cfgNameCheck(props, "input:text");

					const [value, setValue] = useState(load(props));

					return e("div",
						e(Title, { tag: "h5" }, props.title),
						/*e(ColorPicker, {
							onChange: value => {
								const hexValue = '#'+value.toString(16).padStart(6, '0');
								const inp = document.getElementById('ed_'+props.configName);
								if (inp) inp.value = hexValue;
								save(props, hexValue);
							},
							colors: props.colors || [],
							defaultColor: props.defaultColor,
							customColor: props.currentColor,
							value: props.currentColor
						}),*/
						e("div", {style: {marginBottom: 10}}),
						e(_inputWrapper, {desc: props.desc},
							e(Textbox, {
								id: 'ed_'+props.configName,
								onChange: val => setValue(val),
								onBlur: e => save(props, e.currentTarget.value),
								value,
								placeholder: props.placeholder,
								size: "mini",
								disabled: props.disabled
							})
						)
					)
				},
				"input:boolean": props => {
					const {_loadData: load, _saveData: save, _cfgNameCheck, _parseMD} = DiscordUIGenerator;

					_cfgNameCheck(props, "input:boolean");

					const [ enabled, toggle ] = useReducer((state) => {
						const newState = !state;

						save(props, newState);

						return newState;
					}, load(props))

					return e(SwitchItem, {
						id: props.id,
						onChange: toggle,
						value: enabled,
						hideBorder: props.hideBorder,
						note: _parseMD(props.note),
						disabled: props.disabled
					},
						props.title
					)
				},
				"input:radio": props => {
					const {_loadData: load, _saveData: save, _cfgNameCheck, _inputWrapper} = DiscordUIGenerator;

					_cfgNameCheck(props, "input:radio");

					const [ currentSetting, setSetting ] = useReducer((state, data) => {
						const newState = data.value;

						save(props, newState);

						return newState;
					}, load(props))

					return e(_inputWrapper, {title: props.title, desc: props.desc},
						e(RadioGroup, {
							id: props.id,
							onChange: setSetting,
							value: currentSetting,
							size: props.size ? props.size : "10px",
							disabled: props.disabled,
							options: props.options
						})
					)
				},
				"input:select": props => {
					const {_loadData: load, _saveData: save, _cfgNameCheck, _inputWrapper} = DiscordUIGenerator;

					_cfgNameCheck(props, "input:select");

					const [ currentSetting, setSetting ] = useReducer((state, data) => {
						const newState = data.value;

						save(props, newState);

						return newState;
					}, load(props))

					return e(_inputWrapper, {title: props.title, desc: props.desc},
						e(Select, {
							id: props.id,
							onChange: setSetting,
							value: currentSetting,
							disabled: props.disabled,
							options: props.options,
							searchable: props.searchable || false
						})
					)
				},
				"input:slider": props => {
					const {_loadData: load, _saveData: save, _cfgNameCheck, _inputWrapper} = DiscordUIGenerator;

					_cfgNameCheck(props, "input:slider");

					const [ currentSetting, setSetting ] = useReducer((state, data) => {
						const newState = data;

						save(props, newState);

						return newState;
					}, load(props) || props.defaultValue);

					const defaultOnValueRender = e => {
						return e.toFixed(0) + "%"
					}

					return e(_inputWrapper, {title: props.title, desc: props.desc},
						e(Slider, {
							id: props.id,
							onValueChange: setSetting,
							onValueRender: props.formatTooltip ? props.formatTooltip : defaultOnValueRender,
							initialValue: currentSetting,
							defaultValue: props.highlightDefaultValue ? props.defaultValue : null,
							minValue: props.minValue,
							maxValue: props.maxValue,
							disabled: props.disabled,
							markers: props.markers,
							stickToMarkers: props.stickToMarkers
						})
					)
				}
			}
		}

		return {
			PluginsPage,
			SettingsPage,
			PluginListing,
			PluginSettings,
			PluginSection,
			BDPluginToggle,
			OpenPluginDirBtn,
			__VariableTypeRenderer: VariableTypeRenderer,
			__DiscordUIGenerator: DiscordUIGenerator
		}
	}
});
