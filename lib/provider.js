const commands = require("./commands.json");
const biomes = require("./id/biome.json");
const blocks = require("./id/block.json");
const effects = require("./id/effect.json");
const loottables = require("./id/loottable.json");
const advancements = require("./id/advancement.json");
const enchantments = require("./id/enchantment.json");
const items = require("./id/item.json");
const sounds = require("./id/sound.json");
const recipes = require("./id/recipe.json");
const slots = require("./id/slot.json");
const structures = require("./id/structure.json");
const entities = require("./id/entity.json");
const particles = require("./id/particle.json");
const selectors = require("./id/selector.json");
const scoreboards = require("./id/scoreboard.json");
const colors = require("./id/color.json");

const scoreboardSlots = scoreboards["slots"];
const scoreboardObjectives = scoreboards["objectives"];

for(var v of items) {
	scoreboardObjectives.push("minecraft.crafted:" + v.replace(":","."));
	scoreboardObjectives.push("minecraft.broken:" + v.replace(":","."));
	scoreboardObjectives.push("minecraft.picked_up:" + v.replace(":","."));
	scoreboardObjectives.push("minecraft.dropped:" + v.replace(":","."));
	scoreboardObjectives.push("minecraft.used:" + v.replace(":","."));
}
for(var v of blocks) {
	scoreboardObjectives.push("minecraft.crafted:" + v.replace(":","."));
	scoreboardObjectives.push("minecraft.broken:" + v.replace(":","."));
	scoreboardObjectives.push("minecraft.picked_up:" + v.replace(":","."));
	scoreboardObjectives.push("minecraft.dropped:" + v.replace(":","."));
	scoreboardObjectives.push("minecraft.used:" + v.replace(":","."));
}
for(var v of entities) {
	scoreboardObjectives.push("minecraft.killed:" + v.replace(":","."));
	scoreboardObjectives.push("minecraft.killed_by:" + v.replace(":","."));
}
for(var v of colors) {
	scoreboardObjectives.push("teamkill." + v);
	scoreboardObjectives.push("killedByTeam." + v);
}
for(var v of scoreboards["custom"]) {
	scoreboardObjectives.push("minecraft.custom:" + v);
}

const fs = require("fs");

var sort = true;

function compareOut(a, b) {

	const textA = a.text
	const textB = b.text

	let comparison = 0;
	if (textA > textB) {
		comparison = 1;
	} else if (textA < textB) {
		comparison = -1;
	}
	return comparison;
}

function suggestions(array, text, type, icon, out) {
	for(var v of array) {
		if(v.startsWith(text)) {
			var cutText = text;
			var output = v;
			while(cutText.search(/\.|:/) != -1) {
				cutText = cutText.replace(cutText.slice(0,cutText.search(/\.|:/) + 1),"");
				output = output.replace(output.slice(0,output.search(/\.|:/) + 1),"");
			}
			out.push({
				text: output,
				type: type,
				iconHTML: icon
			});
		}
	}
}

module.exports = {

	selector: ".source.mcfunction13",
	disableForSelector: ".source.mcfunction13 .comment",

	inclusionPriority: 1,

	suggestionPriority: 2,

	getCurrentCommand: function (editor, bufferPosition) {
		var text = editor.getTextInBufferRange([[bufferPosition.row, 0], bufferPosition]);
		var matches = text.match(/^\w+/g);
		if(matches == null) return null;
		var cmd = matches[0];
		return cmd;
	},

	getCommandStop: function (text, command) {

		if(command == null) return null;

		//replace all non arg seperating spaces with an _

		var block = [];

		var aux = "";
		for(var c of text) {
			if(c == "{") {
				block.push("}");
				aux += c;
			} else if(c == "[") {
				block.push("]");
				aux += c;
			} else if(c == "\"" && block[block.length - 1] != "\"") {
				block.push("\"");
				aux += c;
			} else if(c == block[block.length - 1]) {
				block.pop();
				aux += c;
			} else if(c == " " && block.length > 0) aux += "_";
			else aux += c;
		}

		var args = aux.split(" ").slice(1, -1);
		if(command["alias"] != null) return this.runCycle(args, commands["commands"][command["alias"]]["cycleMarkers"])["cycle"]
		var cycle = command["cycleMarkers"];
		return this.runCycle(args, cycle)["cycle"];
	},

	runCycle: function(args, cycle) {
		var i = 0;
		var c = 0;
		var realLastStop = null;
		for(; i < args.length; ) {
			var arg = args[i];
			var stop = cycle[c];

			var realStop = stop;
			if (stop["include"] != null) {
				realStop = commands["reference"][stop["include"]];
			}
			if(realStop["type"] == "option" && (realStop["anyValue"] == null || ! realStop["anyValue"])) {
				if(! realStop["value"].includes(arg)) {
					return {
						pos: cycle.length + 1,
						argPos: args.length + 1,
						cycle: {
							type: "end"
						}
					}
				}
			}
			if ((realStop["type"] == "option" || realStop["type"] == "particle") && realStop["change"] != null && realStop["change"][arg] != null) {
				var cycleRun = this.runCycle(args.slice(i + 1), realStop["change"][arg]);
				i += cycleRun["argPos"] + 1;
				c += 1;
				if(cycleRun["cycle"] != null) return {
					pos: c,
					argPos: i,
					cycle: cycleRun["cycle"]
				}
			} else if(realStop["type"] == "coord") {
				i += 3;
				c += 1;
				if(args.length < i) return {
					pos: c,
					argPos: i,
					cycle: realStop
				}
			} else if(realStop["type"] == "center" || realStop["type"] == "rotation") {
				i += 2;
				c += 1;
				if(args.length < i) return {
					pos: c,
					argPos: i,
					cycle: realStop
				}
			} else if (realStop["type"] == "end") {
				return {
					pos: c,
					argPos: i,
					cycle: cycle[c]
				}
			} else if(realStop["type"] == "command") {
				var cmd = args[i];
				var newCycle = commands["commands"][cmd];
				return {
					pos: cycle.length + 1,
					argPos: args.length + 1,
					cycle: this.getCommandStop(args.slice(i).join(" ") + " !", newCycle)
				}
			} else if(realStop["type"] == "greedy") {
				return {
					pos: cycle.length + 1,
					argPos: args.length + 1,
					cycle: realStop
				}
			} else {
				i++;
				c++;
			}

			if(c >= cycle.length) return {
				pos: c,
				argPos: i,
				cycle: null
			}
			realLastStop = realStop;
		}

		if(cycle[0] != null) {
			var stop = cycle[c];

			var realStop = stop;
			if (stop["include"] != null) {
				realStop = commands["reference"][stop["include"]];
			}
			return {
				pos: c,
				argPos: i,
				cycle: realStop
			}
		}
		return {
			pos: c,
			argPos: i,
			cycle: null
		}
	},

	getSuggestions: function (args) {
		if(! atom.config.get("mcfunction-novum.autocomplete")) return;
		var bufferPos = args.bufferPosition;
		var editor = args.editor;
		var current = this.getCurrentCommand(editor, bufferPos);
		var out = [];
		var lineText = editor.getTextInBufferRange([[bufferPos.row, 0], bufferPos]);
		if(! lineText.includes(" ")) {
			out = this.getCommandOption(lineText);
		} else if(current != null) {

			var splitText = lineText.split("");
			var currentText = "";
			var splitedText = [];

			var inQuote = false;
			var backslash = false;

			for(var char of splitText) {
				if(!backslash && char == '\\') {
					backslash = true;
					currentText += char;
				} else if(backslash && char == '\"') {
					backslash = false;
					currentText += char;
				} else if (!inQuote && char == '\"') {
					inQuote = true;
					currentText += char;
				} else if (inQuote && char == '\"') {
					inQuote = false;
					currentText += char;
				} else if (!inQuote && char == ' ') {
					splitedText.push(currentText);
					currentText = "";
					backslash = false;
				} else {
					currentText += char;
					backslash = false;
				}
			}
			splitedText.push(currentText);

			var lastText = splitedText[splitedText.length - 1];

			if(commands["commands"][current] == null) return null;
			var stop = this.getCommandStop(lineText, commands["commands"][current]);
			if(stop == null) return [];

			if(stop["type"] == "command") out = this.getCommandOption(lastText);
			else if(stop["type"] == "option") for(var opt of stop["value"]) {
				if(opt.startsWith(lastText)) out.push({
					text: opt,
					type: "option",
					iconHTML: "<i class=\"icon option\">?</i>"
				});
			} else if(stop["type"] == "block") {
					suggestions(blocks, lastText, "block", "<img style=\"width:1.5em; height:1.5em;\" src=\"" + __dirname + "/svgicon/block.svg\">", out);
			} else if(stop["type"] == "effect") {
					suggestions(effects, lastText, "effect", "<i class=\"icon effect\">e</i>", out);
			} else if(stop["type"] == "advancement") {
					suggestions(advancements, lastText, "advancement", "<i class=\"icon advancement\">a</i>", out);
			} else if(stop["type"] == "biome") {
					suggestions(biomes, lastText, "biome", "<i class=\"icon biome\">b</i>", out);
			} else if(stop["type"] == "structure") {
					suggestions(structures, lastText, "structure", "<i class=\"icon structure\">st</i>", out);
			} else if(stop["type"] == "loottable") {
					suggestions(loottables, lastText, "loottable", "<i class=\"icon loottable\">l</i>", out);
			} else if(stop["type"] == "sound") {
					suggestions(sounds, lastText, "sound", "<i class=\"icon sound\">s</i>", out);
			} else if(stop["type"] == "particle") {
					suggestions(particles, lastText, "particle", "<i class=\"icon particle\">p</i>", out);
			} else if(stop["type"] == "enchantment") {
					suggestions(enchantments, lastText, "enchantment", "<i class=\"icon enchantment\" ><img style=\"width:1.5em; height:1.5em;\" src=\"" + __dirname + "/svgicon/enchantment.svg\"></i>", out);
			} else if(stop["type"] == "entity-id") {
					suggestions(entities, lastText, "entity-id", "<i class=\"icon entity\">e</i>", out);
			} else if(stop["type"] == "item") {
					suggestions(items, lastText, "item", "<i class=\"icon item\" ><img style=\"width:1.5em; height:1.5em;\" src=\"" + __dirname + "/svgicon/item.svg\"></i>", out);
					suggestions(blocks, lastText, "item", "<i class=\"icon item\" ><img style=\"width:1.5em; height:1.5em;\" src=\"" + __dirname + "/svgicon/item.svg\"></i>", out);
			} else if(stop["type"] == "recipe") {
					suggestions(recipes, lastText, "recipe", "<i class=\"icon recipe\" ><img style=\"width:1.5em; height:1.5em;\" src=\"" + __dirname + "/svgicon/recipe.svg\"></i>", out);
			} else if(stop["type"] == "slot") {
					suggestions(slots, lastText, "slot", "<i class=\"icon slot\">s</i>", out);
					sort = false;
			} else if(stop["type"] == "objective-slot") {
					suggestions(scoreboardSlots, lastText, "slot", "<i class=\"icon slot\">s</i>", out);
			} else if(stop["type"] == "objective") {
					suggestions(scoreboardObjectives, lastText, "slot", "<i class=\"icon slot\">s</i>", out);
			} else if(stop["type"] == "entity" && lastText.indexOf("[") == -1) {
				for(var sel of selectors["selector"]) if(sel.startsWith(lastText)) out.push({
					text: sel,
					type: "selector",
					iconHTML: "<i class=\"icon slot\">@</i>"
				});
			} else if(stop["type"] == "entity" && lastText.indexOf("[") != -1) {
				var testText = lastText.split(/[@][a-z][\[]/)[1];
				if(testText.split("{").length % 2 ==  testText.split("}").length % 2) {
					testText = testText.split(",");
					testText = testText[testText.length -1];
				}
				for(var sel of selectors["test"]) if(sel.startsWith(testText)) out.push({
					text: sel + "=",
					type: "selector",
					iconHTML: "<i class=\"icon slot\">s</i>"
				});
			}
			else if(stop["type"] == "coord") out.push({
				text: "~ ~ ~",
				displayText: stop["value"],
				type: "coord",
				iconHTML: "<i class=\"icon coord\">~</i>"
			});
			else if(stop["type"] == "center") out.push({
				text: "~ ~",
				displayText: stop["value"],
				type: "center",
				iconHTML: "<i class=\"icon coord\">~</i>"
			});
			else if(stop["type"] == "rotation") out.push({
				text: "0",
				displayText: stop["value"],
				type: "rotation",
				iconHTML: "<i class=\"icon rotation\">r</i>"
			});
			else if(stop["type"] == "nbt") out.push({
				snippet: "{$1}",
				displayText: stop["value"],
				type: "nbt",
				iconHTML: "<i class=\"icon nbt\">{}</i>"
			});
			else if(stop["type"] == "id") out.push({
				snippet: "${1:" + stop["value"] + "}",
				displayText: stop["value"],
				type: "id",
				iconHTML: "<i class=\"icon id\">ID</i>"
			});
			else if(stop["type"] == "string" && lastText == "") out.push({
				text: " ",
				displayText: stop["value"],
				replacementPrefix: lastText,
				type: "string",
				iconHTML: "<i class=\"icon string\">s</i>"
			});
			else if(stop["type"] == "string" && lastText != "") out.push({
				text: lastText,
				displayText: stop["value"],
				replacementPrefix: lastText,
				type: "string",
				iconHTML: "<i class=\"icon string\">s</i>"
			});
			else if(stop["type"] == "greedy") out.push({
				text: "\n",
				displayText: stop["value"],
				replacementPrefix: "",
				type: "string",
				iconHTML: "<i class=\"icon string\">s</i>"
			})
		}
		if (sort) out.sort(compareOut);
		return out;
	},

	getCommandOption: function(text) {
		var out = [];
		for(var cmd of Object.values(commands["commands"])) {
			if(cmd["name"].startsWith(text)) {
				var cmdObj = {
					text: cmd["name"],
					type: "command",
					iconHTML: "<i class=\"icon command\">/</i>",
					command: cmd
				};
				out.push(cmdObj);
			}
		}
		out.sort(compareOut);
		return out;
	}
}
