let sort = true;
let v = "test";

var commands = [];
var biomes = [];
var blocks = [];
var effects = [];
var loottables = [];
var advancements = [];
var enchantments = [];
var items = [];
var sounds = [];
var recipes = [];
var slots = [];
var structures = [];
var entities = [];
var particles = [];
var selectors = [];
var scoreboards = [];
var colors = [];
var blockTags = [];
var itemTags = [];
var entityTags = [];
var attribute = [];
var noItem = [];
var gamerules = [];
var scoreboardSlots = [];
var scoreboardObjectives = [];

function setLists(version){
	commands = require("./" + version + "/commands.json");
	biomes = require("./" + version + "/id/biome.json");
	blocks = require("./" + version + "/id/block.json");
	effects = require("./" + version + "/id/effect.json");
	loottables = require("./" + version + "/id/loottable.json");
	advancements = require("./" + version + "/id/advancement.json");
	enchantments = require("./" + version + "/id/enchantment.json");
	items = require("./" + version + "/id/item.json");
	sounds = require("./" + version + "/id/sound.json");
	recipes = require("./" + version + "/id/recipe.json");
	slots = require("./" + version + "/id/slot.json");
	structures = require("./" + version + "/id/structure.json");
	entities = require("./" + version + "/id/entity.json");
	particles = require("./" + version + "/id/particle.json");
	selectors = require("./" + version + "/id/selector.json");
	scoreboards = require("./" + version + "/id/scoreboard.json");
	colors = require("./" + version + "/id/color.json");
	blockTags = require("./" + version + "/id/block_tag.json");
	itemTags = require("./" + version + "/id/item_tag.json");
	entityTags = require("./" + version + "/id/entity_tag.json");
	attribute = require("./" + version + "/id/attribute.json");
	noItem = require("./" + version + "/id/no_item.json");
	gamerules = require("./" + version + "/id/gamerule.json");

	scoreboardSlots = scoreboards["slots"];
	scoreboardObjectives = scoreboards["objectives"];

	for(let v of blocks) {
		if(!noItem.includes(v)) {
			items.push(v);
		}
		loottables.push("minecraft:blocks/" + v.replace("minecraft:",""));
		blockTags.push(v);
	}

	for(let v of items) {
		scoreboardObjectives.push("minecraft.crafted:" + v.replace(":","."));
		scoreboardObjectives.push("minecraft.broken:" + v.replace(":","."));
		scoreboardObjectives.push("minecraft.picked_up:" + v.replace(":","."));
		scoreboardObjectives.push("minecraft.dropped:" + v.replace(":","."));
		scoreboardObjectives.push("minecraft.used:" + v.replace(":","."));

		itemTags.push(v);
	}

	for(let v of entities) {
		scoreboardObjectives.push("minecraft.killed:" + v.replace(":","."));
		scoreboardObjectives.push("minecraft.killed_by:" + v.replace(":","."));

		loottables.push("minecraft:entities/" + v.replace("minecraft:",""))

		entityTags.push(v);
	}
	for(let v of colors) {
		scoreboardObjectives.push("teamkill." + v);
		scoreboardObjectives.push("killedByTeam." + v);
	}
	for(let v of scoreboards["custom"]) {
		scoreboardObjectives.push("minecraft.custom:" + v);
	}
}

function compareOut(a, b) {

	const textA = a.displayText
	const textB = b.displayText

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

function suggestion(text, displayOutput, value, type, icon) {

	//remove everything before the last '.',':' or '/' character
	while(text.search(/\.|:|\//g) != -1) {
		text = text.replace(text.slice(0,text.search(/\.|:|\//g) + 1),"");
		displayOutput = displayOutput.replace(displayOutput.slice(0,displayOutput.search(/\.|:|\//g) + 1),"");
	}
	//add suggestion to output
	return {
		text: value,
		displayText: displayOutput,
		type: type,
		iconHTML: icon
	};
}

function suggestions(array, text, type, icon, out, negatable) {
	for(let v of array) {

	  //typed text matches with element of list
		if(v.startsWith(text)) {
			out.push(suggestion(text, v, v, type, icon));

		//typed text matches with element of list without "minecraft:"
		} else if((v.startsWith("minecraft:" + text) || v.startsWith("#minecraft:" + text))) {
			let output = v.replace("minecraft:","");
			out.push(suggestion(text, output, v, type, icon));
		}
		if(negatable) {
			v = "!" + v;

			//typed text matches with element of list
			if(v.startsWith(text)) {
				out.push(suggestion(text, v, v, type, icon));

			//typed text is negated
			} else if(text.startsWith("!")) {
				let cutText = text.replace("!","");

				//typed text matches with element of list without "minecraft:"
				if(v.startsWith("!minecraft:" + cutText) || v.startsWith("!#minecraft:" + cutText)) {
					let output = v.replace("minecraft:","");
					out.push(suggestion(cutText, output, v, type, icon));
				}
			}
		}
	}
}

//Icons: "<img style=\"width:1.5em; height:1.5em;\" src=\"" + __dirname + "/svgicon/block.svg\">"


function suggestionList(type, value, lastText, negatable) {
	out = [];
  switch (type) {
  	case "option":
  		suggestions(value, lastText, "option", "<i class=\"icon normal\">?</i>", out, negatable);
  		break;
	  case "block":
			suggestions(blocks, lastText, "block", icon("block.svg"), out, negatable);
			break;
	  case "option":
			suggestions(value, lastText, "option", "<i class=\"icon normal\">?</i>", out, negatable);
			break;
	  case "block":
			suggestions(blocks, lastText, "block", icon("block.svg"), out, negatable);
			break;
	  case "block-with-tag":
			suggestions(blockTags, lastText, "block", icon("block.svg"), out, negatable);
			break;
	  case "effect":
			suggestions(effects, lastText, "effect", icon("effect.svg"), out, negatable);
			break;
	  case "advancement":
			suggestions(advancements, lastText, "advancement", "<i class=\"icon normal\">?</i>", out, negatable);
			break;
	  case "biome":
			suggestions(biomes, lastText, "biome", icon("biome.svg"), out, negatable);
			break;
	  case "structure":
			suggestions(structures, lastText, "structure", icon("structure.svg"), out, negatable);
			break;
	  case "loottable":
			suggestions(loottables, lastText, "loottable", "<i class=\"icon normal\">?</i>", out, negatable);
			break;
	  case "sound":
			suggestions(sounds, lastText, "sound", icon("sound.svg"), out, negatable);
			break;
	  case "particle":
			suggestions(particles, lastText, "particle", icon("particle.svg"), out, negatable);
			break;
	  case "enchantment":
			suggestions(enchantments, lastText, "enchantment", icon("enchantment.svg"), out, negatable);
			break;
	  case "entity-id":
			suggestions(entities, lastText, "entity-id", "<i class=\"icon normal\">?</i>", out, negatable);
			break;
	  case "entity-with-tag":
			suggestions(entityTags, lastText, "entity-id", "<i class=\"icon normal\">?</i>", out, negatable);
			break;
	  case "item":
			suggestions(items, lastText, "item", icon("item.svg"), out, negatable);
			break;
	  case "item-with-tag":
			suggestions(itemTags, lastText, "item", icon("item.svg"), out, negatable);
			break;
	  case "recipe":
			suggestions(recipes, lastText, "recipe", icon("recipe.svg"), out, negatable);
			break;
	  case "color":
			suggestions(colors, lastText, "color", icon("color.svg"), out, negatable);
			break;
	  case "attribute":
			suggestions(attribute, lastText, "attribute-id", icon("attribute.svg"), out, negatable);
			break;
	  case "gamerule":
			suggestions(gamerules, lastText, "gamerule", "<i class=\"icon normal\">?</i>", out, negatable);
			break;
	  case "slot":
			suggestions(slots, lastText, "slot", icon("slot.svg"), out, negatable);
			sort = false;
			break;
	  case "objective-slot":
			suggestions(scoreboardSlots, lastText, "objective-slot", "<i class=\"icon normal\">s</i>", out, negatable);
			break;
	  case "objective":
			suggestions(scoreboardObjectives, lastText, "objective", "<i class=\"icon normal\">s</i>", out, negatable);
			break;
	  case "entity":

	    //selector: @a[parameter, parameter, ...]; parameter: argument=value

	    //selector without parameters
			if(lastText.search(/[@][a-z][\[]/) == -1) {
				suggestions(selectors["selector"], lastText, "entity-selector", "<i class=\"icon normal\">@</i>", out, negatable);

			//selector with parameters
			} else {

			  //get everything behind the first square bracket
				let testText = lastText.split(/[@][a-z][\[]/)[1];

				//test if amount of '{' equals amount of '}'
				if(testText.split("{").length % 2 == testText.split("}").length % 2) {

				  //get current paramater
					testText = testText.split(",");
					testText = testText[testText.length -1];

          //current parameter is an argument
					if(testText.indexOf("=") == -1) {
						let sel = [];
						for (let v of selectors["test"]) {
							sel.push(v["name"]);
						}
						suggestions(sel, testText, "selector-test", "<i class=\"icon normal\">?</i>", out, negatable);

					//current parameter is a value
					} else {
						let selType = testText.split("=")[0];
						let selText = testText.split("=")[1];

						for (let v of selectors["test"]) {
							if(v["name"] == selType) {
								out = suggestionList(v["type"], v["value"], selText,  v["negatable"]);
							}
						}
					}
				}
			}
			break;
		case "coord":
			if(typeof value == "string") {
				out.push({
					text: "~ ~ ~",
					displayText: value,
					type: "coord",
					iconHTML: icon("coords.svg")
				});
			} else {
				out.push({
					text: "~ ~ ~",
					displayText: value["value"],
					type: "coord",
					iconHTML: icon("coords.svg")
				});
				suggestions(value["stop"], lastText, "coord", "<i class=\"icon normal\">?</i>", out, negatable);
			}
			sort = false;
			break;
	  case "2-coord":
		if(typeof value == "string") {
			out.push({
				text: "~ ~",
				displayText: value,
				type: "coord",
				iconHTML: "<i class=\"icon normal\">~</i>"
			});
		} else {
			out.push({
				text: "~ ~",
				displayText: value["value"],
				type: "coord",
				iconHTML: "<i class=\"icon normal\">~</i>"
			});
			suggestions(value["stop"], lastText, "coord", "<i class=\"icon normal\">?</i>", out, negatable);
		}
			sort = false;
			break;
	  case "nbt":
			out.push({
				snippet: "{$1}",
				displayText: value,
				type: "nbt",
				iconHTML: "<i class=\"icon normal\">{}</i>"
			});
			break;
	  case "id":
			out.push({
				snippet: "${1:" + value + "}",
				displayText: value,
				type: "id",
				iconHTML: "<i class=\"icon normal\">ID</i>"
			});
			break;
	  case "string":
			if(lastText == "") {
				out.push({
					text: " ",
					displayText: value,
					replacementPrefix: lastText,
					type: "string",
					iconHTML: "<i class=\"icon normal\">?</i>"
				});
				excludeOtherSuggestion = false;
			} else {
				out.push({
					text: lastText,
					displayText: value,
					replacementPrefix: lastText,
					type: "string",
					iconHTML: "<i class=\"icon normal\">?</i>"
				});
			}
			break;
	  case "greedy":
			out.push({
				text: "\n",
				displayText: value,
				replacementPrefix: "",
				type: "string",
				iconHTML: "<i class=\"icon normal\">?</i>"
			});
			break;
	}
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
		let text = editor.getTextInBufferRange([[bufferPosition.row, 0], bufferPosition]);
		let matches = text.match(/^\w+/g);
		if(matches == null) return null;
		let cmd = matches[0];
		return cmd;
	},

	getCommandStop: function (text, command) {

		if(command == null) return null;

		//replace all non arg seperating spaces with an _

		let block = [];

		let aux = "";
		for(let c of text) {
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

		let args = aux.split(" ").slice(1, -1);
		if(command["alias"] != null) return this.runCycle(args, commands["commands"][command["alias"]]["cycleMarkers"])["cycle"]
		let cycle = command["cycleMarkers"];
		return this.runCycle(args, cycle);
	},

	//args: array of all command arguments without the command itself | Example: ["@s","add","ownTag"]
	runCycle: function(args, cycle) {

		let i = 0;
		let c = 0;

		//cycles through the arguments
		for(; i < args.length; ) {
			let arg = args[i];
			let stop = cycle[c];

			let realStop = stop;
			if(realStop["noStop"]) {
				realStop["noStop"] = null;
			}
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
			if ((realStop["type"] == "option" || realStop["type"] == "particle" || realStop["type"] == "gamerule" || realStop["type"] == "2-coord" || realStop["type"] == "coord") && realStop["change"] != null && realStop["change"][arg] != null) {
				let cycleRun = this.runCycle(args.slice(i + 1), realStop["change"][arg]);
				i += cycleRun["argPos"] + 1;
				c += 1;
				if(cycleRun["cycle"] != null) return {
					pos: c,
					argPos: i,
					noStop : cycleRun["noStop"],
					cycle: cycleRun["cycle"]
				}
			} else if(realStop["type"] == "coord" && i < args.length && (realStop["stop"] == null || !realStop["stop"].includes(arg))) {
				//skips two arguments
				i += 3;
				c += 1;

				//output if it isn't the first argument
				if(args.length < i) {
					return {
						pos: c,
						argPos: i,
						noStop: true,
						cycle: realStop
					};
				}
			} else if(realStop["type"] == "2-coord" && i < args.length && (realStop["stop"] == null || !realStop["stop"].includes(arg))) {
				//skips one argument
				i += 2;
				c += 1;

				//output if it isn't the first argument
				if(args.length < i) {
					return {
						pos: c,
						argPos: i,
						noStop: true,
						cycle: realStop
					};
				}
			} else if (realStop["type"] == "end") {
				return {
					pos: c,
					argPos: i,
					cycle: cycle[c]
				}
			} else if(realStop["type"] == "command") {
				let cmd = args[i];
				let newCycle = this.getCommandStop(args.slice(i).join(" ") + " !", commands["commands"][cmd])
				return {
					pos: cycle.length + 1,
					argPos: args.length + 1,
					noStop: newCycle["noStop"],
					cycle: newCycle["cycle"]
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
			let stop = cycle[c];

			let realStop = stop;
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
		if(!(v == atom.config.get("mcfunction-novum.mcversion"))) {
			setLists(atom.config.get("mcfunction-novum.mcversion"));
			v = atom.config.get("mcfunction-novum.mcversion");
		}
		let bufferPos = args.bufferPosition;
		let editor = args.editor;
		let current = this.getCurrentCommand(editor, bufferPos);
		let out = [];
		let lineText = editor.getTextInBufferRange([[bufferPos.row, 0], bufferPos]);
		if(! lineText.includes(" ")) {
			out = this.getCommandOption(lineText);
		} else if(current != null) {

			let splitText = lineText.split("");
			let currentText = "";
			let splitedText = [];

			let inQuote = false;
			let backslash = false;

			for(let char of splitText) {
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

			let lastText = splitedText[splitedText.length - 1];

			if(commands["commands"][current] == null) return null;
			let stop = this.getCommandStop(lineText, commands["commands"][current]);
			let cycle = stop["cycle"];
			if(cycle == null) return [];

			if(cycle["type"] == "command") {
				out = this.getCommandOption(lastText);
			} else if(cycle["stop"] != null && !stop["noStop"]) {
				out = suggestionList(cycle["type"], cycle, lastText, false);
			} else {
				out = suggestionList(cycle["type"], cycle["value"], lastText, false);
			}
			curText = lastText;
		}
		return out;
	},

	getCommandOption: function(text) {
		let out = [];
		for(let cmd of Object.values(commands["commands"])) {
			if(cmd["name"].startsWith(text)) {
				let cmdObj = {
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
		let types = ["attribute-id","block","effect","advancement","loottable","particle","sound","enchantment","entity-id","entity-selector","item","recipe","slot","objective-slot","objective","biome"];

		if(types.includes(args.suggestion.type)) {
			let editor = args.editor;
			let bufferPos = editor.getCursorBufferPosition();
			let row = bufferPos.row;
			let pos = bufferPos.column;
			let nextChar = editor.getTextInBufferRange([[row, pos - 1], [row, pos]]);

			while(nextChar != " " && nextChar != "=" && pos > 0) {
				pos--;
				nextChar = editor.getTextInBufferRange([[row, pos - 1], [row, pos]])
				editor.backspace();
			}
			editor.insertText(args.suggestion.text);
		}
	}
}
