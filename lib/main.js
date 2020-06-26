const provider = require("./provider.js");
module.exports = {

	config: {
		autocomplete: {
			title: "Enable Autocomplete",
			description: "Enable mcfunction-novum's autocomplete+ manager",
			type: "boolean",
			default: true
		},
		mcversion: {
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
