const versions = ["snapshot","1.16"];

const fs = require('fs');
const path = require('path');

let commands,
biomes,
blocks,
effects,
loottables,
advancements,
enchantments,
items,
sounds,
recipes,
slots,
structures,
entities,
particles,
selectors,
scoreboards,
colors,
blockTags,
itemTags,
entityTags,
attribute,
noItem,
gamerules,
scoreboardSlots,
scoreboardObjectives,
lootItems,
functions = [];

/**
 * Fills arrays with elements of the wanted minecraft version
 *
 * @param {String} version - minecraft version
 */
function setLists(version) {
	commands = require("./" + version + "/commands.json");

	biomes = setArrayList("biome.json", version);
	blocks = setArrayList("block.json", version);
	effects = setArrayList("effect.json", version);
	loottables = setArrayList("loottable.json", version);
	advancements = setArrayList("advancement.json", version);
	enchantments = setArrayList("enchantment.json", version);
	items = setArrayList("item.json", version);
	lootItems = setArrayList("item.json", version);
	sounds = setArrayList("sound.json", version);
	recipes = setArrayList("recipe.json", version);
	slots = setArrayList("slot.json", version);
	structures = setArrayList("structure.json", version);
	entities = setArrayList("entity.json", version);
	particles = setArrayList("particle.json", version);
	colors = setArrayList("color.json", version);
	blockTags = setArrayList("block_tag.json", version);
	itemTags = setArrayList("item_tag.json", version);
	entityTags = setArrayList("entity_tag.json", version);
	attribute = setArrayList("attribute.json", version);
	noItem = setArrayList("no_item.json", version);
	gamerules = setArrayList("gamerule.json", version);
	functions = setArrayList("function.json", version);

	selectors = setObjectList("selector.json", version);
	scoreboards = setObjectList("scoreboard.json", version);

	scoreboardSlots = scoreboards["slots"];
	scoreboardObjectives = scoreboards["objectives"];

	for (let v of blocks) {
		if (!noItem.includes(v)) {
			items.push(v);
		}
		loottables.push("minecraft:blocks/" + v.replace("minecraft:", ""));
		blockTags.push(v);
	}

	for (let v of items) {
		scoreboardObjectives.push("minecraft.crafted:" + v.replace(":", "."));
		scoreboardObjectives.push("minecraft.broken:" + v.replace(":", "."));
		scoreboardObjectives.push("minecraft.picked_up:" + v.replace(":", "."));
		scoreboardObjectives.push("minecraft.dropped:" + v.replace(":", "."));
		scoreboardObjectives.push("minecraft.used:" + v.replace(":", "."));

		itemTags.push(v);
	}

	for (let v of entities) {
		scoreboardObjectives.push("minecraft.killed:" + v.replace(":", "."));
		scoreboardObjectives.push("minecraft.killed_by:" + v.replace(":", "."));

		loottables.push("minecraft:entities/" + v.replace("minecraft:", ""));

		entityTags.push(v);
	}
	for (let v of colors) {
		scoreboardObjectives.push("teamkill." + v);
		scoreboardObjectives.push("killedByTeam." + v);
	}
	for (let v of scoreboards["custom"]) {
		scoreboardObjectives.push("minecraft.custom:" + v);
	}

	lootItems.push("mainhand");
	lootItems.push("offhand");
}

/**
 * Creates a list for a given minecraft version and returns it
 *
 * @param {String} jsonName - name of the JSON file
 * @param {String} version - name of the minecraft version
 *
 * @return {String[]} list for the given minecraft version
 */
function setArrayList(jsonName, version) {
	let list = require("./1.16/id/" + jsonName).slice();
	let i = versions.indexOf(version);
	while((i + 1) < versions.length) {

		let cList;

		try {
			cList = require("./" + versions[i] + "/id/" + jsonName);
		} catch (error) {
			i++;
			continue;
		}

		changeList(list, cList);
		i++;
	}
	return list;
}

/**
 * Creates an Object and edits its list(s) for the given minecraft version
 *
 * @param {String} jsonName - name of the JSON file
 * @param {String} version - name of the minecraft version
 *
 * @return {Object} object with list(s) for the given minecraft version
 */
function setObjectList(jsonName, version) {
	let object = JSON.parse(JSON.stringify(require("./1.16/id/" + jsonName)));

	for (const key in object) {
		if (object.hasOwnProperty(key)) {
			const element = object[key];

			if(Array.isArray(element)) {
				let list = element;
				let i = versions.indexOf(version);

				while ((i + 1) < versions.length) {

					let cList;

					try {
						cList = require("./" + versions[i] + "/id/" + jsonName)[key];
					} catch (error) {
						i++;
						continue;
					}

					changeList(list, cList);
					i++;
				}
			}
		}
	}
	return object;
}

/**
 * Changes a list with the given changes
 *
 * @param {(String|Object)[]} list - list to change
 * @param {(String|Object)[]} cList - list with changes
 */
function changeList(list, cList) {
	for (const elem of cList) {
		if(typeof elem == "object") {
			switch (elem["type"]) {
				case "add":
					list.push(elem["value"]);
					break;
				case "remove":
					list.splice(list.indexOf(elem["value"]), 1);
					break;
				case "change":
					list[list.indexOf(elem["value"])] = elem["new"];
					break;
			}
		} else {
			let parameters = elem.split(" ");
			switch (parameters[0]) {
				case "+":
					list.push(parameters[1]);
					break;
				case "-":
					list.splice(list.indexOf(parameters[1]), 1);
					break;
				case "~":
					list[list.indexOf(parameters[1])] = parameters[2];
					break;
			}
		}
	}
}

/**
 * Comparator for suggestion objects
 *
 * @param {Object} o1 - suggestion object
 * @param {Object} o2 - suggestion object
 *
 * @return {number}
 */
function compareOut(o1, o2) {

	const textA = o1.displayText
	const textB = o2.displayText

	let comparison = 0;
	if (textA > textB) {
		comparison = 1;
	} else if (textA < textB) {
		comparison = -1;
	}
	return comparison;
}

/**
 *
 * Get the datapack path from the file currently worked in
 *
 * @return {string} path to datapack
 *
 */
function getDatapackPath() {
	let pathSplitted = atom.workspace.getActiveTextEditor().buffer.file.path.split(/[\\\/]/g);
	pathSplitted.pop();

	let isInDatapack = false;

	for (let i = pathSplitted.length - 1; i >= 0; i--) {
		if(fs.readdirSync(pathSplitted.join("/")).includes("pack.mcmeta")) {
			isInDatapack = true;
			break;
		}
		pathSplitted.pop();
	}

	return isInDatapack ? pathSplitted.join("/") + "/data" : null;
}

/**
 *
 * Get custom entries of tags, functions, etc. of the datapack
 *
 * @return {string[]} array with custom entries
 *
 */
function getCustomEntries(tagPath, extension, prefix = "") {
	let files = [];
	let datapackPath = getDatapackPath();

	if(datapackPath == null) {
		return files;
	}

	let crawler = function rec(directory, namespace) {
		if(!fs.existsSync(directory)) {
			return;
		}
		fs.readdirSync(directory).forEach(file => {
			const absolute = directory + "/" + file;

			if (fs.statSync(absolute).isDirectory()) {
				rec(absolute, namespace);
			} else if(absolute.endsWith(extension)){
				files.push(prefix + namespace + ":" + absolute.replace(datapackPath + "/" + namespace + tagPath + "/", "").replace("." + extension, ""));
			}
		});
	}

	for (const namespace of fs.readdirSync(datapackPath)) {
		if(namespace == "minecraft") continue;
		crawler(datapackPath + "/" + namespace + tagPath, namespace);
	}

	return files;
}

/**
 * Gets icon as html element
 *
 * @param {String} name - name of the svg-file
 * @return {String} html element
 */
function icon(name) {
	if (atom.config.get("mcfunction-novum.autocomplete.showIcons")) {
		let svg = fs.readFileSync(path.resolve(__dirname + "/svgicon/", name), 'utf8');
		let subClassName = "";

		if (name == "command.svg") {
			subClassName += " command"
		}
		svg = svg.replace("width=\"400\"", "width=\"1.5em\"");
		svg = svg.replace("height=\"400\"", "height=\"1.5em\"");
		svg = svg.replace("<svg", "<svg class=\"icon-svg " + subClassName +"\"");
		return "<div class=\"icon-wrapper " + subClassName + "\">" + svg + "</div>";
	} else {
		let iconClass = "normal";
		switch (name) {
			case "command.svg":
				name = "/";
				iconClass = "command";
				break;
			case "option.svg":
				name = "?";
				break;
			case "nbt.svg":
				name = "{}";
				break;
			case "coords.svg":
				name = "~";
				break;
			case "selector.svg":
				name = "@";
				break;
			default:
				name = name.charAt(0).toUpperCase();
				break;
		}
		return "<i class=\"icon " + iconClass + "\">" + name + "</i>"
	}
}

/**
 * Removes unwanted parts of the suggestion and gets the suggestion object
 *
 * @param {String} text - user typed text
 * @param {String} value - suggestion to output
 * @param {String} type - type of suggested element
 * @param {String} icon - icon as html element
 *
 * @return {Object} suggestion object
 */
function suggestion(text, value, type, icon) {

	let displayOutput = value

	while(!displayOutput.startsWith(text)) {
		displayOutput = displayOutput.replace(displayOutput.slice(0, displayOutput.search(/\.|:|\//g) + 1), "");
	}
	//remove everything before the last '.',':' or '/' character
	while (text.search(/\.|:|\//g) != -1) {
		text = text.replace(text.slice(0, text.search(/\.|:|\//g) + 1), "");
		displayOutput = displayOutput.replace(displayOutput.slice(0, displayOutput.search(/\.|:|\//g) + 1), "");
	}
	//add suggestion to output
	return {
		text: value,
		displayText: displayOutput,
		type: type,
		iconHTML: icon
	};
}

/**
 * Fills array with matching suggestion objects
 *
 * @param {String[]} array - array of possible suggestions
 * @param {String} text - user typed text
 * @param {String} type - type of possible suggestions
 * @param {String} icon - icon as html element
 * @param {Object[]} out - array to fill with suggestion objects
 * @param {Boolean} negatable - determines if negated suggestions are generated
 */
function suggestions(array, text, type, icon, out, negatable) {
	for (let v of array) {

		//typed text matches with element of list
		if (v.startsWith(text)) {
			out.push(suggestion(text, v, type, icon));

		//typed text matches with element of list without "minecraft:"
		} else {
			let cutText = text;

			if (v.startsWith("minecraft:" + text)) {
				out.push(suggestion(text, v, type, icon));
			}

			cutText = cutText.replace("#","");

			if (v.startsWith("#minecraft:" + cutText)) {
				sug = suggestion(cutText, v, type, icon);
				sug["displayText"] = "#" + sug["displayText"];
				out.push(sug);
			}
		}
		if (negatable) {
			v = "!" + v;

			//typed text matches with element of list
			if (v.startsWith(text)) {
				out.push(suggestion(text, v, type, icon));

			//typed text is negated
			} else if (text.startsWith("!")) {
				let cutText = text.replace("!", "");

				//typed text matches with element of list without "minecraft:"
				if (v.startsWith("!minecraft:" + cutText) || v.startsWith("!#minecraft:" + cutText)) {
					sug = suggestion(cutText, v, type, icon);
					sug["displayText"] = "!" + sug["displayText"];
					out.push(sug);
				}

				cutText = cutText.replace("#","");

				if (v.startsWith("!#minecraft:" + cutText)) {
					sug = suggestion(cutText, v, type, icon);
					sug["displayText"] = "!#" + sug["displayText"];
					out.push(sug);
				}
			}
		}
	}
}

//Icons: "<img style=\"width:1.5em; height:1.5em;\" src=\"" + __dirname + "/svgicon/block.svg\">"

/**
 * Fills and returns array with suggestion objects and sorts them
 *
 * @param {String} type - type of suggestions
 * @param {String[]} value - array of possible suggestions for specific types
 * @param {String} lastText - user typed text
 * @param {Boolean} negatable - determines if negated suggestions are generated
 *
 * @return {Object[]} array with all matching suggestion objects
 */
function suggestionList(type, value, lastText, negatable) {
	let sort = true;
	let out = [];

	switch (type) {
		case "option":
			suggestions(value, lastText, "option", icon("option.svg"), out, negatable);
			break;
		case "block":
			suggestions(blocks, lastText, "block", icon("block.svg"), out, negatable);
			break;
		case "block-with-tag":
			let blockTag = blockTags.concat(getCustomEntries("/tags/blocks", "json", "#"));
			suggestions(blockTag, lastText, "block", icon("block.svg"), out, negatable);
			break;
		case "effect":
			suggestions(effects, lastText, "effect", icon("effect.svg"), out, negatable);
			break;
		case "advancement":
			let advancement = advancements.concat(getCustomEntries("/advancements","json"));
			suggestions(advancement, lastText, "advancement", icon("option.svg"), out, negatable);
			break;
		case "biome":
			suggestions(biomes, lastText, "biome", icon("biome.svg"), out, negatable);
			break;
		case "structure":
			suggestions(structures, lastText, "structure", icon("structure.svg"), out, negatable);
			break;
		case "loottable":
			let loottable = loottables.concat(getCustomEntries("/loot_tables","json"));
			suggestions(loottable, lastText, "loottable", icon("loottable.svg"), out, negatable);
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
			suggestions(entities, lastText, "entity-id", icon("entity.svg"), out, negatable);
			break;
		case "entity-with-tag":
			let entityTag = entityTags.concat(getCustomEntries("/tags/entity_types", "json", "#"));
			suggestions(entityTag, lastText, "entity-id", icon("entity.svg"), out, negatable);
			break;
		case "item":
			suggestions(items, lastText, "item", icon("item.svg"), out, negatable);
			break;
		case "item-with-hands":
			suggestions(lootItems, lastText, "item", icon("item.svg"), out, negatable);
			break;
		case "item-with-tag":
			let itemTag = itemTags.concat(getCustomEntries("/tags/items", "json", "#"));
			suggestions(itemTag, lastText, "item", icon("item.svg"), out, negatable);
			break;
		case "recipe":
			let recipe = recipes.concat(getCustomEntries("/recipes","json"));
			suggestions(recipe, lastText, "recipe", icon("recipe.svg"), out, negatable);
			break;
		case "color":
			suggestions(colors, lastText, "color", icon("color.svg"), out, negatable);
			break;
		case "attribute":
			suggestions(attribute, lastText, "attribute-id", icon("attribute.svg"), out, negatable);
			break;
		case "gamerule":
			suggestions(gamerules, lastText, "gamerule", icon("option.svg"), out, negatable);
			break;
		case "slot":
			suggestions(slots, lastText, "slot", icon("slot.svg"), out, negatable);
			sort = false;
			break;
		case "objective-slot":
			suggestions(scoreboardSlots, lastText, "objective-slot", icon("option.svg"), out, negatable);
			break;
		case "objective":
			suggestions(scoreboardObjectives, lastText, "objective", icon("option.svg"), out, negatable);
			break;
		case "function":
			let mcfunction = functions.concat(getCustomEntries("/functions", "mcfunction")).concat(getCustomEntries("/tags/functions", "json","#"));
			suggestions(mcfunction, lastText, "mcfunction", icon("option.svg"), out, negatable);
			break;
		case "predicate":
			suggestions(getCustomEntries("/predicates","json"), lastText, "objective", icon("option.svg"), out, negatable);
			break;
		case "entity":

			//selector: @a[parameter, parameter, ...]; parameter: argument=value

			//selector without parameters
			if (lastText.search(/[@][a-z][\[]/) == -1) {
				suggestions(selectors["selector"], lastText, "entity-selector", icon("selector.svg"), out, negatable);

				//selector with parameters
			} else {

				//get everything behind the first square bracket
				let testText = lastText.split(/[@][a-z][\[]/)[1];

				//test if not in brackets or strings
				let block = [];
				for (let c of testText) {
					if (block[block.length-1] == "\\") { // When escaped cancel
						block.pop();
					} else if (c == "\\") { // Escape next char
						block.push("\\");
					} else if (block[block.length-1] == "\"" && c != "\"") { // When in String and String does not end cancel
					} else if (c == "{") {
						block.push("}");
					} else if (c == "[") {
						block.push("]");
					} else if (block[block.length-1] != "\"" && c == "\"") { // When not in String and c is '"'
						block.push("\"");
					} else if (c == block[block.length - 1]) {
						block.pop();
					}
				}
				if (block.length == 0) {

					//get current paramater
					testText = testText.split(",");
					testText = testText[testText.length - 1];

					//current parameter is an argument
					if (testText.indexOf("=") == -1) {
						let sel = [];
						for (let v of selectors["test"]) {
							sel.push(v["name"]);
						}
						suggestions(sel, testText, "selector-test", icon("option.svg"), out, negatable);

						//current parameter is a value
					} else {
						let selType = testText.split("=")[0];
						let selText = testText.split("=")[1];

						for (let v of selectors["test"]) {
							if (v["name"] == selType) {
								out = suggestionList(v["type"], v["value"], selText, v["negatable"]);
							}
						}
					}
				}
			}
			break;
		case "coord":
			if (typeof value == "string") {
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
				suggestions(value["stop"], lastText, "coord", icon("option.svg"), out, negatable);
			}
			sort = false;
			break;
		case "2-coord":
			if (typeof value == "string") {
				out.push({
					text: "~ ~",
					displayText: value,
					type: "coord",
					iconHTML: icon("coords.svg")
				});
			} else {
				out.push({
					text: "~ ~",
					displayText: value["value"],
					type: "coord",
					iconHTML: icon("coords.svg")
				});
				suggestions(value["stop"], lastText, "coord", icon("option.svg"), out, negatable);
			}
			sort = false;
			break;
		case "3-number":
			if (typeof value == "string") {
				out.push({
					text: "0 0 0",
					displayText: value,
					type: "3-number",
					iconHTML: icon("option.svg")
				});
			} else {
				out.push({
					text: "0 0 0",
					displayText: value["value"],
					type: "3-number",
					iconHTML: icon(value["icon"])
				});
			}
			sort = false;
			break;
		case "nbt":
			out.push({
				snippet: "{$1}",
				displayText: value,
				type: "nbt",
				iconHTML: icon("nbt.svg")
			});
			break;
		case "string":
			if (lastText == "") {
				out.push({
					text: "0",
					displayText: value,
					replacementPrefix: lastText,
					type: "string",
					iconHTML: icon("option.svg")
				});
				excludeOtherSuggestion = false;
			} else {
				out.push({
					text: lastText,
					displayText: value,
					replacementPrefix: lastText,
					type: "string",
					iconHTML: icon("option.svg")
				});
			}
			break;
		case "greedy":
			out.push({
				text: "\n",
				displayText: value,
				replacementPrefix: "",
				type: "string",
				iconHTML: icon("option.svg")
			});
			break;
	}
	if (sort) out.sort(compareOut);
	return out;
}

/**
 * Gets current command
 *
 * @param {Object} editor - atom editor object
 * @param {number} bufferPosition - current buffer position
 *
 * @return {String} command name
 */
function getCurrentCommand(editor, bufferPosition) {
	let text = editor.getTextInBufferRange([[bufferPosition.row, 0], bufferPosition]);
	let matches = text.match(/^\w+/g);
	if (matches == null) return null;
	let cmd = matches[0];
	return cmd;
}

/**
 * Gets cycle object of the current command argument
 *
 * @param {String} text - text of the current line
 * @param {Object} command - command object
 * @param {Object[]} command.cycleMarkers - cycle markers of the command
 * @param {String} command.alias - optional alias of the command
 *
 * @return {Object} cycle object
 */
function getCommandStop(text, command) {

	if (command == null) return null;

	//replace all non arg seperating spaces with an _

	let block = [];

	let aux = "";
	for (let c of text) {
		if (c == "{") {
			block.push("}");
			aux += c;
		} else if (c == "[") {
			block.push("]");
			aux += c;
		} else if (c == "\"" && block[block.length - 1] != "\"") {
			block.push("\"");
			aux += c;
		} else if (c == block[block.length - 1]) {
			block.pop();
			aux += c;
		} else if (c == " " && block.length > 0) aux += "_";
		else aux += c;
	}

	let args = aux.split(" ").slice(1, -1);
	if (command["alias"] != null) return runCycle(args, commands["commands"][command["alias"]]["cycleMarkers"])["cycle"]
	let cycle = command["cycleMarkers"];
	return runCycle(args, cycle);
}

/**
 * Cycles through the arguments of the current line
 * and returns cycle object with current autocomplete object
 *
 * @param {String[]} args - array of all command arguments of the current line without the command itself | Example: ["@s","add","ownTag"]
 * @param {Object[]} cycle - cycle markers of the current command
 *
 * @return {Object} cycle - cycle object
 * @return {number} cycle.pos - current position in the cycle array
 * @return {number} cycle.argPos - current position in the args array
 * @return {Boolean} cycle.noStop - for coord types: determines if the argument is not the first parameter of the type
 * @return {Object} cycle.cycle - autocomplete object of the current argument
 */
function runCycle(args, cycle) {

	let i = 0;
	let c = 0;

	//cycles through the arguments
	for (; i < args.length;) {
		let arg = args[i];
		let stop = cycle[c];

		let realStop = stop;
		if (realStop["noStop"]) {
			realStop["noStop"] = null;
		}
		// check include case
		if (stop["include"] != null) {
			realStop = commands["reference"][stop["include"]];
		}

		if (realStop["type"] == "option" && (realStop["anyValue"] == null || !realStop["anyValue"])) {
			if (!realStop["value"].includes(arg)) {
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
			let cycleRun = runCycle(args.slice(i + 1), realStop["change"][arg]);
			i += cycleRun["argPos"] + 1;
			c += 1;
			if (cycleRun["cycle"] != null) return {
				pos: c,
				argPos: i,
				noStop: cycleRun["noStop"],
				cycle: cycleRun["cycle"]
			}
		} else if ((realStop["type"] == "coord" || realStop["type"] == "3-number") && i < args.length && (realStop["stop"] == null || !realStop["stop"].includes(arg))) {
			//skips two arguments
			i += 3;
			c += 1;

			//output if it isn't the first argument
			if (args.length < i) {
				return {
					pos: c,
					argPos: i,
					noStop: true,
					cycle: realStop
				};
			}
		} else if (realStop["type"] == "2-coord" && i < args.length && (realStop["stop"] == null || !realStop["stop"].includes(arg))) {
			//skips one argument
			i += 2;
			c += 1;

			//output if it isn't the first argument
			if (args.length < i) {
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
		} else if (realStop["type"] == "command") {
			let cmd = args[i];
			let newCycle = getCommandStop(args.slice(i).join(" ") + " !", commands["commands"][cmd])
			if(newCycle == null) {
				return {
					pos: cycle.length + 1,
					argPos: args.length + 1,
					cycle: null
				}
			}
			return {
				pos: cycle.length + 1,
				argPos: args.length + 1,
				noStop: newCycle["noStop"],
				cycle: newCycle["cycle"]
			}
		} else if (realStop["type"] == "greedy") {
			return {
				pos: cycle.length + 1,
				argPos: args.length + 1,
				cycle: realStop
			}
		} else {
			i++;
			c++;
		}

		if (c >= cycle.length) return {
			pos: c,
			argPos: i,
			cycle: null
		}
		realLastStop = realStop;
	}

	if (cycle[0] != null) {
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
}

/**
 * Gets matching command suggestions
 *
 * @param {String} text - user typed text
 *
 * @return {Object[]} suggestion object
 *
 */
function getCommandOption(text) {
	let out = [];
	for (let cmd of Object.values(commands["commands"])) {
		if (cmd["name"].startsWith(text)) {
			let cmdObj = {
				text: cmd["name"],
				type: "command",
				iconHTML: icon("command.svg"),
				command: cmd
			};
			out.push(cmdObj);
		}
	}
	out.sort(compareOut);
	return out;
}

/**
 * Called by Provider API: Is called when a suggestion request has been dispatched by autocomplete+ to your provider
 * Gets a list with suggestion objects, which will be displayed by atom
 *
 * @param {Object} args - object with information about the editor and buffer
 *
 * @return {Object[]} array of suggestion objects
 */
function getSuggestions(args) {
	if (!atom.config.get("mcfunction-novum.enableAutocomplete")) return;
	let bufferPos = args.bufferPosition;
	let editor = args.editor;
	let current = getCurrentCommand(editor, bufferPos);
	let out = [];
	let lineText = editor.getTextInBufferRange([[bufferPos.row, 0], bufferPos]);
	if (!lineText.includes(" ")) {
		out = getCommandOption(lineText);
	} else if (current != null) {

		let splitText = lineText.split("");
		let currentText = "";
		// The line splitted in arguments
		let splitedText = [];

		let inQuote = false;
		let backslash = false;

		for (let char of splitText) {
			if (!backslash && char == '\\') {
				backslash = true;
				currentText += char;
			} else if (backslash && char == '\"') {
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

		if (commands["commands"][current] == null) return null;
		let stop = getCommandStop(lineText, commands["commands"][current]);
		let cycle = stop["cycle"];
		if (cycle == null) return [];

		if (cycle["type"] == "command") {
			out = getCommandOption(lastText);
		} else if (cycle["stop"] != null && !stop["noStop"]) {
			out = suggestionList(cycle["type"], cycle, lastText, false);
		} else {
			out = suggestionList(cycle["type"], cycle["value"], lastText, false);
		}
		curText = lastText;
	}
	return out;
}

/**
 * Called by Provider API: Function that is called when a suggestion from your provider was inserted into the buffer
 * Replaces user typed text with the suggestion
 *
 * @param {Object} args - Object with information about the editor, buffer and suggestion
 */
function onDidInsertSuggestion(args) {
	let types = ["attribute-id", "block", "effect", "advancement", "loottable", "particle", "sound", "enchantment", "entity-id", "entity-selector", "item", "lootItems", "recipe", "slot", "objective-slot", "objective", "biome", "mcfunction"];

	if (types.includes(args.suggestion.type)) {
		let editor = args.editor;
		let bufferPos = editor.getCursorBufferPosition();
		let row = bufferPos.row;
		let pos = bufferPos.column;
		let nextChar = editor.getTextInBufferRange([[row, pos - 1], [row, pos]]);

		while (nextChar != " " && nextChar != "=" && pos > 0) {
			pos--;
			nextChar = editor.getTextInBufferRange([[row, pos - 1], [row, pos]])
			editor.backspace();
		}
		editor.insertText(args.suggestion.text);
	}
}

module.exports = {
	//for provider api
	selector: ".source.mcfunction",
	disableForSelector: ".source.mcfunction .comment",
	inclusionPriority: 1,
	suggestionPriority: 2,
	getSuggestions,
	onDidInsertSuggestion,

	//for mcfunction novum
	versions,
	setLists,

	//for testing
	suggestion,
	suggestions,
	suggestionList,
	getCurrentCommand,
	getCommandOption,
	getCommandStop,
	runCycle
}
