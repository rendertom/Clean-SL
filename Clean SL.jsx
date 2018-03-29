/**********************************************************************************************
    Clean SL.jsx
    Copyright (c) 2017 Tomas Šinkūnas. All rights reserved.
    www.rendertom.com

    Description:
		Clean SL (Clean ScriptingListenerJS.log) is a utility tool for Adobe Photoshop
		to clean up ScriptingListenerJS.log file. Script performs multiple actions such
		as cleaning-up variable names and hoisting them to the top, wraps code block
		into function, converts charID to string ID for better readability and such.
		Resulting code is clean and maintains better code readability.

	Features:
		- Load entire ScriptingListenerJS.log content
		- Load only last entry in ScriptingListenerJS.log
		- Enter ScriptingListenerJS code manually

	Options:
		- Hoist variable declaration to the top
		- Consolidate variables
		- Rename constructors
		- Convert charID to stringID for better readability
		- Shorten method names
		- Wrap to function block
		- Remove Code Junk from Action Manager code
		- Close Clean SL window before evaluating code
		- Save UI data on script quit.

	Released as open-source under the MIT license:
		The MIT License (MIT)
		Copyright (c) 2017 Tomas Šinkūnas www.renderTom.com
		Permission is hereby granted, free of charge, to any person obtaining a copy of this
		software and associated documentation files (the "Software"), to deal in the Software
		without restriction, including without limitation the rights to use, copy, modify, merge,
		publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
		to whom the Software is furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all copies or
		substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
		INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
		PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
		FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
		OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
		DEALINGS IN THE SOFTWARE.

**********************************************************************************************/

(function () {

	//@include "lib/json2.js"

	var predefined = {
		junkArray: [
			"stringIDToTypeID( \"convertJSONdescriptor\" );",
			"stringIDToTypeID( \"invokeCommand\" );",
			"stringIDToTypeID( \"modalHTMLPending\" );",
			"stringIDToTypeID( \"modalStateChanged\" );",
			"stringIDToTypeID( \"toggleSearch\" );",
			"stringIDToTypeID( \"toolModalStateChanged\" );"
		],
		constructorNames: {
			"ActionDescriptor": "descriptor",
			"ActionList": "list",
			"ActionReference": "reference"
		},
		shortMethodNames: {
			"stringIDToTypeID": "s2t",
			"charIDToTypeID": "c2t"
		},
		printToESTK: false,
		removeJunkOnFullLogRead: false,
		closeAfterSaving: false,
		descriptorMethods: [
			// "clear", // - nothing - Clears the descriptor.
			// "erase", // - key - Erases a key from the descriptor.
			// "fromStream", // - value - Creates a descriptor from a stream of bytes; for reading from disk.
			// "getBoolean", // - key - Gets the value of a key of type boolean.
			// "getClass", // - key - Gets the value of a key of type class.
			// "getData", // - key - Gets raw byte data as a string value.
			// "getDouble", // - key - Gets the value of a key of type double.
			// "getEnumerationType", // - key - Gets the enumeration type of a key.
			// "getEnumerationValue", // - key - Gets the enumeration value of a key.
			// "getInteger", // - key - Gets the value of a key of type integer.
			// "getKey", // - index - Gets the ID of the Nth key, provided by index.
			// "getLargeInteger", // - key - Gets the value of a key of type large integer.
			// "getList", // - key - Gets the value of a key of type list.
			// "getObjectType", // - key - Gets the class ID of an object in a key of type object.
			// "getObjectValue", // - key - Gets the value of a key of type object.
			// "getPath", // - key - Gets the value of a key of type File.
			// "getReference", // - key - Gets the value of a key of type ActionReference.
			// "getString", // - key - Gets the value of a key of type string.
			// "getType", // - key - Gets the type of a key.
			// "getUnitDoubleType", // - key - Gets the unit type of a key of type UnitDouble.
			// "getUnitDoubleValue", // - Gets the value of a key of type UnitDouble.
			// "hasKey", // - key - Checks whether the descriptor contains the provided key.
			// "isEqual", // - Determines whether the descriptor is the same as another descriptor.
			"putBoolean", // - key, value - Sets the value for a key whose type is boolean.
			// "putClass", // - key, value - Sets the value for a key whose type is class.
			// "putData", // - key, value - Puts raw byte data as a string value.
			"putDouble", // - key, value - Sets the value for a key whose type is double.
			// "putEnumerated", // - key, enumType, value - Sets the enumeration type and value for a key.
			"putInteger", // - key, value - Sets the value for a key whose type is integer.
			"putLargeInteger", // - key, value - Sets the value for a key whose type is large integer.
			// "putList", // - key, value - Sets the value for a key whose type is an ActionList object.
			// "putObject", // - key, classID, value - Sets the value for a key whose type is an object, represented by an Action Descriptor.
			"putPath", // - key, value - Sets the value for a key whose type is path.
			// "putReference", // - key, value - Sets the value for a key whose type is an object reference.
			"putString", // - key, value - Sets the value for a key whose type is string.
			"putUnitDouble", // - key, unitID, value - Sets the value for a key whose type is a unit value formatted as a double.
			// "toStream", // - nothing - Gets the entire descriptor as a stream of bytes, for writing to disk.

		],
		ignoreKeyList: [
			"DocI", "documentID",
			"kcanDispatchWhileModal",
			"level",
			"profile",
		]
	};

	var script = {
		name: "Clean ScriptingListenerJS.log",
		nameShort: "Clean SL",
		version: "1.4",
		developer: {
			name: File.decode("Tomas%20%C5%A0ink%C5%ABnas"), // Tomas Šinkūnas
			url: "http://www.rendertom.com"
		},
		getInfo: function () {
			return this.nameShort + " v" + this.version + "\n" + "Photoshop utility tool to clean " +
				"up ScriptingListenerJS log file. Script performs multiple actions such as cleaning-up " +
				"variable names and hoisting them to the top, wraps code block into function, " +
				"converts charID to string ID, extracts parameter values and such.\n\n" +
				"Resulting code is clean and maintains better readability.\n\n" +
				"Developed by " + this.developer.name + "\n" + this.developer.url;
		}
	};

	var logSeparator = "// =======================================================\n";

	var Incrementor = (function () {
		var storedFunctions = [],
			storedVariables = [],
			storedParameters = [],
			reservedWords = ["abstract", "arguments", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger", "default", "delete",
				"do", "double", "else", "enum", "eval", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import",
				"in", "instanceof", "int", "interface", "let", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static",
				"super", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with", "yield",
				"Array", "Date", "hasOwnProperty", "Infinity", "isFinite", "isNaN", "isPrototypeOf", "length", "Math", "NaN", "name", "Number", "Object", "prototype",
				"String", "toString", "undefined", "valueOf", "getClass", "java", "JavaArray", "javaClass", "JavaObject", "JavaPackage"
			];


		function contains(arr, value) {
			var i, il;
			for (i = 0, il = arr.length; i < il; i++) {
				if (arr[i] === value) {
					return arr[i];
				}
			}
			return false;
		}

		function resetVariables() {
			storedVariables = reservedWords.slice(0);
		}

		function resetFunctions() {
			storedFunctions = reservedWords.slice(0);
		}

		function resetParameters() {
			storedParameters = reservedWords.slice(0);
		}

		function incrementVariables(string) {
			var variableName = string;
			variableName = validateName(variableName);
			return increment(variableName, storedVariables);
		}

		function incrementFunctions(string) {
			var functionName = string;
			functionName = validateName(functionName);
			return increment(functionName, storedFunctions);
		}

		function incrementParameters(string) {
			var parameterName = string;
			parameterName = validateName(parameterName);
			return increment(parameterName, storedParameters);
		}

		function increment(string, storedArray) {
			var coreName, newVariableVersion, versionNumber;
			coreName = string.replace(/\d+$/, "");
			newVariableVersion = coreName;
			versionNumber = 2;
			while (contains(storedArray, newVariableVersion)) {
				newVariableVersion = coreName + versionNumber;
				versionNumber++;
			}

			storedArray.push(newVariableVersion);
			return newVariableVersion;
		}

		function validateName(string) {
			var functionName = string;
			functionName = functionName.replace(/[^\w_\$]/gi, ""); // Remove forbidden characters from function names
			if (functionName === "")
				functionName = "xxx";

			return functionName;
		}

		return {
			resetVariables: resetVariables,
			resetFunctions: resetFunctions,
			resetParameters : resetParameters,
			incrementVariables: incrementVariables,
			incrementFunctions: incrementFunctions,
			incrementParameters: incrementParameters
		};
	})();

	var Settings = (function () {
		var settings, defaultSettings, startupSettings,
			pathToSettingsFile;

		pathToSettingsFile = File($.fileName).parent.fsName + "/" + script.nameShort + " Settings " + script.version + ".txt";
		defaultSettings = {
			hoistVariables: {
				value: true
			},
			consolidateVariables: {
				value: true
			},
			renameConstructors: {
				value: true
			},
			charIDToStringID: {
				value: true
			},
			shortMethodNames: {
				value: true
			},
			wrapToFunction: {
				value: true
			},
			extractParameters: {
				value: true
			},
			closeBeforeEval: {
				value: true
			},
			saveOnQuit: {
				value: true
			},
			etInputText: {
				text: ""
			},
			etOutputText: {
				text: ""
			}
		};

		function copyObjectValues(sourceObject, targetObject) {
			for (var propertyName in sourceObject) {
				if (!sourceObject.hasOwnProperty(propertyName) ||
					!targetObject.hasOwnProperty(propertyName)) {
					continue;
				}

				for (var deepPropertyName in sourceObject[propertyName]) {
					if (!sourceObject[propertyName].hasOwnProperty(deepPropertyName) ||
						!targetObject[propertyName].hasOwnProperty(deepPropertyName)) {
						continue;
					}
					targetObject[propertyName][deepPropertyName] = sourceObject[propertyName][deepPropertyName];
				}
			}
		}

		function getSettingsFromFile() {
			var settingsFile, fileContent, settingsJson;

			settingsFile = new File(pathToSettingsFile);
			if (!settingsFile.exists) {
				return null;
			}

			fileContent = readFileContent(settingsFile);

			try {
				settingsJson = JSON.parse(fileContent);
			} catch (e) {
				alert("Unable to parse settings file. Will use default values instead");
			}

			return settingsJson;
		}

		function save(data) {
			var settingsFile, settingsAsString;
			try {
				settingsFile = new File(pathToSettingsFile);
				settingsAsString = JSON.stringify(data, false, 4);

				writeFile(settingsFile, settingsAsString);

			} catch (e) {
				alert(e.toString() + "\nLine: " + e.line.toString());
			}
		}

		function saveSettings() {
			save(settings);
		}

		function saveStartupSettings() {
			startupSettings.saveOnQuit.value = false;
			save(startupSettings);
		}

		function init() {
			settings = getSettingsFromFile();
			if (!settings) {
				settings = defaultSettings;
			}

			startupSettings = JSON.parse(JSON.stringify(settings));
			return settings;
		}

		return {
			saveSettings: saveSettings,
			saveStartupSettings: saveStartupSettings,
			init: init,
			copyObjectValues: copyObjectValues,
		};
	})();

	var settings = Settings.init();

	buidUI();

	/* MAIN */

	function preprocess(dirtyCode) {
		var cleanCode, cleanCodeBlock, cleanCodeArray = [],
			dirtyCodeBlock, dirtyCodeArray = [],
			i, il;

		Incrementor.resetFunctions();

		dirtyCodeArray = dirtyCode.split(logSeparator);
		for (i = 0, il = dirtyCodeArray.length; i < il; i++) {
			Incrementor.resetVariables();
			Incrementor.resetParameters();

			dirtyCodeBlock = trimSpaces(dirtyCodeArray[i]);
			if (dirtyCodeBlock === "") continue;
			cleanCodeBlock = main(dirtyCodeBlock);
			cleanCodeArray.push(cleanCodeBlock);
		}

		cleanCode = (il === 1) ? "" : logSeparator;
		cleanCode = cleanCode + cleanCodeArray.join("\n\n" + logSeparator);

		return cleanCode;
	}

	function main(inString) {
		try {
			var string;

			string = inString;

			string = splitToNewLines(string);
			string = fixIndentation(string);
			string = fixTripleQuotes(string);
			string = fixConflictingVariableDeclarations(string);

			if (settings.hoistVariables.value) string = hoistVariables(string);
			if (settings.consolidateVariables.value) string = consolidateVariables(string);
			if (settings.renameConstructors.value) string = renameConstructors(string);
			if (settings.charIDToStringID.value) string = convert_CharID_to_StringID(string);
			if (settings.shortMethodNames.value) string = shortMethodNames(string);
			if (settings.wrapToFunction.value) string = wrapToFunction(string, settings.extractParameters.value);
			return string;

		} catch (e) {
			alert(e.toString() + "\nLine: " + e.line.toString());
		}
	}

	/********************************************************************************/



	/* WORKFLOW */

	function hoistVariables(inString) {
		var outString, variableDeclarationLines = [],
			i, il;

		outString = inString;
		variableDeclarationLines = getVariableDeclarationLines(outString);

		if (variableDeclarationLines) {
			for (i = 0, il = variableDeclarationLines.length; i < il; i++) {
				outString = outString.replace(variableDeclarationLines[i] + "\n", ""); // remove from original position
			}

			// We have to separate "removing" and "adding" lines,
			// because if it adds variableDeclaration line, it might get removed

			variableDeclarationLines = removeDuplicatesFromArray(variableDeclarationLines);
			variableDeclarationLines.sort(function (a, b) {
				a = a.toUpperCase();
				b = b.toUpperCase();
				if (a > b) return 1;
				if (a < b) return -1;
				return 0;
			});
			outString = variableDeclarationLines.join("\n") + "\n\n" + outString;
		}

		return trimSpaces(outString);
	}

	function consolidateVariables(inString) {
		var outString,
			variableName,
			variableValue,
			variableDeclarationLine,
			variableDeclarationLines,
			regexPattern,
			regexExpression,
			variablesInCodeBlock,
			lastSign,
			i, il, j, jl;

		outString = inString;
		variableDeclarationLines = getVariableDeclarationLines(outString);

		if (variableDeclarationLines) {
			for (i = 0, il = variableDeclarationLines.length; i < il; i++) {
				variableDeclarationLine = variableDeclarationLines[i];

				// ignore lines with "new ActionDescriptor()", "new ActionList()" and such,
				// because we don't want to consolidate them.
				if (variableDeclarationLine.match("\\s*new.*\\(\\)")) continue;

				variableName = getVariableName(variableDeclarationLine);
				variableValue = getVariableValue(variableDeclarationLine);

				// Adds "," or ")" to variable name, so I could capture variables
				// used in code (and not in variable declaration block);
				regexPattern = variableName + "\\s*[,|\\)]";

				variablesInCodeBlock = outString.match(new RegExp(regexPattern, "g"));
				if (variablesInCodeBlock) {
					for (j = 0, jl = variablesInCodeBlock.length; j < jl; j++) {
						// Determines what last character was : "," or ")";
						lastSign = variablesInCodeBlock[j].slice(-1);
						outString = outString.replace(variablesInCodeBlock[j], variableValue + lastSign);
					}

					// Remove variable declaration lines. We have to use Global flag
					// because in some case there are duplicate declarations of same variable
					regexExpression = new RegExp(escapeRegexExpression(variableDeclarationLine + "\n"), "g");
					outString = outString.replace(regexExpression, "");
				}
			}
		}

		return outString;
	}

	function renameConstructors(inString) {
		var outString,
			constructorName,
			regexExpression,
			variableName,
			variableNameNew,
			variableValue,
			variableDeclarationLine,
			variableDeclarationLines = [],
			i, il;

		outString = inString;
		variableDeclarationLines = getVariableDeclarationLines(outString);

		if (variableDeclarationLines) {
			for (i = 0, il = variableDeclarationLines.length; i < il; i++) {
				variableDeclarationLine = variableDeclarationLines[i];

				variableName = getVariableName(variableDeclarationLine);
				variableValue = getVariableValue(variableDeclarationLine);

				for (constructorName in predefined.constructorNames) {
					if (!predefined.constructorNames.hasOwnProperty(constructorName)) continue;
					if (variableValue.match(constructorName)) {
						variableNameNew = predefined.constructorNames[constructorName];
						variableNameNew = Incrementor.incrementVariables(variableNameNew);

						regexExpression = new RegExp("\\b" + variableName + "\\b", "g"); // Matches word boundry
						outString = outString.replace(regexExpression, variableNameNew);
					}
				}
			}
		}

		return outString;
	}

	function convert_CharID_to_StringID(inString) {
		var outString,
			regexExpression,
			charIDfunctions, charIDfunction, newCharIDfunction,
			functionParts, functionStart, quote,
			charID, stringID,
			i, il;

		// From "Get Equivalent ID Code.js" v1.7 by Michel MARIANI
		// http://www.tonton-pixel.com/scripts/utility-scripts/get-equivalent-id-code/index.html
		var conflictingStringIDs = {
			"Algn": ["align", "alignment"],
			"AntA": ["antiAlias", "antiAliasedPICTAcquire"],
			"BckL": ["backgroundLayer", "backgroundLevel"],
			"BlcG": ["blackGenerationType", "blackGenerationCurve"],
			"BlcL": ["blackLevel", "blackLimit"],
			"Blks": ["blacks", "blocks"],
			"BlrM": ["blurMethod", "blurMore"],
			"BrgC": ["brightnessEvent", "brightnessContrast"],
			"BrsD": ["brushDetail", "brushesDefine"],
			"Brsh": ["brush", "brushes"],
			"Clcl": ["calculation", "calculations"],
			"ClrP": ["colorPalette", "coloredPencil"],
			"Cnst": ["constant", "constrain"],
			"CntC": ["centerCropMarks", "conteCrayon"],
			"Cntr": ["center", "contrast"],
			"CrtD": ["createDroplet", "createDuplicate"],
			"CstP": ["customPalette", "customPhosphors"],
			"Cstm": ["custom", "customPattern"],
			"Drkn": ["darken", "darkness"],
			"Dstr": ["distort", "distortion", "distribute", "distribution"],
			"Dstt": ["desaturate", "destWhiteMax"],
			"FlIn": ["fileInfo", "fillInverse"],
			"Gd  ": ["good", "guide"],
			"GnrP": ["generalPreferences", "generalPrefs", "preferencesClass"],
			"GrSt": ["grainStippled", "graySetup"],
			"Grdn": ["gradientClassEvent", "gridMinor"],
			"Grn ": ["grain", "green"],
			"Grns": ["graininess", "greens"],
			"HstP": ["historyPreferences", "historyPrefs"],
			"HstS": ["historyState", "historyStateSourceType"],
			"ImgP": ["imageCachePreferences", "imagePoint"],
			"In  ": ["in", "stampIn"],
			"IntW": ["interfaceWhite", "intersectWith"],
			"Intr": ["interfaceIconFrameDimmed", "interlace", "interpolation", "intersect"],
			"JPEG": ["JPEG", "JPEGFormat"],
			"LghD": ["lightDirection", "lightDirectional"],
			"LghO": ["lightOmni", "lightenOnly"],
			"LghS": ["lightSource", "lightSpot"],
			"Lns ": ["lens", "lines"],
			"Mgnt": ["magenta", "magentas"],
			"MrgL": ["mergeLayers", "mergedLayers"],
			"Mxm ": ["maximum", "maximumQuality"],
			"NTSC": ["NTSC", "NTSCColors"],
			"NmbL": ["numberOfLayers", "numberOfLevels"],
			"PlgP": ["pluginPicker", "pluginPrefs"],
			"Pncl": ["pencilEraser", "pencilWidth"],
			"Pnt ": ["paint", "point"],
			"Prsp": ["perspective", "perspectiveIndex"],
			"PrvM": ["previewMacThumbnail", "previewMagenta"],
			"Pstr": ["posterization", "posterize"],
			"RGBS": ["RGBSetup", "RGBSetupSource"],
			"Rds ": ["radius", "reds"],
			"ScrD": ["scratchDisks", "screenDot"],
			"ShdI": ["shadingIntensity", "shadowIntensity"],
			"ShpC": ["shapeCurveType", "shapingCurve"],
			"ShrE": ["sharpenEdges", "shearEd"],
			"Shrp": ["sharpen", "sharpness"],
			"SplC": ["splitChannels", "supplementalCategories"],
			"Spot": ["spot", "spotColor"],
			"SprS": ["separationSetup", "sprayedStrokes"],
			"StrL": ["strokeLength", "strokeLocation"],
			"Strt": ["saturation", "start"],
			"TEXT": ["char", "textType"],
			"TIFF": ["TIFF", "TIFFFormat"],
			"TglO": ["toggleOptionsPalette", "toggleOthers"],
			"TrnG": ["transparencyGamutPreferences", "transparencyGrid", "transparencyGridSize"],
			"TrnS": ["transferSpec", "transparencyShape", "transparencyStop"],
			"Trns": ["transparency", "transparent"],
			"TxtC": ["textClickPoint", "textureCoverage"],
			"TxtF": ["textureFile", "textureFill"],
			"UsrM": ["userMaskEnabled", "userMaskOptions"],
			"c@#^": ["inherits", "pInherits"],
			"comp": ["comp", "sInt64"],
			"doub": ["floatType", "IEEE64BitFloatingPoint", "longFloat"],
			"long": ["integer", "longInteger", "sInt32"],
			"magn": ["magnitude", "uInt32"],
			"null": ["null", "target"],
			"shor": ["sInt16", "sMInt", "shortInteger"],
			"sing": ["IEEE32BitFloatingPoint", "sMFloat", "shortFloat"],
		};

		outString = inString;

		// Collect all charIDToTypeID() functions in the string.
		// We will catch `charIDToTypeID ( "xxxx` function without last quote
		regexExpression = /charIDToTypeID\s*\(\s*?["'].{4}(?="|')/g;
		charIDfunctions = outString.match(regexExpression);

		if (charIDfunctions) {
			for (i = 0, il = charIDfunctions.length; i < il; i++) {
				charIDfunction = charIDfunctions[i]; // charIDToTypeID ( "xxxx
				quote = charIDfunction.match(/["']/)[0];
				functionParts = charIDfunction.split(quote);
				functionStart = functionParts[0];
				charID = functionParts[1];

				// Skip if "charID" has conflicting StringID values.
				// CharID and StringID are not a one-to-one mapping: one CharID
				// can map to two different StringIDs. For instance:
				// charIDToTypeID( "Grn " ) === stringIDToTypeID( "grain" ) === stringIDToTypeID( "green" )  
				if (conflictingStringIDs.hasOwnProperty(charID))
					continue;

				// Skip if CharID does not have corresponding StringID
				stringID = charIDtoStringID(charID);
				if (!stringID)
					continue;

				functionStart = functionStart.replace("charIDToTypeID", "stringIDToTypeID");
				newCharIDfunction = functionStart + quote + stringID;
				outString = outString.replace(charIDfunction, newCharIDfunction);
			}
		}

		return outString;
	}

	function shortMethodNames(inString) {
		var outString, functionName,
			updateString = function (string, fullString, shortString) {
				var functionDeclarationString, regexExpression;

				regexExpression = new RegExp(fullString, "g");
				if (regexExpression.test(string)) {
					functionDeclarationString = "var " + shortString + " = function (s) {\n\treturn app." + fullString + "(s);\n};";
					string = string.replace(regexExpression, shortString);
					string = functionDeclarationString + "\n\n" + string;
				}

				return string;
			};

		outString = inString;

		for (functionName in predefined.shortMethodNames) {
			if (!predefined.shortMethodNames.hasOwnProperty(functionName)) continue;
			outString = updateString(outString, functionName, predefined.shortMethodNames[functionName]);
		}

		return outString;
	}

	function getFields(array, property) {
		var value, tempValue, values = [],
			i, il;
		for (i = 0, il = array.length; i < il; i++) {
			value = array[i][property];
			tempValue = parseFloat(value);
			if (!isNaN(tempValue)) {
				value = tempValue;
			}
			values.push(value);
		}
		return values;
	}

	function wrapToFunction(inString, toExtractParameters) {
		var outString,
			functionName,
			functionBlock,
			functionNameFromExecuteAction,
			executeActionLine,
			methodParameters,
			parameterNames = "",
			parameterValues = "";


		outString = inString;

		if (toExtractParameters === true) {
			methodParameters = getMethodParameters(outString);
			outString = methodParameters.outString;
			parameterNames = getFields(methodParameters.parameters, "methodKey").join(", ");
			parameterValues = getFields(methodParameters.parameters, "methodValue").join(", ");
		}

		functionName = "xxx";
		executeActionLine = outString.match(/executeAction.*/);
		if (executeActionLine) {
			functionNameFromExecuteAction = executeActionLine[0].split("\"")[1];
			if (functionNameFromExecuteAction) {
				functionName = functionNameFromExecuteAction;
			}
		}

		functionName = Incrementor.incrementFunctions(functionName);
		functionBlock = functionName + "(" + parameterValues + ");\n" + "function " + functionName + "(" + parameterNames + ") {\n";
		outString = functionBlock + fixIndentation(outString, "\t", false) + "\n}";

		return outString;
	}

	function getMethodParameters(inString) {
		var outString,
			codeArray, codeLine, splitCodeLine, partMethod, partValue, regBetweenQuotes,
			constructorMethodRegex,
			parameters = [],
			methodKey,
			methodValue,
			i, il, j, jl;

		outString = inString;
		codeArray = outString.split("\n");

		regBetweenQuotes = new RegExp("\[\"'](.*?)[\"']");

		for (i = 0, il = codeArray.length; i < il; i++) {
			codeLine = codeArray[i];
			for (j = 0, jl = predefined.descriptorMethods.length; j < jl; j++) {
				constructorMethodRegex = new RegExp("\\.\\b" + predefined.descriptorMethods[j] + "\\b\\W");
				if (codeLine.match(constructorMethodRegex) && keyShouldBeIgnored(codeLine) === false) {
					splitCodeLine = codeLine.split(",");
					partMethod = splitCodeLine[0];
					partValue = splitCodeLine[splitCodeLine.length - 1];

					if (!regBetweenQuotes.test(partMethod)) continue;
					methodKey = partMethod.match(regBetweenQuotes)[1]; // Matches text between quotes
					if (methodKey === "") continue;
					methodKey = Incrementor.incrementParameters(methodKey);

					methodValue = partValue.substring(partValue.lastIndexOf(",") + 1, partValue.lastIndexOf(")"));
					methodValue = trimSpaces(methodValue);

					partValue = partValue.replace(methodValue, methodKey);
					splitCodeLine[splitCodeLine.length - 1] = partValue;

					codeArray[i] = splitCodeLine.join(",");

					parameters.push({
						methodKey: methodKey,
						methodValue: methodValue
					});
					break;
				}
			}
		}

		outString = codeArray.join("\n");

		return {
			outString: outString,
			parameters: parameters
		};
	}

	function keyShouldBeIgnored(codeLine) {
		for (var p = 0, pl = predefined.ignoreKeyList.length; p < pl; p++) {
			var regex2 = new RegExp("\.\\b" + predefined.ignoreKeyList[p] + "\\b\\W");
			if (codeLine.match(regex2)) {
				return true;
			}
		}
		return false;
	}

	function evaluateScript(codeAsString) {
		try {
			eval(codeAsString);
		} catch (e) {
			alert("Unable to evalue script.\n" + e.toString() + "\nLine: " + e.line.toString());
		}
	}

	function removeJunkCode(inString, showAlert) {
		try {
			var cleanCode, cleanCodeArray = [],
				dirtyCode, dirtyCodeArray = [],
				isJunkBlock, numberJunksRemoved = 0,
				alertMessage, i, il;

			if (typeof showAlert === "undefined") {
				showAlert = true;
			}

			dirtyCodeArray = trimSpaces(inString).split(logSeparator);

			for (i = 0, il = dirtyCodeArray.length; i < il; i++) {
				dirtyCode = dirtyCodeArray[i];
				if (trimSpaces(dirtyCode) === "") continue;
				isJunkBlock = stringContainsArrayItems(dirtyCode, predefined.junkArray);
				if (isJunkBlock) {
					numberJunksRemoved++;
				} else {
					cleanCodeArray.push(dirtyCode);
				}
			}

			if (numberJunksRemoved === 0) {
				alertMessage = "All good, no junk found.";
				cleanCode = false;
			} else {
				alertMessage = "Removed " + numberJunksRemoved + " junk " + ((numberJunksRemoved > 1) ? "blocks" : "block") + ".\n";
				alertMessage += "\"Junk block\" is considered a log block that contains any of these:\n\n" + predefined.junkArray.join("\n");

				if (cleanCodeArray.length === 0) {
					cleanCode = " ";
				} else {
					cleanCode = (cleanCodeArray.length === 1) ? "" : logSeparator;
					cleanCode = logSeparator + cleanCodeArray.join(logSeparator);
				}
			}

			if (showAlert === true)
				alert(alertMessage);

			return cleanCode;

		} catch (e) {
			alert(e.toString() + "\nLine: " + e.line.toString());
		}
	}

	/********************************************************************************/



	/* USER INTERFACE */

	function buidUI() {
		var uiControlls = {};
		var win = new Window("dialog", script.name + " v" + script.version, undefined, {
			resizeable: true
		});
		win.preferredSize = [1100, 500];
		win.alignChildren = ["fill", "fill"];
		win.orientation = "row";


		uiControlls.etInputText = win.add("edittext", undefined, "", {
			multiline: true
		});

		uiControlls.etInputText.onChange = uiControlls.etInputText.onChanging = function () {
			btnExecSource.enabled = btnCleanCode.enabled = btnRemoveJunkCode.enabled = this.text !== "";
		};

		uiControlls.etOutputText = win.add("edittext", undefined, "", {
			multiline: true
		});

		uiControlls.etOutputText.onChange = uiControlls.etOutputText.onChanging = function () {
			btnSave.enabled = btnExecOutput.enabled = this.text !== "";
		};


		var grpRightColumn = win.add("group");
		grpRightColumn.orientation = "column";
		grpRightColumn.alignment = ["right", "fill"];
		grpRightColumn.alignChildren = ["fill", "top"];
		grpRightColumn.spacing = 2;

		var btnReadFullLog = grpRightColumn.add("button", undefined, "Load full log");
		btnReadFullLog.helpTip = "Loads entire content of \nScriptingListenerJS.log file";
		btnReadFullLog.onClick = function () {
			var fullLog = getFullLog();
			if (fullLog) {
				var inputText = fullLog;
				if (predefined.removeJunkOnFullLogRead === true) {
					inputText = removeJunkCode(inputText, false);
				}

				uiControlls.etInputText.text = trimSpaces(inputText);
				uiControlls.etInputText.onChanging();
			}
		};

		var btnReadLastLog = grpRightColumn.add("button", undefined, "Load last log entry");
		btnReadLastLog.helpTip = "Loads last code entry from \nScriptingListenerJS.log file";
		btnReadLastLog.onClick = function () {
			var lastLogEntry = getLastLogEntry();
			if (lastLogEntry) {
				uiControlls.etInputText.text = lastLogEntry;
				uiControlls.etInputText.onChanging();
			}
		};

		var btnRemoveJunkCode = grpRightColumn.add("button", undefined, "Remove junk code");
		btnRemoveJunkCode.helpTip = "\"Junk block\" is considered a log block that contains any of these:\n\n" + predefined.junkArray.join("\n");
		btnRemoveJunkCode.onClick = function () {
			var cleanCode = removeJunkCode(uiControlls.etInputText.text);
			if (cleanCode) {
				uiControlls.etInputText.text = trimSpaces(cleanCode);
				uiControlls.etInputText.onChanging();
			}
		};

		var btnExecSource = grpRightColumn.add("button", undefined, "Evaluate source");
		btnExecSource.helpTip = "Evaluates source (Action Manager) code";
		btnExecSource.onClick = function () {
			if (uiControlls.closeBeforeEval.value === true) win.close();
			evaluateScript(uiControlls.etInputText.text);
		};

		addSpace(grpRightColumn, 20);

		uiControlls.hoistVariables = grpRightColumn.add("checkbox", undefined, "Hoist variables to the top");
		uiControlls.hoistVariables.helpTip = "Collects all variable declarations\nand moves them to the top of the block";
		uiControlls.consolidateVariables = grpRightColumn.add("checkbox", undefined, "Consolidate variables");
		uiControlls.consolidateVariables.helpTip = "Replaces each variable in the code\nwith its value";
		uiControlls.renameConstructors = grpRightColumn.add("checkbox", undefined, "Rename constructors");
		uiControlls.renameConstructors.helpTip = "Renames constructor variables:\n" + objectToString(predefined.constructorNames, "() as \"", "- new ", "\";");
		uiControlls.charIDToStringID = grpRightColumn.add("checkbox", undefined, "Convert charID to stringID");
		uiControlls.charIDToStringID.helpTip = "Converts charID value to stringID value.\nSkips converting particular case if charID has conflicting stringID values or does not have corresponding StringID at all";
		uiControlls.shortMethodNames = grpRightColumn.add("checkbox", undefined, "Shorten method names");
		uiControlls.shortMethodNames.helpTip = "Renames methods globally:\n" + objectToString(predefined.shortMethodNames, "() to ", "- ", "();");
		uiControlls.wrapToFunction = grpRightColumn.add("checkbox", undefined, "Wrap to function block");
		uiControlls.wrapToFunction.helpTip = "Wraps entire code block to function block";
		uiControlls.wrapToFunction.onClick = function () {
			uiControlls.extractParameters.enabled = this.value;
		};
		uiControlls.extractParameters = grpRightColumn.add("checkbox", undefined, "Extract parameters");
		uiControlls.extractParameters.helpTip = "Extracts parameters and puts them to function call";

		addSpace(grpRightColumn, 10);

		uiControlls.closeBeforeEval = grpRightColumn.add("checkbox", undefined, "Close before evaluating");
		uiControlls.closeBeforeEval.helpTip = "Closes " + script.nameShort + " window before evaluating code";
		uiControlls.saveOnQuit = grpRightColumn.add("checkbox", undefined, "Save UI data on quit");
		uiControlls.saveOnQuit.helpTip = "Saves UI values when " + script.nameShort + " window closes";

		addSpace(grpRightColumn, 20);

		var btnCleanCode = grpRightColumn.add("button", undefined, "Clean Code");
		btnCleanCode.helpTip = "Starts cleaning-up source code";
		btnCleanCode.onClick = function () {
			Settings.copyObjectValues(uiControlls, settings);

			var finalCode = preprocess(uiControlls.etInputText.text);
			if (finalCode) {
				uiControlls.etOutputText.text = finalCode;
				uiControlls.etOutputText.onChanging();

				if (predefined.printToESTK === true) {
					cleanESTKconsole();
					$.writeln(finalCode);
				}
			}
		};

		var btnExecOutput = grpRightColumn.add("button", undefined, "Evaluate output");
		btnExecOutput.helpTip = "Evaluates clean code";
		btnExecOutput.onClick = function () {
			if (uiControlls.closeBeforeEval.value === true) win.close();
			evaluateScript(uiControlls.etOutputText.text);
		};

		var btnSave = grpRightColumn.add("button", undefined, "Save output code");
		btnSave.helpTip = "Save clean code to file";
		btnSave.onClick = function () {
			var pathToFile = File.saveDialog("Save output code.");
			if (pathToFile) {
				saveFile(pathToFile, "jsx", uiControlls.etOutputText.text);
				if (predefined.closeAfterSaving === true) {
					win.close();
				}
			}
		};

		var btnInfo = grpRightColumn.add("button", undefined, "About");
		btnInfo.alignment = ["fill", "bottom"];
		btnInfo.onClick = function () {
			alert(script.getInfo());
		};

		var btnClose = grpRightColumn.add("button", undefined, "Close");
		btnClose.alignment = ["fill", "bottom"];
		btnClose.onClick = function () {
			win.close();
		};

		win.onResizing = win.onResize = function () {
			this.layout.resize();
		};

		win.onShow = function () {

			Settings.copyObjectValues(settings, uiControlls);

			btnCleanCode.size.height = btnCleanCode.size.height * 1.5;
			uiControlls.etOutputText.onChanging();
			uiControlls.etInputText.onChanging();

			uiControlls.extractParameters.enabled = uiControlls.wrapToFunction.value;

			win.layout.layout(true);
		};

		win.onClose = function () {
			try {
				if (uiControlls.saveOnQuit.value === true) {
					Settings.copyObjectValues(uiControlls, settings);
					Settings.saveSettings();
				} else {
					Settings.saveStartupSettings();
				}
			} catch (e) {
				alert(e.toString() + "\nLine: " + e.line.toString());
			}
		};

		win.center();
		win.show();

		function addSpace(groupContainer, spaceSize) {
			var grpSpacer = groupContainer.add("group");
			grpSpacer.preferredSize.height = spaceSize;
		}
	}

	/********************************************************************************/



	/* HELPER FUNCTIONS */

	function getVariableName(string) {
		var variableName;

		// Split line by "=" and capture first part.
		// Remove "var" keyword and cleanup white spaces.
		variableName = string.split("=")[0];
		variableName = variableName.replace(/^\s*var/, "");
		variableName = trimSpaces(variableName);

		return variableName;
	}

	function getVariableValue(string) {
		var variableValue;

		// Split line by "=" and capture second part.
		// Remove ";" at the end and cleanup white spaces.
		variableValue = string.split("=")[1];
		variableValue = variableValue.replace(/;$/, "");
		variableValue = trimSpaces(variableValue);

		return variableValue;
	}

	function getLastLogEntry() {
		var fullLog, lastLog, logArray = [];

		fullLog = getFullLog();
		logArray = fullLog.split(logSeparator);
		lastLog = logArray.pop();
		lastLog = trimSpaces(lastLog);

		return lastLog;
	}

	function escapeRegexExpression(text) {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	}

	function getVariableDeclarationLines(multilineString) {
		var regexPattern, regexFlag, regexExpression;

		regexPattern = "^\\s*var.+;$";
		regexFlag = "gm"; // Global, Multiline
		regexExpression = new RegExp(regexPattern, regexFlag);

		return multilineString.match(regexExpression);
	}

	function getFullLog() {
		var logFile;

		logFile = File(Folder.desktop.fsName + "/" + "ScriptingListenerJS.log");
		if (!logFile.exists) throw new Error("Unable to find Log file.\nFile does not exist at path " + logFile.fsName);

		return readFileContent(logFile);
	}

	function stringContainsArrayItems(string, array) {
		for (var i = 0, il = array.length; i < il; i++) {
			if (string.indexOf(array[i]) > -1)
				return true;
		}

		return false;
	}

	function getConflictingVariables(dataArray) {
		/*
			var example = [{
				"idPnt": [{
					"variableName": "idPnt",
					"variableValue": "charIDToTypeID( \"Pnt \" )",
					"variableLine": "var idPnt = charIDToTypeID( \"Pnt \" );"
				}, {
					"variableName": "idPnt",
					"variableValue": "charIDToTypeID( \"#Pnt\" )",
					"variableLine": "var idPnt = charIDToTypeID( \"#Pnt\" );"
				}]
			}, {
				"idPntASD": [{
					"variableName": "idPntASD",
					"variableValue": "charIDToTypeID( \"Pnt \" )",
					"variableLine": "\nvar idPntASD= charIDToTypeID( \"Pnt \" );"
				}, {
					"variableName": "idPntASD",
					"variableValue": "charIDToTypeID( \"#Pnt\" )",
					"variableLine": "var idPntASD = charIDToTypeID( \"#Pnt\" );"
				}]
			}];
		*/

		var remembered = {},
			conflicts = {},
			variableName,
			variableValue,
			variableLine,
			hasConflicts = false,
			isConflictingLineKnown,
			i, il, j, jl;

		for (i = 0, il = dataArray.length; i < il; i++) {
			variableName = dataArray[i].variableName;
			variableValue = dataArray[i].variableValue;
			variableLine = dataArray[i].variableLine;

			if (!remembered.hasOwnProperty(variableName)) {
				remembered[variableName] = {
					variableValue: variableValue,
					variableLine: variableLine
				};
			} else {
				if (remembered[variableName].variableLine !== variableLine) {
					if (!conflicts.hasOwnProperty(variableName)) {
						conflicts[variableName] = [];
						conflicts[variableName].push({
							variableName: variableName,
							variableValue: remembered[variableName].variableValue,
							variableLine: remembered[variableName].variableLine
						});
					}

					isConflictingLineKnown = false;
					for (j = 0, jl = conflicts[variableName].length; j < jl; j++) {
						if (conflicts[variableName][j].variableLine === variableLine) {
							isConflictingLineKnown = true;
							break;
						}
					}

					if (isConflictingLineKnown === false) {
						conflicts[variableName].push({
							variableName: variableName,
							variableValue: variableValue,
							variableLine: variableLine
						});
					}

					hasConflicts = true;
				}
			}
		}

		if (hasConflicts === true) {
			return conflicts;
		} else {
			return null;
		}
	}

	function removeDuplicatesFromArray(array) {
		var seen = {},
			out = [],
			i = 0,
			j = 0,
			item;

		for (i = 0, il = array.length; i < il; i++) {
			item = array[i];
			if (seen[item] !== 1) {
				seen[item] = 1;
				out[j++] = item;
			}
		}
		return out;
	}

	function objectToString(object, separator, preString, postString) {
		var array = [],
			propertyName;

		separator = separator || " - ";
		preString = preString || "";
		postString = postString || "";
		for (propertyName in object) {
			if (!object.hasOwnProperty(propertyName)) continue;
			array.push(preString + propertyName + separator + object[propertyName] + postString);
		}
		return array.join("\n");
	}

	function cleanESTKconsole() {
		// https://forums.adobe.com/thread/1396184
		try {
			var bridge = new BridgeTalk();
			bridge.target = "estoolkit";
			bridge.body = function () {
				app.clc();
			}.toSource() + "()";
			bridge.send(5);
		} catch (e) {}
	}

	/********************************************************************************/



	/* STRING MANIPULATION */

	function trimSpaces(string) {
		return string.replace(/^\s+|\s+$/g, "");
	}

	function fixIndentation(inString, indentation, toTrim) {
		var outString, stringLine, stringsArray, i, il;

		if (typeof indentation === "undefined") indentation = "";
		if (typeof toTrim === "undefined") toTrim = true;

		outString = inString;
		stringsArray = outString.split("\n");

		for (i = 0, il = stringsArray.length; i < il; i++) {
			if (trimSpaces(stringsArray[i]) === "") continue;

			stringLine = (toTrim === true) ? trimSpaces(stringsArray[i]) : stringsArray[i];
			stringsArray[i] = indentation + stringLine;
		}

		outString = stringsArray.join("\n");

		return outString;
	}

	function fixTripleQuotes(string) {
		return string.replace(/"""/g, "\"");
	}

	function splitToNewLines(inString, separator) {
		var outString;

		separator = separator || ";";

		outString = inString;
		outString = outString.replace(new RegExp(separator, "g"), separator + "\n");
		outString = outString.replace(/\n\s*\n/g, "\n"); // remove double-returns

		return outString;
	}

	function charIDtoStringID(charID) {
		var stringID;
		try {
			stringID = typeIDToStringID(charIDToTypeID(charID));
			if (stringID === "") {
				stringID = null;
			}
		} catch (e) {}

		return stringID;
	}

	function fixConflictingVariableDeclarations(inString) {
		var outString,
			codeArray,
			conflicts,
			newVariableName,
			nextCodeLine,
			variable,
			variablesArray = [],
			variableDeclarationLine,
			variableDeclarationLines,
			variableName,
			variableValue,
			i, il, j, jl, p, pl, n;

		outString = inString;
		variableDeclarationLines = getVariableDeclarationLines(outString);

		if (variableDeclarationLines) {
			for (i = 0, il = variableDeclarationLines.length; i < il; i++) {
				variableDeclarationLine = variableDeclarationLines[i];

				variableName = getVariableName(variableDeclarationLine);
				variableValue = getVariableValue(variableDeclarationLine);

				variablesArray.push({
					variableName: variableName,
					variableValue: variableValue,
					variableLine: variableDeclarationLine
				});
			}
		}

		conflicts = getConflictingVariables(variablesArray);
		if (conflicts) {
			codeArray = outString.split("\n");
			for (j = 0, jl = codeArray.length; j < jl; j++) {
				for (variable in conflicts) {
					if (!conflicts.hasOwnProperty(variable)) continue;
					for (p = 0, pl = conflicts[variable].length; p < pl; p++) {
						if (codeArray[j] === conflicts[variable][p].variableLine) {
							variableName = conflicts[variable][p].variableName;
							variableLine = conflicts[variable][p].variableLine;
							newVariableName = conflicts[variable][p].newVariableName;

							if (!conflicts[variable][p].hasOwnProperty("newVariableLine")) {
								newVariableName = Incrementor.incrementVariables(variableName + "_unique_");
								conflicts[variable][p].newVariableName = newVariableName;
								conflicts[variable][p].newVariableLine = variableLine.replace(variableName, newVariableName);
							}

							codeArray[j] = conflicts[variable][p].newVariableLine;

							for (n = 0; n < 20; n++) {
								if (codeArray[j + n + 1]) {
									nextCodeLine = codeArray[j + n + 1];
									if (!/\\s?var /.test(nextCodeLine) && nextCodeLine.match(variableName)) {
										nextCodeLine = nextCodeLine.replace(variableName, newVariableName);
										codeArray[j + n + 1] = nextCodeLine;
										break;
									}
								}
							}
						}
					}
				}
			}
			outString = codeArray.join("\n");
		}
		return outString;
	}

	/********************************************************************************/



	/* FILE */

	function readFileContent(fileObj, encoding) {
		var fileContent;

		fileObj.open("r");
		fileObj.encoding = encoding || "utf-8";
		fileContent = fileObj.read();
		fileObj.close();

		return fileContent;
	}

	function writeFile(fileObj, fileContent, encoding) {
		encoding = encoding || "utf-8";
		fileObj = (fileObj instanceof File) ? fileObj : new File(fileObj);

		var parentFolder = fileObj.parent;
		if (!parentFolder.exists && !parentFolder.create())
			throw new Error("Cannot create file in path " + fileObj.fsName);

		fileObj.encoding = encoding;
		fileObj.open("w");
		fileObj.write(fileContent);
		fileObj.close();

		return fileObj;
	}

	function saveFile(fileObject, fileExtension, fileContent) {
		var filePath, newPath;

		filePath = fileObject.toString();
		if (filePath.lastIndexOf(".") < 0) {
			newPath = filePath + "." + fileExtension;
		} else {
			newPath = filePath.substr(0, filePath.lastIndexOf(".")) + "." + fileExtension;
		}

		writeFile(newPath, fileContent);
	}
})();