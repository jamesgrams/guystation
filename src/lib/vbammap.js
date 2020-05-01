// map from js key code to vbam code
let vbamMap = {
    32: "SPACE", // space
    222: "'", // single quote
    188: ",", // comma
    189: "-", // minus
    190: ".", //period
    192: "/", // slash
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
    8: "BACK", // backspace
    9: "TAB", // tab
    13: "ENTER", // enter
    19: "", // pause
    145: "", // scroll lock
    27: "ESCAPE", // escape    
    36: "HOME", // home
    37: "LEFT", // left
    38: "UP", // up
    39: "RIGHT", // right
    40: "DOWN", // down
    33: "PAGEUP", // page up
    34: "PAGEDOWN", // page down
    35: "END", // end
    45: "INSERT", // insert
    96: "", // numpad 0-9
    97: "",
    98: "",
    99: "",
    100: "",
    101: "",
    102: "",
    103: "",
    104: "",
    105: "",
    112: "", // f 1-12
    113: "",
    114: "",
    115: "",
    116: "",
    117: "",
    118: "",
    119: "",
    120: "",
    121: "",
    122: "",
    123: "",
    16: "SHIFT", // shift = left shift
    // "shift_r": 303,
    17: "CTRL", // control = left control
    //"control_r": 305,
    20: "", // caps lock
    91: "", // meta (cmd/windows) = left meta
    //"meta_r": 309,
    18: "ALT", // alt = left alt
    //"alt_r": 307,
    46: "DELETE" // delete
};
module.exports = vbamMap;