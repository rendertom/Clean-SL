![Clean SL](Clean%20SL.png)

# Clean SL #

Clean SL (Clean ScriptingListenerJS.log) is a utility tool for Adobe Photoshop to clean up ScriptingListenerJS.log file. 

Script performs multiple actions such as cleaning-up variable names and hoisting them to the top, wraps code block into function, converts charID to string ID and such. Resulting code is clean and maintains better readability.

### Features ###

* Load entire ScriptingListenerJS.log content
* Load only last entry in ScriptingListenerJS.log
* Enter ScriptingListenerJS code manually

### Options ###

* Hoist variable declaration to the top
* Consolidate variables
* Give descriptive variable names
* Convert charID to stringID for better readability
* Replace stringIDToTypeID() to s2t() function
* Wrap to function block
* Extract parameter values
* Close Clean SL window before evaluating code
* Save UI data on script quit.

### Example ###

From this:

```javascript
var idMk = charIDToTypeID( "Mk  " );
    var desc4 = new ActionDescriptor();
    var idNw = charIDToTypeID( "Nw  " );
        var desc5 = new ActionDescriptor();
        var idartboard = stringIDToTypeID( "artboard" );
        desc5.putBoolean( idartboard, false );
        var idMd = charIDToTypeID( "Md  " );
        var idRGBM = charIDToTypeID( "RGBM" );
        desc5.putClass( idMd, idRGBM );
        var idWdth = charIDToTypeID( "Wdth" );
        var idRlt = charIDToTypeID( "#Rlt" );
        desc5.putUnitDouble( idWdth, idRlt, 1000.000000 );
        var idHght = charIDToTypeID( "Hght" );
        var idRlt = charIDToTypeID( "#Rlt" );
        desc5.putUnitDouble( idHght, idRlt, 1000.000000 );
        var idRslt = charIDToTypeID( "Rslt" );
        var idRsl = charIDToTypeID( "#Rsl" );
        desc5.putUnitDouble( idRslt, idRsl, 72.000000 );
        var idpixelScaleFactor = stringIDToTypeID( "pixelScaleFactor" );
        desc5.putDouble( idpixelScaleFactor, 1.000000 );
        var idFl = charIDToTypeID( "Fl  " );
        var idFl = charIDToTypeID( "Fl  " );
        var idWht = charIDToTypeID( "Wht " );
        desc5.putEnumerated( idFl, idFl, idWht );
        var idDpth = charIDToTypeID( "Dpth" );
        desc5.putInteger( idDpth, 8 );
        var idprofile = stringIDToTypeID( "profile" );
        desc5.putString( idprofile, """sRGB IEC61966-2.1""" );
        var idGdes = charIDToTypeID( "Gdes" );
            var list1 = new ActionList();
        desc5.putList( idGdes, list1 );
    var idDcmn = charIDToTypeID( "Dcmn" );
    desc4.putObject( idNw, idDcmn, desc5 );
    var idDocI = charIDToTypeID( "DocI" );
    desc4.putInteger( idDocI, 195 );
executeAction( idMk, desc4, DialogModes.NO );
```

To this:

```javascript
make(false, 1000, 1000, 72, 1, 8);
function make(artboard, width, height, resolution, pixelScaleFactor, depth) {
    var s2t = function (s) {
        return app.stringIDToTypeID(s);
    };

    var descriptor = new ActionDescriptor();
    var descriptor2 = new ActionDescriptor();
    var list = new ActionList();

    descriptor2.putBoolean( s2t( "artboard" ), artboard );
    descriptor2.putClass( s2t( "mode" ), s2t( "RGBColorMode" ));
    descriptor2.putUnitDouble( s2t( "width" ), s2t( "distanceUnit" ), width );
    descriptor2.putUnitDouble( s2t( "height" ), s2t( "distanceUnit" ), height );
    descriptor2.putUnitDouble( s2t( "resolution" ), s2t( "densityUnit" ), resolution );
    descriptor2.putDouble( s2t( "pixelScaleFactor" ), pixelScaleFactor );
    descriptor2.putEnumerated( s2t( "fill" ), s2t( "fill" ), s2t( "white" ));
    descriptor2.putInteger( s2t( "depth" ), depth );
    descriptor2.putString( s2t( "profile" ), "sRGB IEC61966-2.1" );
    descriptor2.putList( s2t( "guides" ), list );
    descriptor.putObject( s2t( "new" ), s2t( "document" ), descriptor2 );
    descriptor.putInteger( s2t( "documentID" ), 195 );
    executeAction( s2t( "make" ), descriptor, DialogModes.NO );
}
```

### Change log ###

* v1.4 - 2018 03 29 :
  * Adds option to extract parameter values;
* v1.3.1 - 2017 09 13 :
  * Skips converting CharID to StringID if CharID does not have corresponding StringID;
  * Validates function and variable names against reserved JS words.
* v1.3 - 2017 09 12 : _Please remove old Clean SL Settings.txt file before using this update_
  * Renames "Descriptive variable name" to "Rename constructors"
  * Renames "Shorten stringIDToTypeID" to "Shorten method names"
  * Exposes "predefined" object with variables for user to change in code
  * Removes duplicate variable declarations and sorts them alphabetically when hoisting
  * "Shorten method names" shortens both charIDToTypeID() and stringIDToTypeID()
  * Skips converting charIDtoStringID() if CharID has conflicting StringID values
  * Parses variable declarations to check if same variable has different values
* v1.2 - 2017 09 10 :
  * Adds option to remove Action Managers junk code
  * Adds option to close Clean SL script before evaluating code
  * Adds option to save UI data on script quit
  * Fixes invalid function names
  * Replaces three quotes with one quote
  * Uses external JSON object to read/write UI data
  * Saves output code as JSX instead of TXT
  * Adds tooltips everywhere
  * Removes start-up demo code
  * Removes duplicate functions
* v1.1 - 2017 09 08 - Increments function names when processing multiple logs
* v1 - 2017 09 07 - Initial release

### Installation ###

Clone or download this repository and place **Clean SJ.jsx** script to Photoshop’s Scripts folder:

```Adobe Photoshop CC 20XX -> Presets -> Scripts -> **Clean JS.jsx**```

Restart Photoshop to access **Clean JS** script from File -> Scripts

---------
Developed by Tomas Šinkūnas 

www.rendertom.com

---------

Released as open-source under the MIT license:

The MIT License (MIT)

Copyright (c) 2018 Tomas Šinkūnas www.renderTom.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.