const provider = require("./provider.js");
const { setLists } = require("./provider.js");
const shell = require('shell');

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
			enum: provider.versions
		},
		showPopup: {
			title: "Show Popup",
			description: "Enable the popup which is shown after startup",
			type: "boolean",
			default: true
		}
	},

	activate: () => {
		provider.setLists(atom.config.get("mcfunction-novum.mcVersion"));

		atom.config.onDidChange("mcfunction-novum.mcVersion", () => {
			setLists(atom.config.get("mcfunction-novum.mcVersion"));
		});

		if(atom.config.get("mcfunction-novum.showPopup")) {
			let notification = atom.notifications.addInfo("mcfunction novum",
				{
					dismissable: true,
					description: "If you find any missing block, item, sound etc. please report it in the repository.\nThank you for your help :D",
					buttons: [
						{
							text: "Go to the repository",
							className: "popup-btn",
							onDidClick: () => shell.openExternal('https://github.com/jan00bl/mcfunction-novum/issues')
						},
						{
							text: "Never show this again",
							className: "popup-btn",
							onDidClick: () => {
								atom.config.set("mcfunction-novum.showPopup", false);
								notification.dismiss();
							}
						}
					]
				}
			);
		}
	},

	getProvider: () => provider
}
