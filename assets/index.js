var SPACING = 400;
var EXPAND_COUNT = 10; // Number to expand on each side of the selected element - Note: We may actually expand more than this. We need to have a number of items divisble by the number of systems for the loop to work properly.
var ROM_READ_ERROR = "An error ocurred reading the ROM file.";
var BUBBLE_SCREENSHOTS_INTERVAL = 10000;
var QUIT_TIME = 2500; // Time to hold escape to quit a game
var SCREENCAST_TIME = 5000; // Time to hold enter to screencast a game in fullscreen.
var GAMEPAD_INTERVAL = 500;
var GAMEPAD_INPUT_INTERVAL = 10;
var REDRAW_INTERVAL = 10000;
var FOCUS_NEXT_INTERVAL = 500;
var BLOCK_MENU_MOVE_INTERVAL = 250;
var SEND_INPUT_TIME = 1000;
var BROWSER_ADDRESS_HEARTBEAT_TIME = 500;
var TABS_HEARTBEAT_TIME = 500;
var SEARCH_TIMEOUT_TIME = 350;
var UUID = "7c0bb0113f6249f7b3ce3d550d1f3771"; // no non-url safe characters in here please
var SERVER_PLAYLIST_SEPERATOR = "2wt21ionvmae7ugc10bme9";
var MARQUEE_TIMEOUT_TIME = 1000;
var MARQUEE_PIXELS_PER_SECOND = 50;
var HEADER_MARQUEE_PIXELS_PER_SECOND = 250;
var TABINDEX_TIMEOUT = 10000;
var HEADER_MARQUEE_TIMEOUT_TIME = 250;
var RESET_CANCEL_STREAMING_INTERVAL = 1000; // reset the cancellation of streaming every second
var SHOW_PREVIEW_TIMEOUT = 1000;
var PREVIEW_ANIMATION_TIME = 1000;
var SCROLL_TIMEOUT_TIME = 500;
var SCROLL_NEEDED = 1250;
var RELOAD_MESSAGES_INTERVAL = 5000;
var CHATTING_MESSAGES_INTERVAL = 1000;
var SCREENCAST_AXIS_FUZZINESS = 15;
var MAX_JOYSTICK_VALUE = 128;
var MOUSE_MOVE_SEND_INTERVAL = 100;
var AXIS_MIN_TO_BE_BUTTON = 0.5; // we have to be at least 0.5 beyond the last value to set
var EZ_AXIS_ALLOW_FOR_NEXT_INPUT = 0.2; // we will set the last value within this much (allowing for another set), or when we set
var CHANGES_DETECTED = "Changes detected";
var KEYCODES = {
    '0': 48,
    '1': 49,
    '2': 50,
    '3': 51,
    '4': 52,
    '5': 53,
    '6': 54,
    '7': 55,
    '8': 56,
    '9': 57,
    '!': 161,
    '#': 163,
    '$': 164,
    '*': 170,
    ':': 58,
    '<': 60,
    '?': 193,
    'L⌘': 91,
    'R⌘': 93,
    '^': 160,
    'A': 65,
    '+': 107,
    '⎇': 18, // Alt
    "'": 222,
    'B': 66,
    '\\': 220,
    '⌫': 8, // Backspace
    '`': 192, // Backtick
    '⎊': 3, // Break
    'C': 67,
    '⇪': 20, // Caps Lock
    ']': 221,
    ',': 188,
    '✲': 17, // Control
    'D': 68,
    '-': 189,
    '⬇': 40, // Down Arrow
    'E': 69,
    '↵': 13, // Enter
    '=': 187,
    '⎋': 27, // Escape
    'F': 70,
    'F1': 112,
    'F2': 113,
    'F3': 114,
    'F4': 115,
    'F5': 116,
    'F6': 117,
    'F7': 118,
    'F8': 119,
    'F9': 120,
    'F10': 121,
    'F11': 122,
    'F12': 123,
    'F13': 124,
    'F14': 125,
    'F15': 126,
    'F16': 127,
    'F17': 128,
    'F18': 129,
    'F19': 130,
    'F20': 131,
    'F21': 132,
    'F22': 133,
    'F23': 134,
    'F24': 135,
    '/': 191,
    'G': 71,
    'H': 72,
    'I': 73,
    'J': 74,
    'K': 75,
    'L': 76,
    '⬅': 37, // Left Arrow
    'M': 77,
    'N': 78,
    'O': 79,
    '[': 219,
    'P': 80,
    '.': 190,
    'Q': 81,
    'R': 82,
    '➡': 39, // Right Arrow
    'S': 83,
    ';': 186,
    '⇧': 16, // Shift
    '\'': 220,
    '␣': 32, // Space
    'T': 84,
    '↹': 9, // Tab
    'U': 85,
    '⬆': 38, // Up Arrow
    'V': 86,
    'W': 87,
    'X': 88,
    'Y': 89,
    'Z': 90,
    '~': 171
}
// These buttons may not be in the same places on your controller
// Their names are taken straight from Linux: https://github.com/torvalds/linux/blob/master/include/uapi/linux/input-event-codes.h
var PADCODES = {
    'Ⓐ': 0x130,
    'Ⓑ': 0x131,
    'Ⓧ': 0x133,
    'Ⓨ': 0x134,
    'Ⓛ': 0x136,
    'Ⓡ': 0x137,
    '🅛': 0x138,
    '🅡': 0x139, // right trigger 2
    '🅻': 0x13d,
    '🆁': 0x13e, // thumb right trigger
    '🔘': 0x13a, // select
    '⭐': 0x13b, // start
    '🏠': 0x13c, //mode 
    '▲': 0x220, // dpad up
    '▼': 0x221, // dpad down
    '◀': 0x222, // dpad left
    '▶': 0x223, // dpad right
    '🕹️L': 1, // there's special logic for these analog pads based on their names, so be careful when changing them
    '🕹️R': 2 // they aren't used for sending button values - they are only used for the mobile virtual controller
}
// These are only used when the client has a controller that we map the axis
// The virtual controller uses the left and right axis padcode
var AXISCODES = {
    "🕹️X": 0x00,
    "🕹️Y": 0x01,
    "🕹️X2": 0x03,
    "🕹️Y2": 0x04
}
// These are the buttons that will be used
var EZ_EMULATOR_CONFIG_BUTTONS = [
    'A',
    'B',
    'X',
    'Y',
    'L',
    'R',
    'L2',
    'R2',
    'L3',
    'R3',
    'Select',
    'Start',
    'Up',
    'Down',
    'Left',
    'Right',
    'Axis X-',
    'Axis X+',
    'Axis Y-',
    'Axis Y+',
    'Axis X2-',
    'Axis X2+',
    'Axis Y2-',
    'Axis Y2+',
    'Screenshot'
];
var EZ_SYSTEMS = [
    "3ds",
    "gba",
    "n64",
    "nds",
    "nes",
    "ngc",
    "ps2",
    "psp",
    "snes",
    "wii"
];
var EZ_REGEX = /([^\(]+)\(([^\)]+)\)(-([^\-]+)-(.*))?/;
var KEYCODE_MAP = {
    32: "Space", // space
    222: "Apostrophe", // single quote
    188: "Comma", // comma
    189: "Minus", // minus
    190: "Period", //period
    191: "Slash", // slash
    192: "Backtick", // backtick
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
    186: "Semicolon", // semicolon
    187: "Equals", // equal
    219: "Bracketleft", // open bracket
    220: "Backslash", // backslash
    221: "Bracketright", // close bracket
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
    85: "Y",
    86: "V",
    87: "W",
    88: "X",
    89: "Y",
    90: "Z",
    8: "Backspace", // backspace
    9: "Tab", // tab
    13: "Return", // enter
    19: "Pause", // pause
    145: "Scroll Lock", // scroll lock
    27: "Escape", // escape    
    36: "Home", // home
    37: "Left", // left
    38: "Up", // up
    39: "Right", // right
    40: "Down", // down
    33: "Page Up", // page up
    34: "Page Down", // page down
    35: "End", // end
    45: "Insert", // insert
    96: "KP 0", // numpad 0-9
    97: "KP 1",
    98: "KP 2",
    99: "KP 3",
    100: "KP 4",
    101: "KP 5",
    102: "KP 6",
    103: "KP 7",
    104: "KP 8",
    105: "KP 9",
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
    16: "Shift L", // shift = left shift
    // "shift_r": "Shift_R",
    17: "Control L", // control = left control
    //"control_r": "Control_R",
    20: "Caps Lock", // caps lock
    91: "Meta L", // meta (cmd/windows) = left meta
    //"meta_r": "Meta_R",
    18: "Alt L", // alt = left alt
    //"alt_r": "Alt_R",
    46: "Delete" // delete
};
// Firefox uses non-standard keys
var FIREFOX_TO_STANDARD_KEYCODE_MAP = {
    59: 186, // ;
    61: 187, // =
    173: 189 // -
};
// default mobile key mapping
// 375 x 667 is what the buttons are set up with
var TRUE_DEFAULT_KEY_MAPPING_WIDTH = 375;
var TRUE_DEFAULT_KEY_MAPPING_HEIGHT = 667;
var DEFAULT_KEY_MAPPING_PORTRAIT = [{"key":"Ⓧ","x":236,"y":497},{"key":"Ⓨ","x":290,"y":466},{"key":"Ⓑ","x":346,"y":499},{"key":"Ⓐ","x":291,"y":525},{"key":"◀","x":28,"y":495},{"key":"▼","x":83,"y":525},{"key":"▲","x":83,"y":468},{"key":"▶","x":137,"y":497},{"key":"🕹️L","x":123,"y":608},{"key":"🕹️R","x":249,"y":609},{"key":"Ⓡ","x":347,"y":236},{"key":"🅡","x":347,"y":181},{"key":"Ⓛ","x":29,"y":237},{"key":"🅛","x":28,"y":181},{"key":"🔘","x":135,"y":169},{"key":"⭐","x":241,"y":169},{"key":"⎋","x":77,"y":105},{"key":"↵","x":303,"y":105}];
var DEFAULT_KEY_MAPPING_LANDSCAPE = [{"key":"▲","x":90,"y":161},{"key":"◀","x":35,"y":188},{"key":"▶","x":146,"y":188},{"key":"▼","x":91,"y":221},{"key":"🕹️L","x":68,"y":313},{"key":"🔘","x":161,"y":310},{"key":"⭐","x":453,"y":309},{"key":"Ⓐ","x":578,"y":336},{"key":"Ⓑ","x":633,"y":310},{"key":"Ⓧ","x":522,"y":309},{"key":"Ⓨ","x":577,"y":279},{"key":"🕹️R","x":599,"y":183},{"key":"Ⓡ","x":510,"y":31},{"key":"🅡","x":566,"y":30},{"key":"Ⓛ","x":201,"y":31},{"key":"🅛","x":146,"y":30},{"key":"✲","x":39,"y":96},{"key":"S","x":625,"y":97}];
var CONTROLS_SET_MESSAGE = "Controls set";
var COULD_NOT_SET_CONTROLS_MESSAGE = "Could not set controls";
var SCALE_DOWN_TIMEOUT = 1000;
var SCALE_OPTIONS = [1,1.5,2,3,4,6]; // 1080p, 720p, 540p, 360p, 270p, 180p

var expandCountLeft; // We always need to have a complete list of systems, repeated however many times we want, so the loop works properly
var expandCountRight;
var systemsDict;
var profilesDict;
var ip;
var disableMenuControls;
var enableModalControls;
var makingRequest = false;
var bubbleScreenshotsSet;
var focusInterval = null;
var closeModalCallback;
var currentAddress;
var browserAddressHeartbeat;
var tabsHeartbeat;
var navigating = false;
var sendString = "";
var activePageId = null;
var nonGameSystems = [];
var nonSaveSystems = ["browser", "media","pc"];
var menuDirection = null;
var menuMoveSpeedMultiplier = 1;
var currentSearch = "";
var searchTimeout;
var marqueeTimeoutTitle;
var marqueeTimeoutFolder;
var headerMarqueeTimeout;
var socket;
var isServer = false;
var resetCancelStreamingInterval;
var showPreviewTimeout;
var scrollVerticalTotal = 0;
var scrollHorizontalTotal = 0;
var scrollAddTimeout;
var messages = [];
var fetchedMessages = false;
var swRegistration;
var autoplayMedia = false; // manually force autoplay on remote media
var scaleDownByTimeouts = {};
var fullscreenPip = false;

var screencastButtonsPressed = {};
var screencastAxisLastValues = {};
// keys are server values, values are client values
// it's a map of numbers so 0:2, 3:3:, etc. PADCODES index to controller button number.
// these are only used for the client's controller. No mapping is used for the virtual joypad created on phones. A sends button 0 and that's that.
// server axis will be prepended with an "a" as will client full axis
// when using an axis direction for a button, we will simply put that axis number and + or -
var screencastControllerMap = {}; // allow the user to map button inputs on the client to buttons on the virtual controller (button 5 on the client xbox contrller goes to button 9 on the virtual controller)

var sambaUrl;
var serverIsSamba = false;

// Hold escape for 5 seconds to quit
// Note this variable contains a function interval, not a boolean value
var escapeDown = null; 
// Hold enter for 5 seconds to start streaming in fullscreen
var enterDown = null;
// Hold start for 5 seconds to start streaming in fullscreen
var startDown = {};

// These buttons need to be pressed again to trigger the action again
var joyMapping = {
    "A": 1,
    "Start": 9,
    "Select": 8,
    "Right Trigger": 7,
    "Left Trigger": 6,
    "D-pad Up": 13,
    "D-pad Down": 14,
    "D-pad Left": 15,
    "D-pad Right": 16
}
// This will be used for buttons that we need to be up again before calling what they do again
// This is specifically for the local GuyStation - the screencast keeps track in a different way (screencastButtonsPressed)
var buttonsUp = {
    "gamepad": {},
    "keyboard": {
        "13": true, // Enter
        "32": true // Spacebar
    }
};

/**
 * Bubble screenshots on the screen for the selected game.
 */
function bubbleScreenshots() {
    var currentSystemElement = document.querySelector(".system.selected");
    var currentGameElement = currentSystemElement.querySelector(".game.selected");
    if( currentGameElement ) {
        var currentSystem = currentSystemElement.getAttribute("data-system");
        if( nonSaveSystems.includes(currentSystem) ) return;
        
        var screenshots = getAllScreenshots( currentSystem, decodeURIComponent(currentGameElement.getAttribute("data-game")), parentsStringToArray(currentGameElement.getAttribute("data-parents")) );

        if( screenshots.length ) {
            var screenshot = screenshots[Math.floor(Math.random()*screenshots.length)];
            var img = document.createElement("img");
            img.setAttribute("src", screenshot);
            img.classList.add("screenshot");
            img.style.left = (Math.floor(Math.random()*2) ? Math.random()*20 : 80-Math.random()*20) + "%";
            document.body.appendChild(img);
            setTimeout( function() {
                img.parentElement.removeChild(img);
            }, 5000 ); // make sure this time matches the css
        }
    }
}

/**
 * Display a preview of the game.
 */
function displayGamePreview() {
    var currentSystemElement = document.querySelector(".system.selected");
    var currentGameElement = currentSystemElement.querySelector(".game.selected");

    var currentPreview = document.querySelector(".game-preview:not(.game-preview-dying)");
    if( currentGameElement && currentPreview && currentGameElement.getAttribute("data-game") == currentPreview.getAttribute("data-game") && currentGameElement.getAttribute("data-parents") == currentPreview.getAttribute("data-parents") && currentSystemElement.getAttribute("data-system") == currentSystemElement.getAttribute("data-system") ) {
        return;
    }
    if( currentPreview ) {
        clearTimeout( showPreviewTimeout );
        currentPreview.classList.remove("game-preview-shown");
        currentPreview.classList.add("game-preview-dying");
        setTimeout( function() {
            currentPreview.parentElement.removeChild(currentPreview)
        }, PREVIEW_ANIMATION_TIME ); // make sure this matches the css
    }

    if( currentGameElement ) {
        var currentSystem = currentSystemElement.getAttribute("data-system");
        var currentGame = decodeURIComponent( currentGameElement.getAttribute("data-game") );
        var currentParents = parentsStringToArray( currentGameElement.getAttribute("data-parents") );
        var gameDictEntry = getGamesInFolder( currentParents, currentSystem )[currentGame];
        if( gameDictEntry.cover && gameDictEntry.name ) {
            var previewElement = document.createElement("div");
            previewElement.classList.add("game-preview");
            previewElement.setAttribute("data-game", currentGameElement.getAttribute("data-game"));
            previewElement.setAttribute("data-system", currentSystemElement.getAttribute("data-system"));
            previewElement.setAttribute("data-parents", currentGameElement.getAttribute("data-parents"));
            previewElement.onclick = function(e) { 
                if( !disableMenuControls ) {
                    if( this.classList.contains("game-preview-clicked") ) {
                        this.classList.remove("game-preview-clicked");
                    }
                    else {
                        this.classList.add("game-preview-clicked"); 
                    }
                    e.stopPropagation();
                }
            }

            var previewImg = document.createElement("img");
            previewImg.setAttribute("src", gameDictEntry.cover.url);
            //previewImg.setAttribute("width", gameDictEntry.cover.width);
            //previewImg.setAttribute("height", gameDictEntry.cover.height);
            previewElement.appendChild(previewImg);

            var previewInfo = document.createElement("div");
            previewInfo.classList.add("game-preview-info");

            var previewTitle = document.createElement("div");
            previewTitle.classList.add("game-preview-title");
            previewTitle.innerText = gameDictEntry.name;
            previewInfo.appendChild(previewTitle);

            var previewReleaseDate;
            if( gameDictEntry.releaseDate ) {
                previewReleaseDate = document.createElement("div");
                previewReleaseDate.classList.add("game-preview-release-date");
                var releaseDate = new Date(1970, 0, 1);
                releaseDate.setSeconds( gameDictEntry.releaseDate );
                previewReleaseDate.innerText = releaseDate.toLocaleDateString();
                previewInfo.appendChild(previewReleaseDate);
            }

            previewElement.appendChild(previewInfo);
            document.body.appendChild(previewElement);

            // set timeout to force draw prior
            showPreviewTimeout = setTimeout( function() { 
                previewElement.classList.add("game-preview-shown");
                if( gameDictEntry.summary ) {
                    var previewSummary = document.createElement("div");
                    previewSummary.classList.add("game-preview-summary");
                    previewSummary.innerText = gameDictEntry.summary;
                    var imageWidth = 200; //make sure this matches the css
                    var imageHeight = gameDictEntry.cover.height/gameDictEntry.cover.width * imageWidth;
                    previewSummary.style.maxHeight = imageHeight - previewTitle.offsetHeight - (previewReleaseDate ? previewReleaseDate.offsetHeight : 0);
                    previewInfo.appendChild(previewSummary);
                }
            }, SHOW_PREVIEW_TIMEOUT );
        }
    }
}

/**
 * Get all screenshots
 * @param {string} currentSystem - the system the game is on
 * @param {HTMLElement} currentGameElement - the HTML element for the game
 */
function getAllScreenshots(system, game, parents) {
    if( !system || !game || !parents ) {
        return [];
    }

    var gameDictEntry = getGamesInFolder( parents, system )[game];

    var gameDictEntries = [];
    // if it is a folder, get some sub items
    if( gameDictEntry.isFolder ) {
        if( folderContainsRealGames(gameDictEntry.games) ) {
            var arr = [];
            var folderParents = parents;
            folderParents.push( gameDictEntry.game );
            getRealGamesInFolderRecursive(gameDictEntry.games, arr, folderParents);
            for( var i=0; i<arr.length; i++ ) {
                gameDictEntries.push( arr[i] );
            }
        }
    }
    else {
        gameDictEntry = JSON.parse(JSON.stringify(gameDictEntry));
        gameDictEntry.parents = parents;
        gameDictEntries.push(gameDictEntry);
    }

    var urls = [];
    for( var i=0; i<gameDictEntries.length; i++ ) {
        gameDictEntry = gameDictEntries[i];
        var currentGameElement = document.querySelector( '.system[data-system="'+system+'"] .game[data-game="'+encodeURIComponent(gameDictEntry.game)+'"][data-parents="'+parentsArrayToString(gameDictEntry.parents)+'"]');
        if( currentGameElement ) {
            var currentGame = decodeURIComponent(currentGameElement.getAttribute("data-game"));
            var currentSaveElement = currentGameElement.querySelector(".current-save");
            if( currentSaveElement ) {
                var currentSave = currentSaveElement.innerText;
                
                if( systemsDict[system]
                    && currentSave
                    && gameDictEntry
                    && gameDictEntry.saves
                    && gameDictEntry.saves[currentSave]
                    && gameDictEntry.saves[currentSave].screenshots
                    && gameDictEntry.saves[currentSave].screenshots.length ) {
                    
                    var currentParents = gameDictEntry.parents;
                    var screenshots = gameDictEntry.saves[currentSave].screenshots;
                    for( var j=0; j<screenshots.length; j++ ) {
                        urls.push( ["systems", encodeURIComponent(system), "games"].concat(currentParents).concat([encodeURIComponent(currentGame), "saves", encodeURIComponent(currentSave), "screenshots", encodeURIComponent(screenshots[j])]).join("/") );
                    }

                }
            }
        }
    }

    return urls;
}

/**
 * Reset the bubble screenshots waiting period.
 */
function resetBubbleScreenshots() {
    if( bubbleScreenshotsSet ) {
        clearInterval( bubbleScreenshotsSet );
    }
    bubbleScreenshotsSet = setInterval( bubbleScreenshots, BUBBLE_SCREENSHOTS_INTERVAL );
}

/**
 * Set the marquee for the selected element.
 */
function setMarquee() {
    // Just to be safe
    removeMarquee();
    var selectedGame = document.querySelector(".system.selected .game.selected");
    if( selectedGame ) {
        var selectedFolder = selectedGame.querySelector(".game-folder");
        // marquee for the folder
        if( selectedFolder ) {
            if( selectedFolder.offsetWidth < selectedFolder.scrollWidth ) {
                marqueeTimeoutFolder = setTimeout( function() {
                    addMarquee( selectedFolder, selectedGame );
                }, MARQUEE_TIMEOUT_TIME );
            }
        }
        // marquee for the game
        var selectedTitle = selectedGame.querySelector(".game-title");
        if( selectedTitle ) {
            if( selectedTitle.offsetWidth < selectedTitle.scrollWidth ) {
                marqueeTimeoutTitle = setTimeout( function() {
                    var childrenShowing = false;
                    // for some reason chrome doesn't calculate the width properly when we have the transform:scale
                    // applied, so remove if temporarily if there
                    if( selectedGame.classList.contains("children-showing") ) {
                        selectedGame.classList.remove("children-showing");
                        childrenShowing = true;
                    }
                    addMarquee( selectedTitle, selectedGame );
                    if( childrenShowing ) {
                        selectedGame.classList.add("children-showing");
                    }
                }, MARQUEE_TIMEOUT_TIME );
            }
        } 
    }
}

/**
 * Remove all marquees.
 * @param {boolean} header - True if this is for the header marquee.
 */
function removeMarquee(header) {
    if( !header ) {
        clearTimeout(marqueeTimeoutTitle);
        clearTimeout(marqueeTimeoutFolder);
    }
    else {
        clearTimeout(headerMarqueeTimeout);
    }
    var selector = header ? ".game-marquee-header" : ".game-marquee:not(.game-marquee-header)";
    var marquees = document.querySelectorAll(selector);
    marquees.forEach( function(el) {
        if( header ) {
            el.classList.remove("game-marquee-header");
            el.classList.remove("game-marquee");
        }
        else {
            el.classList.remove("game-marquee");
        }
    });
}

/**
 * Add marquee to an element within a game element
 * @param {HTMLElement} element - The element to add marquee too
 * @param {HTMLElement} gameElement - The game element containing the element
 * @param {string} boolean - True if this marquee is for the header.
 */
function addMarquee(element, gameElement, header) {
    // calculate the animation delay
    var gameElementPadding = parseInt(window.getComputedStyle(gameElement).getPropertyValue("padding-left").replace("px",""));
    var gameElementWidth = parseInt(window.getComputedStyle(gameElement).getPropertyValue("width").replace("px",""));
    var paddingWidth = gameElementWidth + gameElementPadding; // since we start at 0, we only need one padding 
    var textWidth = element.scrollWidth;
    var totalDistance = paddingWidth + textWidth + gameElementPadding; // the total distiance traveled will be textwidth, paddingwidth, and the 10px on the left side of the element

    // we travel at 50px/s
    var pixelsPerSecond = header ? HEADER_MARQUEE_PIXELS_PER_SECOND : MARQUEE_PIXELS_PER_SECOND;
    var totalAnimationTime = totalDistance / pixelsPerSecond;
    // when have we traveled all the padding
    var textAtBeginningPercentage = paddingWidth / totalDistance;
    var textAtBeginningTime = textAtBeginningPercentage * totalAnimationTime * -1;

    element.style.animationDelay = textAtBeginningTime + "s";
    element.style.animationDuration = totalAnimationTime + "s";
    
    if( header ) {
        clearTimeout(headerMarqueeTimeout);
        headerMarqueeTimeout = setTimeout( function() {element.classList.add("game-marquee-header"); element.classList.add("game-marquee");}, HEADER_MARQUEE_TIMEOUT_TIME );
    }
    else {
        element.style.animationPlayState = "paused";
        element.classList.add("game-marquee");
        setTimeout( function() { element.style.animationPlayState = "running" }, 0 ); // this is necessary for iOS safari
    }
}

/**
 * Display the current time and date.
 */
function startTime() {
    var today = new Date();
    var hours = today.getHours();
    var meridian = "AM";
    if( hours > 12 ) {
        hours -= 12;
        meridian = "PM";
    }
    else if( hours == 12 ) {
        meridian = "PM";
    }
    else if( !hours ) {
        hours = 12;
        meridian = "AM";
    }
    var minutes = today.getMinutes();
    if( minutes < 10 ) minutes = "0" + minutes;
    var date = today.getDate();
    var month = today.getMonth() + 1;
    var year = today.getFullYear();
    var date = hours + ":" + minutes + " " + meridian + " - " + month + "/" + date + "/" + year;
    document.getElementById("time").innerHTML = date;
    setTimeout(startTime, 500);
}

window.addEventListener('load', load );

/**
 * Load.
 */
function load() {

    // determine what we are - only used for button highlighting
    var urlParams = new URLSearchParams(window.location.search);
    if( urlParams.has("is_server") ) {
        isServer = true;
    }
    if( urlParams.has("smb") ) {
        sambaUrl = urlParams.get("smb");
    }

    // register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('/assets/sw.js')
            .then(serviceWorker => {
                swRegistration = serviceWorker;
                serviceWorker.update(); // always keep up to date
                console.log('Service Worker registered: ' + serviceWorker);
            })
            .catch(error => {
                console.log('Error registering the Service Worker: ' + error);
        });
    }

    startRequest();
    makeRequest( "GET", "/data", {}, function(responseText) {
        var response = JSON.parse(responseText);
        systemsDict = response.systems;
        fullscreenPip = response.fullscreenPip;

        var startSystem = {};
        if( window.localStorage.guystationStartSystem ) {
            startSystem = JSON.parse(window.localStorage.guystationStartSystem);
        }
        if( window.localStorage.guystationJoyMapping ) {
            joyMapping = JSON.parse(window.localStorage.guystationJoyMapping);
        }
        if( window.localStorage.guystationScreencastControllerMap ) {
            screencastControllerMap = JSON.parse(window.localStorage.guystationScreencastControllerMap);
        }

        ip = response.ip;
        draw(startSystem);
        enableControls();
        endRequest();
        resetBubbleScreenshots();
        startTime();
        gamePadInterval = setInterval(pollGamepads, GAMEPAD_INTERVAL);
        addDog();
        document.body.onclick = closeMenu;
        document.querySelector("#functions").onclick = function(e) {
            e.stopPropagation();
        }
        enableSearch();
        // Check for changes every 10 seconds
        setInterval( function() {
            if( !makingRequest && (!serverIsSamba || !document.querySelector(".screencast-wrapper")) ) {
                makeRequest( "GET", serverIsSamba ? "/data-quick" : "/data", {}, function(responseText) {
                    var response = JSON.parse(responseText);
                    var newSystemsDict = response.systems;
                    if( JSON.stringify(newSystemsDict) != JSON.stringify(systemsDict) ) {
                        createToast( CHANGES_DETECTED );
                        systemsDict = newSystemsDict;
                        redraw();
                    }
                    else if(response.fullscreenPip !== fullscreenPip) {
                        createToast( CHANGES_DETECTED );
                        fullscreenPip = response.fullscreenPip;
                        toggleButtons();
                    }
                } );
            }
        }, REDRAW_INTERVAL );
        makeRequest( "GET", "/samba", {}, function(responseText) {
            var response = JSON.parse(responseText);
            if( response.samba ) serverIsSamba = true;
        } );
        // Check for new messages every second
        var reloadMessages = function() {
            makeRequest( "GET", "/message", {}, function(responseText) {
                var response = JSON.parse(responseText);
                if( JSON.stringify(messages) != JSON.stringify(response.messages) ) {
                    var maxId = messages.length ? messages[messages.length-1].id : -1;
                    var newMessages = [];
                    // determine the new messages
                    for( var i=response.messages.length-1; i>=0; i-- ) {
                        if( response.messages[i].id > maxId ) {
                            newMessages.push( response.messages[i] );
                        }
                        else{
                            break;
                        }
                    }

                    messages = response.messages;

                    var messagingBox = document.querySelector("#messaging-box");

                    if( !messagingBox ) {

                        if( fetchedMessages ) {
                            // filter out messages sent by me in the toast
                            var toastMessages = [];
                            for( var i=0; i<newMessages.length; i++ ) {
                                if( newMessages[i].user.id != window.localStorage.guystationMessagingId ) {
                                    toastMessages.push( newMessages[i].user.name + ": " + newMessages[i].content );
                                }
                            }
                            if( toastMessages.length ) {
                                // create a toast of the new messages
                                createToast( toastMessages.join("<br>"), null, true );
                            }
                        }
                    }
                    else {
                        // there should definately be new messages, update the box if needed
                        updateMessages( messagingBox );
                    }

                }
                fetchedMessages = true;
                setTimeout( reloadMessages, document.querySelector("#messaging-box") ? CHATTING_MESSAGES_INTERVAL : RELOAD_MESSAGES_INTERVAL );
            }, function() {
                setTimeout( reloadMessages, document.querySelector("#messaging-box") ? CHATTING_MESSAGES_INTERVAL : RELOAD_MESSAGES_INTERVAL );
            } );
        }
        setTimeout( reloadMessages, RELOAD_MESSAGES_INTERVAL );

        socket = io.connect("http://"+window.location.hostname+":3000");
        socket.on("connect", function() {console.log("socket connected")});

        setTimeout( function() {
       	    document.querySelector("#search").setAttribute("tabindex", "0");
        }, TABINDEX_TIMEOUT );
    }, load );
}

/**
 * Enable searching.
 */
function enableSearch() {
    document.getElementById("search").oninput = function() {
        currentSearch = this.value;
        clearTimeout( searchTimeout );
        searchTimeout = setTimeout( function() {
            redraw(null, null, null, null, null, null, true);
        }, SEARCH_TIMEOUT_TIME );
    }
}

/**
 * Clear search.
 * Note: this will not do a redraw
 */
function clearSearch() {
    clearTimeout( searchTimeout );
    document.getElementById("search").value = "";
    currentSearch = "";
}

/**
 * Close the menu by clicking Cocoa.
 */
function closeMenu() {
    if( document.querySelector("#functions.open") ) {
        document.querySelector(".player-wrapper").click();
    }
}

/**
 * Enable controls.
 */
function enableControls() {
    document.onkeydown = function(event) {
        if( !disableMenuControls ) {
            switch (event.keyCode) {
                // Left
                case 37:
                    moveMenu(1);
                    menuChangeDelay("left-keyboard");
                    break;
                // Up
                case 38:
                    moveSubMenu(-1);
                    menuChangeDelay("up-keyboard");
                    break;
                // Right
                case 39:
                    moveMenu(-1);
                    menuChangeDelay("right-keyboard");
                    break;
                // Down
                case 40:
                    moveSubMenu(1);
                    menuChangeDelay("down-keyboard");
                    break;
                // Enter
                case 13:
                    if( buttonsUp.keyboard["13"] ) {
                        document.querySelector("#launch-game").click();
                    }
                    buttonsUp.keyboard["13"] = false;

                    if( !isServer && !enterDown ) {
                        enterDown = setTimeout(function() {
                            if( !document.querySelector("#remote-screencast-form") ) displayScreencast(true);
                        }, SCREENCAST_TIME);
                    }
                    break;
                // Escape
                case 27:
                    // Go to the currently playing game if there is one
                    goToPlayingGame();
                    if( !escapeDown ) {
                        escapeDown = setTimeout(function() {
                            document.querySelector("#quit-game").click();
                        }, QUIT_TIME);
                    }
                    break;
                // Spacebar
                case 32:
                    // we know there is not a modal already open since disableMenuControls is false
                    if( buttonsUp.keyboard["32"] ) {
                        document.querySelector("#remote-media").click();
                    }
                    buttonsUp.keyboard["32"] = false;
                    break;
            }
        }
        // for the video
        else if( enableModalControls && document.querySelector(".modal #remote-screencast-form video, .modal #browser-controls-form video, .black-background video") ) {
            // Allow enter for the browser address bar
            if( document.querySelector(".modal #address-bar") && document.querySelector(".modal #address-bar") === document.activeElement && !navigating ) {
                // only go on enter
                if( event.keyCode == 13 ) document.querySelector(".modal #go-button").click();
            }
            else if( buttonsUp[event.keyCode.toString()] || buttonsUp[event.keyCode.toString()] === undefined ) {
                socket.emit("/screencast/buttons", { "down": true, "buttons": [event.keyCode] } );
                buttonsUp[event.keyCode.toString()] = false;
            }
        }
        // Prevent Ctrl + S
        if( event.keyCode == 83 && (navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey) ) {
            event.preventDefault();
        }
    }
    document.onkeyup = function(event) {
        switch (event.keyCode) {
            // Left
            case 37:
                if( menuDirection == "left-keyboard") menuDirection = null;
                break;
            // Up
            case 38:
                if( menuDirection == "up-keyboard") menuDirection = null;
                break;
            // Right
            case 39:
                if( menuDirection == "right-keyboard") menuDirection = null;
                break;
            // Down
            case 40:
                if( menuDirection == "down-keyboard") menuDirection = null;
                break;
            // Enter
            case 13:
                buttonsUp.keyboard["13"] = true;
                if( document.querySelector("#messaging-box") ) {
                    document.querySelector("#messaging-form button").click();
                }

                clearTimeout(enterDown);
                enterDown = null;
                break;
            // Escape
            case 27:
                clearTimeout(escapeDown);
                escapeDown = null;
                break;
            // Spacebar
            case 32:
                buttonsUp.keyboard["32"] = true;
        }
        // for the video
        if( enableModalControls && document.querySelector(".modal #remote-screencast-form video, .modal #browser-controls-form video, .black-background video") ) {
            // Allow enter for the browser address bar
            if( !(document.querySelector(".modal #address-bar") && document.querySelector(".modal #address-bar") === document.activeElement && !navigating) && !buttonsUp[event.keyCode.toString()] ) {
                socket.emit("/screencast/buttons", { "down": false, "buttons": [event.keyCode] } );
                buttonsUp[event.keyCode.toString()] = true;
            }
        }
    }
}

/**
 * Go to the game currently being played.
 */
function goToPlayingGame() {
    var currentPlayingGameElement = document.querySelector(".system .game.playing");
    if( currentPlayingGameElement ) {
        var startSystem = generateStartSystem();
        var currentPlayingGame = decodeURIComponent(currentPlayingGameElement.getAttribute("data-game"));
        var currentPlayingParentsString = currentPlayingGameElement.getAttribute("data-parents");
        var currentPlayingSystem = currentPlayingGameElement.closest(".system").getAttribute("data-system");
        if( !(startSystem.system == currentPlayingSystem && startSystem.games[currentPlayingSystem].game == currentPlayingGame && startSystem.games[currentPlayingSystem].parents == currentPlayingParentsString ) ) {
            startSystem.games[currentPlayingSystem].game = currentPlayingGame;
            startSystem.games[currentPlayingSystem].parents = currentPlayingParentsString;
            startSystem.system = currentPlayingSystem;
            draw( startSystem );
        }
    }
}

/**
 * Draw the page.
 * @param {Object} startSystem - An object with a system key for the system to start on and an array of objects with system keys and games for games to start on.
 * @param {string} startSystem.system - The system to start on.
 * @param {Object} startSystem.games - An object containing a key for each system, and an object with a key for "game" and "parents" and respective values as a value.
 * @param {Object} startSystem.openFolders - An object containing a key for each system, and an array of gameDictEntries as values that are folders that should be opened.
 */
function draw( startSystem ) {
    var systemKeys = Object.keys(systemsDict);
    var systemElements = [];

    // Create all the elements that we need
    for(var i=0; i<systemKeys.length; i++) {
        var system = systemsDict[ systemKeys[i] ];

        // Create the element for the system
        var systemElement = document.createElement("div");
        systemElement.classList.add("system");
        systemElement.setAttribute("data-system", system.system);
        if( system.playing ) systemElement.classList.add("playing");

        // Get the icon
        var icon = "/systems/" + system.system + "/icon.png";
        var img = document.createElement("img");
        img.setAttribute("src", icon);
        systemElement.appendChild(img);

        // Create the element for the list of games
        var gamesElement = document.createElement("div");
        gamesElement.classList.add("games");
        populateGames( system.system, system.games, startSystem, gamesElement, false, [] );
        var selectedGameElement = gamesElement.querySelector(".game.selected");
        // no selected games, element, create one if possible
        if( !selectedGameElement ) {
            selectedGameElement = gamesElement.querySelector(".game:not(.hidden)");
            if( selectedGameElement ) {
                selectedGameElement.classList.add("selected");
            }
        }
        // manually hide all games above the selected game...
        if( selectedGameElement ) {
            var j=0;
            var prevGame = selectedGameElement.previousElementSibling;
            while( prevGame ) {
                prevGame.classList.add("above");
                if( !prevGame.classList.contains("hidden") ) j++;
                prevGame = prevGame.previousElementSibling;
            }
            // Quickly add and remove the game element to the DOM to get its height
            var cpyGameElement = selectedGameElement.cloneNode(true);
            cpyGameElement.style.visibility = "hidden";
            document.body.appendChild(cpyGameElement);
            var height = cpyGameElement.offsetHeight;
            cpyGameElement.style.visibility = "";
            cpyGameElement.parentElement.removeChild(cpyGameElement);
            var newOffset = j * height * -1;
            gamesElement.style.transform = "translateY("+newOffset+"px)";
        }

        // Append the games list element to the system
        systemElement.appendChild(gamesElement);

        // Add the system element to the list of systems
        systemElements.push(systemElement);
    }

    // Draw the menu
    // The menu will basically be a loop
    var startIndex = startSystem && startSystem.system ? Array.from(systemElements).map( (el) => el.getAttribute("data-system") ).indexOf(startSystem.system) : 0; // Start at 0 by default on draw
    // Calculate the appropriate expand counts on each side
    expandCountLeft = Math.ceil(EXPAND_COUNT/systemElements.length) * systemElements.length;
    expandCountRight = expandCountLeft - 1;

    var systemsElementNew = document.createElement("div");
    systemsElementNew.setAttribute("id", "systems");
    // Add the systems elements
    var clickToMove = function(element) {
        var myOffset = element.parentElement.style.transform;
        if( myOffset )
            myOffset = parseInt(myOffset.match(/([\+\-]?\s?\d+)px/)[1].replace(/\s/,""));
        else
            myOffset = 0;
        var mySpaces = myOffset/SPACING;
        moveMenu(-mySpaces);
        return -mySpaces;
    };
    var clickToMoveSubmenu = function(element) {
        // Add the onclick element
        var parentGamesList = element.closest(".games");
        if( parentGamesList.parentElement.classList.contains("selected") && !element.classList.contains("above") ) {
            var parentGamesArray = Array.prototype.slice.call( parentGamesList.querySelectorAll(".game:not(.hidden)") );
            var currentGame = parentGamesList.querySelector(".game.selected");
            var currentPosition = parentGamesArray.indexOf( currentGame );
            var myPosition = parentGamesArray.indexOf( element );
            moveSubMenu( myPosition - currentPosition );
            return myPosition - currentPosition; 
        }
        return -1;
    }
    var clickToMoveOrLaunch = function(e) {
        if( !disableMenuControls ) {
            var spacesMoved = clickToMove(this);
            if( this.parentNode.getAttribute("data-system") != "media" ) {
                if( !spacesMoved) launchGame( document.querySelector(".system.selected").getAttribute("data-system"), null, [] );
            }
            e.stopPropagation();
        }
    }

    systemsElementNew.appendChild( systemElements[startIndex] );
    systemsElementNew.querySelector("img").onclick = clickToMoveOrLaunch;

    for( var i=1; i<expandCountRight+1; i++ ) {
        var nextIndex = getIndex( startIndex, systemElements, i );
        var nextElement = systemElements[nextIndex].cloneNode(true);
        nextElement.style.transform = "translateX( calc( -50% + "+(i*SPACING)+"px ) )translateY(-50%)";
        nextElement.querySelector("img").onclick = clickToMoveOrLaunch;
        systemsElementNew.appendChild(nextElement);
    }
    for( var i=1; i<expandCountLeft+1; i++ ) {
        var prevIndex = getIndex( startIndex, systemElements, -1*i );
        var prevElement = systemElements[prevIndex].cloneNode(true);
        prevElement.style.transform = "translateX( calc( -50% - "+(i*SPACING)+"px ) )translateY(-50%)";
        prevElement.querySelector("img").onclick = clickToMoveOrLaunch;
        systemsElementNew.appendChild(prevElement);
    }

    // onclick move submenu, if we don't move anywhere, then launch the game
    systemsElementNew.querySelectorAll(".games .game").forEach( function(element) { 
        element.onclick = function(e) {
            if( !disableMenuControls && !this.classList.contains("above") ) {
                var spacesMoved = clickToMoveSubmenu(element); 
                if(!spacesMoved) document.querySelector("#launch-game").click();
                e.stopPropagation();
            }
        }
    } );

    // Add the selected class
    systemElements[startIndex].classList.add("selected");

    document.querySelector("#systems").replaceWith(systemsElementNew);

    // Draw the ip
    document.querySelector("#ip").innerText = ip;

    toggleButtons();
    saveMenuPosition();
    setMarquee();
    displayGamePreview();
}

/**
 * Populate the games portion of the menu.
 * @param {string} system - The system the games are for.
 * @param {Object} games - The object of games as returned from the server.
 * @param {Object} startSystem - An object with a system key for the system to start on and an array of objects with system keys and games for games to start on.
 * @param {string} startSystem.system - The system to start on.
 * @param {Object} startSystem.games - An object containing a key for each system, and an object with a key for "game" and "parents" and respective values as a value.
 * @param {Object} startSystem.openFolders - An object containing a key for each system, and an array of gameDictEntries as values that are folders that should be opened. 
 * @param {HTMLElement} gamesElement - The element to append the games to.
 * @param {boolean} [hidden] - True if the element should be hidden.
 * @param {Array<string>} [parents] - An array of parent folders for the game.
 */
function populateGames(system, games, startSystem, gamesElement, hidden, parents) {
    if( !parents ) parents = [];
    var gamesKeys = Object.keys(games);

    var startGameIndex = startSystem && startSystem.games && startSystem.games[system] ? gamesKeys.indexOf(startSystem.games[system].game) : 0;
    var startGameParentsString = startSystem && startSystem.games && startSystem.games[system] && startSystem.games[system].parents ? startSystem.games[system].parents : "";
    if( parentsArrayToString(parents) != startGameParentsString ) {
        startGameIndex = -1;
    }

    // For each of the games in the response
    for( var j=0; j<gamesKeys.length; j++) {
        var curParents = parents.slice(0);

        // Get the game object
        var game = games[gamesKeys[j]];

        // Create an element for the game
        var gameElement = document.createElement("div");
        gameElement.classList.add("game");
        gameElement.setAttribute("data-game", encodeURIComponent(game.game));
        gameElement.setAttribute("data-parents", parentsArrayToString( curParents ) );

        /* Begin Search Override */
        // see if there is a search, if so, check if this element matches
        if( currentSearch && termsMatch(currentSearch, game.game) ) {
            hidden = false;
        }
        else if(currentSearch) {
            hidden = true;
        }
        /* End Search Override */

        // Make sure all the selected games parent folders are shown (only if there is no search)
        // this is really only necessary when a game is moved on update as far as I know, since in all other
        // times, the menus should have been opened manually (causing startSystem.openFolders to take care of them)
        // we are checking if this is a folder in the selectedGame's parent list
        var tempHidden = true;
        if( !currentSearch && startSystem.games && startSystem.games[system] && startSystem.games[system].parents ) { // check for parents, some problems caused when first in list and deleting
            var tmpCurParents = curParents.slice(0);
            tmpCurParents.push(gamesKeys[j]);
            if( startSystem.system == system && startSystem.games[system].parents.startsWith(parentsArrayToString(tmpCurParents)) ) {
                hidden = false; // show self
                tempHidden = false; // show immediate children too
                // arrow indication
                gameElement.classList.add("children-showing");   
            }
        }

        // note if there are no parents string then we'll look for something top level
        if( !hidden ) {
            if( j==startGameIndex ) {
                gameElement.classList.add("selected");
            }
        }
        else  {
            gameElement.classList.add("hidden");
        }
        if( curParents.length ) {
            var folderText = curParents.join(" > ");
            var folderElement = document.createElement("div");
            folderElement.classList.add("game-folder");
            folderElement.innerText = folderText + " >";
            gameElement.appendChild(folderElement);
        }
        var gameTitleDiv = document.createElement("div");
        gameTitleDiv.classList.add("game-title");
        gameTitleDiv.innerText = game.game;
        gameElement.appendChild(gameTitleDiv);

        if(game.percent) {
            var gamePercentage = document.createElement("canvas");
            gamePercentage.setAttribute("width", 20);
            gamePercentage.setAttribute("height", 20);
            var context = gamePercentage.getContext("2d");
            context.fillStyle = "#FFFFFF";
            gameTitleDiv.appendChild(gamePercentage);
            context.beginPath();
            var radius = 10;
            var x = radius;
            var y = radius;
            context.moveTo(x, y);
            context.arc(x, y, radius, 0, 2 * Math.PI * game.percent /100);
            context.fill();
        }

        if( game.playing ) {
            gameElement.classList.add("playing");
        }

        // Create an element for the current save
        if( !game.isFolder && !nonSaveSystems.includes(system) ) {
            var currentSaveDiv = document.createElement("div");
            currentSaveDiv.classList.add("current-save");
            currentSaveDiv.innerText = game.currentSave;

            // Append the game element to the list of elements
            gameElement.appendChild(currentSaveDiv);
        }
        if( game.isFolder ) {
            gameElement.setAttribute("data-is-folder", "true");
        }
        if( game.isPlaylist ) {
            gameElement.setAttribute("data-is-playlist", "true");
        }
        if( game.status ) {
            gameElement.setAttribute("data-status", game.status);
        }
        if( game.percent ) {
            gameElement.setAttribute("data-percent", game.percent);
        }
        gamesElement.appendChild(gameElement);

        if( game.isFolder ) {
            // look in the openFolders dictionary
            // if we aren't hidden and we are supposed to be open, show children
            if( startSystem.openFolders && startSystem.openFolders[system] ) {
                for( var i=0; i<startSystem.openFolders[system].length; i++ ) {
                    var curTestItem = startSystem.openFolders[system][i];
                    if( curTestItem.game == game.game && JSON.stringify(curParents) == JSON.stringify(curTestItem.parents) ) {
                        if( !hidden ) tempHidden = false;
                        // arrow indication
                        // even if it is a hidden open folder, once visible, it's children will be too
                        gameElement.classList.add("children-showing");
                    }
                }
            }
            curParents.push(game.game);
            populateGames(system, game.games, startSystem, gamesElement, tempHidden, curParents);
        }
    }
}

/**
 * Determine if two terms match for searching.
 * @param {string} searchTerm - The first term.
 * @param {string} matchTerm - The second term.
 * @returns {boolean} True if the terms are a match.
 */
function termsMatch(searchTerm, matchTerm) {
    searchTerm = searchTerm.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g,"");
    matchTerm = matchTerm.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g,"");
    if( matchTerm.match(searchTerm) ) {
        return true;
    }
    return false;
}

/**
 * Save the current menu position.
 */
function saveMenuPosition() {
    window.localStorage.guystationStartSystem = JSON.stringify(generateStartSystem());
}

/**
 * Toggle what buttons are available to click.
 */
function toggleButtons() {

    var selectedSystem = document.querySelector(".system.selected");
    var selectedGame = selectedSystem.querySelector(".game.selected:not([data-status])");
    var launchGameButton = document.getElementById("launch-game");
    // Only allow a game to be launched if one is selected
    if( !selectedGame ) {
        launchGameButton.classList.add("inactive");
        launchGameButton.onclick = null;
    }
    else {
        launchGameButton.classList.remove("inactive");
        launchGameButton.onclick = function(e) { 
            e.stopPropagation();
            var selectedSystem = document.querySelector(".system.selected").getAttribute("data-system");
            var selectedGameElement = document.querySelector(".system.selected .game.selected");
            if( selectedGameElement ) {
                if( selectedGameElement.hasAttribute("data-is-folder") ) {
                    var parents = selectedGameElement.getAttribute("data-parents");
                    var game = decodeURIComponent(selectedGameElement.getAttribute("data-game"));

                    var likewiseElements = document.querySelectorAll('.system[data-system="'+selectedSystem+'"] .game[data-parents="'+parents+'"][data-game="'+encodeURIComponent(game)+'"]');
                    likewiseElements.forEach( function(gameElement) {
                        if( parents ) {
                            parents += UUID;
                        }
                        else {
                            parents = "";
                        }
                        parents += encodeURIComponent(game);
                        var children = document.querySelectorAll('.system[data-system="'+selectedSystem+'"] .game[data-parents^="'+parents+'"]');
                        if( gameElement.classList.contains("children-showing") ) {
                            // note the difference that cghildnre is anything that starts with here
                            gameElement.classList.remove("children-showing");
                            children.forEach( function(element) {
                                element.classList.add("hidden");
                            });
                        }
                        else {
                            gameElement.classList.add("children-showing");
                            children.forEach( function(element) {
                                // look at all the submenus and only open if they are open
                                var shouldOpen = true;
                                var myParents = parentsStringToArray( element.getAttribute("data-parents") );
                                var tmpParents = [];
                                for( var i=0; i<myParents.length; i++ ) {
                                    var parent = document.querySelector('.system[data-system="'+selectedSystem+'"] .game[data-game="'+encodeURIComponent(myParents[i])+'"][data-parents="'+parentsArrayToString(tmpParents)+'"]');
                                    if( !parent.classList.contains("children-showing") ) {
                                        shouldOpen = false;
                                        break;
                                    }
                                    tmpParents.push(myParents[i]);
                                }
                                if( shouldOpen ) element.classList.remove("hidden");
                            });
                        }
                    } );
                    saveMenuPosition(); // Save what folders are now open/closed
                }
                else {
                    launchGame( document.querySelector(".system.selected").getAttribute( "data-system" ), decodeURIComponent( selectedGameElement.getAttribute( "data-game" ) ), parentsStringToArray( selectedGameElement.getAttribute( "data-parents" ) ) );
                }
            }
        };
    }

    // Only allow a game to be quit if one is not selected
    var quitGameButton = document.getElementById("quit-game");
    var goHomeButton = document.getElementById("go-home");
    if( !document.querySelector(".system.playing, .game.playing") ) {
        quitGameButton.classList.add("inactive");
        quitGameButton.onclick = null;
    }
    else {
        quitGameButton.classList.remove("inactive");
        quitGameButton.onclick = function(e) { e.stopPropagation(); quitGame(); };
    }
    if( !document.querySelector(".system.playing, .game.playing") && !fullscreenPip ) {
        goHomeButton.classList.add("inactive");
        goHomeButton.onclick = null;
    }
    else {
        goHomeButton.classList.remove("inactive");
        goHomeButton.onclick = function(e) { e.stopPropagation(); goHome(); };
    }

    // Only allow browser if we are "playing" it
    var browserControlsButton = document.getElementById("browser-controls");
    var isPlaying = false;
    var browserGameKeys = Object.keys(systemsDict["browser"].games);
    for( var i=0; i<browserGameKeys.length; i++ ) {
        if( systemsDict["browser"].games[browserGameKeys[i]].playing ) isPlaying = true;
    }
    if( !isPlaying ) {
        browserControlsButton.onclick = null;
        browserControlsButton.classList.add("inactive");
    }
    else {
        browserControlsButton.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#browser-controls-form") ) displayBrowserControls(); };
        browserControlsButton.classList.remove("inactive");
    }

    // Only allow media if we are "on" a playable file
    var remoteMediaButton = document.getElementById("remote-media");
    if( selectedSystem.getAttribute("data-system") == "media" && selectedGame && !selectedGame.hasAttribute("data-is-folder") && !selectedGame.hasAttribute("data-is-playlist") && !selectedGame.hasAttribute("data-status") ) {
        remoteMediaButton.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#remote-media-form") ) { autoplayMedia = false; displayRemoteMedia(); } };
        remoteMediaButton.classList.remove("inactive");
    }
    // folder
    else if( selectedSystem.getAttribute("data-system") == "media" && selectedGame && selectedGame.hasAttribute("data-is-folder") ) {
        var parents = selectedGame.getAttribute("data-parents");
        var game = decodeURIComponent(selectedGame.getAttribute("data-game"));
        parents = parentsStringToArray( parents );
        // If we have some pure media that are not playlists, downloading, subfolders, etc.
        var folderEntries = removeNotDownloaded(removePlaylists(filterGameTypes( getGamesInFolder( parents, selectedSystem.getAttribute("data-system") )[game].games, false)));
        if( Object.keys(folderEntries).length ) {

            remoteMediaButton.onclick = function(e) { 
                e.stopPropagation(); 
                if( !document.querySelector("#remote-media-form") ) {
                    var parents = selectedGame.getAttribute("data-parents");
                    var game = decodeURIComponent(selectedGame.getAttribute("data-game"));
                    parents = parentsStringToArray( parents );
                    // play the pure media only (note this is what playNextMedia does too)
                    var folderEntries = removeNotDownloaded(removePlaylists(filterGameTypes( getGamesInFolder( parents, selectedSystem.getAttribute("data-system") )[game].games, false)));
                    parents.push( game );
                    autoplayMedia = true;
                    displayRemoteMedia( selectedSystem.getAttribute("data-system"), folderEntries[ Object.keys(folderEntries)[0] ].game, parents ); 
                }
            };
            remoteMediaButton.classList.remove("inactive");

        }
        else {
            remoteMediaButton.onclick = null;
            remoteMediaButton.classList.add("inactive");
        }
    }
    // playlist
    else if( selectedSystem.getAttribute("data-system") == "media" && selectedGame && selectedGame.hasAttribute("data-is-playlist") ) {
        remoteMediaButton.onclick = function(e) { 
            e.stopPropagation(); 
            if( !document.querySelector("#remote-media-form") ) {
                var parents = selectedGame.getAttribute("data-parents");
                var game = decodeURIComponent(selectedGame.getAttribute("data-game"));
                parents = parentsStringToArray( parents );
                var playlistEntry = getGamesInFolder( parents, selectedSystem.getAttribute("data-system"), true )[game];
                parents.push( game );
                autoplayMedia = true;
                displayRemoteMedia( selectedSystem.getAttribute("data-system"), playlistEntry.games[ Object.keys(playlistEntry.games)[0] ].game, parents ); 
            }
        };
        remoteMediaButton.classList.remove("inactive");
    }
    // screenshots
    else if( nonSaveSystems.indexOf(selectedSystem.getAttribute("data-system")) == -1 && selectedGame 
        && getAllScreenshots(selectedSystem.getAttribute("data-system"), decodeURIComponent(selectedGame.getAttribute("data-game")), parentsStringToArray(selectedGame.getAttribute("data-parents")) ).length > 0 ) {
        remoteMediaButton.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#remote-media-form-screenshots") ) displayRemoteMediaScreenshots(); };
        remoteMediaButton.classList.remove("inactive");
    }
    // browser
    else if( selectedSystem.getAttribute("data-system") == "browser" && selectedGame ) {
        remoteMediaButton.onclick = function(e) { e.stopPropagation(); openRemoteMediaBrowser(); };
        remoteMediaButton.classList.remove("inactive");
    }
    else {
        remoteMediaButton.onclick = null;
        remoteMediaButton.classList.add("inactive");
    }

    var screencastButton = document.getElementById("screencast");
    if( !isServer ) {
        screencastButton.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#remote-screencast-form") ) displayScreencast(); };
        screencastButton.classList.remove("inactive");
    }
    else {
        screencastButton.onclick = null;
        screencastButton.classList.add("inactive");
    }

    // Only allow save configuration menus and update/delete game menus if there is at least one game
    var anyGame = document.querySelector(".game:not([data-game='Browser'])");
    var anySave = document.querySelector(".game .current-save")
    //var anyGameNotFolder = document.querySelector(".game:not([data-is-folder])");
    var updateGameButton = document.getElementById("update-game");
    var deleteGameButton = document.getElementById("delete-game");
    var addSaveButton = document.getElementById("add-save");
    var changeSaveButton = document.getElementById("change-save");
    var updateSaveButton = document.getElementById("update-save");
    var deleteSaveButton = document.getElementById("delete-save");
    var joypadConfigButton = document.getElementById("joypad-config");
    //var messagingButton = document.getElementById("messaging");
    if( !anyGame ) {
        updateGameButton.onclick = null; 
        updateGameButton.classList.add("inactive");
        deleteGameButton.onclick = null;
        deleteGameButton.classList.add("inactive");
    }
    else {
        updateGameButton.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#update-game-form") ) displayUpdateGame(); };
        updateGameButton.classList.remove("inactive");
        deleteGameButton.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#delete-game-form") ) displayDeleteGame(); };
        deleteGameButton.classList.remove("inactive");
    }
    if(!anySave) {
        addSaveButton.onclick = null;
        addSaveButton.classList.add("inactive");
        changeSaveButton.onclick = null;
        changeSaveButton.classList.add("inactive");
        updateSaveButton.onclick = null;
        updateSaveButton.classList.add("inactive");
        deleteSaveButton.onclick = null;
        deleteSaveButton.classList.add("inactive");
    }
    else {
        addSaveButton.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#add-save-form") ) displayAddSave(); };
        addSaveButton.classList.remove("inactive");
        updateSaveButton.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#update-save-form") ) displayUpdateSave(); };
        updateSaveButton.classList.remove("inactive");
        changeSaveButton.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#change-save-form") ) displaySelectSave(); };
        changeSaveButton.classList.remove("inactive");
        deleteSaveButton.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#delete-save-form") ) displayDeleteSave(); };
        deleteSaveButton.classList.remove("inactive");
    }
    
    // Always allow add game
    document.getElementById("add-game").onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#add-game-form") ) displayAddGame(); };
 
    // Always allow joypad config
    joypadConfigButton.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#joypad-config-form") ) displayJoypadConfig(); };

    // Always allow messaging
    messaging.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#messaging-form") ) displayMessaging(); }

    // Always allow power controls
    document.getElementById("power-options").onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#power-options-form") ) displayPowerOptions(); }

    // always allow pip
    document.getElementById("picture-in-picture").onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#pip-form") ) displayPictureInPicture(); }
}

/**
 * Determine if a game is being played.
 * @param {string} system - The system to check.
 * @param {string} game - The game to check.
 * @param {Array<string>} parents - The parents of the game.
 * @returns {boolean} - Whether the game is being played or not.
 */
function isBeingPlayed( system, game, parents ) {
    var gameInFolder = getGamesInFolder(parents, system)[game];
    if( systemsDict[system] && gameInFolder && gameInFolder.playing ) return true;
    return false;
}

/**
 * Do a redraw maintaining the current position.
 * @param {string} [oldSystemName] - The old name of the system if it changed.
 * @param {string} [newSystemName] - The new name of the system if it changed (null if it was deleted).
 * @param {string} [oldGameName] - The old name of the game if it changed.
 * @param {string} [newGameName] - The new name of the game if it changed (null if it was deleted).
 * @param {Array<string>} [oldParents] - The old parents if it changed.
 * @param {Array<string>} [newParents] - The new parents if it changed.
 * @param {boolean} [keepCurrentSearch] - Keep the current search (only in place on a search to not blank out search, other than that we don't want redraw to keep a search).
 */
function redraw( oldSystemName, newSystemName, oldGameName, newGameName, oldParents, newParents, keepCurrentSearch ) {
    if( !keepCurrentSearch ) {
        clearSearch();
    }
    draw( generateStartSystem( oldSystemName, newSystemName, oldGameName, newGameName, oldParents, newParents ) );
}

/**
 * Get all the open folders.
 * @param {Object} games - A games object (e.g. systems[system].games).
 * @param {Array} arr - An array that will be populated by the function.
 * @param {Array<string>} parents - The parents of the current games object.
 * @param {string} system - The system the folders are for.
 * @param {string} [oldSystemName] - The old name of the system if it changed.
 * @param {string} [newSystemName] - The new name of the system if it changed (null if it was deleted).
 * @param {string} [oldGameName] - The old name of the game if it changed.
 * @param {string} [newGameName] - The new name of the game if it changed (null if it was deleted).
 * @param {Array<string>} [oldParents] - The old parents if it changed.
 * @param {Array<string>} [newParents] - The new parents if it changed.
 */
function getOpenFolders(games, arr, parents, system, oldSystemName, newSystemName, oldGameName, newGameName, oldParents, newParents) {
    for( var game of Object.keys(games) ) {
        var curParents = parents.slice(0);
        var gameEntry = games[game];
        if( gameEntry.isFolder ) {

            var lookingSystem = system;
            var lookingGame = game;
            var lookingParents = curParents.slice(0);
            
            // For deletes, we just don't care. Literally just ignore.

            if( oldParents && newParents ) {
                // check if we need to update game and parents while we look
                if( system == newSystemName && game == newGameName && JSON.stringify(curParents) == JSON.stringify(newParents) ) {
                    lookingGame = oldGameName;
                    lookingParents = oldParents.slice(0);
                    lookingSystem = oldSystemName;
                }
                // check if we need to update parents while we look, because what we updated was a folder
                else {
                    var newParentsPlusNewFolderName = newParents.slice(0);
                    newParentsPlusNewFolderName.push( newGameName ) ;
                    var oldParentsPlusOldFolderName = oldParents.slice(0);
                    oldParentsPlusOldFolderName.push( oldGameName );
                    // check to see if the current item had the updated folder as part of its parents
                    if( parentsArrayToString(curParents).startsWith( parentsArrayToString(newParentsPlusNewFolderName) ) ) {
                        lookingParents = parentsStringToArray( parentsArrayToString(curParents).replace( parentsArrayToString(newParentsPlusNewFolderName), parentsArrayToString(oldParentsPlusOldFolderName) ) );
                        lookingSystem = oldSystemName;
                    }
                }
            }

            var lookingElement = document.querySelector('.system[data-system="'+lookingSystem+'"] .game[data-game="'+encodeURIComponent(lookingGame)+'"][data-parents="'+parentsArrayToString(lookingParents)+'"]');
            if( lookingElement && lookingElement.classList.contains("children-showing") ) {
                var cpyGameEntry = JSON.parse( JSON.stringify(gameEntry ));
                cpyGameEntry.parents = curParents.slice(0);
                arr.push(cpyGameEntry);
            }

            curParents.push( gameEntry.game );
            getOpenFolders(gameEntry.games, arr, curParents, system, oldSystemName, newSystemName, oldGameName, newGameName, oldParents, newParents);
        }
    }
}

/**
 * Generate a startSystem object that can be passed to the draw function to start at the current position in the menu.
 * @param {string} [oldSystemName] - The old name of the system if it changed.
 * @param {string} [newSystemName] - The new name of the system if it changed (null if it was deleted).
 * @param {string} [oldGameName] - The old name of the game if it changed.
 * @param {string} [newGameName] - The new name of the game if it changed (null if it was deleted).
 * @param {Array<string>} [oldParents] - The old parents if it changed.
 * @param {Array<string>} [newParents] - The new parents if it changed.
 * @returns {Object} An object that can be passed to the draw function to start - include the parents string and game.
 */
function generateStartSystem( oldSystemName, newSystemName, oldGameName, newGameName, oldParents, newParents ) {
    var currentSystem = document.querySelector(".system.selected").getAttribute("data-system");
    var systems = document.querySelectorAll(".system");
    var games = {};
    var openFolders = {};

    for(var i=0; i<systems.length; i++) {
        var selectedGameElement = systems[i].querySelector(".game.selected"); // guaranteed since takes place before redraw
        var selectedGame = null;
        var selectedParents = null;
        var useNewParents = false;
        if( selectedGameElement ) {
            selectedGame = decodeURIComponent(selectedGameElement.getAttribute("data-game"));
            selectedParents = selectedGameElement.getAttribute("data-parents"); 
            // newGameName being null means the game was deleted, we have to try to get a close by index
            // also if we are changing systems we want to do a delete
            // it's ok if we leave the folder - there will always be a previous sibling and that will the folder in some cases
            // which is fine
            // deleting an item might also delete a playlist(s) if it was the last item in the list(s) which might result in the previous/next sibling being removed. In this case, we restart at the top but should we?
            if( systems[i].getAttribute("data-system") == oldSystemName && selectedGame == oldGameName && selectedParents == parentsArrayToString(oldParents) && (newGameName === null || oldSystemName != newSystemName) ) {
                if( selectedGameElement.previousElementSibling ) {
                    selectedGameElement = selectedGameElement.previousElementSibling;
                    selectedGame = decodeURIComponent(selectedGameElement.getAttribute("data-game"));
                }
                else if( selectedGame.nextElementSibling ) {
                    selectedGameElement = selectedGameElement.nextElementSibling;
                    selectedGame = decodeURIComponent(selectedGameElement.getAttribute("data-game"));
                }
                // No games left
                else {
                    selectedGame = null;
                    selectedGameElement = null;
                }
            }
            // If the game name is updated, we'll have to change it
            else if( systems[i].getAttribute("data-system") == oldSystemName && selectedGame == oldGameName && selectedParents == parentsArrayToString(oldParents) ) {
                selectedGame = newGameName;
                useNewParents = true;
            }
            if( selectedGameElement ) selectedParents = selectedGameElement.getAttribute("data-parents"); 
        }
        games[systems[i].getAttribute("data-system")] = { "game": selectedGame, "parents": newParents && useNewParents ? parentsArrayToString( newParents ) : selectedParents };
        
        var systemGames = systemsDict[systems[i].getAttribute("data-system")].games;
        if( systemGames ) {
            var arr =[];
            // We need to update this to take into account updated folder names and deleted items
            // i guess we should just pass em in.
            getOpenFolders( systemGames, arr, [], systems[i].getAttribute("data-system"), oldSystemName, newSystemName, oldGameName, newGameName, oldParents, newParents );
            openFolders[systems[i].getAttribute("data-system")] = arr;
        }
    }
    return { system: currentSystem, games: games, openFolders: openFolders };
}

/**
 * Get the index of an array given a starting position and offset if treating the array like a circle.
 * @param {number} index - The starting index.
 * @param {Array} arr - The array to find the index of.
 * @param {number} offset - The offset amount.
 * @returns {number} The index.
 */
function getIndex( index, arr, offset ) {
    if( index + offset >= arr.length ) {
        return ( index + offset ) % arr.length;
    }
    else if( index + offset < 0 ) {
        var val = arr.length + ( index + offset ) % arr.length;
        if( val == arr.length ) val = 0;
        return val;
    }
    else {
        return index + offset;
    }
}

/**
 * Move the menu a given number of spaces.
 * @param {number} spaces - The number of spaces to move the menu.
 */
function moveMenu( spaces ) {
    resetBubbleScreenshots();
    // Modulo the number of spaces to move if beyond the list size
    spaces = spaces % (expandCountLeft + expandCountRight + 1);
    // The currently selected system is no longer selected
    document.querySelector(".system.selected").classList.remove("selected");
    // Get all the systems
    var systems = document.querySelectorAll(".system");
    for( var i=0; i<systems.length; i++ ) {
        systems[i].classList.remove("no-transition"); // Return all elements to default transition

        // Get the current offset of the system
        var offset = systems[i].style.transform;
        if( offset ) {
            offset = parseInt(offset.match(/([\+\-]?\s?\d+)px/)[1].replace(/\s/,""));
        }
        else {
            offset = 0;
        }
        offset += spaces * SPACING;

        // wrap the fringe elements, temporarily disabling their transition so they don't
        // fly across the screen
        if( offset > SPACING * expandCountRight ) {
            offset -= (SPACING * expandCountLeft + SPACING * expandCountRight) + SPACING;
            systems[i].classList.add("no-transition");
        }
        else if( offset < (-SPACING * expandCountLeft) ) {
            offset += (SPACING * expandCountLeft + SPACING * expandCountRight) + SPACING;
            systems[i].classList.add("no-transition");
        }

        // If this element's offset is 0, it is now selected
        if( offset == 0 ) {
            systems[i].classList.add("selected");
        }
        // Set the offset
        systems[i].style.transform = "translateX( calc( -50% + "+(offset)+"px ) )translateY(-50%)";
    }
    toggleButtons();
    saveMenuPosition();
    setMarquee();
    displayGamePreview();
}

/**
 * Move the sub menu a given spaces.
 * @param {number} spaces - The number of spaces to move the submenu.
 */
function moveSubMenu( spaces ) {
    resetBubbleScreenshots();
    // We have to update all systems
    // Get the currently selected system
    var currentSystem = document.querySelector(".system.selected").getAttribute("data-system");
    // Get all menu items matching that system
    var subMenus = document.querySelectorAll(".system[data-system='"+currentSystem+"'] .games");
    // Get the height of elements
    var height;
    try {
        height = document.querySelector(".game:not(.hidden)").offsetHeight;
    }
    catch(err) {
        // there is no visible element to move
        return;
    }

    // For each matching submenu
    for( var i=0; i<subMenus.length; i++ ) {
        var subMenu = subMenus[i];

        var currentOffset = subMenu.style.transform;

        // Get the current offset of the sub menu
        if( currentOffset ) {
            currentOffset = parseInt(currentOffset.match(/(\-?\d+)px/)[1].replace(/\s/,""));
        }
        else {
            currentOffset = 0;
        }

        // Get the list of all the games in the submenu
        var games = subMenu.querySelectorAll(".game:not(.hidden)");
        // Don't do anything if there aren't any games
        if( games.length == 0 ) {
            continue;
        }

        // Get the current selected index
        // Since the submenu will move up one space (one "height") when we 
        // get the next item, we have to multiple by -1
        // when basing the index off the offset of the submenu
        var currentIndex = currentOffset/height * -1;
        // Calculate the new index
        var newIndex = getIndex( currentIndex, games, spaces );
        // Get the new offset, once again multiplying by negative 1 to
        // give us a negative number (or 0)
        var newOffset = newIndex * height * -1;

        // No game is currently selected
        subMenu.querySelector(".game.selected").classList.remove("selected");

        // If the game is above the selected game, hide it
        for( var j=0; j<newIndex; j++ ) {
            games[j].classList.add("above");
        }
        // Select the game
        games[newIndex].classList.add("selected");
        // Otherwise make sure the game is shown
        for( var j=newIndex; j<games.length; j++ ) {
            games[j].classList.remove("above");
        }
        // do this to make sure we get hidden games removed "above"
        // it doesn't matter for adding above, since they are hidden anyway
        var nextElement = games[newIndex].nextElementSibling;
        while( nextElement ) {
            nextElement.classList.remove("above");
            nextElement = nextElement.nextElementSibling;
        }

        // Set the submenu offset
        subMenu.style.transform = "translateY("+newOffset+"px)";
    }
    toggleButtons();
    saveMenuPosition();
    setMarquee();
    displayGamePreview();
}

/**
 * Determine if an element is a leaf element.
 * @param {HTMLElement} element - The game element to consider.
 * @param {string} system - The system the game is on.
 * @returns {boolean} - True if the element is a leaf node, false if it is not.
 */
function isLeafElement(element, system) {
    var parents = parentsStringToArray(element.getAttribute("data-parents"));
    parents.push( decodeURIComponent(element.getAttribute("data-game")) );
    var parentsString = parentsArrayToString(parents);
    return document.querySelector('.system[data-system="'+system+'"] .game[data-parents="'+parentsString+'"]') ? false : true;
}

/**
 * Get the selected values to display in menus.
 * so first it will look at the selected item, then it will look for items in the same folder, then it will look for any item, then any system
 * of course changeSystem will not look at any selected system, since we are assured the one we are on is valid before switching
 * of course changeFolders will not look at system nor any item, since we are assured there is one in the same folder before switching
 * @param {boolean} systemSaveAllowedOnly - True if we should only consider systems that allow for saves - the current save will not be returned without it.
 * @param {boolean} noFolders - True if we should exclude all folders from consideration - the current save will not be returned without it.
 * @param {boolean} onlyWithLeafNodes - True if we should only allow leaf nodes (empty folders or games).
 * @returns {Object} an object with selected values.
 */
function getSelectedValues(systemSaveAllowedOnly, noFolders, onlyWithLeafNodes) {
    var currentSystemElement = document.querySelector(".system.selected");
    var currentSystem = currentSystemElement.getAttribute("data-system");
    var currentGame = "";
    var currentSave = "";
    var currentParents = [];
    var highlighted = false;

    var currentGameElement = document.querySelector(".system.selected .game.selected");
    var gameElementParentsString;
    if( currentGameElement ) gameElementParentsString = currentGameElement.getAttribute("data-parents");
    var excludeArray = systemSaveAllowedOnly ? nonSaveSystems : nonGameSystems;
    if( currentGameElement && !excludeArray.includes(currentSystem) 
        && (!noFolders || !currentGameElement.hasAttribute("data-is-folder")) 
        && (!onlyWithLeafNodes || isLeafElement(currentGameElement, currentSystem) ) ) {
        // We have a currently selected game we can use
        currentGame = decodeURIComponent(currentGameElement.getAttribute("data-game"));
        currentParents = parentsStringToArray(gameElementParentsString);
        if( systemSaveAllowedOnly && noFolders ) {
            currentSave = currentGameElement.querySelector(".current-save").innerText;
        }
        highlighted = true; // The system is selected to the user
    }
    // We have an item, but its a folder, and we aren't allowing folders
    // Try to find another item in the same system and folder that is not a folder
    // note how we know know we don't want a folder
    else if( noFolders && currentGameElement && !excludeArray.includes(currentSystem) && document.querySelector('.system.selected .game[data-parents="'+gameElementParentsString+'"]:not([data-is-folder])') ) {
        currentGameElement = document.querySelector('.system.selected .game[data-parents="'+gameElementParentsString+'"]:not([data-is-folder])');
        currentGame = decodeURIComponent(currentGameElement.getAttribute("data-game"));
        currentParents = parentsStringToArray(currentGameElement.getAttribute("data-parents"));
        if( systemSaveAllowedOnly && noFolders ) {
            currentSave = currentGameElement.querySelector(".current-save").innerText;
        }
    }
    // We have an item, but its a non-leaf node, and we aren't allowing those
    // DO the same as above
    else if( onlyWithLeafNodes && currentGameElement && !excludeArray.includes(currentSystem) && Array.prototype.slice.call(document.querySelectorAll('.system.selected .game[data-parents="'+gameElementParentsString+'"]')).filter( (el) => isLeafElement(el, currentSystem) ).length ) {
        currentGameElement = Array.prototype.slice.call(document.querySelectorAll('.system.selected .game[data-parents="'+gameElementParentsString+'"]')).filter( (el) => isLeafElement(el, currentSystem) )[0];
        currentGame = decodeURIComponent(currentGameElement.getAttribute("data-game"));
        currentParents = parentsStringToArray(currentGameElement.getAttribute("data-parents"));
    }
    // We've failed at finding an item in the same folder, so try to find any item that is not a folder in the system
    // we don't bother to try to find highest level first in this and in createSystemMenu?
    else if( noFolders && currentGameElement && !excludeArray.includes(currentSystem) && document.querySelector(".system.selected .game:not([data-is-folder])") ) {
        currentGameElement = document.querySelector(".system.selected .game:not([data-is-folder])");
        currentGame = decodeURIComponent(currentGameElement.getAttribute("data-game"));
        currentParents = parentsStringToArray(currentGameElement.getAttribute("data-parents"));
        if( systemSaveAllowedOnly && noFolders ) {
            currentSave = currentGameElement.querySelector(".current-save").innerText;
        }
    }
    // We have an item, but its a non-leaf node, and we aren't allowing those
    // DO the same as above
    else if( onlyWithLeafNodes && currentGameElement && !excludeArray.includes(currentSystem) && Array.prototype.slice.call(document.querySelectorAll('.system.selected .game')).filter( (el) => isLeafElement(el, currentSystem) ).length ) {
        currentGameElement = Array.prototype.slice.call(document.querySelectorAll('.system.selected .game')).filter( (el) => isLeafElement(el, currentSystem) )[0];
        currentGame = decodeURIComponent(currentGameElement.getAttribute("data-game"));
        currentParents = parentsStringToArray(currentGameElement.getAttribute("data-parents"));
    }
    else {
        // We'll have to use a different system
        var nots = excludeArray.map( el => { return ":not([data-system='" + el + "'])"} ).join("");
        var selector = ".system" + nots + " .game.selected";
        if( noFolders ) {
            selector += ":not([data-is-folder])";
        }
        var anySelectedGameElements = Array.prototype.slice.call(document.querySelectorAll(selector));
        if( onlyWithLeafNodes ) {
            anySelectedGameElements = anySelectedGameElements.filter( (el) => isLeafElement(el, currentSystem) );
        }
        var anySelectedGameElement = anySelectedGameElements[0];
        if( anySelectedGameElement ) {
            currentSystem = anySelectedGameElement.closest(".system").getAttribute("data-system");
            currentGame = decodeURIComponent(anySelectedGameElement.getAttribute("data-game"));
            currentParents = parentsStringToArray(anySelectedGameElement.getAttribute("data-parents"));
            if( systemSaveAllowedOnly && noFolders ) {
                currentSave = anySelectedGameElement.querySelector(".current-save").innerText;
            }
        }
        else {
            // If there is no selected game, the only thing this can be if the menu is shown
            // is add game, meaning we don't need a selected game.
        }
    }

    return { system: currentSystem, game: currentGame, save: currentSave, parents: currentParents, highlighted: highlighted };
}

/**
 * Open a browser link remotely.
 */
function openRemoteMediaBrowser() {
    var selected = getSelectedValues();
    var jsonUrl = "/" + ["systems", "browser", "games"].concat(selected.parents).concat([encodeURIComponent(selected.game), "metadata.json"]).join("/");
    makeRequest( "GET", jsonUrl, {}, function(responseText) {
        var data = JSON.parse(responseText);
        // They may have the GuyStation remote chrome extension installed which allows us to run scripts remotely.
        if( typeof gsExtensionRunScript !== 'undefined' ) {
            gsExtensionRunScript( data.siteUrl, data.script );
        }
        else {
            window.open(data.siteUrl, "_blank");
        }
    }, null, null, null, true );
}

/**
 * Display remote media for a game - an album of screenshots.
 * This should not be shown if there are no screenshots.
 */
function displayRemoteMediaScreenshots() {
    var form = document.createElement("div");
    form.setAttribute("id", "remote-media-form-screenshots");
    var selected = getSelectedValues();
    form.appendChild( createFormTitle(selected.game + " Screenshots") );

    var screenshots = getAllScreenshots(selected.system, selected.game, selected.parents);
    for( var i=0; i<screenshots.length; i++ ) {
        var img = document.createElement("img");
        img.setAttribute("src", screenshots[i]);
        if( i>0 ) img.classList.add("hidden");
        form.appendChild(img);
    }

    var nextScreenshot = function(offset) {
        var imgElement = document.querySelector('.modal #remote-media-form-screenshots img:not(.hidden)');
        var imgElements = document.querySelectorAll('.modal #remote-media-form-screenshots img');
        var elementIndex = Array.prototype.indexOf.call( imgElements, imgElement );
        var newIndex = getIndex( elementIndex, imgElements, offset );
        var newElement = imgElements[newIndex];
        imgElement.classList.add("hidden");
        newElement.classList.remove("hidden");
        document.querySelector("#remote-media-form-screenshots .current-position").innerText = newIndex+1;
    };

    var backButton = createButton( '<i class="fas fa-chevron-left"></i>', function() {
        nextScreenshot(-1);
    } );
    backButton.setAttribute("id", "previous-screenshot");
    var forwardButton = createButton( '<i class="fas fa-chevron-right"></i>', function() {
        nextScreenshot(1);
    } );
    forwardButton.setAttribute("id", "next-screenshot");
    form.appendChild( backButton );
    form.appendChild( forwardButton );

    form.appendChild(createPositionIndicator( 1, screenshots.length ));

    launchModal(form);
}

/**
 * Display remote media controls.
 * @param {string} [system] - The system to look at instead of the selected system.
 * @param {string} [game] - The game to look at instead of the selected game.
 * @param {Array<string>} [parents] - The parents to look at instead of the selected parents.
 * @param {boolean} [serverLaunched] - True if the modal was launched by the server (will call quitGame when modal closed).
 */
function displayRemoteMedia(system, game, parents, serverLaunched) {
    var form = document.createElement("div");
    form.setAttribute("id", "remote-media-form");
    var selected = getSelectedValues();
    if( system ) selected.system = system;
    if( game ) selected.game = game;
    if( parents ) selected.parents = parents;

    var isPlaylistMedia = JSON.stringify(getGamesInFolder(selected.parents, selected.system, false)) != JSON.stringify(getGamesInFolder(selected.parents, selected.system, true));
    var title = selected.game;
    if( isPlaylistMedia ) {
        title = title.split(SERVER_PLAYLIST_SEPERATOR);
        title = title[title.length-1];
    }

    var path = ["systems", encodeURIComponent(selected.system), "games"].concat(selected.parents).concat([encodeURIComponent(selected.game), encodeURIComponent(getGamesInFolder(selected.parents, selected.system, true)[selected.game].rom)]).join("/");
    form.appendChild( createFormTitle(title) );
    var videoElement = document.createElement("video");
    videoElement.setAttribute("controls", "true");
    videoElement.setAttribute("autoplay", "true");
    if( autoplayMedia || isPlaylistMedia ) { // the server can't launch folder media, so we don't need the autoplayMedia flag on the server, we can just autoplay or not based on whether it is a playlist
        videoElement.addEventListener( "ended", function() {
            playNextMedia(1);
        });
    }
    var sourceElement = document.createElement("source");
    sourceElement.setAttribute("src", path);
    videoElement.appendChild(sourceElement);
    videoElement.setAttribute( "data-system", selected.system );
    videoElement.setAttribute( "data-game", encodeURIComponent(selected.game) );
    videoElement.setAttribute( "data-parents", parentsArrayToString( selected.parents ) );
    form.appendChild(videoElement);

    var backButton = createButton( '<i class="fas fa-chevron-left"></i>', function() {
        previousMedia();
    } );
    backButton.setAttribute("id", "previous-media");
    var forwardButton = createButton( '<i class="fas fa-chevron-right"></i>', function() {
        playNextMedia(1);
    } );
    forwardButton.setAttribute("id", "next-media");
    form.appendChild( backButton );
    form.appendChild( forwardButton );

    if(serverLaunched) {
        form.setAttribute("data-is-server-launched", "true");
    }

    var parentGameDictEntryGamesKeys = Object.keys(removeNotDownloaded(removePlaylists(filterGameTypes(getGamesInFolder(selected.parents, selected.system, true), false))));
    var elementIndex = parentGameDictEntryGamesKeys.indexOf( selected.game );
    form.appendChild(createPositionIndicator( elementIndex+1, parentGameDictEntryGamesKeys.length ));
    
    launchModal( form, function() { if(serverLaunched) { quitGame(); } }, serverLaunched ? true : false );
}

/**
 * Go to the previous media with the option to restart the current
 * media if time is past 5 seconds.
 */
function previousMedia() {
    var videoElement = document.querySelector(".modal #remote-media-form video");
    if( videoElement ) {
        if( videoElement.currentTime > 5 ) {
            videoElement.currentTime = 0;
        }
        else {
            playNextMedia(-1);
        }
    }
}

/**
 * Play the next piece of media in a folder.
 * @param {number} offset - The offset of media to play.
 */
function playNextMedia(offset) {
    if( !offset ) offset = 1;
    var video = document.querySelector(".modal #remote-media-form video");
    if( video ) {
        var system = video.getAttribute("data-system");
        var game = decodeURIComponent(video.getAttribute("data-game"));
        var parents = parentsStringToArray(video.getAttribute("data-parents"));
        var parentGameDictEntryGamesKeys = Object.keys(removeNotDownloaded(removePlaylists(filterGameTypes(getGamesInFolder(parents, system, true), false))));
        var elementIndex = parentGameDictEntryGamesKeys.indexOf( game );
        var newIndex = getIndex( elementIndex, parentGameDictEntryGamesKeys, offset );
        var newGame = parentGameDictEntryGamesKeys[newIndex];
        var isServerLaunched = document.querySelector(".modal #remote-media-form").hasAttribute("data-is-server-launched");
        // If this is a server game using remote media, we want to launch a new game in the same fashion
        // the server will call diplayRemoteMedia after the server does what it needs too
        if( isServerLaunched ) {
            launchGame( system, newGame, parents );
        }
        // Otherwise this is plain old remote media, so we just want to open a new modal with the new system
        else {
            closeModalCallback = null;
            displayRemoteMedia( system, newGame, parents );
        }
    }
}

/**
 * Minimize the remote media (for server calls only).
 */
function minimizeRemoteMedia() {
    var remoteMedia = document.querySelector("#remote-media-form");
    if( remoteMedia && !document.querySelector("#remote-media-placeholder") ) {
        var remoteMediaPlaceholder = document.createElement("div");
        remoteMediaPlaceholder.setAttribute("id", "remote-media-placeholder");
        remoteMediaPlaceholder.appendChild(remoteMedia);
        document.body.appendChild(remoteMediaPlaceholder);
        // we don't want to quit the game on minimize
        closeModalCallback = null;
        closeModal(true);
    }
}

/**
 * Maximize the remote media (for server calls only).
 * This is a no-op is there is no remote media already minimized.
 */
function maximizeRemoteMedia() {
    var remoteMediaPlaceholder = document.querySelector("#remote-media-placeholder");
    if( remoteMediaPlaceholder ) {
        var remoteMedia = remoteMediaPlaceholder.querySelector("#remote-media-form");
        launchModal( remoteMedia, function() { if( document.querySelector("#remote-media-form").hasAttribute("data-is-server-launched") ) { quitGame(); } }, true );
        remoteMediaPlaceholder.parentElement.removeChild(remoteMediaPlaceholder);
    }
}

/**
 * Remove the remote media placeholder if it exists. (for server calls only).
 */
function removeRemoteMediaPlaceholder() {
    var remoteMediaPlaceholder = document.querySelectorAll("#remote-media-placeholder"); // just in case remove all
    if( remoteMediaPlaceholder.length ) {
        remoteMediaPlaceholder.forEach(function(placeholder) {
            placeholder.parentElement.removeChild(placeholder);
        } );
    }
}

/**
 * Determine if remote media is being played (for server calls only).
 * @param {string} system - The system to determine if being played.
 * @param {string} game - The game to determine if being played.
 * @param {Array<string>} parents - The parents of the game being determined if it is being played.
 * @returns {boolean} - True if remote media is being played.
 */
function isRemoteMediaPlaying( system, game, parents ) {
    return document.querySelector('#remote-media-form[data-is-server-launched] video[data-system="'+system+'"][data-game="'+encodeURIComponent(game)+'"][data-parents="'+parentsArrayToString(parents)+'"]') ? true : false;
}

/**
 * Determine if remote media is active (for server calls only).
 * @returns {boolean} - True if remote media is being played.
 */
function isRemoteMediaActive() {
    return document.querySelector(".modal #remote-media-form[data-is-server-launched]") ? true : false;
}

/**
 * Determine if interaction is happening (for server calls only).
 * @returns {boolean} - True if interaction is happening.
 */
function isInteractionHappening() {
    return document.querySelector(".modal, #functions.open") ? true : false;
}

/**
 * Display the browser control menu.
 * Note: The web requests here aren't handled synchnously necessarily (why we don't set making request).
 * We let node queue them and run them in order.
 */
function displayBrowserControls() {
    var form = document.createElement("div");
    form.setAttribute("id", "browser-controls-form");
    form.appendChild( createFormTitle("Browser Control") );

    // clear out the value in current address so it can be updated
    currentAddress = "";

    sendString = "";
    var forwardInputLabel = createInput( "", "forward-input", "Mobile Forward Input: " );
    form.appendChild( forwardInputLabel );

    form.appendChild( createInput( "", "address-bar", "Address: " ) );
    var endNavigation = function() { navigating = false; };
    var goButton = createButton( "Go", function() {
        navigating = true;
        currentAddress = ""; // Clear out the current address so a new one can show up
        makeRequest("POST", "/browser/navigate", {url: document.querySelector("#address-bar").value}, endNavigation, endNavigation);
    } );
    goButton.setAttribute("id", "go-button");
    form.appendChild( goButton );
    form.appendChild( createButton( "Refresh", function() {
        navigating = true;
        currentAddress = ""; // Clear out the current address so a new one can show up
        makeRequest("GET", "/browser/refresh", {}, endNavigation, endNavigation);
    } ) );

    var tabsDiv = document.createElement("div");
    tabsDiv.setAttribute("id", "browser-tabs");
    form.appendChild( tabsDiv );

    var upButton = createButton( '<i class="fas fa-chevron-up"></i>', function() {
        makeRequest("POST", "/browser/scroll", { direction: "up"} );
    } );
    upButton.setAttribute("id", "scroll-up");
    var downButton = createButton( '<i class="fas fa-chevron-down"></i>', function() {
        makeRequest("POST", "/browser/scroll", { direction: "down"} );
    } );
    downButton.setAttribute("id", "scroll-down");
    form.appendChild( upButton );
    form.appendChild( downButton );

    var backButton = createButton( '<i class="fas fa-chevron-left"></i>', function() {
        navigating = true;
        currentAddress = ""; // Clear out the current address so a new one can show up
        makeRequest("GET", "/browser/back", {}, endNavigation, endNavigation );
    } );
    backButton.setAttribute("id", "go-back");
    var forwardButton = createButton( '<i class="fas fa-chevron-right"></i>', function() {
        navigating = true;
        currentAddress = ""; // Clear out the current address so a new one can show up
        makeRequest("GET", "/browser/forward", {}, endNavigation, endNavigation );
    } );
    forwardButton.setAttribute("id", "go-forward");
    form.appendChild( backButton );
    form.appendChild( forwardButton );

    launchModal( form, function() { stopConnectionToPeer(false, "server"); clearInterval(browserAddressHeartbeat); clearInterval(tabsHeartbeat); } );
    
    //video
    var video = createInteractiveScreencast();
    
    makeRequest( "GET", "/screencast/connect", { id: socket.id, noController: true }, function() {
        // start letting the server know we exist after it is now looking for us i.e. won't accept another connection
        // (serverSocketId is set)
        resetCancelStreamingInterval = setInterval( function() {
            makeRequest( "GET", "/screencast/reset-cancel", { id: socket.id } );
        }, RESET_CANCEL_STREAMING_INTERVAL );
        connectToSignalServer(false);
    }, function(responseText) { standardFailure(responseText, true) } );
    form.appendChild(video);

    if( browserAddressHeartbeat ) {
        clearInterval(browserAddressHeartbeat);
    }
    browserAddressHeartbeat = setInterval( function() {
        var addressInput = document.querySelector("#address-bar");
        if( addressInput ) {
            makeRequest( "GET", "/browser/url", {}, function(data) {
                try {
                    if( addressInput ) {

                        var address = JSON.parse(data).url;
                        if( !address ) {
                            address = "";
                        }
                        if( address != currentAddress && !navigating ) {

                            currentAddress = address;
                            if( document.activeElement !== addressInput ) {
                                addressInput.value = currentAddress;
                            }
                        }
                    }
                }
                catch(err) {};
            } );
        }
    }, BROWSER_ADDRESS_HEARTBEAT_TIME );
    if( tabsHeartbeat ) {
        clearInterval( tabsHeartbeat );
    }
    tabsHeartbeat = setInterval( function() {
        if( tabsDiv ) {
            makeRequest( "GET", "/browser/tabs", {}, function(data) {
                try {
                    if( tabsDiv ) {
                        var newTabsDiv = document.createElement("div");
                        newTabsDiv.setAttribute("id", "browser-tabs");
                        var tabs = JSON.parse(data).tabs;
                        var newActivePageId;
                        for( var i=0; i<tabs.length; i++ ) {
                            var tabDiv = document.createElement("div");
                            tabDiv.classList.add("browser-tab");
                            tabDiv.innerText = tabs[i].title;

                            // Add the X out
                            var tabQuit = document.createElement("div");
                            tabQuit.classList.add("browser-tab-quit");
                            tabQuit.innerText = "X";
                            tabQuit.onclick = function(e) {
                                makeRequest( "DELETE", "/browser/tab", {"id": this.parentElement.getAttribute("data-id")});
                                // No tabs left, the browser is "quit"
                                // The backend will recongnize this and update, but we can do it manually here
                                // and then close the modal
                                // the tabs/active tab will update in the heartbeat
                                if( document.querySelectorAll( ".browser-tab").length <= 1 ) {
                                    quitGame(true);
                                    activePageId = null;
                                }
                                e.stopPropagation();
                            }
                            tabDiv.appendChild(tabQuit);

                            tabDiv.setAttribute("data-id", tabs[i].id);
                            tabDiv.onclick = function() {
                                makeRequest( "PUT", "/browser/tab", {"id": this.getAttribute("data-id")});
                            };
                            if( tabs[i].active ) {
                                tabDiv.classList.add("active");
                                newActivePageId = tabs[i].id;
                            }
                            newTabsDiv.appendChild(tabDiv);
                        }

                        var addDiv = document.createElement("div");
                        addDiv.setAttribute("id", "add-tab");
                        addDiv.innerText = "+";
                        addDiv.onclick = function() {
                            makeRequest( "POST", "/browser/tab", {} );
                        }
                        newTabsDiv.appendChild(addDiv);

                        var curTabsDiv = document.querySelector("#browser-tabs");
                        if( newTabsDiv.innerHTML != curTabsDiv.innerHTML ) {
                            curTabsDiv.replaceWith(newTabsDiv);
                            // Make sure the right tab is active if there is an update
                            if( activePageId != newActivePageId ) {
                                makeRequest( "PUT", "/browser/tab", {"id": newActivePageId});
                                activePageId = newActivePageId;
                            }
                        }
                    }
                }
                catch(err) {}
            });
        }
    }, TABS_HEARTBEAT_TIME);
    // Start streaming now for memory conservation
    //makeRequest( "GET", "/browser/start-streaming", {} );
}

/**
 * Display the menu to configure joypad controls.
 */
function displayJoypadConfig() {
    var form = document.createElement("div");
    form.setAttribute("id", "joypad-config-form");
    var joyButtons = Object.keys(joyMapping);
    form.appendChild( createFormTitle("Joypad Configuration") );
    form.appendChild( createWarning("Click a field, then press a button on the controller.") );
    form.appendChild( createWarning("Menu Controls") );
    for( var i=0; i<joyButtons.length; i++ ) {
        var label = createInput( joyMapping[joyButtons[i]], "input-" + i, joyButtons[i] + ": ", "number", true );
        label.setAttribute("data-button", joyButtons[i]);
        form.appendChild( label );
    }
    var warning = createWarning("Virtual Controller Configuration");
    warning.setAttribute("title", "The client-connected controller maps to a virtual server controller while streaming.");
    form.appendChild(warning);
    var padcodeKeys = Object.keys(PADCODES);
    // allow padcode mapping for the padcodes that we use
    for( var i=0; i<padcodeKeys.length-2; i++ ) {
        var label = createInput( screencastControllerMap[i] ? screencastControllerMap[i].toString() : i.toString(), "virtual-input-" + i, padcodeKeys[i] + " (button " + i + "): ", "string", true );
        label.setAttribute("data-virtual-button", i);
        form.appendChild( label ); 
    }
    // allow axis mapping
    var axiscodeKeys = Object.keys(AXISCODES);
    for( var i=0; i<axiscodeKeys.length; i++ ) {
        var index = "a"+i;
        var label = createInput( screencastControllerMap[index] ? screencastControllerMap[index].toString() : (index), "virtual-input-" + index, axiscodeKeys[i] + " (axis " + i + "): ", "string", true );
        label.setAttribute("data-virtual-button", index);
        form.appendChild( label ); 
    }
    form.appendChild( createButton( "Save", function() {
        var inputs = document.querySelectorAll("#joypad-config-form label[data-button] input");
        for(var i=0; i<inputs.length; i++) {
            var button = inputs[i].parentElement.getAttribute("data-button");
            joyMapping[button] = inputs[i].value;
        }
        window.localStorage.guystationJoyMapping = JSON.stringify(joyMapping);

        var inputs = document.querySelectorAll("#joypad-config-form label[data-virtual-button] input");
        var newScreencastControllerMap = {};
        for(var i=0; i<inputs.length; i++) {
            var usedPadcodesLength = (Object.keys(PADCODES).length-2);
            var index = i < usedPadcodesLength ? i : ("a"+(i-usedPadcodesLength));
            // if say button 0 != button 0
            if( inputs[i].value != index ) {
                // the mapping is server to client
                newScreencastControllerMap[ index ] = inputs[i].value;
            }
        }
        screencastControllerMap = newScreencastControllerMap;
        window.localStorage.guystationScreencastControllerMap = JSON.stringify(screencastControllerMap);
        closeModal();
    } ) );

    var connectController = localStorage.guystationConnectController;
    if( connectController ) {
        // it might be "true" or "false"
        connectController = connectController == "true" ? true : false;
    }
    else {
        connectController = !desktopAndNoClientGamepad();
    }
    var connectCheckbox = createInput( connectController, "connect-controller-checkbox", "Virtual Controller", "checkbox" );
    connectCheckbox.querySelector("input").onchange = function() {
        localStorage.guystationConnectController = this.checked.toString();
    }
    form.appendChild(connectCheckbox);

    // EZ config section
    warning = createWarning("EZ Emulator Controller Configuration");
    warning.setAttribute("title", "This section can be used to set controls for multiple emulators at once. For example, you might map \"A\" to button 1 on your controller. GuyStation would then map button 1 to A for GBA, A for N64, Circle for PSP, etc. if those emulators are selected.");
    form.appendChild(warning);
    for( var i=0; i<EZ_EMULATOR_CONFIG_BUTTONS.length; i++ ) {
        var label = createInput( "", "ez-input-" + i, EZ_EMULATOR_CONFIG_BUTTONS[i] + ":", "search", false );
        label.setAttribute("data-ez-button", i);
        var input = label.querySelector("input");

        input.onkeydown = (function(index) { 
            return function(e) {
                appendEzInput( this, e.which, "key" );
                e.preventDefault();
                e.stopPropagation();
                updateEzControlSimpleView( this );
                focusNextInput( document.querySelector("#ez-input-" + (index+1)) );
            } 
        })(i);

        input.onchange = function() {
            updateEzControlSimpleView( this );
        }

        // Include a title to try to interpret what each button maps to
        var buttonTitle = [];
        var systemsKeys = Object.keys(systemsDict);
        for( var j=0; j<systemsKeys.length; j++ ) {
            var curSystem = systemsKeys[j];
            var curSystemInfo = systemsDict[curSystem];
            if( curSystemInfo.config && curSystemInfo.config.controls[ EZ_EMULATOR_CONFIG_BUTTONS[i] ] ) {
                var buttonInfo = curSystemInfo.config.controls[ EZ_EMULATOR_CONFIG_BUTTONS[i] ];
                if( buttonInfo.keys ) {
                    var buttonValue = buttonInfo.keys[ buttonInfo.keys.length - 1 ];
                    buttonTitle.push( curSystem + ": " + buttonValue );
                }
            }
        }
        label.setAttribute("title", buttonTitle.join("\n"));

        form.appendChild( label ); 
    }

    // Create the systems section
    var systemsSection = document.createElement("div");
    systemsSection.classList.add("systems-checkboxes");
    for( var i=0; i<EZ_SYSTEMS.length; i++ ) {
        var checkbox = createInput("", "ez-checkbox-" + i, EZ_SYSTEMS[i], "checkbox", false );
        checkbox.classList.add("inline");
        systemsSection.appendChild(checkbox);
    }
    form.appendChild(systemsSection);

    var controllerSelect = createMenu(null, [1,2,3,4],"controller-select-menu","Player: ");
    form.appendChild(controllerSelect);

    var nunchukSelect = createMenu(null, ["Classic Controller", "Nunchuk"],"nunchuk-select-menu","Wii Extension: ");
    form.appendChild(nunchukSelect);

    form.appendChild( createButton( "Apply EZ Config", function() {
        var inputs = document.querySelectorAll("#joypad-config-form label[data-ez-button] input");

        var values = {};
        // comma separated list in the form of key/axis/button(control)
        for( var i=0; i<inputs.length; i++ ) {
            var guystationButton = EZ_EMULATOR_CONFIG_BUTTONS[inputs[i].parentNode.getAttribute("data-ez-button")];

            var buttonsToSet = parseEzButtonString( inputs[i].value );

            if( buttonsToSet.length ) {
                values[guystationButton] = buttonsToSet;
            }
        }
    
        // figure out for which systems we need to send values
        var systems = [];
        var checkboxes = document.querySelectorAll("#joypad-config-form .systems-checkboxes input[type='checkbox']");
        for( var i=0; i<checkboxes.length; i++) {
            if( checkboxes[i].checked ) {
                systems.push( checkboxes[i].parentNode.querySelector("span").innerText );
            }
        }

        // figure out the controller
        var controllerSelectMenu = controllerSelect.querySelector("select");
        var controller = parseInt(controllerSelectMenu.options[controllerSelectMenu.selectedIndex].value) - 1;
        
        // figure out if we are using the nunchuk
        var nunchukSelectMenu = nunchukSelect.querySelector("select");
        var nunchuk = nunchukSelectMenu.selectedIndex > 0 ? true : false;

        var sendObject = { "systems": systems, "values": values, "controller": controller, "nunchuk": nunchuk };
        makeRequest("POST", "/controls", sendObject, function() {
            createToast(CONTROLS_SET_MESSAGE);
        }, function(data) {
            try {
                var message = JSON.parse(data).message;
                createToast(message);
            }
            catch(err) {
                createToast(COULD_NOT_SET_CONTROLS_MESSAGE);
            }
        });

    } ) );

    // create the profiles section
    var profileInput = createInput( "", "ez-profile-input", "Profile Name:", "text", true );
    var saveProfileButton = createButton( "Save Profile", saveEzProfile, [profileInput.querySelector("input")] );
    loadEzProfiles( function() {
        var profileOptions = Object.keys(profilesDict);
        profileOptions.unshift("");
        var profilesMenu = createMenu( "", profileOptions, "ez-profile-select", "Profiles:", loadEzProfile, true );
        var deleteProfileButton = createButton( "Delete Profile", deleteEzProfile, [profilesMenu.querySelector("select")] );
        // the required button will change the onchange, so we have to combine the two here
        var currentOnChange = profilesMenu.querySelector("select").onchange;
        profilesMenu.querySelector("select").onchange = function() {
            currentOnChange();
            loadEzProfile();
        }

        var currentProfile = getCurrentAutoloadProfile();
        // If there is a current profile, see if there is a profile by the same name that we just loaded from the server
        // then update the local profile if so
        if( currentProfile && profilesDict[currentProfile.name] ) {
            setCurrentAutoloadProfile( { "name": currentProfile.name, "nunchuk": currentProfile.nunchuk, "profile": profilesDict[currentProfile.name] } );
        }
        var setAutoloadButton = createButton( "Autoload Profile", saveAutoloadEzProfile );
    
        form.appendChild(profileInput);
        form.appendChild(saveProfileButton);
        form.appendChild(profilesMenu);
        form.appendChild(deleteProfileButton);
        form.appendChild(setAutoloadButton);
    } );
    
    launchModal( form );
}

/**
 * Parse an EZ button string into a value readable by the server.
 * @param {string} buttonString - The button string.
 * @returns {Array<Object>} The expeceted server object.
 */
function parseEzButtonString( buttonString ) {
    // Get the list of buttons that have been set for each input
    var buttons = buttonString.split(","); // we have to split by pipe here
    var buttonsToSet = [];
    // For each of the buttons
    for( var j=0; j<buttons.length; j++ ) {
        // Get the type and the control (e.g. keycode, axis+, etc) - we don't ever expect and array
        var match = buttons[j].match(EZ_REGEX);
        if( match ) {
            var obj = {
                type: match[1],
                button: match[2]
            }
            if( match[3] ) {
                obj.vendor = match[4];
                obj.product = match[5];
            }
            buttonsToSet.push( obj );
        }
    }
    return buttonsToSet;
}

/**
 * Autoload an EZ profile.
 * @param {Function} [callback] - The callback to run after load.
 */
function autoloadEzProfile( callback ) {
    loadEzProfiles( function() { // load profiles again in case the current profile has been updated on a different computer
        // we do this when the joypad display dialog is shown, but we don't do that when we autload.
        var profile = getCurrentAutoloadProfile();
        if( profile && profilesDict[profile.name] ) {
            // note that which play it is, what systems, and nunchuk is not stored on the server
            setCurrentAutoloadProfile( { "name": profile.name, "nunchuk": profile.nunchuk, "profile": profilesDict[profile.name] } );
            profile = getCurrentAutoloadProfile();
        }
        if( profile ) {
            var sendObject = { "systems": EZ_SYSTEMS, "values": profile.profile, "controller": 0, "nunchuk": profile.nunchuk };
            makeRequest("POST", "/controls", sendObject, function() {
                createToast(CONTROLS_SET_MESSAGE);
                if( callback ) callback();
            }, function(data) {
                try {
                    var message = JSON.parse(data).message;
                    createToast(message);
                }
                catch(err) {
                    createToast(COULD_NOT_SET_CONTROLS_MESSAGE);
                }
                if( callback ) callback();
            });
        }
        else if( callback ) callback();
    } );
}

/**
 * Make a profile the autoload profile from the menu.
 */
function saveAutoloadEzProfile() {
    var selectElement = document.querySelector("#joypad-config-form #ez-profile-select");
    var name = selectElement.options[selectElement.selectedIndex].value;
    if( profilesDict[name] ) {
        var nunchukSelectMenu = document.querySelector("#nunchuk-select-menu");
        var nunchuk = nunchukSelectMenu.selectedIndex > 0 ? true : false;
        setCurrentAutoloadProfile( { name: name, nunchuk: nunchuk, profile: profilesDict[name] } );
        createToast( "Profile set to autoload" );
    }
    else {
        setCurrentAutoloadProfile( "" );
        createToast( "Removed profile autoload" );
    }
}

/**
 * Set the current autoload profile.
 * @param {Object} profile - The profile to load. It should have keys for nunchuk, profile (the profile as given to us by the server [note, this is different to what the server expects - values are strings not objects]), and name.
 */
function setCurrentAutoloadProfile(profile) {
    if( profile ) {
        var curProfile = JSON.parse(JSON.stringify(profile));
        var keys = Object.keys(curProfile.profile);
        for( var i=0; i<keys.length; i++ ) {
            var curKey = curProfile.profile[keys[i]];
            curProfile.profile[keys[i]] = parseEzButtonString(curKey);
        }
        localStorage.guystationAutoloadEzProfile = JSON.stringify(curProfile);
    }
    else {
        localStorage.guystationAutoloadEzProfile = "";
    }
}

/**
 * Get the current autload profile.
 * @returns {Object} - The current autoload profile.
 */
function getCurrentAutoloadProfile() {
    var currentProfile = localStorage.guystationAutoloadEzProfile;
    if( currentProfile ) {
        return JSON.parse(currentProfile);
    }
    return null;
}

/**
 * Determine if we are on desktop and do not have a gamepad connected.
 * @returns {boolean} - True if we are on a desktop without a gamepad.
 */
function desktopAndNoClientGamepad() {
    return !(isTouch()) && (navigator.getGamepads ? ( (navigator.getGamepads() && navigator.getGamepads()[0]) ? false : true) : true);
}

/**
 * Update EZ Control Simple View.
 * @param {HTMLElement} inputElement - The input element to append the EZ View after.
 */
function updateEzControlSimpleView( inputElement ) {
    var simpleViewElement = inputElement.nextElementSibling;
    if( !simpleViewElement ) {
        simpleViewElement = document.createElement("div");
        simpleViewElement.classList.add("ez-simple-view");
        inputElement.parentNode.appendChild( simpleViewElement );
    }
    var buttons = inputElement.value.split(",");
    var simpleText = [];
    for( var i=0; i<buttons.length; i++ ) {
        var match = buttons[i].match(EZ_REGEX);
        if( match && parseInt(match[2]) ) {
            var type = match[1];
            var typeCapitilized = type.charAt(0).toUpperCase() + type.slice(1);
            var key = parseInt(match[2]);
            var pushVal = typeCapitilized + " ";
            if( type == "key" ) {
                pushVal += KEYCODE_MAP[key] ? KEYCODE_MAP[key] : key;
            }
            else {
                pushVal += key;
            }
            simpleText.push(pushVal);
        }
    }
    simpleViewElement.innerText = simpleText.join(", ");
}

/**
 * Determine if this is Firefox.
 * @returns {boolean} True if this is Firefox.
 */
function isFirefox() {
    return navigator.userAgent.toLowerCase().indexOf("firefox") != -1;
}

/**
 * Append a value to an EZ Input element
 * @param {HTMLElement} inputElement - The input element.
 * @param {string} value - The value to add.
 * @param {string} type - The type of element.
 * @param {string} [controller] - Info about the controller used to set the button.
 */
function appendEzInput(inputElement, value, type, controller) {
    if( type != "key" &&
        EZ_EMULATOR_CONFIG_BUTTONS[parseInt(inputElement.getAttribute("id").match(/-(\d+)/)[1])] == "Screenshot" ) {
        return; // only set keys for screenshot
    }

    // standardize keycode inputs
    if( type == "key" && isFirefox() && FIREFOX_TO_STANDARD_KEYCODE_MAP[value] ) {
        value = FIREFOX_TO_STANDARD_KEYCODE_MAP[value];
    }

    var newValue = "";
    newValue += type + "(" + value + ")";

    // append the real value that we will use
    if( controller ) {
        let match = controller.match( /Vendor:\s([^\s]+)\sProduct:\s([^\)]+)/ );
        // -vendor-product
        if( match ) {
            newValue = demapController( newValue, match[1], match[2] );
        }
    }

    // no repeats
    if( !inputElement.value.includes(newValue) ) {
        if(inputElement.value) inputElement.value += ",";

        inputElement.value += newValue;
    }
}

/**
 * Demap controller to get the proper inputs.
 * Chrome attempts to map some controllers to a standardized mapping. This breaks EZ input, as the button and axis
 * numbers are off from their real numbers which is what the emulators expect. This function will get their true values.
 * @param {string} buttonOrAxis - The button or axis in a form such as "button(2)" or "axis(3-)".
 * @param {string} vendor - The 4 character vendor hex code.
 * @param {string} product - The 4 character product hex code.
 * @returns {string} The controller string to be used in the form <buttonOrAxis>-<vendor>-<product>
 */
function demapController( buttonOrAxis, vendor, product ) {
    if( demapperTypes && demapperControllers ) { // external script
        var type = demapperControllers[vendor + "-" + product];
        // we have a custom mapper
        if( type ) {
            var buttonMap = demapperTypes[type];
            // we should have a button map but do a sanity check here
            if( buttonMap ) {
                // we should have a map for this specific button - this is important as not all mappings map every button
                // some just forward what's already there - we need to leave those
                if( buttonMap[buttonOrAxis] ) {
                    buttonOrAxis = buttonMap[buttonOrAxis];
                }
            }
        }
    }
    return buttonOrAxis + "-" + vendor + "-" + product;
}

/**
 * Load all EZ Profiles.
 * @param {function} callback - The callback to run once the profiles are fetched.
 */
function loadEzProfiles( callback ) {
    makeRequest( "GET", "/profiles", {}, function(responseText) {
        try {
            profilesDict = JSON.parse(responseText).profiles;
            callback();
        }
        catch(err) {
            // silent fail
        }
    } );
}

/**
 * Update the EZ Profile Select.
 */
function updateEzProfileList() {
    var selectElement = document.querySelector("#joypad-config-form #ez-profile-select");
    if( selectElement ) {
        var currentValue = selectElement.options[selectElement.selectedIndex].value;
        var curLabel = selectElement.parentNode.querySelector("span").innerText;
        var profileOptions = Object.keys(profilesDict);
        profileOptions.unshift("");
        selectElement.parentNode.replaceWith( createMenu( currentValue, profileOptions, selectElement.getAttribute("id"), curLabel, selectElement.onchange, selectElement.getAttribute("required") ) );
    }
}

/**
 * Load an EZ Profile.
 */
function loadEzProfile() {
    var selectElement = document.querySelector("#joypad-config-form #ez-profile-select");
    var name = selectElement.options[selectElement.selectedIndex].value;
    if( name ) {
        var profile = profilesDict[name];
        if( profile ) {
            for( var i=0; i<EZ_EMULATOR_CONFIG_BUTTONS.length; i++ ) {
                var curInput = document.querySelector("#ez-input-" + i);
                curInput.value = profile[EZ_EMULATOR_CONFIG_BUTTONS[i]];
                updateEzControlSimpleView( curInput );
            }
            var inputElement = document.querySelector("#joypad-config-form #ez-profile-input");
            inputElement.value = name;
            inputElement.oninput();
            createToast( "Profile loaded" );
        }
    }
}

/**
 * Save an EZ Profile.
 */
function saveEzProfile() {
    var name = document.querySelector("#joypad-config-form #ez-profile-input").value;
    if( name ) {
        var profile = {};
        for( var i=0; i<EZ_EMULATOR_CONFIG_BUTTONS.length; i++ ) {
            profile[ EZ_EMULATOR_CONFIG_BUTTONS[i] ] = document.querySelector("#ez-input-" + i).value;
        }
        profilesDict[name] = profile;
        updateEzProfileList();
        makeRequest( "POST", "/profile", { "name": name, "profile": profile }, function() {
            createToast( "Profile saved" );
        }, function() {
            createToast( "Could not save profile" );
        } );
    }
}

/**
 * Delete an EZ Controller Configuration Profile.
 */
function deleteEzProfile() {
    var selectElement = document.querySelector("#joypad-config-form #ez-profile-select");
    var name = selectElement.options[selectElement.selectedIndex].value;
    if( name ) {
        var profile = profilesDict[name];
        if( profile ) {
            delete profilesDict[name];
            updateEzProfileList();
            makeRequest( "DELETE", "/profile", { "name": name }, function() {
                createToast( "Profile deleted" );
            }, function() {
                createToast( "Could not delete profile" );
            } );
        }
    }
}

/**
 * Display the screencast.
 * @param {boolean} fullscreen - True if we should open the screencast in fullscreen by default.
 */
function displayScreencast( fullscreen ) {
    if( isServer ) {
        return;
    }
    var form = document.createElement("div");
    form.appendChild( createFormTitle("Screencast") );
    
    var video = createInteractiveScreencast();

    form.setAttribute("id", "remote-screencast-form");
    form.appendChild(video);

    // we will make sure the server scales down once the video starts - see gotRemoteStream

    // Handle the onchange event for the select scale
    var scaleMenu = createMenu( parseFloat(window.localStorage.guystationScaleDownFactor), SCALE_OPTIONS, "screencast-scale-select", "Scale Down By", function() {
        window.localStorage.guystationScaleDownFactor = this.options[this.selectedIndex].value;
        makeRequest( "POST", "/screencast/scale", { id: socket.id, factor: window.localStorage.guystationScaleDownFactor } );
    } );
    form.appendChild(scaleMenu);

    form.appendChild( createButton("Fullscreen", function() { fullscreenVideo(video) }));

    var connectController = localStorage.guystationConnectController;
    if( connectController ) {
        // it might be "true" or "false"
        connectController = connectController == "true" ? true : false;
    }
    else connectController = !desktopAndNoClientGamepad();

    autoloadEzProfile( function() {
        makeRequest( "GET", "/screencast/connect", { id: socket.id, noController: !connectController }, function() {
            // start letting the server know we exist after it is now looking for us i.e. won't accept another connection
            // (serverSocketId is set)
            resetCancelStreamingInterval = setInterval( function() {
                makeRequest( "GET", "/screencast/reset-cancel", { id: socket.id } );
            }, RESET_CANCEL_STREAMING_INTERVAL );
            launchModal( form, function() { stopConnectionToPeer(false, "server"); } );
            connectToSignalServer(false);
            if( fullscreen ) fullscreenVideo( video );
        }, function(responseText) { standardFailure(responseText, true) } );
    } );
}

/**
 * Determine if the current platform has touch enabled.
 * @returns {boolean} True is the current platform has touch enabled.
 */
function isTouch() {
    var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
    var mq = function(query) {
        return window.matchMedia(query).matches;
    }

    if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
        return true;
    }

    var query = ['(', prefixes.join('touch-enabled),('), 'hertz', ')'].join('');
    return mq(query);
}

/**
 * Force a redraw of the elements on the screen.
 * @param {HTMLElement} - The vide element we want to redraw.
 */
function forceRedraw( element ) {
    setTimeout( function() {
        element.style.display='inline-block';
        element.offsetHeight;
        element.style.display='';
    }, 0 );
}

/**
 * Fullscreen a video element.
 * @param {HTMLElement} element - The video element to fullscreen.
 */
function fullscreenVideo( element ) {
    if( isTouch() ) {
        // this should be for iOS safari
        //element.webkitEnterFullScreen();
        var oldParent = element.parentNode;
        var nextSibling = element.nextSibling;
        var blackBackground = document.createElement("div");
        blackBackground.classList.add("black-background");
        document.body.appendChild(blackBackground);
        blackBackground.appendChild( element );

        resizePseudoFullscreen();

        window.addEventListener("resize", resizePseudoFullscreen);
        window.addEventListener("orientationchange", resizePseudoFullscreen);

        blackBackground.onclick = function(e) {

            if( document.querySelector(".black-background #edit-button .fa-check") ) {

                if( document.querySelector(".black-background #action-button:not(.hidden) .fa-plus") ) {
                    var keyButton = createKeyButton( '0', e.clientX, e.clientY );
                    blackBackground.appendChild(keyButton);
                }

            }

            e.stopPropagation();
            e.preventDefault();
        }
        blackBackground.ontouchstart = function(e) {
            if(e.target == this && !document.querySelector(".black-background #edit-button .fa-check") ) e.preventDefault();
        }
        var exitButton = createButton( "X", function() { 
            if( nextSibling ) {
                oldParent.insertBefore(element, nextSibling);
            }
            else {
                oldParent.appendChild(element);
            }
            blackBackground.parentNode.removeChild(blackBackground);
            window.removeEventListener("resize", resizePseudoFullscreen);
            window.removeEventListener("orientationchange", resizePseudoFullscreen);
        } );
        exitButton.setAttribute("id", "exit-button");
        blackBackground.appendChild(exitButton);
        
        var actionButton = createButton( '<i class="fas fa-plus"></i>', function(e) {
            var icon = this.querySelector( "i" );
            var currentAction = icon.classList[1];
            icon.classList.remove( currentAction );

            if( currentAction == "fa-plus" ) {
                icon.classList.add("fa-arrows-alt");
            }
            else if( currentAction == "fa-arrows-alt" ) {
                document.querySelectorAll(".black-background .key-button .key-display").forEach( function(el) { el.classList.add("hidden"); } );
                document.querySelectorAll(".black-background .key-button .key-select").forEach( function(el) { el.classList.remove("hidden"); } );
                icon.classList.add("fa-keyboard");
            }
            else if( currentAction == "fa-keyboard" ) {
                document.querySelectorAll(".black-background .key-button .key-select").forEach( function(el) { el.classList.add("hidden"); } );
                document.querySelectorAll(".black-background .key-button .key-display").forEach( function(el) { el.classList.remove("hidden"); determineAnalog(el); } );
                icon.classList.add("fa-trash");
            }
            else if( currentAction == "fa-trash" ) {
                icon.classList.add("fa-plus");
            }
            e.stopPropagation();
            e.preventDefault();
        } );
        actionButton.setAttribute("id", "action-button");
        var editButton = createButton( '<i class="fas fa-edit"></i>', function(e) {
            var icon = this.querySelector("i");
            if( actionButton.classList.contains("hidden") ) {
                // show the select menus if starting out on keyboard
                if( document.querySelector(".black-background #action-button .fa-keyboard") ) {
                    document.querySelectorAll(".black-background .key-button .key-display").forEach( function(el) { el.classList.add("hidden"); } );
                    document.querySelectorAll(".black-background .key-button .key-select").forEach( function(el) { el.classList.remove("hidden"); } );
                }
                actionButton.classList.remove("hidden");
                icon.classList.remove("fa-edit");
                icon.classList.add("fa-check");
            }
            else {
                document.querySelectorAll(".black-background .key-button .key-select").forEach( function(el) { el.classList.add("hidden"); } );
                document.querySelectorAll(".black-background .key-button .key-display").forEach( function(el) { el.classList.remove("hidden"); determineAnalog(el); } );
                actionButton.classList.add("hidden");
                icon.classList.remove("fa-check");
                icon.classList.add("fa-edit");
                saveKeyConfiguration();
            }
            e.stopPropagation();
            e.preventDefault();
        } );
        editButton.setAttribute("id", "edit-button");
        actionButton.classList.add("hidden");

        blackBackground.appendChild(editButton);
        blackBackground.appendChild(actionButton);

        loadKeyConfiguration();
    }
    else {
        try {
            element.requestFullscreen();
        }
        catch(err) {}
    }
}

/**
 * Determine if a key display should be Analog or not, and adjust it appropriately.
 * @param {HTMLElement} keyDisplay - The element containing the text of the key.
 */
function determineAnalog(keyDisplay) {
    var stick = keyDisplay.querySelector(".analog-stick");
    // hijack the key display for an analog stick
    if( keyDisplay.innerText.match(/\u{1f579}/u) ) {
        keyDisplay.classList.add("analog");
        if( !stick ) {
            stick = document.createElement("div");
            stick.classList.add("analog-stick");
            keyDisplay.appendChild(stick);
        }
    }
    else {
        keyDisplay.classList.remove("analog");
        if( stick ) {
            stick.parentNode.removeChild( stick );
        }
    }
}

/**
 * Create a key button.
 * @param {string} selected - The selected key for the button.
 * @param {number} x - The X coordinate of the center of the button.
 * @param {number} y - The Y coordinate of the center of the button.
 * @returns {HTMLElement} The button element.
 */
function createKeyButton( selected, x, y ) {
    var blackBackground = document.querySelector(".black-background");
    var keySelect = createMenu( selected, Object.keys(KEYCODES).concat(Object.keys(PADCODES)) ).children[1];

    keySelect.onclick = function(e) {
        if( !document.querySelector(".black-background #action-button:not(.hidden) .fa-keyboard") ) {
            e.preventDefault();
            this.blur();
            window.focus();
        }
    }
    keySelect.classList.add("hidden");
    keySelect.classList.add("key-select");
    var keyDisplay = document.createElement("span");
    keyDisplay.classList.add("key-display");
    keyDisplay.innerText = selected;

    // update the value
    keySelect.onchange = function() { keyDisplay.innerText = keySelect.options[keySelect.selectedIndex].value };

    var keyButton = document.createElement("button");
    keyButton.classList.add("key-button");
    var squareButtonSideHalf = blackBackground.querySelector("#edit-button").clientWidth/2;
    keyButton.style.left = x - squareButtonSideHalf;
    keyButton.style.top = y - squareButtonSideHalf;

    determineAnalog(keyDisplay);

    keyButton.appendChild(keySelect);
    keyButton.appendChild(keyDisplay);
    
    keyButton.onclick = function(e) {
        if( document.querySelector(".black-background #edit-button .fa-check") ) {
            if( document.querySelector(".black-background #action-button:not(.hidden) .fa-trash") ) {
                this.parentNode.removeChild(this);
            }
        }
        e.stopPropagation();
        e.preventDefault();
    }

    var lastJoystickValues = [];
    var curTouchIdentifier;
    var moveJoystick = function(e) {
        var stick = keyButton.querySelector(".analog-stick");
        var keyLeft = parseInt(keyButton.style.left.replace("px",""));
        var keyTop = parseInt(keyButton.style.top.replace("px",""));
        // these two should be the same
        var stickCenterX = (keyDisplay.clientWidth - stick.clientWidth)/2;
        var stickCenterY = (keyDisplay.clientHeight - stick.clientHeight)/2;

        var stickLeft = stickCenterX;
        var stickTop = stickCenterY;

        var maxDistanceTraveled = keyDisplay.clientWidth - stick.clientWidth;
        if( e ) {
            var correctTouch = Array.from(e.touches).filter( (el) => el.identifier == curTouchIdentifier );
            if( !correctTouch.length ) return;
            correctTouch = correctTouch[0];

            stickLeft = correctTouch.clientX - keyLeft;
            stickTop = correctTouch.clientY - keyTop;
            // Get the angle the stick is currently at
            var angleRadians = Math.atan2( stickLeft - stickCenterX, stickTop - stickCenterY);
            // 0 is the bottom, and it goes counter clockwise
            // get the max x coordinate
            var maxY = maxDistanceTraveled*Math.cos(angleRadians);
            // get the max y coordinate
            var maxX = maxDistanceTraveled*Math.sin(angleRadians);
            if( Math.abs(maxX) < Math.abs(stickLeft - stickCenterX) ) {
                stickLeft = maxX + stickCenterX;
            }
            if( Math.abs(maxY) < Math.abs(stickTop - stickCenterY) ) {
                stickTop = maxY + stickCenterY;
            }
        }
        stick.style.left = stickLeft;
        stick.style.top = stickTop;

        var distanceXFromCenter = stickLeft - stickCenterX;
        var distanceYFromCenter = stickTop - stickCenterY;
        var xValueForServer = distanceXFromCenter/maxDistanceTraveled * MAX_JOYSTICK_VALUE;
        var yValueForServer = distanceYFromCenter/maxDistanceTraveled * MAX_JOYSTICK_VALUE;

        // always send the stop event (!e)
        if( !lastJoystickValues.length || (Math.abs(lastJoystickValues[0] - xValueForServer)) > SCREENCAST_AXIS_FUZZINESS || (Math.abs(lastJoystickValues[1] - yValueForServer)) > SCREENCAST_AXIS_FUZZINESS || (!e) ) {
            lastJoystickValues = [xValueForServer, yValueForServer];

            // The right axis are 3 & 4
            var axisAdder = selected.includes("L") ? 0 : 3;
            socket.emit("/screencast/gamepad", { "event": { "type": 0x03, "code": 0x00 + axisAdder, "value": xValueForServer }, "id": socket.id });
            socket.emit("/screencast/gamepad", { "event": { "type": 0x03, "code": 0x01 + axisAdder, "value": yValueForServer }, "id": socket.id });
        }
    }

    var dragKey = function(e) {
        keyButton.style.left = e.touches[0].clientX - squareButtonSideHalf;
        keyButton.style.top = e.touches[0].clientY - squareButtonSideHalf;
    }
    var curTarget;
    // changeKey won't be assigned with moveJoystick for the same key
    var changeKey = function(e) {
        var correctTouch = Array.from(e.touches).filter( (el) => el.identifier == curTouchIdentifier );
        if( !correctTouch.length ) return;
        correctTouch = correctTouch[0];
        var newTarget = document.elementFromPoint(correctTouch.clientX, correctTouch.clientY);
        if( curTarget != newTarget &&
            newTarget.classList.contains("key-button") ) {
            // keyup for the old target and then keydown for the new target
            handleKeyButton( curTarget, false, function() { handleKeyButton(newTarget, true); } );
            curTarget = newTarget;
        }
    }
    keyButton.ontouchstart = function(e) {
        if( document.querySelector(".black-background #action-button:not(.hidden) .fa-arrows-alt") ) {
            window.addEventListener( "touchmove", dragKey );
        }
        
        if( ! document.querySelector(".black-background #edit-button .fa-check") ) {
            curTouchIdentifier = e.targetTouches[0].identifier;
            if( keyDisplay.classList.contains("analog") ) {
                moveJoystick(e);
                window.addEventListener( "touchmove", moveJoystick );
            }
            else {
                curTarget = keyButton;
                handleKeyButton( keyButton, true );
                window.addEventListener( "touchmove", changeKey );
            }
            e.preventDefault(); // this is important because otherwise on ios the document gets fake-slide up (momentum scroll)
            // even though the visuals remain in place, the event touch areas move. You can see this in inspector if you hover over
            // a button or analog stick element, touch and drag up on the phone - you'll see the box move up like if momentum scroll was enabled.
        }
    }
    keyButton.ontouchend = function(e) {
        window.removeEventListener("touchmove", dragKey);
        window.removeEventListener("touchmove", changeKey);
        window.removeEventListener("touchmove", moveJoystick);

        if( ! document.querySelector(".black-background #edit-button .fa-check") ) {
            if( keyDisplay.classList.contains("analog") ) {
                moveJoystick();
            }
            else {
                handleKeyButton( curTarget, false );
            }
        }
    }

    return keyButton;
}

/**
 * Handle a key button press - either make a request to gamepad or buttons.
 * @param {HTMLElement} keyButton - The key button element.
 * @param {boolean} down - True if the key is down, false if up.
 * @param {Function} callback - The callback function.
 */
function handleKeyButton(keyButton, down, callback) {
    var displayValue = keyButton.querySelector(".key-display").innerText;
    // it's a gamepad key
    if( PADCODES[displayValue] ) {
        socket.emit("/screencast/gamepad", { "event": { "type": 0x01, "code": PADCODES[displayValue], "value": down ? 1 : 0 }, "id": socket.id },
        function() { if(callback) callback(); } );
    }
    // it's a keyboard key
    else {
        socket.emit("/screencast/buttons", { "down": down, "buttons": [KEYCODES[displayValue]] },
        function() { if(callback) callback(); } );
    }
}

/**
 * Save the current mobile key configuration to localstorage.
 */
function saveKeyConfiguration() {
    
    var keyMappings = window.localStorage.guystationMobileKeyMappings;
    if( !keyMappings ) {
        keyMappings = {};
    }
    else {
        keyMappings = JSON.parse(keyMappings);
    }

    var resolution = window.innerWidth.toString() + "x" + window.innerHeight.toString();

    var keys = [];
    var keyButtons = document.querySelectorAll(".black-background .key-button");
    var squareButtonSideHalf = document.querySelector(".black-background #edit-button").clientWidth/2;
    for( var i=0; i<keyButtons.length; i++ ) {
        var saveObject = {
            "key": keyButtons[i].querySelector(".key-display").innerText,
            "x": parseInt(keyButtons[i].style.left.replace("px","")) + squareButtonSideHalf,
            "y": parseInt(keyButtons[i].style.top.replace("px","")) + squareButtonSideHalf
        };
        keys.push( saveObject );
    }

    keyMappings[resolution] = keys;

    window.localStorage.guystationMobileKeyMappings = JSON.stringify(keyMappings);
}

/**
 * Load the mobile key configuration.
 */
function loadKeyConfiguration() {

    if( !window.localStorage.guystationMobileKeyMappings ) {
        window.localStorage.guystationMobileKeyMappings = JSON.stringify({});
    }

    var resolution = window.innerWidth.toString() + "x" + window.innerHeight.toString();
    var keyMappings = JSON.parse( window.localStorage.guystationMobileKeyMappings );

    if( !keyMappings[resolution] ) {
        var curWidth = window.innerWidth.toString();
        var curHeight = window.innerHeight.toString();
        // try to detect landscape mode.
        var mappingToUse = DEFAULT_KEY_MAPPING_PORTRAIT;
        var trueWidth = TRUE_DEFAULT_KEY_MAPPING_WIDTH;
        var trueHeight = TRUE_DEFAULT_KEY_MAPPING_HEIGHT;
        if( curWidth > curHeight ) {
            mappingToUse = DEFAULT_KEY_MAPPING_LANDSCAPE;
            trueWidth = TRUE_DEFAULT_KEY_MAPPING_HEIGHT;
            trueHeight = TRUE_DEFAULT_KEY_MAPPING_WIDTH;
        }

        var widthMultiplier = curWidth/trueWidth;
        var heightMultiplier = curHeight/trueHeight;
        var buttonKeys = Object.keys(mappingToUse);
        for( var i=0; i<buttonKeys.length; i++ ) {
            var curButtonObj = mappingToUse[buttonKeys[i]];
            curButtonObj.x = Math.round(curButtonObj.x * widthMultiplier);
            curButtonObj.y = Math.round(curButtonObj.y * heightMultiplier);
        }

        keyMappings[resolution] = mappingToUse;
        window.localStorage.guystationMobileKeyMappings = JSON.stringify(keyMappings);
    }

    var keys = keyMappings[resolution];

    for( var i=0; i<keys.length; i++ ) {
        var keyButton = createKeyButton( keys[i].key, keys[i].x, keys[i].y );
        document.querySelector(".black-background").appendChild(keyButton);
    }
}

/**
 * Resize the pseudo-fullscreen element created for iOS.
 */
function resizePseudoFullscreen() {

    var element = document.querySelector(".black-background video");
    if( element ) {

        var elWidth = element.clientWidth;
        var elHeight = element.clientHeight;
        var elRatio = elWidth/elHeight;

        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;

        element.classList.remove("width-max");
        element.classList.remove("height-max");
        if( windowWidth / elRatio > windowHeight ) {
            element.classList.add("height-max");
        }
        else {
            element.classList.add("width-max");
        }

        // if we aren't editing, load a new configuration.
        if( document.querySelector(".black-background #edit-button .fa-edit") ) {
            // remove the current buttons
            document.querySelectorAll(".black-background .key-button").forEach( function(el) {
                el.parentNode.removeChild(el);
            });
            loadKeyConfiguration();
        }

    }
}

/**
 * Create an interactive screencast.
 * @returns {HTMLElement} A video element that can be interacted with.
 */
function createInteractiveScreencast() {
    var video = document.createElement("video");
    video.setAttribute("autoplay", "true");
    video.setAttribute("playsinline", "true");

    var getMousePercentLocation = function(event) {
        var nativeWidth = video.videoWidth;
        var nativeHeight = video.videoHeight;
        var areaWidth = video.offsetWidth;
        var areaHeight = video.offsetHeight;
        var actualWidth;
        var actualHeight;
        var offsetLeft = 0;
        var offsetTop = 0;
        if( nativeWidth/nativeHeight > areaWidth/areaHeight ) {
            actualWidth = areaWidth;
            actualHeight = actualWidth * (nativeHeight/nativeWidth);
            offsetTop = (areaHeight - actualHeight) / 2;
        }
        else {
            actualHeight = areaHeight;
            actualWidth = actualHeight * (nativeWidth/nativeHeight);
            offsetLeft = (areaWidth - actualWidth) / 2;
        }
        var rect = video.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var xPercent = (x - offsetLeft)/actualWidth;
        var yPercent = (y - offsetTop)/actualHeight;
        return { xPercent: xPercent, yPercent: yPercent };
    }

    video.onclick = function(event) {
        event.preventDefault(); // prevent pausing the video onclick
    }
    var lastTouchEvent;
    var mouseDown = false;
    var lastMoveSent = 0;
    video.onmousedown = function(event) {
        if( !document.querySelector(".black-background #edit-button .fa-check") ) { // dont record clicks if editing the interface
            if( document.activeElement ) document.activeElement.blur();
            var mousePercentLocation = getMousePercentLocation(event);
            var xPercent = mousePercentLocation.xPercent;
            var yPercent = mousePercentLocation.yPercent;
            if( xPercent > 0 && yPercent > 0 && xPercent < 1 && yPercent < 1 ) {
                mouseDown = true;
                lastMoveSent = Date.now();
                socket.emit( "/screencast/mouse", { "down": true, "xPercent": xPercent, "yPercent": yPercent, "button": event.which == 1 ? "left" : event.which == 3 ? "right" : "middle" } );
            }
            try {
                event.preventDefault();
            }
            catch(err) {}
        }
    };
    var recordLastTouchEvent = function(event) {
        lastTouchEvent = event;
    }
    video.ontouchstart = function(event) {
        if( !document.querySelector(".black-background #edit-button .fa-check") ) { // dont record clicks if editing the interface
            var fakeEvent = { which: 1, clientX: event.targetTouches[0].clientX, clientY: event.targetTouches[0].clientY };
            video.onmousedown(fakeEvent);
            recordLastTouchEvent(event);
            video.addEventListener("touchmove", recordLastTouchEvent);
            event.preventDefault();
        }
    }
    video.onmousemove = function(event) {
        if( !document.querySelector(".black-background #edit-button .fa-check") ) { // dont record clicks if editing the interface
            var now = Date.now();
            if( now - lastMoveSent > MOUSE_MOVE_SEND_INTERVAL ) {
                var mousePercentLocation = getMousePercentLocation(event);
                var xPercent = mousePercentLocation.xPercent;
                var yPercent = mousePercentLocation.yPercent;
                if( xPercent > 0 && yPercent > 0 && xPercent < 1 && yPercent < 1 ) {
                    lastMoveSent = now;
                    socket.emit( "/screencast/mouse", { "down": mouseDown, "xPercent": xPercent, "yPercent": yPercent, "button": event.which == 1 ? "left" : event.which == 3 ? "right" : "middle" } );
                }
                try {
                    event.preventDefault();
                }
                catch(err) {}
            }
        }
    }
    video.onmouseup = function(event) {
        if( !document.querySelector(".black-background #edit-button .fa-check") ) { // dont record clicks if editing the interface
            var mousePercentLocation = getMousePercentLocation(event);
            var xPercent = mousePercentLocation.xPercent;
            var yPercent = mousePercentLocation.yPercent;
            if( xPercent > 0 && yPercent > 0 && xPercent < 1 && yPercent < 1 ) {
                mouseDown = false;
                socket.emit( "/screencast/mouse", { "down": false, "xPercent": xPercent, "yPercent": yPercent, "button": event.which == 1 ? "left" : event.which == 3 ? "right" : "middle" } );
            }
            try {
                event.preventDefault();
            }
            catch(err) {}
        }
    };
    video.ontouchend = function(event) {
        if( !document.querySelector(".black-background #edit-button .fa-check") ) { // dont record clicks if editing the interface
            var fakeEvent = { which: 1, clientX: lastTouchEvent.targetTouches[0].clientX, clientY: lastTouchEvent.targetTouches[0].clientY };
            video.onmouseup(fakeEvent);
            video.removeEventListener("touchmove", recordLastTouchEvent);
            event.preventDefault();
        }
    }
    video.oncontextmenu = function(event) {
        event.preventDefault();
        return false;
    };
    var wrapper = document.createElement("div");
    wrapper.classList.add("screencast-wrapper");
    wrapper.appendChild(video);
    wrapper.addEventListener("fullscreenchange", function() {
        forceRedraw(video);
    });
    return wrapper;
}

/**
 * Display messaging.
 */
function displayMessaging() {
    var form = document.createElement("div");
    form.appendChild( createFormTitle("Messaging") );
    form.setAttribute("id", "messaging-form");

    var messagingBox = document.createElement("div");
    messagingBox.setAttribute("id", "messaging-box");
    updateMessages( messagingBox );
    form.appendChild(messagingBox);

    var userId = window.localStorage.guystationMessagingId ? window.localStorage.guystationMessagingId : Math.random().toString(36).substr(2, 9);
    window.localStorage.guystationMessagingId = userId;
    if ( swRegistration && swRegistration.active ) {
        swRegistration.active.postMessage( JSON.stringify( {id: userId}) );
    }
    var usernameInput = createInput( window.localStorage.guystationMessagingUsername ? window.localStorage.guystationMessagingUsername : "", "username-input", "Username: " );
    usernameInput.querySelector("input").oninput = function() {
        window.localStorage.guystationMessagingUsername = this.value;
    }
    form.appendChild( usernameInput );
    var contentInput = createInput( "", "content-input", "Message: ", null, true );
    form.appendChild( contentInput );
    form.appendChild( createButton("Send", function() {
        makeRequest( "POST", "/message", { "message": { "content": contentInput.querySelector("input").value, "user": { "id": userId, "name": usernameInput.querySelector("input").value } } } );
        contentInput.querySelector("input").value = "";
    }, [contentInput.querySelector("input")]) );

    launchModal( form );
    messagingBox.scrollTop = messagingBox.scrollHeight;

    registerNotification();
}

/**
 * Update the message display.
 * @param {HTMLElement} messagingBox - The element to put the messages in.
 */
function updateMessages( messagingBox ) {
    if ( !messagingBox ) messagingBox = document.querySelector("#messaging-box");
    if ( !messagingBox ) return;

    var scrollToBottom = false;
    if( messagingBox.scrollHeight - messagingBox.scrollTop === messagingBox.clientHeight) {
        scrollToBottom = true;
    }

    messagingBox.innerHTML = "";

    for( var i=0; i<messages.length; i++ ) {
        var message = document.createElement("div");
        message.classList.add("message");
        var name = document.createElement("span");
        name.classList.add("message-name");
        name.innerText = messages[i].user.name + ": ";
        message.appendChild(name);
        var content = document.createElement("span");
        content.innerText = messages[i].content;
        message.appendChild(content);
        messagingBox.appendChild( message );
    }

    if( scrollToBottom ) messagingBox.scrollTop = messagingBox.scrollHeight;
}

/**
 * Ask for permission to send notifications.
 */
function registerNotification() {
    Notification.requestPermission(permission => {
	    if (!permission === 'granted') console.log("Permission was not granted.");
	})
}

/**
 * Display power options.
 */
function displayPowerOptions() {
    var form = document.createElement("div");
    form.appendChild( createFormTitle("Power Options") );
    form.setAttribute("id", "power-options-form");
    var updateButton = createButton("Update GuyStation", function(event) {
        if( (!event.detail || event.detail == 1) && !makingRequest && !this.classList.contains("inactive") ) {
            displayConfirm( "Are you sure you want to update GuyStation?", function() { 
                startRequest(); 
                makeRequest( "GET", "/system/update", [], function() {
                    createToast("Please restart GuyStation to apply updates");
                    endRequest();
                    closeModal();
                }, function(responseText) {
                    try {
                        var message = JSON.parse(responseText).message;
			            createToast(message);
                    }
                    catch(err) {
                        createToast("An error occurred while trying to update");
                    }
                    endRequest();
                } );
            }, closeModal);
        }
    });
    updateButton.classList.add("inactive");
    form.appendChild(updateButton);
    // See if there are updates
    makeRequest( "GET", "/system/has-updates", [], function(responseText) {
        var response = JSON.parse(responseText);
        if( response.hasUpdates ) {
            updateButton.classList.remove("inactive");
        }
    });
    form.appendChild( createButton("Restart GuyStation", function(event) {
        if( (!event.detail || event.detail == 1) && !makingRequest ) {
            displayConfirm( "Are you sure you want to restart GuyStation?", function() { 
                startRequest(); 
                makeRequest( "GET", "/system/restart", [], null, function(responseText) {
                    try {
                        var message = JSON.parse(responseText).message;
			            createToast(message);
                    }
                    catch(err) {
                        createToast("Lost connection probably due to a successful restart.");
                    }
                    endRequest();
                } );
            }, closeModal);
        }
    }) );
    form.appendChild( createButton("Reboot Machine", function(event) {
        if( (!event.detail || event.detail == 1) && !makingRequest ) {
            displayConfirm( "Are you sure you want to reboot GuyStation?", function() { 
                startRequest(); 
                makeRequest( "GET", "/system/reboot", [], null, function(responseText) {
                    try {
                        var message = JSON.parse(responseText).message;
                        createToast(message);
                    }
                    catch(err) {
                        createToast("Lost connection probably due to a successful reboot.");
                    }
                    endRequest();
                } );
            }, closeModal);
        }
    }) );
    launchModal( form );
}

/**
 * Display picture in picture.
 */
function displayPictureInPicture() {
    var form = document.createElement("div");
    form.appendChild( createFormTitle("Picture in Picture") );
    form.setAttribute("id", "pip-form");
    
    var pipUrlInput = createInput(null, "pip-url-input", "URL: ");
    form.appendChild( pipUrlInput );

    var muteGame = createInput(null, "pip-mute-game-input", "Mute Game", "radio");
    muteGame.classList.add("inline");
    var muteGameInput = muteGame.querySelector("input");
    muteGameInput.setAttribute("name","pip-radio");
    muteGameInput.setAttribute("checked","checked");
    var muteVideo = createInput(null, "pip-mute-video-input", "Mute Video", "radio");
    muteVideo.classList.add("inline");
    muteVideo.querySelector("input").setAttribute("name","pip-radio");
    form.appendChild(muteGame);
    form.appendChild(muteVideo);

    var stopBreak = document.createElement("div");
    stopBreak.classList.add("break");
    form.appendChild(stopBreak);

    form.appendChild( createButton("Apply", function() {
        if( this.classList.contains("inactive") ) return;
        form.querySelectorAll("button").forEach( function(el) { el.classList.add("inactive") } );
        
        var muteMode = muteGameInput.checked ? "game" : "browser";
        var url = pipUrlInput.querySelector("input").value;
        if( url ) {
            makeRequest( "POST", "/pip/start", {
                url: url,
                muteMode: muteMode
            },
            function( responseText ) { standardSuccess(responseText, "PIP enabled") },
            function( responseText ) { 
                standardFailure( responseText );
                form.querySelectorAll("button").forEach( function(el) { el.classList.remove("inactive") } );
            } );
        }
        else {
            makeRequest( "POST", "/mute-mode", {
                muteMode: muteMode
            },
            function( responseText ) { standardSuccess(responseText, "Mute change made") },
            function( responseText ) { 
                standardFailure( responseText );
                form.querySelectorAll("button").forEach( function(el) { el.classList.remove("inactive") } );
            } );
        }

    } ) );
    form.appendChild( createButton("Stop", function() {
        if( this.classList.contains("inactive") ) return;
        form.querySelectorAll("button").forEach( function(el) { el.classList.add("inactive") } );
        
        makeRequest( "POST", "/pip/stop", {},
            function( responseText ) { standardSuccess(responseText, "PIP disabled") },
            function( responseText ) { 
                standardFailure( responseText );
                form.querySelectorAll("button").forEach( function(el) { el.classList.remove("inactive") } );
            }
        );

    } ) );
    form.appendChild( createButton("Toggle FS", function() {
        if( this.classList.contains("inactive") ) return;
        form.querySelectorAll("button").forEach( function(el) { el.classList.add("inactive") } );
        
        makeRequest( "POST", "/pip/fullscreen", {},
            function( responseText ) { standardSuccess(responseText, "PIP fullscreen toggled") },
            function( responseText ) { 
                standardFailure( responseText );
                form.querySelectorAll("button").forEach( function(el) { el.classList.remove("inactive") } );
            }
        );

    } ) );

    launchModal( form );
}

/**
 * Display the menu to delete a save.
 */
function displayDeleteSave() {
    var form = document.createElement("div");
    var selected = getSelectedValues(true, true);
    form.setAttribute("id", "delete-save-form");
    form.appendChild( createFormTitle("Delete Save") );
    form.appendChild( createSystemMenu( selected.system, false, true, true, true, true ) );
    form.appendChild( createFolderMenu( selected.parents, selected.system, false, false, true, true) );
    form.appendChild( createGameMenu(selected.game, selected.system, false, true, selected.parents, true) );
    form.appendChild( createSaveMenu(selected.save, selected.system, selected.game, true, selected.parents) );
    form.appendChild( createButton( "Delete Save", function(event) {
        if( (!event.detail || event.detail == 1) && !makingRequest ) {
            var systemSelect = document.querySelector(".modal #delete-save-form #system-select");
            var gameSelect = document.querySelector(".modal #delete-save-form #game-select");
            var saveSelect = document.querySelector(".modal #delete-save-form #save-select");
            var system = systemSelect.options[systemSelect.selectedIndex].value;
            var game = gameSelect.options[gameSelect.selectedIndex].value;
            var save = saveSelect.options[saveSelect.selectedIndex].value;
            var parents = extractParentsFromFolderMenu();
            displayConfirm( "Are you sure you want to delete the save \""+save+"\" for " + game + " for " + system + "?", function() { startRequest(); deleteSave(system, game, save, parents); }, closeModal);
        }
    } ) );
    launchModal( form );
}

/**
 * Display the menu to select a save.
 */
function displaySelectSave() {
    var form = document.createElement("div");
    var selected = getSelectedValues(true, true);
    form.setAttribute("id", "change-save-form");
    form.appendChild( createFormTitle("Change Save") );
    form.appendChild( createSystemMenu( selected.system, false, true, true, true, true ) );
    form.appendChild( createFolderMenu( selected.parents, selected.system, false, false, true, true) );
    form.appendChild( createGameMenu(selected.game, selected.system, false, true, selected.parents, true) );
    form.appendChild( createSaveMenu(selected.save, selected.system, selected.game, true, selected.parents) );
    form.appendChild( createButton( "Change Save", function(event) {
        if( (!event.detail || event.detail == 1) && !makingRequest ) {
            startRequest();
            var systemSelect = document.querySelector(".modal #change-save-form #system-select");
            var gameSelect = document.querySelector(".modal #change-save-form #game-select");
            var saveSelect = document.querySelector(".modal #change-save-form #save-select");
            var parents = extractParentsFromFolderMenu();
            changeSave( systemSelect.options[systemSelect.selectedIndex].value, gameSelect.options[gameSelect.selectedIndex].value, saveSelect.options[saveSelect.selectedIndex].value, parents );
        }
    } ) );
    launchModal( form );
}

/**
 * Cycle to the next save.
 * @param {Number} offset - The number of positions to cycle.
 */
function cycleSave(offset) {
    if( !makingRequest ) { 
        var selected = getSelectedValues(true, true);
        if( selected.system && selected.game && selected.save && selected.parents && selected.highlighted ) {
            var saves = Object.keys(getGamesInFolder(selected.parents, selected.system)[selected.game].saves);
            var currentSaveIndex = saves.indexOf( selected.save );
            var nextIndex = getIndex(currentSaveIndex, saves, offset);
            startRequest();
            changeSave( selected.system, selected.game, saves[nextIndex], selected.parents );
        }
    }
}

/**
 * Display the menu to delete a save.
 */
function displayUpdateSave() {
    var form = document.createElement("div");
    var selected = getSelectedValues(true, true);
    form.setAttribute("id", "update-save-form");
    form.appendChild( createFormTitle("Update Save") );
    form.appendChild( createSystemMenu( selected.system, false, true, true, true, true, null, null, true ) );
    form.appendChild( createFolderMenu( selected.parents, selected.system, false, false, true, true, null, null, null, null, true) );
    form.appendChild( createGameMenu(selected.game, selected.system, false, true, selected.parents, true, null, true) );
    var saveMenu = createSaveMenu(selected.save, selected.system, selected.game, true, selected.parents, true);
    form.appendChild( saveMenu );
    var saveInput = createSaveInput(null, true);
    form.appendChild( saveInput );
    form.appendChild( createButton( "Update Save", function(event) {
        if( (!event.detail || event.detail == 1) && !makingRequest ) {
            startRequest();
            var systemSelect = document.querySelector(".modal #update-save-form #system-select");
            var gameSelect = document.querySelector(".modal #update-save-form #game-select");
            var saveSelect = document.querySelector(".modal #update-save-form #save-select");
            var saveInput = document.querySelector(".modal #update-save-form #save-input");
            var parents = extractParentsFromFolderMenu();
            updateSave( systemSelect.options[systemSelect.selectedIndex].value, gameSelect.options[gameSelect.selectedIndex].value, parents, saveSelect.options[saveSelect.selectedIndex].value, saveInput.value );
        }
    }, [saveInput.firstElementChild.nextElementSibling] ) );
    launchModal( form );
}

/**
 * Display the menu to add a save.
 */
function displayAddSave() {
    var form = document.createElement("div");
    var selected = getSelectedValues(true, true);
    form.setAttribute("id", "add-save-form");
    form.appendChild( createFormTitle("Add Save") );
    form.appendChild( createSystemMenu( selected.system, false, true, true, true, true ) );
    form.appendChild( createFolderMenu( selected.parents, selected.system, false, false, true, true) );
    form.appendChild( createGameMenu(selected.game, selected.system, false, true, selected.parents, true) );
    var saveInput = createSaveInput(null, true);
    form.appendChild( saveInput );
    form.appendChild( createButton( "Add Save", function(event) {
        if( (!event.detail || event.detail == 1) && !makingRequest ) {
            startRequest();
            var systemSelect = document.querySelector(".modal #add-save-form #system-select");
            var gameSelect = document.querySelector(".modal #add-save-form #game-select");
            var saveInput = document.querySelector(".modal #add-save-form #save-input");
            var parents = extractParentsFromFolderMenu();
            addSave( systemSelect.options[systemSelect.selectedIndex].value, gameSelect.options[gameSelect.selectedIndex].value, saveInput.value, parents );
        }
    }, [saveInput.firstElementChild.nextElementSibling] ) );
    launchModal( form );
}

/**
 * Display the menu to delete a game.
 */
function displayDeleteGame() {
    var form = document.createElement("div");
    var selected = getSelectedValues(null, null, true);
    form.setAttribute("id", "delete-game-form");
    form.appendChild( createFormTitle("Delete Game") );
    form.appendChild( createSystemMenu( selected.system, false, true, true, false, false, true ) );
    form.appendChild( createFolderMenu( selected.parents, selected.system, false, false, true, false, null, true) );
    form.appendChild( createGameMenu(selected.game, selected.system, false, true, selected.parents, false, true) );
    form.appendChild( createButton( "Delete Game", function(event) {
        if( (!event.detail || event.detail == 1) && !makingRequest ) {
            var systemSelect = document.querySelector(".modal #delete-game-form #system-select");
            var gameSelect = document.querySelector(".modal #delete-game-form #game-select");
            var system = systemSelect.options[systemSelect.selectedIndex].value;
            var game = gameSelect.options[gameSelect.selectedIndex].value;
            var parents = extractParentsFromFolderMenu();
            displayConfirm( "Are you sure you want to delete " + game + " for " + system + "?", function() { startRequest(); deleteGame(system, game, parents); }, closeModal )
        }
    } ) );
    launchModal( form );
}

/**
 * Display a confirm modal.
 * @param {string} message - The message to display in the confirm box.
 * @param {Function} yesCallback - The function to execute if yes is selected.
 * @param {Function} noCallback - The function to execute if no is selected.
 */
function displayConfirm( message, yesCallback, noCallback ) {
    var form = document.createElement("div");
    form.setAttribute("id", "are-you-sure");
    form.appendChild( createFormTitle("Are You Sure?") );
    form.appendChild( createWarning(message) );
    form.appendChild( createButton( "No", function(event) { if(!event.detail || event.detail == 1) noCallback(event); } ) );
    form.appendChild( createButton( "Yes", function(event) { if(!event.detail || event.detail == 1) yesCallback(event); } ) );
    launchModal(form);
}

/**
 * Display the menu to update a game.
 */
function displayUpdateGame() {
    var form = document.createElement("div");
    var selected = getSelectedValues();
    var selectedGame = getGamesInFolder(selected.parents, selected.system)[selected.game];
    var mediaOnly = false;
    if( selectedGame.isPlaylist ) mediaOnly = true;
    form.setAttribute("id", "update-game-form");
    form.appendChild( createFormTitle("Update Game") );
    form.appendChild( createSystemMenu( selected.system, true, true, true, false, false ) );
    form.appendChild( createFolderMenu( selected.parents, selected.system, true, false, true, false) );
    form.appendChild( createGameMenu( selected.game, selected.system, true, true, selected.parents, false ) );
    form.appendChild( createWarning("If you do not wish to change a field, you may leave it blank.") );
    form.appendChild( createSystemMenu( selected.system, false, false, false, false, false, false, mediaOnly ) );
    form.appendChild( createFolderMenu( selected.parents, selected.system, false, false, false, false, form) );
    var gameInput = createGameInput();
    form.appendChild( gameInput );
    var romFileInput = createRomFileInput();
    form.appendChild( romFileInput );
    var romDownloadInput = createRomDownloadInput();
    form.appendChild( romDownloadInput );
    form.appendChild( createPlaylistMenu( translateSymlinks(getGamesInFolder(selected.parents, selected.system)[selected.game], selected.system) ) );
    // Do this here 
    ensureRomInputAndPlaylistSelectIsDisplayedOrHidden( form, true );
    form.appendChild( createButton( "Update Game", function(event) {
        if( (!event.detail || event.detail == 1) && !makingRequest ) {
            startRequest();
            var oldSystemSelect = document.querySelector(".modal #update-game-form #old-system-select");
            var oldGameSelect = document.querySelector(".modal #update-game-form #old-game-select");
            var systemSelect = document.querySelector(".modal #update-game-form #system-select");
            var gameInput = document.querySelector(".modal #update-game-form #game-input");
            var romFileInput = document.querySelector(".modal #update-game-form #rom-file-input");
            var romDownloadInput = document.querySelector(".modal #update-game-form #rom-download-input");
            var parents = extractParentsFromFolderMenu();
            var oldParents = extractParentsFromFolderMenu(true);
            var isFolder = getGamesInFolder(oldParents, oldSystemSelect.options[oldSystemSelect.selectedIndex].value)[oldGameSelect.options[oldGameSelect.selectedIndex].value].isFolder;
            var isPlaylist = getGamesInFolder(oldParents, oldSystemSelect.options[oldSystemSelect.selectedIndex].value)[oldGameSelect.options[oldGameSelect.selectedIndex].value].isPlaylist;
            var playlistItems = extractItemsfromPlaylistContainer();

            updateGame( oldSystemSelect.options[oldSystemSelect.selectedIndex].value, oldGameSelect.options[oldGameSelect.selectedIndex].value, oldParents, systemSelect.options[systemSelect.selectedIndex].value, gameInput.value, romFileInput.files[0] ? romFileInput.files[0] : romDownloadInput.value, parents, isFolder, isPlaylist, playlistItems );
        }
    } ) );
    launchModal( form );
}

/**
 * Translate symlinked entries into what they actually refernce
 * All that is needed is the name which includes parents to dereference
 * all symlinks are on the same system as what they reference.
 * @param {HTMLElement} gameDictEntry - A playlist entry.
 * @param {string} system - The system the game is on.
 * @returns {Array<Object>} An array of games that are what the playlists .games values point to.
 */
function translateSymlinks(gameDictEntry, system) {
    var gameDictEntries = [];
    if( gameDictEntry.isPlaylist ) {
        var gameDictEntryGameKeys = Object.keys(gameDictEntry.games);
        for(var i=0; i<gameDictEntryGameKeys.length; i++) {
            var pointerGameDictEntry = gameDictEntry.games[ gameDictEntryGameKeys[i] ];
            var path = pointerGameDictEntry.game.split(SERVER_PLAYLIST_SEPERATOR);
            path.shift(); // remove the random string
            var curGameDictEntry = getGamesInFolder( path.slice(0, path.length-1), system)[ path[path.length-1] ];
            curGameDictEntry = JSON.parse(JSON.stringify(curGameDictEntry));
            curGameDictEntry.parents = path.slice(0, path.length-1);
            gameDictEntries.push(curGameDictEntry);
        }
        return gameDictEntries;   
    }
    return [];
}

/**
 * Display the menu to add a game.
 */
function displayAddGame() {
    var form = document.createElement("div");
    // We don't use selected because we don't need a game for addgame
    //var selected = getSelectedValues();
    form.setAttribute("id", "add-game-form");
    form.appendChild( createFormTitle("Add Game") );
    // the system may be invalid (e.g. browser)
    var systemMenu = createSystemMenu( document.querySelector(".system.selected").getAttribute("data-system"), false, true, false, false, false );
    form.appendChild( systemMenu );
    var selectedSystemElement = systemMenu.querySelector("select");
    var selectedSystem = selectedSystemElement.options[selectedSystemElement.selectedIndex].value;

    var selectedGameElement = document.querySelector(".system[data-system='"+selectedSystem+"'] .game.selected");
    var selectedParents = selectedGameElement ? parentsStringToArray(selectedGameElement.getAttribute("data-parents")) : [];
    form.appendChild( createFolderMenu( selectedParents, selectedSystem, false, false, false, false) );
    var gameInput = createGameInput(null, true);
    form.appendChild( gameInput );
    form.appendChild( createTypeMenu(null, getTypeOptions( selectedSystem ), true) );
    var romFileInput = createRomFileInput(false);
    form.appendChild( romFileInput );
    var romDownloadInput = createRomDownloadInput(false);
    form.appendChild( romDownloadInput );

    var playlistMenu = createPlaylistMenu();
    playlistMenu.classList.add("hidden");
    form.appendChild( playlistMenu );
    form.appendChild( createButton( "Add Game", function(event) {
        if( (!event.detail || event.detail == 1) && !makingRequest ) {
            startRequest();
            var systemSelect = document.querySelector(".modal #add-game-form #system-select");
            var gameInput = document.querySelector(".modal #add-game-form #game-input");
            var romFileInput = document.querySelector(".modal #add-game-form #rom-file-input");
            var romDownloadInput = document.querySelector(".modal #add-game-form #rom-download-input");
            var typeSelect = document.querySelector(".modal #add-game-form #type-select"); 
            var parents = extractParentsFromFolderMenu();
            var playlistItems = extractItemsfromPlaylistContainer();

            addGame( systemSelect.options[systemSelect.selectedIndex].value, gameInput.value, romFileInput.files[0] ? romFileInput.files[0] : romDownloadInput.value, parents, typeSelect.options[typeSelect.selectedIndex].value == "Folder", typeSelect.options[typeSelect.selectedIndex].value == "Playlist", playlistItems );
        }
    }, [ gameInput.firstElementChild.nextElementSibling ] ) );
    launchModal( form );
}

/**
 * Get available type options.
 * @param {string} system - The system.
 */
function getTypeOptions(system) {
    if( system == "media" ) return ["Game", "Folder", "Playlist"];
    return ["Game", "Folder"];
}

/**
 * Check if a folder contains real games.
 * A playlist is not considered a real game in this instance.
 * @param {Object} games - A standard games object (.games attribute of systems or folder).
 * @returns {boolean} Whether or not the folder contains real games.
 */
function folderContainsRealGames(games) {
    for( var game of Object.keys(games) ) {
        var gameEntry = games[game];
        if( gameEntry.isFolder ) {
            if( folderContainsRealGames(gameEntry.games) ) {
                return true;
            }
        }
        else if( !gameEntry.isPlaylist ) {
            return true;
        }
    }
    return false;
}

/**
 * Create a select element containing systems.
 * Note: for onlyWithGames and onlyWithRealGames, they also exist on functions "below" systems such as Folders and Games
 * These values should always be the same from the top (systems) down.
 * @param {string} [selected] - The system selected by default.
 * @param {boolean} [old] - True if the old system for chanding (changes the id).
 * @param {boolean} [required] - If the field is required.
 * @param {boolean} [onlyWithGames] - True if we should only show systems with games in the menu - this will get passed to sub menus.
 * @param {boolean} [onlySystemsSupportingSaves] - True if we should only allow systems supporting saves.
 * @param {boolean} [onlyWithRealGames] - True if we should only show systems with real games in the menu - this will get passed to sub menus.
 * @param {boolean} [onlyWithLeafNodes] - True if we only want to show "leaf nodes" (only impacts the game menu) - i.e. empty folders or games - if onlyWithGames is true (which it should be when this is), then we won't ever selected a leaf node as a folder, so that's why it is only needed for the game menu.
 * @param {boolean} [mediaOnly] - True if we want the only system to be media.
 * @param {boolean} [displaySaveOld] - Alter the label for the save to say current.
 * @returns {HTMLElement} A select element containing the necessary keys wrapped by a label.
 */
function createSystemMenu( selected, old, required, onlyWithGames, onlySystemsSupportingSaves, onlyWithRealGames, onlyWithLeafNodes, mediaOnly, displaySaveOld ) {
    var systemsKeys = Object.keys(systemsDict).filter( (element) => !nonGameSystems.includes(element) );
    if( mediaOnly ) systemsKeys = ["media"];
    if( onlySystemsSupportingSaves ) {
        systemsKeys = systemsKeys.filter( (element) => !nonSaveSystems.includes(element) );
    }
    if( onlyWithGames ) {
        systemsKeys = systemsKeys.filter( (element) => Object.keys(systemsDict[element].games).length > 0 );
    }
    if( onlyWithRealGames ) {
        systemsKeys = systemsKeys.filter( (element) => folderContainsRealGames(systemsDict[element].games) );
    }
    return createMenu( selected, systemsKeys, (old ? "old-" : "") + "system-select", (old ? "Current " : "") + "System: ", function() {
        var system = this.options[this.selectedIndex].value;
        var modal = document.querySelector(".modal");
        var folderSelect = modal.querySelector("#" + (old ? "old-" : "") + "folder-select-container");
        var gameSelect = modal.querySelector("#" + (old ? "old-" : "") + "game-select");
        var typeSelect = modal.querySelector("#type-select");
        if( folderSelect && !gameSelect ) {
            // It's fine if this is a folder, since we are just using it to get parents
            var currentGameElement = document.querySelector(".system[data-system='"+system+"'] .game.selected");
            var selectedParents = [];
            if( currentGameElement ) {
                selectedParents = parentsStringToArray(currentGameElement.getAttribute("data-parents"));
            } 
            folderSelect.parentNode.replaceWith( createFolderMenu( selectedParents, system, old, folderSelect.hasAttribute("required"), onlyWithGames, onlyWithRealGames, null, onlyWithLeafNodes, null, null, displaySaveOld ) );
        }
        if( gameSelect ) {
            var currentGameElement = document.querySelector(".system[data-system='"+system+"'] .game.selected")
            var currentGame = null;
            var selectedParents = null;
            if( currentGameElement 
                && (!onlyWithRealGames || !currentGameElement.hasAttribute("data-is-folder"))
                && (!onlyWithLeafNodes || isLeafElement(currentGameElement, system) ) ) {
                currentGame = decodeURIComponent(currentGameElement.getAttribute("data-game"));
            }
            // next try to look for a folder in the same level as the selected game like we do in getSelected
            else if( currentGameElement ) {
                var folderParents = currentGameElement.getAttribute("data-parents");
                if( onlyWithRealGames ) {
                    currentGameElement = document.querySelector('.system[data-system="'+system+'"] .game[data-parents="'+folderParents+'"]:not([data-is-folder])');
                    if( currentGameElement ) {
                        currentGame = decodeURIComponent(currentGameElement.getAttribute("data-game"));
                    }
                }
                else if(onlyWithLeafNodes) {
                    currentGameElement = Array.prototype.slice.call(document.querySelectorAll('.system[data-system="'+system+'"] .game[data-parents="'+folderParents+'"]')).filter( (el) => isLeafElement(el, system) )[0];
                    if( currentGameElement ) {
                        currentGame = decodeURIComponent(currentGameElement.getAttribute("data-game"));
                    }
                }
            }
            // there is no selected game element in our folder, just find any one
            // we KNOW there is at least one game in there since we filtered earlier - we wouldn't select a system with a game select that has no games/no real games
            if( !currentGame ) { // This could change the value needed for folder select
                var not = onlyWithRealGames ? ":not([data-is-folder])" : ""; // see IMPORTANT NOTE -  you should not  allow a game select with the potentiality of there being nothing to have selected by default
                var currentGameElements = document.querySelectorAll(".system[data-system='"+system+"'] .game" + not);
                if( onlyWithLeafNodes ) {
                    currentGameElements = Array.prototype.slice.call(currentGameElements).filter( el => isLeafElement(el, system) );
                }
                currentGameElement = currentGameElements[0];
                currentGame = decodeURIComponent(currentGameElement.getAttribute("data-game"));
            }
            if( folderSelect ) {
                folderSelect.parentNode.replaceWith( createFolderMenu( parentsStringToArray(currentGameElement.getAttribute("data-parents")), system, old, folderSelect.hasAttribute("required"), onlyWithGames, onlyWithRealGames, null, onlyWithLeafNodes, null, null, displaySaveOld ) );
            }
            // Again, it's fine to use a folder as parents
            var selectedParents = parentsStringToArray(currentGameElement.getAttribute("data-parents"));
            gameSelect.parentNode.replaceWith( createGameMenu( currentGame, system, old, gameSelect.hasAttribute("required"), selectedParents, onlyWithRealGames, onlyWithLeafNodes, displaySaveOld ) );
            var saveSelect = modal.querySelector("#save-select");
            if( saveSelect && !old ) {
                var currentSave = null;
                if( currentGame  ) {
                    var currentSaveElement = document.querySelector(".system[data-system='"+system+"'] .game.selected .current-save");
                    if( currentSaveElement ) { // ensures not a folder
                        currentSave = currentSaveElement.innerText;
                    }
                }
                saveSelect.parentNode.replaceWith( createSaveMenu( currentSave, system, currentGame, saveSelect.hasAttribute("required"), selectedParents, displaySaveOld ) );
            }
        }
        if( typeSelect ) {
            var newTypeSelect = createTypeMenu( typeSelect.options[typeSelect.selectedIndex].value, getTypeOptions(system), typeSelect.getAttribute("required") );
            typeSelect.parentNode.replaceWith(newTypeSelect);
            newTypeSelect.querySelector("#type-select").onchange(); // ensure the proper items are shown
        }

        ensureSystemMenuIsCorrectBasedOnIfOldGameIsPlaylist( modal, old );
        // when we change an old menu - be it system, game or folder, we need to make sure that the new folder menu has all options available
        // to do this, just regenerate the new folder menu
        ensureNewFolderMenuHasCorrectOptions( modal, old );
        ensureRomInputAndPlaylistSelectIsDisplayedOrHidden( modal, old );
    }, required );
}

/**
 * Convert an array of parents to a string.
 * @param {Array<string>} parents - The array of parents.
 * @returns {string} The parents string.
 */
function parentsArrayToString(parents) {
    return encodeURIComponent(parents.join(UUID));
}

/**
 * Convert a string of parents to an array.
 * @param {string} parents - The string of parents.
 * @returns {Array<string>} The parents array.
 */
function parentsStringToArray(parents) {
    return parents.split(UUID).map( (el) => decodeURIComponent(el) ).filter( (el) => el !== "" );
}

/**
 * Create a ROM download input element.
 * @param {boolean} [required] - If the field is required.
 * @returns {HTMLElement} An input element wrapped by a label.
 */
function createRomDownloadInput( required ) {
    return createInput( "", "rom-download-input", "or Rom URL: ", null, required );
}

/**
 * Create an input element for a game.
 * @param {string} [defaultValue] - The default value of the element.
 * @param {boolean} [required] - If the field is required.
 * @returns {HTMLElement} An input element wrapped by a label.
 */
function createGameInput( defaultValue, required ) {
    return createInput( defaultValue, "game-input", "Game: ", null, required );
}

/**
 * Create a select element containing games.
 * @param {string} [selected] - The game selected by default.
 * @param {string} [system] - The system the game is on.
 * @param {boolean} [old] - True if the old game for chanding (changes the id).
 * @param {boolean} [required] - If the field is required.
 * @param {Array<string>} parents - A list of parent folders for games - options are limited to their contents.
 * @param {boolean} [onlyWithRealGames] - True if we should only show systems with real games in the menu - this will get passed to sub menus.
 * @param {boolean} [onlyWithLeafNodes] - True if we only want to show "leaf nodes" (only impacts the game menu) - i.e. empty folders or games.
 * @param {boolean} [displaySaveOld] - Alter the label for the save to say current.
 * @returns {HTMLElement} A select element containing the necessary keys wrapped by a label.
 */
function createGameMenu( selected, system, old, required, parents, onlyWithRealGames, onlyWithLeafNodes, displaySaveOld ) {
    // Note how we will never include folders in a game select
    var games = getGamesInFolder(parents, system);
    if( onlyWithRealGames ) games = filterGameTypes(games, false);
    if( onlyWithLeafNodes ) {
        var newObj = {};
        for( var game of Object.keys(games) ) {
            if( (games[game].isFolder && !Object.keys(games[game].games).length) || !games[game].isFolder ) {
                newObj[game] = games[game];
            }
        }
        games = newObj;
    }
    return createMenu( selected, Object.keys(games), (old ? "old-" : "") + "game-select", (old ? "Current " : "") + "Game: ", function() {
        var game = this.options[this.selectedIndex].value;
        var modal = document.querySelector(".modal");
        var system = modal.querySelector("#system-select");
        var currentSystem = system.options[system.selectedIndex].value;
        var saveSelect = modal.querySelector("#save-select");
        if( saveSelect ) {
            var currentSaveElement = document.querySelector('.system[data-system="'+currentSystem+'"] .game[data-game="'+encodeURIComponent(game)+'"] .current-save');
            var currentSave = null;
            if( currentSaveElement ) {
                currentSave = currentSaveElement.innerText;
                // If we're only changing game, parents shouldn't have changed. We'll get a new game menu if parents change.
            }
            saveSelect.parentNode.replaceWith( createSaveMenu( currentSave, currentSystem, game, saveSelect.hasAttribute("required"), parents, displaySaveOld ) );
        }

        ensureSystemMenuIsCorrectBasedOnIfOldGameIsPlaylist( modal, old );
        // when we change an old menu - be it system, game or folder, we need to make sure that the new folder menu has all options available
        // to do this, just regenerate the new folder menu
        ensureNewFolderMenuHasCorrectOptions( modal, old );
        ensureRomInputAndPlaylistSelectIsDisplayedOrHidden( modal, old );
        
    }, required );
}

/**
 * Ensure the system menu is correct based on if the old game is a playlist.
 * If it is, the only system should be media. Otherwise, any system will fly because this is from an update modal.
 * @param {HTMLElement} [modal] - The modal.
 * @param {boolean} [old] - A check to make sure the old item is the one that changed.
 */
function ensureSystemMenuIsCorrectBasedOnIfOldGameIsPlaylist( modal, old ) {
    if( old && modal ) {
        var oldSystemSelect = modal.querySelector("#old-system-select");
        var oldGameSelect = modal.querySelector("#old-game-select");
        var oldParents = extractParentsFromFolderMenu( true, modal );
        var newSystemSelect =  document.querySelector("#system-select");
        var mediaOnly = false;
        if( getGamesInFolder(oldParents, oldSystemSelect.options[oldSystemSelect.selectedIndex].value )[oldGameSelect.options[oldGameSelect.selectedIndex].value].isPlaylist ) {
            if( newSystemSelect.options[newSystemSelect.selectedIndex].value != "media" ) {
                newSystemSelect.value = "media";
                newSystemSelect.onchange(); // will update folders
            }
            mediaOnly = true;
        }
        // This is an update menu, so we use the same settings as for displayUpdateGame
        newSystemSelect.parentNode.replaceWith( createSystemMenu( mediaOnly ? "media" : newSystemSelect.options[newSystemSelect.selectedIndex].value, false, false, false, false, false, false, mediaOnly ) );
    }
}

/**
 * Ensure the rom input is displayed or hidden properly.
 * @param {HTMLElement} [modal] - The modal.
 * @param {boolean} [old] - A check to make sure the old item is the one that changed.
 */
function ensureRomInputAndPlaylistSelectIsDisplayedOrHidden( modal, old ) {
    if( old && modal ) {
        var oldSystemSelect = modal.querySelector("#old-system-select");
        var oldGameSelect = modal.querySelector("#old-game-select");
        var romFileInput = modal.querySelector("#rom-file-input");
        var romDownloadInput = modal.querySelector("#rom-download-input");
        var playlistSelect = modal.querySelector("#playlist-container");
        var oldParents = extractParentsFromFolderMenu(true, modal);
        var oldSystem = oldSystemSelect.options[oldSystemSelect.selectedIndex].value;
        var oldGame = oldGameSelect.options[oldGameSelect.selectedIndex].value;
        var isFolder = getGamesInFolder(oldParents, oldSystem)[oldGame].isFolder;
        var isPlaylist = getGamesInFolder(oldParents, oldSystem)[oldGame].isPlaylist;
        if( isFolder ) {
            romFileInput.parentNode.classList.add("hidden");
            romDownloadInput.parentNode.classList.add("hidden");
            playlistSelect.parentNode.classList.add("hidden");
        }
        else if( isPlaylist ) {
            romFileInput.parentNode.classList.add("hidden");
            romDownloadInput.parentNode.classList.add("hidden");
            playlistSelect.parentNode.classList.remove("hidden");
        }
        else {
            playlistSelect.parentNode.classList.add("hidden");
            romFileInput.parentNode.classList.remove("hidden");
            romDownloadInput.parentNode.classList.remove("hidden");
        }
        if( !playlistSelect.parentNode.classList.contains("hidden") ) {
            playlistSelect.parentNode.replaceWith( createPlaylistMenu( translateSymlinks(getGamesInFolder(oldParents, oldSystem)[oldGame], oldSystem) ) );
        }
    }
}

/**
 * Ensure that the new folder menu has correct options - some can be taken out based on the value
 * of the currently selection item in createFolderMenu for old to prevent a folder from being placed inside itself.
 * However, if we then switch the old game by changing system, game or folder, we want to make sure the new menu updates.
 * @param {HTMLElement} [modal] - The modal.
 * @param {boolean} [old] - A check to make sure the old item is the one that changed.
 */
function ensureNewFolderMenuHasCorrectOptions( modal, old ) {
    if( old && modal && modal.querySelector("#folder-select-container") ) {
        var newParents = extractParentsFromFolderMenu(false, modal);
        var newSystem = modal.querySelector("#system-select");
        // this is like the second options in createFolder in displayUpdateGame
        modal.querySelector("#folder-select-container").parentNode.replaceWith( createFolderMenu(newParents, newSystem.options[newSystem.selectedIndex].value, false, false, false, false, modal ) );
    }
}

/**
 * Get all the games in a folder.
 * This will return folders too.
 * Note how on the server the method we often use, getGameDictEntry will get a game object (of which games is a key),
 * but this will get a the games object. They are similar, and you can get a game object he simply by using the game's
 * parents and then looking up the game by key in the object this function returns.
 * This works well with filterGameTypes
 * @param {Array<string>} parents - The parent folders.
 * @param {string} system - The system the folders are for.
 * @param {boolean} [allowPlaylist] - Allow playlists to count as folders.
 * @returns {Object} The games object for the specified parents.
 */
function getGamesInFolder( parents, system, allowPlaylist ) {
    var parentsCopy = parents.slice(0);
    var games = systemsDict[system].games;
    while( parentsCopy && parentsCopy.length ) {
        var cur = parentsCopy.shift();
        if( games[cur].isPlaylist && !allowPlaylist ) return null; // Playlists do not count as folders for now
        if( cur ) games = games[cur].games;
    }
    return games;
}

/**
 * Get the games in a folder recursively.
 * This function will set the parents on each gameDictEntry.
 * @param {Object} games - A games object (e.g. systems[system].games).
 * @param {Array<Object>} arr - An array that will be populated by the function.
 * @param {Array<string>} parents - The current parents.
 */
function getRealGamesInFolderRecursive(games, arr, parents) {
    for( var game of Object.keys(games) ) {
        var curParents = parents.slice(0);
        var gameEntry = games[game];
        if( gameEntry.isFolder ) {
            curParents.push( gameEntry.game );
            getRealGamesInFolderRecursive(gameEntry.games, arr, curParents); // takes care of playlist
        }
        else {
            gameEntry = JSON.parse( JSON.stringify(gameEntry ));
            gameEntry.parents = curParents;
            arr.push( gameEntry );
        }
    }
}

/**
 * Filter a game object to only include folders/games.
 * In this case a playlist is considered a game.
 * @param {Object} games - A games object (e.g. systems[system].games).
 * @param {boolean} [getFolders] - True if we are getting folders, false if we are getting games.
 * @returns {Object} The filtered games object.
 */
function filterGameTypes( games, getFolders ) {
    var newObj = {};
    for( var game of Object.keys(games) ) {
        if( (games[game].isFolder && getFolders) || (!games[game].isFolder && !getFolders) ) {
            newObj[game] = games[game];
        }
    }
    return newObj;
}

/**
 * Remove playlists (Filter out).
 * @param {Object} games - A games object (e.g. systems[system].games).
 * @returns {Object} The filtered games object.
 */
function removePlaylists( games ) {
    var newObj = {};
    for( var game of Object.keys(games) ) {
        if( (!games[game].isPlaylist) ) {
            newObj[game] = games[game];
        }
    }
    return newObj;
}

/**
 * Remove not downloaded (Filter out).
 * @param {Object} games - A games object (e.g. systems[system].games).
 * @returns {Object} The filtered games object.
 */
function removeNotDownloaded( games ) {
    var newObj = {};
    for( var game of Object.keys(games) ) {
        if( (!games[game].status) ) {
            newObj[game] = games[game];
        }
    }
    return newObj;
}

/**
 * Extract a parents array from folder menus.
 * @param {boolen} [old] - True if this is an old list (changes looked for).
 * @param {HTMLElement} [modal] - The modal containing the menus.
 * @param {Array<HTMLElement>} [folderDropdowns] - The dropdowns.
 * @returns {Array<string>} A list of the parents in order.
 */
function extractParentsFromFolderMenu(old, modal, folderDropdowns) {
    if( !modal ) modal = document.querySelector(".modal");
    if( !folderDropdowns ) folderDropdowns = modal.querySelectorAll("#" + (old ? "old-" : "") + "folder-select-container select");
    var parents = [];
    for( var i=0; i<folderDropdowns.length; i++ ) {
        var currentDropdown = folderDropdowns[i];
        var value = currentDropdown.options[currentDropdown.selectedIndex].value;
        if(value) {
            parents.push( value );
        }
    }
    return parents;
}

/**
 * Extract items from a playlist container.
 * @param {HTMLElement} [modal] - The modal containing the playlists.
 * @returns {Array<Array<String>>} An array of arrays of items.
 */
function extractItemsfromPlaylistContainer(modal) {
    if( !modal ) modal = document.querySelector(".modal");
    var tracks = modal.querySelectorAll(".playlist-select-container");
    var playlists = [];
    for( var i=0; i<tracks.length; i++ ) {
        var itemPath = extractParentsFromFolderMenu( false, modal, tracks[i].querySelectorAll("select") );
        if( itemPath.length ) {
            playlists.push( itemPath );
        }
    }
    return playlists
}

/**
 * Create position indicator.
 * @param {number} currentPosition - The current position.
 * @param {number} maxPosition - The max position.
 * @returns {HTMLElement} The position indicator.
 */
function createPositionIndicator(currentPosition, maxPosition) {
    var positionDiv = document.createElement("div");
    positionDiv.classList.add("position-indicator");
    var currentPositionSpan = document.createElement("span");
    currentPositionSpan.classList.add("current-position");
    currentPositionSpan.innerText = currentPosition;
    positionDiv.appendChild(currentPositionSpan);
    positionDiv.innerHTML += "/";
    var maxPositionSpan = document.createElement("span");
    maxPositionSpan.classList.add("max-position");
    maxPositionSpan.innerText = maxPosition;
    positionDiv.appendChild(maxPositionSpan);
    return positionDiv;
}

/**
 * Create a playlist menu.
 * @param {Array<HTMLElement>} gameDictEntries - A list of game dict entries with parents included.
 * @returns {HTMLElement} A playlist element (several folder dropdowns) wrapped by a Label.
 */
function createPlaylistMenu( gameDictEntries ) {
    var playlistElement = document.createElement("div");
    playlistElement.setAttribute("id", "playlist-container");

    if( !gameDictEntries ) {
        gameDictEntries = [];
    }

    // always have at least one element for adding
    gameDictEntries.push( { game: "", parents: [] } );

    for( var i=0; i<gameDictEntries.length; i++ ) {
        var currentParents = gameDictEntries[i].parents.slice(0);
        currentParents.push(gameDictEntries[i].game);
        var folderMenu = createFolderMenu( currentParents, "media", false, false, true, true, null, true, true, i );
        playlistElement.appendChild(folderMenu);
    }
    
    return addLabel(playlistElement, "Playlist: ");
}

/**
 * Create a menu for folders.
 * @param {Array} parents - A list of the current parents (folders) - it is ok if there are "" items in the parents array, they will be removed.
 * @param {string} system - The system the menu is for.
 * @param {boolen} [old] - True if this is an old list (changes id).
 * @param {boolean} [required] - True if the dropdowns are required.
 * @param {boolean} [onlyWithGames] - True if we should only show systems with games in the menu.
 * @param {boolean} [onlyWithRealGames] - True if we should only show systems with real games in the menu.
 * @param {HTMLElement} [helperElement] - An element that contains other dropdowns (like the old dropdown) that we may need to change.
 * @param {boolean} [onlyWithLeafNodes] - True if we only want to show "leaf nodes" (only impacts the game menu) - i.e. empty folders or games - if onlyWithGames is true (which it should be when this is), then we won't ever selected a leaf node as a folder, so that's why it is only needed for the game menu.
 * @param {boolean} [isForPlaylist] - True if this is a folder menu for a playlist container.
 * @param {number} [playlistId] - The index of the playlist.
 * @param {boolean} [displaySaveOld] - Alter the label for the save to say current.
 * @returns {HTMLElement} An element containing dynamic folder dropdowns wrapped by a label.
 */
function createFolderMenu( parents, system, old, required, onlyWithGames, onlyWithRealGames, helperElement, onlyWithLeafNodes, isForPlaylist, playlistId, displaySaveOld ) {
    // We will have a dropdown for each possible folder
    var count = 0;
    var currentParents = [];
    parents = parents.slice(0);
    parents.push(null); // this will be the value that can be selected as the next child
    var dropdownContainer = document.createElement("span");
    var playlistId;
    if( !isForPlaylist ) {
        dropdownContainer.setAttribute("id", (old ? "old-" : "") + "folder-select-container");
    }
    else {
        if(playlistId == undefined) playlistId = document.querySelectorAll(".modal .playlist-select-container").length;
        dropdownContainer.classList.add("playlist-select-container");
        dropdownContainer.setAttribute("id", "playlist-select-container-" + playlistId);
    }
    for( var parent of parents ) {
        if( parent !== "" ) {
            var isFolder = getGamesInFolder(currentParents, system) ? true : false;

            // If the selected item is a folder, we will have options, but otherwise we will not
            var options = [];
            if( isFolder ) {

                // we can have a folder menu that actually allows leaf nodes to be selected which is what we are doing
                // getGamesInFolder importantly filters out any non-folders like ""
                if( !isForPlaylist ) {
                    // folders only
                    options = Object.keys(filterGameTypes(getGamesInFolder(currentParents, system), true));
                }
                else {
                    options = Object.keys(removePlaylists(getGamesInFolder(currentParents, system)));
                }

                // current selected should always take into account if one or both of these parameters exist
                if( options && onlyWithGames ) {
                    options = options.filter( function(option) {
                        var currentParentsCopy = currentParents.slice(0);
                        currentParentsCopy.push(option);
                        var currentOptionIsFolder = getGamesInFolder(currentParentsCopy, system) ? true : false;
                        if( currentOptionIsFolder )
                            return Object.keys(getGamesInFolder(currentParentsCopy, system)).length > 0;
                        return true; // allow games - they'll be filtered out later
                    } );
                }
                if( options && onlyWithRealGames ) {
                    options = options.filter( function(option) {
                        var currentParentsCopy = currentParents.slice(0);
                        currentParentsCopy.push(option);
                        var currentOptionIsFolder = getGamesInFolder(currentParentsCopy, system) ? true : false;
                        if( currentOptionIsFolder )
                            return folderContainsRealGames(getGamesInFolder(currentParentsCopy, system));
                        return true; // allow games - they'll be filtered out later
                    } );
                }

                if( !helperElement ) helperElement = document.querySelector(".modal");
                // Don't allow a folder to be put inside itself basically
                // if there is an old menu and the current item is a folder
                // make sure we don't allow that folder to become the selected folder in the new menu - i.e. exclude it as an item
                if( !isForPlaylist && !old && helperElement && helperElement.querySelector("#old-game-select") && helperElement.querySelector("#old-folder-select-container") ) {
                    var oldSystem = helperElement.querySelector("#old-system-select");
                    var newSystem = helperElement.querySelector("#system-select");
                    oldSystem = oldSystem.options[oldSystem.selectedIndex].value;
                    newSystem = newSystem.options[newSystem.selectedIndex].value;

                    if( oldSystem == newSystem ) {
                        var oldParents = extractParentsFromFolderMenu(true, helperElement);
                        var oldGameSelect = helperElement.querySelector("#old-game-select");
                        oldParents.push( oldGameSelect.options[oldGameSelect.selectedIndex].value );
                        options = options.filter( function(option) {
                            var currentParentsCopy = currentParents.slice(0);
                            currentParentsCopy.push(option);
                            return JSON.stringify(oldParents) != JSON.stringify(currentParentsCopy);
                        } );
                    }
                }

            }

            if( options.length ) { // there are no subfolders so no dropdown

                options.unshift("");
                var dropdownId;
                if( isForPlaylist ) {
                    dropdownId = "playlist-select-" + playlistId + "-" + count;
                }
                else {
                    dropdownId = (old ? "old-" : "") + "folder-select-" + count;
                }
                var dropdown = createMenu( parent, options, dropdownId, "Select Folder " + count, function() {
                    // get my index
                    // get all my parents including me
                    // redraw the dropdowns with the parents set as such
                    var myIndex = this.getAttribute("id");
                    var modal = document.querySelector(".modal");
                    var digitRegex = /-(\d+)$/;
                    var match = digitRegex.exec(myIndex);
                    myIndex = match[1];
                    var newParents = [];
                    for( var i=0; i<=myIndex; i++ ) {
                        var currentDropdownId = isForPlaylist ? "playlist-select-" + playlistId + "-" : (old ? "old-" : "") + "folder-select-";
                        var currentDropdown = modal.querySelector( "#" + currentDropdownId + i );
                        newParents.push( currentDropdown.options[currentDropdown.selectedIndex].value );
                    }

                    // for a playlist, add another playlist option when the last one gets a selected value
                    var allPlaylistSelects = document.querySelectorAll(".modal .playlist-select-container");
                    if( isForPlaylist ) { 
                        var lastPlaylistId = digitRegex.exec( allPlaylistSelects[allPlaylistSelects.length-1].getAttribute("id") )[1];
                        if( isForPlaylist && (myIndex > 0 || newParents[0] != "") && playlistId == lastPlaylistId ) {
                            document.querySelector(".modal #playlist-container").appendChild( createFolderMenu( [], "media", false, false, true, true, null, true, true, parseInt(lastPlaylistId) + 1 ) );
                        }
                    }

                    var newFolderMenu;
                    // for a playlist, first element set to null, remove 
                    if( isForPlaylist && newParents[0] == "" && allPlaylistSelects.length > 1 ) {
                        this.parentNode.parentNode.parentNode.parentNode.removeChild( this.parentNode.parentNode.parentNode );
                    }
                    else {
                        newFolderMenu = createFolderMenu( newParents, system, old, required, onlyWithGames, onlyWithRealGames, null, onlyWithLeafNodes, isForPlaylist, playlistId, displaySaveOld );
                        this.parentNode.parentNode.parentNode.replaceWith( newFolderMenu );
                    }
                    
                    // select folders further in if we have to due to leafnodes or real games only
                    if( !isForPlaylist && (onlyWithLeafNodes || onlyWithRealGames) ) {
                        newParents = newParents.filter( el => el != "" );
                        var testGameSelect = createGameMenu(null, system, false, false, newParents, onlyWithRealGames, onlyWithLeafNodes);
                        while( !testGameSelect.querySelector("select").options.length ) {
                            var folderSelects = newFolderMenu.querySelectorAll("select");
                            newParents.push(folderSelects[folderSelects.length-1].options[1].value);
                            var oldFolderMenu = newFolderMenu;
                            newFolderMenu = createFolderMenu( newParents, system, old, required, onlyWithGames, onlyWithRealGames, null, onlyWithLeafNodes, isForPlaylist, playlistId, displaySaveOld );
                            oldFolderMenu.replaceWith( newFolderMenu );
                            testGameSelect = createGameMenu(null, system, false, false, newParents, onlyWithRealGames, onlyWithLeafNodes);
                        }
                    }

                    if( !isForPlaylist ) {
                        // If there are any game menus below the folders, trigger them to change
                        var gameSelect = modal.querySelector("#" + (old ? "old-" : "") + "game-select");
                        if( gameSelect ) { // See important note : this means onlyWithGames should be true
                            var parentsForGameMenu = extractParentsFromFolderMenu(old);
                            // Get the game element that is selected - it must be available for this folder though
                            var selectedGameElement = document.querySelector('.system[data-system="'+system+'"] .game.selected[data-parents="'+parentsArrayToString(parentsForGameMenu)+'"]');

                            var selectedGame = null;
                            if( selectedGameElement ) {
                                selectedGame = decodeURIComponent(selectedGameElement.getAttribute("data-game"));
                            }
                            // If onlyWithRealGames or onlyWithLeafNodes is true, and the selected element doesn't mater that criteria, we would next
                            // look for any game in the folder. But that's the same as letting the select menu just not have a valid selected value by default.
                            
                            // See if we can get a selected game within the folder
                            var newGameSelect = createGameMenu(selectedGame, system, old, gameSelect.hasAttribute("required"), parentsForGameMenu, onlyWithRealGames, onlyWithLeafNodes, displaySaveOld);
                            gameSelect.parentNode.replaceWith( newGameSelect );
                            var newGameSelectMenu = newGameSelect.querySelector("select");
                            selectedGame = newGameSelectMenu.options[newGameSelectMenu.selectedIndex].value;

                            var saveSelect = modal.querySelector("#save-select");
                            if( saveSelect && !old ) {
                                var currentSave = null;
                                if( selectedGameElement ) {
                                    var currentSaveElement = selectedGameElement.querySelector(".current-save");
                                    if( currentSaveElement ) currentSave = currentSaveElement.innerText;
                                }
                                saveSelect.parentNode.replaceWith( createSaveMenu( currentSave, system, selectedGame, saveSelect.hasAttribute("required"), parentsForGameMenu, displaySaveOld ) );
                            }
                        }

                        ensureSystemMenuIsCorrectBasedOnIfOldGameIsPlaylist( modal, old );
                        // when we change an old menu - be it system, game or folder, we need to make sure that the new folder menu has all options available
                        // to do this, just regenerate the new folder menu
                        ensureNewFolderMenuHasCorrectOptions( modal, old );
                        ensureRomInputAndPlaylistSelectIsDisplayedOrHidden( modal, old );
                    }
                }, required );
                currentParents.push(parent);
                count++;
                dropdownContainer.appendChild(dropdown);
            }
        }
    }
    return addLabel(dropdownContainer, (old ? "Current " : "") + "Folder: ");
}

/**
 * Create an input element for a ROM file.
 * @param {boolean} [required] - If the field is required.
 * @returns {HTMLElement} An input element wrapped by a label.
 */
function createRomFileInput(required) {
    return createInput( null, "rom-file-input", "Rom File: ", "file", required );
}

/**
 * Create an input element for a save file.
 * @param {string} [defaultValue] - The default value of the element.
 * @param {boolean} [required] - If the field is required.
 * @returns {HTMLElement} An input element wrapped by a label.
 */
function createSaveInput( defaultValue, required ) {
    return createInput( defaultValue, "save-input", "Save: ", null, required );
}

/**
 * Create a select element containing saves.
 * @param {string} [selected] - The save selected by default.
 * @param {string} system - The system the saves are for.
 * @param {string} game - The game the saves are for.
 * @param {boolean} [required] - If the field is required.
 * @param {Array<string>} parents - The games the saves are for.
 * @param {boolean} [displaySaveOld] - Alter the label for the save to say current.
 * @returns {HTMLElement} - A select element containing the necessary keys wrapped by a label.
 */
function createSaveMenu( selected, system, game, required, parents, displaySaveOld ) {
    return createMenu( selected, Object.keys(getGamesInFolder( parents, system )[game].saves), "save-select", (displaySaveOld ? "Current " : "") + "Save: ", null, required );
}

/**
 * Create a select element containing type.
 * @param {string} [selected] - The type selected by default (will be playlist if not specified).
 * @param {Array<string>} options - A list of options for the select (should contain one or more of "Game", "Folder", and "Playlist")
 * @param {boolean} [required] - If the field is required.
 */
function createTypeMenu( selected, options, required ) {
    return createMenu( selected, options, "type-select", "Type: ", function() {
        if( this.options[this.selectedIndex].value == "Game" ) {
            document.querySelector(".modal #playlist-container").parentNode.classList.add("hidden");
            document.querySelector(".modal #rom-file-input").parentNode.classList.remove("hidden");
            document.querySelector(".modal #rom-download-input").parentNode.classList.remove("hidden");
        }
        else if ( this.options[this.selectedIndex].value == "Folder" ) {
            document.querySelector(".modal #rom-file-input").parentNode.classList.add("hidden");
            document.querySelector(".modal #rom-download-input").parentNode.classList.add("hidden");
            document.querySelector(".modal #playlist-container").parentNode.classList.add("hidden");
        }
        else { // Playlist
            document.querySelector(".modal #rom-file-input").parentNode.classList.add("hidden");
            document.querySelector(".modal #rom-download-input").parentNode.classList.add("hidden");
            document.querySelector(".modal #playlist-container").parentNode.classList.remove("hidden");
        }
    }, required );
}

/**
 * Add a label to an element.
 * @param {HTMLElement} element - The element to attach a label to.
 * @param {string} text - The label text.
 * @returns {HTMLElement} A label element wrapping the input element.
 */
function addLabel( element, text ) {
    var label = document.createElement("label");
    var id = element.getAttribute("id");
    label.setAttribute("for", id);
    var labelText = document.createElement("span");
    labelText.innerText = text;
    label.appendChild(labelText);
    label.appendChild(element);
    return label;
}

/**
 * Create an input element.
 * @param {string} [defaultValue] - The default value of the element.
 * @param {string} [id] - The id of the element.
 * @param {string} [label] - The label text for the element.
 * @param {string} type - The type attribute of the element.
 * @param {boolean} required - If the field is required.
 * @returns {HTMLElement} An input element wrapped by a label.
 */
function createInput( defaultValue, id, label, type, required ) {
    var input = document.createElement("input");
    input.type = type ? type : "text";
    if( defaultValue ) {
        if( type == "checkbox" || type == "radio" ) {
            if( defaultValue ) input.setAttribute("checked", "true");
        }
        else input.value = defaultValue;
    }
    if(id) input.setAttribute("id", id);
    if( required ) {
        input.setAttribute("required", "required");
    }
    return addLabel( input, label );
}

/**
 * Create a select element. 
 * @param {string} [selected] - Which element should be selected by default.
 * @param {Array<string>} options - A list of options for the select.
 * @param {string} [id] - The id of the element.
 * @param {string} [label] - The label text of the menu.
 * @param {Function} [onchange] - The onchange function for the menu.
 * @param {boolean} [required] - If the field is required.
 * @returns {HTMLElement} - A select element wrapped by a label.
 */
function createMenu( selected, options, id, label, onchange, required ) {
    var select = document.createElement("select");
    if(id) select.setAttribute("id", id);
    if( onchange ) {
        select.onchange = onchange;
    }
    if( required ) {
        select.setAttribute("required", "required");
    }
    for(var i=0; i<options.length; i++) {
        var option = document.createElement("option");
        option.value = options[i];
        option.text = options[i];
        if(options[i] == selected) {
            option.selected = "selected";
        }
        select.appendChild(option);
    }
    return addLabel( select, label );
}

/**
 * Create a button element.
 * @param {string} label - The label text of the button 
 * @param {function} [onclick] - The callback function to run on click - it won't be available until all the required fields have a value
 * @param {Array<HTMLElement>} [requiredInputFields] - An array of input fields that are required to have values before this button can be used.
 * @returns {HTMLElement} A button element.
 */
function createButton( label, onclick, requiredInputFields ) {
    var button = document.createElement("button");
    button.innerHTML = label;
    
    if( requiredInputFields ) {
        button.classList.add("inactive");
        var listener = function() { 
            // select fields always have some value
            var allOk = true;
            for( var i=0; i<requiredInputFields.length; i++ ) {
                if( !requiredInputFields[i].value ) {
                    allOk = false;
                    break;
                }
            }
            if( allOk ) {
                button.classList.remove("inactive");
                button.onclick = onclick;
            }
            else {
                button.classList.add("inactive");
                button.onclick = null;
            }
        };
        for( var i=0; i<requiredInputFields.length; i++ ) {
            requiredInputFields[i].onchange = listener;
            requiredInputFields[i].oninput = listener;
        }
    }
    else {
        button.onclick = onclick;
    }

    return button;
}

/**
 * Create a warning.
 * @param {string} text - The text for the warning.
 * @returns {HTMLElement} A div element containing the warning.
 */
function createWarning( text ) {
    var warning = document.createElement("div");
    warning.innerText = text;
    warning.classList.add("warning");
    return warning;
}

/**
 * Create a form title.
 * @param {string} title - The title of the form.
 * @returns {HTMLElement} A h2 element containing the title.
 */
function createFormTitle( title ) {
    var element = document.createElement("h2");
    element.innerText = title;
    return element;
}

/**
 * Launch a modal.
 * @param {HTMLElement} element - The element within the modal.
 * @param {Function} [closeModalCallbackFunction] - A function to set the global closeModalCallback to after any current modal has closed.
 * @param {boolean} [force] - Allow launch during a request - should only happen from a server side request.
 */
function launchModal( element, closeModalCallbackFunction, force ) {
    if( !makingRequest || force ) {
        closeModal(force); // Close any current modal
        if( closeModalCallbackFunction ) {
            closeModalCallback = closeModalCallbackFunction;
        }
        var modal = document.createElement("div");
        modal.classList.add("modal");
        modal.appendChild(element);
        disableMenuControls = true;
        enableModalControls = true;
        document.body.appendChild(modal);
        // set timeout to force draw prior
        setTimeout( function() { 
            modal.classList.add("modal-shown");
            document.body.classList.add("modal-open");
        }, 0 );
        modal.onclick = function(e) { e.stopPropagation(); };
        document.body.onclick = closeModal;
    }
}

/**
 * Close the modal on the page.
 * @param {boolean} [force] - Allow close during a request - should only happen from a server side request.
 */
function closeModal(force) {
    if( !makingRequest || force ) {
        var modal = document.querySelector(".modal");
        if( modal ) {
            modal.classList.remove("modal"); // We need to do this as to not get it mixed up with another modal
            modal.classList.add("dying-modal"); // Dummy modal class for css
            modal.classList.remove("modal-shown");
            document.body.classList.remove("modal-open");
            // sometimes a modal callback will check for an active modal, so it is important this comes after
            // we remove the modal class and add dying-modal
            if( closeModalCallback ) {
                closeModalCallback();
                closeModalCallback = null;
            }
            // set timeout to force draw prior
            setTimeout( function() { 
                if( modal && modal.parentElement ) {
                    modal.parentElement.removeChild(modal);
                    if( !document.querySelector(".modal") ) {
                        disableMenuControls = false;
                        enableModalControls = false;
                    }
                }
            }, 500 ); // Make sure this matches the transition time in the css
            document.body.onclick = closeMenu;
        }
    }
}

/**
 * Alert that an error took place.
 * @param {string} message - The message to display.
 */
function alertError(message) {
    if( ! message ) message = "An error has ocurred.";
    createToast(message, "failure");
}

/**
 * Alert that a success took place.
 * @param {string} message - The message to display.
 */
function alertSuccess(message) {
    createToast(message, "success");
}

/**
 * Create a toast.
 * @param {string} message - The message to display in the toast.
 * @param {string} [type] - The type of toast (success or failure).
 * @param {boolean} [html] - True if the message is in HTML.
 */
function createToast(message, type, html) {
    var toast = document.createElement("div");
    toast.classList.add("toast");
    if( html ) toast.innerHTML = message;
    else toast.innerText = message;
    var appendElement = document.querySelector(".black-background");
    if( !appendElement && (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) ) appendElement = document.querySelector(".screencast-wrapper");
    if( !appendElement ) appendElement = document.body;
    appendElement.appendChild(toast);
    setTimeout( function() { // Timeout for opacity
        toast.classList.add("toast-shown");
        setTimeout( function() { // Timeout until hiding
            toast.classList.remove("toast-shown");
            setTimeout( function() { // Timeout until removing
                toast.parentElement.removeChild(toast);
            }, 500 ); // Make sure this matches the css
        }, 4000 )
    }, 0 ); // Set timeout to add the opacity transition
}

/**
 * Launch a game.
 * @param {string} system - The system to launch the game on.
 * @param {string} game - The game to launch.
 * @param {Array<string>} parents - The parents of the game to launch.
 */
function launchGame( system, game, parents ) {
    if( !makingRequest ) {
        startRequest(); // Most other functions do this prior since they need to do other things
        var doLaunch = function() {
            makeRequest( "POST", "/launch", { "system": system, "game": game, "parents": parents },
            function( responseText ) { standardSuccess(responseText, "Game launched", null, null, null, null, null, null, true) },
            function( responseText ) { standardFailure( responseText ) } );
        };
        // Don't set any controls if we are streaming from another device
        if( peerConnections.length && isServer ) doLaunch();
        else {
            autoloadEzProfile( doLaunch );
        }
    }
}

/**
 * Quit a game.
 * @param {boolean} [quitModalOnCallback] - True if the modal should be quit after a successful request (used by the browser modal).
 */
function quitGame(quitModalOnCallback) {
    if( !makingRequest ) {
        startRequest(); // Most other functions do this prior since they need to do other things
        makeRequest( "POST", "/quit", {},
        function( responseText ) { standardSuccess(responseText, "Game quit", null, null, null, null, null, null, quitModalOnCallback ? false : true) },
        function( responseText ) { standardFailure( responseText ) } );
    }
}

/**
 * Go home (suspend a game).
 */
function goHome() {
    if( !makingRequest ) {
        startRequest(); // Most other functions do this prior since they need to do other things
        makeRequest( "POST", "/home", {},
        function( responseText ) { 
            try {
                let message = JSON.parse(responseText);
                systemsDict = message.systems;
                if( fullscreenPip != message.fullscreenPip ) {
                    fullscreenPip = message.fullscreenPip;
                    toggleButtons();
                }
                if( message && message.didPause === false ) {
                    goToPlayingGame(); // this won't redraw if we are already on the item. But why would we need it to?
                }
            }
            catch(err) {}
            endRequest();
        },
        function( responseText ) { standardFailure( responseText ) } );
    }
}

/**
 * Add a game.
 * @param {string} system - The system the game is on.
 * @param {string} game - The name of the game.
 * @param {object|string} [file] - A file object or file url.
 * @param {Array<string>} parents - The parents of a game.
 * @param {boolean} [isFolder] - True if the "game" is a folder.
 * @param {boolean} [isPlaylist] - True if the "game" is a playlist.
 * @param {Array<Array<string>>} playlistItems - The items in the playlist.
 */
function addGame( system, game, file, parents, isFolder, isPlaylist, playlistItems ) {
    makeRequest( "POST", "/game", { "system": system, "game": game, "file": file ? file : "", "parents": JSON.stringify(parents), "isFolder": isFolder ? isFolder : "", "isPlaylist": isPlaylist ? isPlaylist : "", "playlistItems": JSON.stringify(playlistItems) }, 
    function( responseText ) { standardSuccess(responseText, "Game successfully added") },
    function( responseText ) { standardFailure( responseText ) }, true, true );
}

/**
 * Update a game.
 * @param {string} oldSystem - The current system.
 * @param {string} oldGame - The current game name.
 * @param {Array<string>} oldParents - The current parents of a game.
 * @param {string} [system] - The system the game is on.
 * @param {string} [game] - The name of the game.
 * @param {object} [file] - A file object.
 * @param {Array<string>} parents - The parents of a game.
 * @param {boolean} [isFolder] - True if the "game" is a folder.
 * @param {boolean} [isPlaylist] - True if the "game" is a playlist.
 * @param {Array<Array<string>>} playlistItems - The items in the playlist.
 */
function updateGame( oldSystem, oldGame, oldParents, system, game, file, parents, isFolder, isPlaylist, playlistItems ) {
    makeRequest( "PUT", "/game", { "oldSystem": oldSystem, "oldGame": oldGame, "oldParents": JSON.stringify(oldParents), "system": system, "game": game, "file": file ? file : "", "parents": JSON.stringify(parents), "isFolder": isFolder ? isFolder : "", "isPlaylist": isPlaylist ? isPlaylist : "", "playlistItems": JSON.stringify(playlistItems) }, 
    function( responseText ) { standardSuccess(responseText, "Game successfully updated", oldSystem, system ? system : oldSystem, oldGame, game ? game: oldGame, oldParents, parents) },
    function( responseText ) { standardFailure( responseText ) }, true, true );
}

/**
 * Delete a game.
 * @param {string} system - The system the game is on.
 * @param {string} game - The name of the game.
 * @param {Array<string>} parents - The parents of the game.
 */
function deleteGame( system, game, parents ) {
    makeRequest( "DELETE", "/game", { "system": system, "game": game, "parents": parents }, 
    function( responseText ) { standardSuccess(responseText, "Game successfully deleted", system, null, game, null, parents, null) },
    function( responseText ) { standardFailure( responseText ) }, false, true );
}

/**
 * Add a save.
 * @param {string} system - The system the game is on.
 * @param {string} game - The name of the game.
 * @param {string} save - The name of the save to add.
 * @param {Array<string>} parents - The parents of a game.
 */
function addSave( system, game, save, parents ) {
    makeRequest( "POST", "/save", { "system": system, "game": game, "save": save, "parents": parents }, 
    function( responseText ) { standardSuccess(responseText, "Save successfully added") },
    function( responseText ) { standardFailure( responseText ) }, false, true );
}

/**
 * Update a save.
 * @param {string} system - The system the game is on.
 * @param {string} game - The name of the game.
 * @param {Array<string>} parents - The parents of a game.
 * @param {string} oldSave - The old name of the save.
 * @param {string} save - The new name of the save.
 */
function updateSave( system, game, parents, oldSave, save ) {
    makeRequest( "PUT", "/save", { "system": system, "game": game, "save": save, "parents": parents, "oldSave": oldSave }, 
    function( responseText ) { standardSuccess(responseText, "Save successfully updated") },
    function( responseText ) { standardFailure( responseText ) }, false, true );
}

/**
 * Change the current save.
 * @param {string} system - The system the game is on.
 * @param {string} game - The name of the game.
 * @param {string} save - The name of the save to switch to.
 * @param {Array<string>} parents - The parents of a game.
 */
function changeSave( system, game, save, parents ) {
    makeRequest( "PATCH", "/save", { "system": system, "game": game, "save": save, "parents": parents }, 
    function( responseText ) { standardSuccess(responseText, "Save successfully changed") },
    function( responseText ) { standardFailure( responseText ) }, false, true );
}

/**
 * Delete a save.
 * @param {string} system - The system the game is on.
 * @param {string} game - The name of the game.
 * @param {string} save - The name of the save to delete.
 * @param {Array<string>} parents - The parents of a game.
 */
function deleteSave( system, game, save, parents ) {
    makeRequest( "DELETE", "/save", { "system": system, "game": game, "save": save, "parents": parents }, 
    function( responseText ) { standardSuccess(responseText, "Save successfully deleted") },
    function( responseText ) { standardFailure( responseText ) }, false, true );
}

/**
 * Standard success function for a request.
 * @param {string} responseText - the response from the server - should include the systemsDict from the server.
 * @param {string} [message] - the message to display.
 * @param {string} [oldSystemName] - the old name of the system if it changed.
 * @param {string} [newSystemName] - the new name of the system if it changed (null if it was deleted).
 * @param {string} [oldGameName] - the old name of the game if it changed.
 * @param {string} [newGameName] - the new name of the game if it changed (null if it was deleted).
 * @param {Array} [oldParents] - the old parents if it changed.
 * @param {Array} [newParents] - the new parents if it changed.
 * @param {boolean} [preventModalClose] - true if the modal should not close.
 */
function standardSuccess( responseText, message, oldSystemName, newSystemName, oldGameName, newGameName, oldParents, newParents, preventModalClose ) {
    var response = JSON.parse(responseText);
    systemsDict = response.systems;
    fullscreenPip = response.fullscreenPip;
    redraw(oldSystemName, newSystemName, oldGameName, newGameName, oldParents, newParents);
    if(message) alertSuccess(message);
    endRequest();
    if( !preventModalClose) closeModal();
}

/**
 * Standard failure function for a request.
 * @param {string} responseText - The response from the server.
 * @param {boolean} async - True if we don't have to update makingRequest.
 */
function standardFailure( responseText, async ) {
    // No redraw since still in modal
    var message = "";
    try {
        message = JSON.parse(responseText).message;
    }
    catch(err) {}
    alertError(message); 
    if( !async ) endRequest();
}

/**
 * Start making a request.
 */
function startRequest() {
    makingRequest = true;
    addMarquee(document.querySelector("h1"),document.querySelector("body"), true);
    var modal = document.querySelector(".modal");
    if( modal ) {
        var buttons = modal.querySelectorAll("button");
        for(var i=0; i<buttons.length; i++) {
            buttons[i].classList.add("inactive");
        }
    }
}

/**
 * End making a request.
 */
function endRequest() {
    makingRequest = false;
    removeMarquee(true);
    var modal = document.querySelector(".modal");
    if( modal ) {
        var buttons = modal.querySelectorAll("button");
        for(var i=0; i<buttons.length; i++) {
            buttons[i].classList.remove("inactive");
        }
    }
}

/**
 * Make a request.
 * @param {string} type - "GET" or "POST".
 * @param {string} url - The url to make the request to.
 * @param {object} parameters - An object with keys being parameter keys and values being parameter values to send with the request.
 * @param {function} callback - Callback function to run upon request completion.
 * @param {function} errorCallback - Error callback function to run upon request failure.
 * @param {boolean} useFormData - True if we should use form data instead of json.
 * @param {boolean} sambaMode - True if we should make the request to the GuyStation that this GuyStation has mounted the system directoy of (can't update symlinks on a samba mount).
 * @param {boolean} noWebsockets - True if we should not allow websockets to be used.
 */
function makeRequest(type, url, parameters, callback, errorCallback, useFormData, sambaMode, noWebsockets) {
    var parameterKeys = Object.keys(parameters);

    if( type == "GET" && parameterKeys.length ) {
        var parameterArray = [];
        for( var i=0; i<parameterKeys.length; i++ ) {
            parameterArray.push( parameterKeys[i] + "=" + parameters[parameterKeys[i]] );
        }
        url = url + "?" + parameterArray.join("&");
    }

    if( socket && type == "GET" && !sambaMode && !noWebsockets ) {
        socket.emit( "request", { url: url, method: type, headers: [] }, function(responseText) {
            try {
                var status = JSON.parse(responseText).status;
                if( status == "success" ) {
                    if(callback) callback(responseText);
                }
                else {
                    if( errorCallback ) errorCallback(responseText);
                }
            }
            catch(err) {
                if( errorCallback ) errorCallback(responseText);
            }
        } );
        return;
    }

    var hostname = (sambaMode && sambaUrl) ? sambaUrl : window.location.hostname;
    url = "http://" + hostname + ":8080" + url;
   
    var xhttp = new XMLHttpRequest();
    xhttp.open(type, url, true);

    if( type != "GET" && parameterKeys.length ) {
        if( !useFormData ) {
            xhttp.setRequestHeader("Content-type", "application/json");
        }
    } 

    xhttp.onreadystatechange = function() {
        if( this.readyState == 4 ) {
            if( this.status == 200 ) {
                if( callback ) { callback(this.responseText); }
            }
            else {
                if( errorCallback ) { errorCallback(this.responseText); }
            }
        }
    }    
    if( type != "GET" && Object.keys(parameters).length ) {
        var sendParameters;
        if( useFormData ) {
            sendParameters = new FormData();
            for ( var key in parameters ) {
                sendParameters.append(key, parameters[key]);
            }
        }
        else {
            sendParameters = JSON.stringify(parameters);
        }
        xhttp.upload.onprogress = function(event) {
            var button = document.querySelector(".modal button");
            if( button ) {
                var percent = event.loaded/event.total * 100;
                button.style.opacity = 1;
                button.style.background = "linear-gradient(90deg, white "+percent+"%, rgba(255,255,255,0.5) "+percent+"%)";
            }
        };
        xhttp.send( sendParameters );
    }
    else {
        xhttp.send();
    }
}

/**
 * Send screencast buttons to a server from a client gamepad (not the virtual gamepad).
 * This function translates the client gamepad button with the button mapping.
 * @param {string} clientButton - Either the button number or the axis number and a direction.
 * @param {boolean} [down] - Optional parameter to force a direction (used for axis whose states aren't tracked in screencastButtonsPressed)
 */
function sendButtonsToServer( clientButton, down ) {
    // we send the codes that correspond with the buttons numbers. So padcodes have A as button 0, so when
    // the client controller presses button 0, we send A, which means button 0 on the server unless a mapping specifies otherwise
    // i is the client controller button
    var scMapKeys = Object.keys(screencastControllerMap);
    var serverButtonsForClientButton = scMapKeys.filter( el => screencastControllerMap[el] == clientButton );
    if( !screencastControllerMap[clientButton] && !clientButton.toString().match(/\+|\-/) && ( ( clientButton.toString().match(/^a/) && parseInt(clientButton.replace("a","")) < Object.keys(AXISCODES).length ) || ( !clientButton.toString().match(/^a/) && parseInt(clientButton) < Object.keys(PADCODES).length ) ) ) serverButtonsForClientButton.push( clientButton ); // if nothing is mapped for this button on the server, send this button. this means 2 == 2 as we intentionally left that blank - sent so long as it is not an axis to a button.
    // also make sure it is a valid server button range
    try {
        if( !clientButton.toString().match(/^a/) ) {
            for( var k=0; k<serverButtonsForClientButton.length; k++ ) {
                // note whether the client axis or button, it is mapped to a server button, and thus serverButtonsForClientButton[k] will always be a number indicating the button number on the server
                var buttonCode = Object.values(PADCODES)[serverButtonsForClientButton[k]];
                socket.emit("/screencast/gamepad", { "event": { "type": 0x01, "code": buttonCode, "value": down !== undefined ? down : screencastButtonsPressed[clientButton] }, "id": socket.id } );
            }
        }
        // this is a full axis being sent on the client (not just an axis direction) - it must be mapped to a server axis
        // we don't allow client buttons to be mapped to a server axis.
        else {
            for( var k=0; k<serverButtonsForClientButton.length; k++ ) {
                var index = parseInt( serverButtonsForClientButton[k].replace("a","") );
                var axisCode = Object.values(AXISCODES)[index];
                socket.emit("/screencast/gamepad", { "event": { "type": 0x03, "code": axisCode, "value": screencastAxisLastValues[ parseInt(clientButton.replace("a","")) ] }, "id": socket.id } );
            }
        }
    }
    catch(err) {
         /* this is ok, we might have tried to send an axis or button that does not exist on the server (when we forward exactly the button number or axis when there is no map) */ 
    }
}

/**
 * Poll for gamepads. 
 * Used for Chrome support
 * See here: https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
 */
function pollGamepads() {
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    for (var i = 0; i < gamepads.length; i++) {
        var gp = gamepads[i];
        if (gp) {
            manageGamepadInput();
            clearInterval(gamePadInterval);
        }
    }
}

/**
 * Manage gamepad input.
 */
function manageGamepadInput() {

    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    if(!gamepads || !gamepads[0]) {
        gamePadInterval = setInterval(pollGamepads, GAMEPAD_INTERVAL);
        return;
    }
    
    try {
        for (var i=0; i<gamepads.length; i++) {
            var gp = gamepads[i];
            if( !gp ) continue;

            // initialize buttons up
            if( !buttonsUp.gamepad[i] ) {
                buttonsUp.gamepad[i] = {};
                buttonsUp.gamepad[i][joyMapping["A"]] = true;
                buttonsUp.gamepad[i][joyMapping["Start"]] = true;
                buttonsUp.gamepad[i][joyMapping["Select"]] = true;
                buttonsUp.gamepad[i][joyMapping["Right Trigger"]] = true;
                buttonsUp.gamepad[i][joyMapping["Left Trigger"]] = true;
            }

            if( !disableMenuControls && document.hasFocus() && gp && gp.buttons ) {

                // See this helpful image for mappings: https://www.html5rocks.com/en/tutorials/doodles/gamepad/gamepad_diagram.png
                
                var aPressed = buttonPressed(gp.buttons[joyMapping["A"]]);
                var startPressed = buttonPressed(gp.buttons[joyMapping["Start"]]);
                // A or Start - launch a game (no need to quit a game, since they should have escape mapped to a key so they can go back to the menu)
                if( (aPressed && buttonsUp.gamepad[i][joyMapping["A"]]) 
                    || (startPressed && buttonsUp.gamepad[i][joyMapping["Start"]]) ) {
                    
                    if( aPressed ) buttonsUp.gamepad[i][joyMapping["A"]] = false;
                    if( startPressed ) buttonsUp.gamepad[i][joyMapping["Start"]] = false;
                    
                    document.querySelector("#launch-game").click();

                    if( !isServer && !startDown[i] ) {
                        startDown[i] = setTimeout(function() {
                            if( !document.querySelector("#remote-screencast-form") ) displayScreencast(true);
                        }, SCREENCAST_TIME);
                    }
                    break;
                }
                else {
                    if(!aPressed) buttonsUp.gamepad[i][joyMapping["A"]] = true;
                    if(!startPressed) buttonsUp.gamepad[i][joyMapping["Start"]] = true;

                    clearTimeout(startDown[i]);
                    startDown[i] = null;
                }
            
                var rightTriggerPressed = buttonPressed(gp.buttons[joyMapping["Right Trigger"]]);
                // Right shoulder or trigger - cycle saves - only if there is a game in front of the user
                if( rightTriggerPressed && buttonsUp.gamepad[i][joyMapping["Right Trigger"]] && document.querySelector(".system.selected .game.selected") ) {
                    buttonsUp.gamepad[i][joyMapping["Right Trigger"]] = false;
                    cycleSave(1);
                    menuChangeDelay("right-trigger");
                }
                else {
                    if( menuDirection == "right-trigger" ) menuDirection = null;
                    buttonsUp.gamepad[i][joyMapping["Right Trigger"]] = true;
                }

                var leftTriggerPressed = buttonPressed(gp.buttons[joyMapping["Left Trigger"]]);
                // Left shoulder or trigger - cycle saves
                if( leftTriggerPressed && buttonsUp.gamepad[i][joyMapping["Left Trigger"]] && document.querySelector(".system.selected .game.selected") ) {
                    buttonsUp.gamepad[i][joyMapping["Left Trigger"]] = false;
                    cycleSave(-1);
                    menuChangeDelay("left-trigger");
                }
                else {
                    if( menuDirection == "left-trigger" ) menuDirection = null;
                    buttonsUp.gamepad[i][joyMapping["Left Trigger"]] = true;
                }

                var leftStickXPosition = gp.axes[0];
                var leftStickYPosition = gp.axes[1];
                // Right
                if( leftStickXPosition > 0.5 || buttonPressed(gp.buttons[joyMapping["D-pad Right"]]) ) {
                    moveMenu( -1 );
                    menuChangeDelay("right-stick");
                }
                // Left
                else if( leftStickXPosition < -0.5 || buttonPressed(gp.buttons[joyMapping["D-pad Left"]]) ) {
                    moveMenu( 1 );
                    menuChangeDelay("left-stick");
                }
                // Up
                else if( leftStickYPosition < -0.5 || buttonPressed(gp.buttons[joyMapping["D-pad Up"]]) ) {
                    moveSubMenu( -1 );
                    menuChangeDelay("up-stick");
                }
                // Down
                else if( leftStickYPosition > 0.5 || buttonPressed(gp.buttons[joyMapping["D-pad Down"]]) ) {
                    moveSubMenu( 1 );
                    menuChangeDelay("down-stick");
                }
                // no buttons are pressed
                else if( menuDirection && menuDirection.match(/-stick$/) ) {
                    menuDirection = null;
                }
            }
            // Check if we are setting a key, and register the current gamepad key down
            else if( document.hasFocus() && document.querySelector("#joypad-config-form") ) {
                var inputs = document.querySelectorAll("#joypad-config-form input:not(#ez-profile-input):not([type='checkbox'])");
                // Check if an input is focused
                if( !focusInterval ) {
                    for( var j=0; j<inputs.length; j++ ) {
                        if( inputs[j] === document.activeElement ) {
                            var isEz = inputs[j].getAttribute("type") == "search";
                            var isVirtualConfig = inputs[j].parentElement.getAttribute("data-virtual-button") ? true : false;

                            // If so, check if any buttons are pressed
                            for( var k=0; k<gp.buttons.length; k++ ) {
                                // If so, set the input's value to be that of the pressed button
                                if(buttonPressed(gp.buttons[k])) {

                                    // we have a special syntax for ez buttons
                                    if( isEz )
                                        appendEzInput(inputs[j], k, "button", gp.id);
                                    else
                                        inputs[j].value = k;

                                    focusNextInput(inputs[j + 1]);
                                    break;
                                }
                            }

                            if( isEz || isVirtualConfig ) {
                                for( var k=0; k<gp.axes.length; k++ ) {                                    
                                    var value = gp.axes[k];

                                    // trigger buttons
                                    // according to the spec, they should not be giving -1 as a value...
                                    // if( gp.axes.length == 6 ) {
                                    //     if( k == 2 || k == 5 ) value = (value + 1)/2;
                                    // }

                                    // we have to have enough change set set this value
                                    if( Math.abs(value) >= AXIS_MIN_TO_BE_BUTTON ) {
                                        var direction = value < 0 ? "-" : "+";
                                        if( isEz ) {
                                            appendEzInput(inputs[j], k + direction, "axis", gp.id);
                                        }
                                        else {
                                            if( inputs[j].parentElement.getAttribute("data-virtual-button").match(/^a/) ) {
                                                inputs[j].value = "a" + k;
                                            }
                                            else inputs[j].value = k + direction;
                                        }

                                        focusNextInput(inputs[j + 1]);
                                        break;
                                    }
                                }
                            }

                            break;
                        }
                    }
                }
            }
            // Check if we are on a screencast - forward buttons
            else if( document.hasFocus() && document.querySelector(".screencast-wrapper") ) {
                for( var j=0; j<gp.buttons.length; j++ ) {
                    if( ( !screencastButtonsPressed[j] && buttonPressed(gp.buttons[j]) ) || ( screencastButtonsPressed[j] && !buttonPressed(gp.buttons[j]) ) ) {
                        if( !screencastButtonsPressed[j] ) {
                            screencastButtonsPressed[j] = true;
                        }
                        else {
                            screencastButtonsPressed[j] = false;
                        }
                        sendButtonsToServer( j );
                    }
                }

                for( var j=0; j<gp.axes.length; j++ ) {

                    // the axis is mapped to a button
                    var direction = gp.axes[j] >= 0 ? "+" : "-";
                    var previousDirection = screencastAxisLastValues[j] >= 0 ? "+" : "-";
                    if( Math.abs(gp.axes[j]) >= AXIS_MIN_TO_BE_BUTTON && ( Math.abs(screencastAxisLastValues[j]/MAX_JOYSTICK_VALUE) < AXIS_MIN_TO_BE_BUTTON || previousDirection != direction ) ) {
                        sendButtonsToServer( j + direction, true );
                        // in case we rapidly switched directions and it didn't get cleared out
                        sendButtonsToServer( j + (direction == "+" ? "-" : "+"), false );
                    }
                    else if( Math.abs(gp.axes[j]) < AXIS_MIN_TO_BE_BUTTON && Math.abs(screencastAxisLastValues[j]/MAX_JOYSTICK_VALUE) >= AXIS_MIN_TO_BE_BUTTON ) {
                        sendButtonsToServer( j + "+", false );
                        sendButtonsToServer( j + "-", false );
                    }

                    var serverAxisValue = Math.round(gp.axes[j] * MAX_JOYSTICK_VALUE);
                    // if within 1, its ok, unless it is 0
                    if( !screencastAxisLastValues[j] || Math.abs(serverAxisValue - screencastAxisLastValues[j]) > SCREENCAST_AXIS_FUZZINESS || (serverAxisValue == 0 && screencastAxisLastValues[j] != 0) ) {
                        screencastAxisLastValues[j] = serverAxisValue;

                        sendButtonsToServer( "a" + j ); // the client button is "a" + j, could be multiple server buttons
                    }
                }

            }
            // Check if we are controlling media
            else if( document.hasFocus() && document.querySelector(".modal #remote-media-form") ) {
                var aPressed = buttonPressed(gp.buttons[joyMapping["A"]]);
                var startPressed = buttonPressed(gp.buttons[joyMapping["Start"]]);
                // A or Start - will pause/play
                if( (aPressed && buttonsUp.gamepad[i][joyMapping["A"]]) 
                    || (startPressed && buttonsUp.gamepad[i][joyMapping["Start"]]) ) {
                    
                    if( aPressed ) buttonsUp.gamepad[i][joyMapping["A"]] = false;
                    if( startPressed ) buttonsUp.gamepad[i][joyMapping["Start"]] = false;
                    
                    var video = document.querySelector(".modal #remote-media-form video");
                    if( video.paused ) {
                        video.play();
                    }
                    else {
                        video.pause();
                    }
                }
                else {
                    if(!aPressed) buttonsUp.gamepad[i][joyMapping["A"]] = true;
                    if(!startPressed) buttonsUp.gamepad[i][joyMapping["Start"]] = true;
                }

                // Select will go full screen
                var selectPressed = buttonPressed(gp.buttons[joyMapping["Select"]]);
                if( selectPressed && buttonsUp.gamepad[i][joyMapping["Select"]] ) {
                    buttonsUp.gamepad[i][joyMapping["Select"]] = false;

                    if(document.fullscreenElement && document.fullscreenElement == document.querySelector(".modal #remote-media-form video")) {
                        document.exitFullscreen();
                    }
                    else {
                        fullscreenVideo( document.querySelector(".modal #remote-media-form video") );
                    }
                }
                else if(!selectPressed) {
                    buttonsUp.gamepad[i][joyMapping["Select"]] = true;
                }

                // Right trigger will got to next
                var rightTriggerPressed = buttonPressed(gp.buttons[joyMapping["Right Trigger"]]);
                if( rightTriggerPressed && buttonsUp.gamepad[i][joyMapping["Right Trigger"]] ) {
                    buttonsUp.gamepad[i][joyMapping["Right Trigger"]] = false;

                    playNextMedia(1);
                }
                else if(!rightTriggerPressed) {
                    buttonsUp.gamepad[i][joyMapping["Right Trigger"]] = true;
                }

                // Left trigger will go to previous
                var leftTriggerPressed = buttonPressed(gp.buttons[joyMapping["Left Trigger"]]);
                if( leftTriggerPressed && buttonsUp.gamepad[i][joyMapping["Left Trigger"]] ) {
                    buttonsUp.gamepad[i][joyMapping["Left Trigger"]] = false;

                    previousMedia();
                }
                else if(!leftTriggerPressed) {
                    buttonsUp.gamepad[i][joyMapping["Left Trigger"]] = true;
                }
            }
        }
    }
    catch( err ) {
        console.log(err);
        gamePadInterval = setInterval(pollGamepads, GAMEPAD_INTERVAL);
        return;
    }
    setTimeout(manageGamepadInput, GAMEPAD_INPUT_INTERVAL);
}

/**
 * Focus on the next input.
 * @param {HTMLElement} nextInput - The next input to focus on.
 */
function focusNextInput( nextInput ) {
    if( nextInput ) {
        if( focusInterval ) {
            clearTimeout(focusInterval);
            focusInterval = null;
        }
        focusInterval = setTimeout( function() { nextInput.focus(); focusInterval=null; }, FOCUS_NEXT_INTERVAL );
    } 
}

/**
 * Delay the ability to change position in the menu.
 * @param {string} direction - the direction we just moved the menu
 */
function menuChangeDelay(direction) {
    if( menuDirection == direction ) {
        if( menuMoveSpeedMultiplier > 0.3 ) {
            menuMoveSpeedMultiplier = menuMoveSpeedMultiplier / 1.075;
        }
    }
    else {
        menuMoveSpeedMultiplier = 1;
    }
    menuDirection = direction;
    disableMenuControls = true;
    setTimeout( function() { disableMenuControls = false; }, BLOCK_MENU_MOVE_INTERVAL*menuMoveSpeedMultiplier );
}

/**
 * Determine if a button is pressed.
 * @param {*} b - An object to test.
 */
function buttonPressed(b) {
    if (typeof(b) == "object") {
        return b.pressed;
    }
    return b == 1.0;
}

// Handles mobile input
// Taken from here: https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android

document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);
document.addEventListener('touchend', handleTouchEnd, false);

var xDown = null;                                                        
var yDown = null;
var xUp = null;
var yUp = null;

/**
 * Get the touches that occurred.
 * @param {Event} evt - The touch event.
 * @returns {Array} The touches from the event.
 */
function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery
}                                                     

/**
 * Handle the touch start event.
 * @param {Event} evt - the touch event.
 */
function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};                                                

var r=0;

/**
 * Handle the touch move event.
 * @param {Event} evt - The touch event.
 */
function handleTouchMove(evt) {
    if ( ! xDown || ! yDown || disableMenuControls ) {
        return;
    }

    xUp = evt.touches[0].clientX;                                    
    yUp = evt.touches[0].clientY;          
};

/**
 * Handle the touch end event (moves the menu/submenus).
 */
function handleTouchEnd() {
    if ( ! xDown || ! yDown || !xUp || !xDown || disableMenuControls ) {
        return;
    }

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if( Math.abs(xDiff) > 50 || Math.abs(yDiff) > 50 ) {
        if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
            if ( xDiff > 0 ) {
                moveMenu(-1);
            } else {
                moveMenu(1);
            }                       
        } else {
            if ( yDiff > 0 ) {
                moveSubMenu(1);
            } else { 
                moveSubMenu(-1);
            }                                                                 
        }
    }

    /* reset values */
    xDown = null;
    yDown = null;   
    xUp = null;
    yUp = null;
}

window.addEventListener("wheel", event => scrollWheel(event), { passive: false });

/**
 * Scroll the menus on scroll.
 * @param {Event} event - The scroll event.
 */
function scrollWheel( event ) {
    
    if( event.target.classList.contains("game-preview-summary") ) return;
    if( disableMenuControls ) return;

    clearTimeout(scrollAddTimeout);
    scrollAddTimeout = setTimeout( function() { scrollVerticalTotal = 0; scrollHorizontalTotal = 0; }, SCROLL_TIMEOUT_TIME );

    scrollVerticalTotal += event.deltaY;
    if( Math.abs(scrollVerticalTotal/SCROLL_NEEDED) >= 1 ) {
        moveSubMenu( Math.floor(scrollVerticalTotal/SCROLL_NEEDED) );
        scrollVerticalTotal = scrollVerticalTotal % SCROLL_NEEDED;
    }

    scrollHorizontalTotal += event.deltaX;
    if( Math.abs(scrollHorizontalTotal/SCROLL_NEEDED) >= 1 ) {
        moveMenu( -Math.floor(scrollHorizontalTotal/SCROLL_NEEDED) );
        scrollHorizontalTotal = scrollHorizontalTotal % SCROLL_NEEDED;
    }


    event.stopPropagation();
    event.preventDefault();
}


// Screencast section

// WebRTC protocol
// Offer - Answer (exchanging descriptions - includes information about each peer)
// Exchange ICE Candidates (ways to connect)
// Connection is made and remote streams handled with ontrack

var localStream = null;
var peerConnections = [];

/**
 * Get the displayMedia from the correct location.
 * Chrome versions 70-71 have getDisplayMedia under the navigator object rather than
 * navigator.mediaDevices.
 * In those versions, the "Experimental Web Platform features" flag needs to be enabled.
 */
function getDisplayMedia() {
    if( navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia ) {
        return navigator.mediaDevices.getDisplayMedia({"video": { "cursor": "never" }, "audio": false});
    }
    return navigator.getDisplayMedia({"video": true, "audio": false});
}

/**
 * Connect to the signal server.
 * @param {boolean} isStreamer - True if this is being called from the menuPage of guystation > we stream from guystation.
 */
function connectToSignalServer( isStreamer ) {

    var event = "connect-screencast-" + (isStreamer ? "streamer" : "client");
    socket.emit( event, true );
    socket.off()
    socket.on( 'sdp', handleRemoteSdp );
    socket.on( 'ice', handleRemoteIce );

    if( isStreamer ) {
        getDisplayMedia().then(getDisplayMediaSuccess).catch(errorHandler);
    }

}

/**
 * Set the value of the localStream variable once it is successfully fetched.
 * This should only ever be called from guystation, since we don't stream the page on the client.
 * @param {Object} stream - The screencast.
 */
function getDisplayMediaSuccess(stream) {
    navigator.mediaDevices.getUserMedia({"audio": true}).then( function(audio) {
        stream.getTracks()[0].contentHint = "motion"; // See here: https://webrtc.github.io/samples/src/content/capture/video-contenthint/
        var av = new MediaStream();
        av.addTrack(stream.getTracks()[0]);
        av.addTrack(audio.getTracks()[0]);
        localStream = av;
        socket.emit("streamer-media-ready");
    });
}

/**
 * Start a connection to the peer.
 * Peer connection should already be defined.
 * This should be initially called by the menuPage (using puppeteer evaluate) after it detects a client connect to it.
 * Once the server is connected to the client, the client will connect to the server automaitcally as seen in the handle functions
 * @param {boolean} [isStreamer] - True if this is the streamer, false if this is the client.
 * @param {string} [id] - The id of the peer (this is only relevant for the server).
 */
function startConnectionToPeer( isStreamer, id ) {
    if( !id ) id = "server";
    var peerConnection = new RTCPeerConnection(null);
    peerConnections.push( {"id": id, "peerConnection": peerConnection } );
    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onicecandidate
    // onicecandidate is not called when you do addIceCandidate. It is called whenever
    // it is deemed necessary that you send your ice candidates to the signal server
    // (usually after you have sent an offer or an answer).
    peerConnection.onicecandidate = function(event) {gotIceCandidate(id, event)};
    peerConnection.oniceconnectionstatechange = function() {handlePotentialDisconnect(id)};
    // Only the receiver will need to worry about what happens when it gets a remote stream
    if( !isStreamer ) {
        peerConnection.ontrack = gotRemoteStream;
    }
    // Only the streamer needs to add its own local sctream
    if( isStreamer ) {
        peerConnection.addStream(localStream);
        // the streamer will create an offer once it creates its peer connection
        peerConnection.createOffer({offerToReceiveVideo: true, offerToReceiveAudio: true}).then(function(data) {createdDescription(id, data)}).catch(errorHandler);
    }
}

/**
 * Set the scale down by factor.
 * @param {string} id - The id of the peer to scale.
 * @param {number} factor - The factor to scale down by.
 */
function setScaleDownBy( id, factor ) {
    clearTimeout( scaleDownByTimeouts[id] );
    var peerConnection = peerConnections.filter(el => el.id == id)[0];
    if( !peerConnection ) return; // there should always be a peer connection
    var sender = peerConnection.peerConnection.getSenders().filter( el => el.track.kind == "video" )[0];
    // we need all sendings to have their encodings set which can take a little time
    if( !sender.getParameters().encodings || !sender.getParameters().encodings.length ) {
        scaleDownByTimeouts[id] = setTimeout( function() { setScaleDownBy(id, factor) }, SCALE_DOWN_TIMEOUT );
        return;
    }

    var parameters = sender.getParameters();
    parameters.encodings[0].scaleResolutionDownBy = factor;
    sender.setParameters(parameters);
}

/** 
 * Renegotiate screenshare with the clients.
 * We actually don't need to do a true renegotiation since we can just change tracks.
 * This is only called on the server.
 */
function renegotiate() {
    var oldLocalStream = localStream;
    oldLocalStream.getVideoTracks().forEach(track => track.stop())
    getDisplayMedia().then(function(stream) {
        localStream = stream;
        for( let peerConnection of peerConnections ) {
            var newTrack = localStream.getVideoTracks()[0];
            var sender = peerConnection.peerConnection.getSenders().filter( el => el.track.kind == newTrack.kind )[0];
            sender.replaceTrack(newTrack);
        }
    }).catch(errorHandler);
}

/**
 * Handle a potential disconnect.
 * @param {string} [id] - The id of the peer that we lost connection to.
 */
function handlePotentialDisconnect( id ) {
    var peerConnection = peerConnections.filter(el => el.id==id)[0].peerConnection;
    if( peerConnection.iceConnectionState == "disconnected" ) {
        stopConnectionToPeer(false, id, isServer ? true : false); // note we pretend we are not the streamer even if we are here.
        // this will close the connection, but then it will call all the server functions we need to allow for
        // another connection to take place. Then, the server will try to stop the connection on the menuPage, but
        // it will not pass any of the checks, since peerConnection will already be null as will localStream
    }
}

/**
 * Stop the peer connection.
 * Since the connection will always be closed from the client, if this is the client
 * this will tell the server to stop too once it has closed.
 * @param {boolean} isStreamer - True if this is the streamer, or we want to pretend that we are
 * @param {string} id - The id of the peer to stop the connection to.
 * @param {boolean} [useIdAsSocketId] - send the id as the socket id - this is what the server will read as the id to stop the connection to. So when we are pretending to not be the server, we should set this to the peer id. When are the client, it should be our socket id.
 */
function stopConnectionToPeer( isStreamer, id, useIdAsSocketId ) {
    if( peerConnections.length ) {
        var peerConnection = peerConnections.filter(el => el.id==id)[0].peerConnection;
        peerConnection.close();
        if( scaleDownByTimeouts[peerConnection.id] ) clearTimeout(scaleDownByTimeouts[peerConnection.id]);
        peerConnections = peerConnections.filter(el => el.id != id);
    }
    if( !isStreamer ) {
        var stopLettingServerKnowWeExist = function() { clearInterval(resetCancelStreamingInterval); };
        // stop letting the server know we exist once it stops expecting us
        // this will only stop the server if this is the last connection
        makeRequest("GET", "/screencast/stop", {id: useIdAsSocketId ? id : socket.id}, stopLettingServerKnowWeExist, stopLettingServerKnowWeExist);

        // this should only be called on the client
        // if this is because the server disconnects, we'll close the modal here
        // if they have manually quit the modal, this check will fail and we will
        // not call it again
        if( document.querySelector(".modal #remote-screencast-form") ) {
            if( document.querySelector(".black-background #exit-button") ) {
                document.querySelector(".black-background #exit-button").click();
            }
            closeModalCallback = null; // we don't need to call stop connection again
            closeModal();
        }
    }
    // stop streaming if this was the last connection
    else if(localStream && !peerConnections.length) {
        localStream.getTracks().forEach( function(tr) {tr.stop();} ); // should be idempotent, tracks aren't started again, localStream is just overwritten
        localStream = null;
    }
}
 
/**
 * Handle an offer/answer in WebRTC protocol.
 * Note how this expects data modified by the server to have some identification metadata.
 * @param {Object} data - A peer ID and some sdp data.
 * @param {string} data.id - The peer id.
 * @param {Object} data.sdp - The data associated with the offer/answer.
 */
function handleRemoteSdp(data) {
    // this is to create the peer connection on the client (an offer has been received from guystation)
    if(!peerConnections.length) startConnectionToPeer(false);

    var peerConnection = peerConnections.filter( (el) => el.id == data.id )[0].peerConnection;

    // Set the information about the remote peer set in the offer/answer
    peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(function() {
        // If this was an offer sent from guystation, respond to the client
        if( data.sdp.type == "offer" ) {
            // Send an answer
            peerConnection.createAnswer().then(function(data) {createdDescription("server", data)}).catch(errorHandler);
        }
    });
}

/**
 * Handle receiving information about and ICE candidate in the WebRTC protocol.
 * Note: this can happen simulatneously with the offer/call although theoretically happens after.
 * Note how this expects data modified by the server to have some identification metadata.
 * @param {Object} data - A peer ID and some ice data.
 * @param {string} data.id - The peer id.
 * @param {Object} data.sdp - The data associated with the ice candidates.
 */
function handleRemoteIce(data) {
    // this is to create the peer connection on the client (an offer has been received from guystation)
    if(!peerConnections.length) startConnectionToPeer(false);

    var peerConnection = peerConnections.filter( (el) => el.id == data.id )[0].peerConnection;

    // Set the information about the remote peer set in the offer/answer
    peerConnection.addIceCandidate(new RTCIceCandidate(data.ice)).catch(errorHandler);
}

/**
 * Handle when we have successfully determined one of our OWN ice candidates.
 * @param {string} id - The id of the peer.
 * @param {Event} event - The event that triggers this handler.
 */
function gotIceCandidate(id, event) {
    if(event.candidate != null) {
        // alert the signal server about this ice candidate
        socket.emit("ice", {id: id, candidate: event.candidate});
    }
}

/**
 * Handle when the local description has been successfully determined.
 * @param {string} id - The id of the peer.
 * @param {Object} description - A generated local description necessary to include in an offer/answer.
 */
function createdDescription(id, description) {
    var peerConnection = peerConnections.filter(el => el.id==id)[0].peerConnection;
    peerConnection.setLocalDescription(description).then(function() {
        socket.emit("sdp", {id: id, description: peerConnection.localDescription});
    }).catch(errorHandler);
}

/**
 * Handler for when a remote stream has been found.
 * @param {Event} event - The event that triggered the stream.
 */
function gotRemoteStream(event) {
    // Set the playout delay hint to be very low
    // See here: https://stackoverflow.com/questions/56510151/change-playout-delay-in-webrtc-stream
    // https://github.com/w3c/webrtc-extensions/issues/8
    event.receiver.playoutDelayHint = 0;
    document.querySelector(".modal #remote-screencast-form video, .modal #browser-controls-form video").srcObject = event.streams[0];
    // scale the screencast on the server to the previous setting
    var scale = parseFloat(window.localStorage.guystationScaleDownFactor);
    makeRequest( "POST", "/screencast/scale", { id: socket.id, factor: scale ? scale : SCALE_OPTIONS[0] } );
}

/**
 * The error handler for Screencast.
 * @param {Error} error - The error.
 */
function errorHandler(error) {
    console.log(error);
}


// End screencast section
