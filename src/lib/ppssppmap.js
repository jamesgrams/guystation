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
    0: 189, // BUTTON_A -> NKCODE_2
    1: 190, // BUTTON_B -> NKCODE_3
    2: 191, // BUTTON_X -> NKCODE_4
    3: 188, // BUTTON_Y -> NKCODE_1
    4: 196, // BUTTON_BACK (select) -> NKCODE_9
    5: 4, // BUTTON_GUIDE -> NKCODE_BACK
    6: 197, // BUTTON_START -> NKCODE_BUTTON_10
    7: 106, // BUTTON_LEFTSTICK -> NKCODE_BUTTON_THUMBL
    8: 107, // BUTTON_RIGHTSTICK -> NKCODE_BUTTON_THUMBR
    9: 193, // BUTTON_LEFTSHOULDER -> NKCODE_BUTTON_6
    10: 194, // BUTTON_RIGHTSHOULDER -> NKCODE_BUTTON_7
    11: 19, // SDL_CONTROLLER_BUTTON_DPAD_UP -> NKCODE_DPAD_UP
    12: 20, // SDL_CONTROLLER_BUTTON_DPAD_DOWN -> NKCODE_DPAD_DOWN
    13: 21, // SDL_CONTROLLER_BUTTON_DPAD_LEFT -> NKCODE_DPAD_LEFT
    14: 22, // SDL_CONTROLLER_BUTTON_DPAD_RIGHT -> NKCODE_DPAD_RIGHT
};
module.exports = {
    "keys": ppssppMap,
    "buttons": ppssppButtonMap
}