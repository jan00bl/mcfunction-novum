const provider = require("./provider.js");

module.exports = {

	config: {
		autocomplete: {
			title: "Enable Autocomplete",
			description: "Enable mcfunction-novum's autocomplete+ manager",
			type: "boolean",
			default: true
		},
		showIcons: {
			title: "Show Icons",
			description: "Determines if custom icons are shown in the suggestion box. If this setting is deactivated characters are used as icons",
			type: "boolean",
			default: true
		},
		mcVersion: {
			title: "Change Version",
			description: "Change the minecraft version of the autocomplete",
			type: "string",
			default: "snapshot",
			enum: ["snapshot","1.16"]
		}
	},

	activate: () => {},

	getProvider: () => provider
}
