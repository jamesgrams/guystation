// https://github.com/hrydgard/ppsspp/blob/aa927e0681ed76fec3b540218981a2c407a78e47/ext/native/input/keycodes.h

// map from js key code to ppsspp number
let ppssppMap = {
    32: 62, // space
    222: 75, // single quote
    188: 159, // comma
    189: 69, // minus
    190: 56, //period
    192: 76, // slash
    48: 7, // 0-9
    49: 8,
    50: 9,
    51: 10,
    52: 11,
    53: 12,
    54: 13,
    55: 14,
    56: 15,
    57: 16,
    186: 74, // semicolon
    187: 70, // equal
    219: 71, // open bracket
    220: 73, // backslash
    221: 72, // close bracket
    65: 29, // a-z
    66: 30,
    67: 31,
    68: 32,
    69: 33,
    70: 34,
    71: 35,
    72: 36,
    73: 37,
    74: 38,
    75: 39,
    76: 40,
    77: 41,
    78: 42,
    79: 43,
    80: 44,
    81: 45,
    82: 46,
    83: 47,
    84: 48,
    85: 49,
    86: 50,
    87: 51,
    88: 52,
    89: 53,
    90: 54,
    8: 4, // backspace
    9: 61, // tab
    13: 66, // enter
    19: 127, // pause
    145: 116, // scroll lock
    27: 111, // escape    
    36: 3, // home
    37: 21, // left
    38: 19, // up
    39: 22, // right
    40: 20, // down
    33: 92, // page up
    34: 93, // page down
    35: 123, // end
    45: 124, // insert
    96: 144, // numpad 0-9
    97: 145,
    98: 146,
    99: 147,
    100: 148,
    101: 149,
    102: 150,
    103: 151,
    104: 152,
    105: 153,
    112: 131, // f 1-12
    113: 132,
    114: 133,
    115: 134,
    116: 135,
    117: 136,
    118: 137,
    119: 138,
    120: 139,
    121: 140,
    122: 141,
    123: 142,
    16: 59, // shift = left shift
    // "shift_r": 60,
    17: 113, // control = left control
    //"control_r": 114,
    20: 115, // caps lock
    91: 117, // meta (cmd/windows) = left meta
    //"meta_r": 118,
    18: 57, // alt = left alt
    //"alt_r": 58,
    46: 67, // delete
    
};
// PPSSPP uses keycodes for buttons too
// we'll put in this array, since they aren't real js keycodes
// https://docs.rs/sdl2-sys/0.32.6/sdl2_sys/enum.SDL_GameControllerButton.html - sdl uses enum for this class, so 0 == SDL_CONTROLLER_BUTTON_A == NKCODE_BUTTON_2 (according to link below)
// https://github.com/hrydgard/ppsspp/blob/aa927e0681ed76fec3b540218981a2c407a78e47/SDL/SDLJoystick.cpp#L101
// https://github.com/hrydgard/ppsspp/blob/aa927e0681ed76fec3b540218981a2c407a78e47/ext/native/input/keycodes.h
// go from sdl to ppsspp
let ppssppButtonMap = {
    "a": 189, // BUTTON_A -> NKCODE_2
    "b": 190, // BUTTON_B -> NKCODE_3
    "x": 191, // BUTTON_X -> NKCODE_4
    "y": 188, // BUTTON_Y -> NKCODE_1
    "back": 196, // BUTTON_BACK (select) -> NKCODE_9
    "guide": 4, // BUTTON_GUIDE -> NKCODE_BACK
    "start": 197, // BUTTON_START -> NKCODE_BUTTON_10
    "leftstick": 106, // BUTTON_LEFTSTICK -> NKCODE_BUTTON_THUMBL
    "rightstick": 107, // BUTTON_RIGHTSTICK -> NKCODE_BUTTON_THUMBR
    "leftshoulder": 193, // BUTTON_LEFTSHOULDER -> NKCODE_BUTTON_6
    "rightshoulder": 194, // BUTTON_RIGHTSHOULDER -> NKCODE_BUTTON_7
    "dpup": 19, // SDL_CONTROLLER_BUTTON_DPAD_UP -> NKCODE_DPAD_UP
    "dpdown": 20, // SDL_CONTROLLER_BUTTON_DPAD_DOWN -> NKCODE_DPAD_DOWN
    "dpleft": 21, // SDL_CONTROLLER_BUTTON_DPAD_LEFT -> NKCODE_DPAD_LEFT
    "dpright": 22, // SDL_CONTROLLER_BUTTON_DPAD_RIGHT -> NKCODE_DPAD_RIGHT

    "lefttrigger": 4008, // if we try to map a button that is a button on our controller, but considered a trigger by the sdl standardized controller
    "righttrigger": 4010, // these two are derived from experimentation,
    // we also have to map axis as the axis on the controller might not map to the sdl controller axis nums
    // left x is the left stick's x axis
    "leftx": 4000, // for negative, it is 4001
    "lefty": 4002,
    "rightx": 4004,
    "righty": 4006
};
// With PPSSPP, you don't map controller button numbers to PSP controls.
// You map controller button NAMES to PSP controls. What each number's name is depends on the controller.
// So where usually you just need a button number to map, with PPSSPP you need a button number and which
// controller it is.

// The JS Gamepad API will only give us vendor and product code
// These make up a portion of the SDL GUID (see here: http://bazaar.launchpad.net/~taktaktaktaktaktaktaktaktaktak/+junk/joystickguid/view/head:/joystickguid.rb)
// So keys are just the portion based on the vendor and product code, seperated by a dash instead of four zeros
// We had to remove some duplicates that wouldn't be duplicates if we had other info like bus types
// But this should help us to maintain the functionality PPSSPP has built in to map button names to psp buttons
// rather than just button numbers - to try to make it easier to switch between controllers.
// I removed Gamestop Gamepad and Xbox Gamepad (userspace driver) too because that format didn't make sense.
// Based on the linux list here: https://github.com/hrydgard/ppsspp/blob/f2bfaeb8740d2aba548138c4d9b77932199cc7cf/assets/gamecontrollerdb.txt
// I had to remove some duplicate keys in the maps too and just preferred the first ones
// We wouldn't need all this if we emptied the controller database to just have the generic controller
// in that case, we'd always know how to get the NKCODE just from a controller button (we map NKCODEs to psp buttons)
// but we are trying to keep PPSSPP's nice functions which translate across controllers
// the first one is default: https://github.com/hrydgard/ppsspp/blob/aa927e0681ed76fec3b540218981a2c407a78e47/SDL/SDLJoystick.cpp#L60

let ppssppControllerMap = {
    "default": {
        "3": "x",
        "0": "a",
        "1": "b",
        "2": "y",
        "8": "back",
        "10": "guide",
        "9": "start",
        "15": "dpleft",
        "14": "dpdown",
        "16": "dpright",
        "13": "dpup",
        "4": "leftshoulder",
        "a2": "lefttrigger",
        "6": "rightshoulder",
        "a5": "righttrigger",
        "7": "leftstick",
        "12": "rightstick",
        "a0": "leftx",
        "a1": "lefty",
        "a3": "rightx",
        "a4": "righty"
    }
};

// the database is downloaded with ppsspp, so we can actually just parse that
function generateControllerMap( controllerDbLocation ) {
    let dbContents = fs.readFileSync( controllerDbLocation ).toString();
    let dbLines = dbContents.split("\n");
    for( let line of dbLines ) {
        if( line.match(/platform:Linux/) ) {
            let lineParts = line.split(",");
            let guid = lineParts[0];
            let guidPortion = guid.match(/[a-f\d]{8}([a-f\d]{4})0000([a-f\d]{4})0000[a-f\d]{8}/);
            if( guidPortion ) {
                let guidKey = guidPortion[1] + "-" + guidPortion[2];
                // do not allow for duplicates
                if( !ppssppControllerMap[guidKey] ) {
                    // parse out the data
                    let controllerMap = {};
                    for( let part of lineParts ) {
                        // get the controls
                        if( part.contains(":") && !part.contains("platform") ) {
                            let partPair = part.split(":");
                            let pspButton = partPair[0];
                            let userButton = partPair[1];
                            userButton = userButton.replace("b",""); // don't need to denote button - implied
                            // don't allow duplcate keys - take the first one
                            if( !controllerMap[userButton] ) {
                                controllerMap[userButton] = pspButton;
                            }
                        }
                    }
                    ppssppControllerMap[guidKey] = controllerMap;
                }
            }
        }
    }
    return ppssppControllerMap;
}

module.exports = {
    "keys": ppssppMap,
    "buttons": ppssppButtonMap,
    "generateControllerMap": generateControllerMap
}