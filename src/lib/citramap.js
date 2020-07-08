// Citra has a custom map for hotkeys

// map from js key code to qt number
let citraMap = {
    32: "Space", // space
    222: "'", // single quote
    188: ",", // comma
    189: "-", // minus
    190: ".", //period
    191: "/", // slash
    192: "`", // backtick/tilde
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
    186: ";", // semicolon
    187: "=", // equal
    219: "[", // open bracket
    220: "\\", // backslash
    221: "]", // close bracket
    65: "A", // a-z
    66: "B",
    67: "C",
    68: "D",
    69: "E",
    70: "F",
    71: "G",
    72: "H",
    73: "I",
    74: "J",
    75: "K",
    76: "L",
    77: "M",
    78: "N",
    79: "O",
    80: "P",
    81: "Q",
    82: "R",
    83: "S",
    84: "T",
    85: "U",
    86: "V",
    87: "W",
    88: "X",
    89: "Y",
    90: "Z",
    8: "Backspace", // backspace
    9: "Tab", // tab
    13: "Return", // enter
    19: "Pause", // pause
    145: "ScrollLock", // scroll lock
    27: "Esc", // escape    
    36: "Home", // home
    37: "Left", // left
    38: "Up", // up
    39: "Right", // right
    40: "Down", // down
    33: "PgUp", // page up
    34: "PgDown", // page down
    35: "End", // end
    45: "Ins", // insert
    96: "0", // numpad 0-9
    97: "1",
    98: "2",
    99: "3",
    100: "4",
    101: "5",
    102: "6",
    103: "7",
    104: "8",
    105: "9",
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
    16: "", // shift = left shift
    // "shift_r": 0x01000020,
    17: "", // control = left control
    //"control_r": 0x01000021,
    20: "CapsLock", // caps lock
    91: "", // meta (cmd/windows) = left meta
    //"meta_r": 0x01000022,
    18: "", // alt = left alt
    //"alt_r": 0x01000023,
    46: "Del" // delete
};
module.exports = citraMap;