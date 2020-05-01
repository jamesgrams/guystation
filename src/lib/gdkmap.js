// https://github.com/TASVideos/desmume/blob/23f4dcc0094e9dcb77494593831b6aef9aaf3b5b/desmume/src/frontend/posix/gtk-glade/keyval_names.cpp

// map from js key code to gdk number
let gdkMap = {
    32: 0x0020, // space
    222: 0x0027, // single quote
    188: 0x002c, // comma
    189: 0x002d, // minus
    190: 0x002e, //period
    192: 0x002f, // slash
    48: 0x0030, // 0-9
    49: 0x0031,
    50: 0x0032,
    51: 0x0033,
    52: 0x0034,
    53: 0x0035,
    54: 0x0036,
    55: 0x0037,
    56: 0x0038,
    57: 0x0039,
    186: 0x003b, // semicolon
    187: 0x003d, // equal
    219: 0x005b, // open bracket
    220: 0x005c, // backslash
    221: 0x005d, // close bracket
    65: 0x0061, // a-z
    66: 0x0062,
    67: 0x0063,
    68: 0x0064,
    69: 0x0065,
    70: 0x0066,
    71: 0x0067,
    72: 0x0068,
    73: 0x0069,
    74: 0x006a,
    75: 0x006b,
    76: 0x006c,
    77: 0x006d,
    78: 0x006e,
    79: 0x006f,
    80: 0x0070,
    81: 0x0071,
    82: 0x0072,
    83: 0x0073,
    84: 0x0074,
    85: 0x0075,
    86: 0x0076,
    87: 0x0077,
    88: 0x0078,
    89: 0x0079,
    90: 0x007a,
    8: 0xff08, // backspace
    9: 0xff09, // tab
    13: 0xff0d, // enter
    19: 0xff13, // pause
    145: 0xff14, // scroll lock
    27: 0xff1b, // escape    
    36: 0xff50, // home
    37: 0xff51, // left
    38: 0xff52, // up
    39: 0xff53, // right
    40: 0xff54, // down
    33: 0xff55, // page up
    34: 0xff56, // page down
    35: 0xff57, // end
    45: 0xff63, // insert
    96: 0xffb0, // numpad 0-9
    97: 0xffb1,
    98: 0xffb2,
    99: 0xffb3,
    100: 0xffb4,
    101: 0xffb5,
    102: 0xffb6,
    103: 0xffb7,
    104: 0xffb8,
    105: 0xffb9,
    112: 0xffbe, // f 1-12
    113: 0xffbf,
    114: 0xffc0,
    115: 0xffc1,
    116: 0xffc2,
    117: 0xffc3,
    118: 0xffc4,
    119: 0xffc5,
    120: 0xffc6,
    121: 0xffc7,
    122: 0xffc8,
    123: 0xffc9,
    16: 0xffe1, // shift = left shift
    // "shift_r": 0xffe2,
    17: 0xffe3, // control = left control
    //"control_r": 0xffe4,
    20: 0xffe5, // caps lock
    91: 0xffe7, // meta (cmd/windows) = left meta
    //"meta_r": 0xffe8,
    18: 0xffe9, // alt = left alt
    //"alt_r": 0xffea,
    46: 0xffff // delete
};
module.exports = gdkMap;