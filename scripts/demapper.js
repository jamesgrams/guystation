/**
 * Script to generate the demapper maps to get the proper buttons and axes for controllers.
 * Run this script in the guystation directory and not in any subfolders.
 */

const axios = require('axios');
const fs = require("fs");

const GAMEPAD_STANDARD_MAPPINGS_URL = 'https://raw.githubusercontent.com/chromium/chromium/master/device/gamepad/gamepad_standard_mappings.h';
const GAMEPAD_STANDARD_MAPPINGS_LINUX_URL = 'https://raw.githubusercontent.com/chromium/chromium/master/device/gamepad/gamepad_standard_mappings_linux.cc';
const GAMEPAD_ID_LIST_URL = 'https://raw.githubusercontent.com/chromium/chromium/master/device/gamepad/gamepad_id_list.cc';
const GAMEPAD_ID_LIST_HEADER_URL = 'https://raw.githubusercontent.com/chromium/chromium/master/device/gamepad/gamepad_id_list.h';

async function run() {

    let standardMappings = (await axios.get( GAMEPAD_STANDARD_MAPPINGS_URL )).data;
    let standardMappingsLinux = (await axios.get( GAMEPAD_STANDARD_MAPPINGS_LINUX_URL )).data;
    let idList = (await axios.get( GAMEPAD_ID_LIST_URL )).data;
    let idListHeader = (await axios.get( GAMEPAD_ID_LIST_HEADER_URL )).data;

    // Get the button and axis constants so we can determine the number that chrome has set them to.
    let buttonIndexes = standardMappings.match(/CanonicalButtonIndex {([^}]+)}/)[1].replace(/\s/g,"").split(","); // These are enums in the c++ code
    let axisIndexes = standardMappings.match(/CanonicalAxisIndex {([^}]+)}/)[1].replace(/\s/g,"").split(",");

    // Get all the functions that define the mapping from their default buttons that SDL uses to what chrome makes them for the "standard" gamepad API mapping
    // Each function contains a button map
    let mapperFunctions = Array.from( standardMappingsLinux.matchAll(/void (Mapper[^\(]+)[^{]+{\n((?:\s+.*\n)+)}/g) );
    let mapperKeys = mapperFunctions.map( el => el[1] );
    let mapperBodies = mapperFunctions.map( el => el[2] );

    let types = {};
    // create the map of types (mapping functions) to maps of buttons to their original buttons
    for( let i=0; i<mapperKeys.length; i++ ) {
        let mapperKey = mapperKeys[i];
        let mapperBody = mapperBodies[i];

        let buttonsMap = {};
        let buttonMatches = Array.from( mapperBody.matchAll(/mapped->(?:buttons|axes)\[([^\]]+)\]\s*=\s*([^;]+)/g) );
        let extraCount = -1; // sometimes we have some extra buttons defined in enums for specific controllers, so just get that. start with -1 since the last value is button index count which is what gets replaced.
        for( let buttonMatch of buttonMatches ) {
            let key = buttonMatch[1];

            let isButton = true;
            // get the enum value
            // need these seperate so we can get the values that are set in enums before doing button and axis logic
            if( buttonIndexes.indexOf(key) != -1 ) {
                key = buttonIndexes.indexOf(key);
            }
            else if( axisIndexes.indexOf(key) != -1 ) {
                key = axisIndexes.indexOf(key);
                isButton = false;
            }
            else {
                key = buttonIndexes.length + extraCount;
                extraCount++;
            }

            // this is a button
            if( isButton ) {
                key = 'button(' + key + ')';

                let value = buttonMatch[2];
                // the only functions used are axis to button, axis positive as button, and axis negative as button
                value = value.replace(/(?:AxisPositiveAsButton|AxisToButton)\(([^\)]+)\)/, "$1+");
                value = value.replace(/AxisNegativeAsButton\(([^\)]+)\)/, "$1-");
                value = value.replace(/input.buttons\[(\d+)\](\+|-)?/, "button($1$2)");
                value = value.replace(/input.axes\[(\d+)\](\+|-)?/, "axis($1$2)");
                value = value.replace("NullButton()","");
                buttonsMap[key] = value;
            }
            // this is an axis
            else {
                let keyPositive = 'axis(' + key + '+)';
                let keyNegative = 'axis(' + key + '-)';

                let value = buttonMatch[2];
                buttonsMap[keyPositive] = value.replace(/input.axes\[(\d+)\]/, "axis($1+)");
                buttonsMap[keyNegative] = value.replace(/input.axes\[(\d+)\]/, "axis($1-)");
            }
        }
        types[mapperKey] = buttonsMap;
    }

    // we have the map of types, not we need to get the map of controllers to types

    let controllers = {};
    let customMappingDataLinux = Array.from(standardMappingsLinux.matchAll(/{GamepadId::([^,]+),\s*([^}]+)}/g));
    let customMappingDataLinkMap = {};
    customMappingDataLinux.forEach( el => customMappingDataLinkMap[el[1]] = el[2] ); // this is a map from the k names to the mappers
    let kNames = Array.from(idListHeader.matchAll(/(k[^\s=]+)\s*=\s*0x([^,]{4})([^,]{4})/g));
    let kNamesMap = {};
    kNames.forEach( el => kNamesMap[el[2] + "-" + el[3]] = el[1] ); // this is a map from <vendor>-<device> to k names

    let controllerMatches = Array.from(idList.matchAll(/{0x([^,]{4}),\s*0x([^,]{4}),\s*([^}]+)}/g));
    for( let controllerMatch of controllerMatches ) {
        let vendor = controllerMatch[1];
        let device = controllerMatch[2];
        let type = controllerMatch[3];

        // check for type overrides HERE
        let kName = kNamesMap[vendor + "-" + device];
        if( kName ) {
            let customMap = customMappingDataLinkMap[kName];
            if( customMap ) type = customMap;
        }

        if( type == "kXInputTypeXbox360" || type == "kXInputTypeXboxOne" ) type = "MapperXInputStyleGamepad";
        if( type == "kXInputTypeNone" || type == "kXInputTypeXbox" ) continue; // I don't see any logic to return mappings for controllers listed as Xbox controllers

        controllers[vendor + "-" + device] = type;
    }

    let writeString = "var demapperTypes = " + JSON.stringify(types) + "; \n\n var demapperControllers = " + JSON.stringify(controllers) + ";";
    fs.writeFileSync("assets/demapper.js", writeString);
}

run();