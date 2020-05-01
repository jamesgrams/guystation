// https://github.com/citra-emu/citra/issues/4243#issuecomment-425524345
// Citra uses QT keycodes
// https://doc.qt.io/qt-5/qt.html#Key-enum

// map from js key code to qt number
let qtMap = {
    32: 0x20, // space
    222: 0x27, // single quote
    188: 0x2c, // comma
    189: 0x2d, // minus
    190: 0x2e, //period
    192: 0x2f, // slash
    48: 0x30, // 0-9
    49: 0x31,
    50: 0x32,
    51: 0x33,
    52: 0x34,
    53: 0x35,
    54: 0x36,
    55: 0x37,
    56: 0x38,
    57: 0x39,
    186: 0x3b, // semicolon
    187: 0x3d, // equal
    219: 0x5b, // open bracket
    220: 0x5c, // backslash
    221: 0x5d, // close bracket
    65: 0x41, // a-z
    66: 0x42,
    67: 0x43,
    68: 0x44,
    69: 0x45,
    70: 0x46,
    71: 0x47,
    72: 0x48,
    73: 0x49,
    74: 0x4a,
    75: 0x4b,
    76: 0x4c,
    77: 0x4d,
    78: 0x4e,
    79: 0x4f,
    80: 0x50,
    81: 0x51,
    82: 0x52,
    83: 0x53,
    84: 0x54,
    85: 0x55,
    86: 0x56,
    87: 0x57,
    88: 0x58,
    89: 0x59,
    90: 0x5a,
    8: 0x01000003, // backspace
    9: 0x01000001, // tab
    13: 0x01000005, // enter
    19: 0x01000008, // pause
    145: 0x01000026, // scroll lock
    27: 0x01000000, // escape    
    36: 0x01000010, // home
    37: 0x01000012, // left
    38: 0x01000013, // up
    39: 0x01000014, // right
    40: 0x01000015, // down
    33: 0x01000016, // page up
    34: 0x01000017, // page down
    35: 0x01000011, // end
    45: 0x01000006, // insert
    96: 0x30, // numpad 0-9
    97: 0x31,
    98: 0x32,
    99: 0x33,
    100: 0x34,
    101: 0x35,
    102: 0x36,
    103: 0x37,
    104: 0x38,
    105: 0x39,
    112: 0x01000030, // f 1-12
    113: 0x01000031,
    114: 0x01000032,
    115: 0x01000033,
    116: 0x01000034,
    117: 0x01000035,
    118: 0x01000036,
    119: 0x01000037,
    120: 0x01000038,
    121: 0x01000039,
    122: 0x0100003a,
    123: 0x0100003b,
    16: 0x01000020, // shift = left shift
    // "shift_r": 0x01000020,
    17: 0x01000021, // control = left control
    //"control_r": 0x01000021,
    20: 0x01000024, // caps lock
    91: 0x01000022, // meta (cmd/windows) = left meta
    //"meta_r": 0x01000022,
    18: 0x01000023, // alt = left alt
    //"alt_r": 0x01000023,
    46: 0x01000007 // delete
};
module.exports = qtMap;