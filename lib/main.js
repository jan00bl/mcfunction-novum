const provider = require("./provider.js");
module.exports = {

	config: {
		autocomplete: {
			title: "Enable Autocomplete",
			description: "Enable mcfunction's autocomplete+ manager",
			type: "boolean",
			default: true
		},
		mcversion: {
			title: "Change Version",
			description: "",
			type: "string",
			default: "snapshot",
			enum: ["snapshot"]
		}
	},

	activate: () => {},

	getProvider: () => provider
}
