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
const blockTags = require("./id/block_tag.json");
const itemTags = require("./id/item_tag.json");
const entityTags = require("./id/entity_tag.json");
const attribute = require("./id/attribute.json");

const scoreboardSlots = scoreboards["slots"];
const scoreboardObjectives = scoreboards["objectives"];

for(var v of blocks) {
	items.push(v);
	loottables.push("minecraft:blocks/" + v.replace("minecraft:",""));
	blockTags.push(v);
}

for(var v of items) {
	scoreboardObjectives.push("minecraft.crafted:" + v.replace(":","."));
	scoreboardObjectives.push("minecraft.broken:" + v.replace(":","."));
	scoreboardObjectives.push("minecraft.picked_up:" + v.replace(":","."));
	scoreboardObjectives.push("minecraft.dropped:" + v.replace(":","."));
	scoreboardObjectives.push("minecraft.used:" + v.replace(":","."));

	itemTags.push(v);
}

for(var v of entities) {
	scoreboardObjectives.push("minecraft.killed:" + v.replace(":","."));
	scoreboardObjectives.push("minecraft.killed_by:" + v.replace(":","."));

	loottables.push("minecraft:entities/" + v.replace("minecraft:",""))

	entityTags.push(v);
}
for(var v of colors) {
	scoreboardObjectives.push("teamkill." + v);
	scoreboardObjectives.push("killedByTeam." + v);
}
for(var v of scoreboards["custom"]) {
	scoreboardObjectives.push("minecraft.custom:" + v);
}


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

function icon(name) {
	return "<div class=\"icon img-background\", style=\"width:2em; height:2em;\"><img style=\"width:1.5em; height:1.5em;\", src=\"" + __dirname + "/svgicon/" + name + "\"></div>";
}

function suggestions(array, text, type, icon, out, negatable) {
	for(var v of array) {
		if(v.startsWith(text)) {
			var cutText = text;
			var output = v;
			while(cutText.search(/\.|:|\//g) != -1) {
				cutText = cutText.replace(cutText.slice(0,cutText.search(/\.|:|\//g) + 1),"");
				output = output.replace(output.slice(0,output.search(/\.|:|\//g) + 1),"");
			}
			out.push({
				text: v,
				displayText: output,
				type: type,
				iconHTML: icon
			});
		} else if((!text.startsWith("minecraft:") && !text.startsWith("#minecraft:")) && (v.startsWith("minecraft:" + text) || v.startsWith("#minecraft:" + text))) {
			var cutText = text;
			var output = v.replace("minecraft:","");
			while(cutText.search(/\.|:|\//g) != -1) {
				cutText = cutText.replace(cutText.slice(0,cutText.search(/\.|:|\//g) + 1),"");
				output = output.replace(output.slice(0,output.search(/\.|:|\//g) + 1),"");
			}
			out.push({
				text: v,
				displayText: output,
				type: type,
				iconHTML: icon
			});
		}
	}
	if(negatable) {
		for(var v of array) {
			var output = "!" + v;
			if(output.startsWith(text)) {
				var cutText = text;
				while(cutText.search(/\.|:|\//g) != -1) {
					cutText = cutText.replace(cutText.slice(0,cutText.search(/\.|:|\//g) + 1),"");
					output = output.replace(output.slice(0,output.search(/\.|:|\//g) + 1),"");
				}
				out.push({
					text: "!" + v,
					displayText: output,
					type: type,
					iconHTML: icon
				});
			} else if((!text.startsWith("!minecraft:") && !text.startsWith("!#minecraft:")) && (output.startsWith("!minecraft:" + text) || output.startsWith("!#minecraft:" + text))) {
				var cutText = text;
				output = v.replace("minecraft:","");
				while(cutText.search(/\.|:|\//g) != -1) {
					cutText = cutText.replace(cutText.slice(0,cutText.search(/\.|:|\//g) + 1),"");
					output = output.replace(output.slice(0,output.search(/\.|:|\//g) + 1),"");
				}
				out.push({
					text: "!" + v,
					displayText: "!" + output,
					type: type,
					iconHTML: icon
				});
			}
		}
	}
}

//Icons: "<img style=\"width:1.5em; height:1.5em;\" src=\"" + __dirname + "/svgicon/block.svg\">"


function suggestionList(type, value, lastText, negatable) {
	out = [];
	if (type == "option") {
		suggestions(value, lastText, "option", "<i class=\"icon normal\">?</i>", out, negatable);
	} else if(type == "block") {
			suggestions(blocks, lastText, "block", icon("block.svg"), out, negatable);
	} else if(type == "block-with-tag") {
			suggestions(blockTags, lastText, "block", icon("block.svg"), out, negatable);
	} else if(type == "effect") {
			suggestions(effects, lastText, "effect", icon("effect.svg"), out, negatable);
	} else if(type == "advancement") {
			suggestions(advancements, lastText, "advancement", "<i class=\"icon normal\">a</i>", out, negatable);
	} else if(type == "biome") {
			suggestions(biomes, lastText, "biome", icon("biome.svg"), out, negatable);
	} else if(type == "structure") {
			suggestions(structures, lastText, "structure", icon("structure.svg"), out, negatable);
	} else if(type == "loottable") {
			suggestions(loottables, lastText, "loottable", "<i class=\"icon normal\">l</i>", out, negatable);
	} else if(type == "sound") {
			suggestions(sounds, lastText, "sound", icon("sound.svg"), out, negatable);
	} else if(type == "particle") {
			suggestions(particles, lastText, "particle", icon("particle.svg"), out, negatable);
	} else if(type == "enchantment") {
			suggestions(enchantments, lastText, "enchantment", icon("enchantment.svg"), out, negatable);
	} else if(type == "entity-id") {
			suggestions(entities, lastText, "entity-id", icon("entity.svg"), out, negatable);
	} else if(type == "entity-with-tag") {
			suggestions(entityTags, lastText, "entity-id", icon("entity.svg"), out, negatable);
	} else if(type == "item") {
			suggestions(items, lastText, "item", icon("item.svg"), out, negatable);
	} else if(type == "item-with-tag") {
			suggestions(itemTags, lastText, "item", icon("item.svg"), out, negatable);
	} else if(type == "recipe") {
			suggestions(recipes, lastText, "recipe", icon("recipe.svg"), out, negatable);
	} else if(type == "color") {
			suggestions(colors, lastText, "color", icon("color.svg"), out, negatable);
	}	else if(type == "attribute") {
			suggestions(attribute, lastText, "attribute-id", icon("attribute.svg"), out, negatable);
	} else if(type == "slot") {
			suggestions(slots, lastText, "slot", icon("slot.svg"), out, negatable);
			sort = false;
	} else if(type == "objective-slot") {
			suggestions(scoreboardSlots, lastText, "objective-slot", "<i class=\"icon normal\">s</i>", out, negatable);
	} else if(type == "objective") {
			suggestions(scoreboardObjectives, lastText, "objective", "<i class=\"icon normal\">s</i>", out, negatable);
	} else if(type == "entity" && lastText.indexOf("[") == -1) {
			suggestions(selectors["selector"], lastText, "entity-selector", "<i class=\"icon normal\">@</i>", out, negatable);
	} else if(type == "entity" && lastText.search(/[@][a-z][\[]/) != -1) {
			var testText = lastText.split(/[@][a-z][\[]/)[1];
			if(testText.split("{").length % 2 == testText.split("}").length % 2) {
				testText = testText.split(",");
				testText = testText[testText.length -1];

				if(testText.indexOf("=") == -1) {
					var sel = [];
					for (var v of selectors["test"]) {
						sel.push(v["name"]);
					}
					suggestions(sel, testText, "selector-test", "<i class=\"icon normal\">?</i>", out, negatable);
				} else {
					var selType = testText.split("=")[0];
					var selText = testText.split("=")[1];
					var sel = []

					for (var v of selectors["test"]) {
						if(v["name"] == selType) {
							out = suggestionList(v["type"], v["value"], selText,  v["negatable"]);
						}
					}
				}
			}
	}
	else if(type == "coord") out.push({
		text: "~ ~ ~",
		displayText: value,
		type: "coord",
		iconHTML: icon("coords.svg")
	});
	else if(type == "center") out.push({
		text: "~ ~",
		displayText: value,
		type: "center",
		iconHTML: "<i class=\"icon normal\">~</i>"
	});
	else if(type == "rotation") out.push({
		text: "0",
		displayText: value,
		type: "rotation",
		iconHTML: "<i class=\"icon normal\">r</i>"
	});
	else if(type == "nbt") out.push({
		snippet: "{$1}",
		displayText: value,
		type: "nbt",
		iconHTML: "<i class=\"icon normal\">{}</i>"
	});
	else if(type == "id") out.push({
		snippet: "${1:" + value + "}",
		displayText: value,
		type: "id",
		iconHTML: "<i class=\"icon normal\">ID</i>"
	});
	else if(type == "string" && lastText == "") {
		out.push({
		text: " ",
		displayText: value,
		replacementPrefix: lastText,
		type: "string",
		iconHTML: "<i class=\"icon normal\">s</i>"
		});
		excludeOtherSuggestion = false;
	}
	else if(type == "string" && lastText != "") out.push({
		text: lastText,
		displayText: value,
		replacementPrefix: lastText,
		type: "string",
		iconHTML: "<i class=\"icon normal\">s</i>"
	});
	else if(type == "greedy") out.push({
		text: "\n",
		displayText: value,
		replacementPrefix: "",
		type: "string",
		iconHTML: "<i class=\"icon normal\">s</i>"
	})
	if (sort) out.sort(compareOut);
	sort = true;
	return out;
}

module.exports = {

	selector: ".source.mcfunction",
	disableForSelector: ".source.mcfunction .comment",

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
		  else {
				out = suggestionList(stop["type"], stop["value"], lastText, false);
			}
		}
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
	},

	onDidInsertSuggestion: function(args) {
		var types = ["attribute-id","block","effect","advancement","loottable","particle","sound","enchantment","entity-id","item","recipe","slot","objective-slot","objective","biome"];

		if(types.includes(args.suggestion.type)) {
			var editor = args.editor;
			var bufferPos = editor.getCursorBufferPosition();
			var row = bufferPos.row;
			var pos = bufferPos.column;
			var nextChar = editor.getTextInBufferRange([[row, pos - 1], [row, pos]]);

			while(nextChar != " " && nextChar != "=" && pos > 0) {
				pos--;
				nextChar = editor.getTextInBufferRange([[row, pos - 1], [row, pos]])
				editor.backspace();
			}
			editor.insertText(args.suggestion.text);
		}
	}
}
