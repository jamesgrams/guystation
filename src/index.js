/**
 * @file    Index for the GuyStation application
 * @author  James Grams
 * Please note: You should be in the main the guystation directory when running this file.
 */

const express = require('express');
const puppeteer = require('puppeteer');
const proc = require( 'child_process' );
const fs = require('fs');
const path = require('path');
const ip = require('ip');
const ioHook = require('iohook');
const rimraf = require('rimraf');
const fsExtra = require('fs-extra');
const ks = require("node-key-sender");
const multer = require('multer');
const upload = multer({ dest: '/tmp/' });
// IO Sockets server for screen
const server = require('http').createServer();
const io = require('socket.io')(server);
const axios = require('axios');
const robot = require("robotjs");
const keycode = require("keycode");
const ioctl = require("ioctl");
const syncFetch = require("sync-fetch");
const uinput = require("./lib/uinput");
const uinputStructs = require("./lib/uinput_structs");
const ua = require('all-unpacker');
const youtubedl = require('youtube-dl');
const urlLib = require('url');
const isBinaryFileSync = require("isbinaryfile").isBinaryFileSync;
const validUrl = require("valid-url");
const ini = require("ini");
const gdkMap = require("./lib/gdkmap").codes;
const gdkNameMap = require("./lib/gdkmap").names;
const sdlMap = require("./lib/sdlmap");
const x11Map = require("./lib/x11map").names;
const x11CodeMap = require("./lib/x11map").codes;
const vbamMap = require("./lib/vbammap");
const blastemMap = require("./lib/blastemmap");
const qtMap = require("./lib/qtmap");
const citraMap = require("./lib/citramap");
const pcsx2Map = require('./lib/pcsx2map');
const { stringify } = require('querystring');
const ppssppMap = require("./lib/ppssppmap").keys;
const ppssppButtonsMap = require("./lib/ppssppmap").buttons;
const generatePpssppControllersMap = require("./lib/ppssppmap").generateControllerMap;
const Porcupine = require("@picovoice/porcupine-node");
const recorder = require("node-record-lpcm16");
const hash = require("object-hash");

const PORT = 8080;
const SOCKETS_PORT = 3000;
const STATIC_PORT = 80;
const ASSETS_DIR = "assets";
const CURRENT_SAVE_DIR = "current";
const DEFAULT_SAVE_DIR = "default";
const SCREENSHOTS_DIR = "screenshots";
const SYSTEMS_DIR = "systems";
const GAMES_DIR = "games";
const SAVES_DIR = "saves";
const WORKING_DIR = process.cwd();
const SEPARATOR = path.sep;
const PLAYLIST_SEPERATOR = "2wt21ionvmae7ugc10bme9"; // make sure this is the same value as on the frontend - don't let this start with 0
const METADATA_FILENAME = "metadata.json";
const SYSTEMS_DIR_FULL = WORKING_DIR + SEPARATOR + SYSTEMS_DIR;
const SUCCESS = "success";
const FAILURE = "failure";
const SPACE = " ";
// https://stackoverflow.com/questions/3050518/what-http-status-response-code-should-i-use-if-the-request-is-missing-a-required
const HTTP_SEMANTIC_ERROR = 422;
const HTTP_OK = 200;
const HTTP_TEMPORARILY_UNAVAILABLE = 503;
const INDEX_PAGE = "index.html";
const LOCALHOST = "localhost";
var IP = "";
try {
    IP = ip.address();
}
catch(err) {
    // Not connected
}
const ESCAPE_KEY = 1;
const KILL_COMMAND = "kill -9 ";
const KILL_FIRST_COMMAND = "kill ";
const RESUME_COMMAND = "kill -CONT ";
const PAUSE_COMMAND = "kill -STOP ";
const SLEEP_COMMAND = "sleep 1";
const SLEEP_HALF_COMMAND = "sleep 0.5";
const MAX_ACTIVATE_TRIES = 30;
const FOCUS_CHROMIUM_COMMAND = "wmctrl -a 'Chrom'";
const TMP_ROM_LOCATION = "/tmp/tmprom";
const NAND_ROM_FILE_PLACEHOLDER = "ROM_FILE_PLACEHOLDER";
const GAME_DIRECTORY_PLACEHOLDER = "GAME_DIRECTORY_PLACEHOLDER";
const BROWSER = "browser";
const STREAM = "stream"; // Stream is a seperate system for readability, but it uses browser controls
const MEDIA = "media";
const MENU = "menu";
const GOOGLE_SEARCH_URL = "https://google.com/search?q=";
const HTTP = "http://";
const UP = "up";
const DOWN = "down";
const SCROLL_AMOUNT_MULTIPLIER = 0.8;
const LINUX_CHROME_PATH = "/usr/bin/google-chrome";
const HOMEPAGE = "https://game103.net";
const INVALID_CHARACTERS = ["/"];
const GET_RESOLUTION_COMMAND = "xrandr | grep -A 100 'connected primary' | grep '*' | tr -s ' ' |cut -d' ' -f 2 | sed -n '1p'"; // e.g. "1920x1080"
const SET_RESOLUTION_COMMAND = "xrandr --output $(xrandr --listmonitors | grep '*' | tr -s ' ' | cut -d' ' -f 5) --mode ";
const GET_NUM_MONITORS_COMMAND = "xrandr --listmonitors | grep 'Monitors: ' | cut -d' ' -f 2";
const CHECK_TIMEOUT = 100;
const ACTIVE_WINDOW_COMMAND = "xdotool getwindowfocus getwindowname";
const PAGE_TITLE = "GuyStation - Google Chrome";
const CHECK_MEDIA_PLAYING_INTERVAL = 100;
const ENTIRE_SCREEN = "Entire screen";
const SCREEN_ONE = "Screen 1"; // Screen 1 will always be the primary monitor
const IS_SERVER_PARAM = "is_server";
const STREAMING_HEARTBEAT_TIME = 10000; // after 10 seconds of no response from the client, we will force close the stream
const GIT_FETCH_COMMAND = "git -C ~/guystation fetch";
const GIT_UPDATES_AVAILABLE_COMMAND = 'if [ $(git -C ~/guystation rev-parse HEAD) != $(git -C ~/guystation rev-parse @{u}) ]; then echo "1"; else echo "0"; fi;';
const GIT_PULL_COMMAND = "git -C ~/guystation pull";
const KILL_GUYSTATION_COMMAND = "ps -aux | grep '[n]ode ' | awk '{print $2}' | xargs sudo kill -9; ps -aux | grep '[c]hrome' | awk '{print $2}' | xargs sudo kill -9";
let currentGuystationArgs = process.argv.slice(2);
const START_GUYSTATION_COMMAND = "sudo npm --prefix=~/guystation start" + (currentGuystationArgs.length ? (" -- " + currentGuystationArgs.join(" ")) : "");;
const RESTART_GUYSTATION_COMMAND = "sleep 5; "+START_GUYSTATION_COMMAND+" 2>&1 | logger &";
const NPM_INSTALL_COMMAND = "sudo npm --prefix=~/guystation install";
const REBOOT_GUYSTATION_COMMAND = "reboot";
const ONE_WEEK_MILLISECONDS = 604800000;
// these are the platform ids of systems in the igdb api
// by defining them, we prevent a lookup
const PLATFORM_LOOKUP = {
    "nds": [20],
    "n64": [4],
    "wii": [5],
    "ps2": [7, 8], // ps1 & ps2
    "nes": [18],
    "snes": [19],
    "nds": [20],
    "ngc": [21],
    "gba": [33, 22, 24], // gb, gbc, & gba
    "psp": [38],
    "3ds": [37, 137], // 3ds & new 3ds
    "pc": [6, 13], // pc & dos
    "dos": [6, 13],
    "sg": [29]
}
const IGDB_CLIENT_ID = process.env.GUYSTATION_IGDB_CLIENT_ID;
const IGDB_CLIENT_SECRET = process.env.GUYSTATION_IGDB_CLIENT_SECRET;
const TWITCH_CODE = process.env.GUYSTATION_TWITCH_CODE;
const DEFAULT_TWITCH_GAME_NAME = "GuyStation";
const IGDB_PATH = "igdb.json";
const TWITCH_PATH = "twitch.json";
const SETTINGS_PATH = "settings.json";
const TWITCH_STREAM_PATH = "twitch-stream.json";
const IGDB_TWITCH_OAUTH_URL= `https://id.twitch.tv/oauth2/token?client_id=${IGDB_CLIENT_ID}&client_secret=${IGDB_CLIENT_SECRET}&grant_type=client_credentials`;
const TWITCH_CODE_TO_TOKEN_URL = `https://id.twitch.tv/oauth2/token?client_id=${IGDB_CLIENT_ID}&client_secret=${IGDB_CLIENT_SECRET}&code=${TWITCH_CODE}&grant_type=authorization_code&redirect_uri=http://localhost`;
const TWITCH_REFRESH_TOKEN_URL = `https://id.twitch.tv/oauth2/token?grant_type=refresh_token&client_id=${IGDB_CLIENT_ID}&client_secret=${IGDB_CLIENT_SECRET}&refresh_token=`;
const TWITCH_CATEGORIES_ENDPOINT = "https://api.twitch.tv/helix/search/categories?first=1&query=";
const TWITCH_GAMES_ENDPOINT = "https://api.twitch.tv/helix/games?name=";
const TWITCH_VALIDATION_ENDPOINT = "https://id.twitch.tv/oauth2/validate";
const TWITCH_CHANNELS_ENDPOINT = "https://api.twitch.tv/helix/channels";
const IGBD_API_URL = "https://api.igdb.com/v4/";
const GAMES_ENDPOINT = IGBD_API_URL + "games";
const GAMES_FIELDS = "fields cover, name, first_release_date, summary;";
const COVERS_ENDPOINT = IGBD_API_URL + "covers";
const COVERS_FIELDS = "fields url, width, height;";
const IGDB_HEADERS = { 
    'Content-Type': 'text/plain'
}
const TWITCH_HEADERS = {
    'Content-Type': 'application/json',
    'Host': 'id.twitch.tv'
}
const TWITCH_API_HOST = "api.twitch.tv";
const THUMB_IMAGE_SIZE = "thumb";
const COVER_IMAGE_SIZE = "cover_big";
const COVER_FILENAME = "cover.jpg";
const USER_DATA_DIR = "../chrome";
const STATUS_FILE = USER_DATA_DIR + SEPARATOR + "Default" + SEPARATOR + "Preferences";
const MAX_MESSAGES_LENGTH = 100;
// sharing prompt either starts with http://localhost or GuyStation on older chrome
const SHARING_PROMPT = "is sharing your screen.";
const SHARING_PROMPT_DELAY_TIME = 100;
const SHARING_PROMPT_MAX_TRIES = 5;
const SYSTEM_3DS = '3ds';
const SYSTEM_N64 = 'n64';
const SYSTEM_GBA = 'gba';
const SYSTEM_NDS = "nds";
const SYSTEM_SNES = "snes";
const SYSTEM_NES = "nes";
const SYSTEM_NGC = "ngc";
const SYSTEM_PS2 = "ps2";
const SYSTEM_PSP = "psp";
const SYSTEM_WII = "wii";
const SYSTEM_SG = "sg";
const SYSTEM_PC = "pc";
const SYSTEM_DOS = "dos";
const UINPUT_PATH = "/dev/uinput";
const UINPUT_MODE = "w+";
const VIRTUAL_GAMEPAD_NAME = "GuyStation Gamepad";
const SHARING_PROMPT_TRANSPARENT_COMMAND = "xprop -id $(wmctrl -l | grep '"+ SHARING_PROMPT +"' | cut -d ' ' -f 1) -format _NET_WM_WINDOW_OPACITY 32c -set _NET_WM_WINDOW_OPACITY 0x00000000";
const SHARING_PROMPT_GET_WINDOW_INFO_COMMAND = "xwininfo -id $(xdotool search --name '" + SHARING_PROMPT + "')";
const SHARING_PROMPT_MOVE_WINDOW = "xdotool windowmove $(xdotool search --name '"+ SHARING_PROMPT +"') ";
const SHARING_PROMPT_MINIMUM = 0;
const SHARING_PROMPT_MAXIMUM = 10000;
const SHARING_PROMPT_TOP_AREA = 200;
const FAILSAFE_TRIES_INTERVAL = 1000;
const FULLSCREEN_STATE = "_NET_WM_STATE_FULLSCREEN";
const HIDDEN_STATE = "_NET_WM_STATE_HIDDEN";
const FAKE_MICROPHONE_COMMAND = "modprobe snd_aloop";
const LIST_SOURCE_OUTPUTS_COMMAND = "pacmd list-source-outputs";
const MOVE_SOURCE_OUTPUT_COMMAND = "pacmd move-source-output ";
const GET_DEFAULT_AUDIO_DEVICE_COMMAND = "pacmd list-sinks | grep -A 100000 '* index'";
const GET_DEFAULT_MICROPHONE_COMMAND = "pacmd list-sources | grep '* index'";
const GOOGLE_CHROME_AUDIO_IDENTIFIER = "google-chrome";
const PACMD_PREFIX = 'export PULSE_RUNTIME_PATH="/run/user/$(id --user $(logname))/pulse/" && sudo -u $(logname) -E '; // need to run as the user
const DOWNLOAD_ROM_PREFIX = "/tmp/download_rom_";
const DOWNLOAD_PC_PREFIX = "/tmp/download_pc";
const PC_BACKUP_LOCATION = "/tmp/pc_backup";
const STATUS_DOWNLOADING = "downloading";
const STATUS_ROM_FAILED = "failed";
const STRING_TYPE = "string";
const OBJECT_TYPE = "object";
const CHROMIUM_ARG = "--chromium";
const SAMBA_FLAG = "--smb";
const TMP_FOLDER_EXTENSION = "_folder";
const REQUEST_LOCKED_CHECK_TIME = 100;
const UPDATE_PERCENT_MINIMUM = 1;
const RELOAD_MENU_PAGE_INTERVAL = 14400000; // 4 hours
const RELOAD_MENU_PAGE_MORE_TIME_NEEDED = 600000; // 10 minutes
const BROWSE_SCRIPT_INTERVAL = 3000;
const BROWSE_LINE_TRIES = 4;
const CLOSE_PAGE_TIMEOUT = 2000;

const CONFIG_JOINER = ",";
const CONTROL_STRING = "$CONTROL";
const KEY_CONTROL_TYPE = "key";
const AXIS_CONTROL_TYPE = "axis";
const BUTTON_CONTROL_TYPE = "button";
const DIRECTION_PLUS = "+";
const NES_JOYSTICK = "Joystick";
const NES_KEYBOARD = "Keyboard";
const NES_DEVICE_TYPE_KEY = "SDL.Input.GamePad.0DeviceType";
const DIRECTION_MODIFIER_3DS = ",direction:";
const GET_USER_COMMAND = "logname";
const USER_PLACEHOLDER = "james";
const DEFAULT_PSP_CONTROLLER_ID = "default";
const PSP_AXIS_PREPEND = "a";
const EZ_CONTROL_PATH = "profiles.json";
const NGC_GAMEPAD = "evdev/0/Gamepad";
const NGC_VIRTUAL_KEYBOARD = "XInput2/0/Virtual core pointer";
const NGC_PAD_KEY = "GCPad1";
const NGC_DEVICE_TYPE_KEY = "Device";
const WII_PAD_KEY = "Wiimote1";
const WII_CLASSIC_KEY = "Extension";
const WII_CLASSIC_VALUE = "Classic";
const WII_NUNCHUK_VALUE = "Nunchuk";
const WII_SOURCE_KEY = "Source";
const WII_SOURCE_EMULATED = 1;
const HOTKEY_PAD_KEY = "Hotkeys";
const N64_MANUAL_CONTROLLER = "Input-SDL-Control1";
const N64_MANUAL_KEY = "mode";
const N64_MANUAL_VALUE = 0;
const N64_DEVICE_KEY = "device";
const SCREENSHOT_CONTROL = "Screenshot";
const WATCH_FOLDERS_INTERVAL = 3000;
const VIDEO_SELECTOR_TIMEOUT = 8000;
const LIST_SINK_INPUTS_COMMAND = "pacmd list-sink-inputs | grep 'index:\\|application.name'";
const SET_MUTE_COMMAND = "pacmd set-sink-input-mute ";
const MUTE_TRUE = " true";
const MUTE_FALSE = " false";
const BLANK_PAGE = "about:blank";
const CHROME_NAME = "application.name = \"Chrom";
const MUTE_MODES = {
    none: "none",
    game: "game",
    browser: "browser",
    all: "all"
}
const PIP_LOAD_TIME = 100;
const TRY_PIP_INTERVAL = 100;
const ENSURE_MUTE_TIMEOUT_TIME = 6000;
const LEFT = "left";
const RIGHT = "right";
const GAMEPAD_MOVE_CURSOR_AMOUNT = 25;
const GAMEPAD_SCROLL_AMOUNT = 50;
const BROWSER_GAMEPAD_PATH = "browser-gamepad.json";
const STREAM_INFO_PATH = "stream-info.json";
const LAUNCH_ONBOARD_COMMAND = "onboard";
const ENSURE_FLOAT_ONBOARD_COMMAND = "gsettings set org.onboard.window docking-enabled false";
const RENEGOTIATE_RTMP_INTERVAL = 50;
const SIGTERM = 'SIGTERM';
const INSTALLSHIELD = "InstallShield Installation Information";
const COMMON_FILES = "Common Files";
const UPDATE_PLAYTIME_INTERVAL = 60000; // 1 minute
const VOICE_KEYWORDS = ["hey cocoa"];
const VOICE_SENSITIVITIES = VOICE_KEYWORDS.map( el => 0.75 );
const VOICE_RECORDER_TYPE = "arecord";
const VOICE_SAMPLE_RATE_HERTZ = 16000;
const SORT_PLAYTIME = "totalPlaytime";
const SORT_RECENT = "mostRecentPlaytime";
const DEFAULT_STREAM_SHOWN = 10;
const MIN_STREAM_SEARCH_LENGTH = 3;
const STOPWORDS = ["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "in", "out", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now", "on", "off", "up", "down"];

const DEFAULT_STREAM_SERVICES = {
    "Disney+": {
        "url": "https://reelgood.com/source/disney_plus",
        "selector": 'button[data-testid="details-signup-cta"]',
        "script": [ 
            "document.querySelector('button[data-testid=play-button]').click()"
        ],
        "linkRegex": /https:\\u002F\\u002Fwww.disneyplus[^"]+/
    }
};
const REELGOOD_API_URL = "https://api.reelgood.com/v3.0/content/browse/source";
const REELGOOD_IMAGE_URL = "https://img.reelgood.com/content/movie/MOVIE_ID/poster-342.jpg";
const REELGOOD_URL = "https://reelgood.com/";
const STREAM_WAIT = 2000;
const STREAM_TIMEOUT = 10000;
const STREAM_WIDTH = 1200;
const STREAM_HEIGHT = 800;
const STREAM_OK_TO_FETCH_HOUR = 2;
const STREAM_SYNC_WAIT = 1000 * 60 * 10; // 10 minutes
const STREAM_COVER_WIDTH = 342;
const STREAM_COVER_HEIGHT = 513;
const WRITE_STREAM_SLEEP = 100;
const PROPER_LINK_TRIES = 3;
const QUEUE_MAX_ATTEMPTS = 10;
const QUEUE_WAIT_TIME = 10;
const MAX_COMMAND_INTERVAL = 100;

const DEFAULT_PROFILES_DICT = {
    "GuyStation Virtual Controller": {
        "A":"button(0)-0003-0003",
        "B":"button(1)-0003-0003",
        "X":"button(2)-0003-0003",
        "Y":"button(3)-0003-0003",
        "L":"button(4)-0003-0003",
        "R":"button(5)-0003-0003",
        "L2":"button(6)-0003-0003",
        "R2":"button(7)-0003-0003",
        "Select":"button(8)-0003-0003",
        "Start":"button(9)-0003-0003",
        "L3":"button(11)-0003-0003",
        "R3":"button(12)-0003-0003",
        "Up":"button(13)-0003-0003",
        "Down":"button(14)-0003-0003",
        "Left":"button(15)-0003-0003",
        "Right":"button(16)-0003-0003",
        "Axis X-":"axis(0-)-0003-0003",
        "Axis X+":"axis(0+)-0003-0003",
        "Axis Y-":"axis(1-)-0003-0003",
        "Axis Y+":"axis(1+)-0003-0003",
        "Axis X2-":"axis(2-)-0003-0003",
        "Axis X2+":"axis(2+)-0003-0003",
        "Axis Y2-":"axis(3-)-0003-0003",
        "Axis Y2+":"axis(3+)-0003-0003",
        "Screenshot": ""
    }
};

const ERROR_MESSAGES = {
    "noSystem" : "System does not exist",
    "noGame": "Game does not exist",
    "gameBeingPlayed": "Please quit the current game first",
    "noRomFile": "No ROM found for game",
    "noRunningGame": "No game currently running",
    "usingReservedSaveName": "You can't use the name 'current' for a save",
    "saveAlreadyExists": "A save with that name already exists",
    "saveDoesNotExist": "Save does not exist",
    "noFileInUpload": "No file or filename were found in the upload request",
    "locationDoesNotExist": "The location specified does not exist",
    "gameAlreadyExists": "A game with that name already exists",
    "anotherRequestIsBeingProcessed": "Another request is already being processed",
    "gameNameRequired": "A name is required to add a new game",
    "romFileRequired": "A ROM file is required to add a new game",
    "saveNameRequired": "A name is required to add a new save",
    "saveAlreadySelected": "Save already selected",
    "browsePageClosed": "The browser is closed",
    "browsePageInvalidCoordinates": "Invalid click coordinates",
    "browseInvalidDirection": "Invalid scroll direction",
    "browsePageNotFound": "The specified page was not found",
    "nonEmptyDirectory": "A folder with items inside it can't be deleted",
    "convertGameToFolder": "A game can't be converted to a folder",
    "convertFolderToGame": "A folder can't be converted to a game",
    "convertPlaylistToFolder": "A playlist can't be converted to a game",
    "convertFolderToPlaylist": "A folder can't be converted to a playlist",
    "convertPlaylistToGame": "A playlist can't be converted to a game",
    "convertGameToPlaylist": "A game can't be converted to a playlist",
    "folderHasGameBeingPlayed": "This folder has games in it that are being played",
    "folderCantBeUnderItself": "A folder can't be moved under itself",
    "invalidCharacterInName": "Invalid character in name",
    "menuPageClosed": "The menu page is closed",
    "invalidButton": "Button does not exist",
    "noMediaPlaying": "No media is playing",
    "playlistItemsRequired": "Playlist items are required",
    "invalidSymlink": "The desired link does not exist",
    "playlistsOnlyForMedia": "Playlists are only allowed for media",
    "folderContainsPlaylistsOnlyForMedia": "This folder contains playlists which are only allowed for media",
    "invalidPlaylistItem": "In invalid item was included in the playlist",
    "addFolderToPlaylist": "A folder can't be added to a playlist",
    "addPlaylistToPlaylist": "A playlist can't be added to a playlist",
    "symlinkToItemBeingPlayed": "Please stop playing any references to this track",
    "playlistHasGameBeingPlayed": "This playlist has tracks in it that are being played",
    "connectionAlreadyExists": "A connection already exists",
    "screencastAlreadyStarted": "The screencast has already started",
    "screencastNotStarted": "The screencast is not running yet",
    "clientAndServerAreNotBothConnected": "The client and server are not both ready",
    "invalidParents": "Invalid parents",
    "noGamesForMediaOrBrowser": "Media and Browser have no games",
    "alreadyFetchedWithinWeek": "Info has already been fetched this week",
    "noGameInfo": "No game info available",
    "noApiKey": "No IGDB API credentials",
    "invalidFileName": "Invalid file name",
    "genericError": "An uncaught error ocurred",
    "invalidMessage": "Invalid message",
    "couldNotCreateGamepad": "Could not create a gamepad",
    "gamepadNotConnected": "Gamepad not connected",
    "downloadRomError": "An error ocurred downloading the ROM",
    "invalidUrl": "Invalid URL",
    "romNotYetDownloaded": "ROM still downloading",
    "romFailedDownload": "This ROM failed to download. Please try again",
    "configNotAvailable": "This emulator is unavailable for configuration",
    "invalidProfile": "Invalid profile",
    "noUrl": "No URL for site",
    "invalidSiteJson": "Invalid JSON for site",
    "siteUrlRequired": "The siteUrl key is required for site JSON",
    "couldNotSetScale": "Could not set scale",
    "couldNotSetMute": "Could not set mute",
    "invalidFilepath": "Invalid filepath",
    "couldNotFetchIGDBInfo": "Could not fetch IGDB information",
    "pipPageClosed": "The PIP page is closed",
    "couldNotFindVideo": "Could not find video on page",
    "couldNotMuteProperly": "Could not mute properly",
    "invalidMuteMode": "Invalid mute mode",
    "alreadyStreamingRtmp": "Already streaming RTMP",
    "rtmpUrl": "Please enter a RTMP url",
    "twitchNoValidate": "Could not validate Twitch",
    "notStreamingRTMP": "No current RTMP stream",
    "noTwitchCode": "No Twitch code found",
    "invalidTwitchCode": "Invalid Twitch code",
    "couldNotFetchTwitchInfo": "Could not fetch Twitch information",
    "couldNotFindTwitchUsername": "Could not find Twitch username",
    "anotherTwitchRequest": "Twitch request outdated",
    "invalidRomCandidate": "Invalid ROM candidate",
    "pcStillLoading": "PC still loading",
    "streamCurrentlyFetching": "Info currently being fetching"
}
// http://jsfiddle.net/vWx8V/ - keycode
// http://robotjs.io/docs/syntax - robotjs
const KEYCODE_TO_ROBOT_JS = {
    "esc": "escape",
    "page up": "pageup",
    "page down": "pagedown",
    "ctrl": "control",
}
const USERNAME_OPTIONS = ["🐵", "🐶", "🦊", "🐱", "🦁", "🐯", "🐮", "🐷", "🐘", "🐹", "🐰", "🐻", "🐨", "🐼", "🐣", "🐧", "🐸", "🦕", "🐳", "🐬"];

// We will only allow for one request at a time for app
let requestLocked = false;
let hookLocked = false;

let currentSystem = null;
let currentGame = null;
let currentParentsString = null;
let currentEmulator = null;
let currentGameStart = null;
let prevGameStart = null;
let currentPlaytimeInterval = null;

let systemsDict = {};
let systemsDictHash = "";
let systemsDictHashNoSessions = "";
let profilesDict = {};

let browser = null;
let menuPage = null;
let pipPage = null;
let muteMode = null;
let previousMuteMode = null;
let browsePage = null;
let properResolution = null;
let clearMediaPlayingInterval = null;
let needToRefocusGame = false;
let gamepadFileDescriptors = [];
let properEmulatorResolution = null;
let continueInterval = null;
let pcChangeLoop = null;
let pcChangeClear = null;
let tryPipInterval = null;
let ensureMuteTimeout = null;
let fullscreenPip = false;
let needToRefocusPip = false;
let browserControlsCache = null;
let onboardInstance = null;
let currentTwitchRequest = 0;
let lastRtmpUrl = null;
let expressStatic = null;
let expressDynamic = null;
let socketsServer = null;
let pcUnpacking = false;
let streamIsFetching = false;
let screencastLastCounters = {};
let screencastLastTimestamps = {};
let screencastLastRuns = {};

let sambaIndex = process.argv.indexOf(SAMBA_FLAG);
let sambaOn = sambaIndex != -1;
let sambaUrl = "";
if( sambaIndex != -1 ) {
    sambaUrl = process.argv[sambaIndex+1];
}

let desktopUser = proc.execSync(GET_USER_COMMAND).toString().trim();
const PC_WATCH_FOLDERS = [
    "/home/"+desktopUser+"/.wine/drive_c/Program Files",
    "/home/"+desktopUser+"/.wine/drive_c/Program Files (x86)",
];
const VOICE_KEYWORD_PATHS = ["/home/"+desktopUser+"/guystation/helper/heycocoa.ppn"];

let messages = [];

let ppssppControllersMap;

// Load the data on startup
getData( true );

/**************** Express ****************/

const app = express();
const staticApp = express();

// Middleware to allow cors from any origin
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS, PATCH');
    next();
});

app.use( "/"+ASSETS_DIR+"/", express.static(ASSETS_DIR) );
app.use( "/"+SYSTEMS_DIR+"/", express.static(SYSTEMS_DIR) );
staticApp.use( "/"+ASSETS_DIR+"/", express.static(ASSETS_DIR) );
staticApp.use( "/"+SYSTEMS_DIR+"/", express.static(SYSTEMS_DIR) );

app.use( express.json({limit: '20000mb'}) );

// Endpoint to serve the basic HTML needed to run this app
app.get("/", async function(request, response) {
    console.log("app serving / (GET)");
    request.url = "/"+ASSETS_DIR+"/"+INDEX_PAGE;
    staticApp.handle(request, response);
});

// Endpoint to serve the basic HTML needed to run this app
staticApp.get("/", async function(request, response) {
    console.log("staticApp serving / (GET)");
    request.url = "/"+ASSETS_DIR+"/"+INDEX_PAGE;
    staticApp.handle(request, response);
});

// Get Data
app.get("/data", async function(request, response) {
    console.log("app serving /data (GET)");
    getData( false, request.query.noPlaying );
    writeResponse( request, response, SUCCESS, {} );
});

// Get Data without reloading
// Helpful for samba mode
app.get("/data-quick", async function(request, response) {
    console.log("app serving /data-quick (GET)");
    writeResponse( request, response, SUCCESS, {} );
});

// Launch a game
app.post("/launch", async function(request, response) {
    console.log("app serving /launch (POST) with body: " + JSON.stringify(request.body));
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = await launchGame( request.body.system, request.body.game, null, request.body.parents );
            getData();
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// Quit a game
app.post("/quit", async function(request, response) {
    console.log("app serving /quit (POST) with body: " + JSON.stringify(request.body));
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = await quitGame();
            getData(); // Reload data
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// Return to home for a game
app.post("/home", async function(request, response) {
    console.log("app serving /home (POST) with body: " + JSON.stringify(request.body));
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = await goHome();
            getData(); // Reload data
            requestLocked = false;

            if( errorMessage.didPause === true || errorMessage.didPause === false ) {
                writeResponse( request, response, SUCCESS, errorMessage );
            }
            else {
                writeActionResponse( request, response, errorMessage );
            }
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// Add a save
app.post("/save", async function(request, response) {
    console.log("app serving /save (POST) with body: " + JSON.stringify(request.body));
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = newSave( request.body.system, request.body.game, request.body.save, null, request.body.parents );
            getData(); // Reload data
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// Update the current save
app.put("/save", async function(request, response) {
    console.log("app serving /save (PUT) with body: " + JSON.stringify(request.body));
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = updateSave( request.body.system, request.body.game, request.body.parents, request.body.oldSave, request.body.save );
            getData(); // Reload data
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// Change the current save
app.patch("/save", async function(request, response) {
    console.log("app serving /save/ (PUT) with body: " + JSON.stringify(request.body));
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = changeSave( request.body.system, request.body.game, request.body.save, null, request.body.parents );
            getData(); // Reload data
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// Delete a save
app.delete("/save", async function(request, response) {
    console.log("app serving /save (DELETE) with body: " + JSON.stringify(request.body));
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = deleteSave( request.body.system, request.body.game, request.body.save, request.body.parents );
            getData(); // Reload data
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// Add a game
app.post("/game", upload.single("file"), async function(request, response) {
    console.log("app serving /game (POST)");
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = addGame( request.body.system, request.body.game, request.file ? request.file : request.body.file, JSON.parse(request.body.parents), request.body.isFolder, request.body.isPlaylist, JSON.parse(request.body.playlistItems) );
            getData(); // Reload data
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// Update a game
app.put("/game", upload.single("file"), async function(request, response) {
    console.log("app serving /game (PUT)");
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = updateGame( request.body.oldSystem, request.body.oldGame, JSON.parse(request.body.oldParents), request.body.system, request.body.game, request.file ? request.file : request.body.file, JSON.parse(request.body.parents), request.body.isFolder, request.body.isPlaylist, JSON.parse(request.body.playlistItems), request.body.romCandidate );
            getData(); // Reload data
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// Delete a game
app.delete("/game", async function(request, response) {
    console.log("app serving /game (DELETE) with body: " + JSON.stringify(request.body));
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = deleteGame( request.body.system, request.body.game, request.body.parents );
            getData(); // Reload data
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// Send a message
app.post("/message", function(request, response) {
    console.log("app serving /message (POST)");
    let errorMessage = sendMessage( request.body.message );
    writeActionResponse( request, response, errorMessage );
});

// Get all messages
app.get("/message", function(request, response) {
    console.log("app serving /message (GET)");
    writeResponse( request, response, SUCCESS, { "messages": messages } );
});

// Get input for the a browser
app.get("/browser/url", async function(request, response) {
    console.log("app serving /browser/url");
    // Don't worry about locking for these
    let url = await getUrl();
    if( !Object.values(ERROR_MESSAGES).includes(url) ) {
        writeResponse( request, response, SUCCESS, {url: url} );
    }
    else {
        writeResponse( request, response, FAILURE, {message: url});
    }
});

// Navigate the browser to a page
app.post("/browser/navigate", async function(request, response) {
    console.log("app serving /browser/navigate");
    let errorMessage = await navigate( request.body.url );
    writeActionResponse( request, response, errorMessage );
});

// Refresh the browser page
app.get("/browser/refresh", async function(request, response) {
    console.log("app serving /browser/refresh");
    let errorMessage = await refresh();
    writeActionResponse( request, response, errorMessage );
});

// Scroll
app.post("/browser/scroll", async function(request, response) {
    console.log("app serving /browser/scroll");
    let errorMessage = await scroll( request.body.direction );
    writeActionResponse( request, response, errorMessage );
});

// Forward
app.get("/browser/forward", async function(request, response) {
    console.log("app serving /browser/forward");
    let errorMessage = await goForward();
    writeActionResponse( request, response, errorMessage );
});

// Back
app.get("/browser/back", async function(request, response) {
    console.log("app serving /browser/back");
    let errorMessage = await goBack();
    writeActionResponse( request, response, errorMessage );
});

// Get browse tabs
app.get("/browser/tabs", async function(request, response) {
    console.log("app serving /browser/tabs");
    let tabs = await getBrowseTabs();
    if( !Object.values(ERROR_MESSAGES).includes(tabs) ) {
        writeResponse( request, response, SUCCESS, {tabs: tabs} );
    }
    else {
        writeResponse( request, response, FAILURE, {message: tabs});
    }
});

// Change browse tabs
app.put("/browser/tab", async function(request, response) {
    console.log("app serving /browser/tab");
    let errorMessage = await switchBrowseTab(request.body.id);
    writeActionResponse( request, response, errorMessage );
});

// Close a browse tab
app.delete("/browser/tab", async function(request, response) {
    console.log("app serving /browser/tab");
    let errorMessage = await closeBrowseTab(request.body.id);
    writeActionResponse( request, response, errorMessage );
});

// Add a browse tab
app.post("/browser/tab", async function(request, response) {
    console.log("app serving /browser/tab");
    let errorMessage = await launchBrowseTab();
    writeActionResponse( request, response, errorMessage );
});

// Connect the menu page to the signal server
app.get("/screencast/connect", async function(request, response) {
    console.log("app serving /screencast/connect");
    // don't allow screencast to start while we're trying to do something else
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = await connectScreencast( request.query.id, parseInt(request.query.numControllers) );
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// Stop screencast
app.get("/screencast/stop", async function(request, response) {
    console.log("app serving /screencast/stop");
    let errorMessage = await stopScreencast( request.query.id );
    writeActionResponse( request, response, errorMessage );
});

// Reset screencast cancel timeout
app.get("/screencast/reset-cancel", async function(request, response) {
    console.log("app serving /screencast/reset-cancel");
    let errorMessage = resetScreencastTimeout( request.query.id );
    writeActionResponse( request, response, errorMessage );
});

// Send a click event in a screencast
app.post("/screencast/mouse", async function(request, response) {
    console.log("app serving /screencast/mouse with body: " + JSON.stringify(request.body));
    let errorMessage = await performScreencastMouse( request.body.xPercent, request.body.yPercent, request.body.button, request.body.down, parseInt(request.body.counter), parseInt(request.body.timestamp) );
    writeActionResponse( request, response, errorMessage );
});

// Press some buttons on a screencast
app.post("/screencast/buttons", async function(request, response) {
    console.log("app serving /screencast/buttons with body: " + JSON.stringify(request.body));
    let errorMessage = await performScreencastButtons( request.body.buttons, request.body.down, parseInt(request.body.counter), parseInt(request.body.timestamp) );
    writeActionResponse( request, response, errorMessage );
});

// Press some gamepad input on a screencast
app.post("/screencast/gamepad", async function(request, response) {
    console.log("app serving /screencast/gamepad with body: " + JSON.stringify(request.body));
    let errorMessage = await performScreencastGamepad( request.body.event, request.body.id, parseInt(request.body.controllerNum), parseInt(request.body.counter), parseInt(request.body.timestamp) );
    writeActionResponse( request, response, errorMessage );
});

// Set the scale down by of the screencast
app.post("/screencast/scale", async function(request, response) {
    console.log("app serving /screencast/scale with body: " + JSON.stringify(request.body));
    let errorMessage = await setScreencastScale( request.body.id, request.body.factor );
    writeActionResponse( request, response, errorMessage );
});

// Set the mute of the screencast
app.post("/screencast/mute", async function(request, response) {
    console.log("app serving /screencast/mute with body: " + JSON.stringify(request.body));
    let errorMessage = await setScreencastMute( request.body.id, request.body.mute );
    writeActionResponse( request, response, errorMessage );
});

// Update the system
app.get("/system/update", async function(request, response) {
    console.log("app serving /system/update");
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = updateGuystation();
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// Check if the system has updates available
app.get("/system/has-updates", async function(request, response) {
    console.log("app serving /system/update");
    let hasUpdates = guystationHasUpdates();
    writeResponse( request, response, SUCCESS, {hasUpdates: hasUpdates} );
});

// Restart the system
app.get("/system/restart", async function(request, response) {
    console.log("app serving /system/update");
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = restartGuystation();
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// Reboot the system
app.get("/system/reboot", async function(request, response) {
    console.log("app serving /system/reboot");
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = rebootGuystation();
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// Change the controls for a system
app.post("/controls", async function(request, response) {
    console.log("app serving /controls with body: " + JSON.stringify(request.body));
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = setControls( request.body.systems, request.body.values, request.body.controller, request.body.nunchuk );
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// Change the controls for multiple controllers
app.post("/controls-multiple", async function(request, response) {
    console.log("app serving /controls-multiple with body: " + JSON.stringify(request.body));
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = setMultipleControls( request.body.controllers );
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// add an ez control profile
app.post("/profile", async function(request, response) {
    console.log("app serving /profile with body: " + JSON.stringify(request.body));
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = addEzControlProfile( request.body.name, request.body.profile );
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// delete an ez control profile
app.delete("/profile", async function(request, response) {
    console.log("app serving /profile with body: " + JSON.stringify(request.body));
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = deleteEzControlProfile( request.body.name );
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// get all ez control profiles
app.get("/profiles", async function(request, response) {
    console.log("app serving /profiles");
    try {
        loadEzControlsProfiles();
        writeResponse( request, response, SUCCESS, { "profiles": profilesDict } );
    }
    catch(err) {
        console.log(err);
        writeActionResponse( request, response, ERROR_MESSAGES.genericError );
    }
});

// get the samba flag
app.get("/samba", async function(request, response) {
    console.log("app serving /samba");
    writeResponse( request, response, SUCCESS, {"samba": sambaOn} );
} );

// Start PIP
app.post("/pip/start", async function(request, response) {
    console.log("app serving /pip/start");
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = await startPip( request.body.url, request.body.muteMode );
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// Stop PIP
app.post("/pip/stop", async function(request, response) {
    console.log("app serving /pip/stop");
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = await stopPip();
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// Toggle Fullscreen PIP
app.post("/pip/fullscreen", async function(request, response) {
    console.log("app serving /pip/fullscreen");
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = await toggleFullscreenPip();
            requestLocked = false;
            writeActionResponse( request, response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( request, response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( request, response );
    }
});

// Play pip
app.post("/pip/play", async function(request, response) {
    console.log("app serving /pip/play");
    try {
        let errorMessage = await playPip();
        writeActionResponse( request, response, errorMessage );
    }
    catch(err) {
        console.log(err);
        writeActionResponse( request, response, ERROR_MESSAGES.genericError );
    }
});

// Pause pip
app.post("/pip/pause", async function(request, response) {
    console.log("app serving /pip/pause");
    try {
        let errorMessage = await pausePip();
        writeActionResponse( request, response, errorMessage );
    }
    catch(err) {
        console.log(err);
        writeActionResponse( request, response, ERROR_MESSAGES.genericError );
    }
});

// Change the mute mode
app.post("/mute-mode", async function(request, response) {
    console.log("app serving /mute-mode");
    try {
        let errorMessage = setMuteMode( request.body.muteMode );
        writeActionResponse( request, response, errorMessage );
    }
    catch(err) {
        console.log(err);
        writeActionResponse( request, response, ERROR_MESSAGES.genericError );
    }
});

// Pause pip
app.post("/listen", async function(request, response) {
    console.log("app serving /listen");
    try {
        let errorMessage = await listenMic();
        writeActionResponse( request, response, errorMessage );
    }
    catch(err) {
        console.log(err);
        writeActionResponse( request, response, ERROR_MESSAGES.genericError );
    }
});

// Start RTMP
app.post("/rtmp/start", async function(request, response) {
    console.log("app serving /rtmp/start with body: " + JSON.stringify(request.body));
    try {
        let errorMessage = await startRtmp( request.body.url );
        writeActionResponse( request, response, errorMessage );
    }
    catch(err) {
        console.log(err);
        writeActionResponse( request, response, ERROR_MESSAGES.genericError );
    }
});

// Stop RTMP
app.post("/rtmp/stop", async function(request, response) {
    console.log("app serving /rtmp/stop");
    try {
        let errorMessage = await stopRtmp();
        writeActionResponse( request, response, errorMessage );
    }
    catch(err) {
        console.log(err);
        writeActionResponse( request, response, ERROR_MESSAGES.genericError );
    }
});

// RTMP status
app.get("/rtmp/status", function(request, response) {
    console.log("app serving /rtmp/status");
    writeResponse( request, response, SUCCESS, {"rtmp": rtmpOn()} );
});

// stream
app.post("/twitch/info", function(request, response) {
    console.log("app serving /twitch/info with body: " + JSON.stringify(request.body));
    try {
        let errorMessage = updateTwitchStreamInfo( request.body.name, request.body.game );
        writeActionResponse( request, response, errorMessage );
    }
    catch(err) {
        console.log(err);
        writeActionResponse( request, response, ERROR_MESSAGES.genericError );
    }
});

// get all ez control profiles
app.get("/twitch/info", async function(request, response) {
    console.log("app serving /twitch/info");
    try {
        let streamInfo = getTwitchStreamInfo();
        writeResponse( request, response, SUCCESS, { 
            "name": streamInfo.name, 
            "game": streamInfo.game, 
            "twitch": (TWITCH_CODE || fs.existsSync(TWITCH_STREAM_PATH)) ? true : false } 
        );
    }
    catch(err) {
        console.log(err);
        writeActionResponse( request, response, ERROR_MESSAGES.genericError );
    }
});

// endpoints for settings

// get settings
app.get("/settings", function(request, response) {
    console.log("app serving /settings");
    try {
        writeResponse( request, response, SUCCESS, readSettings() );
    }
    catch(err) {
        console.log(err);
        writeActionResponse( request, response, ERROR_MESSAGES.genericError );
    }
});

// update settings
app.put("/settings", function(request, response) {
    console.log("app serving /settings with body: " + JSON.stringify(request.body));
    try {
        updateSettings( request.body.settings );
        writeActionResponse( request, response );
    }
    catch(err) {
        console.log(err);
        writeActionResponse( request, response, ERROR_MESSAGES.genericError );
    }
});

// endpoints to set up to stream what is coming through the microphone and webcam

// set up the proper microphone input to the stream
app.get("/stream/microphone", async function(request, response) {
    bindMicrophoneToChromeInput();
    writeResponse( request, response, SUCCESS );
} );

// Create the fake microphone
if(process.argv.indexOf(CHROMIUM_ARG) == -1) {
    createFakeMicrophone();
}

// START PROGRAM (Launch Browser and Listen)
socketsServer = server.listen(SOCKETS_PORT); // This is the screencast server
expressStatic = staticApp.listen(STATIC_PORT); // Launch the static assets first, so the browser can access them
launchBrowser().then( () => {
    try {
        if(process.argv.indexOf(CHROMIUM_ARG) == -1) {
            setMuteMode(MUTE_MODES.none);
        }
    }
    catch(err) {
        console.log(err);
    }
    expressDynamic = app.listen(PORT);
    detectHotword();
    if( !sambaOn ) syncStreams();
} );
process.on(SIGTERM, () => {
    try {
        ioHook.unload();
    }
    catch(err) {console.log(err);}
    try {
        browser.close();
    }
    catch(err) {console.log(err);}
    try {
        expressDynamic.close();
    }
    catch(err) {console.log(err);}
    try {
        expressStatic.close();
    }
    catch(err) {console.log(err);}
    try {
        socketsServer.close();
    }
    catch(err) {console.log(err);}
});

/**************** Express & Puppeteer Functions ****************/

/**
 * Determine if a game is not available.
 * Note: In this case, a folder is NOT a game but a playlist is a game.
 * @param {string} system - The system the game is on.
 * @param {string} game - The game to play.
 * @param {Array<string>} parents - An array of parent directories for the game.
 * @returns {(boolean|string)} False if the game is available, or an error message if it is not.
 */
function isInvalidGame( system, game, parents ) {
    if( !system || !systemsDict[system] ) {
        return ERROR_MESSAGES.noSystem;
    }
    // Check to make sure there is a game, it exists, and it is not a folder
    else if( !game || !getGameDictEntry(system, game, parents) || getGameDictEntry(system, game, parents).isFolder ) {
        return ERROR_MESSAGES.noGame;
    }
    return false;
}

/**
 * Determine if a name is invalid.
 * @param {string} name - The name to check for validity.
 * @returns {(boolean|string)} False if the name is ok, or an error message if it is not.
 */
function isInvalidName( name ) {
    for( let invalidCharacter of INVALID_CHARACTERS ) {
        if( name.includes(invalidCharacter) ) {
            return ERROR_MESSAGES.invalidCharacterInName;
        }
    }
    return false;
}

/**
 * Determine is a file name is valid for a ROM.
 * @param {string} file - The name of the file.
 * @returns {(boolean|string)} False if the name is ok, or an error message if it is not.
 */
function isInvalidFileName( file ) {
    if( file == METADATA_FILENAME || file == COVER_FILENAME ) {
        return ERROR_MESSAGES.invalidFileName;
    }
    return false;
}

/**
 * Write a standard response for when an action is taken.
 * @param {Response} response - The response object.
 * @param {string} errorMessage - The error message from running the code.
 */
function writeActionResponse( request, response, errorMessage ) {
    if( errorMessage ) {
        writeResponse( request, response, FAILURE, { "message": errorMessage }, HTTP_SEMANTIC_ERROR );
    }
    else {
        writeResponse( request, response, SUCCESS );
    }
}

/**
 * Write a response indicating that the request is locked.
 * @param {Response} response - The response object.
 */
function writeLockedResponse( request, response ) {
    writeResponse( request, response, FAILURE, { "message": ERROR_MESSAGES.anotherRequestIsBeingProcessed}, HTTP_TEMPORARILY_UNAVAILABLE );
}

/**
 * Send a response to the user.
 * @param {Request} request - The request object.
 * @param {Response} response - The response object.
 * @param {string} status - The status of the request.
 * @param {Object} object - An object containing values to include in the response.
 * @param {number} code - The HTTP response code (defaults to 200).
 * @param {string} contentType - The content type of the response (defaults to application/json).
 */
function writeResponse( request, response, status, object, code, contentType ) {
    if( !code ) { code = HTTP_OK; }
    if( !contentType ) { contentType = "application/json"; }
    if( !object ) { object = {}; }
    response.writeHead(code, {'Content-Type': 'application/json'});
    
    let structure = request.body && Object.keys(request.body).length ? request.body : request.query;
    let responseSystemsDict = null;
    if( structure.noPlaying ) responseSystemsDict = systemsDict; // samba mounts need everything
    else if(structure.systemsDictHash != systemsDictHash || structure.systemsDictForce) { // Don't respond with every value for streaming
        responseSystemsDict = filterStreams(structure.systemsDictSearch, structure.systemsDictSort);
    }

    let responseObject = Object.assign( {status:status, systems: responseSystemsDict, systemsDictHash: systemsDictHash, systemsDictHashNoSessions: systemsDictHashNoSessions, fullscreenPip: fullscreenPip, ip: IP}, object );
    response.end(JSON.stringify(responseObject));
}

/**
 * Remove Chrome's knowledge that it crashed.
 */
function removeChromeCrashed() {
    try {
        let chromeStatus = JSON.parse(fs.readFileSync(STATUS_FILE));
        chromeStatus.profile.exit_type = "none";
        chromeStatus.profile.exited_cleanly = true;
        fs.writeFileSync(STATUS_FILE, JSON.stringify(chromeStatus));
    }
    catch(err) { console.log(err.message); }
}

/**
 * Launch a puppeteer browser.
 */
async function launchBrowser() {
    removeChromeCrashed();
    // the autoselect chrome code just uses a c++ string find to find the matching share (when you call getDisplayMedia, look at the label under the option)
    // when there is only one monitor, there is no label for the screen, so it is called Entire screen
    // when there are multiple, the label is "Screen 1" for the primary monitor
    let numMonitors = parseInt(proc.execSync(GET_NUM_MONITORS_COMMAND));
    let settings = readSettings();
    let options = {
        headless: false,
        defaultViewport: null,
        args: [
            '--no-sandbox',
            '--disable-infobars',
            `--auto-select-desktop-capture-source=${numMonitors > 1 ? SCREEN_ONE : ENTIRE_SCREEN}` // this has to be like this otherwise the launcher will not read the argument. It has to do with node.js processes and how they handle quotes with shell=true. 
        ],
        userDataDir: USER_DATA_DIR
    };
    if( !settings.windowed ) options.args.push("--start-fullscreen");
    if(process.argv.indexOf(CHROMIUM_ARG) == -1) {
        options.executablePath = LINUX_CHROME_PATH;
    }
    browser = await puppeteer.launch(options);
    let context = await browser.defaultBrowserContext();
    context.overridePermissions("http://" + LOCALHOST, ['microphone','camera']);
    let pages = await browser.pages();
    menuPage = await pages[0];
    menuPage.on('close', () => {
        process.kill(process.pid, SIGTERM);
    });
    pipPage = await browser.newPage();
    await menuPage.bringToFront();
    
    // for pages besides menu and pip, add controller controls
    browser.on( 'targetcreated', async (target) => {
        // inject the javascript to allow for the gamepad to be used as a controller.
        let page = await target.page();
        if( page ) {
            page.on('load', () => {
                addGamepadControls(page);
            });
        }
    } );

    let sambaString = "";
    if( sambaOn ) {
        sambaString = "&smb=" + sambaUrl;
    }

    await menuPage.goto("http://" + LOCALHOST + ":" + STATIC_PORT + "?" + IS_SERVER_PARAM + sambaString);
    ks.sendKey('tab');

    browser.on("targetdestroyed", async function() {
        // If there are no more browse tabs, the browser has been quit
        let pages = await browser.pages();
        if( pages.length <= 2 ) { // only the menu page is open
            browsePage = null; // There is no browse page
            if( isBrowserOrClone(currentSystem) ) {
                blankCurrentGame();
                await menuPage.bringToFront();
            }
        }
        else {
            let currentPage;
            let currentPageIndex = 0;
            // Get the currently visible (active) page
            for(let page of pages) {
                if( await isActivePage(page) ) {
                    currentPage = page;
                    break;
                }
                currentPageIndex ++;
            }
            // If the current page is the menu page, we need to switch it
            while( currentPage.mainFrame()._id === menuPage.mainFrame()._id || currentPage.mainFrame()._id === pipPage.mainFrame()._id ) {
                // there is necessarily at least one other browse tab, since the open pages > 2
                currentPageIndex++;
                if( currentPageIndex >= pages.length ) {
                    currentPageIndex = 0;
                }
                currentPage = pages[currentPageIndex];
            }
            await switchBrowseTab( currentPage.mainFrame()._id );
        }
    });

    //setTimeout( reloadMenuPage, RELOAD_MENU_PAGE_INTERVAL );
}

/**
 * Write settings.
 * @param {Object} settings - The settings object to write.
 */
function writeSettings( settings ) {
    fs.writeFileSync( SETTINGS_PATH, JSON.stringify(settings) );
}

/**
 * Update settings.
 * @param {Object} settings - The settings object to update.
 */
function updateSettings( settings ) {
    let currentSettings = readSettings();
    currentSettings = Object.assign( currentSettings, settings );
    writeSettings( currentSettings );
}

/**
 * Read settings.
 * @returns {Object} The settings object.
 */
function readSettings() {
    if( !fs.existsSync( SETTINGS_PATH ) ) writeSettings({});
    return JSON.parse( fs.readFileSync( SETTINGS_PATH ) );
}

/**
 * Reload the menu page.
 * This is to try to prevent memory leaks.
 * We will add a little more time if we think they are interacting with the server menu page.
 */
async function reloadMenuPage() {
    let interactingWithMenuPage = await menuPage.evaluate( () => isInteractionHappening() );
    if( interactingWithMenuPage || !menuPageIsActive() ) {
        setTimeout( reloadMenuPage, RELOAD_MENU_PAGE_MORE_TIME_NEEDED );
    }
    else {
        let oldMenuPage = menuPage;
        menuPage = await browser.newPage();
        menuPage.goto(oldMenuPage.url());
        oldMenuPage.close(); // we don't need to use closePage since we are not using await
        menuPage.bringToFront();
        setTimeout( reloadMenuPage, RELOAD_MENU_PAGE_INTERVAL );
    }
}

/**
 * Get the current address of the browse page.
 * @returns {Promise<string>} A promise containing the current page or an error message.
 */
async function getUrl() {
    if( !browsePage || browsePage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
    }

    return Promise.resolve(browsePage.url());
}

/**
 * Blank the Onboard keyboard instance.
 */
function blankOnboardInstance() {
    if( onboardInstance ) {
        try {
            proc.execSync(KILL_COMMAND + onboardInstance.pid);
            onboardInstance = null;
        }
        catch(err) {
            console.log(err);
        }
    }
}

/**
 * Add gamepad controls to a page.
 * @param {Page} page - The page to add controls to.
 * @returns {Promise<(boolean|string)>} A promise that is false if the action was successful or contains an error message if not.
 */
async function addGamepadControls( page ) {
    if( !page || page.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
    }

    let alreadyDefined = await page.evaluate( () => typeof guystationMouse !== 'undefined' );
    await page.mouse.click(0,0); // needed for controller to work on start
    if( !alreadyDefined ) { // these functions hang forever if they are already defined (once needed per page context - not on renavigation)
        // move the mouse
        let screenResolution = proc.execSync(GET_RESOLUTION_COMMAND).toString().split("x");
        await page.exposeFunction( "guystationMouse", async (directionX, directionY, button, down) => {
            if( !page || page.isClosed() ) {
                return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
            }

            let gamepadMousePosition = robot.getMousePos();
            let x = gamepadMousePosition.x;
            let y = gamepadMousePosition.y;
            if( directionX === LEFT ) x -= GAMEPAD_MOVE_CURSOR_AMOUNT;
            else if( directionX === RIGHT ) x += GAMEPAD_MOVE_CURSOR_AMOUNT;
            if( directionY === UP ) y -= GAMEPAD_MOVE_CURSOR_AMOUNT;
            else if( directionY === DOWN ) y += GAMEPAD_MOVE_CURSOR_AMOUNT;

            if( x >= screenResolution[0] ) x = screenResolution[0] - 1;
            if( y >= screenResolution[1] ) y = screenResolution[1] - 1;
            if( x <= 0 ) x = 1;
            if( y <= 0 ) y = 1;
            performMouse( x, y, button ? button : LEFT, down );

            return Promise.resolve(false);
        } );

        // scroll
        await page.exposeFunction( "guystationScroll", async (directionX, directionY) => {
            if( !page || page.isClosed() ) {
                return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
            }
            let x = 0;
            let y = 0;
            if( directionX === LEFT ) x -= GAMEPAD_SCROLL_AMOUNT;
            else if( directionX === RIGHT ) x += GAMEPAD_SCROLL_AMOUNT;
            if( directionY === UP ) y -= GAMEPAD_SCROLL_AMOUNT;
            else if( directionY === DOWN ) y += GAMEPAD_SCROLL_AMOUNT;
            await browsePage.evaluate( (x,y) => { window.scrollBy({top: y, left: x}) }, x, y ); // can't use existing scroll, since that is a bulk scroll, where this is quick

            return Promise.resolve(false);
        } );

        // navigate the page
        await page.exposeFunction( "guystationNavigate", async forward => {
            if( !page || page.isClosed() ) {
                return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
            }

            if( forward ) await page.goForward();
            else await page.goBack();

            return Promise.resolve(false);
        });

        // toggle keyboard
        await page.exposeFunction( "guystationToggleKeyboard", async () => {
            if( onboardInstance ) {
                blankOnboardInstance();
            }
            else {
                onboardInstance = proc.spawn( LAUNCH_ONBOARD_COMMAND, {detached: true, stdio: 'ignore'} );
                onboardInstance.on('exit', blankOnboardInstance);
                proc.execSync(ENSURE_FLOAT_ONBOARD_COMMAND);
            }

            return Promise.resolve(false);
        } );

        // switch tabs
        await page.exposeFunction( "guystationSwitchTab", async (forward) => {
            let pages = await browser.pages();
            let currentPage;
            let currentPageIndex = 0;
            // Get the currently visible (active) page
            for(let page of pages) {
                if( await isActivePage(page) ) {
                    currentPage = page;
                    break;
                }
                currentPageIndex ++;
            }
            currentPageIndex += forward ? 1 : -1;
            currentPage = pages[currentPageIndex];
            // If the current page is the menu page, we need to switch it
            while( currentPageIndex < 0 || currentPageIndex >= pages.length || currentPage.mainFrame()._id === menuPage.mainFrame()._id || currentPage.mainFrame()._id === pipPage.mainFrame()._id ) {
                // there is necessarily at least one other browse tab, since the open pages > 2
                if( forward ) {
                    currentPageIndex++;
                    if( currentPageIndex >= pages.length ) {
                        currentPageIndex = 0;
                    }
                }
                else {
                    currentPageIndex--;
                    if( currentPageIndex < 0 ) {
                        currentPageIndex = pages.length - 1;
                    }
                }
                currentPage = pages[currentPageIndex];
            }
            await switchBrowseTab( currentPage.mainFrame()._id );
        } );

        // get joy mapping
        if( !browserControlsCache ) {
            try {
                browserControlsCache = JSON.parse(fs.readFileSync(BROWSER_GAMEPAD_PATH));
            }
            catch(err) {}
        }
        await page.exposeFunction( "guystationGetJoyMapping", () => {
            return browserControlsCache;
        } );
    }

    // accept gamepad input
    await page.evaluate( () => {
        async function guystationGamepadCursor() {
            var GAMEPAD_INTERVAL = 50;
            var GAMEPAD_INPUT_INTERVAL = 10;
            var gamepadInterval;
            var buttonsDown = {}; // keys are buttons numbers or axes number + direction
            var buttonsPressed = {};
            var buttonsUp = {};
            var buttonsReleased = {};
            var joyMapping = await guystationGetJoyMapping();
            if( !joyMapping ) joyMapping = {};

            window.onblur = function() {
                buttonsDown = {};
                buttonsPressed = {};
                buttonsUp = {};
                buttonsReleased = {};
            }

            function buttonDown(b) {
                if (typeof(b) == "object") {
                    return b.pressed;
                }
                return b == 1.0;
            }
            function pollGamepads() {
                var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
                for (var i = 0; i < gamepads.length; i++) {
                    var gp = gamepads[i];
                    if (gp) {
                        manageGamepadInput();
                        clearInterval(gamepadInterval);
                    }
                }
            }
            async function manageGamepadInput() {
                var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
                if(!gamepads || !gamepads[0]) {
                    gamepadInterval = setInterval(pollGamepads, GAMEPAD_INTERVAL);
                    return;
                }
                
                try {
                    for (var i=0; i<gamepads.length; i++) {
                        var gp = gamepads[i];
                        if( !gp ) continue;
        
                        // initialize buttons down
                        if( !(i in buttonsDown) ) {
                            buttonsDown[i] = {};
                            buttonsPressed[i] = {};
                            buttonsUp[i] = {};
                            buttonsReleased[i] = {};
                        }
        
                        // use the names of EZ_EMULATOR_CONFIG_BUTTONS to be consistent
                        if( document.hasFocus() && gp && gp.buttons ) {
        
                            // set all of buttons down on start
                            for( var j=0; j<gp.buttons.length; j++ ) {
                                if( buttonDown(gp.buttons[j]) ) {
                                    // down = down
                                    buttonsDown[i][j] = true;
                                    // pressed = pressed (only occurs once, turns to false if held down, must release to trigger again)
                                    if( buttonsUp[i][j] ) buttonsPressed[i][j] = true;
                                    else buttonsPressed[i][j] = false;
                                    buttonsUp[i][j] = false;
                                    buttonsReleased[i][j] = false;
                                }
                                else {
                                    if( buttonsDown[i][j] ) buttonsReleased[i][j] = true; // released is kind of like pressed - it is the first release
                                    else buttonsReleased[i][j] = false;
                                    buttonsDown[i][j] = false;
                                    buttonsPressed[i][j] = false;
                                    buttonsUp[i][j] = true;
                                }
                            }
                            for( var j=0; j<gp.axes.length; j++ ) {
                                if( Math.abs(gp.axes[j]) > 0.5 ) {
                                    var dir = "-";
                                    var oppDir = "+";
                                    if( gp.axes[j] > 0 ) {
                                        dir = "+";
                                        oppDir = "-";
                                    }
                                    buttonsReleased[i][j + dir] = false;
                                    if(buttonsDown[i][j + oppDir]) buttonsReleased[i][j + oppDir] = true; //  a quick switch from one direction to the other
                                    else buttonsReleased[i][j + oppDir] = false;
        
                                    buttonsDown[i][j + dir] = true;
                                    buttonsDown[i][j + oppDir] = false;
        
                                    if( buttonsUp[i][j + dir] ) buttonsPressed[i][j + dir] = true;
                                    else buttonsPressed[i][j + dir] = false;
                                    buttonsPressed[i][j + oppDir] = false;
        
                                    buttonsUp[i][j + dir] = false;
                                    buttonsUp[i][j + oppDir] = true;
                                }
                                else {
                                    if( buttonsDown[i][j + "+"] ) buttonsReleased[i][j + "+"] = true;
                                    else buttonsReleased[i][j + "+"] = false;
                                    if( buttonsDown[i][j + "-"] ) buttonsReleased[i][j + "-"] = true;
                                    else buttonsReleased[i][j + "-"] = false;
                                    buttonsDown[i][j + "+"] = false;
                                    buttonsDown[i][j + "-"] = false;
                                    buttonsPressed[i][j + "+"] = false;
                                    buttonsPressed[i][j + "-"] = false;
                                    buttonsUp[i][j + "+"] = true;
                                    buttonsUp[i][j + "-"] = true;
                                }
                            }

                            // switch tabs
                            if( joyMapping["R"] && joyMapping["R"].filter(el => buttonsPressed[i][el]).length ) {
                                await guystationSwitchTab(true);
                                break;
                            }
                            if( joyMapping["L"] && joyMapping["L"].filter(el => buttonsPressed[i][el]).length ) {
                                await guystationSwitchTab();
                                break;
                            }
                            // navigate
                            if( joyMapping["R2"] && joyMapping["R2"].filter(el => buttonsPressed[i][el]).length ) {
                                await guystationNavigate(true);
                                break;
                            }
                            if( joyMapping["L2"] && joyMapping["L2"].filter(el => buttonsPressed[i][el]).length ) {
                                await guystationNavigate();
                                break;
                            }
                            // keyboard
                            if( joyMapping["X"] && joyMapping["X"].filter(el => buttonsPressed[i][el]).length ) {
                                await guystationToggleKeyboard();
                                break;
                            }
                            // mouse
                            let directionX, directionY, button, down;
                            if( joyMapping["A"] && joyMapping["A"].filter(el => buttonsPressed[i][el]).length ) {
                                button = "left";
                                down = true;
                            }
                            else if( joyMapping["A"] && joyMapping["A"].filter(el => buttonsReleased[i][el]).length ) {
                                button = "left";
                                down = false;
                            }
                            if( joyMapping["B"] && joyMapping["B"].filter(el => buttonsPressed[i][el]).length ) {
                                button = "right";
                                down = true;
                            }
                            else if( joyMapping["B"] && joyMapping["B"].filter(el => buttonsReleased[i][el]).length ) {
                                button = "right";
                                down = false;
                            }
                            if( (joyMapping["Axis X-"] && joyMapping["Axis X-"].filter(el => buttonsDown[i][el]).length)
                                || (joyMapping["Axis X+"] && joyMapping["Axis X+"].filter(el => buttonsDown[i][el]).length)
                                || (joyMapping["Left"] && joyMapping["Left"].filter(el => buttonsDown[i][el]).length)
                                || (joyMapping["Right"] && joyMapping["Right"].filter(el => buttonsDown[i][el]).length) ) {
                                    if( (joyMapping["Axis X+"] && joyMapping["Axis X+"].filter(el => buttonsDown[i][el]).length)
                                        || (joyMapping["Right"] && joyMapping["Right"].filter(el => buttonsDown[i][el]).length) ) {
                                        directionX = "right";
                                    }
                                    else if( (joyMapping["Left"] && joyMapping["Left"].filter(el => buttonsDown[i][el]).length)
                                        || (joyMapping["Axis X-"] && joyMapping["Axis X-"].filter(el => buttonsDown[i][el]).length) ) {
                                        directionX = "left";
                                    }
                            }
                            if( (joyMapping["Axis Y-"] && joyMapping["Axis Y-"].filter(el => buttonsDown[i][el]).length)
                                || (joyMapping["Axis Y+"] && joyMapping["Axis Y+"].filter(el => buttonsDown[i][el]).length)
                                || (joyMapping["Up"] && joyMapping["Up"].filter(el => buttonsDown[i][el]).length)
                                || (joyMapping["Down"] && joyMapping["Down"].filter(el => buttonsDown[i][el]).length) ) {
                                    if( (joyMapping["Axis Y+"] && joyMapping["Axis Y+"].filter(el => buttonsDown[i][el]).length)
                                        || (joyMapping["Down"] && joyMapping["Down"].filter(el => buttonsDown[i][el]).length) ) {
                                        directionY = "down";
                                    }
                                    else if( (joyMapping["Up"] && joyMapping["Up"].filter(el => buttonsDown[i][el]).length)
                                        || (joyMapping["Axis Y-"] && joyMapping["Axis Y-"].filter(el => buttonsDown[i][el]).length) ) {
                                        directionY = "up";
                                    }
                            }
                            if( directionX || directionY || button || down ) {
                                await guystationMouse(directionX, directionY, button, down);
                                break;
                            }
                            // scroll
                            let scrollX, scrollY;
                            if( (joyMapping["Axis X2+"] && joyMapping["Axis X2+"].filter(el => buttonsDown[i][el]).length)
                                || (joyMapping["Axis X2-"] && joyMapping["Axis X2-"].filter(el => buttonsDown[i][el]).length) ) {
                                if( (joyMapping["Axis X2+"] && joyMapping["Axis X2+"].filter(el => buttonsDown[i][el]).length) ) {
                                    scrollX = "right";
                                }
                                else if( (joyMapping["Axis X2-"] && joyMapping["Axis X2-"].filter(el => buttonsDown[i][el]).length) ) {
                                    scrollX = "left";
                                }
                            }
                            if( (joyMapping["Axis Y2+"] && joyMapping["Axis Y2+"].filter(el => buttonsDown[i][el]).length)
                                || (joyMapping["Axis Y2-"] && joyMapping["Axis Y2-"].filter(el => buttonsDown[i][el]).length) ) {
                                if( (joyMapping["Axis Y2+"] && joyMapping["Axis Y2+"].filter(el => buttonsDown[i][el]).length) ) {
                                    scrollY = "down";
                                }
                                else if( (joyMapping["Axis Y2-"] && joyMapping["Axis Y2-"].filter(el => buttonsDown[i][el]).length) ) {
                                    scrollY = "up";
                                }
                            }
                            if( scrollX || scrollY ) {
                                await guystationScroll(scrollX, scrollY);
                            }
                        }
                    }
                }
                catch( err ) {
                    console.log(err);
                    gamepadInterval = setInterval(pollGamepads, GAMEPAD_INTERVAL);
                    return;
                }
                setTimeout(manageGamepadInput, GAMEPAD_INPUT_INTERVAL);
            }
            gamepadInterval = setInterval(pollGamepads, GAMEPAD_INTERVAL);
        }
        guystationGamepadCursor();
    });
}

/**
 * Navigate to a url.
 * @param {string} url - The url to navigate to.
 * @returns {Promise<(boolean|string)>} A promise that is false if the action was successful or contains an error message if not.
 */
async function navigate( url ) {
    if( !browsePage || browsePage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
    }

    try {
        await browsePage.goto( url ) ;
    }
    catch(err) {
        try {
            await browsePage.goto( HTTP + url );
        }
        catch(err) {
            await browsePage.goto(GOOGLE_SEARCH_URL + url);
        }
    }
    return Promise.resolve(false);
}

/**
 * Refresh a url.
 * @returns {Promise<(boolean|string)>} A promise that is false if the action was successful or contains an error message if not.
 */
async function refresh() {
    if( !browsePage || browsePage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
    }

    try {
        await browsePage.goto( browsePage.url() ) ;
    }
    catch(err) {}
    return Promise.resolve(false);
}

/**
 * Scroll the browser page up or down.
 * @param {string} direction - The direction to scroll.
 * @returns {Promise<(boolean|string)>} A promise that is false if the action was successful or contains an error message if not.
 */
async function scroll(direction) {
    if( !browsePage || browsePage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
    }
    if( !direction || (direction != UP && direction != DOWN) ) {
        return Promise.resolve( ERROR_MESSAGES.browseInvalidDirection ) ;
    }

    let scrollAmount = SCROLL_AMOUNT_MULTIPLIER;
    if( direction == UP ) {
        scrollAmount =  -SCROLL_AMOUNT_MULTIPLIER;
    }

    try {
        await browsePage.evaluate( (scrollAmount) => { window.scrollBy(0, scrollAmount * window.innerHeight) }, scrollAmount );
    }
    catch(err) {}
    return Promise.resolve(false);
}

/**
 * Go forward in the browser.
 * This function will be a no-op if the browser cannot go forward.
 * @returns {Promise<(boolean|string)>} A promise that is false if the action was successful or contains an error message if not.
 */
async function goForward() {
    if( !browsePage || browsePage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
    }

    try {
        await browsePage.goForward();
    }
    catch(err) {}
    return Promise.resolve(false);
}

/**
 * Go back in the browser.
 * This function will be a no-op if the browser cannot go back.
 * @returns {Promise<(boolean|string)>} A promise that is false if the action was successful or contains an error message if not.
 */
async function goBack() {
    if( !browsePage || browsePage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
    }

    try {
        await browsePage.goBack();
    }
    catch(err) {}
    return Promise.resolve(false);
}

/**
 * Launch a browse tab.
 * @param {string} url - The url to launch the browse tab to.
 * @param {Array<string>} script - An array of strings to be evaluated on the browse page.
 * @returns {Promise<boolean>} A promise containing false when completed.
 */
async function launchBrowseTab( url, script ) {
    browsePage = await browser.newPage();
    try {
        await browsePage.goto(url ? url : HOMEPAGE);
        if( script ) {
            for( let scriptLine of script ) {
                for( let i=0; i<BROWSE_LINE_TRIES; i++ ) {
                    await browsePage.waitFor(BROWSE_SCRIPT_INTERVAL);
                    try {
                        await browsePage.evaluate(scriptLine);
                        break;
                    }
                    catch(err) {/*ok*/}
                }
            }
        }
    }
    catch(err) {};
    return Promise.resolve(false);
}

/**
 * Check if a page is active.
 * @param {Page} page - The puppeteer page to check is active.
 * @returns {Promise<boolean>} A promise containing true if the page is visible or false if it is not.
 */
async function isActivePage(page) {
    return Promise.resolve(await page.evaluate(() => {return document.visibilityState == 'visible'} ));
}

/**
 * Get the currently open browse tabs.
 * @returns {Promise<(Array<Object>|string)>} A promise that contains an array of object with titles and ids or an error message if there is an error.
 */
async function getBrowseTabs() {
    if( !browsePage || browsePage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
    }

    let response = [];
    let pages = await browser.pages();
    for( let page of pages ) {
        if( page.mainFrame()._id !== menuPage.mainFrame()._id && page.mainFrame()._id !== pipPage.mainFrame()._id ) {
            try {
                let title = await page.title();
                let data = { title: title, id: page.mainFrame()._id };
                if( await isActivePage(page) ) {
                    data.active = true;
                }
                response.push( data );
            }
            catch(err) {}
        }
    }

    return Promise.resolve(response);
}

/**
 * Close a page.
 * Newer versions of puppeteer seem to hang on trying to close
 * pages in older versions of Chrome. They close the page, but they
 * just never complete the function. So we use a promise race to create
 * a timeout.
 * @param {Page} page - The page to close.
 * @returns {Promise} The promise that resolves once the page is closed or there is a timeout.
 */
function closePage( page ) {
    return Promise.race([
        page.close(),
        new Promise( (resolve, reject) => setTimeout(() => resolve(), CLOSE_PAGE_TIMEOUT) )
    ]);
}

/**
 * Close a browse tab.
 * @param {string} id - The id of the tab to close.
 * @returns {Promise<(boolean|string)>} A promise that is false if the action was successful or contains an error message if not.
 */
async function closeBrowseTab(id) {
    if( !browsePage || browsePage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
    }

    let pages = await browser.pages();
    for( let page of pages ) {
        if( page.mainFrame()._id === id && page.mainFrame()._id !== menuPage.mainFrame()._id && page.mainFrame()._id !== pipPage.mainFrame()._id ) {
            try {
                await closePage( page );
            }
            catch(err) {}
            return Promise.resolve(false);
        }
    }

    return Promise.resolve( ERROR_MESSAGES.browsePageNotFound );
}

/**
 * Close all tabs for browsing.
 * @returns {Promise<(boolean|string)>} A promise that is false if the action was successful or contains an error message if not.
 */
async function closeBrowseTabs() {
    if( !browsePage || browsePage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
    }

    // Close all the non-menu pages
    let pages = await browser.pages();
    for( let page of pages ) {
        if( page.mainFrame()._id !== menuPage.mainFrame()._id && page.mainFrame()._id !== pipPage.mainFrame()._id ) {
            try {
                await closePage( page );
            }
            catch(err) {/*ok*/}
        }
    }
    await menuPage.bringToFront();

    return Promise.resolve(false);
}

/**
 * Switch the current browse tab.
 * @param {string} id - The id of the tab to switch to.
 * @returns {Promise<(boolean|string)>} A promise that is false if the action was successful or contains an error message if not.
 */
async function switchBrowseTab(id) {
    if( menuPage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
    }

    let pages = await browser.pages();
    for( let page of pages ) {
        if( page.mainFrame()._id === id && page.mainFrame()._id !== menuPage.mainFrame()._id && page.mainFrame()._id !== pipPage.mainFrame()._id ) {
            await page.bringToFront();
            browsePage = page;
            return Promise.resolve(false);
        }
    }

    return Promise.resolve( ERROR_MESSAGES.browsePageNotFound );
}


/**************** Data Functions ****************/

/**
 * Generate data about available options to the user.
 * The result is cached.
 * This should be called again if the file structure is edited.
 * @param {boolean} [startup] - True if called on startup.
 * @param {boolean} [noPlaying] - True if no playing indiciation should be made.
 */
function getData( startup, noPlaying ) {
    // Reset the data
    systemsDict = {};

    function setSystemsDictHash() {
        systemsDictHash = hash(systemsDict);
        let systemsDictNoSessions = JSON.parse(JSON.stringify(systemsDict));
        for( let system in systemsDictNoSessions ) {
            deleteKeyRecursive(systemsDictNoSessions[system].games, "sessions");
        }
        systemsDictHashNoSessions = hash( systemsDictNoSessions );
    }

    // samba mode, rather than reading files on a remote server (slow), ask for the information we need from the samba host
    if( sambaOn ) {
        try {
            // get this from the samba url
            let json = syncFetch( HTTP + sambaUrl + ":" + PORT + "/data?noPlaying=1" ).json();
            systemsDict = json.systems;

            // also need to set playing to false for all items ...
            if( currentSystem && !currentGame ) {
                systemsDict[currentSystem].playing = true;
            }
            else if( currentSystem && currentGame ) {
                let currentParents = currentParentsString.split(SEPARATOR).filter(el => el != '');
                let gameDictEntry = getGameDictEntry(currentSystem, currentGame, currentParents);
                // If the current game is a playlist, set it's parent (the playlist) to playing
                if( currentParents.length ) {
                    let parentGameDictEntry = getGameDictEntry(currentSystem, currentParents.slice(currentParents.length-1)[0], currentParents.slice(0, currentParents.length-1));
                    if( parentGameDictEntry.isPlaylist ) {
                        gameDictEntry = parentGameDictEntry;
                    }
                }
                gameDictEntry.playing = true;
            }
            setSystemsDictHash();
            return;
        }
        catch(err) {
            console.log(err);
        }
    }

    // Read all the systems
    let systems = fs.readdirSync( SYSTEMS_DIR_FULL );
    // For each system
    for( let system of systems ) {
        // Read the metadata
        let systemData = JSON.parse( fs.readFileSync( generateMetaDataLocation(system) ).toString().replace(new RegExp(USER_PLACEHOLDER, "g"), desktopUser) );
        // The key is the name of the system
        systemData.system = system;

        // Read all the games
        let games = [];
        let gamesDir = generateGamesDir(system);
        try {
            games = fs.readdirSync(generateGamesDir(system), {withFileTypes: true}).filter(file => file.isDirectory()).map(dir => dir.name);
        }
        catch( err ) {
            fs.mkdirSync( gamesDir );
        }
        // Create the games dictionary - the key will be the name of the game
        let gamesDict = generateGames( system, games, [], startup, noPlaying );
        
        // Set the games for this system
        systemData.games = gamesDict;

        if( !noPlaying && isBeingPlayed( system, null, [] ) ) systemData.playing = true;

        // Add this system to the dictionary of systems
        systemsDict[system] = systemData;
    }

    setSystemsDictHash();
}

/**
 * Delete key recursive from a systemsDict like object.
 * @param {Array<Object>} - An array of game objects.
 * @param {string} key - The key to delete.
 */
function deleteKeyRecursive(games, key) {
    for( let gameName in games ) {
        let game = games[gameName];
        delete game[key];
        if( game.isFolder ) {
            deleteKeyRecursive(game.games, key);
        }
    }
}

/**
 * Generate the information about games for a system.
 * This function calls itself recusively to find subdirectories.
 * @param {string} system - The system the games are on.
 * @param {Array<string>} games - The games we want to look at (likely just everything in the games folder).
 * @param {Array<string>} [parents] - An array of parent folders.
 * @param {boolean} startup - True if called on startup.
 * @param {boolean} noPlaying - True if no playing indicator should be added.
 * @returns {Object} An object containing games for a system or for a a specific set of parents within a system.
 */
function generateGames(system, games, parents=[], startup, noPlaying) {
    let gamesDict = {};
    // For each of the games
    for( let game of games ) {
        // copy the parents array so other calls don't mess it up
        let curParents = parents.slice(0);
        // Create an object the hold the game data
        let gameData = {};
        gameData.game = game;
        
        // Get the contents of the games directory
        let gameDirContents = fs.readdirSync(generateGameDir(system, game, curParents));
        try {
            // This line will throw the error if there is no metadata file
            var metadataFileContents = JSON.parse(fs.readFileSync(generateGameMetaDataLocation(system, game, curParents)));
            gameData.rom = metadataFileContents.rom;
            gameData.installer = metadataFileContents.installer;
            gameData.romCandidates = metadataFileContents.romCandidates;
            gameData.isPlaylist = metadataFileContents.isPlaylist;
            gameData.sessions = metadataFileContents.sessions;
            if( metadataFileContents.siteUrl ) {
                gameData.siteUrl = metadataFileContents.siteUrl;
                if( metadataFileContents.script ) {
                    gameData.script = metadataFileContents.script;
                }
            }
            if( metadataFileContents.status ) gameData.status = metadataFileContents.status;
            if( metadataFileContents.percent ) gameData.percent = metadataFileContents.percent;
            if( gameData.isPlaylist ) {
                var tempCurParents = curParents.slice(0);
                tempCurParents.push(game);
                gameData.games = generateGames(system, gameDirContents.filter((name) => name != METADATA_FILENAME), tempCurParents, startup, noPlaying);
                if( Object.keys(gameData.games).length == 0 ) {
                    deleteGame( MEDIA, game, curParents, true, true ); // will not call getData
                    continue; // don't include in the json
                }
            }
            else {
                try {
                    fetchGameData( system, game, curParents, metadataFileContents );
                    if( metadataFileContents.cover ) gameData.cover = metadataFileContents.cover;
                    if( metadataFileContents.releaseDate ) gameData.releaseDate = metadataFileContents.releaseDate;
                    if( metadataFileContents.name ) gameData.name = metadataFileContents.name;
                    if( metadataFileContents.summary ) gameData.summary = metadataFileContents.summary;
                }
                catch(err) { /*ok*/ }
            }

            // this will only ever be for a real game - only things we want to save will be at this point
            if( startup && gameData.status == STATUS_DOWNLOADING ) {
                updateGameMetaData( system, game, curParents, {
                    status: STATUS_ROM_FAILED,
                    percent: null
                } );
            }
        }
        catch(err) {
            if( !gameData.isPlaylist ) {
                // This is a directory of games - there is no metadata file
                var tempCurParents = curParents.slice(0);
                tempCurParents.push(game);
                gameData.isFolder = true;
                gameData.games = generateGames(system, gameDirContents, tempCurParents, startup, noPlaying);
            }
        }

        if( !gameData.isFolder && !gameData.isPlaylist ) {
            let savesInfo = generateSaves(system, game, curParents);
            gameData.currentSave = savesInfo.currentSave;
            gameData.saves = savesInfo.savesDict;

            // If this game is being played, indicate as such
            if( !noPlaying && isBeingPlayed( system, game, curParents ) ) {
                gameData.playing = true;
            }
        }
        else if( gameData.isPlaylist ) {
            // similar to isBeingPlayedRecursive by gameDict isn't loaded yet
            // so we can't use that
            let tempParents = parents.slice(0);
            tempParents.push(game);
            for( let childGame of Object.keys(gameData.games) ) {
                if( !noPlaying && isBeingPlayed(system, childGame, tempParents) ) {
                    gameData.playing = true; // we will have two items playing with a playlist
                    break;
                }
            }
        }

        // Add this game to the dictionary of games for this system
        gamesDict[game] = gameData;
    }
    return gamesDict;
}

/**
 * Generate the information about saves for a game.
 * This function will create data (and files) if necessary.
 * @param {string} system - The system the game is on.
 * @param {string} game - The game we want to get saves information for.
 * @param {Array<string>} parents - An array of parent folders for a game.
 * @returns {Object} An object with a currentSave key containing the current save and a savesDict key containing the saves information.
 */
function generateSaves( system, game, parents ) {
    let savesDir = generateSavesDir(system, game, parents);
    let saves = [];
    // Try to read all the saves in the saves directory
    // save states are handled from within the emulator itself
    try {
        saves = fs.readdirSync(savesDir, {withFileTypes: true}).filter(file => file.isDirectory() && file.name != SCREENSHOTS_DIR).map(dir => dir.name);
    }
    // If there is no saves directory, make one and make a default save
    catch(err) {
        fs.mkdirSync(savesDir); // create the saves directory
    }
    // We need at least one save
    if( saves.length == 0 ) {
        // Force the save update, becase systemsDict won't be updated to pass the error check yet,
        // and since we're doing it, there won't be any errors.
        newSave( system, game, DEFAULT_SAVE_DIR, true, parents ); // create a default save directory
        changeSave( system, game, DEFAULT_SAVE_DIR, true, parents );
        saves.push( DEFAULT_SAVE_DIR );
    }

    // Create the dictionary for saves
    let savesDict = {};
    // Get the contents of the screenshots for the save
    for( let save of saves ) {
        let screenshotsDir = generateScreenshotsDir(system, game, save, parents);
        let saveData = {};
        saveData.save = save;
        saveData.screenshots = [];

        // Get the screenshots
        try {
            saveData.screenshots =  fs.readdirSync(screenshotsDir);
        }
        // Make the screenshots directory if it doesn't exist
        catch(err) {
            fs.mkdirSync(screenshotsDir);
        }

        // Add the save to the saves directory
        savesDict[save] = saveData;
    }

    let currentSave = getCurrentSave(system, game, parents);
    // if the current save isn't working -- i.e. the symlink is messed up, get another one.
    // we know there will be at least one, since if there were 0 we already created one
    if( !currentSave ) {
        // force in case we just created a directory
        changeSave( system, game, saves[0], true, parents );
        currentSave = getCurrentSave(system, game, parents);
    }

    return { savesDict: savesDict, currentSave: currentSave };
}

/**
 * Generate the full directory for a system.
 * @param {string} system - The system to get the directory of.
 * @returns {string} The directory of the system (e.g. /home/user/guystation/systems/gba).
 */
function generateSystemDir(system) {
    return SYSTEMS_DIR_FULL + SEPARATOR + system;
}

/**
 * Generate the metadata location for a system.
 * @param {string} system - the system to get metadata for.
 * @returns {string} The metadata file location for a system (e.g. /home/user/guystation/systems/gba/metadata.json).
 */
function generateMetaDataLocation(system) {
    return generateSystemDir(system) + SEPARATOR + METADATA_FILENAME;
}

/**
 * Generate the full directory for games of a system.
 * @param {string} system - The system the game is on.
 * @returns {string} The directory of the system games (e.g. /home/user/guystation/systems/gba/games).
 */
function generateGamesDir(system) {
    return generateSystemDir(system) + SEPARATOR + GAMES_DIR;
}

/**
 * Generate the full directory for a game.
 * @param {string} system - The system the game is on.
 * @param {string} game - The game to get the directory of.
 * @param {Array<string>} [parents] - Parent directories for the game.
 * @returns {string} The directory of the game (e.g. /home/user/guystation/systems/gba/games/super-mario-world).
 */
function generateGameDir(system, game, parents) {
    let parentsPart = "";
    if( parents && parents.length ) {
        parentsPart = SEPARATOR + parents.join(SEPARATOR);
    }
    return generateGamesDir(system) + parentsPart + SEPARATOR + game;
}

/**
 * Generate the full path for a ROM.
 * @param {string} system - The system the game is on.
 * @param {string} game - The game to get the ROM for.
 * @param {string} rom - The ROM's filename.
 * @param {Array<string>} [parents] - Parent directories for the game.
 * @returns {string} The ROM filepath for the game (e.g. /home/user/guystation/systems/gba/games/super-mario-world/mario-world.gba).
 */
function generateRomLocation(system, game, rom, parents) {
    if( rom && rom.match(/^\//) ) return rom; // absolute path
    return generateGameDir(system, game, parents) + SEPARATOR + rom;
}

/**
 * Generate the full path for the metadata of a game.
 * @param {string} system - The system the game is on.
 * @param {string} game - The game.
 * @param {Array<string>} [parents] - Parent directories for the game.
 * @returns {string} The metadata filepath for the game (e.g. /home/user/guystation/systems/gba/games/super-mario-world/metadata.json).
 */
function generateGameMetaDataLocation(system, game, parents) {
    return generateGameDir(system, game, parents) + SEPARATOR + METADATA_FILENAME;
}

/**
 * Update a games metadata.
 * To delete a key, set its value to null.
 * @param {string} system - The system the game is on.
 * @param {string} game - The game.
 * @param {Array<string>} [parents] - Parent directories for the game.
 * @param {Object} content - The content to merge with the current metadata.
 */
function updateGameMetaData(system, game, parents, content) {
    let metadataLocation = generateGameMetaDataLocation(system, game, parents);
    let currentMetadataContents = {};
    if(fs.existsSync(metadataLocation)) currentMetadataContents = JSON.parse(fs.readFileSync( metadataLocation ));
    currentMetadataContents = Object.assign( currentMetadataContents, content );
    for( let key in currentMetadataContents ) {
        if( currentMetadataContents[key] === null || currentMetadataContents[key] === undefined ) {
            delete currentMetadataContents[key];
        }
    }
    fs.writeFileSync( metadataLocation, JSON.stringify(currentMetadataContents) );
}

/**
 * Generate the full directory for game saves.
 * @param {string} system - The system the game is on.
 * @param {string} game - The game to get the directory of.
 * @param {Array<string>} [parents] - Parent directories for the game.
 * @returns {string} The directory of the game saves (e.g. /home/user/guystation/systems/gba/games/super-mario-world/saves).
 */
function generateSavesDir(system, game, parents) {
    return generateGameDir(system, game, parents) + SEPARATOR + SAVES_DIR;
}

/**
 * Generate the full directory for a game save.
 * @param {string} system - The system the game is on.
 * @param {string} system - The game the save if for.
 * @param {string} save - The save directory to get.
 * @param {Array<string>} [parents] - Parent directories for the game.
 * @returns {string} The directory of the save (e.g. /home/user/guystation/systems/gba/games/super-mario-world/saves/default).
 */
function generateSaveDir(system, game, save, parents) {
    return generateSavesDir(system, game, parents) + SEPARATOR + save;
}

/**
 * Generate the full directory for the screenshots for a save.
 * @param {string} system - The system the game is on.
 * @param {string} system - The game the screenshots are for.
 * @param {string} save - The save directory.
 * @param {Array<string>} [parents] - Parent directories for the game.
 * @returns {string} The directory of the screenshots (e.g. /home/user/guystation/systems/gba/games/super-mario-world/saves/default/screenshots).
 */
function generateScreenshotsDir(system, game, save, parents) {
    return generateSaveDir(system, game, save, parents) + SEPARATOR + SCREENSHOTS_DIR;
}

/**
 * Get the entry of systems dict for a game.
 * @param {string} system - The system the game is on.
 * @param {string} game - The game the entry we want are for.
 * @param {Array<string>} parents - Parent directories for the game.
 * @returns {(null|Object)} An object representing the game or null if one is not found.
 */
function getGameDictEntry(system, game, parents) {
    if( !system || !game ) {
        return null;
    }
    let games = systemsDict[system].games;
    let parentsCopy = parents.slice(0);
    while( parentsCopy && parentsCopy.length ) {
        try {
            games = games[parentsCopy.shift()].games;
        }
        catch(err) {
            return null; // Used for adding sub symlinks
        }
    }
    return games[game];
}

/**
 * Determine if the system is a browser system or a browser clone.
 * @param {string} system - The system. 
 * @returns {boolean} True if the system is browser or a clone.
 */
function isBrowserOrClone( system ) {
    return system === BROWSER || system === STREAM;
}

/**
 * Launch a game.
 * @param {string} system - The system to run the game on.
 * @param {string} [game] - The game to run. This is null if we just want to launch the emulator.
 * @param {boolean} [restart] - If true, the game will be reloaded no matter what. If false, and the game is currently being played, it will just be brought to focus.
 * @param {Array<string>} [parents] - An array of parent folders for a game.
 * @param {boolean} [dontSaveResolution] - True if we should not save the home menu resolution.
 * @returns {Promise<(boolean|string)>} A promise containing an error message if there was an error, or false if there was not.
 */
async function launchGame(system, game, restart=false, parents=[], dontSaveResolution) {

    let useInstaller = false;
    let noGame = false;
    if( game === null && system != MEDIA ) {
        noGame = true;
    }

    // Error check
    let gameDictEntry;
    if( !noGame ) {
        let isInvalid = isInvalidGame( system, game, parents );
        if( isInvalid ) {
            return Promise.resolve(isInvalid);
        }
        gameDictEntry = getGameDictEntry(system, game, parents);
        if( gameDictEntry.status == STATUS_DOWNLOADING ) {
            return Promise.resolve(ERROR_MESSAGES.romNotYetDownloaded);
        }
        else if( gameDictEntry.status == STATUS_ROM_FAILED ) {
            return Promise.resolve(ERROR_MESSAGES.romFailedDownload);
        }
        if( !fs.existsSync(generateRomLocation( system, game, gameDictEntry.rom, parents )) && !isBrowserOrClone(system) && !gameDictEntry.isPlaylist ) {
            if( !gameDictEntry.installer || !fs.existsSync(generateRomLocation( system, game, gameDictEntry.installer, parents )) ) {
                return Promise.resolve(ERROR_MESSAGES.noRomFile);
            }
            else {
                useInstaller = true;
            }
        }
        else if( system == MEDIA && (!menuPage || menuPage.isClosed())) {
            return Promise.resolve(ERROR_MESSAGES.menuPageClosed);
        }
        else if( isBrowserOrClone(system) && !gameDictEntry.siteUrl ) {
            return Promise.resolve(ERROR_MESSAGES.noUrl);
        } 
    }
    else if( !systemsDict[system] ) return ERROR_MESSAGES.noSystem;

    // Call on the first child if this is a playlist
    if( !noGame && gameDictEntry.isPlaylist ) {
        let tempParents = parents.slice(0);
        tempParents.push( game );
        // see if any of the tracks are currently being played and call launch on them if they are
        let startIndex = 0;
        let index = 0;
        for( let game of Object.keys(gameDictEntry.games) ) {
            if( isBeingPlayed(system, game, tempParents) ) {
                startIndex = index;
                break;
            }
            index ++;
        }
        return Promise.resolve( launchGame(system, Object.keys(gameDictEntry.games)[startIndex], false, tempParents ) );
    }

    // We need to keep track of these variables to determine if we need to renegotiate a screencast
    let oldSystem = currentSystem;
    let menuPageWasActive = menuPageIsActive();
    let startedGame = false;
    let currentResolution = proc.execSync(GET_RESOLUTION_COMMAND).toString();

    // Restart unless restart is false, we have a current emulator, and we are playing the game we selected
    let fullScreenTries = MAX_ACTIVATE_TRIES;
    let activateTries = MAX_ACTIVATE_TRIES;
    if( !isBeingPlayed(system, game, parents) || restart || !currentEmulator ) {
        await quitGame();
        
        // for screencast
        currentResolution = properResolution;
        startedGame = true;

        let command = systemsDict[system].command;
        if( noGame && systemsDict[system].frontendCommand ) command = systemsDict[system].frontendCommand;

        if( isBrowserOrClone(system) ) {
            let gameDictEntry = getGameDictEntry( system, game, parents );
            await launchBrowseTab( noGame ? null : gameDictEntry.siteUrl, !noGame && gameDictEntry.script ? gameDictEntry.script : null );
            currentSystem = system;
            currentGame = game;
            currentParentsString = parents.join(SEPARATOR);
            currentEmulator = true; // Kind of hacky... but will pass for playing
            currentGameStart = Date.now();
            startUpdatePlaytime();
            updateMute();
            return Promise.resolve(false);
        }
        else if( system == MEDIA ) {
            await launchRemoteMedia( system, game, parents );
            currentSystem = system;
            currentGame = game;
            currentParentsString = parents.join(SEPARATOR);
            currentEmulator = true; // Kind of hacky... but will pass for playing
            currentGameStart = Date.now();
            startUpdatePlaytime();
            updateMute();
            return Promise.resolve(false);
        }

        // Get the screen dimensions
        if( !dontSaveResolution && !properResolution ) saveCurrentResolution();

        // If the symlink to the save directory is the same for all games, update the symlink from
        // the all games folder to this specific game.
        // Also update it if it uses NAND symlinks at all. This will account for if we've
        // copied files onto a system or used SAMBA to share files and we're starting a game.
        if( !noGame && systemsDict[system].nandPathCommand ) {
            updateNandSymlinks( system, game, null, parents );
        }

        let arguments = [];

        if( !noGame ) {
            let romName = getGameDictEntry(system, game, parents)[useInstaller ? "installer" : "rom"];
            let romLocation = generateRomLocation( system, game, romName, parents );
            // for pc samba if the user is different for the home directory
            romLocation = romLocation.replace(/^\/home\/[^\/]+/,"/home/"+desktopUser);
            arguments.push( systemsDict[system].romOnly ? romName : romLocation );

            if( systemsDict[system].saveDirFlag ) {
                if( systemsDict[system].optionPrefix ) { arguments.push( systemsDict[system].optionPrefix ); }
                arguments.push(systemsDict[system].saveDirFlag);

                let saveDir = generateSaveDir( system, game, CURRENT_SAVE_DIR, parents );
                // for space seperated arguments, add to arguments
                if( systemsDict[system].saveDirArgType == SPACE ) {
                    arguments.push(saveDir);
                }
                // otherwise edit the argument
                else {
                    arguments[arguments.length-1] += systemsDict[system].saveDirArgType + saveDir;
                }
            }

            if( systemsDict[system].screenshotsDirFlag ) {
                if( systemsDict[system].optionPrefix ) { arguments.push( systemsDict[system].optionPrefix ); }
                arguments.push( systemsDict[system].screenshotsDirFlag );
                let screenshotsDir = generateScreenshotsDir( system, game, CURRENT_SAVE_DIR, parents );
                // for space seperated arguments, add to arguments
                if( systemsDict[system].screenshotsDirArgType == SPACE ) {
                    arguments.push(screenshotsDir + SEPARATOR);
                }
                // otherwise edit the argument
                else {
                    arguments[arguments.length-1] += systemsDict[system].screenshotsDirArgType + screenshotsDir + SEPARATOR;
                }
            }

            if( systemsDict[system].extraFlags ) {
                arguments = arguments.concat( systemsDict[system].extraFlags.map( el => el.replace(GAME_DIRECTORY_PLACEHOLDER, generateGameDir(system, game, parents)) ) );
            }

            if( systemsDict[system].argsFirst ) {
                arguments.push(arguments[0]);
                arguments.shift();
            }
        }

        currentEmulator = proc.spawn( command, arguments, {detached: true, stdio: 'ignore'} );
        updateMute();
        currentEmulator.on('exit', blankCurrentGame);

        currentGame = game;
        currentSystem = system;
        currentParentsString = parents.join(SEPARATOR);
        currentGameStart = Date.now();
        startUpdatePlaytime();
        updateTwitchStream();

        // PC, check for installation.
        if( system === SYSTEM_PC && gameDictEntry && !gameDictEntry.installer ) {
            try {
                startPcChangeLoop();
            }
            catch(err) {
                // ok - likely first time setup
            }
        }

        if( !noGame && (systemsDict[system].fullScreenButtons ) ) {
            activateTries = 1; // We know the program since we waited until we could full screen
            // I guess the only time this would come into play is if we failed to full screen
            // due to this program not opening. I think it is best we don't wait another X tries
            // in that case.
            for( let i=0; i<fullScreenTries; i++ ) {
                try {
                    proc.execSync( systemsDict[system].activateCommand );
                    if( systemsDict[system].fullScreenButtons ) {
                        ks.sendCombination( systemsDict[system].fullScreenButtons );
                    }
                    break;
                }
                catch(err) { 
                    console.log("full screen failed.");
                    proc.execSync( SLEEP_COMMAND );
                }
            }
        }

        // now that we are fullscreen, save the proper emulator resolution
        // If this fails, it might will blank in which case we can get it again later
        properEmulatorResolution = null;
        // saveCurrentEmulatorResolution();
        // We actually don't want to do this here, and it will consistenly fail. We'll either get the right resolution
        // when we screencastPrepare, or when we see the window is hidden in the failsafe (what we'd do anyway if this failed).
    }

    if( systemsDict[system].activateCommand ) {
        let command = systemsDict[system].activateCommand;
        if( noGame && systemsDict[system].frontendActivateCommand ) command = systemsDict[system].frontendActivateCommand;
        
        for( let i=0; i<activateTries; i++ ) {
            try {
                proc.execSync( command );
                updateMute();
                break;
            }
            catch(err) { 
                console.log("activate failed."); 
                proc.execSync( SLEEP_COMMAND );
            }
        }
        try {
            resumeGame();
            if( currentGameStart === null ) {
                currentGameStart = Date.now();
                startUpdatePlaytime();
            }
        }
        catch(err) {/*ok*/}
    }
    else if( isBrowserOrClone(system) ) {
        if ( browsePage && !browsePage.isClosed() ) {
            updateMute();
            browsePage.bringToFront();
            if( currentGameStart === null ) {
                currentGameStart = Date.now();
                startUpdatePlaytime();
            }
        }
    }
    else if( system == MEDIA ) {
        if( menuPage && !menuPage.isClosed() ) {
            updateMute();
            resumeRemoteMedia();
            if( currentGameStart === null ) {
                currentGameStart = Date.now();
                startUpdatePlaytime();
            }
        }
    }

    // failsafe fullscreen and activate
    // keep trying in the background to activate and 
    // mupen didnt always fullscreen again after refocus on screenshare refocus especially
    // It also liked to minimize if started too ealy
    clearInterval(continueInterval);
    if( systemsDict[system].fullScreenFailsafe && !noGame ) {
        let failsafeTries = 0;
        // this interval will be cleared if we go home or quit the game.
        // until that point, just keep forcing it open
        continueInterval = setInterval( function() {
            if( failsafeTries >= fullScreenTries ) clearInterval(continueInterval);
            try {
                let currentWindowStatus = proc.execSync(systemsDict[system].failsafeStateCheck).toString();;
                
                // For some reason Mupen is not resized when in starts some times,
                // but from tests, it consistently reports the right resolution after a while
                // This seems to be when we need to call this
                // It's when this is true that we can get the proper resolution from the get resolution command
                // and if it is true, we likely didn't have the proper resolution before
                // This was discovered from testing - before this point (following startup), wrong resolution or no resolution, at this point, right resolution
                // This will only happen if we click screenshare really quickly after starting. 
                // We know we will hit this point at least once, because starting screenshare really quickly causes the emulator to be hidden.
                // If we have waited a while after startup, we'll simply get the right resolution in screencastPrepare,
                // we'll never hit this hidden state.
                if(currentWindowStatus.includes(HIDDEN_STATE)) {
                    saveCurrentEmulatorResolution();
                }

                let shouldRenegotiate = false;
                if( currentResolution != properEmulatorResolution ) {
                    if( (oldSystem != SYSTEM_N64 || menuPageWasActive || startedGame) && currentSystem == SYSTEM_N64 && startedClientIds.length ) {
                        shouldRenegotiate = true;
                    }
                    else {
                        // this is done in renegotiation
                        proc.execSync(SET_RESOLUTION_COMMAND + properEmulatorResolution);
                    }
                }
                if(!currentWindowStatus.includes(FULLSCREEN_STATE) ) {
                    proc.execSync(systemsDict[system].fullScreenFailsafe);
                }
                if(currentWindowStatus.includes(HIDDEN_STATE)) {
                    proc.execSync(systemsDict[system].activateCommand);
                }

                // we only need to renegotiate on resolution changes and when we are not already on the n64/started a new game
                if( shouldRenegotiate ) {
                    renegotiate();
                }

                currentResolution = proc.execSync(GET_RESOLUTION_COMMAND).toString();
            }
            catch(err) {}
            failsafeTries++;
        }, FAILSAFE_TRIES_INTERVAL );
    }

    await ensurePipNotFullscreen();

    return Promise.resolve(false);
}

/**
 * Quit the game currently being played.
 * @returns {Promise<(boolean|string)>} A promise containing an error message if there was an error or false if there was not.
 */
async function quitGame() {

    clearInterval(continueInterval); // put this here just to be safe

    if(currentEmulator) {
        if(!isBrowserOrClone(currentSystem) && currentSystem != MEDIA) {
            currentEmulator.removeListener('exit', blankCurrentGame);
            try {
                // First perform a normal kill command. This can trigger a save for some emulators.
                if( systemsDict[currentSystem].killFirst ) {
                    try {
                        try {
                            proc.execSync( RESUME_COMMAND + currentEmulator.pid );
                        }
                        catch(err) {
                            console.log(err);
                        }
                        proc.execSync( KILL_FIRST_COMMAND + currentEmulator.pid );
                        proc.execSync( SLEEP_HALF_COMMAND );
                    }
                    catch(err) {
                        console.log(err);
                    }
                }
                proc.execSync( KILL_COMMAND + currentEmulator.pid );
            }
            catch(err) {
                console.log(err);
                /* This is probably because the process quit without us knowing */
            }
            ensureProperResolution();
        }
        else if( currentSystem == MEDIA ) {
            let errorMessage = await closeRemoteMedia();
            if( errorMessage ) return Promise.resolve(errorMessage);
        }
        else if( browsePage && !browsePage.isClosed() ) {
            await closeBrowseTabs();
        }
        currentEmulator = null;
        currentGame = null;
        currentParentsString = null;
        currentSystem = null;
        currentGameStart = null;
        stopUpdatePlaytime();
        updateTwitchStream();

        await menuPage.bringToFront(); // for pip
        return Promise.resolve(false);
    }
    else {
        return Promise.resolve(ERROR_MESSAGES.noRunningGame);
    }
}

/**
 * Blank all the values from the current game.
 */
function blankCurrentGame() {
    clearInterval(continueInterval); // put this here just to be safe
    pcChangeClear = setTimeout( () => clearInterval(pcChangeLoop), WATCH_FOLDERS_INTERVAL * 5); // stop looking for pc game changes - give some time to find installed files

    currentGame = null;
    currentSystem = null;
    currentParentsString = null;
    currentEmulator = null;
    currentGameStart = null;
    stopUpdatePlaytime();

    blankOnboardInstance();
}

/**
 * Start updating the playtime.
 */
function startUpdatePlaytime() {
    stopUpdatePlaytime();
    if( !currentEmulator || !currentSystem || !currentGame ) return;
    updatePlaytime();
    currentPlaytimeInterval = setInterval( updatePlaytime, UPDATE_PLAYTIME_INTERVAL );
}

/**
 * Stop updating the playtime.
 */
function stopUpdatePlaytime() {
    clearInterval( currentPlaytimeInterval );
}

/**
 * Update playtime for the current game.
 */
function updatePlaytime() {
    if( !currentEmulator || !currentSystem || !currentGame ) return;
    let currentParents = currentParentsString.split(SEPARATOR).filter(el => el != '');
    let sessions = JSON.parse( fs.readFileSync( generateGameMetaDataLocation( currentSystem, currentGame, currentParents ) ) ).sessions;
    if( !sessions ) sessions = [];
    if( prevGameStart != currentGameStart ) {
        prevGameStart = currentGameStart;
        sessions.push( [currentGameStart,currentGameStart] );
    }
    sessions[sessions.length - 1][1] = Date.now();
    updateGameMetaData( currentSystem, currentGame, currentParents, { sessions: sessions } );
}

/**
 * Check if a game is currently being played.
 * @param {string} system - The system of the game to see if it's being played.
 * @param {string} game - The game to check if it's being played.
 * @param {Array<string>} parents - An array of parent folders for a game.
 * @returns {boolean} True if the game is being played; false if it is not.
 */
function isBeingPlayed(system, game, parents) {
    return (currentSystem == system && currentGame == game && parents.join(SEPARATOR) == currentParentsString && currentEmulator);
}

/**
 * Check if anything within a folder (not playlist) is being played.
 * @param {string} system - The system of the game to see if it's being played.
 * @param {string} game - The game to check if it's being played.
 * @param {Array<string>} parents - An array of parent folders for a game.
 * @returns {boolean} True if the game is being played; false if it is not.
 */
function isBeingPlayedRecursive(system, folder, parents) {
    let curGameDictEntry = getGameDictEntry(system, folder, parents);
    for( let game of Object.keys(curGameDictEntry.games) ) {
        let gameDict = curGameDictEntry.games[game];
        let curParents = parents.slice(0);
        curParents.push(folder);
        if( !gameDict.isFolder ) {
            if ( isBeingPlayed(system, gameDict.game, curParents) ) return true;
        }
        else {
            if (isBeingPlayedRecursive(system, game, curParents)) return true;
        }
    }
    return false;
}

/**
 * Get the current save for a game.
 * @param {string} system - The system the game is for.
 * @param {string} game - The game to get the current save for.
 * @param {Array<string>} parents - An array of parent folders for a game.
 * @returns {(boolean|string)} The name of the current save or false if the save couldn't be fetched.
 */
function getCurrentSave(system, game, parents) {

    let currentSaveDir = generateSaveDir( system, game, CURRENT_SAVE_DIR, parents );

    try {
        let readLink = fs.readlinkSync( currentSaveDir );
        if( !fs.existsSync(readLink) ) {
            return false;
        }
        return path.basename( readLink );
    }
    catch( err ) {
        return false;
    }

}

/**
 * Create a new save.
 * @param {string} system - The system the game is on.
 * @param {string} game - The game to create a save for.
 * @param {string} save - The name of the new save.
 * @param {boolean} force - Skip error check.
 * @param {Array<string>} [parents] - An array of parent folders for a game.
 * @returns {(boolean|string)} An error message if there was an error, otherwise false.
 */
function newSave(system, game, save, force, parents=[]) {

    if( !force ) {
        // Error check
        var invalidName = isInvalidName( save );
        if( invalidName ) return invalidName;
        // Make sure the game is valid
        let isInvalid = isInvalidGame( system, game, parents );
        if( isInvalid ) return isInvalid;
        // This name is reserved (current)
        if( save == CURRENT_SAVE_DIR ) {
            return ERROR_MESSAGES.usingReservedSaveName;
        }
        // Make sure the name is not already being used
        if( getGameDictEntry(system, game, parents).saves[save] ) {
            return ERROR_MESSAGES.saveAlreadyExists;
        }
        // Make sure there is a save
        if( !save ) return ERROR_MESSAGES.saveNameRequired;
    }

    // Create a new save directory
    fs.mkdirSync( generateSaveDir( system, game, save, parents ) );
    // Create the screenshots directory for the save
    // Since we don't want spoilers for other saves, keep screenshots save specific
    fs.mkdirSync( generateScreenshotsDir( system, game, save, parents ) );

    return false;
}

/**
 * Update a save.
 * This function only allows a name to be updated. A save can't be transferred inter-game.
 * @param {string} system - The system the game is on.
 * @param {string} game - The game to create a save for.
 * @param {Array<string>} [parents] - An array of parent folders for a game.
 * @param {string} oldSave - The name of the old save.
 * @param {string} save - The new name of the save.
 * @returns {(boolean|string)} An error message if there was an error, otherwise false.
 */
function updateSave(system, game, parents=[], oldSave, save) {

    // Everything the same is a no-op like updateGame
    if( save == oldSave ) return false;

    // Error check
    var invalidName = isInvalidName( save );
    if( invalidName ) return invalidName;
    // Make sure the game is valid
    let isInvalid = isInvalidGame( system, game, parents );
    if( isInvalid ) return isInvalid;
    // This name is reserved (current)
    if( save == CURRENT_SAVE_DIR ) {
        return ERROR_MESSAGES.usingReservedSaveName;
    }
    // Make sure the name is not already being used
    if( getGameDictEntry(system, game, parents).saves[save] ) {
        return ERROR_MESSAGES.saveAlreadyExists;
    }
    // Make sure there is a save
    if( !save ) return ERROR_MESSAGES.saveNameRequired;
    // Make sure the old save exists
    if( !getGameDictEntry(system, game, parents).saves[oldSave] ) {
        return ERROR_MESSAGES.saveDoesNotExist;
    }

    // update the symlinks
    let currentSave = getCurrentSave( system, game, parents );

    // move the save directory
    let oldSaveDir = generateSaveDir( system, game, oldSave, parents );
    let saveDir = generateSaveDir( system, game, save, parents );
    fsExtra.moveSync( oldSaveDir, saveDir );

    if( currentSave == oldSave ) {
        // force is true since gamedict hasn't been updated
        changeSave( system, game, save, true, parents );
    }

    return false;
}

/**
 * Switch the current save.
 * @param {string} system - The system the game is on.
 * @param {string} game - The game to change saves for.
 * @param {string} save - The name of the save.
 * @param {boolean} force - Skip error check.
 * @param {Array<string>} [parents] - An array of parent folders for a game.
 * @returns {(boolean|string)} An error message if there was an error, otherwise false.
 */
function changeSave(system, game, save, force, parents=[]) {

    if( !force ) {
        // Error check
        var invalidName = isInvalidName( save );
        if( invalidName ) return invalidName;
        // Make sure the game is valid
        let isInvalid = isInvalidGame( system, game, parents );
        if( isInvalid ) return isInvalid;
        // Can't change the save of a playing game
        if( isBeingPlayed( system, game, parents ) ) {
            return ERROR_MESSAGES.gameBeingPlayed;
        }
        // We need the save file to exist
        if( !getGameDictEntry(system, game, parents).saves[save] ) {
            return ERROR_MESSAGES.saveDoesNotExist;
        }
        if( getGameDictEntry(system, game, parents).currentSave == save ) {
            return ERROR_MESSAGES.saveAlreadySelected;
        }
    }

    let currentSaveDir = generateSaveDir( system, game, CURRENT_SAVE_DIR, parents );
    // Remove the current symlink
    try {
        fs.unlinkSync( currentSaveDir );
    }
    catch(err) {} // OK, just means there was no current symlink

    // Symlink the current save
    fs.symlinkSync( generateSaveDir( system, game, save, parents ), currentSaveDir, 'dir');

    return false;
}

/**
 * Delete a save.
 * @param {string} system - The name of the system.
 * @param {string} game - The name of the game.
 * @param {string} save - The name of the save.
 * @param {Array<string>} [parents] - An array of parent folders for a game.
 * @returns {(boolean|string)} - An error message if there was an error, otherwise false.
 */
function deleteSave(system, game, save, parents=[]) {

    // Error check
    var invalidName = isInvalidName( save );
    if( invalidName ) return invalidName;
    // Make sure the game is valid
    let isInvalid = isInvalidGame( system, game, parents );
    if( isInvalid ) return isInvalid;
    // Can't change the save of a playing game
    if( isBeingPlayed( system, game, parents ) ) {
        return ERROR_MESSAGES.gameBeingPlayed;
    }
    // We need the save file to exist
    if( !getGameDictEntry(system, game, parents).saves[save] ) {
        return ERROR_MESSAGES.saveDoesNotExist;
    }

    let savesDir = generateSavesDir( system, game, parents );
    let saveDir = generateSaveDir( system, game, save, parents );

    // Delete the save
    rimraf.sync( saveDir );
        
    // Check if the symbolic link is now broken
    let currentSave = getCurrentSave( system, game, parents );
    if( !currentSave ) {

        // If it is, try to switch to the default directory
        let defaultSaveDir = generateSaveDir( system, game, DEFAULT_SAVE_DIR, parents );
        if( fs.existsSync( defaultSaveDir ) ) {
            changeSave( system, game, DEFAULT_SAVE_DIR, null, parents );
        }
        // If the default directory does not exist, try to switch to any other save
        else {
            let currentSaves = fs.readdirSync(savesDir, {withFileTypes: true}).filter(file => file.isDirectory()).map(dir => dir.name);
            if( currentSaves.length ) {
                changeSave( system, game, currentSaves[0], null, parents );
            }
            // Otherwise, create the default directory and switch to that save
            else {
                // force is true, since we know there is no other directory and we know we want to make the save
                newSave( system, game, DEFAULT_SAVE_DIR, true, parents );
                changeSave( system, game, DEFAULT_SAVE_DIR, true, parents );
            }
        }
        
    }

    return false;
}

/**
 * Add a game.
 * @param {string} system - The system to add the game on.
 * @param {string} game - The game name to add.
 * @param {(object|string)} [file] - The file object (from upload) or a url path.
 * @param {Array<string>} [parents] - An array of parent folders for a game.
 * @param {boolean} [isFolder] - True if we are actually making a folder.
 * @param {boolean} [isPlaylist] - True if the game is a playlist (will function similarly to a folder).
 * @param {Array<Array<string>>} [playlistItems] - The items in the playlist.
 * @param {boolean} [isSymlink] - True if the game is a symlink to another game.
 * @param {Object} [symlink] - Information about the symlink.
 * @param {string} [symlink.system] - The system the game this will symlink to is on.
 * @param {string} [symlink.game] - The game this will symlink to.
 * @param {Array<string>} [symlink.parents] - The parents of the game this will symlink to.
 * @param {boolean} [force] - True if the symlink validity check should be skipped.
 * @returns {(boolean|string)} An error message if there was an error, false if there was not.
 */
function addGame( system, game, file, parents=[], isFolder, isPlaylist, playlistItems, isSymlink, symlink, force ) {

    // Error check
    // Make sure the game is valid
    if( !force ) {
        if( !systemsDict[system] ) return ERROR_MESSAGES.noSystem;
        if( getGameDictEntry(system, game, parents) ) return ERROR_MESSAGES.gameAlreadyExists;
        if( !isSymlink && parents.length && !getGameDictEntry(system, parents[parents.length-1], parents.slice(0, parents.length-1) ) ) return ERROR_MESSAGES.invalidParents;
        if( !game ) return ERROR_MESSAGES.gameNameRequired;
        var invalidName = isInvalidName( game );
        if( invalidName ) return invalidName;
        if( (!file || (typeof file != STRING_TYPE && (!file.path || !file.originalname))) && !isFolder && !isPlaylist && !isSymlink ) return ERROR_MESSAGES.romFileRequired;
        if( typeof file === STRING_TYPE && file.match(/^\//) && !fs.existsSync(file) ) return ERROR_MESSAGES.invalidFilepath;
        if( isPlaylist && system != MEDIA ) return ERROR_MESSAGES.playlistsOnlyForMedia;
        if( (!playlistItems || !playlistItems.length) && isPlaylist ) return ERROR_MESSAGES.playlistItemsRequired;
        if( isPlaylist ) {
            let playlistItemsError = errorCheckValidPlaylistItems( playlistItems );
            if( playlistItemsError ) return playlistItemsError;
        }
        if( isSymlink && !getGameDictEntry(symlink.system, symlink.game, symlink.parents)) return ERROR_MESSAGES.invalidSymlink;
    }

    // This is the function to run once we are done and have the rom.
    let runWhenDone = function() {
        // Update the data (this will take care of making all the necessary directories for the game as well as updating the data)
        if( !force ) getData();

        if( !isFolder && !isPlaylist && !isSymlink ) {
            // Do this AFTER running get data, so we know we are all set with the save directories
            updateNandSymlinks(system, game, null, parents);
        }
    };

    // Make the directory for the game
    if( !isSymlink ) {
        let gameDir = generateGameDir( system, game, parents );
        fs.mkdirSync( gameDir );

        // regular game
        if( !isFolder && !isPlaylist ) {

            let errorMessage;
            // browser, we just append the siteUrl to the metadata.json
            if(isBrowserOrClone(system)) {
                if( typeof file == STRING_TYPE )
                    fs.writeFileSync(generateGameMetaDataLocation(system, game, parents), JSON.stringify({"siteUrl": file}));
                else {
                    try {
                        let uploadedContent = fs.readFileSync(file.path);
                        let uploadedJson = JSON.parse(uploadedContent);
                        if( !uploadedJson.siteUrl ) errorMessage = ERROR_MESSAGES.siteUrlRequired;
                        fs.writeFileSync(generateGameMetaDataLocation(system, game, parents), uploadedContent);
                    }
                    // invalid JSON file
                    catch(err) {
                        errorMessage = ERROR_MESSAGES.invalidSiteJson;
                    }
                }
            }
            else {
                // Move the rom into the directory
                // We don't need a promise for this one
                // and the async failure has a different behavior than the sync one
                // Async, we'll just note the ROM download failed to the user as opposed to deleting the game
                // immediately.
                if( typeof file == STRING_TYPE && file.match(/^\//) ) fs.writeFileSync(generateGameMetaDataLocation(system, game, parents), JSON.stringify({"rom": file}));
                else if( typeof file == STRING_TYPE ) errorMessage = downloadRom( file, system, game, parents, runWhenDone );
                else errorMessage = saveUploadedRom( file, system, game, parents );
            }
            if( errorMessage ) {
                // Delete the game directory
                rimraf.sync( gameDir );
                // Return the error message
                return errorMessage;
            }
        }
        else if( isPlaylist ) {
            addSymlinksToPlaylist( system, game, parents, playlistItems );
        }
    }
    else if( isSymlink ) {
        // create the symlink
        fs.symlinkSync( generateGameDir( symlink.system, symlink.game, symlink.parents ), generateGameDir( system, game, parents ), 'dir' );
    }

    // Update the data (this will take care of making all the necessary directories for the game as well as updating the data)
    // browser uses strings, but it doesn't perform a download
    if( typeof file != STRING_TYPE || isBrowserOrClone(system) || file.match(/^\//) ) runWhenDone();
    else if( !force ) getData(); // Run get data now, so we can have an updated gamesDict even if we haven't finished downloading yet

    return false;
}

/**
 * Check if playlist items are valid.
 * @param {Array<Array<string>>} playlistItems - The items in the playlist.
 * @returns {(boolean|string)} An error message if there was an error, otherwise false.
 */
function errorCheckValidPlaylistItems( playlistItems ) {
    for( let playlistItem of playlistItems ) {
        if( !playlistItem.length ) {
            return ERROR_MESSAGES.invalidPlaylistItem;
        }
        let gameDictEntry = getGameDictEntry( MEDIA, playlistItem[playlistItem.length-1], playlistItem.slice(0, playlistItem.length-1));
        if( !gameDictEntry ) {
            return ERROR_MESSAGES.invalidPlaylistItem;
        }
        if( gameDictEntry.isFolder ) {
            return ERROR_MESSAGES.addFolderToPlaylist;
        }
        if( gameDictEntry.isPlaylist ) {
            return ERROR_MESSAGES.addPlaylistToPlaylist;
        }
    }
    return false;
}

/**
 * Add symlinks (tracks) to a playlist.
 * @param {string} system - The system for the playlist.
 * @param {string} game - The name of the playlist.
 * @param {Array<string>} parents - The parents of the playlist.
 * @param {Array<Array<string>} playlistItems - The items in the playlist.
 */
function addSymlinksToPlaylist( system, game, parents, playlistItems ) {
    let parentsOfSymlinks = parents.slice(0);
    parentsOfSymlinks.push(game); // there is no check for parents existence in the gameDict addGame
    let indexPrefix = "0".repeat(playlistItems.length); // this will preserve order
    for( let playlistItem of playlistItems ) {
        // The name is the order, plus the seperator, plus the items path (parents + game) joined by the separator
        let symlinkName =  indexPrefix + PLAYLIST_SEPERATOR + playlistItem.join(PLAYLIST_SEPERATOR);
        addGame( system, symlinkName, null, parentsOfSymlinks, false, false, null, true, {
            system: system,
            game: playlistItem[playlistItem.length-1],
            parents: playlistItem.slice(0, playlistItem.length-1)
        }, true );
        indexPrefix = indexPrefix.slice(0, -1);
    }
    // Make note that it is a playlist
    updateGameMetaData( system, game, parents, { isPlaylist: true } );
}

/**
 * Delete playlist symlinks.
 * @param {string} system - The system for the playlist.
 * @param {string} game - The name of the playlist.
 * @param {Array<string>} parents - The parents of the playlist.
 */
function deletePlaylistSymlinks( system, game, parents ) {
    let playlist = getGameDictEntry( system, game, parents );
    let parentsOfSymlinks = parents.slice(0);
    parentsOfSymlinks.push(game);
    for( let game of Object.keys(playlist.games) ) {
        deleteGame( system, game, parentsOfSymlinks, true );
    }
}

/**
 * Get all the symlinks to an item.
 * Calls itself recursively.
 * @param {string} system - The system the item is on (media).
 * @param {string} game - The name of the item.
 * @param {Array<string>} [parents] - The parents of the item.
 * @param {Array<string>} curGames - The current list of games (e.g. systemsDict[system].games) in the search.
 * @param {Array<string>} [curParents] - The current parents in the search.
 * @param {Array<Object>} [gameDictEntries] - An array that will be populated with the gameDictEntries and ultimately returned.
 * @returns {Array<Object>} An array of gameDictEntries that are the symlinks to the item - these are special and will have their own .parents defined.
 */
function getAllSymlinksToItem( system, game, parents=[], curGames=[], curParents=[], gameDictEntries=[] ) {
    for( let curGame of Object.keys(curGames) ) {
        let curGameDictEntry = curGames[curGame];
        if( curGameDictEntry.isFolder ) {
            let tempCurParents = curParents.slice(0);
            tempCurParents.push(curGame);
            getAllSymlinksToItem( system, game, parents, curGameDictEntry.games, tempCurParents, gameDictEntries );
        }
        // found a playlist, check for matches
        else if( curGameDictEntry.isPlaylist ) {
            for( let curTrack of Object.keys(curGameDictEntry.games) ) {
                let curTrackEntry = curGameDictEntry.games[curTrack];
                // see if the track is a symlink to the item
                let curTrackPath = curTrackEntry.game.split(PLAYLIST_SEPERATOR);
                curTrackPath.shift();
                let gamePath = parents.slice(0);
                gamePath.push(game);
                // We assume they are the same system
                if( JSON.stringify(gamePath) == JSON.stringify(curTrackPath) ) {
                    let curTrackEntryCopy = JSON.parse(JSON.stringify(curTrackEntry) );
                    let tempCurParents = curParents.slice(0);
                    tempCurParents.push(curGame);
                    curTrackEntryCopy.parents = tempCurParents;
                    gameDictEntries.push( curTrackEntryCopy );
                }
            }
        }
    }
    
    return gameDictEntries;
}

/**
 * Get the NAND save path for a game on a system that requires a specific structure.
 * @param {string} system - The system the game is on.
 * @param {string} game - The name of the game.
 * @param {Array<string>} [parents] - An array of parent folders for a game.
 * @returns {string} The path or an empty string if there is none.
 */
function getNandPath( system, game, parents ) {
    if( systemsDict[system].nandPathCommand ) {
        let nandPathCommand = systemsDict[system].nandPathCommand.replace(NAND_ROM_FILE_PLACEHOLDER, generateRomLocation( system, game, getGameDictEntry(system, game, parents).rom, parents ).replace("'", "'\"'\"'"));
        let nandSavePath = proc.execSync(nandPathCommand).toString().replace("\n","");
        if( systemsDict[system].badNandPath && nandSavePath === systemsDict[system].badNandPath ) return "";
        return nandSavePath;
    }
    return "";
}

/**
 * Update the save symlinks to the NAND folders for systems that need a specific file structure in place for saves.
 * Some systems like the Wii and 3DS require a specific file structure for saves
 * as such, we have to make a symlink from that directory to the current directory in systems
 * On add game, we'll look to see if the title currently has any save data in it, and copy it if it does
 * When we update a game, if the name is changed, the current symlink will break and will have to be updated
 * When we update a game, if the rom is changed, the save path is changed, and we'll want to do what we do on create
 *      except we'll want to place what we have currently in the directory of the old rom and remove any symlink
 * @param {string} system - The system the game is on
 * @param {string} game - The name of the game
 * @param {Array<string>} parents - an array of parent folders for a game
 */
function updateNandSymlinks( system, game, oldRomNandPath, parents ) {
    // Make sure this is a system with the special file structure needed
    if( systemsDict[system].nandPathCommand ) {
        let nandSavePath = getNandPath( system, game, parents );
        if( !nandSavePath ) return;
        let currentSaveDir = generateSaveDir( system, game, CURRENT_SAVE_DIR, parents );

        // If the rom file has changed, we want to leave behind our current save data in the old rom location
        // because it will not work with the new rom. To do this, we'll have to remove the old symlink, make a directory,
        // and move the current save's contents
        if( oldRomNandPath && fs.existsSync(oldRomNandPath) ) {
            // The oldRom path will be a symlink that may or may not be broken (depending on if the name changed)
            try {
                fs.unlinkSync(oldRomNandPath);
            }
            catch(err) { /*I don't know why it wouldn't be a symlink, but they could have been messing with the files*/}
            // Make a directory
            try {
                fs.mkdirSync(oldRomNandPath);
            }
            catch(err) {/*should be ok*/}
            let currentSaveDirContents = fs.readdirSync(currentSaveDir);
            // Place the current save contents in the old rom's directory, and we should have no save content
            // in our guystation save directory now
            for( let currentFile of currentSaveDirContents ) {
                if( currentFile != "screenshots" ) {
                    fsExtra.moveSync( currentSaveDir + SEPARATOR + currentFile, nandSavePath + SEPARATOR + currentFile );
                }
            }
        }

        let isSymbolicLink = false;
        try {
            let lstat = fs.lstatSync(nandSavePath);
            isSymbolicLink = lstat.isSymbolicLink();
        }
        catch(err) {/*ok*/}
        // If there is an existing save for the new rom
        if( fs.existsSync(nandSavePath) || isSymbolicLink ) {
            // check if it is a symlink
            // this would be the case if we updated the game name only and we're looking at the same directory
            // no need to try to copy files (from what is now a broken link)
            if( !isSymbolicLink ) {
                // We found some current contents in an actual directory (add game or rom file changed)
                // Move the contents of the directory to our new directory
                // Basically, there was a non-guystation save for the game
                let currentFiles = fs.readdirSync(nandSavePath);
                for(let currentFile of currentFiles) {
                    fsExtra.moveSync( nandSavePath + SEPARATOR + currentFile, currentSaveDir + SEPARATOR + currentFile );
                }
                // Delete the current directory, we'll add a symlink
                rimraf.sync( nandSavePath );
            }
            else {
                // Unlink the old broken symlink
                // There is a case where the link might not be broken
                // If we are adding/updating a new game with a rom we already have.
                // This is kind of silly to do, but it this is the case, we'll basically
                // just be taking over the game with the rom and getting rid of the existing symlinks.
                // The data will be safe in their guystation directories.
                // We can't have two guystation games linked to the same game in the NAND structure, so
                // the user will have to deal with that manually.
                // The link would also be broken if we are readding a game we once broke if we didn't take care
                // of that in deleteGame
                // This will also occur when we have to update symlinks for systems like the PSP
                // in which there is no per-game directory, so we have to update the savedata directory
                // whenever we change games. The savedata directory will be a symlink from one game and then
                // it will be replaced by another game.
                fs.unlinkSync( nandSavePath );
            }
        }
        // Make the necessary directories to set up nandSavePath
        // try /home, /home/james, /home/james/.local, etc.
        let nandSavePathParts = nandSavePath.split(SEPARATOR);
        for( let i=2; i<nandSavePathParts.length; i++ ) {
            let currentParts = [];
            for( let j=0; j<i; j++ ) {
                currentParts.push( nandSavePathParts[j] );
            }
            let path = currentParts.join(SEPARATOR);

            // make the directory if it does not exist
            if( path && !fs.existsSync(path) ) {
                fs.mkdirSync(path);
            }
        }
        // Now, create the symlink
        fs.symlinkSync( currentSaveDir, nandSavePath, 'dir');
    }
}

/**
 * Save an uploaded file.
 * @param {Object} file - A file object from the upload.
 * @param {string} system - The system the game is on.
 * @param {string} game - The game the ROM is for.
 * @param {Array<string>} parents - An array of parent folders for a game.
 * @returns {(boolean|string)} An error message if there was an error, false if there was not.
 */
function saveUploadedRom( file, system, game, parents ) {
    if( !file.originalname || !file.path ) {
        return ERROR_MESSAGES.noFileInUpload;
    }
    let invalidFileName = isInvalidFileName(file.originalname);
    if( invalidFileName ) return invalidFileName;
    if( !fs.existsSync(generateGameDir(system, game, parents)) ) {
        return ERROR_MESSAGES.locationDoesNotExist;
    }
    let romLocation = generateRomLocation(system, game, file.originalname, parents);
    fs.renameSync(file.path, romLocation);

    updateGameMetaData( system, game, parents, {rom: file.originalname} );
    if( (system === SYSTEM_PC || system === SYSTEM_DOS) && !shouldNotExtract(file.originalname) ) { // PC games may be zipped as they require multiple files.
        // copy files
        fs.renameSync( romLocation, DOWNLOAD_PC_PREFIX );
        fs.copyFileSync( DOWNLOAD_PC_PREFIX, PC_BACKUP_LOCATION );
        pcUnpacking = true;
        // this will not leave zip, but we'll copy it back if we don't find an installer candidate, so there is still a rom
        unpackGetLargestFile( DOWNLOAD_PC_PREFIX, DOWNLOAD_PC_PREFIX + TMP_FOLDER_EXTENSION, false, true, generateGameDir(system, game, parents) ).then( (obj) => {
            if( obj.filename ) {
                let writeObj = {
                    rom: obj.filename
                };
                if( obj.candidates && obj.candidates.length ) writeObj.romCandidates = obj.candidates;
                updateGameMetaData( system, game, parents, writeObj );
                fs.unlinkSync( PC_BACKUP_LOCATION );
            }
            else {
                // if we never got round to deleting it due to error, do it now
                if( fs.existsSync(DOWNLOAD_PC_PREFIX) ) fs.unlinkSync( DOWNLOAD_PC_PREFIX );
                fs.renameSync( PC_BACKUP_LOCATION, romLocation );
            }
            pcUnpacking = false;
        } );
    }

    return false;
}

/**
 * Download a rom.
 * @param {string} url - The url of the ROM. 
 * @param {string} system - The system to download the game for.
 * @param {string} game - The game the ROM is for.
 * @param {Array<string>} parents - An array of parent folders for a game.
 * @param {Function} callback - A callback function to run when the ROM finishes downloading.
 * @param {Promise} waitPromise - A promise to wait to resolve before running async.
 * @param {string} oldSystem - The old system name.
 * @param {string} oldGame - The old game name.
 * @param {Array<string>} parents - The old parents name.
 * @returns {(boolean|string)} An error message if there was an error, false if there was not.
 */
function downloadRom( url, system, game, parents, callback, waitPromise, oldSystem, oldGame, oldParents ) {
    if( !validUrl.isUri(url) ) {
        return ERROR_MESSAGES.invalidUrl;
    }
    try {
        // Since this is synchronous, gameDictEntry will be updated when we call getData at the end of add/update.
        // At this point, we haven't called getData yet, so we need to use the old names
        updateGameMetaData(oldSystem ? oldSystem : system, oldGame ? oldGame : game, oldParents ? oldParents : parents, {"status": STATUS_DOWNLOADING, "percent": 0});

        downloadRomBackground( url, system, game, parents, callback, waitPromise );
        return false;
    }
    catch(err) {
        return ERROR_MESSAGES.downloadRomError;
    }        

}

/**
 * Continue to download a ROM in the background.
 * Checks first if the url is a YouTube or video link, and if so uses that.
 * If not, it will try to download the file. 
 * If the file is a zip file, we will unzip it and look for the largest binary file
 * and guess that is the ROM.
 * @param {string} url - The url of the ROM. 
 * @param {string} system - The system to download the game for.
 * @param {string} game - The game the ROM is for.
 * @param {Array<string>} parents - An array of parent folders for a game.
 * @param {Function} callback - A callback function to run when the ROM finishes downloading.
 * @param {Promise} waitPromise - A promise to wait to resolve before we can run.
 * @returns {boolean} Returns false upon completion.
 */
async function downloadRomBackground( url, system, game, parents, callback, waitPromise ) {

    // This will allow updateGame to finish moving around all the directories
    // We will be free to call getData and to use the new system, game and parents.
    // Before calling getData though, we should make sure we're request locked
    // so that the user isn't doing something else
    // It's better not to have to wait for requestLocked until the end, so we can
    // be done with the download when the request lock is available
    if( waitPromise ) await waitPromise;

    // First, look for a good place to temporarily store the downloaded tile
    let index = 0;
    while( fs.existsSync(DOWNLOAD_ROM_PREFIX + index) ) {
        index++;
    }
    let tmpFilePath = DOWNLOAD_ROM_PREFIX + index;
    let tmpFileStream = fs.createWriteStream(tmpFilePath);
    let filename = "";
    let candidates = null;

    // Then, try to get the file from YouTube DL
    // Upon testing, this downloads the file even if it is not a YouTube video
    let rom = youtubedl(url);
    
    let size = 0;
    rom.on("info", (info) => {
        filename = info._filename;
        size = info.size;
    } );

    let pos = 0;
    let prevPercent = 0;
    rom.on('data', function data(chunk) {
        // we aren't going to call getData here, because we don't want to wait for it
        // we will however, update the data entry if there is one and file
        // There should be a data entry fairly soon as addGame and updateGame call them
        // once everything else is done.
        pos += chunk.length
        // 'size' should not be 0 here.
        if (size) {
            let percent = Math.round(pos / size * 100);
            if( percent - UPDATE_PERCENT_MINIMUM > prevPercent ) {
                prevPercent = percent;
                let metadataContents = JSON.parse(fs.readFileSync(generateGameMetaDataLocation(system, game, parents)));
                // still downloading
                if( metadataContents.status == STATUS_DOWNLOADING ) {
                    updateGameMetaData( system, game, parents, {"status": STATUS_DOWNLOADING, "percent": percent} );
                    let gameDictEntry = getGameDictEntry(system, game, parents);
                    if( gameDictEntry ) {
                        gameDictEntry.status = STATUS_DOWNLOADING;
                        gameDictEntry.percent = percent;
                    }
                }
            }
        }
    });

    let errorFunction = async function() {
        tmpFileStream.close();
        fs.unlinkSync(tmpFilePath); // Delete the file
        updateGameMetaData( system, game, parents, {status: STATUS_ROM_FAILED});
        // Note that although for addGame we usually would check for the force option before calling getData
        // we know that force is only ever true when adding a symlink, and a symlink will never have a download
        // so we can call getData here.
        await requestLockedPromise();
        requestLocked = true;
        getData();
        requestLocked = false;
    }

    rom.on("error", errorFunction);

    rom.pipe(tmpFileStream);

    // we've downloaded a YouTube video, so save it to the right location
    rom.on("end", async function() {
        tmpFileStream.end();

        try {
            let tmpFolderPath = tmpFilePath + TMP_FOLDER_EXTENSION;

            if( !shouldNotExtract(url) ) {
                let obj = null;
                if( system === SYSTEM_PC || system === SYSTEM_DOS ) {
                    obj = await unpackGetLargestFile( tmpFilePath, tmpFolderPath, false, true, generateGameDir(system, game, parents) );
                    if( obj.candidates && obj.candidates.length ) {
                        candidates = obj.candidates;
                    }
                }
                else obj = await unpackGetLargestFile( tmpFilePath, tmpFolderPath, true );
                filename = obj.filename;

            }
        }
        catch(err) {
            // ok
            // the non-archive error should be caught in the unpack function, but leave this here for safety
        }

        try {
            let tmpFileExists = fs.existsSync(tmpFilePath);
            if( tmpFileExists || system === SYSTEM_PC || system === SYSTEM_DOS ) {
                // If tmp file exists, it either wasn't a pc game, or it wasn't deleted, because it is already an executable (we didn't extract folder contents and clean up)
                if( tmpFileExists ) {
                    // no filename, means we should just use the file, we didn't extract and find a "largest file", just use the file
                    if( !filename ) {
                        filename = path.basename(urlLib.parse(url).pathname);
                    }
                    fs.renameSync( tmpFilePath, generateRomLocation(system, game, filename, parents) );
                    // getData(); - should be in all the callbacks
                }
                let writeObj = {
                    "rom": filename,
                    "status": null,
                    "percent": null
                }
                if( candidates ) writeObj.romCandidates = candidates;
                updateGameMetaData( system, game, parents, writeObj );

                if( callback ) {
                    await requestLockedPromise();
                    requestLocked = true;
                    callback();
                    requestLocked = false;
                }
            }
        }
        catch(err) {
            console.log(err);
            errorFunction(); // clean up
        }

    });
    return false;
}

/**
 * Determine if the file should not be extracted.
 * @param {string} file - The file name.
 * @return {boolean} - True if we should not extract.
 */
function shouldNotExtract( file ) {
    return (file.match(/\.exe$/i) || file.match(/\.iso$/i) || file.match(/\.msi$/i));// don't extract exes and iso
}

/**
 * Unzip an archive file and return the largest file in the folder.
 * @param {String} file - The file to unzip. 
 * @param {String} folder - The folder to place the files.
 * @param {boolean} [deleteFolder] - true if the folder should be deleted and largest file extracted to the original location of file
 * @param {boolean} [installersOnly] - true if only pc installers should be considered.
 * @param {string} [copyFolderContentsPath] - the folder contents should be copied to this location, and the file and folder deleted
 * @returns {Promise<Object>} - A promise containing and object with keys for the filename and an array of candidates.
 */
async function unpackGetLargestFile( file, folder, deleteFolder=false, installersOnly=false, copyFolderContentsPath ) {

    let filename = null;
    let candidates = [];
    let extractPromise = new Promise( function(resolve, reject) {

        ua.unpack( file, {
            targetDir: folder,
            noDirectory: true
        }, function(err, files, text) {
            if( err ) {
                // perfectly fine, we expect this for non archive files.
            }
            else if( files ) {
                let largestBinaryPath = null;
                let largestBinarySize = 0;
                let tmpFiles = fs.readdirSync(folder, {withFileTypes: true});
                // sometimes zip files have a sole directory, if that is the case, enter it
                while( tmpFiles.length === 1 && tmpFiles[0].isDirectory() ) {
                    let loneFolderPath = folder + SEPARATOR + tmpFiles[0].name;
                    let subfiles = fs.readdirSync(loneFolderPath);
                    let rename = null;
                    for( let subfile of subfiles ) {
                        // they have the same name
                        let newLocation = folder + SEPARATOR + subfile;
                        if( newLocation === loneFolderPath ) {
                            newLocation += "1";
                            rename = newLocation;
                        }
                        fsExtra.moveSync( loneFolderPath + SEPARATOR + subfile, newLocation );
                    }
                    rimraf.sync( loneFolderPath );
                    if( rename ) {
                        fsExtra.moveSync( newLocation, loneFolderPath );
                    }
                    tmpFiles = fs.readdirSync(folder, {withFileTypes: true});
                }
                // Get the largest binary file
                for( let tmpFile of tmpFiles.map(el => el.name) ) {
                    let curPath = folder + SEPARATOR + tmpFile;
                    try {
                        if( copyFolderContentsPath ) {
                            fsExtra.copySync( curPath, copyFolderContentsPath + SEPARATOR + tmpFile );
                        }
                        if( !installersOnly || tmpFile.match(/\.exe$/i) || tmpFile.match(/\.msi$/i) ) {
                            let stats = fs.statSync(curPath);
                            if( isBinaryFileSync(curPath) ) {
                                if( !largestBinaryPath || stats["size"] > largestBinarySize ) {
                                    largestBinaryPath = curPath;
                                    largestBinarySize = stats["size"];
                                    filename = tmpFile;
                                }
                                candidates.push(tmpFile);
                            }
                        }
                    }
                    catch(err) {} // ok
                }

                if( copyFolderContentsPath ) {
                    fs.unlinkSync(file);
                    rimraf.sync(folder);
                }
                else if( deleteFolder ) {
                    // Move the actual rom over the zip file
                    if( largestBinaryPath ) {
                        fs.renameSync( largestBinaryPath, file );
                    }
                    rimraf.sync(folder); // Delete the temp folder
                }
            }
            resolve();
        } );

    } );
    await extractPromise;

    return Promise.resolve({
        filename: filename,
        candidates: candidates
    });
}

/**
 * Create a promise that resolves once the request is unlocked.
 * We need this, so we don't call getData in the downloadRomBackground function.
 * While we might be adding another game.
 */
function requestLockedPromise() {
    return new Promise(function( resolve, reject ) {
        let checkInterval = setInterval( function() {
            if( !requestLocked ) {
                clearInterval(checkInterval);
                resolve();
            }
        }, REQUEST_LOCKED_CHECK_TIME );
    });
}

/**
 * Check if a track has any items to it being played.
 * @param {string} system - The system for the track.
 * @param {string} game - The track name.
 * @param {Array<string>} parents - The parents of the track.
 * @returns {boolean} True if a track has symlinks being played, otherwise false.
 */
function hasSymlinksBeingPlayed( system, game, parents ) {
    let symlinks = getAllSymlinksToItem( system, game, parents, systemsDict[MEDIA].games );
    for( let symlink of Object.keys(symlinks) ) {
        let symlinkEntry = symlinks[symlink];
        if( isBeingPlayed(MEDIA, symlinkEntry.game, symlinkEntry.parents) ) {
            return true;
        }
    }
    return false;
}

/**
 * Update a game.
 * @param {string} oldSystem - The old system for the game - needed so we know what we're updating.
 * @param {string} oldGame - The old name for the game - needed so we know what we're updating.
 * @param {Array<string>} [oldParents] - The old array of parent folders for a game.
 * @param {string} [system] - The new system for the game - null if the same.
 * @param {string} [game] - The new name for the game - null if the same.
 * @param {(object|string)} [file] - The file object (from upload) or a url path.
 * @param {Array<string>} [parents] - An array of parent folders for a game. Note that we expect this to be defined and identical if not changed, rather than blank like game and system.
 * @param {boolean} [isFolder] - True if this game is really a folder of other games.
 * @param {boolean} [isPlaylist] - True if the game is a playlist (will function similarly to a folder).
 * @param {Array<Array<string>>} [playlistItems] - The items in the playlist.
 * @param {string} [romCandidate] - The new romCandidate to use for PC games.
 * @returns {(boolean|string)} An error message if there was an error, false if there was not.
 */
function updateGame( oldSystem, oldGame, oldParents=[], system, game, file, parents=[], isFolder, isPlaylist, playlistItems, romCandidate ) {

    // Error check
    // Make sure the game and system are valid for old
    if( game ) {
        var invalidName = isInvalidName( game );
        if( invalidName ) return invalidName;
    }
    isInvalid = isInvalidGame( oldSystem, oldGame, oldParents ); // A playlist and game are valid games (can be launched), but a folder is not
    if( isInvalid ) {
        // Check to see if it is a folder
        let gameDictEntry = getGameDictEntry(oldSystem, oldGame, oldParents);
        if( gameDictEntry ) {
            if( isPlaylist ) {
                return ERROR_MESSAGES.convertFolderToPlaylist;
            }
            else if( !isFolder ) {
                return ERROR_MESSAGES.convertFolderToGame; // this could also be the case if trying to convert to playlist
            }
            // check to make sure we aren't moving the folder underneath itself
            else if( isFolder && (!system || oldSystem == system) ) {
                let testOldParents = oldParents.slice(0);
                testOldParents.push(oldGame);
                let matching = true;
                for( let i=0; i<testOldParents.length; i++ ) {
                    if( !parents[i] || testOldParents[i] != parents[i] ) {
                        matching = false;
                    }
                }
                if( matching ) {
                    return ERROR_MESSAGES.folderCantBeUnderItself;
                }
            }
            // changing folder is OK
        }
        else {
            return isInvalid;
        }
    }
    // The old game is a game, but they are trying to convert to a folder
    else if( isFolder ) {
        let gameDictEntry = getGameDictEntry(oldSystem, oldGame, oldParents);
        if( gameDictEntry.isPlaylist ) return ERROR_MESSAGES.convertPlaylistToFolder;
        return ERROR_MESSAGES.convertGameToFolder;
    }
    else {
        let gameDictEntry = getGameDictEntry(oldSystem, oldGame, oldParents);
        if( gameDictEntry.isPlaylist && !isPlaylist ) {
            return ERROR_MESSAGES.convertPlaylistToGame;
        }
        else if( !gameDictEntry.isPlaylist && isPlaylist ) {
            return ERROR_MESSAGES.convertGameToPlaylist;
        }
        else if( file && typeof file === STRING_TYPE && file.match(/^\//) && !fs.existsSync(file) ) {
            return ERROR_MESSAGES.invalidFilepath;
        } 
    }
    // Don't allow updates while still trying to download
    if( getGameDictEntry( oldSystem, oldGame, oldParents ).status == STATUS_DOWNLOADING ) {
        return ERROR_MESSAGES.romNotYetDownloaded;
    }
    // Can't change the save of a playing game
    if( isBeingPlayed( oldSystem, oldGame, oldParents ) ) {
        return ERROR_MESSAGES.gameBeingPlayed;
    }
    if( isFolder && isBeingPlayedRecursive(oldSystem, oldGame, oldParents)) {
        return ERROR_MESSAGES.folderHasGameBeingPlayed;
    }
    // Make sure the new game doesn't already exist
    if( system && !systemsDict[system] ) return ERROR_MESSAGES.noSystem;
    if( game && getGameDictEntry(system ? system : oldSystem, game, parents ? parents : oldParents) ) return ERROR_MESSAGES.gameAlreadyExists;
    else if( !game && ((parents && JSON.stringify(parents) != JSON.stringify(oldParents)) || system && system != oldSystem) && getGameDictEntry(system ? system : oldSystem, oldGame, parents) ) return ERROR_MESSAGES.gameAlreadyExists;
    if( isPlaylist && system != MEDIA ) return ERROR_MESSAGES.playlistsOnlyForMedia;
    if( isFolder && oldSystem == MEDIA && system != MEDIA ) {
        let gameDictEntry = getGameDictEntry(oldSystem, oldGame, oldParents);
        if( containsPlaylist(gameDictEntry) ) {
            return ERROR_MESSAGES.folderContainsPlaylistsOnlyForMedia;
        }
    }
    if( (!playlistItems || !playlistItems.length) && isPlaylist ) return ERROR_MESSAGES.playlistItemsRequired;
    if( isPlaylist ) {
        let playlistItemsError = errorCheckValidPlaylistItems( playlistItems );
        if( playlistItemsError ) return playlistItemsError;
    }
    if( !isPlaylist && !isFolder && oldSystem == MEDIA && (system == MEDIA || system == null) ) {
        if( hasSymlinksBeingPlayed( oldSystem, oldGame, oldParents ) ) {
            return ERROR_MESSAGES.symlinkToItemBeingPlayed;
        }
    }
    // isBeingPlayedRecursive will work here since playlists are only one level deep folders
    if( isPlaylist && isBeingPlayedRecursive(oldSystem, oldGame, oldParents)) {
        return ERROR_MESSAGES.playlistHasGameBeingPlayed;
    }
    if( !file && romCandidate ) {
        let gameDictEntry = getGameDictEntry(oldSystem, oldGame, oldParents);
        if( !gameDictEntry.romCandidates.length || gameDictEntry.romCandidates.indexOf(romCandidate) == -1 ) {
            return ERROR_MESSAGES.invalidRomCandidate;
        }
    }

    // Get the current game directory
    let oldGameDir = generateGameDir( oldSystem, oldGame, oldParents );

    let oldRomNandPath = "";

    // Just clear out and reload symlinks for playlists
    if( isPlaylist ) {
        deletePlaylistSymlinks( oldSystem, oldGame, oldParents );
        addSymlinksToPlaylist( oldSystem, oldGame, oldParents, playlistItems );
    }

    // we need an extra promise here
    let resolveDirsDone;
    let dirsDonePromise = new Promise(function(resolve, reject) {
        resolveDirsDone = resolve;
    });

    // This function will run once we are sure we have the ROM downloaded
    let runWhenDone = function() {
        getData();

        // Do this AFTER running get data, so we can pass the checked in addGame
        // Do this AFTER running get data, so we know we are all set with the save directories
        if( !isFolder && !isPlaylist ) {
            updateNandSymlinks(system ? system : oldSystem, game ? game : oldGame, oldRomNandPath, parents ? parents : oldParents);
        }
        else if( isFolder ) { // Media doesn't have nand links
            ensureNandSymlinks(system ? system : oldSystem, game ? game : oldGame, parents ? parents : oldParents, getGameDictEntry(system ? system : oldSystem, game ? game : oldGame, parents ? parents : oldParents) );
        }
    }

    // Update the rom file if necessary 
    if( file && !isFolder && !isPlaylist ) {

        let errorMessage;
        let oldRomPath;
        // Set the browser site url
        if( isBrowserOrClone(oldSystem) ) {
            if( typeof file == STRING_TYPE ) {
                updateGameMetaData( oldSystem, oldGame, oldParents, {siteUrl: file} );
            }
            else {
                try {
                    let uploadedContent = fs.readFileSync(file.path);
                    let uploadedJson = JSON.parse(uploadedContent);
                    if( !uploadedJson.siteUrl ) errorMessage = ERROR_MESSAGES.siteUrlRequired;
                    if( !uploadedJson.script ) uploadedJson.script = null;
                    updateGameMetaData( oldSystem, oldGame, oldParents, uploadedJson );
                }
                // invalid JSON file
                catch(err) {
                    errorMessage = ERROR_MESSAGES.invalidSiteJson;
                }
            }
        }
        else {
            // Get the current game file and its name. We will move it for now,
            // but we will ultimately either move it back or get rid of it.
            // upload into the old directory and that will change if necessary next
            oldRomPath = getGameDictEntry(oldSystem, oldGame, oldParents).rom ? generateRomLocation( oldSystem, oldGame, getGameDictEntry(oldSystem, oldGame, oldParents).rom, oldParents ) : "";
            if( oldRomPath ) {
                oldRomNandPath = getNandPath( oldSystem, oldGame, oldParents ); // We'll need this to clean up the old rom for NAND systems
                fs.renameSync( oldRomPath, TMP_ROM_LOCATION );
            }
            
            // Try to upload the new file
            // Note: an async error will continue unlike a sync error
            // A sync error to get the file - we'll just revert
            // An async error, we'll just have to alert the user that we failed.
            if( typeof file == STRING_TYPE && file.match(/^\//) ) updateGameMetaData(system ? system : oldSystem, game ? game : oldGame, parents ? parents : oldParents, {"rom": file});
            else if( typeof file == STRING_TYPE ) errorMessage = downloadRom( file, system ? system : oldSystem, game ? game : oldGame, parents ? parents : oldParents, runWhenDone, dirsDonePromise, oldSystem, oldGame, oldParents );
            else errorMessage = saveUploadedRom( file, oldSystem, oldGame, oldParents );
        }

        // We failed
        // Note, that there can be errors in the async download that won't get caught here.
        // In that case, the async download simply does not overwrite any file.
        if( errorMessage ) {
            // Deleting the new rom is not necessary, since error message implies the save failed
            if( oldRomPath ) {
                // Move the old rom back
                fs.renameSync( TMP_ROM_LOCATION, oldRomPath );
            }
            return errorMessage;
        }
        // We succeeded, delete the old rom
        else if( oldRomPath ) {
            fs.unlinkSync( TMP_ROM_LOCATION );
        }
    }
    if( !file && romCandidate ) { // for PC games
        updateGameMetaData( oldSystem, oldGame, oldParents, {rom: romCandidate} );
    }
    // Move some of the directories around
    if( (system && oldSystem != system) || (game && oldGame != game) || (oldParents.join(SEPARATOR) != parents.join(SEPARATOR)) ) {
        // Use the system command because node fs can't move directories
        let gameDir = generateGameDir( system ? system : oldSystem, game ? game : oldGame, parents ? parents : oldParents ); // update the game directory
        fsExtra.moveSync( oldGameDir, gameDir );
        // Update the symlink for the game
        // Force, since we've just updated the directory
        if( !isFolder && !isPlaylist ) {
            changeSave( system ? system : oldSystem, game ? game : oldGame, getGameDictEntry(oldSystem, oldGame, oldParents).currentSave, true, parents ? parents : oldParents );
        }
        else {
            ensureSaveSymlinks( system ? system : oldSystem, game ? game : oldGame, parents ? parents : oldParents, getGameDictEntry(oldSystem, oldGame, oldParents), oldSystem, oldGame, oldParents );
        }
        // Otherwise, we have to update the symlinks of all the children directories

        try {
            fetchGameData( system ? system : oldSystem, game ? game : oldGame, parents ? parents : oldParents, null, true );
        }
        catch(err) {/* ok */}
    }

    // Delete from playlists if transitioning from media
    if( oldSystem == MEDIA && system != MEDIA ) {
        let symlinks = getAllSymlinksToItem( oldSystem, oldGame, oldParents, systemsDict[MEDIA].games );
        for( let symlink of Object.keys(symlinks) ) {
            let symlinkEntry = symlinks[symlink];
            deleteGame( MEDIA, symlinkEntry.game, symlinkEntry.parents, true );
            // If the playlist is empty, it will be deleted when we regenerate the data.
        }
    }
    if( !isFolder && !isPlaylist ) { // Playlists can't be symlinked to
        updatePlaylistSymlinksToItem( game ? game : oldGame, parents ? parents : oldParents, oldGame, oldParents );
    }
    else if( isFolder ) { // Playlists don't have items that can be symlinked to
        ensurePlaylistSymlinks(parents ? parents : oldParents, game ? game : oldGame, oldParents, oldGame, getGameDictEntry(oldSystem, oldGame, oldParents) );
    }

    // After dirs are done, we can run getData
    // Update the data (this will take care of making all the necessary directories for the game as well as updating the data)
    if( !file || typeof file != STRING_TYPE || isBrowserOrClone(system) || file.match(/^\//) ) runWhenDone();
    else getData(); // Run get data now, so we can have an updated gamesDict even if we haven't finished downloading yet
    resolveDirsDone();

    return false;
}

/**
 * Check if a folder contains a playlist.
 * @param {Object} gameDictEntry - The game dict entry for the folder.
 * @returns {boolean} True if the folder contains a playlist, false if not.
 */
function containsPlaylist(gameDictEntry) {
    for( let game of Object.keys(gameDictEntry.games) ) {
        let curGameDictEntry = gameDictEntry.games[game];
        if( curGameDictEntry.isPlaylist ) {
            return true;
        }
        else if( curGameDictEntry.isFolder ) {
            if( containsPlaylist(curGameDictEntry) ) return true;
        }
    }
    return false;
}

/**
 * Ensure the nand symlinks are all valid for a folder.
 * @param {string} system - The name of the system the game is for.
 * @param {string} folder - The name of the folder the system uses.
 * @param {Array<string>} parents - Parent directories for the folder.
 * @param {Object} gameDictEntry The game dict entry for the old system / old game (since this is run prior to calling getData in updateGame).
 */
function ensureNandSymlinks( system, folder, parents, gameDictEntry ) {
    for( let game of Object.keys(gameDictEntry.games) ) {
        let curGameDictEntry = gameDictEntry.games[game];
        let curParents = parents.slice(0);
        curParents.push( folder );
        // This is a real game
        if( !curGameDictEntry.isFolder && !curGameDictEntry.isPlaylist ) {
            // Note: there will be no oldRamPath, because we updated the folder, thus the rom never changes for these
            updateNandSymlinks( system, curGameDictEntry.game, null, curParents );
        }
        else if( curGameDictEntry.isFolder ) {
            ensureNandSymlinks( system, game, curParents, curGameDictEntry );
        }
    }
}

/**
 * Ensure the save symlinks are all valid for a folder.
 * @param {string} system - The name of the system the game is for.
 * @param {string} folder - The name of the folder the system uses.
 * @param {Array<string>} parents - Parent directories for the folder.
 * @param {Object} gameDictEntry - The game dict entry for the old system / old game (since this is run prior to calling getData in updateGame).
 * @param {string} oldSystem - The old system - needed to get the game dict entry.
 * @param {string} oldFolder - The old folder - needed to get the game dict entry.
 * @param {Array<string>} oldParents - The old parents - needed to get the game dict entry.
 */
function ensureSaveSymlinks( system, folder, parents, gameDictEntry, oldSystem, oldFolder, oldParents ) {
    for( let game of Object.keys(gameDictEntry.games) ) {
        let curGameDictEntry = gameDictEntry.games[game];
        let curParents = parents.slice(0);
        let curOldParents = oldParents.slice(0);
        curParents.push( folder );
        curOldParents.push( oldFolder );

        // This is a real game
        // this is the problem - we are passing in the new parents but that means the entries dont exist
        // but we need the new parents to pass to changeSave forced since the directories have already moved
        if( !curGameDictEntry.isFolder && !curGameDictEntry.isPlaylist ) {
            changeSave( system, curGameDictEntry.game, getGameDictEntry( oldSystem, curGameDictEntry.game, curOldParents ).currentSave, true, curParents );
        }
        else if( curGameDictEntry.isFolder ) {
            ensureSaveSymlinks( system, game, curParents, curGameDictEntry, oldSystem, game, curOldParents );
        }
    }
}

 /**
  * Ensure playlist symlinks are valid.
  * @param {Array<string>} parents - The parents of the folder we are looking at.
  * @param {string} folder - The new name of the folder we are looking at.
  * @param {Array<string>} oldParents - The old parents of the folder we are looking at.
  * @param {string} oldFolder - The old name of the folder we are looking at - as this function calls itself recursively, this will be the same as the new folder.
  * @param {Object} gameDictEntry - The gameDictEntry for the folder we are looking at.
  */
function ensurePlaylistSymlinks( parents, folder, oldParents, oldFolder, gameDictEntry ) {
    for( let game of Object.keys(gameDictEntry.games) ) {
        let curGameDictEntry = gameDictEntry.games[game];
        let curParents = parents.slice(0);
        let curOldParents = oldParents.slice(0);
        curParents.push( folder );
        curOldParents.push( oldFolder );

        if( !curGameDictEntry.isFolder && !curGameDictEntry.isPlaylist ) { // playlists can't be symlinked to
            // names of sub items will not have changed
            updatePlaylistSymlinksToItem( curGameDictEntry.game, curParents, curGameDictEntry.game, curOldParents );
        }
        // we don't want to look for the symlinks of symlinks so don't look in playlist
        else if( curGameDictEntry.isFolder ) {
            ensurePlaylistSymlinks( curParents, game, curOldParents, game, curGameDictEntry ); // the old and new folder names are the same now since we aren't at the level of the folder being edited
        }
    }
}

/**
 * Update playlist symlinks to an item.
 * The assumed system is media.
 * @param {string} game - The new name of the game.
 * @param {Array<string>} parents - The new parents of the game.
 * @param {string} oldGame - The old name of the game.
 * @param {Array<string>} oldParents - The old parents of the game.
 */
function updatePlaylistSymlinksToItem( game, parents, oldGame, oldParents ) {
    // get all the symlinks to the old game
    let symlinks = getAllSymlinksToItem( MEDIA, oldGame, oldParents, systemsDict[MEDIA].games );
    for( let symlink of Object.keys(symlinks) ) {
        let symlinkEntry = symlinks[symlink];
        let symlinkPath = symlinkEntry.game.split(PLAYLIST_SEPERATOR);
        symlinkPath.shift(); // removes random id
        let newPath = parents.slice(0);
        newPath.push(game);
        // remember what this is! parents+game joined by seperator (because we can't store it in json because it is a symlink)
        // prepended by the order and a separator
        let newGameName = symlinkEntry.game.substring(0,symlinkEntry.game.lastIndexOf(symlinkPath.join(PLAYLIST_SEPERATOR))) + newPath.join(PLAYLIST_SEPERATOR);
        
        deleteGame( MEDIA, symlinkEntry.game, symlinkEntry.parents, true );
        // we need to force since this will temporarily be an invalid symlink
        addGame( MEDIA, newGameName, null, symlinkEntry.parents, false, false, null, true, {
            system: MEDIA,
            game: game,
            parents: parents
        }, true);
    }
}

/**
 * Delete a game.
 * @param {string} system - The game the system is on.
 * @param {string} game - The game to delete.
 * @param {Array<string>} [parents] - An array of parent folders for a game.
 * @param {boolean} [force] - True if the game validity check should be skipped.
 * @param {boolean} isPlaylist - Overwrite the default isPlaylist value when force is used.
 * @returns {boolean|string} An error message if there was an error, false if there was not.
 */
function deleteGame( system, game, parents=[], force, isPlaylist=false ) {
    let isFolder = false;

    // Error check
    if( !force ) {
        var invalidName = isInvalidName( game );
        if( invalidName ) return invalidName;

        // Make sure the game and system are valid
        isInvalid = isInvalidGame( system, game, parents );
        if( isInvalid ) {
            // Check to see if it is a folder
            let gameDictEntry = getGameDictEntry(system, game, parents);
            if( gameDictEntry ) {
                if( Object.keys(gameDictEntry.games).length ) {
                    if( !force ) return ERROR_MESSAGES.nonEmptyDirectory;
                }
                else {
                    isFolder = true;
                }
            }
            else {
                return isInvalid;
            }
        }
        else {
            let gameDictEntry = getGameDictEntry(system, game, parents);
            if( gameDictEntry.isPlaylist ) {
                isPlaylist = true;
            }
        }
        // Don't allow updates while still trying to download
        if( getGameDictEntry( system, game, parents ).status == STATUS_DOWNLOADING ) {
            return ERROR_MESSAGES.romNotYetDownloaded;
        }
        // Can't change the save of a playing game
        if( isBeingPlayed( system, game, parents ) ) {
            return ERROR_MESSAGES.gameBeingPlayed;
        }
        if( !isPlaylist && !isFolder && system == MEDIA ) {
            if( hasSymlinksBeingPlayed( system, game, parents ) ) {
                return ERROR_MESSAGES.symlinkToItemBeingPlayed;
            }
        }
        // isBeingPlayedRecursive will work here since playlists are only one level deep folders
        // we don't have to check for this for folders since we can't delete empty folders
        if( isPlaylist && isBeingPlayedRecursive(system, game, parents)) {
            return ERROR_MESSAGES.playlistHasGameBeingPlayed;
        }
    }

    if( !isFolder && !isPlaylist ) {
        // If this is a NAND game, make sure we have a directory in place
        // in case they want to play the game outside of guystation
        let nandPath = getNandPath( system, game, parents );
        if( nandPath && fs.existsSync(nandPath) ) {
            try {
                fs.unlinkSync(nandPath);
                fs.mkdirSync(nandPath);
            }
            catch(err) { /*It's already a directory for some reason*/ }
        }

        // Recusively delete all the symlinks in the playlist
        if( system == MEDIA ) {
            let symlinks = getAllSymlinksToItem( system, game, parents, systemsDict[MEDIA].games );
            for( let symlink of Object.keys(symlinks) ) {
                let symlinkEntry = symlinks[symlink];
                deleteGame( MEDIA, symlinkEntry.game, symlinkEntry.parents, true );
                // If the playlist is empty, it will be deleted when we regenerate the data.
            }
        }
    }
    
    rimraf.sync( generateGameDir( system, game, parents ) );
    
    if( !force ) getData();

    return false;
}

/**
 * Save the current screen resolution.
 */
function saveCurrentResolution() {
    properResolution = proc.execSync(GET_RESOLUTION_COMMAND).toString();
}

/**
 * Save the current emulator resolution
 */
function saveCurrentEmulatorResolution() {
    properEmulatorResolution = proc.execSync(systemsDict[currentSystem].getResolutionCommand ? systemsDict[currentSystem].getResolutionCommand : GET_RESOLUTION_COMMAND).toString();
}

/**
 * Ensure that the screen is set to its proper resolution.
 * This is mainly in place to deal with emulators that change the screen
 * resolution (Mupen64Plus). From what I have seen SDL_Quit should restore
 * the resolution, but it looks like sometimes that does not get called while
 * other times it does. This might have something to do with pausing the application
 * and/or using kill -9. Nonetheless, this should restore the proper resolution.
 */
function ensureProperResolution() {
    if( properResolution ) {
        let currentResolution = proc.execSync(GET_RESOLUTION_COMMAND).toString();
        if( currentResolution != properResolution ) {
            try {
                proc.execSync(SET_RESOLUTION_COMMAND + properResolution);
            }
            catch(err) {/*ok for now*/}
        }
    }
}

/**
 * Freeze the game process.
 * This is only for programs.
 */
function pauseGame() {
    if(currentEmulator && !isBrowserOrClone(currentSystem) && currentSystem != MEDIA) {
        ensureProperResolution(); // Instantly get the right resolution
        proc.execSync( SLEEP_HALF_COMMAND ); // give time to go back to the menu
        proc.execSync( PAUSE_COMMAND + currentEmulator.pid );
    }
}

/**
 * Continue the game process.
 * This is only for programs.
 */
function resumeGame() {
    if(currentEmulator && !isBrowserOrClone(currentSystem) && currentSystem != MEDIA) {
        proc.execSync( SLEEP_HALF_COMMAND ); // give time to load to avoid button press issues
        proc.execSync( RESUME_COMMAND + currentEmulator.pid );
    }
}

// The following remote media functions are to make the media functionality like that of a game
// The remote media option allows media to be played on any device, but we also want it to be played
// on the host device when launched either locally or remotely. As such, we manipulate the menuPage JavaScript
// to pull up the remote media function on the host device.

/**
 * Launch remote media like a game
 * @param {string} system - The system the media is on (should be "media").
 * @param {string} game - The name of the media.
 * @param {Array<string>} parents - The parents of the media.
 * @returns {(boolean|string)} An error message if there was an error, false if there was not.
 */
async function launchRemoteMedia( system, game, parents ) {
    // You are calling launch which is calling quit but async so before quit can remove the modal callback the “new game” has already launched which will trigger the modal (there can only be one modal at a time)
    // to close IFF the new game is media which will then call quit.
    await menuPage.evaluate( (system, game, parents, newDict) => {
        // We need to make sure the menu page has the latest version of system dict in memory
        if( JSON.stringify(newDict) != JSON.stringify(systemsDict) ) {
            systemsDict = newDict;
            redraw();
        }
        displayRemoteMedia(system, game, parents, true) 
    }, system, game, parents, systemsDict);
    await checkRemoteMedia( system, game, parents );
    return Promise.resolve(false);
}

/**
 * Pause remote media.
* @returns {(boolean|string)} An error message if there was an error, false if there was not.
 */
async function pauseRemoteMedia() {
    if(currentEmulator && currentSystem == MEDIA) {
        if( menuPage && !menuPage.isClosed() ) {
            await menuPage.evaluate( () => minimizeRemoteMedia() );
            return Promise.resolve(false);
        }
        return Promise.resolve(ERROR_MESSAGES.menuPageClosed);
    }
    else {
        return Promise.resolve(ERROR_MESSAGES.noMediaPlaying);
    }
}

/**
 * Resume remote media.
 * @returns {(boolean|string)} An error message if there was an error, false if there was not.
 */
async function resumeRemoteMedia() {
    if(currentEmulator && currentSystem == MEDIA) {
        if( menuPage && !menuPage.isClosed() ) {
            await menuPage.evaluate( () => maximizeRemoteMedia() );
            return Promise.resolve(false);
        }
        return Promise.resolve(ERROR_MESSAGES.menuPageClosed);
    }
    else {
        return Promise.resolve(ERROR_MESSAGES.noMediaPlaying);
    }
}

/**
 * Destroy remote media state.
 * @returns {(boolean|string)} An error message if there was an error, false if there was not.
 */
async function destroyRemoteMedia() {
    if( menuPage && !menuPage.isClosed() ) {
        await menuPage.evaluate( () => removeRemoteMediaPlaceholder() );
        await Promise.resolve(false);
    }
    else {
        Promise.resolve(ERROR_MESSAGES.menuPageClosed);
    }
}

/**
 * Close remote media.
 * @returns {(boolean|string)} An error message if there was an error, false if there was not.
 */
async function closeRemoteMedia() {
    let errorMessage = await clearCheckRemoteMedia();
    if( !errorMessage ) {
        if( menuPage && !menuPage.isClosed() ) {
            let remoteMediaForm = await menuPage.$("#remote-media-form", {timeout: CHECK_TIMEOUT});
            if( remoteMediaForm ) {
                // the closeModalCallback is to quit the game. But this is called when a game is quit. we do not want to call
                // it again. remove the callback, and then quit the media.
                await menuPage.evaluate( () => { closeModalCallback=null; closeModal(true); } );
            }
            await destroyRemoteMedia(); // destory any instances of remote media placeholders
            return Promise.resolve(false);
        }
        else {
            return Promise.resolve( ERROR_MESSAGES.menuPageClosed );
        }
    }
    else {
        return Promise.resolve(errorMessage);
    }
}

/**
 * Begin checking for remote media status.
 * @param {string} system - The system the media is on.
 * @param {string} game - The media name.
 * @param {Array<string>} parents - the parents of the media.
 * @returns {(boolean|string)} An error message if there was an error, false if there was not.
 */
async function checkRemoteMedia( system, game, parents ) {
    clearMediaPlayingInterval = setInterval( async function() {
        if( !menuPage || menuPage.isClosed() ) {
            await quitGame();
            return;
        }
        let isPlaying = await menuPage.evaluate( (system, game, parents) => isRemoteMediaPlaying(system, game, parents), system, game, parents );
        if( !isPlaying ) {
            // Sanity checks to make sure we are still on the same game
            if( currentEmulator && currentSystem == system && currentGame == game && currentParentsString == parents.join(SEPARATOR) ) {
                await quitGame();
            }
        }
    }, CHECK_MEDIA_PLAYING_INTERVAL );
    return Promise.resolve(false);
}

/**
 * Stop checking for remote media status.
 * @returns {Promise<(boolean|string)>} An error message if there was an error, false if there was not.
 */
async function clearCheckRemoteMedia() {
    clearInterval( clearMediaPlayingInterval );
    return Promise.resolve(false);
}

/**
 * Determine if the menu page is active.
 * @returns {boolean} True if the menu page is active.
 */
function menuPageIsActive() {
    return proc.execSync(ACTIVE_WINDOW_COMMAND).toString().startsWith(PAGE_TITLE);
}

/**
 * Determine if the sharing prompt is active.
 * @returns {boolean} True if the sharing prompt is active.
 */
function sharingPromptIsActive() {
    return proc.execSync(ACTIVE_WINDOW_COMMAND).toString().includes(SHARING_PROMPT);
}

/**
 * Go to the home menu.
 * @returns {Promise<(boolean|string)>} An error message if there was an error, or an object indicating if we paused if not.
 */
async function goHome() {
    if( !menuPage || menuPage.isClosed() ) {
        return Promise.resolve(ERROR_MESSAGES.menuPageClosed);
    }

    clearInterval(continueInterval);

    await ensurePipNotFullscreen();

    var needsPause = true;
    if( menuPageIsActive() ) {
        needsPause = false;
    }
    proc.execSync(FOCUS_CHROMIUM_COMMAND);
    try {
        await menuPage.bringToFront();
        // these functions will check if they are applicable
        // so don't worry about returning their error messages, because some will inevitably have them
        if( needsPause ) {
            pauseGame();
            if( currentEmulator && isBrowserOrClone(currentSystem) && browsePage && !browsePage.isClosed() ) await browsePage.evaluate( () => document.exitFullscreen() );
        }
        pauseRemoteMedia();
    }
    catch(err) {/*ok*/}

    stopUpdatePlaytime();
    currentGameStart = null;
    blankOnboardInstance();

    return Promise.resolve( { "didPause": needsPause } );
}

/**
 * Get the total playtime.
 * @param {Object} game - The game object as returned from the server.
 * @returns {Object} An object with a key for totalPlaytime, totalSessions, and most recent playtime.
 */
 function getTotalPlaytime(game) {
    let totalPlaytime = 0;
    let totalSessions = 0;
    let mostRecentPlaytime = 0;
    if( game.isFolder ) {
        let gameKeys = Object.keys(game.games);
        for( let i=0; i<gameKeys.length; i++ ) {
            let result = getTotalPlaytime(game.games[gameKeys[i]]);
            totalPlaytime += result.totalPlaytime;
            totalSessions += result.totalSessions;
            mostRecentPlaytime = Math.max(mostRecentPlaytime, result.mostRecentPlaytime);
        }
    }
    else if( game.sessions ) {
        for( let i=0; i<game.sessions.length; i++ ) {
            totalPlaytime += game.sessions[i][1] - game.sessions[i][0];
            totalSessions += 1;
            mostRecentPlaytime = game.sessions[i][1];
        }
    }
    return {
        totalPlaytime: totalPlaytime,
        totalSessions: totalSessions,
        mostRecentPlaytime: mostRecentPlaytime
    };
}

/**
 * Filter the stream list the client has to sort through.
 * We want to minimize the number of streams the client has to consider.
 * Disney+ alone adds 1.5mb to systemsDict.
 * @param {string} [search] - The search string.
 * @param {string} [sort] - The sort.
 * @returns {Object} - A filtered systemsDict.
 */
function filterStreams(search="", sort) {
    let newSystemsDict = JSON.parse(JSON.stringify(systemsDict));
    for( let service in newSystemsDict[STREAM].games ) {
        let gamesKeys = Object.keys(newSystemsDict[STREAM].games[service].games);
        // now filter them to match search
        if( search ) gamesKeys = gamesKeys.filter( el => termsMatch( search, el ) );
        // sort the programs
        if( sort === SORT_PLAYTIME || sort == SORT_RECENT) {
            gamesKeys = gamesKeys.sort( function(a,b) {
                let gameA = newSystemsDict[STREAM].games[service].games[a];
                let gameB = newSystemsDict[STREAM].games[service].games[b];
                let playtimeA = getTotalPlaytime(gameA)[sort];
                let playtimeB = getTotalPlaytime(gameB)[sort];
                if( playtimeA < playtimeB ) return 1;
                if( playtimeA > playtimeB ) return -1;
                if( a < b ) return -1;
                if( a > b ) return 1;
                return 0;
            } );
        }
        // now get the top 10 or is playing
        let newGames = {};
        for( let i=0; i<gamesKeys.length; i++ ) {
            let game = newSystemsDict[STREAM].games[service].games[gamesKeys[i]];
            if( i < DEFAULT_STREAM_SHOWN || search.length >= MIN_STREAM_SEARCH_LENGTH || game.playing) {
                newGames[gamesKeys[i]] = game;
            }
        }
        newSystemsDict[STREAM].games[service].games = newGames;
    }
    return newSystemsDict;
}

/**
 * Determine if two terms match for searching.
 * @param {string} searchTerm - The first term.
 * @param {string} matchTerm - The second term.
 * @returns {boolean} True if the terms are a match.
 */
 function termsMatch(searchTerm, matchTerm) {
    searchTerm = removeDiacritics(searchTerm).toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g,"").replace(new RegExp('\\b('+STOPWORDS.join('|')+')\\b', 'g'), '').replace(/\s\s+/g, ' ').trim();
    matchTerm = removeDiacritics(matchTerm).toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\s]/g,"").replace(new RegExp('\\b('+STOPWORDS.join('|')+')\\b', 'g'), '').replace(/\s\s+/g, ' ').trim();
    if( matchTerm.match(searchTerm) ) {
        return true;
    }
    return false;
}

/**
 * Remove diacritics from a string.]
 * Taken from here: https://stackoverflow.com/questions/18123501/replacing-accented-characters-with-plain-ascii-ones
 * @param {string} str - The string to remove diacritics from. 
 * @returns {string} The string with removed diacritics.
 */
 function removeDiacritics (str) {
    let defaultDiacriticsRemovalMap = [
      {'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
      {'base':'AA','letters':/[\uA732]/g},
      {'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g},
      {'base':'AO','letters':/[\uA734]/g},
      {'base':'AU','letters':/[\uA736]/g},
      {'base':'AV','letters':/[\uA738\uA73A]/g},
      {'base':'AY','letters':/[\uA73C]/g},
      {'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
      {'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
      {'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
      {'base':'DZ','letters':/[\u01F1\u01C4]/g},
      {'base':'Dz','letters':/[\u01F2\u01C5]/g},
      {'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
      {'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
      {'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
      {'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
      {'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
      {'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g},
      {'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
      {'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
      {'base':'LJ','letters':/[\u01C7]/g},
      {'base':'Lj','letters':/[\u01C8]/g},
      {'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
      {'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
      {'base':'NJ','letters':/[\u01CA]/g},
      {'base':'Nj','letters':/[\u01CB]/g},
      {'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
      {'base':'OI','letters':/[\u01A2]/g},
      {'base':'OO','letters':/[\uA74E]/g},
      {'base':'OU','letters':/[\u0222]/g},
      {'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
      {'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
      {'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
      {'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
      {'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
      {'base':'TZ','letters':/[\uA728]/g},
      {'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
      {'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
      {'base':'VY','letters':/[\uA760]/g},
      {'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
      {'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
      {'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
      {'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
      {'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
      {'base':'aa','letters':/[\uA733]/g},
      {'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g},
      {'base':'ao','letters':/[\uA735]/g},
      {'base':'au','letters':/[\uA737]/g},
      {'base':'av','letters':/[\uA739\uA73B]/g},
      {'base':'ay','letters':/[\uA73D]/g},
      {'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
      {'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
      {'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
      {'base':'dz','letters':/[\u01F3\u01C6]/g},
      {'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
      {'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
      {'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
      {'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
      {'base':'hv','letters':/[\u0195]/g},
      {'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
      {'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
      {'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
      {'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
      {'base':'lj','letters':/[\u01C9]/g},
      {'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
      {'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
      {'base':'nj','letters':/[\u01CC]/g},
      {'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
      {'base':'oi','letters':/[\u01A3]/g},
      {'base':'ou','letters':/[\u0223]/g},
      {'base':'oo','letters':/[\uA74F]/g},
      {'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
      {'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
      {'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
      {'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
      {'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
      {'base':'tz','letters':/[\uA729]/g},
      {'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
      {'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
      {'base':'vy','letters':/[\uA761]/g},
      {'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
      {'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
      {'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
      {'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
    ];
  
    for(let i=0; i<defaultDiacriticsRemovalMap.length; i++) {
        str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
    }
  
    return str;
}

/**
 * Sync streams.
 */
function syncStreams() {
    // update streams only at night
    if( !fs.existsSync(STREAM_INFO_PATH) ) fetchStreamList();
    setInterval(() => {
        if( new Date().getHours === STREAM_OK_TO_FETCH_HOUR ) {
            fetchStreamList();
        }
    }, STREAM_SYNC_WAIT);
}

/**
 * Scrape what's available to Stream.
 * Uses ReelGood.
 * @returns {Promise<(boolean|string)>} An error message if there is one, or false if not.
 */
async function fetchStreamList() {
    try {
        if( streamIsFetching ) {
            return Promise.resolve(ERROR_MESSAGES.streamCurrentlyFetching);
        }
        streamIsFetching = true;

        console.log("scraping stream list");
        // Open the stream info contents
        let contents;
        try {
            contents = JSON.parse(fs.readFileSync(STREAM_INFO_PATH));
        }
        catch(err) {
            contents = {lastFetched: 0};
        }

        let currentTime = new Date().getTime();
        if( parseInt(contents.lastFetched) > currentTime - ONE_WEEK_MILLISECONDS ) {
            return Promise.resolve(ERROR_MESSAGES.alreadyFetchedWithinWeek);
        }

        // Open the browser to scrape
        console.log("opening browser");
        let streamBrowser = await puppeteer.launch({
            defaultViewport: {
                width: STREAM_WIDTH, 
                height: STREAM_HEIGHT
            }, 
            args: [
                '--no-sandbox'
            ]
        });
        let page = await streamBrowser.newPage();
        page.on("close", async () => {
            try {
                page = await streamBrowser.newPage();
            }
            catch(err) {
                //ok
            }
        })
        let buttonSelector = "a[href^='/source'] button";
        let servicesDict = {};

        for( let service in DEFAULT_STREAM_SERVICES ) {
            console.log("going to " + service);
            servicesDict[service] = {};

            // this function will intercept requests to the api
            let intercept = async function(response) {
                if( response.url().match(REELGOOD_API_URL) ) {
                    let json = await response.json();
                    console.log("got intercept");
                    console.log(json.results.length);
                    for( let result of json.results ) {
                        let date = new Date(result.released_on);
                        let title = result.title.replace(/[\/\\]/g, "-").replace(/:/g, " -") + " (" + date.getFullYear() + ")";
                        let type = result.content_type === "m" ? "movie" : "show";
                        servicesDict[service][title] = {
                            title: title,
                            description: result.overview,
                            released: date.getTime()/1000,
                            type: type,
                            link: REELGOOD_URL + type + "/" + result.slug,
                            image: REELGOOD_IMAGE_URL.replace("movie", type).replace("MOVIE_ID",result.id)
                        }
                    }
                    console.log(Object.keys(servicesDict[service]).length);
                    return;
                }
            }

            // Wait for navigation
            page.on("response", intercept);
            await page.goto( DEFAULT_STREAM_SERVICES[service].url );
            await page.waitForSelector("tbody tr");
            // refresh the first 50 to intercept
            console.log("scanning page 1");
            await page.evaluate( () => document.querySelector("button[data-id='0']").click() );
            await page.waitFor(STREAM_WAIT);
            await page.waitForSelector("tbody tr");
            await page.waitFor(STREAM_WAIT);
            let pageCount = 1;
            while( true ) {
                pageCount ++;
                let curInterval;
                try {
                    console.log("scanning page " + pageCount);
                    await page.waitForSelector(buttonSelector, {timeout: STREAM_TIMEOUT});
                    await page.waitFor(STREAM_WAIT);
                    let prevCount = await page.evaluate( () => document.querySelectorAll("tbody tr").length );

                    //page.off("response", intercept);
                    await page.click(buttonSelector);
                    //page.on("response", intercept);

                    // wait until the new content has loaded
                    await new Promise( (resolve, reject) => {
                        let tries = 0;
                        curInterval = setInterval( async () => {
                            let count = await page.evaluate( () => document.querySelectorAll("tbody tr").length );
                            if( count != prevCount ) resolve(); // We've loaded more
                            tries++;
                            if( tries > STREAM_TIMEOUT/STREAM_WAIT ) reject();
                        }, STREAM_WAIT );
                    });
                    await page.waitFor(STREAM_WAIT);
                }
                catch(err) {
                    console.log(err);
                    break; // no more 
                }
                clearInterval(curInterval);
            }
            page.off("response", intercept);

            console.log("getting proper links");
            for( let title in servicesDict[service] ) {
                for( let i=0; i<PROPER_LINK_TRIES; i++ ) {
                    try {
                        console.log("getting proper links for " + title + " on " + service)
                        let value = servicesDict[service][title];
                        let response = await page.goto(value.link);
                        let data = await response.text();
                        let link = decodeURIComponent(JSON.parse( '"' + data.match(DEFAULT_STREAM_SERVICES[service].linkRegex)[0].replace('"', '\\"') + '"' ));
                        await page.goto(link);
                        await page.waitForSelector(DEFAULT_STREAM_SERVICES[service].selector);
                        let href = await page.evaluate( () => window.location.href );
                        servicesDict[service][title].link = href.replace(/\?.*/g,"");
                        break;
                    }
                    catch(err) {
                        console.log(err);
                    }
                }
            }
        }
        streamBrowser.close();

        console.log("updating and deleting programs");
        // note, we depend on the auto generated structure here of services for folders and games for values.
        for( let existingService in systemsDict[STREAM].games ) {
            if( servicesDict[existingService] ) { // Same services in old and new
                for( let existingGame in systemsDict[STREAM].games[existingService].games ) {
                    let json = servicesDict[existingService][existingGame];
                    if( json ) {
                        console.log("updating " + json.title + " from " + existingService);
                        // still exists, update
                        updateGame( STREAM, json.title, [existingService], null, null, json.link, [existingService] );
                        writeStreamMetaData( STREAM, json.title, [existingService], json );
                        await sleep(WRITE_STREAM_SLEEP);
                    }
                    // doesn't exist, delete
                    else {
                        console.log("deleting " + existingGame + " from " + existingService);
                        deleteGame( STREAM, existingGame, [existingService] );
                    }
                }
            }
            else {
                // Need to delete everything from the old service
                for( let existingGame in systemsDict[STREAM].games[existingService].games ) {
                    deleteGame( STREAM, existingGame, [service] ); // Delete the games within
                }
                deleteGame( STREAM, service, [] ); // Delete the service
            }
        }

        console.log("adding new programs");
        for( let service in servicesDict ) {
            if( !getGameDictEntry( STREAM, service, [] ) ) {
                addGame( STREAM, service, null, [], true );
            }
            for( let program in servicesDict[service] ) {
                let json = servicesDict[service][program];
                // The game is new
                if( !systemsDict[STREAM].games[service].games[json.title] ) {
                    console.log("adding " + json.title + " from " + service);
                    addGame( STREAM, json.title, json.link, [service] );
                    writeStreamMetaData( STREAM, json.title, [service], json );
                    await sleep(WRITE_STREAM_SLEEP);
                }
            }
        }

        fs.writeFileSync(STREAM_INFO_PATH, JSON.stringify({lastFetched: currentTime})); // mark the last fetched time
    }
    catch(err) {
        console.log(err);
    }
    streamIsFetching = false;
}

/**
 * Sleep.
 * @param {string} ms - The number of milliseconds to sleep.
 * @returns {Promise} A promise that resolves after sleeping.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Update Stream Game Meta Data.
 * @param {string} system - The system.
 * @param {string} game - The game name.
 * @param {Array<string>} parents - The parents.
 * @param {Object} json - The json for the game generated by scraping the page. 
 */
function writeStreamMetaData( system, game, parents, json ) {
    let saveLocation = generateGameDir( system, game, parents ) + SEPARATOR + COVER_FILENAME;
    // async is probably ok here
    axios( { method: "GET", url: json.image, responseType: "stream" } ).then(function (response) {
        response.data.pipe(fs.createWriteStream(saveLocation));
        updateGameMetaData( system, game, parents, {
            cover: {
                url: url,
                width: STREAM_COVER_WIDTH,
                height: STREAM_COVER_HEIGHT
            }
        } );
    }).catch(error => {
        console.log("could not save image for " + game);
        updateGameMetaData( system, game, parents, {
            cover: null
        } );
    });
    let url = saveLocation.replace( WORKING_DIR, '' ); //remove the working dir
    updateGameMetaData( system, game, parents, {
        summary: json.description,
        releaseDate: json.released,
        name: json.title,
        script: DEFAULT_STREAM_SERVICES[parents[0]].script
    });
}

/**
 * Fetch game data from IGDB.
 * This function will update the metadata.json files for the game.
 * It will do nothing if data has already been fetched within one week.
 * @param {string} system - The system the game is on.
 * @param {string} game - The game to fetch data for.
 * @param {Array<string>} parents - The parents of the game.
 * @param {Object} currentMetadataContents - The current contents of the metadata file to avoid having to fetch it again.
 * @param {boolean} force - Fetch even if fetched in the past week.
 * @returns {Promise<(boolean|string)>} An error message if there is one, or false if not.
 */
async function fetchGameData( system, game, parents, currentMetadataContents, force ) {
    // Game may not be fully downloaded yet
    //let isInvalid = isInvalidGame( system, game, parents );
    //if( isInvalid ) return isInvalid;

    if( system == MEDIA || isBrowserOrClone(system) ) {
        return Promise.resolve(ERROR_MESSAGES.noGamesForMediaOrBrowser);
    }
    let headers = await getIgdbHeaders();
    if( typeof headers === STRING_TYPE ) return Promise.resolve(headers); // An error ocurred

    let metaDataLocation = generateGameMetaDataLocation(system, game, parents);
    if( !currentMetadataContents ) currentMetadataContents = JSON.parse(fs.readFileSync(metaDataLocation));
    let currentTime = new Date().getTime();
    
    if( !force && currentMetadataContents.lastFetched && parseInt(currentMetadataContents.lastFetched) > currentTime - ONE_WEEK_MILLISECONDS ) {
        return Promise.resolve(ERROR_MESSAGES.alreadyFetchedWithinWeek);
    }
    if( currentMetadataContents && currentMetadataContents.status === STATUS_DOWNLOADING ) {
        return Promise.resolve(ERROR_MESSAGES.romNotYetDownloaded);
    }
    if( pcUnpacking ) {
        return Promise.resolve(ERROR_MESSAGES.pcStillLoading);
    }

    let newContent = {
        summary: null,
        releaseDate: null,
        name: null,
        cover: null
    };

    let payload = GAMES_FIELDS + 'search "' + game + '";' + 'where platforms=(' + PLATFORM_LOOKUP[system].join() + ");";
    let gameInfo = await axios.post( GAMES_ENDPOINT, payload, { headers: headers } );
    if( gameInfo.data.length ) {
        gameInfo = gameInfo.data[0];
        if( gameInfo.first_release_date ) newContent.releaseDate = gameInfo.first_release_date;
        if( gameInfo.name ) newContent.name = gameInfo.name;
        if( gameInfo.summary ) newContent.summary = gameInfo.summary;
        if( gameInfo.cover ) {
            let coverPayload = "where id=" + gameInfo.cover + ";" + COVERS_FIELDS;
            let coverInfo = await axios.post( COVERS_ENDPOINT, coverPayload, { headers: headers } );
            if( coverInfo.data.length ) {
                coverInfo = coverInfo.data[0];
                if( coverInfo.width && coverInfo.height && coverInfo.url ) {
                    delete coverInfo.id;
                    let url = "https:" + coverInfo.url.replace(THUMB_IMAGE_SIZE, COVER_IMAGE_SIZE);
                    let saveLocation = generateGameDir( system, game, parents ) + SEPARATOR + COVER_FILENAME;
                    // async is probably ok here
                    axios( { method: "GET", url: url, responseType: "stream" } ).then(function (response) {
                        response.data.pipe(fs.createWriteStream(saveLocation));
                    });
                    coverInfo.url = saveLocation.replace( WORKING_DIR, '' ); //remove the working dir
                    newContent.cover = coverInfo;
                }
            }
            newContent.lastFetched = currentTime; // update the time fetched
            updateGameMetaData( system, game, parents, newContent );
            return Promise.resolve(false);
        }
        else {
            newContent.lastFetched = currentTime; // update the time fetched
            updateGameMetaData( system, game, parents, newContent );
            return Promise.resolve(false);
        }
    }
    else {
        newContent.lastFetched = currentTime; // update the time fetched
        updateGameMetaData( system, game, parents, newContent );
        return Promise.resolve(ERROR_MESSAGES.noGameInfo);
    }
}

/**
 * Get the IGDB headers.
 * @returns {Promise<Object|string>} - The object that can be uses as the headers for IGDB requests or an error message.
 */
async function getIgdbHeaders() {
    if( !IGDB_CLIENT_ID || !IGDB_CLIENT_SECRET ) {
        return Promise.resolve(ERROR_MESSAGES.noApiKey);
    }

    let timeSeconds = Math.floor(Date.now()/1000);
    let needsFetch = false;
    let igdbContent = {};
    try {
        igdbContent = JSON.parse( fs.readFileSync(IGDB_PATH).toString() );
        let expires = igdbContent.expires;
        if( timeSeconds >= expires ) {
            needsFetch = true;
        }
    }
    catch(err) {
        // file malformed or does not exist
        needsFetch = true;
    }

    if( needsFetch ) {
        let fetched = await axios.post( IGDB_TWITCH_OAUTH_URL );
        if( fetched.data ) {
            igdbContent = fetched.data;
            igdbContent.expires = igdbContent.expires_in + timeSeconds;
            delete igdbContent.expires_in;
            delete igdbContent.token_type;
            igdbContent.Authorization = "Bearer " + igdbContent.access_token;
            delete igdbContent.access_token;
            fs.writeFileSync( IGDB_PATH, JSON.stringify(igdbContent) );
        }
        else {
            return Promise.resolve(ERROR_MESSAGES.couldNotFetchIGDBInfo);
        }
    }

    delete igdbContent.expires;
    igdbContent["Client-ID"] = IGDB_CLIENT_ID;
    return Promise.resolve(Object.assign( igdbContent, IGDB_HEADERS ));
}

/**
 * Get the Twitch headers.
 * We need a user access token as opposed to an app access token.
 * https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#oauth-authorization-code-flow
 * @returns {Promise<Object|string>} - The object that can be uses as the headers for Twitch requests or an error message.
 */
async function getTwitchHeaders() {
    if( !IGDB_CLIENT_ID || !IGDB_CLIENT_SECRET ) {
        return Promise.resolve(ERROR_MESSAGES.noApiKey);
    }

    let twitchContent = null;
    // refresh the token
    try {
        twitchContent = JSON.parse( fs.readFileSync(TWITCH_PATH).toString() );
        let fetched = await axios.post( TWITCH_REFRESH_TOKEN_URL + twitchContent.refresh_token );
        if( fetched.data ) {
            twitchContent = {
                refresh_token: fetched.data.refresh_token,
                access_token: fetched.data.access_token
            }
            fs.writeFileSync( TWITCH_PATH, JSON.stringify(twitchContent) );
        }
        else {
            return Promise.resolve(ERROR_MESSAGES.couldNotFetchTwitchInfo);
        }
    }
    // get a new token
    catch(err) {
        if( !TWITCH_CODE ) return Promise.resolve(ERROR_MESSAGES.noTwitchCode);
        // We have a code, we need to fetch the access tokens for the first time
        try {
            let fetched = await axios.post( TWITCH_CODE_TO_TOKEN_URL );
            if( fetched.data ) {
                twitchContent = {
                    refresh_token: fetched.data.refresh_token,
                    access_token: fetched.data.access_token
                }
                fs.writeFileSync( TWITCH_PATH, JSON.stringify(twitchContent) );
            }
            else {
                return Promise.resolve(ERROR_MESSAGES.invalidTwitchCode);
            }
        }
        catch(err) {
            return Promise.resolve(ERROR_MESSAGES.invalidTwitchCode);
        }
    }

    return Promise.resolve(Object.assign( {
        "Authorization": "Bearer " + twitchContent.access_token,
        "Client-Id": IGDB_CLIENT_ID
    }, TWITCH_HEADERS ));
}

/**
 * Check if updates are available.
 * @returns {boolean} True if updates are available.
 */
function guystationHasUpdates() {
    try {
        proc.execSync( GIT_FETCH_COMMAND );
        let updatesAvailable = parseInt(proc.execSync( GIT_UPDATES_AVAILABLE_COMMAND ).toString());
        if( updatesAvailable ) {
            return true;
        }
        else {
            return false;
        }
    }
    catch(err) {
        return false;
    }
}

/**
 * Update guystation to the latest version.
 * @returns {boolean} False.
 */
function updateGuystation() {
    proc.execSync( GIT_PULL_COMMAND );
    proc.execSync( NPM_INSTALL_COMMAND );
    return false;
}

/**
 * Restart guystation.
 * @returns {boolean|string} An error message if there is an error, false if not.
 */
function restartGuystation() {
    if( currentEmulator ) {
        return ERROR_MESSAGES.gameBeingPlayed;
    }
    for( let id of clientSocketIds ) {
        disconnectVirtualGamepad( id ); // Disconnect the virtual gamepad.
    }
    proc.spawn( RESTART_GUYSTATION_COMMAND, { shell: true, detached: true } );
    proc.execSync( KILL_GUYSTATION_COMMAND );
    return false;
}

/**
 * Reboot the computer guystation is running on.
 * @returns {boolean} False.
 */
function rebootGuystation() {
    try {
        proc.execSync( REBOOT_GUYSTATION_COMMAND );
    }
    catch(err) { /* seems like this command throws an error all the time, but it's probably safe to ignore */ }
    return false;
}

/**
 * Send a message.
 * @param {Object} message - The message object to send.
 * @param {Object} message.user - The user who sent the message.
 * @param {string} message.user.name - The nickname of the user who sent the message.
 * @param {string} message.user.id - The unique id of the user who sent the message.
 * @param {string} message.content - The content of the message.
 * @returns {boolean|string} An error message if there is an error, false if not.
 */
function sendMessage( message ) {
    if( !message.content || !message.user || !message.user.id ) {
        return ERROR_MESSAGES.invalidMessage;
    }

    if( !message.user.name ) {
        message.user.name = generateMessageUserName( message.user.id );
    }
    
    message.id = messages.length ? (messages[messages.length - 1].id + 1) : 0; // message ids go up in increments of one
    messages.push( message );
    messages = messages.slice( -MAX_MESSAGES_LENGTH );
    return false;
}

/**
 * Generate a username for some one who sent a message without a username.
 * @param {string} id - The unique ID of the user who sent the message.
 * @returns {string} A username.
 */
function generateMessageUserName( id ) {

    var previousMessages = messages.filter( (el) => el.user.id == id );
    if( previousMessages.length ) {
        return previousMessages[previousMessages.length - 1].user.name;
    }
    
    return USERNAME_OPTIONS[Math.floor(Math.random() * USERNAME_OPTIONS.length)];
}

/**
 * Set controls for multiple controllers.
 * @param {Array} controllers - An array with values that can be used for setControls.
 * @returns {boolean|string} An error message if there is an error, false if not.
 */
function setMultipleControls( controllers ) {
    controllers = controllers.sort().reverse(); // this is to set player 1 controls last to overwrite potential others
    for( let controller of controllers ) {
        setControls( controller.systems, controller.values, controller.controller, controller.nunchuk );
    }
}

/**
 * Set the controls for a system.
 * Note: We have a limited number of controls available, this is supposed to be a quick method to try
 * to set as many as possible.
 * For buttons a key will simply be the keycode, a gamepad button will be the button number, and the axis will be a number followed by a plus or minus sign.
 * example:
 * setControls( "n64", {
 *   {
 *     "A": [
 *       {
 *         "button": 1,
 *         "type": "button"
 *       },
 *       {
 *         "button": [118],
 *         "type": "key"
 *       }
 *     ],
 *     "Axis X-": [
 *       {
 *         "button": ["0-"],
 *         "type": "axis"
 *       }
 *     ]
 *   }
 * } );
 * @param {Array<string>} system - The systems to set controls for.
 * @param {Object} values - An object with keys being GuyStation buttons and values being an array of objects (each item is another control) containing a key for type and the button (can be axis+-/key) to set them to, or an array for multiple values (will be inserted for each $CONTROL in the control format) relating to a single control (note: we really only should ever receive one value, and we'll only use the first value - search for controlButtons for more).
 * @param {number} [controller] - The controller number to set controls for. 0,1,2, etc.
 * @param {boolean} [nunchuk] - True if we are setting the Wii to use the nunchuk extension.
 * @returns {boolean|string} An error message if there is an error, false if not.
 */
function setControls( systems, values, controller=0, nunchuk=false ) {

    for( let system of systems ) {

        if( !systemsDict[system] && system !== MENU ) return ERROR_MESSAGES.noSystem;

        if( isBrowserOrClone(system) || system === MENU ) { // browser is a simple, special case as it is controlled completely by us
            // unset keys will be deleted (search for: delete no control)
            let controlsObj = {};
            for( let key in values ) {
                for( let value of values[key] ) {
                    if( value && (value.type === AXIS_CONTROL_TYPE || value.type === BUTTON_CONTROL_TYPE) ) {
                        if( !controlsObj[key] ) controlsObj[key] = [];
                        let newVal = (value.chrome || value.chrome === 0) ? value.chrome : value.button;
                        if( typeof newVal === OBJECT_TYPE ) newVal = newVal[0];
                        controlsObj[key].push( newVal );
                    }
                }
            }
            if( isBrowserOrClone(system) ) {
                fs.writeFileSync( BROWSER_GAMEPAD_PATH, JSON.stringify(controlsObj) );
                browserControlsCache = JSON.parse(JSON.stringify(controlsObj)); // update the cache
            }
            else {
                menuPage.evaluate( (controlsObj) => {
                    window.localStorage.guystationJoyMapping = controlsObj;
                    joyMapping = JSON.parse(window.localStorage.guystationJoyMapping);
                }, JSON.stringify(controlsObj) );
            }
            continue;
        }
        // end browser special section

        if( !systemsDict[system].config ) return ERROR_MESSAGES.configNotAvailable;

        // Read all the config files
        let configFiles = systemsDict[system].config.files.map( file => {
            if( !fs.existsSync(file) ) {
                fsExtra.outputFileSync(file, "");
            }

            let str = fs.readFileSync(file).toString();
            // PSP has some strange characters at the start of the file not even printed by linux
            if( system == SYSTEM_PSP ) {
                str = str.replace(/\s\[/,"[");
            }
            return str;
        } );
        
        // Parse all the config files
        let configs = configFiles.map( configFile => {
            // Blastem has a custom configuration format that isn't the standard .ini file
            if( system == SYSTEM_SG ) {
                // manually parse the config file into JSON
                return JSON.parse(('{'+configFile+'}').replace(/#(.*)/g,"").replace(/(\S+)\s{/g, '"$1": {').replace(/([^\s}{]+)\s([^\r\n{]+)/g,'"$1":"$2"').replace(/"(\s+)"/g,'",$1"').replace(/}(\s+)"/g,'},$1"'));
            }
            else { 
                return ini.parse(configFile)
            }
        });
        let controls = systemsDict[system].config.controls;
        // control formats will map the common user expect values of "key", "button", and "axis" to whatever they are listed as in the ini file (e.g. "Keyboard")
        let controlFormat = systemsDict[system].config.controlFormat;
        let controllers = systemsDict[system].config.controllers;

        if( controller && (!controllers || !controllers[controller]) ) continue; // this system doesn't have a player 2 or what not.

        // disable default for 3ds
        if( system == SYSTEM_3DS ) {
            let config = configs[0];
            if( !config.Controls ) config.Controls = {};
            if( !config.UI ) config.UI = {};

            let controlsKeys = Object.keys(config.Controls);
            for( let key of controlsKeys ) {
                if( key.match(/profiles\\1\\.*\\default/) ) {
                    config.Controls[key] = false;
                }
                // citra expects these values wrapped in quotes, which the ini reader removes
                try {
                    if(config.Controls[key].match(/engine:/)) {
                        config.Controls[key] = '"' + config.Controls[key] + '"';
                    }
                }
                catch(err) {/*ok*/}
            }
            config.UI["Shortcuts\\Main%20Window\\Capture%20Screenshot\\KeySeq\\default"] = false;
        }

        let seenFinalKeys = {}; // This means we have a value for a mapping, so don't delete it (helps with axis and dpad mapped to "left")
        let seenFinalValues = {};
        // for each of the controls listed
        for( let control in controls ) {

            // get the value of the control from the values object
            // this is what we will set the value to
            // we have two seperate objects, the usercontrol object provided by the user telling us what to enter
            // and the controlInfo object from the system metadata guiding us on how to enter it
            let userControls = values[control];

            if( userControls ) {
                let controlParts = [];
                let keyControlParts = [];
                let controlInfo = controls[control];
                let config = controlInfo.iniIndex ? configs[controlInfo.iniIndex] : configs[0];
                controlInfo.actualControl = control; // this is used later.

                // we know we he have keys for everything, but we might not have nunchukKeys
                if( nunchuk && !controlInfo.nunchukKeys ) continue;

                // values need to be cleared out that are currently mapped to this control
                // only keyboard keys are valid for PS2 right now
                // Sega Genesis also has the user controls as the keys
                if( controlInfo.values && ( system !== SYSTEM_PS2 || userControls.filter( el => el.type == KEY_CONTROL_TYPE ).length ) ) {
                    if( system === SYSTEM_SG ) {
                        let index = 0;
                        let newValues = {};
                        for( let keySet of [controlInfo.buttonKeys, controlInfo.axisKeys, controlInfo.keyboardKeys] ) {
                            if( keySet ) {
                                // while ps2 games have all their keys at the root, we have to drill down to all the options for bindings for sega genesis
                                let configRoot = config;
                                for( let i=0; i<keySet.length; i++) {
                                    let currentKey = keySet[i];
                                    if( controller && controllers && currentKey.match(controllers[0]) ) currentKey = keySet[i].replace(controllers[0], controllers[controller]);
                                    if( !(currentKey in configRoot) ) configRoot[currentKey] = {};
                                    configRoot = configRoot[currentKey];
                                }
                                let value = controlInfo.values[0];
                                if( controllers && value.match(".n.") && index === 2 ) value = value.replace(".n.", "."+(parseInt(controllers[controller]) + 1)+"."); // THIS IS SPECIAL CUSTOM CODE FOR SEGA GENESIS SINCE CONTROLLER 0 IS 0 IN SOME PLACES AND 1 IN OTHERS
                                // we have drilled down to axes or buttons, now get each one
                                // delete no control
                                for( let keyName in configRoot ) {
                                    if( configRoot[keyName] === value ) { // for each control that can be set, we're going to delete what's there. keeping with the principal that if it is not set in config, it is removed.
                                        if( !seenFinalValues[value] ) {
                                            delete configRoot[keyName];
                                        }
                                    }
                                }
                                newValues[value] = true;
                            }
                            index++;
                        }
                        // Now for the next mapping that maps to this button (e.g. axis to left, we won't re-delete the previous values)
                        Object.assign( seenFinalValues, newValues );
                    }
                    else if( system === SYSTEM_PS2 ) {
                        // delete anything currently mapped to that control
                        // delete no control
                        let configKeys = Object.keys(config);
                        for(let configKey of configKeys) {
                            if( configKey.match( systemsDict[system].config.keyMatch + controller ) && // some of the keys aren't controls
                                config[configKey] == controlInfo.values[0] ) {
                                delete config[configKey];
                            }
                        }
                    }
                }
                
                if( !userControls.length ) userControls = [{}]; // this will clear out the key
                for( let userControl of userControls ) {

                    // Screenshot only allows keys (not buttons or axis)
                    if( userControl.type != KEY_CONTROL_TYPE && control == SCREENSHOT_CONTROL ) continue;

                    // in this case, the values in the ini are actually the controls for the emulator
                    // the keys are all at the root level for ps2
                    // we have to drill down to the keys for genesis
                    if( controlInfo.values ) {
                        // If multiple user controls (buttons is an array), they should just be entered as another entry.
                        // If there are duplicate keys, that should just mean one control goes to multiple different genesis controls
                        if( system == SYSTEM_SG ) {
                            let keySet = userControl.type === KEY_CONTROL_TYPE ? controlInfo.keyboardKeys : userControl.type === AXIS_CONTROL_TYPE ? controlInfo.axisKeys : controlInfo.buttonKeys;
                            if( keySet ) {
                                let configRoot = config;
                                for( let i=0; i<keySet.length; i++) {
                                    let currentKey = keySet[i];
                                    if( controller && controllers && currentKey.match(controllers[0]) ) currentKey = keySet[i].replace(controllers[0], controllers[controller]);
                                    if( !(currentKey in configRoot) ) configRoot[currentKey] = {};
                                    configRoot = configRoot[currentKey];
                                }
                                let value = controlInfo.values[0];
                                if( controllers && value.match(".n.") && userControl.type === KEY_CONTROL_TYPE ) value = value.replace(".n.", "."+(parseInt(controllers[controller]) + 1)+"."); // THIS IS SPECIAL CUSTOM CODE FOR SEGA GENESIS SINCE CONTROLLER 0 IS 0 IN SOME PLACES AND 1 IN OTHERS
                                let newKey = translateButton( system, userControl, controlInfo, controlFormat, null, config, controllers, controller );
                                if( newKey ) configRoot[newKey] = value;
                            }
                        }
                        else if( system == SYSTEM_PS2 ) {
                            // PS2 only allows key values right now
                            if( userControl.type == KEY_CONTROL_TYPE ) {
                                let newKey = translateButton( system, userControl, controlInfo, controlFormat, null, config, controllers, controller );
                                config[newKey] = controlInfo.values[0];
                            }
                        }
                        continue;
                    }

                    // we might have sections for both keyboard keys and gamepad keys
                    // the default keys are always gamepad
                    // note that this is different to when we can set multiple controls, both keyboard and gamepad,
                    // to a button. This is when in the config, they are actually in two seperate places.
                    let keys = controlInfo.keys;
                    if( nunchuk ) keys = controlInfo.nunchukKeys;
                    let curControlParts = controlParts;
                    if( userControl.type == KEY_CONTROL_TYPE && controlInfo.keyboardKeys ) {
                        keys = controlInfo.keyboardKeys;
                        curControlParts = keyControlParts;
                    }

                    // we are going to get the innermost nested object and set it's value
                    let configSetting = config;
                    for( let i=0; i<keys.length - 1; i++) {
                        let currentKey = keys[i];
                        if( controller && controllers && currentKey.match(controllers[0]) ) currentKey = keys[i].replace(controllers[0], controllers[controller]);
                        if( !(currentKey in configSetting) ) configSetting[currentKey] = {};

                        configSetting = configSetting[currentKey];
                    }

                    let finalKey = keys[keys.length-1];
                    // we may have a slightly different path for the specific controller
                    if( controller && controllers && finalKey.match(controllers[0]) ) finalKey = finalKey.replace(controllers[0], controllers[controller]);

                    // Note that a control can require multiple components (e.g. an axis with X plus and X minus) which thus userControl.button is an array
                    // This is different to when there are multiple controls mapped to a button (e.g. Dpad left and arrow key left) in which case both need to be run through translateButton
                    // however, we actually seperate out everything, so the user should only ever pass a single item in an array. we'll add to it from pre-exising as need be.
                    curControlParts.push( translateButton( system, userControl, controlInfo, controlFormat, configSetting[finalKey], config, controllers, controller, nunchuk ) );

                    // we only allow one control for systems except vba-m and ppsspp
                    if( system != SYSTEM_GBA && system != SYSTEM_PSP ) {
                        curControlParts = [curControlParts[0]];
                    }
                    else if(seenFinalKeys[finalKey]) {
                        curControlParts = [...(configSetting[finalKey].split()), ...curControlParts].filter(el => el);
                    }
   
                    // We'll just update each time
                    if( curControlParts.length === 1 && !curControlParts[0] ) delete configSetting[finalKey]; // delete no control
                    else {
                        configSetting[finalKey] = curControlParts.join(CONFIG_JOINER);
                        seenFinalKeys[finalKey] = true;
                    }
                }
            }
        }

        let configIndex = 0;
        for( let config of configs ) {
            let writeValue;
            if( system === SYSTEM_SG ) {
                writeValue = JSON.stringify(config, null, 2).replace(/[\",:]/g,"").replace(/  /g,"\t");
                writeValue = writeValue.replace(/^\s*{/,"");
                writeValue = writeValue.replace(/}$/,"");
                writeValue = writeValue.replace(/\n\t/g,"\n");
            }
            else {
                writeValue = ini.stringify(config, {'whitespace': system == SYSTEM_NES || system == SYSTEM_PSP || system == SYSTEM_PS2 || system == SYSTEM_NGC ? true : false});

                // the ini file tries to escape the wrapped quotes, but citra doesn't like that.
                if( system == SYSTEM_3DS ) writeValue = writeValue.replace( /"\\"|\\""/g, '"');
                // VBAM just uses characters as keys but ini tries to escape them.
                else if( system == SYSTEM_GBA ) writeValue = writeValue.replace( /\\;/g, ';' );
                // desmume should never have quotes
                else if(system == SYSTEM_NDS && configIndex == 1) writeValue = writeValue.replace( /"|'/g, "" );
            }

            fs.writeFileSync(systemsDict[system].config.files[configIndex], writeValue);
            configIndex++;
        }

    }
    return false;
}

/**
 * Translate a control from the user to what the emulator expects.
 * The user will send us a key code, a button number, or an axis+-. These then, will be mapped
 * to what the emulator expects.
 * @param {string} system - The system the controls are for.
 * @param {Object} userControl - The control information set by the user including a type key and an array of, or just a string for the button key. It can also include keys for vendor and product code for the controller.
 * @param {Object} controlInfo - The control info guide for how to put the result in the config file.
 * @param {string} controlFormat - The format for the control.
 * @param {string} currentControlValue - The current control value for the config setting. We might need to include some of it in the new value.
 * @param {Object} config - The root config object.
 * @param {Array} [controllers] - Different controller values for each player.
 * @param {number} [controller] - The controller index.
 * @param {boolean} [nunchuk] - True if the Wii extension is for a nunchuk.
 * @returns {string} The translated value for the emulator.
 */
function translateButton( system, userControl, controlInfo, controlFormat, currentControlValue, config, controllers, controller=0, nunchuk=false ) {
    let controlButtons = userControl.button;
    if( typeof controlButtons != OBJECT_TYPE ) controlButtons = [controlButtons];

    // we can have different format's for different types for more flexibility if need be
    if( typeof controlFormat == OBJECT_TYPE ) controlFormat = controlFormat[userControl.type];
    // we can have different formats for the type of button
    // for example, if we are mapping an axis on the user controller to an axis on the emulator controller
    // we may have a different format than if we are mapping an axis on the user controller to a button on the emalator controller
    if( typeof controlFormat == OBJECT_TYPE ) controlFormat = controlFormat[controlInfo.type ? controlInfo.type : BUTTON_CONTROL_TYPE];

    // we can read controls from a regex if each line has multiple controls

    controlButtons = [controlButtons[0]]; // IMPORTANT
    if( controlInfo.controlsRegex ) {
        let controlsRegex = controlInfo.controlsRegex;
        let selfPosition = controlInfo.selfPosition;
        // the controlsRegex can be an object and we can use a different regex based on what the USER is setting
        // the reason we need this is because an emulator may have different formats for different types, and we
        // need to be able to read those formats
        // so for regex, it's like the controlFormat object, except the inner value in that is implied (emulator type = axis),
        // and the outer value (user type) is specified.
        if( typeof controlsRegex == OBJECT_TYPE ) controlsRegex = controlsRegex[userControl.type];
        if( typeof selfPosition == OBJECT_TYPE ) selfPosition = selfPosition[userControl.type];

        // basically if the current type (axis, buttons, key) matches the type we are setting, we'll pull current values from it,
        // otherwise, we just reset/clear out the string
        // when we don't have typed controls regexs like for mupen, we'll make whatever's there. So if the user is mapping
        // a keyboard key to an axis, but only one direction, the other direction might really correspond to
        // an axis, so we might have key(65,1+) until they change it.

        let match = currentControlValue ? currentControlValue.match(new RegExp(controlsRegex)) : null;
        let newControl = controlButtons[0];
        if( match ) {
            // only get the matches
            controlButtons = match.slice(1);
        }
        else {
            // create an empty array long enough to properly fill all the $CONTROL values in the format
            controlButtonsLength = (controlFormat.match(new RegExp(CONTROL_STRING.replace("$","\\$"), "g")) || []).length;
            controlButtons = [];
            for( let i=0; i<controlButtonsLength; i++ ) {
                controlButtons.push("");
            }
        }
        controlButtons[selfPosition] = newControl;
    }

    // For n64, we use key(keycode)
    if( system == SYSTEM_N64 ) {
        if( userControl.type == KEY_CONTROL_TYPE ) {
            // mupen expects the sdl keycodes
            controlButtons = controlButtons.map( el => el && sdlMap[el] ? sdlMap[el] : el );
            if( controlInfo.actualControl == SCREENSHOT_CONTROL ) controlFormat = CONTROL_STRING;
        }

        let controllerKey = N64_MANUAL_CONTROLLER;
        if( controller && controllers && controllerKey.match(controllers[0]) ) controllerKey = controllerKey.replace(controllers[0], controllers[controller]);
        if( !config[controllerKey] ) config[controllerKey] = {};
        config[controllerKey][N64_MANUAL_KEY] = N64_MANUAL_VALUE;
        config[controllerKey][N64_DEVICE_KEY] = controller;
    }
    // gba expects uppercase key names
    else if( system == SYSTEM_GBA && userControl.type == KEY_CONTROL_TYPE ) {
        // vbam expects a certain mapping
        controlButtons = controlButtons.map( el => el ? vbamMap[el] : el );
    }
    // desmume is custom
    else if( system == SYSTEM_NDS ) {
        if( userControl.type == KEY_CONTROL_TYPE ) {
            if( controlInfo.actualControl == SCREENSHOT_CONTROL ) controlButtons = controlButtons.map( el => el ? gdkNameMap[el] : el );
            else controlButtons = controlButtons.map( el => el ? gdkMap[el] : el );
        }
        else if( userControl.type ) {
            controlButtons = controlButtons.map( el => codeToDesmumeJoystick(userControl.type, el) );
        }
    }
    // snes expects x11 key names and a space between the axis and direction
    else if( system == SYSTEM_SNES ) {
        if( userControl.type == KEY_CONTROL_TYPE ) {
            controlButtons = controlButtons.map( el => el ? x11Map[el] : el );
        }
        else {
            controlFormat = controlFormat.replace("1", controller+1);
            if( userControl.type == AXIS_CONTROL_TYPE ) {
                controlButtons = controlButtons.map( function(button) {
                    let axis = button.substring(0, button.length-1);
                    let direction = button.substring(button.length-1);
                    return axis + " " + direction;
                } );
            }
        }
    }
    // For 3ds
    else if( system == SYSTEM_3DS ) {
        if( userControl.type == KEY_CONTROL_TYPE ) {
            if( controlInfo.actualControl == SCREENSHOT_CONTROL ) {
                controlFormat = CONTROL_STRING;
                // citra expects the keycodes of lowercase keys
                controlButtons = controlButtons.map( el => el && citraMap[el] ? citraMap[el] : el );
            }
            else {
                // citra expects the keycodes of lowercase keys
                controlButtons = controlButtons.map( el => el && qtMap[el] ? qtMap[el] : el );
            }
        }
        // for mapping a user axis to a button
        else if ( userControl.type == AXIS_CONTROL_TYPE && (!controlInfo.type || controlInfo.type == BUTTON_CONTROL_TYPE) ) {
            // add the direction
            controlButtons = controlButtons.map( function(button) {
                let axis = button.substring(0, button.length-1);
                let direction = button.substring(button.length-1);
                return axis + DIRECTION_MODIFIER_3DS + direction;
            } );
        }
        // for mapping an axis to an axis
        else if ( userControl.type == AXIS_CONTROL_TYPE && (controlInfo.type == AXIS_CONTROL_TYPE) ) {
            // remove the direction
            controlButtons = controlButtons.map( function(button) {
                let axis = button;
                if( button.length > 1 ) axis = button.substring(0, button.length-1);
                return axis;
            } );
        }
    }
    // For NES
    else if( system == SYSTEM_NES ) {

        let controllerKey = NES_DEVICE_TYPE_KEY;
        if( controller && controllers && controllerKey.match(controllers[0]) ) controllerKey = controllerKey.replace(controllers[0], controllers[controller]);
        config[controllerKey] = NES_JOYSTICK;

        if( userControl.type == AXIS_CONTROL_TYPE ) {
            // https://github.com/TASVideos/fceux/blob/5be92d3ee50fcdc04ec4d727cef5201fa8fba378/src/attic/pc/sdl.c#L354
            controlButtons = controlButtons.map( function(button) {
                let axis = button.substring(0, button.length-1);
                let direction = button.substring(button.length-1);
                return 0x8000|axis|(direction == DIRECTION_PLUS ? 0 : 0x4000);
            } );
        }
        else if( userControl.type == KEY_CONTROL_TYPE ) {
            controlButtons = controlButtons.map( el => el ? sdlMap[el] : el );
            if( controlInfo.actualControl != SCREENSHOT_CONTROL ) config[controllerKey] = NES_KEYBOARD;
        }
    }
    // for psp
    else if( system == SYSTEM_PSP ) {
        if( userControl.type == AXIS_CONTROL_TYPE || userControl.type == BUTTON_CONTROL_TYPE ) {

            if( !ppssppControllersMap ) ppssppControllersMap = generatePpssppControllersMap( systemsDict[SYSTEM_PSP].controllerDbLocation );

            let controller = ppssppControllersMap[ DEFAULT_PSP_CONTROLLER_ID ];
            // perform the similar functions to get an sdl-like guid
            if( userControl.vendor && userControl.product ) {
                // the values are hex values, we need them to be denoted as such internally
                let vendorId = parseInt("0x" + userControl.vendor);
                let productId = parseInt("0x" + userControl.product);
                let lookupString = 
                    padZeros( (vendorId & 0xFF).toString(16), 2 ) + 
                    padZeros( (vendorId >> 8).toString(16), 2 ) + "-" +
                    padZeros( (productId & 0xFF).toString(16), 2 ) + 
                    padZeros( (productId >> 8).toString(16), 2 );
                if( ppssppControllersMap[lookupString] ) {
                    controller = ppssppControllersMap[ lookupString ];
                }
            }

            if( userControl.type == AXIS_CONTROL_TYPE ) {
                // prepend with the axis code
                controlButtons = controlButtons.map( el => {
                    // if we don't have a controller or it doesn't exist in the map, just use the first controller
                    // in the map
                    if( el ) {
                        let axis = el.substring(0, el.length-1);
                        let direction = el.substring(el.length-1);
                        return ppssppButtonsMap[ controller[PSP_AXIS_PREPEND+axis] ] + (direction == DIRECTION_PLUS ? 0 : 1);
                    }
                    return el;
                } );
            }
            else {
                // prepend with the button code
                controlButtons = controlButtons.map( el => {
                    // if we don't have a controller or it doesn't exist in the map, just use the first controller
                    // in the map
                    return el ? ppssppButtonsMap[ controller[el.toString()] ] : el
                } );
            }
        }
        else {
            // prepend with the keyboard code
            controlButtons = controlButtons.map( el => el ? ppssppMap[el] : el );
        }
    }
    else if( system == SYSTEM_PS2 ) {
        if( controlInfo.actualControl == SCREENSHOT_CONTROL ) {
            controlButtons = controlButtons.map( el => el ? pcsx2Map[el] : el );
            controlFormat = CONTROL_STRING;
        }
        else {
            controlFormat = controlFormat.replace("0", controller);
            // We should know it is key type by now
            //if( userControl.type == KEY_CONTROL_TYPE ) {
                controlButtons = controlButtons.map( el => el ? ( "0x" + x11CodeMap[el].toString(16) ) : el );
            //}
        }
    }
    else if( system == SYSTEM_SG ) {
        if( userControl.type == KEY_CONTROL_TYPE ) {
            // vbam expects a certain mapping
            controlButtons = controlButtons.map( el => el ? blastemMap[el] : el );
        }
        else if( userControl.type == AXIS_CONTROL_TYPE ) {
            controlButtons = controlButtons.map( el => el.replace("-",".negative").replace("+",".positive") );
        }
    }
    // gamecube and wii
    else if( system == SYSTEM_NGC || system == SYSTEM_WII ) {
        let padKey = system == SYSTEM_NGC ? NGC_PAD_KEY : WII_PAD_KEY;
        if( controller && controllers && padKey.match(controllers[0]) ) padKey = padKey.replace(controllers[0], controllers[controller]);
        
	    if( controlInfo.actualControl != SCREENSHOT_CONTROL) {
            if( !config[padKey] ) config[padKey] = {};

            config[padKey][NGC_DEVICE_TYPE_KEY] = NGC_GAMEPAD.replace("0", controller); 

            if( system == SYSTEM_WII ) {
                config[padKey][WII_CLASSIC_KEY] = nunchuk ? WII_NUNCHUK_VALUE : WII_CLASSIC_VALUE;
                config[padKey][WII_SOURCE_KEY] = WII_SOURCE_EMULATED;
            }
        }

        // dolphin uses x11 map for keys
        if( userControl.type == KEY_CONTROL_TYPE ) {
            controlButtons = controlButtons.map( el => {
                let value = el;
                if( x11Map[el] ) {
                    value = x11Map[el];
                    if( value.length == 1 ) value = value.toUpperCase();
                }
                return value;
             } );
            if( controlInfo.actualControl != SCREENSHOT_CONTROL) config[padKey][NGC_DEVICE_TYPE_KEY] = NGC_VIRTUAL_KEYBOARD;//.replace("0", controller); Multiple keyboards probably isn't what we'd excpect, so keep at 0 for device num
            else config[HOTKEY_PAD_KEY][NGC_DEVICE_TYPE_KEY] = NGC_VIRTUAL_KEYBOARD; 
        }
    }
    
    if( !userControl.type ) return ""; // null control - this is when they enter a blank control and we need to clear it out

    // replace each instance of control string
    for( let controlButton of controlButtons ) {
        controlFormat = controlFormat.replace(CONTROL_STRING, controlButton);
    }
    // get rid of any extra control strings
    // we shouldn't need this. but it is a failsafe
    while( controlFormat.indexOf(CONTROL_STRING) != -1 ) controlFormat = controlFormat.replace(CONTROL_STRING,"");

    // 3DS needs them wrapped in quotes
    if( system == SYSTEM_3DS ) controlFormat = '"' + controlFormat + '"';

    return controlFormat;
}

/**
 * Pad a number with the specified number of zeros.
 * @param {number} number - The number to pad.
 * @param {number} totalDigits - The number of digits the number should have.
 * @returns {string} - The padded number
 */
function padZeros( number, totalDigits ) {
    for( let i=0; i<totalDigits; i++ ) {
        number = "0" + number.toString();
    }
    number = number.slice(-totalDigits);
    return number;
}

/**
 * Convert a joystick button.
 * See here: https://github.com/TASVideos/desmume/blob/23f4dcc0094e9dcb77494593831b6aef9aaf3b5b/desmume/src/frontend/posix/shared/ctrlssdl.cpp#L50
 * @param {string} type - The type of button (button or axis)
 * @param {string} button - The button value (e.g. 2 or 1+)
 * @returns {number} The Desmume joypad code. 
 */
function codeToDesmumeJoystick( type, button ) {
    if( type == BUTTON_CONTROL_TYPE ) {
        // player 1 controller
        return 0x200 + parseInt(button);
    }
    // this is an axis
    else {
        let axis = button.substring(0, button.length-1);
        let direction = button.substring(button.length-1);
        return 2 * parseInt(axis) + (direction == DIRECTION_PLUS ? 1 : 0);
    }
}

/**
 * Create the virtual gamepad.
 * Modified from here: https://github.com/hyamanieu/node-custom-virtual-gamepads/blob/master/app/virtual_gamepad.js
 * @param {string} id - The id of the connecting client.
 * @param {number} controllerNum - The controller number from a particular client.
 * @returns {boolean|string} An error message if there is an error, false if not.
 */
function createVirtualGamepad( id, controllerNum ) {
    let gamepadFileDescriptor;
    try {
        gamepadFileDescriptor = fs.openSync(UINPUT_PATH, UINPUT_MODE);
        if( !gamepadFileDescriptors[id] ) gamepadFileDescriptors[id] = {};
        gamepadFileDescriptors[id][controllerNum] = gamepadFileDescriptor;
    }
    catch(err) {
        return ERROR_MESSAGES.couldNotCreateGamepad;
    }
    // This is currently set to be the same order as PADCODES on the client, and thus the default
    // order that linux expects.
    // Note that the button number is just the buttons order when they are sorted by their hex value
    // as registered with GuyStation and the emulators
    // We strongly recommend that users autoload a profile that will include a 1-1 mapping
    // e.g. (A in dolphin is button 0, B is button 1)
    // The client will detect a button press, say 2.
    // The client will see that button 2 is mapped to button 4.
    // The client will see button 4 is Y in PADCODES, and thus send a Y press to the server
    // Since this is the same order as PADCODES, we will see that Y is indeed button 4, and press it
    // button 4 may not actually be Y to the emulator, button 4 will be whatever it is set to in the EZ config
    ioctl(gamepadFileDescriptor, uinput.UI_SET_EVBIT, uinput.EV_KEY);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_KEYBIT, uinput.BTN_A);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_KEYBIT, uinput.BTN_B);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_KEYBIT, uinput.BTN_X);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_KEYBIT, uinput.BTN_Y);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_KEYBIT, uinput.BTN_TL);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_KEYBIT, uinput.BTN_TR);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_KEYBIT, uinput.BTN_TL2);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_KEYBIT, uinput.BTN_TR2);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_KEYBIT, uinput.BTN_SELECT);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_KEYBIT, uinput.BTN_START);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_KEYBIT, uinput.BTN_MODE);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_KEYBIT, uinput.BTN_THUMBL);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_KEYBIT, uinput.BTN_THUMBR);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_KEYBIT, uinput.BTN_DPAD_UP);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_KEYBIT, uinput.BTN_DPAD_DOWN);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_KEYBIT, uinput.BTN_DPAD_LEFT);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_KEYBIT, uinput.BTN_DPAD_RIGHT);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_EVBIT, uinput.EV_ABS);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_ABSBIT, uinput.ABS_X);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_ABSBIT, uinput.ABS_Y);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_ABSBIT, uinput.ABS_RX);
    ioctl(gamepadFileDescriptor, uinput.UI_SET_ABSBIT, uinput.ABS_RY);
    // hat axis
    //ioctl(gamepadFileDescriptor, uinput.UI_SET_ABSBIT, uinput.ABS_HAT0X);
    //ioctl(gamepadFileDescriptor, uinput.UI_SET_ABSBIT, uinput.ABS_HAT0Y);
    uidev = new uinputStructs.uinput_user_dev;
    uidev_buffer = uidev.ref();
    uidev_buffer.fill(0);
    uidev.name = Array.from(VIRTUAL_GAMEPAD_NAME);
    uidev.id.bustype = uinput.BUS_USB;
    uidev.id.vendor = 0x3;
    uidev.id.product = 0x3;
    uidev.id.version = 2;
    for( let axis of [uinput.ABS_X, uinput.ABS_Y, uinput.ABS_RX, uinput.ABS_RY/*, uinput.ABS_HAT0X, uinput.ABS_HAT0Y*/] ) {
        uidev.absmax[axis] = 128;
        uidev.absmin[axis] = -128;
        uidev.absfuzz[axis] = 0;
        uidev.absflat[axis] = 15;
    }
    try {
        fs.writeSync(gamepadFileDescriptor, uidev_buffer, 0, uidev_buffer.length, null);
    }
    catch(err) {
        fs.closeSync(gamepadFileDescriptor);
        delete gamepadFileDescriptors[id][controllerNum];
        if( !Object.keys(gamepadFileDescriptors[id]).length ) delete gamepadFileDescriptors[id];
        return ERROR_MESSAGES.couldNotCreateGamepad;
    }
    try {
        ioctl(gamepadFileDescriptor, uinput.UI_DEV_CREATE);
    }
    catch(err) {
        fs.closeSync(gamepadFileDescriptor);
        delete gamepadFileDescriptors[id][controllerNum];
        if( !Object.keys(gamepadFileDescriptors[id]).length ) delete gamepadFileDescriptors[id];
        return ERROR_MESSAGES.couldNotCreateGamepad;
    }
    return false;
}

/**
 * Disconnect the virtual gamepad.
 * Modified from here: https://github.com/hyamanieu/node-custom-virtual-gamepads/blob/master/app/virtual_gamepad.js
 * @param {string} id - The id of the connecting client.
 * @returns {boolean|string} An error message if there is an error, false if not.
 */
function disconnectVirtualGamepad( id ) {
    let idControllers = gamepadFileDescriptors[id];
    if( !idControllers ) {
        return ERROR_MESSAGES.gamepadNotConnected;
    }
    for( let controllerNum in idControllers ) {
        let gamepadFileDescriptor = idControllers[controllerNum];
        ioctl(gamepadFileDescriptor, uinput.UI_DEV_DESTROY);
        fs.closeSync(gamepadFileDescriptor);
    }
    delete gamepadFileDescriptors[id];
}

/**
 * Create a gamepad event.
 * Modified from here: https://github.com/hyamanieu/node-custom-virtual-gamepads/blob/master/app/virtual_gamepad.js
 * @param {Object} event - The gamepad event from the client.
 * @param {Object} gamepadFileDescriptor - The file descriptor for the current controller.
 */
function createGamepadEvent(event, gamepadFileDescriptor) {
    if( gamepadFileDescriptor ) {
        ev = new uinputStructs.input_event;
        ev.type = event.type;
        ev.code = event.code;
        ev.value = event.value;
        ev.time.tv_sec = Math.round(Date.now() / 1000);
        ev.time.tv_usec = Math.round(Date.now() % 1000 * 1000);
        ev_buffer = ev.ref();
        ev_end = new uinputStructs.input_event;
        ev_end.type = 0;
        ev_end.code = 0;
        ev_end.value = 0;
        ev_end.time.tv_sec = Math.round(Date.now() / 1000);
        ev_end.time.tv_usec = Math.round(Date.now() % 1000 * 1000);
        ev_end_buffer = ev_end.ref();
        try {
            fs.writeSync(gamepadFileDescriptor, ev_buffer, 0, ev_buffer.length, null);
        }
        catch(err) {}
        try {
            fs.writeSync(gamepadFileDescriptor, ev_end_buffer, 0, ev_end_buffer.length, null);
        }
        catch(err) {}
    }
}

/**
 * Add an EZ Control Profile.
 * @param {string} name - The name of the profile.
 * @param {Object} profile - The profile info.
 * @returns {(boolean|string)} An error message if there is one or false if there is not.
 */
function addEzControlProfile( name, profile ) {
    if( !name || !profile ) return ERROR_MESSAGES.invalidProfile;
    loadEzControlsProfiles();
    profilesDict[name] = profile;
    saveEzControlsProfiles();
    return false;
}

/**
 * Delete an EZ Control Profile.
 * @param {string} name - The name of the profile.
 * @returns {(boolean|string)} An error message if there is one or false if there is not.
 */
function deleteEzControlProfile( name ) {
    if( !name ) return ERROR_MESSAGES.invalidProfile;
    loadEzControlsProfiles();
    delete profilesDict[name];
    saveEzControlsProfiles();
    return false;
}

/**
 * Load EZ Controls Profiles.
 */
function loadEzControlsProfiles() {
    if( !fs.existsSync( EZ_CONTROL_PATH ) ) saveEzControlsProfiles();
    profilesDict = JSON.parse( fs.readFileSync( EZ_CONTROL_PATH ) );
}

/**
 * Save EZ Controls Profiles.
 */
function saveEzControlsProfiles() {
    if( !fs.existsSync( EZ_CONTROL_PATH ) ) {
        // Add the default profile
        profilesDict = DEFAULT_PROFILES_DICT;
    }
    fs.writeFileSync( EZ_CONTROL_PATH, JSON.stringify(profilesDict) );
}

// Listen for the "home" button to be pressed
ioHook.on("keydown", async function(event) {
    if( event.keycode == ESCAPE_KEY ) {
        if( !hookLocked ) {
            hookLocked = true;
            // If the menu page is open, but not focused and we're not playing a game or video
            // that's OK, the user may be using the computer for something else
            // A glitch may have left them not focused, but usually not
            if( currentEmulator || fullscreenPip ) await goHome();
            hookLocked = false
        }
    }
});
ioHook.start();

// Signal server section
let streamerMediaReady = false;
let clientJoined = false;
let SERVER_ID = "server";
let serverSocketId;
let clientSocketIds = [];
let startedClientIds = [];
let cancelStreamingTimeouts = {};
// The signal server is also used as an rmtp converter, those variables are below
let ffmpegProcess = null;
let feedStream = false;
io.on('connection', function(socket) {
    socket.on("connect-screencast-streamer", function() {
        if( !serverSocketId ) {
            console.log("screencast streamer connected");
            serverSocketId = socket.id;
        }
    } );
    // we have to wait for the following two events until we are ready
    // to start streaming
    socket.on("streamer-media-ready", function() {
        console.log("screencast media ready");
        streamerMediaReady = true;

        // we need to wait until Chrome is recording before we can do this.
        bindOutputToChromeInput();

        if( clientJoined ) {
            for( let clientSocketId of clientSocketIds.filter( el => !startedClientIds.includes(el) ) ) {
                startScreencast(clientSocketId);
            }
        }
    } );
    socket.on("connect-screencast-client", function() {
        if( clientSocketIds.indexOf(socket.id) == -1 ) {
            console.log("screencast client connected");
            clientSocketIds.push(socket.id);
            // the client will only connect
            // this will always happen after the server connect
            // since client connect is the success function when we call to server connect
            // as such, we can now tell the server to start the stream
            clientJoined = true;
            if( streamerMediaReady ) {
                for( let clientSocketId of clientSocketIds.filter( el => !startedClientIds.includes(el) ) ) {
                    startScreencast(clientSocketId);
                }
            }
        }
    } );
    socket.on("sdp", function(message) {
        if( socket.id == serverSocketId ) {
            io.to(message.id).emit("sdp", { "id": SERVER_ID, "sdp": message.description });
        }
        else if( clientSocketIds.includes(socket.id) ) {
            io.to(serverSocketId).emit("sdp", { "id": socket.id, "sdp": message.description } );
        }
    } );
    socket.on("ice", function(message) {
        if( socket.id == serverSocketId ) {
            io.to(message.id).emit("ice", { "id": SERVER_ID, "ice": message.candidate });
        }
        else if( clientSocketIds.includes(socket.id) ) {
            io.to(serverSocketId).emit("ice", { "id": socket.id, "ice": message.candidate } );
        }
    } );
    // all some requests to come through socket.io too
    // these are requests that we want to be fast
    // websockets are faster than http requests
    socket.on("/screencast/mouse", function(body, ack) {
        performScreencastMouse( body.xPercent, body.yPercent, body.button, body.down, parseInt(body.counter), parseInt(body.timestamp) );
        if(ack) ack();
    } );
    socket.on("/screencast/buttons", function(body, ack) {
        performScreencastButtons( body.buttons, body.down, parseInt(body.counter), parseInt(body.timestamp) );
        if(ack) ack();
    } );
    socket.on("/screencast/gamepad", function(body, ack) {
        performScreencastGamepad( body.event, body.id, parseInt(body.controllerNum), parseInt(body.counter), parseInt(body.timestamp) );
        if(ack) ack();
    } );
    // generalized request handler through socket.io
    // body should contain method and url keys
    // https://stackoverflow.com/questions/33090091/is-it-possible-to-call-express-router-directly-from-code-with-a-fake-request
    socket.on("request", function(body, ack) {
        app.handle(body, {
            end: function(responseString) {
                ack(responseString);
            },
            setHeader: function() {},
            getHeader: function() {return ""},
            headers: []
        }); 
    } );

    // rtmp endpoints
    socket.on("error", function(err) {
        console.log(err);
    });
    socket.on("rtmp-start", function( destination ) {
        try {
            if( rtmpOn() ) return;
            let ops = [
                '-i','-',
                '-c:v', 'copy',   // video codec config: low latency, adaptive bitrate
                '-c:a', 'aac', '-ar', 44100, '-b:a', "44k", // audio codec config: sampling frequency (11025, 22050, 44100), bitrate 64 kbits
                '-bufsize', '5000',
                '-f', 'flv', destination
            ];
            ffmpegProcess = proc.spawn("ffmpeg", ops);
            feedStream = function(data) {
                try {
                    ffmpegProcess.stdin.write(data);
                }
                catch(err) {
                    console.log(err);
                    // ok, may happen
                }
            }
            ffmpegProcess.stderr.on('data', function( data ) {
                console.log( "ffmpeg stderr: " + data);
            });
            ffmpegProcess.on("error", function(e) {
                console.log( "ffmpeg error " + e );
                feedStream = false;
                // if feedStream is nullified because of an error, and we are still receiving media recorder information,
                // stop the stream on the menuPage. This will stop sending unecessary information.
                // this will stop the recorder on the menuPage, then call the stop endpoint to set feedStream to false.
                stopRtmp();
            });
            ffmpegProcess.on("exit", function(e) {
                console.log( "ffmpeg exit " + e );
                feedStream = false;
                stopRtmp();
            });
        }
        catch(err) {
            console.log(err);
        }
    });
    socket.on("rtmp-binarydata", function( data ) {
        try {
            if( !feedStream ) {
                return;
            }
            feedStream( data );
        }
        catch(err) {
            console.log(err);
        }
    });
    socket.on("rtmp-stop", function() {
        try {
            feedStream = false;
            if( ffmpegProcess ) {
                try {
                    ffmpegProcess.stdin.end();
                    ffmpegProcess.kill("SIGINT");
                }
                catch(err) {
                    console.log(err);
                }
                ffmpegProcess = null;
            }
        }
        catch(err) {
            console.log(err);
        }
    });
} );
process.on('uncaughtException', function(err) {
    console.log(err);
    // Note: after client disconnect, the subprocess will cause an Error EPIPE, which can only be caught this way.
});


/**
 * Reset the streaming timeout heartbeat time.
 * @param {string} [id] - The id of the client.
 * @returns {boolean} Returns false.
 */
function resetScreencastTimeout( id ) {
    clearTimeout(cancelStreamingTimeouts[id]);
    cancelStreamingTimeouts[id] = setTimeout( function() {
        if( serverSocketId ) { 
            stopScreencast(id); } 
        },
    STREAMING_HEARTBEAT_TIME );
    return false;
}

/**
 * Connect the menuPage to the signal server.
 * @param {string} id - The id of the socket asking the menuPage to connect.
 * @param {number} [noController] - True if we should not create a controller.  
 * @returns {Promise<(boolean|string)>} An error message if there is one or false if there is not.
 */
async function connectScreencast( id, numControllers ) {
    if( !menuPage || menuPage.isClosed() ) {
        return Promise.resolve(ERROR_MESSAGES.menuPageClosed);
    }

    resetScreencastTimeout( id ); // add to the screencast timeouts
    // this is extra security beyond oniceconnectionstatechange in case the connection never happens
    // so it never disconnects

    // connect the virtual gamepad if necessary
    if( !gamepadFileDescriptors[id] && numControllers ) {
        for( let i=0; i<numControllers; i++ ) {
            createVirtualGamepad( id, i );
        }
    }

    // do not connect again if we are already connected
    if( serverSocketId ) {
        return Promise.resolve(false);
    }

    await screencastPrepare(startedClientIds.length);

    // focus on guy station
    await menuPage.evaluate( () => connectToSignalServer(true) );

    return Promise.resolve(false);
}

/**
 * Prepare for the screencast to start.
 * It will make some changes, and here we prepare
 * to make them in screencastFix.
 * @param {boolean} alreadyStarted - True if the screencast has already started.
 * @returns {Promise<(boolean)>} A promise containing false.
 */
async function screencastPrepare(alreadyStarted) {
    if( typeof alreadyStarted === 'undefined' ) alreadyStarted = startedClientIds.length;
    // starting a screencast will activate the home tab
    // it is best to predict that and to it anyway
    if( (currentEmulator || fullscreenPip) && !alreadyStarted && ( !menuPageIsActive() || (await menuPage.evaluate(() => isRemoteMediaActive())) ) ) { 
        // Get the current resolution of the emulator	
        // I was getting an error where, despite the n64 emulator being active, it hadn't yet changed the screen resolution
        // by the time we were getting the screen resolution to determine the "emulatorResolution"
        // As such, now for n64 we will just determine the window resolution, as we know that's what the
        // screen resolution will be set to, once it gets the chance.
        // Additionally, sometimes when done here it was reported wrong.
        // We really only ever need it on launch, however, so thats where we do it. Once we've launched and
        // we're sure it's been fullscreened.

        let currentlyFullscreenPip = fullscreenPip;

        await goHome();

        if( currentlyFullscreenPip ) {
            needToRefocusPip = true;
        }
        else {
            if( !properResolution ) {	
                saveCurrentResolution();	
            }
            if( !properEmulatorResolution ) {
                saveCurrentEmulatorResolution();
            }
            // Update the home resolution before we start the stream, so when we start the start it gets the right resolution for the emulator	
            if( properResolution != properEmulatorResolution ) {
                try {
                    proc.execSync(SET_RESOLUTION_COMMAND + properEmulatorResolution);	
                }
                catch(err) {}
            }
            needToRefocusGame = true;
        }
    }

    return Promise.resolve(false);
}

/**
 * Start the menuPage's screencast.
 * @param {string} id - The socket id of the client to start screencasting to.
 * @returns {Promise<(boolean|string)>} An error message if there is one or false if there is not.
 */
async function startScreencast( id ) {
    if( !menuPage || menuPage.isClosed() ) {
        return Promise.resolve(ERROR_MESSAGES.menuPageClosed);
    }
    if( !serverSocketId || !clientSocketIds.length ) {
        return Promise.resolve(ERROR_MESSAGES.clientAndServerAreNotBothConnected );
    }
    if( startedClientIds.includes( id ) ) {
        return Promise.resolve(ERROR_MESSAGES.screencastAlreadyStarted);
    }
    // failsafe
    delete screencastLastRuns[id];
    delete screencastLastCounters[id];
    delete screencastLastTimestamps[id];
    let currentStartedClientIdsLength = startedClientIds.length; 
    startedClientIds.push(id);
    await menuPage.evaluate( (id) => startConnectionToPeer(true, id), id );

    await screencastFix(currentStartedClientIdsLength);

    return Promise.resolve(false);
}

/**
 * Starting the screencast will change some things we don't
 * want changed (e.g. adding the screen being shared toolbar). This function will fix them.
 * @param {boolean} alreadyStarted - True if the screencast has already started.
 * @returns {Promise<(boolean)>} A promise containing false.
 */
async function screencastFix(alreadyStarted) {
    if( typeof alreadyStarted === 'undefined' ) alreadyStarted = startedClientIds.length;
    // n64 and 3ds cause screen flickers when the screen is being shraed button is hidden
    if( !alreadyStarted ) {
        for( let i=0; i<SHARING_PROMPT_MAX_TRIES; i++ ) {
            if( sharingPromptIsActive() ) {
                // Transparent for all in case we switch games
                proc.execSync(SHARING_PROMPT_TRANSPARENT_COMMAND);
                break;
            }
            await menuPage.waitFor(SHARING_PROMPT_DELAY_TIME);
        }
    }

    // we can return to the game now
    if( currentEmulator && !alreadyStarted && needToRefocusGame ) {
        await launchGame( currentSystem, currentGame, false, currentParentsString.split(SEPARATOR).filter(el => el != ''), true ); 
        needToRefocusGame = false;
    }
    else if( !alreadyStarted && needToRefocusPip ) {
        // this will check to make sure the pip video is indeed still there
        await toggleFullscreenPip();
    }
    else if( !alreadyStarted ) await goHome(); // focus on chrome from any screen share info popups

    Promise.resolve(false);
}

/**
 * Stop the menuPage's screencast iff there are no more clients.
 * @param {string} id - The id of the client that no longer needs the stream.
 * @returns {Promise<(boolean|string)>} An error message if there is one or false if there is not.
 */
async function stopScreencast(id) {
    if( !menuPage || menuPage.isClosed() ) {
        return Promise.resolve(ERROR_MESSAGES.menuPageClosed);
    }
    if( !serverSocketId || !clientSocketIds.length ) {
        return Promise.resolve(ERROR_MESSAGES.clientAndServerAreNotBothConnected );
    }
    if( !clientSocketIds.length ) {
        return Promise.resolve(ERROR_MESSAGES.screencastNotStarted);
    }

    console.log( "stopping: " + id );
    clientSocketIds = clientSocketIds.filter( el => el != id );
    startedClientIds = clientSocketIds.filter( el => el != id );
    clearTimeout(cancelStreamingTimeouts[id]);
    delete cancelStreamingTimeouts[id];
    delete screencastLastRuns[id];
    delete screencastLastCounters[id];
    delete screencastLastTimestamps[id];

    disconnectVirtualGamepad( id ); // Disconnect the virtual gamepad.

    try {
        await menuPage.evaluate( (id) => stopConnectionToPeer(true, id), id );
    }
    catch(err) { console.log(err); }

    if( clientSocketIds.length ) return false; // there are still more clients

    streamerMediaReady = false;
    clientJoined = false;
    serverSocketId = null;
    clientSocketIds = [];
    startedClientIds = [];
    cancelStreamingTimeouts = [];
    screencastLastRuns = {};
    screencastLastCounters = {};
    screencastLastTimestamps = {};
    try {
        if( menuPageIsActive() ) ensureProperResolution(); // we might have gone home and changed to resolution in preparation to go back to the emulator. If there was an error, we might not have gone back to the emulator. In this case, once the reset timeout fails, we should make sure we have the correct resolution.
    }
    catch(err) { /* ok */ }
    stopRtmp(); // stop any rtmp streams
    return Promise.resolve(false);
}

/**
 * Perform a click on guystation.
 * Works for left click, right click, and middle click.
 * @param {number} xPercent - The percentage x offset on which to perform the click.
 * @param {number} yPercent - The percentage y offset on which to perform the click.
 * @param {string} button - left, right, or middle.
 * @param {boolean} [down] - True if we are pushing the mouse down, false if up.
 * @param {number} counter - The current screencast counter for commands.
 * @param {number} timestamp - The timestamp for the event.
 * @returns {Promise<(boolean|string)>} A promise that is false if the action was successful or contains an error message if not.
 */
async function performScreencastMouse( xPercent, yPercent, button, down, counter, timestamp ) {
    if( xPercent < 0 || yPercent < 0 || xPercent > 1 || yPercent > 1 ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageInvalidCoordinates );
    }

    let screenResolution = proc.execSync(GET_RESOLUTION_COMMAND).toString().split("x");
    let width = parseInt(screenResolution[0]);
    let height = parseInt(screenResolution[1]);
    let x = width * xPercent;
    let y = height * yPercent;

    queueScreencastEvent( () => {
        performMouse(x, y, button, down);
    }, null, counter, timestamp );
    
    return Promise.resolve(false);
}

/**
 * Peform an action with the mouse on screen.
 * @param {number} x - The x coordinate.
 * @param {number} y - The y coordinate.
 * @param {string} button - left, right, or middle.
 * @param {boolean} [down] - True if we are pushing the mouse down, false if up.
 */
function performMouse( x, y, button, down ) {
    try {
        // move the screenshare if we have to
        let windowInfo = proc.execSync(SHARING_PROMPT_GET_WINDOW_INFO_COMMAND).toString();
        let [windowAll, windowLeft, windowTop, windowWidth, windowHeight] = windowInfo.match(/Absolute upper-left X:\s+(\d+).*Absolute upper-left Y:\s+(\d+).*Width:\s+(\d+).*Height:\s+(\d+)/s);
        // the click is within the window, so move the window before we perform the click
        if( x > windowLeft && x < (windowLeft + windowWidth) && y > windowTop && y < (windowTop + windowHeight) ) {
            proc.execSync(SHARING_PROMPT_MOVE_WINDOW + windowLeft + " " + (windowTop > SHARING_PROMPT_TOP_AREA ? SHARING_PROMPT_MINIMUM : SHARING_PROMPT_MAXIMUM));
        }
    }
    catch(err) {
        // ok not streaming
    }

    if( down ) { // before you toggle, expect the mouse to be in the other state
        robot.moveMouse(x, y);
    }
    else {
        robot.dragMouse(x, y);
    }
    robot.mouseToggle(down ? DOWN : UP, button);
}

/**
 * Perform a button key down or up on a screencast.
 * @param {Array<Number>} buttons - An array of button keycodes to press.
 * @param {boolean} [down] - True if we are pushing the buttons down, false if up.
 * @param {number} counter - The current screencast counter for commands.
 * @param {number} timestamp - The timestamp for the event.
 * @returns {Promise<(boolean|string)>} A promise that is false if the action was successful or contains an error message if not.
 */
async function performScreencastButtons( buttons, down, counter, timestamp ) {

    for( let button of buttons ) {
        try {
            let curKeycode = keycode(button);
            if( KEYCODE_TO_ROBOT_JS[curKeycode] ) curKeycode = KEYCODE_TO_ROBOT_JS[curKeycode];
            queueScreencastEvent( () => {
                try {
                    robot.keyToggle( curKeycode, down ? DOWN : UP);
                }
                catch(err) {/*ok*/}
            }, null, counter, timestamp );
        }
        catch(err) {/* invalid key code - ok */};
    }

    return Promise.resolve(false);
}

/**
 * Perform a virtual gamepad event.
 * @param {Object} event - The event generated by the client.
 * @param {string} id - The id of the streaming client.
 * @param {number} [controllerNum] - The controller number to use from the particular id.
 * @param {number} counter - The current screencast counter for commands.
 * @param {number} timestamp - The timestamp for the event.
 * @returns {boolean|string} False if the action was successful or an error message if not.
 */
async function performScreencastGamepad( event, id, controllerNum=0, counter, timestamp ) {
    let idControllers = gamepadFileDescriptors[id];
    // set to not make a new controller, so use the first controller
    if( !idControllers  ) {
        let keys = Object.keys(gamepadFileDescriptors);
        if( keys ) {
            idControllers = gamepadFileDescriptors[keys[0]];
        }
    }
    let gamepadFileDescriptor = idControllers[controllerNum];
    if( !gamepadFileDescriptor ) {
        return ERROR_MESSAGES.gamepadNotConnected;
    }
    else {
        queueScreencastEvent( () => {
            createGamepadEvent( event, gamepadFileDescriptor );
        }, id, counter, timestamp );
        return false;
    }
}

/**
 * Queue screencast event.
 * @param {Function} action - The action to run. 
 * @param {string} id - The client id. 
 * @param {number} counter - The current counter for the event.
 * @param {number} timestamp - The current timestamp for the vent.
 * @param {number} [attempts] - The current number of attempts that have been made for the input to go through. 
 */
function queueScreencastEvent( action, id, counter, timestamp, attempts=0 ) {
    let lastCounter = screencastLastCounters[id] || -1;
    let lastTimestamp = screencastLastTimestamps[id] || -1;
    let lastRun = screencastLastRuns[id] || -1;
    if( counter > lastCounter + 1 && attempts <= QUEUE_MAX_ATTEMPTS ) {
        setTimeout( () => {
            queueScreencastEvent( action, id, counter, timestamp, attempts+1 );
        }, QUEUE_WAIT_TIME );
        return;
    }
    if( counter < lastCounter + 1 ) return; // the input timed out, ignore now
    // At this point, we are certain we are in the right order
    // we want to maintain the delay between commands on the client between commands on the server
    // within reason (not important for long waits between commands)
    // The goal of this is say we get a button down then up at the same time, but the client actually pressed them
    // 100ms apart - we want to delay the second one. But we don't want to keep delaying presses.
    let commandInterval = timestamp - lastTimestamp; // interval between presses on the client
    if( commandInterval > MAX_COMMAND_INTERVAL ) commandInterval = 0; //
    let newRuntime = lastRun + commandInterval; // server side runtime is last server side runtime + that same interval
    let offset = newRuntime - Date.now(); // relative to now
    setTimeout( () => {
        action();
        screencastLastCounters[id] = counter;
        screencastLastTimestamps[id] = timestamp;
        screencastLastRuns[id] = Date.now(); // Don't update last run if we just did a max out - that way we won't get a delay for the next command
    }, offset );
}

/**
 * Set the screencast scale down by factor.
 * @param {string} id - The client to scale down for.
 * @param {number} factor - The factor to scale the screencast down by for better performance.
 * @returns {Promise<boolean|string>} A promise containing false if the action was successful or an error message if not.
 */
async function setScreencastScale( id, factor ) {
    if( !menuPage || menuPage.isClosed() ) {
        return Promise.resolve(ERROR_MESSAGES.menuPageClosed);
    }

    try {
        await menuPage.evaluate( (id, factor) => setScaleDownBy(id, factor), id, factor );
        return Promise.resolve(false);
    }
    catch(err) {
        return Promise.resolve(ERROR_MESSAGES.couldNotSetScale);
    }
}

/**
 * Set the screencast mute.
 * @param {string} id - The client to scale down for.
 * @param {boolean} mute - Whether to set mute or not.
 * @returns {Promise<boolean|string>} A promise containing false if the action was successful or an error message if not.
 */
async function setScreencastMute( id, mute ) {
    if( !menuPage || menuPage.isClosed() ) {
        return Promise.resolve(ERROR_MESSAGES.menuPageClosed);
    }

    try {
        await menuPage.evaluate( (id, mute) => setScreencastMute(id, mute), id, mute );
        return Promise.resolve(false);
    }
    catch(err) {
        return Promise.resolve(ERROR_MESSAGES.couldNotSetMute);
    }
}

/**
 * Renegotiate the streams.
 */
async function renegotiate() {
    await screencastPrepare(false);

    // When you replace a track, you must stop media recording
    // https://stackoverflow.com/questions/57838283/is-it-possible-to-change-mediarecorders-stream
    let turnOnRtmp = false;
    if( rtmpOn() ) {
        turnOnRtmp = true;
        await stopRtmp();
        let promise = new Promise( (resolve, reject) => {
            setInterval( () => {
                if( !rtmpOn() ) resolve();
            }, RENEGOTIATE_RTMP_INTERVAL );
        } );
        await promise;
    }

    await menuPage.evaluate( () => renegotiate() );
    await screencastFix(false);

    if( turnOnRtmp ) {
        await startRtmp( lastRtmpUrl );
    }
}

/**
 * Instruct the menuPage to start streaming RTMP.
 * @param {string} url - The URL of the menuPage.
 * @returns {Promise<boolean|string>} A promise containing an error message if there is one or false if there is not.
 */
async function startRtmp( url ) {
    if( !menuPage || menuPage.isClosed() ) {
        return Promise.resolve(ERROR_MESSAGES.menuPageClosed);
    }
    if( rtmpOn() ) {
        return Promise.resolve(ERROR_MESSAGES.alreadyStreamingRtmp);
    }
    if( !url.match(/^rtmp:\/\//) ) {
        return Promise.resolve(ERROR_MESSAGES.rtmpUrl);
    }

    lastRtmpUrl = url;

    await menuPage.evaluate( (url) => {
        streamToRtmp( url );
    }, url);
    updateTwitchStream();

    return Promise.resolve(false);
}

/**
 * Instruct the menuPage to stop streaming RTMP.
 * @returns {Promise<boolean|string>} A promise containing an error message if there is one or false if there is not.
 */
async function stopRtmp() {
    if( !menuPage || menuPage.isClosed() ) {
        return Promise.resolve(ERROR_MESSAGES.menuPageClosed);
    }

    await menuPage.evaluate( () => {
        stopStreamtoRtmp();
    });

    return Promise.resolve(false);
}

/**
 * Check if RTMP is currently streaming.
 * @returns {boolean} True if we are streaming, false if not.
 */
function rtmpOn() {
    // feedStream should be sufficient. Given queueing, they'd usually be on the same page
    // the only time they wouldn't would be on an error/disconnect when it is the menuPage
    // that calls out to stop even though we instantly canceled out feedStream. Should be ok, because
    // the user won't restart faster than the menu page and server sending a couple of near-instant
    // socket messages to each other.
    // even if they did, they'd get the already started error message, since the ffmpegProcess would still be there
    // they couldn't restart
    return (feedStream || ffmpegProcess) ? true : false;
}

/**
 * Update a Twitch Stream's title and category.
 * @returns {Promise<boolean|string>} A promise containing an error message if there is one or false if there is not.
 */
async function updateTwitchStream() {
    if( !rtmpOn() ) return Promise.resolve(ERROR_MESSAGES.notStreamingRTMP);
    currentTwitchRequest ++; // this way we can cancel out other requests
    let myTwitchRequest = currentTwitchRequest;

    // Get the twitch headers - refresh the access token
    let headers = await getTwitchHeaders();
    if( typeof headers === STRING_TYPE ) return Promise.resolve(headers); // An error ocurred

    if( myTwitchRequest != currentTwitchRequest ) return Promise.resolve(ERROR_MESSAGES.anotherTwitchRequest);

    let userId = null;
    // validate for updating the account
    // https://dev.twitch.tv/docs/authentication
    try {
        let userInfo = await axios.get( TWITCH_VALIDATION_ENDPOINT, { headers: headers } );
        if( userInfo.data && userInfo.data.user_id ) {
            userId = userInfo.data.user_id;
        }
        else {
            return Promise.resolve(ERROR_MESSAGES.couldNotFindTwitchUsername);
        }
    }
    catch(err) {
        return Promise.resolve(ERROR_MESSAGES.twitchNoValidate);
    }

    if( myTwitchRequest != currentTwitchRequest ) return Promise.resolve(ERROR_MESSAGES.anotherTwitchRequest);

    headers.Host = TWITCH_API_HOST;

    // Search for the category
    let custom = getTwitchStreamInfo();
    let gameName = custom.game ? custom.game : currentGame;
    let streamName = custom.name ? custom.name : gameName;
    let gameId = 0;
    if( gameName ) {
        let gameInfo = await axios.get( TWITCH_GAMES_ENDPOINT + gameName, { headers: headers } );
        if( gameInfo.data && gameInfo.data.data && gameInfo.data.data.length ) {
            gameId = gameInfo.data.data[0].id;
        }
        else {
            gameInfo = await axios.get( TWITCH_CATEGORIES_ENDPOINT + gameName, { headers: headers } );
            if( gameInfo.data && gameInfo.data.data && gameInfo.data.data.length ) {
                gameId = gameInfo.data.data[0].id;
            }
        }
    }

    if( myTwitchRequest != currentTwitchRequest ) return Promise.resolve(ERROR_MESSAGES.anotherTwitchRequest);

    // Update the stream
    await axios.patch( TWITCH_CHANNELS_ENDPOINT, {
        "broadcaster_id": userId,
        "game_id": gameId,
        "title": streamName ? streamName : DEFAULT_TWITCH_GAME_NAME
    }, { headers: headers } );

    return Promise.resolve(false);
}

/**
 * Update the Custom Stream name for Twitch.
 * @param {string} name - The name of the stream.
 * @param {string} game - The name of the game being played.
 */
function updateTwitchStreamInfo( name, game ) {
    fs.writeFileSync( TWITCH_STREAM_PATH, JSON.stringify({
        name: name,
        game: game
    }) );
    updateTwitchStream();
}

/**
 * Get the current Twitch stream name.
 * @returns {Object} An Object containing the name and game of the twitch stream.
 */
function getTwitchStreamInfo() {
    try {
        return JSON.parse( fs.readFileSync(TWITCH_STREAM_PATH) );
    }
    catch(err) {
        return null; // no name set
    }
}

/**
* Create a fake microphone, so Chrome will allow us to record audio.
* Calling this again should not create a new Microphone.
*/
function createFakeMicrophone() {
    proc.execSync(FAKE_MICROPHONE_COMMAND);
}

/**
* Bind the audio output to the Chrome input.
*/
async function bindOutputToChromeInput() {
    try {
        // get the source output
        let sourceOutputIndex = getLatestChromeSourceOutput();
        if( sourceOutputIndex ) {
            // Now get the source
            let sourceString = proc.execSync(PACMD_PREFIX + GET_DEFAULT_AUDIO_DEVICE_COMMAND).toString();
            // We will get the default sink and then find the source that is set up to be monitoring that
            let sourceIndex = sourceString.match(/monitor\ssource:\s(\d+)/)[1];

            // Now we set the source of the source output to be the monitor which is what Chrome reads as the microphone.
            proc.execSync(PACMD_PREFIX + MOVE_SOURCE_OUTPUT_COMMAND + sourceOutputIndex + " " + sourceIndex);
        }
    }
    catch(err) {
        console.log(err);
    }
}

/**
 * Get the latest chrome source output.
 * Whenever we use a microphone on Chrome, a source output
 * will be set up. They are added in ascending order, so we just
 * get the latest one here and we know we have the right output, so
 * long as this is called very close to when Chrome starts listening
 * to the microphone.
 * @returns {String} - The index of the chrome source output or null if there is none.
 */
function getLatestChromeSourceOutput() {
    try {
        // get the source outputs
        let sourceOutputs = proc.execSync(PACMD_PREFIX + LIST_SOURCE_OUTPUTS_COMMAND).toString();
        if( sourceOutputs ) {
            // find Chrome's output source
            let chromeOutputIndex = sourceOutputs.lastIndexOf(GOOGLE_CHROME_AUDIO_IDENTIFIER);
            if( chromeOutputIndex != -1 ) {
                sourceOutputs = sourceOutputs.substring(0, chromeOutputIndex);
                let sourceOutputIndexes = sourceOutputs.match(/index: \d+/g).map( m => m.match(/\d+/)[0] );
                let sourceOutputIndex = sourceOutputIndexes[sourceOutputIndexes.length-1];

                return sourceOutputIndex;
            }

        }
    }
    catch(err) {
        console.log(err);
    }
    return null;
}

// End signal server section

/**
 * Bind the microphone to chrome input.
 * This should be called when we want to send the actual microphone
 * to the chrome page as we do when opening the stream page.
 */
function bindMicrophoneToChromeInput() {
    try {
        // get the source output
        let sourceOutputIndex = getLatestChromeSourceOutput();
        if( sourceOutputIndex ) {
            // Now get the source
            let sourceString = proc.execSync(PACMD_PREFIX + GET_DEFAULT_MICROPHONE_COMMAND).toString();
            let sourceIndex = sourceString.match(/\d+/)[0];

            // Now we set the source of the source output to be the default microphone device (which may be the hdmi reader card).
            proc.execSync(PACMD_PREFIX + MOVE_SOURCE_OUTPUT_COMMAND + sourceOutputIndex + " " + sourceIndex);
        }
    }
    catch(err) {
        console.log(err);
    }
}

/**
 * Start looking for PC installations.
 * This will update the rom for a PC game. If no installation is needed, this won't do an update.
 */
function startPcChangeLoop() {
    clearInterval( pcChangeLoop );
    clearTimeout( pcChangeClear );
    let mySystem = currentSystem;
    let myGame = currentGame;
    let myParents = currentParentsString.split(SEPARATOR).filter(el => el != '');

    let watchFolders = [];
    for( let watchFolder of PC_WATCH_FOLDERS ) {
        watchFolders.push(watchFolder);
        watchFolders.push(...(fs.readdirSync(watchFolder, {withFileTypes: true}).filter(el => el.isDirectory() && el.name != INSTALLSHIELD && el.name != COMMON_FILES).map(el => watchFolder + SEPARATOR + el.name)));
    }
    // Get the original contents of each folder that contains programs
    let originalFolderContents = watchFolders.map( folder => fs.readdirSync(folder) );

    pcChangeLoop = setInterval( function() {

        // Get the new contents of each folder that contains programs
        let currentFolderContents = watchFolders.map( folder => fs.readdirSync(folder) );

        for( let i=0; i<originalFolderContents.length; i++ ) {
            let originalFolderContent = originalFolderContents[i];
            let currentFolderContent = currentFolderContents[i];

            let difference = currentFolderContent.filter(el => !originalFolderContent.includes(el));
            if( difference.length ) {
                clearInterval( pcChangeLoop );
                // we've found the new folder, we just have to consistently look for the largest .exe file now
                let largestBinaryPath = null;
                let largestBinarySize = 0;
                let checkFolder = function() {
                    currentFolderContent = fs.readdirSync(watchFolders[i]); // reget current folder content
                    difference = currentFolderContent.filter(el => !originalFolderContent.includes(el));
                    let newFolderPaths = difference.map(el => watchFolders[i] + SEPARATOR + el);
                    // link metadata to new location
                    let currentMetadataContents = fs.readFileSync( generateGameMetaDataLocation(mySystem, myGame, myParents) );
                    let newContent = {};
                    newContent.romCandidates = []; // oreset rom candidates for updating
                    for( let newFolderPath of newFolderPaths ) { // sometimes there will be multiple new folders - one for the company, one for the program.
                        let installedFiles = fs.readdirSync(newFolderPath, {withFileTypes: true});
                        let foundExe = false;
                        let subdirectories = [];
                        // Get the largest binary file
                        for( let installedFile of installedFiles ) {
                            let curPath = newFolderPath + SEPARATOR + installedFile.name;

                            if( installedFile.name.match(/\.exe$/i) ) {
                                foundExe = true;
                                let stats = fs.statSync(curPath);
                                if( isBinaryFileSync(curPath) ) {
                                    if( !largestBinaryPath || stats["size"] > largestBinarySize) {
                                        largestBinaryPath = curPath;
                                        largestBinarySize = stats["size"];
                                    }
                                    if( newContent.romCandidates.indexOf(curPath) === -1 ) newContent.romCandidates.push(curPath);
                                    newContent.installer = currentMetadataContents.installer ? currentMetadataContents.installer : currentMetadataContents.rom;
                                    newContent.rom = largestBinaryPath;
                                }
                            }
                            else if( installedFile.isDirectory() ) {
                                subdirectories.push( curPath );
                            }
                        }
                        // There was no exe in the main directory, add its children
                        if( !foundExe && subdirectories.length ) {
                            newFolderPaths.push( ...subdirectories );
                        }
                    }
                    updateGameMetaData( mySystem, myGame, myParents, newContent );
                };
                checkFolder();
                pcChangeLoop = setInterval( checkFolder, WATCH_FOLDERS_INTERVAL );
            }
        }

    }, WATCH_FOLDERS_INTERVAL );

}

/**
 * Set the saved mute mode.
 * @param {string} mode - The mute mode.
 * @returns {boolean} false or an error message if the mute mode is invalid.
 */
function setMuteMode( mode ) {
    if( ! Object.values(MUTE_MODES).filter(el => el === mode).length ) return ERROR_MESSAGES.invalidMuteMode;

    if( muteMode === MUTE_MODES.all || muteMode === MUTE_MODES.none ) previousMuteMode = muteMode;
    muteMode = mode;
    updateMute();
    return false;
}

/**
 * Ensure that the mute mode we have set is being followed.
 * @param {boolean} [noEnsure] - True if we shouldn't ensure the update mute with a follow up timeout.
 * @returns {boolean|string} false if successful or an error message if there is one.
 */
function updateMute( noEnsure ) {
    clearTimeout( ensureMuteTimeout );
    if( !noEnsure ) {
        // double check mute was set properly.
        ensureMuteTimeout = setTimeout( function() {
            updateMute( true );
        }, ENSURE_MUTE_TIMEOUT_TIME );
    }

    try {
        let muteAlternative = null;
        let sinkInputs = proc.execSync(PACMD_PREFIX + LIST_SINK_INPUTS_COMMAND).toString();
        sinkInputs = sinkInputs.split("index:").map( el => el.split("\n").map( el2 => el2.trim() ) ).filter( el => el.length > 1 && el[0] && el[1] );

        // when we hit the browser, and we are only going to mute either the game or the browser
        // well the game is in the browser, so we need to do something different rather than
        // muting the entire application.
        if( (isBrowserOrClone(currentSystem) || currentSystem === MEDIA) && muteMode !== MUTE_MODES.all ) {
            muteAlternative = currentSystem;
        }
        if( muteMode === MUTE_MODES.none ) {
            muteAlternative = true;
        }

        for( let sinkInput of sinkInputs ) {
            let index = sinkInput[0];
            let name = sinkInput[1];
            let setTo = MUTE_FALSE;
            if(
                ( muteMode === MUTE_MODES.all ) ||
                ( muteMode === MUTE_MODES.game && !name.match(CHROME_NAME) ) ||
                ( muteMode === MUTE_MODES.browser && name.match(CHROME_NAME) )
            ) {
                if( !muteAlternative ) setTo = MUTE_TRUE;
            }
            
            proc.execSync(PACMD_PREFIX + SET_MUTE_COMMAND + index + setTo);
        }

        // muteMode could be browser, game, or none
        if( muteAlternative ) {
            handleWithinBrowserMute( muteAlternative );
        }

        return false;
    }
    catch(err) {
        return ERROR_MESSAGES.couldNotMuteProperly;
    }

}

/**
 * Handle when pages within the browser need to be muted or not.
 * @param {string|boolean} muteAlternative - browser, media, or true. Logic applies to browser/media different to true. (true unmutes all).
 * We really only ever need true when we previously were on browser or media mute alternative as when we mute all, we just mute the application.
 * This isn't ideal since we don't keep track of what the user has muted manually.
 */
async function handleWithinBrowserMute( muteAlternative ) {
    let pages = await browser.pages();
    for( let page of pages ) {

        if( isBrowserOrClone(muteAlternative) || muteAlternative === MEDIA ) {
            if( muteMode === MUTE_MODES.game ) {
                // we want to mute the game, which is everything except the PIP page (menuPage for media, other pages for browser)
                if( page.mainFrame()._id === pipPage.mainFrame()._id ) {
                    setPageMute( page, false );
                }
                else {
                    setPageMute( page, true );
                }
            }
            else {
                // we want to mute the video - i.e. the pipPage
                if( page.mainFrame()._id === pipPage.mainFrame()._id ) {
                    setPageMute( page, true );
                }
                else {
                    setPageMute( page, false ); 
                }
            }
        }
        // none muted > be certain we've unmuted from when we were on game/pip video muted.
        else {
            setPageMute( page, false );
        }

    }
}

/**
 * Set elements on a page to be muted or not.
 * @param {Page} page - The puppeteer page to mute/unmute. 
 * @param {boolean} shouldMute - Whether we should mute or not.
 */
async function setPageMute( page, shouldMute ) {
    await page.evaluate( (sM) => {
        document.querySelectorAll("video,audio").forEach( el => {
            el.muted = sM;
        } );
    }, shouldMute );
}

/**
 * Start PIP mode.
 * @param {string} url - The url containing the video we want to PIP.
 * @param {string} pipMuteMode - The mute mode to set (should be browser or game).
 * @returns {Promise} - A promise containing false or an error message if there is one.
 */
async function startPip( url, pipMuteMode ) {
    if( !pipPage || pipPage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.pipPageClosed );
    }

    try {
        await pipPage.goto( url ) ;
        try {
            let pipRefocusGame = false;
            if( currentEmulator && ( !menuPageIsActive() || (await menuPage.evaluate(() => isRemoteMediaActive())) ) ) { 
                pipRefocusGame = true;
            }
            await pipPage.waitForSelector("video", { timeout: VIDEO_SELECTOR_TIMEOUT });
            await pipPage.bringToFront();
            await pipPage.waitFor(PIP_LOAD_TIME);
            clearInterval(tryPipInterval);
            let tryPip = async (success, failure) => {
                try {
                    await pipPage.evaluate( () => {
                        if( document.querySelector("video") ) { // it should be there from from waitForSelector, but just in case it is removed, we don't want an infinite loop.
                            document.querySelector("video").requestPictureInPicture();
                            document.querySelector("video").play();
                        }
                    } );
                }
                catch(err) {
                    if( failure ) failure();
                    return;
                }
                if( success ) success();
            };
            let tryPipPromise = new Promise( (resolve, reject) => {
                tryPip( resolve, () => {
                    tryPipInterval = setInterval( async () => {
                        tryPip( () => { clearInterval(tryPipInterval); resolve(); } );
                    }, TRY_PIP_INTERVAL );
                } );
            } );
            await tryPipPromise;
            await goHome(); // this will set fullscreenpip to false if needed
            if( pipRefocusGame && currentEmulator ) {
                await launchGame( currentSystem, currentGame, false, currentParentsString.split(SEPARATOR).filter(el => el != ''), true );
            } 
        }
        catch(err) {
            return Promise.resolve(ERROR_MESSAGES.couldNotFindVideo);
        }
        let mm = setMuteMode( pipMuteMode );
        if( mm ) return mm;
    }
    catch(err) {
        return Promise.resolve(ERROR_MESSAGES.invalidUrl);
    }
    return Promise.resolve(false);
}

/**
 * Stop Picture in Picture mode.
 * @returns {Promise} A promise containing an error message if there is one or false if there is not.
 */
async function stopPip() {
    clearInterval( tryPipInterval );
    if( !pipPage || pipPage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.pipPageClosed );
    }

    try {
        if( fullscreenPip ) {
            try {
                await pipPage.evaluate( () => document.exitFullscreen() );
            }
            catch(err) {
                // ok
            }
            await goHome(); // this will set fullscreenpip to false if needed
        }
        await pipPage.evaluate( () => document.exitPictureInPicture() );
    }
    catch(err) {
        // ok
    }
    await pipPage.goto(BLANK_PAGE);
    
    setMuteMode( previousMuteMode );

    return Promise.resolve(false);
}

/**
 * Toggle the PIP video to become fullscreen.
 * @returns {Promise} A promise containing an error message if there is one or false if there is not.
 */
async function toggleFullscreenPip() {

    clearInterval( tryPipInterval );
    if( !pipPage || pipPage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.pipPageClosed );
    }

    let videoPlaying = await pipPage.evaluate( () => document.querySelector("video") != null );
    if( !videoPlaying ) return Promise.resolve( ERROR_MESSAGES.couldNotFindVideo );

    let currentlyInFullscreen = fullscreenPip; // go home will change fullscreen pip, so we need to save the value here
    if( currentlyInFullscreen ) {
        try {
            await pipPage.evaluate( () => document.exitFullscreen() );
        }
        catch(err) {
            // ok
        }
    }

    await goHome(); // this will ensure our game is paused.
    // we always need to go home - in pip mode? we'll pause the game, in fullscreen mode? don't want to be on a non-full
    // screen pip page.
    // this will exit fullscreen and also trigger the blur function that resumes PIP

    if( !currentlyInFullscreen ) {
        await pipPage.bringToFront(); // make sure pip page is displayed ONLY if we are going into fullscreen mode
        await pipPage.evaluate( () => {
            document.querySelector("video").requestFullscreen();
        } );
        fullscreenPip = true;
    }
    else {
        // might not be necessary due to ensurePipNotFullscreen in goHome()
        await pipPage.evaluate( () => {
            document.querySelector("video").requestPictureInPicture();
        } );
        fullscreenPip = false;
    }

    return Promise.resolve(false); 

}

/**
 * Ensure pip is not in fullscreen for when blur event doesn't work.
 * Do this when we go home or launch another game.
 * @returns {Promise} A promise containing an error message if there is one or false if there is not.
 */
async function ensurePipNotFullscreen() {
    if( !pipPage || pipPage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.pipPageClosed );
    }
    try {
        await pipPage.evaluate( () => {
            // we can't check for fullscreen element, because escape by going home might have exited fs already
            if( document.querySelector("video") ) {
                try {
                    document.exitFullscreen();
                }
                catch(err) {}
                document.querySelector("video").requestPictureInPicture();
            }
        } );
        fullscreenPip = false;
    }
    catch(err) {
        return Promise.resolve(ERROR_MESSAGES.couldNotFindVideo);
    }
    return Promise.resolve(false);
}

/**
 * Play PIP video.
 * @returns {Promise} A promise containing an error message if there is one or false if there is not.
 */
async function playPip() {
    if( !pipPage || pipPage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.pipPageClosed );
    }
    let videoPlaying = await pipPage.evaluate( () => document.querySelector("video") != null );
    if( !videoPlaying ) return Promise.resolve( ERROR_MESSAGES.couldNotFindVideo );
    await pipPage.evaluate( () => {
        if( document.querySelector("video") ) {
            document.querySelector("video").play();
        }
    } );
    return Promise.resolve(false);
}

/**
 * Pause PIP video.
 * @returns {Promise} A promise containing an error message if there is one or false if there is not.
 */
async function pausePip() {
    if( !pipPage || pipPage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.pipPageClosed );
    }
    let videoPlaying = await pipPage.evaluate( () => document.querySelector("video") != null );
    if( !videoPlaying ) return Promise.resolve( ERROR_MESSAGES.couldNotFindVideo );
    await pipPage.evaluate( () => {
        if( document.querySelector("video") ) {
            document.querySelector("video").pause();
        }
    } );
    return Promise.resolve(false);
}

/**
 * Make the microphone on GuyStation listen for input.
 * @returns {Promise<boolean|string>} A promise containing an error message if there is one or false if there is not.
 */
async function listenMic() {
    if( !menuPage || menuPage.isClosed() ) {
        return Promise.resolve(ERROR_MESSAGES.menuPageClosed);
    }

    await menuPage.evaluate( () => {
        speechInput();
    });

    return Promise.resolve(false);
}

/**
 * Detect a hotword.
 * Modified from here: https://github.com/Picovoice/porcupine/blob/master/demo/nodejs/mic.js
 */
 function detectHotword() {
    let handle = new Porcupine(
        VOICE_KEYWORD_PATHS,
        VOICE_SENSITIVITIES
    );

    let recorderType = VOICE_RECORDER_TYPE;

    const frameLength = handle.frameLength;
    const sampleRate = handle.sampleRate;

    let recording = recorder.record({
        sampleRate: sampleRate,
        channels: 1,
        audioType: "raw",
        recorder: recorderType,
        sampleRateHertz: VOICE_SAMPLE_RATE_HERTZ
    });

    let frameAccumulator = [];

    recording.stream().on("data", (data) => {
        // Two bytes per Int16 from the data buffer
        let newFrames16 = new Array(data.length / 2);
        for (let i = 0; i < data.length; i += 2) {
            newFrames16[i / 2] = data.readInt16LE(i);
        }

        // Split the incoming PCM integer data into arrays of size Porcupine.frameLength. If there's insufficient frames, or a remainder,
        // store it in 'frameAccumulator' for the next iteration, so that we don't miss any audio data
        frameAccumulator = frameAccumulator.concat(newFrames16);
        let frames = chunkArray(frameAccumulator, frameLength);

        if (frames[frames.length - 1].length !== frameLength) {
            // store remainder from divisions of frameLength
            frameAccumulator = frames.pop();
        }
        else {
            frameAccumulator = [];
        }

        for (let frame of frames) {
            let index = handle.process(frame);
            if (index !== -1) {
                console.log(`Detected '${VOICE_KEYWORDS[index]}'`);
                listenMic();
            }
        }
    });

    console.log(`Listening for wake word(s): ${VOICE_KEYWORDS}`);
    process.stdin.resume();
}

/**
 * Chunk an array.
 */
 function chunkArray(array, size) {
    return Array.from({ length: Math.ceil(array.length / size) }, (v, index) =>
        array.slice(index * size, index * size + size)
    );
}
