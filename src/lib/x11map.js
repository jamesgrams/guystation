// https://github.com/snes9xgit/snes9x/blob/dfaae046701d0cffeeb2c667e949e98a46889d64/docs/control-inputs.txt#L53
// https://tronche.com/gui/x/xlib/utilities/keyboard/XStringToKeysym.html
// https://github.com/D-Programming-Deimos/libX11/blob/master/c/X11/keysymdef.h

// map from js keycode to x11 key name
let x11Map = {
    32: "space", // space
    222: "apostrophe", // single quote
    188: "comma", // comma
    189: "minus", // minus
    190: "period", //period
    192: "slash", // slash
    48: "0", // 0-9
    49: "1",
    50: "2",
    51: "3",
    52: "4",
    53: "5",
    54: "6",
    55: "7",
    56: "8",
    57: "9",
    186: "semicolon", // semicolon
    187: "equal", // equal
    219: "bracketleft", // open bracket
    220: "backslash", // backslash
    221: "bracketright", // close bracket
    65: "a", // a-z
    66: "b",
    67: "c",
    68: "d",
    69: "e",
    70: "f",
    71: "g",
    72: "h",
    73: "i",
    74: "j",
    75: "k",
    76: "l",
    77: "m",
    78: "n",
    79: "o",
    80: "p",
    81: "q",
    82: "r",
    83: "s",
    84: "t",
    85: "u",
    86: "v",
    87: "w",
    88: "x",
    89: "y",
    90: "z",
    8: "BackSpace", // backspace
    9: "Tab", // tab
    13: "Return", // enter
    19: "Pause", // pause
    145: "Scroll_Lock", // scroll lock
    27: "Escape", // escape    
    36: "Home", // home
    37: "Left", // left
    38: "Up", // up
    39: "Right", // right
    40: "Down", // down
    33: "Page_Up", // page up
    34: "Page_Down", // page down
    35: "End", // end
    45: "Insert", // insert
    96: "KP_0", // numpad 0-9
    97: "KP_1",
    98: "KP_2",
    99: "KP_3",
    100: "KP_4",
    101: "KP_5",
    102: "KP_6",
    103: "KP_7",
    104: "KP_8",
    105: "KP_9",
    112: "F1", // f 1-12
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    16: "Shift_L", // shift = left shift
    // "shift_r": "Shift_R",
    17: "Control_L", // control = left control
    //"control_r": "Control_R",
    20: "Caps_Lock", // caps lock
    91: "Meta_L", // meta (cmd/windows) = left meta
    //"meta_r": "Meta_R",
    18: "Alt_L", // alt = left alt
    //"alt_r": "Alt_R",
    46: "Delete" // delete
};
module.exports = x11Map;