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
		- Give descriptive variable names
		- Convert charID to stringID for better readability
		- Replace stringIDToTypeID() to s2t() function
		- Wrap to function block.

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

	var settings = {
		hoistVariables: true,
		consolidateVariables: true,
		descriptiveNames: true,
		charIDToStringID: true,
		shortStringID: true,
		wrapToFunction: true
	};

	var script = {
		name: "Clean ScriptingListenerJS.log",
		nameShort: "Clean SL",
		version: "1.2-beta.1",
		developer: {
			name: File.decode("Tomas%20%C5%A0ink%C5%ABnas"), // Tomas Šinkūnas
			url: "http://www.rendertom.com"
		},
		getInfo: function () {
			return this.nameShort + " v" + this.version + "\n" + "Photoshop utility tool to clean " +
				"up ScriptingListenerJS log file. Script performs multiple actions such as cleaning-up " +
				"variable names and hoisting them to the top, wraps code block into function, " +
				"converts charID to string ID for better readability and such. \n\n" +
				"Resulting code is clean and maintains better readability.\n\n" +
				"Developed by " + this.developer.name + "\n" + this.developer.url;
		}
	};

	var logSeparator = "// =======================================================\n";

	var junkArray = [
		"stringIDToTypeID( \"invokeCommand\" );",
		"stringIDToTypeID( \"modalStateChanged\" );",
		"stringIDToTypeID( \"toggleSearch\" );",
		"stringIDToTypeID( \"modalHTMLPending\" );",
		"stringIDToTypeID( \"convertJSONdescriptor\" );"
	];

	var demoCode = "var idMk = charIDToTypeID( \"Mk  \" );\n" +
		"\tvar desc4 = new ActionDescriptor();\n" +
		"\tvar idNw = charIDToTypeID( \"Nw  \" );\n" +
		"\t\tvar desc5 = new ActionDescriptor();\n" +
		"\t\tvar idartboard = stringIDToTypeID( \"artboard\" );\n" +
		"\t\tdesc5.putBoolean( idartboard, false );\n" +
		"\t\tvar idMd = charIDToTypeID( \"Md  \" );\n" +
		"\t\tvar idRGBM = charIDToTypeID( \"RGBM\" );\n" +
		"\t\tdesc5.putClass( idMd, idRGBM );\n" +
		"\t\tvar idWdth = charIDToTypeID( \"Wdth\" );\n" +
		"\t\tvar idRlt = charIDToTypeID( \"#Rlt\" );\n" +
		"\t\tdesc5.putUnitDouble( idWdth, idRlt, 500.000000 );\n" +
		"\t\tvar idHght = charIDToTypeID( \"Hght\" );\n" +
		"\t\tvar idRlt = charIDToTypeID( \"#Rlt\" );\n" +
		"\t\tdesc5.putUnitDouble( idHght, idRlt, 500.000000 );\n" +
		"\t\tvar idRslt = charIDToTypeID( \"Rslt\" );\n" +
		"\t\tvar idRsl = charIDToTypeID( \"#Rsl\" );\n" +
		"\t\tdesc5.putUnitDouble( idRslt, idRsl, 72.000000 );\n" +
		"\t\tvar idpixelScaleFactor = stringIDToTypeID( \"pixelScaleFactor\" );\n" +
		"\t\tdesc5.putDouble( idpixelScaleFactor, 1.000000 );\n" +
		"\t\tvar idFl = charIDToTypeID( \"Fl  \" );\n" +
		"\t\tvar idFl = charIDToTypeID( \"Fl  \" );\n" +
		"\t\tvar idWht = charIDToTypeID( \"Wht \" );\n" +
		"\t\tdesc5.putEnumerated( idFl, idFl, idWht );\n" +
		"\t\tvar idDpth = charIDToTypeID( \"Dpth\" );\n" +
		"\t\tdesc5.putInteger( idDpth, 8 );\n" +
		"\t\tvar idprofile = stringIDToTypeID( \"profile\" );\n" +
		"\t\tdesc5.putString( idprofile, \"\"\"sRGB IEC61966-2.1\"\"\" );\n" +
		"\t\tvar idGdes = charIDToTypeID( \"Gdes\" );\n" +
		"\t\t\tvar list1 = new ActionList();\n" +
		"\t\tdesc5.putList( idGdes, list1 );\n" +
		"\tvar idDcmn = charIDToTypeID( \"Dcmn\" );\n" +
		"\tdesc4.putObject( idNw, idDcmn, desc5 );\n" +
		"\tvar idDocI = charIDToTypeID( \"DocI\" );\n" +
		"\tdesc4.putInteger( idDocI, 203 );\n" +
		"executeAction( idMk, desc4, DialogModes.NO );";

	var Incrementor = (function () {
		var storedVariables = [],
			storedFunctions = [];

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
			storedVariables = [];
		}

		function resetFunctions() {
			storedFunctions = [];
		}

		function incrementVariables(string) {
			return increment(string, storedVariables);
		}

		function incrementFunctions(string) {
			return increment(string, storedFunctions);
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

		return {
			resetVariables: resetVariables,
			resetFunctions: resetFunctions,
			incrementVariables: incrementVariables,
			incrementFunctions: incrementFunctions
		};
	})();

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

			if (settings.hoistVariables) string = hoistVariables(string);
			if (settings.consolidateVariables) string = consolidateVariables(string);
			if (settings.descriptiveNames) string = descriptiveNames(string);
			if (settings.charIDToStringID) string = convert_CharID_to_StringID(string);
			if (settings.shortStringID) string = shorten_stringIDToTypeID(string);
			if (settings.wrapToFunction) string = wrapToFunction(string);

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

	function descriptiveNames(inString) {
		var outString,
			constructorName,
			variableName,
			variableNameNew,
			variableValue,
			variableDeclarationLine,
			variableDeclarationLines = [],
			namesObject = [{
				constructorName: "ActionDescriptor",
				variableName: "descriptor"
			}, {
				constructorName: "ActionList",
				variableName: "list"
			}, {
				constructorName: "ActionReference",
				variableName: "reference"
			}, ],
			i, il, j, jl;


		outString = inString;
		variableDeclarationLines = getVariableDeclarationLines(outString);

		if (variableDeclarationLines) {
			for (i = 0, il = variableDeclarationLines.length; i < il; i++) {
				variableDeclarationLine = variableDeclarationLines[i];

				variableName = getVariableName(variableDeclarationLine);
				variableValue = getVariableValue(variableDeclarationLine);
				variableNameNew = variableName;

				for (j = 0, jl = namesObject.length; j < jl; j++) {
					if (variableValue.match(namesObject[j].constructorName)) {
						variableNameNew = namesObject[j].variableName;
						break;
					}
				}

				variableNameNew = Incrementor.incrementVariables(variableNameNew);
				outString = outString.replace(new RegExp(variableName, "g"), variableNameNew);
			}
		}

		return outString;
	}

	function convert_CharID_to_StringID(inString) {
		var outString,
			regexPattern,
			charIDWithQuotes,
			charIDWithoutQuotes,
			charIDArray = [],
			stringID,
			stringIDwithQuetes,
			i, il;


		outString = inString;
		regexPattern = "[\"|'][\\w\\s]{4}[\"|']"; // Matches any 4 characters between quotes
		charIDArray = outString.match(new RegExp(regexPattern, "g"));

		if (charIDArray) {
			for (i = 0, il = charIDArray.length; i < il; i++) {
				charIDWithQuotes = trimSpaces(charIDArray[i]);
				charIDWithoutQuotes = charIDWithQuotes.slice(1, -1);
				stringID = charIDtoStringID(charIDWithoutQuotes);
				stringIDwithQuetes = "\"" + stringID + "\"";
				outString = outString.replace(charIDWithQuotes, stringIDwithQuetes);
			}
			outString = outString.replace(/charIDToTypeID/g, "stringIDToTypeID");
		}
		return outString;
	}

	function shorten_stringIDToTypeID(inString) {
		var outString, functionDeclarationString,
			regexPattern, regexExpression;

		outString = inString;
		functionDeclarationString = "var s2t = function (s) {\n\treturn app.stringIDToTypeID(s);\n};";
		regexPattern = "stringIDToTypeID";
		regexExpression = new RegExp(regexPattern, "g");

		if (regexExpression.test(outString)) {
			outString = outString.replace(regexExpression, "s2t");
			outString = functionDeclarationString + "\n\n" + outString;
		}

		return outString;
	}

	function wrapToFunction(inString) {
		var outString,
			functionName,
			functionBlock,
			functionNameFromExecuteAction,
			executeActionLine;

		outString = inString;
		functionName = "xxx";
		executeActionLine = outString.match(/executeAction.*/);
		if (executeActionLine) {
			functionNameFromExecuteAction = executeActionLine[0].split("\"")[1];
			if (functionNameFromExecuteAction) {
				functionName = functionNameFromExecuteAction;
			}
		}

		functionName = Incrementor.incrementFunctions(functionName);
		functionBlock = functionName + "();\n" + "function " + functionName + "() {\n";
		outString = functionBlock + fixIndentation(outString, "\t", false) + "\n}";

		return outString;
	}

	function evaluateScript(codeAsString) {
		try {
			eval(codeAsString);
		} catch (e) {
			alert("Unable to evalue script.\n" + e.toString() + "\nLine: " + e.line.toString());
		}
	}

	function removeJunkCode(inString) {
		try {
			var cleanCode, cleanCodeArray = [],
				dirtyCode, dirtyCodeArray = [],
				isJunkBlock, numberJunksRemoved = 0,
				alertMessage, i, il;

			dirtyCodeArray = trimSpaces(inString).split(logSeparator);

			for (i = 0, il = dirtyCodeArray.length; i < il; i++) {
				dirtyCode = dirtyCodeArray[i];
				if (trimSpaces(dirtyCode) === "") continue;
				isJunkBlock = stringContainsArrayItems(dirtyCode, junkArray);
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
				alertMessage += "\"Junk block\" is considered a log block that contains any of these:\n\n" + junkArray.join("\n");

				if (cleanCodeArray.length === 0) {
					cleanCode = " ";
				} else {
					cleanCode = (cleanCodeArray.length === 1) ? "" : logSeparator;
					cleanCode = logSeparator + cleanCodeArray.join(logSeparator);					
				}
			}

			alert(alertMessage);

			return cleanCode;

		} catch (e) {
			alert(e.toString() + "\nLine: " + e.line.toString());
		}
	}

	/********************************************************************************/



	/* USER INTERFACE */

	function buidUI() {
		var win = new Window("dialog", script.name + " v" + script.version, undefined, {
			resizeable: true
		});
		win.preferredSize = [1100, 500];
		win.alignChildren = ["fill", "fill"];
		win.orientation = "row";


		var etInputText = win.add("edittext", undefined, "", {
			multiline: true
		});

		etInputText.onChange = etInputText.onChanging = function () {
			btnExecSource.enabled = btnCleanCode.enabled = btnRemoveJunkCode.enabled = this.text !== "";
		};

		var etOutputText = win.add("edittext", undefined, "", {
			multiline: true
		});

		etOutputText.onChange = etOutputText.onChanging = function () {
			btnSave.enabled = btnExecOutput.enabled = this.text !== "";
		};


		var grpRightColumn = win.add("group");
		grpRightColumn.orientation = "column";
		grpRightColumn.alignment = ["right", "fill"];
		grpRightColumn.alignChildren = ["fill", "top"];
		grpRightColumn.spacing = 2;

		var btnReadFullLog = grpRightColumn.add("button", undefined, "Load full log");
		btnReadFullLog.onClick = function () {
			var fullLog = getFullLog();
			if (fullLog) {
				etInputText.text = trimSpaces(fullLog);
				etInputText.onChanging();
			}
		};

		var btnReadLastLog = grpRightColumn.add("button", undefined, "Load last log entry");
		btnReadLastLog.onClick = function () {
			var lastLogEntry = getLastLogEntry();
			if (lastLogEntry) {
				etInputText.text = lastLogEntry;
				etInputText.onChanging();
			}
		};

		var btnRemoveJunkCode = grpRightColumn.add("button", undefined, "Remove Junk Code");
		btnRemoveJunkCode.helpTip = "\"Junk block\" is considered a log block that contains any of these:\n\n" + junkArray.join("\n");
		btnRemoveJunkCode.onClick = function () {
			var cleanCode = removeJunkCode(etInputText.text);
			if (cleanCode) {
				etInputText.text = trimSpaces(cleanCode);
				etInputText.onChanging();
			}
		};

		var btnExecSource = grpRightColumn.add("button", undefined, "Evaluate source");
		btnExecSource.onClick = function () {
			evaluateScript(etInputText.text);
		};

		addSpace(grpRightColumn);

		var uiCheckboxes = {
			hoistVariables: grpRightColumn.add("checkbox", undefined, "Hoist variables to the top"),
			consolidateVariables: grpRightColumn.add("checkbox", undefined, "Consolidate variables"),
			descriptiveNames: grpRightColumn.add("checkbox", undefined, "Descriptvive variable names"),
			charIDToStringID: grpRightColumn.add("checkbox", undefined, "Convert charID to stringID"),
			shortStringID: grpRightColumn.add("checkbox", undefined, "Shorten stringIDToTypeID"),
			wrapToFunction: grpRightColumn.add("checkbox", undefined, "Wrap to function block")
		};

		addSpace(grpRightColumn);

		var btnCleanCode = grpRightColumn.add("button", undefined, "Clean Code");
		btnCleanCode.onClick = function () {
			for (var propertyName in settings) {
				if (!settings.hasOwnProperty(propertyName)) continue;
				if (uiCheckboxes.hasOwnProperty(propertyName)) {
					settings[propertyName] = uiCheckboxes[propertyName].value;
				}
			}

			var finalCode = preprocess(etInputText.text);
			if (finalCode) {
				etOutputText.text = finalCode;
				etOutputText.onChanging();
			}
		};

		var btnExecOutput = grpRightColumn.add("button", undefined, "Evaluate output");
		btnExecOutput.onClick = function () {
			evaluateScript(etOutputText.text);
		};

		var btnSave = grpRightColumn.add("button", undefined, "Save output code");
		btnSave.onClick = function () {
			var pathToFile = File.saveDialog("Save output code.");
			if (pathToFile) {
				saveFile(pathToFile, "txt", etOutputText.text);
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
			btnCleanCode.size.height = btnCleanCode.size.height * 1.5;
			etInputText.text = demoCode;
			etOutputText.onChanging();
			etInputText.onChanging();

			for (var propertyName in settings) {
				if (!settings.hasOwnProperty(propertyName)) continue;
				if (uiCheckboxes.hasOwnProperty(propertyName)) {
					uiCheckboxes[propertyName].value = settings[propertyName];
				}
			}

			win.layout.layout(true);
		};

		win.center();
		win.show();

		function addSpace(groupContainer) {
			var grpSpacer = groupContainer.add("group");
			grpSpacer.preferredSize.height = 20;
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

	function splitToNewLines(inString, separator) {
		var outString;

		separator = separator || ";";

		outString = inString;
		outString = outString.replace(new RegExp(separator, "g"), separator + "\n");
		outString = outString.replace(/\n\s*\n/g, "\n"); // remove double-returns

		return outString;
	}

	function charIDtoStringID(charID) {
		try {
			return typeIDToStringID(charIDToTypeID(charID));
		} catch (e) {
			alert("Unable to convert \"" + charID + "\" to StringID\n" + e.toString() + "\nLine: " + e.line.toString() + "\n" + charID);
			return charID;
		}
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

	function saveFile(fileObject, fileExtension, fileContents) {
		var filePath, newPath;

		filePath = fileObject.toString();
		if (filePath.lastIndexOf(".") < 0) {
			newPath = filePath + "." + fileExtension;
		} else {
			newPath = filePath.substr(0, filePath.lastIndexOf(".")) + "." + fileExtension;
		}

		fileObject = File(newPath);
		fileObject.open("W");
		fileObject.encoding = "utf-8";
		fileObject.write(fileContents);
		fileObject.close();
	}
})();