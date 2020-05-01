// https://www.libsdl.org/release/SDL-1.2.15/include/SDL_keysym.h

// map from js key code to sdl number
let sdlMap = {
    32: 32, // space
    222: 39, // single quote
    188: 44, // comma
    189: 45, // minus
    190: 46, //period
    192: 47, // slash
    48: 48, // 0-9
    49: 49,
    50: 50,
    51: 51,
    52: 52,
    53: 53,
    54: 54,
    55: 55,
    56: 56,
    57: 57,
    186: 59, // semicolon
    187: 61, // equal
    219: 91, // open bracket
    220: 92, // backslash
    221: 93, // close bracket
    65: 97, // a-z
    66: 98,
    67: 99,
    68: 100,
    69: 101,
    70: 102,
    71: 103,
    72: 104,
    73: 105,
    74: 106,
    75: 107,
    76: 108,
    77: 109,
    78: 110,
    79: 111,
    80: 112,
    81: 113,
    82: 114,
    83: 115,
    84: 116,
    85: 117,
    86: 118,
    87: 119,
    88: 120,
    89: 121,
    90: 122,
    8: 8, // backspace
    9: 9, // tab
    13: 13, // enter
    19: 19, // pause
    145: 302, // scroll lock
    27: 27, // escape    
    36: 278, // home
    37: 276, // left
    38: 273, // up
    39: 275, // right
    40: 274, // down
    33: 280, // page up
    34: 281, // page down
    35: 279, // end
    45: 277, // insert
    96: 256, // numpad 0-9
    97: 257,
    98: 258,
    99: 259,
    100: 260,
    101: 261,
    102: 262,
    103: 263,
    104: 264,
    105: 265,
    112: 282, // f 1-12
    113: 283,
    114: 284,
    115: 285,
    116: 286,
    117: 287,
    118: 288,
    119: 289,
    120: 290,
    121: 291,
    122: 292,
    123: 293,
    16: 304, // shift = left shift
    // "shift_r": 303,
    17: 306, // control = left control
    //"control_r": 305,
    20: 301, // caps lock
    91: 310, // meta (cmd/windows) = left meta
    //"meta_r": 309,
    18: 308, // alt = left alt
    //"alt_r": 307,
    46: 127 // delete
};
module.exports = sdlMap;