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
const RESUME_COMMAND = "kill -CONT ";
const PAUSE_COMMAND = "kill -STOP ";
const SLEEP_COMMAND = "sleep 1";
const SLEEP_HALF_COMMAND = "sleep 0.5";
const MAX_ACTIVATE_TRIES = 30;
const FOCUS_CHROMIUM_COMMAND = "wmctrl -a 'Chrom'";
const TMP_ROM_LOCATION = "/tmp/tmprom";
const NAND_ROM_FILE_PLACEHOLDER = "ROM_FILE_PLACEHOLDER";
const BROWSER = "browser";
const MEDIA = "media";
const GOOGLE_SEARCH_URL = "https://google.com/search?q=";
const HTTP = "http://";
const UP = "up";
const DOWN = "down";
const SCROLL_AMOUNT_MULTIPLIER = 0.8;
const LINUX_CHROME_PATH = "/usr/bin/google-chrome";
const HOMEPAGE = "https://game103.net";
const INVALID_CHARACTERS = ["/"];
const GET_RESOLUTION_COMMAND = "xrandr | grep '*' | tr -s ' ' |cut -d' ' -f 2"; // e.g. "1920x1080"
const SET_RESOLUTION_COMMAND = "xrandr -s ";
const CHECK_TIMEOUT = 100;
const ACTIVE_WINDOW_COMMAND = "xdotool getwindowfocus getwindowname";
const PAGE_TITLE = "GuyStation - Google Chrome";
const CHECK_MEDIA_PLAYING_INTERVAL = 100;
const ENTIRE_SCREEN = "Entire screen";
const IS_SERVER_PARAM = "is_server";
const STREAMING_HEARTBEAT_TIME = 10000; // after 10 seconds of no response from the client, we will force close the stream
const GIT_FETCH_COMMAND = "git -C ~/guystation fetch";
const GIT_UPDATES_AVAILABLE_COMMAND = 'if [ $(git -C ~/guystation rev-parse HEAD) != $(git -C ~/guystation rev-parse @{u}) ]; then echo "1"; else echo "0"; fi;';
const GIT_PULL_COMMAND = "git -C ~/guystation pull";
const KILL_GUYSTATION_COMMAND = "ps -aux | grep '[n]ode' | awk '{print $2}' | xargs sudo kill -9; ps -aux | grep '[c]hrome' | awk '{print $2}' | xargs sudo kill -9";
const START_GUYSTATION_COMMAND = "sleep 5; sudo npm --prefix=~/guystation start 2>&1 | logger &";
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
    "3ds": [37, 137] // 3ds & new 3ds
}
const IGDB_API_KEY = process.env.GUYSTATION_IGDB_API_KEY;
const IGBD_API_URL = "https://api-v3.igdb.com/";
const GAMES_ENDPOINT = IGBD_API_URL + "games";
const GAMES_FIELDS = "fields cover, name, first_release_date, summary;";
const COVERS_ENDPOINT = IGBD_API_URL + "covers";
const COVERS_FIELDS = "fields url, width, height;";
const IGDB_HEADERS = { 
    'Content-Type': 'text/plain',
    'user-key': IGDB_API_KEY
}
const THUMB_IMAGE_SIZE = "thumb";
const COVER_IMAGE_SIZE = "cover_big";
const COVER_FILENAME = "cover.jpg";
const USER_DATA_DIR = "../chrome";
const STATUS_FILE = USER_DATA_DIR + SEPARATOR + "Default" + SEPARATOR + "Preferences";
const MAX_MESSAGES_LENGTH = 100;

const ERROR_MESSAGES = {
    "noSystem" : "System does not exist",
    "noGame": "Game does not exist",
    "gameBeingPlayed": "Please quit the current game first",
    "noRomFile": "No rom found for game",
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
    "noApiKey": "No IGDB API key",
    "invalidFileName": "Invalid file name",
    "genericError": "An uncaught error ocurred",
    "invalidMessage": "Invalid message"
}
const KEYCODE_TO_ROBOT_JS = {
    "esc": "escape",
    "page up": "pageup",
    "page down": "pagedown",
    "ctrl": "control",
}
const USERNAME_OPTIONS = ["🐵", "🐶", "🦊", "🐱", "🦁", "🐯", "🐮", "🐷", "🐘", "🐹", "🐰", "🐻", "🐨", "🐼", "🐣", "🐧", "🐸", "🦕", "🐳", "🐬"];

// We will only allow for one request at a time for app
let requestLocked = false;

let currentSystem = null;
let currentGame = null;
let currentParentsString = null;
let currentEmulator = null;

let systemsDict = {};

let browser = null;
let menuPage = null;
let browsePage = null;
let properResolution = null;
let clearMediaPlayingInterval = null;
let needToRefocusGame = false;

let messages = [];

// Load the data on startup
getData();

/**************** Express ****************/

const app = express();
const staticApp = express();
app.use( "/"+ASSETS_DIR+"/", express.static(ASSETS_DIR) );
app.use( "/"+SYSTEMS_DIR+"/", express.static(SYSTEMS_DIR) );
staticApp.use( "/"+ASSETS_DIR+"/", express.static(ASSETS_DIR) );
staticApp.use( "/"+SYSTEMS_DIR+"/", express.static(SYSTEMS_DIR) );

// Middleware to allow cors from any origin
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS, PATCH');
    next();
});

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
    getData();
    writeResponse( response, SUCCESS, {} );
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
            writeActionResponse( response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( response );
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
            writeActionResponse( response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( response );
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
                writeResponse( response, SUCCESS, errorMessage );
            }
            else {
                writeActionResponse( response, errorMessage );
            }
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( response );
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
            writeActionResponse( response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( response );
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
            writeActionResponse( response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( response );
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
            writeActionResponse( response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( response );
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
            writeActionResponse( response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( response );
    }
});

// Add a game
app.post("/game", upload.single("file"), async function(request, response) {
    console.log("app serving /game (POST)");
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = addGame( request.body.system, request.body.game, request.file, JSON.parse(request.body.parents), request.body.isFolder, request.body.isPlaylist, JSON.parse(request.body.playlistItems) );
            getData(); // Reload data
            requestLocked = false;
            writeActionResponse( response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( response );
    }
});

// Update a game
app.put("/game", upload.single("file"), async function(request, response) {
    console.log("app serving /game (PUT)");
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = updateGame( request.body.oldSystem, request.body.oldGame, JSON.parse(request.body.oldParents), request.body.system, request.body.game, request.file, JSON.parse(request.body.parents), request.body.isFolder, request.body.isPlaylist, JSON.parse(request.body.playlistItems) );
            getData(); // Reload data
            requestLocked = false;
            writeActionResponse( response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( response );
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
            writeActionResponse( response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( response );
    }
});

// Send a message
app.post("/message", function(request, response) {
    console.log("app serving /message (POST)");
    let errorMessage = sendMessage( request.body.message );
    writeActionResponse( response, errorMessage );
});

// Get all messages
app.get("/message", function(request, response) {
    console.log("app serving /message (GET)");
    writeResponse( response, SUCCESS, { "messages": messages } );
});

// Get input for the a browser
app.get("/browser/url", async function(request, response) {
    console.log("app serving /browser/url");
    // Don't worry about locking for these
    let url = await getUrl();
    if( !Object.values(ERROR_MESSAGES).includes(url) ) {
        writeResponse( response, SUCCESS, {url: url} );
    }
    else {
        writeResponse( response, FAILURE, {message: url});
    }
});

// Navigate the browser to a page
app.post("/browser/navigate", async function(request, response) {
    console.log("app serving /browser/navigate");
    let errorMessage = await navigate( request.body.url );
    writeActionResponse( response, errorMessage );
});

// Refresh the browser page
app.get("/browser/refresh", async function(request, response) {
    console.log("app serving /browser/refresh");
    let errorMessage = await refresh();
    writeActionResponse( response, errorMessage );
});

// Scroll
app.post("/browser/scroll", async function(request, response) {
    console.log("app serving /browser/scroll");
    let errorMessage = await scroll( request.body.direction );
    writeActionResponse( response, errorMessage );
});

// Forward
app.get("/browser/forward", async function(request, response) {
    console.log("app serving /browser/forward");
    let errorMessage = await goForward();
    writeActionResponse( response, errorMessage );
});

// Back
app.get("/browser/back", async function(request, response) {
    console.log("app serving /browser/back");
    let errorMessage = await goBack();
    writeActionResponse( response, errorMessage );
});

// Get browse tabs
app.get("/browser/tabs", async function(request, response) {
    console.log("app serving /browser/tabs");
    let tabs = await getBrowseTabs();
    if( !Object.values(ERROR_MESSAGES).includes(tabs) ) {
        writeResponse( response, SUCCESS, {tabs: tabs} );
    }
    else {
        writeResponse( response, FAILURE, {message: tabs});
    }
});

// Change browse tabs
app.put("/browser/tab", async function(request, response) {
    console.log("app serving /browser/tab");
    let errorMessage = await switchBrowseTab(request.body.id);
    writeActionResponse( response, errorMessage );
});

// Close a browse tab
app.delete("/browser/tab", async function(request, response) {
    console.log("app serving /browser/tab");
    let errorMessage = await closeBrowseTab(request.body.id);
    writeActionResponse( response, errorMessage );
});

// Add a browse tab
app.post("/browser/tab", async function(request, response) {
    console.log("app serving /browser/tab");
    let errorMessage = await launchBrowseTab();
    writeActionResponse( response, errorMessage );
});

// Connect the menu page to the signal server
app.get("/screencast/connect", async function(request, response) {
    console.log("app serving /screencast/connect");
    // don't allow screencast to start while we're trying to do something else
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = await connectScreencast( request.query.id );
            requestLocked = false;
            writeActionResponse( response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( response );
    }
});

// Stop screencast
app.get("/screencast/stop", async function(request, response) {
    console.log("app serving /screencast/stop");
    let errorMessage = await stopScreencast( request.query.id );
    writeActionResponse( response, errorMessage );
});

// Reset screencast cancel timeout
app.get("/screencast/reset-cancel", async function(request, response) {
    console.log("app serving /screencast/reset-cancel");
    let errorMessage = resetScreencastTimeout( request.query.id );
    writeActionResponse( response, errorMessage );
});

// Send a click event in a screencast
app.post("/screencast/mouse", async function(request, response) {
    console.log("app serving /screencast/mouse with body: " + JSON.stringify(request.body));
    let errorMessage = await performScreencastMouse( request.body.xPercent, request.body.yPercent, request.body.button, request.body.down );
    writeActionResponse( response, errorMessage );
});

// Press some buttons on a screencast
app.post("/screencast/buttons", async function(request, response) {
    console.log("app serving /screencast/buttons with body: " + JSON.stringify(request.body));
    let errorMessage = await performScreencastButtons( request.body.buttons, request.body.down );
    writeActionResponse( response, errorMessage );
});

// Update the system
app.get("/system/update", async function(request, response) {
    console.log("app serving /system/update");
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = updateGuystation();
            requestLocked = false;
            writeActionResponse( response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( response );
    }
});

// Check if the system has updates available
app.get("/system/has-updates", async function(request, response) {
    console.log("app serving /system/update");
    let hasUpdates = guystationHasUpdates();
    writeResponse( response, SUCCESS, {hasUpdates: hasUpdates} );
});

// Restart the system
app.get("/system/restart", async function(request, response) {
    console.log("app serving /system/update");
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = restartGuystation();
            requestLocked = false;
            writeActionResponse( response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( response );
    }
});

// Reboot the system
app.get("/system/reboot", async function(request, response) {
    console.log("app serving /system/update");
    if( ! requestLocked ) {
        requestLocked = true;
        try {
            let errorMessage = rebootGuystation();
            requestLocked = false;
            writeActionResponse( response, errorMessage );
        }
        catch(err) {
            console.log(err);
            requestLocked = false;
            writeActionResponse( response, ERROR_MESSAGES.genericError );
        }
    }
    else {
        writeLockedResponse( response );
    }
});

// START PROGRAM (Launch Browser and Listen)
server.listen(SOCKETS_PORT); // This is the screencast server
staticApp.listen(STATIC_PORT); // Launch the static assets first, so the browser can access them
launchBrowser().then( () => app.listen(PORT) );

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
function writeActionResponse( response, errorMessage ) {
    if( errorMessage ) {
        writeResponse( response, FAILURE, { "message": errorMessage }, HTTP_SEMANTIC_ERROR );
    }
    else {
        writeResponse( response, SUCCESS );
    }
}

/**
 * Write a response indicating that the request is locked.
 * @param {Response} response - The response object.
 */
function writeLockedResponse( response ) {
    writeResponse( response, FAILURE, { "message": ERROR_MESSAGES.anotherRequestIsBeingProcessed}, HTTP_TEMPORARILY_UNAVAILABLE );
}

/**
 * Send a response to the user.
 * @param {Response} response - The response object.
 * @param {string} status - The status of the request.
 * @param {Object} object - An object containing values to include in the response.
 * @param {number} code - The HTTP response code (defaults to 200).
 * @param {string} contentType - The content type of the response (defaults to application/json).
 */
function writeResponse( response, status, object, code, contentType ) {
    if( !code ) { code = HTTP_OK; }
    if( !contentType ) { contentType = "application/json"; }
    if( !object ) { object = {}; }
    response.writeHead(code, {'Content-Type': 'application/json'});
    
    let responseObject = Object.assign( {status:status, systems: systemsDict, ip: IP}, object );
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
    let options = {
        headless: false,
        defaultViewport: null,
        args: [
            '--start-fullscreen',
            '--no-sandbox',
            `--auto-select-desktop-capture-source=${ENTIRE_SCREEN}` // this has to be like this otherwise the launcher will not read the argument. It has to do with node.js processes and how they handle quotes with shell=true. 
        ],
        userDataDir: USER_DATA_DIR
    };
    if(process.argv.indexOf("--chromium") == -1) {
        options.executablePath = LINUX_CHROME_PATH;
    }
    browser = await puppeteer.launch(options);
    let pages = await browser.pages();
    menuPage = await pages[0];
    await menuPage.goto(LOCALHOST + ":" + STATIC_PORT + "?" + IS_SERVER_PARAM);
    ks.sendKey('tab');

    browser.on("targetdestroyed", async function() {
        // If there are no more browse tabs, the browser has been quit
        let pages = await browser.pages();
        if( pages.length == 1 ) { // only the menu page is open
            browsePage = null; // There is no browse page
            if( currentSystem === BROWSER ) {
                blankCurrentGame();
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
            if( currentPage.mainFrame()._id === menuPage.mainFrame()._id ) {
                // there is necessarily at least one other browse tab, since the open pages > 1
                currentPageIndex++;
                if( currentPageIndex >= pages.length ) {
                    currentPageIndex = 0;
                }
                currentPage = pages[currentPageIndex];
            }
            await switchBrowseTab( currentPage.mainFrame()._id );
        }
    });
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
 * @returns {Promise<boolean>} A promise containing false when completed.
 */
async function launchBrowseTab() {
    browsePage = await browser.newPage();
    try {
        await browsePage.goto(HOMEPAGE);
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
        if( page.mainFrame()._id !== menuPage.mainFrame()._id ) {
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
        if( page.mainFrame()._id === id && page.mainFrame()._id !== menuPage.mainFrame()._id ) {
            try {
                await page.close();
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
        if( page.mainFrame()._id !== menuPage.mainFrame()._id ) {
            await page.close();
        }
    }

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
        if( page.mainFrame()._id === id && page.mainFrame()._id !== menuPage.mainFrame()._id ) {
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
 */
function getData() {
    // Reset the data
    systemsDict = {};

    // Read all the systems
    let systems = fs.readdirSync( SYSTEMS_DIR_FULL );
    // For each system
    for( let system of systems ) {
        // Read the metadata
        let systemData = JSON.parse(fs.readFileSync(generateMetaDataLocation(system)));
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
        let gamesDict = generateGames( system, games );
        
        // Set the games for this system
        systemData.games = gamesDict;

        if( isBeingPlayed( system, null, [] ) ) systemData.playing = true;

        // Add this system to the dictionary of systems
        systemsDict[system] = systemData;
    }
}

/**
 * Generate the information about games for a system.
 * This function calls itself recusively to find subdirectories.
 * @param {string} system - The system the games are on.
 * @param {Array<string>} games - The games we want to look at (likely just everything in the games folder).
 * @param {Array<string>} [parents] - An array of parent folders.
 * @returns {Object} An object containing games for a system or for a a specific set of parents within a system.
 */
function generateGames(system, games, parents=[]) {
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
            gameData.isPlaylist = metadataFileContents.isPlaylist;
            if( gameData.isPlaylist ) {
                var tempCurParents = curParents.slice(0);
                tempCurParents.push(game);
                gameData.games = generateGames(system, gameDirContents.filter((name) => name != METADATA_FILENAME), tempCurParents);
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
        }
        catch(err) {
            if( !gameData.isPlaylist ) {
                // This is a directory of games - there is no metadata file
                var tempCurParents = curParents.slice(0);
                tempCurParents.push(game);
                gameData.isFolder = true;
                gameData.games = generateGames(system, gameDirContents, tempCurParents);
            }
        }

        if( !gameData.isFolder && !gameData.isPlaylist ) {
            if( system != BROWSER ) {
                let savesInfo = generateSaves(system, game, curParents);
                gameData.currentSave = savesInfo.currentSave;
                gameData.saves = savesInfo.savesDict;
            }

            // If this game is being played, indicate as such
            if( isBeingPlayed( system, game, curParents ) ) {
                gameData.playing = true;
            }
        }
        else if( gameData.isPlaylist ) {
            // similar to isBeingPlayedRecursive by gameDict isn't loaded yet
            // so we can't use that
            let tempParents = parents.slice(0);
            tempParents.push(game);
            for( let childGame of Object.keys(gameData.games) ) {
                if( isBeingPlayed(system, childGame, tempParents) ) {
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
 * Launch a game.
 * @param {string} system - The system to run the game on.
 * @param {string} [game] - The game to run. This is null if we just want to launch the emulator.
 * @param {boolean} [restart] - If true, the game will be reloaded no matter what. If false, and the game is currently being played, it will just be brought to focus.
 * @param {Array<string>} [parents] - An array of parent folders for a game.
 * @param {boolean} [dontSaveResolution] - True if we should not save the home menu resolution.
 * @returns {Promise<(boolean|string)>} A promise containing an error message if there was an error, or false if there was not.
 */
async function launchGame(system, game, restart=false, parents=[], dontSaveResolution) {

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
        if( !fs.existsSync(generateRomLocation( system, game, gameDictEntry.rom, parents )) && system != BROWSER && !gameDictEntry.isPlaylist ) {
            return Promise.resolve(ERROR_MESSAGES.noRomFile);
        }
        else if( system == MEDIA && (!menuPage || menuPage.isClosed())) {
            return Promise.resolve(ERROR_MESSAGES.menuPageClosed);
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

    // Restart unless restart is false, we have a current emulator, and we are playing the game we selected
    let fullScreenTries = MAX_ACTIVATE_TRIES;
    let activateTries = MAX_ACTIVATE_TRIES;
    if( !isBeingPlayed(system, game, parents) || restart || !currentEmulator ) {
        await quitGame();

        let command = systemsDict[system].command;
        if( noGame && systemsDict[system].frontendCommand ) command = systemsDict[system].frontendCommand;

        if( system == BROWSER ) {
            await launchBrowseTab();
            currentSystem = systemsDict[system].system;
            currentGame = systemsDict[system].games[ Object.keys(systemsDict[system].games)[0] ].game;
            currentParentsString = "";
            currentEmulator = true; // Kind of hacky... but will pass for playing
            return Promise.resolve(false);
        }
        else if( system == MEDIA ) {
            await launchRemoteMedia( system, game, parents );
            currentSystem = system;
            currentGame = game;
            currentParentsString = parents.join(SEPARATOR);
            currentEmulator = true; // Kind of hacky... but will pass for playing
            return Promise.resolve(false);
        }

        // Get the screen dimensions
        if( !dontSaveResolution ) saveCurrentResolution();

        // If the symlink to the save directory is the same for all games, update the symlink
        if( !noGame && systemsDict[system].allGamesShareNand ) {
            updateNandSymlinks( system, game, null, parents );
        }

        let arguments = [];

        if( !noGame ) {
            arguments.push( generateRomLocation( system, game, getGameDictEntry(system, game, parents).rom, parents ) );

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
                arguments = arguments.concat( systemsDict[system].extraFlags );
            }

            if( systemsDict[system].argsFirst ) {
                arguments.push(arguments[0]);
                arguments.shift();
            }
        }

        currentEmulator = proc.spawn( command, arguments, {detached: true, stdio: 'ignore'} );
        currentEmulator.on('exit', blankCurrentGame);

        currentGame = game;
        currentSystem = system;
        currentParentsString = parents.join(SEPARATOR);

        if( !noGame && systemsDict[system].fullScreenButtons ) {
            activateTries = 1; // We know the program since we waited until we could full screen
            // I guess the only time this would come into play is if we failed to full screen
            // due to this program not opening. I think it is best we don't wait another X tries
            // in that case.
            for( let i=0; i<fullScreenTries; i++ ) {
                try {
                    proc.execSync( systemsDict[system].activateCommand );
                    ks.sendCombination( systemsDict[system].fullScreenButtons );
                    break;
                }
                catch(err) { 
                    console.log("full screen failed.");
                    proc.execSync( SLEEP_COMMAND );
                }
            }
        }
    }

    if( systemsDict[system].activateCommand ) {
        let command = systemsDict[system].activateCommand;
        if( noGame && systemsDict[system].frontendActivateCommand ) command = systemsDict[system].frontendActivateCommand;
        
        for( let i=0; i<activateTries; i++ ) {
            try {
                proc.execSync( command );
                break;
            }
            catch(err) { 
                console.log("activate failed."); 
                proc.execSync( SLEEP_COMMAND );
            }
        }
        try {
            resumeGame();
        }
        catch(err) {/*ok*/}
    }
    else if( system == BROWSER ) {
        if ( browsePage && !browsePage.isClosed() ) {
            browsePage.bringToFront();
        }
    }
    else if( system == MEDIA ) {
        if( menuPage && !menuPage.isClosed() ) {
            resumeRemoteMedia();
        }
    }
    return Promise.resolve(false);
}

/**
 * Quit the game currently being played.
 * @returns {Promise<(boolean|string)>} A promise containing an error message if there was an error or false if there was not.
 */
async function quitGame() {
    if(currentEmulator) {
        if(currentSystem != BROWSER && currentSystem != MEDIA) {
            currentEmulator.removeListener('exit', blankCurrentGame);
            proc.execSync( KILL_COMMAND + currentEmulator.pid );
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
    currentGame = null;
    currentSystem = null;
    currentParentsString = null;
    currentEmulator = null;
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
 * @param {object} [file] - The file object (from upload).
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
        if( (!file || !file.path || !file.originalname) && !isFolder && !isPlaylist && !isSymlink ) return ERROR_MESSAGES.romFileRequired;
        if( isPlaylist && system != MEDIA ) return ERROR_MESSAGES.playlistsOnlyForMedia;
        if( (!playlistItems || !playlistItems.length) && isPlaylist ) return ERROR_MESSAGES.playlistItemsRequired;
        if( isPlaylist ) {
            let playlistItemsError = errorCheckValidPlaylistItems( playlistItems );
            if( playlistItemsError ) return playlistItemsError;
        }
        if( isSymlink && !getGameDictEntry(symlink.system, symlink.game, symlink.parents)) return ERROR_MESSAGES.invalidSymlink;
    }

    // Make the directory for the game
    if( !isSymlink ) {
        let gameDir = generateGameDir( system, game, parents );
        fs.mkdirSync( gameDir );

        // regular game
        if( !isFolder && !isPlaylist ) {
            // Move the rom into the directory
            let errorMessage = saveUploadedRom( file, system, game, parents );  
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
    if( !force ) getData();

    if( !isFolder && !isPlaylist && !isSymlink ) {
        // Do this AFTER running get data, so we know we are all set with the save directories
        updateNandSymlinks(system, game, null, parents);
    }

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
        console.log( addGame( system, symlinkName, null, parentsOfSymlinks, false, false, null, true, {
            system: system,
            game: playlistItem[playlistItem.length-1],
            parents: playlistItem.slice(0, playlistItem.length-1)
        }, true ) );
        indexPrefix = indexPrefix.slice(0, -1);
    }
    // Make note that it is a playlist
    fs.writeFileSync(generateGameMetaDataLocation(system, game, parents), JSON.stringify({"isPlaylist": true}));
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
    fs.renameSync(file.path, generateRomLocation(system, game, file.originalname, parents));
    fs.writeFileSync(generateGameMetaDataLocation(system, game, parents), JSON.stringify({"rom": file.originalname}));
    return false;
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
 * @param {Object} [file] - The new file object - null if the same.
 * @param {Array<string>} [parents] - An array of parent folders for a game.
 * @param {boolean} [isFolder] - True if this game is really a folder of other games.
 * @param {boolean} [isPlaylist] - True if the game is a playlist (will function similarly to a folder).
 * @param {Array<Array<string>>} [playlistItems] - The items in the playlist.
 * @returns {(boolean|string)} An error message if there was an error, false if there was not.
 */
function updateGame( oldSystem, oldGame, oldParents=[], system, game, file, parents=[], isFolder, isPlaylist, playlistItems ) {

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

    // Get the current game directory
    let oldGameDir = generateGameDir( oldSystem, oldGame, oldParents );

    let oldRomNandPath = "";

    // Just clear out and reload symlinks for playlists
    if( isPlaylist ) {
        deletePlaylistSymlinks( oldSystem, oldGame, oldParents );
        addSymlinksToPlaylist( oldSystem, oldGame, oldParents, playlistItems );
    }

    // Update the rom file if necessary 
    if( file && !isFolder && !isPlaylist ) {
        // Get the current game file and its name. We will move it for now,
        // but we will ultimately either move it back or get rid of it.
        // upload into the old directory and that will change if necessary next
        let oldRomPath = getGameDictEntry(oldSystem, oldGame, oldParents).rom ? generateRomLocation( oldSystem, oldGame, getGameDictEntry(oldSystem, oldGame, oldParents).rom, oldParents ) : "";
        if( oldRomPath ) {
            oldRomNandPath = getNandPath( oldSystem, oldGame, oldParents ); // We'll need this to clean up the old rom for NAND systems
            fs.renameSync( oldRomPath, TMP_ROM_LOCATION );
        }
        
        // Try to upload the new file
        errorMessage = saveUploadedRom( file, oldSystem, oldGame, oldParents );

        // We failed
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
    
    // Update the data (this will take care of making all the necessary directories for the game as well as updating the data)
    getData();

    // Do this AFTER running get data, so we can pass the checked in addGame
    // Do this AFTER running get data, so we know we are all set with the save directories
    if( !isFolder && !isPlaylist ) {
        updateNandSymlinks(system ? system : oldSystem, game ? game : oldGame, oldRomNandPath, parents ? parents : oldParents);
    }
    else if( isFolder ) { // Media doesn't have nand links
        ensureNandSymlinks(system ? system : oldSystem, game ? game : oldGame, parents ? parents : oldParents, getGameDictEntry(system ? system : oldSystem, game ? game : oldGame, parents ? parents : oldParents) );
    }

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
            proc.execSync(SET_RESOLUTION_COMMAND + properResolution);
        }
    }
}

/**
 * Freeze the game process.
 * This is only for programs.
 */
function pauseGame() {
    if(currentEmulator && currentSystem != BROWSER && currentSystem != MEDIA) {
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
    if(currentEmulator && currentSystem != BROWSER && currentSystem != MEDIA) {
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
                await menuPage.evaluate( () => { closeModalCallback=null; closeModal(); } );
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
 * Go to the home menu.
 * @returns {Promise<(boolean|string)>} An error message if there was an error, or an object indicating if we paused if not.
 */
async function goHome() {
    if( !menuPage || menuPage.isClosed() ) {
        return Promise.resolve(ERROR_MESSAGES.menuPageClosed);
    }

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
            if( currentEmulator && currentGame == BROWSER && browsePage && !browsePage.isClosed() ) await browsePage.evaluate( () => document.exitFullscreen() );
        }
        pauseRemoteMedia();
    }
    catch(err) {/*ok*/}
    return Promise.resolve( { "didPause": needsPause } );
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
 * @returns {(boolean|string)} An error message if there is one, or false if not.
 */
async function fetchGameData( system, game, parents, currentMetadataContents, force ) {
    //let isInvalid = isInvalidGame( system, game, parents );
    //if( isInvalid ) return isInvalid;
    if( !IGDB_API_KEY ) {
        return ERROR_MESSAGES.noApiKey;
    }
    if( system == MEDIA || system == BROWSER ) {
        return ERROR_MESSAGES.noGamesForMediaOrBrowser;
    }

    let metaDataLocation = generateGameMetaDataLocation(system, game, parents);
    if( !currentMetadataContents ) currentMetadataContents = JSON.parse(fs.readFileSync(metaDataLocation));
    let currentTime = new Date().getTime();
    
    if( !force && currentMetadataContents.lastFetched && parseInt(currentMetadataContents.lastFetched) > currentTime - ONE_WEEK_MILLISECONDS ) {
        return ERROR_MESSAGES.alreadyFetchedWithinWeek;
    }

    delete currentMetadataContents.summary
    delete currentMetadataContents.releaseDate;
    delete currentMetadataContents.name;
    delete currentMetadataContents.cover;

    let payload = GAMES_FIELDS + 'search "' + game + '";' + 'where platforms=(' + PLATFORM_LOOKUP[system].join() + ");";
    let gameInfo = await axios.post( GAMES_ENDPOINT, payload, { "headers": IGDB_HEADERS } );
    if( gameInfo.data.length ) {
        gameInfo = gameInfo.data[0];
        if( gameInfo.first_release_date ) currentMetadataContents.releaseDate = gameInfo.first_release_date;
        if( gameInfo.name ) currentMetadataContents.name = gameInfo.name;
        if( gameInfo.summary ) currentMetadataContents.summary = gameInfo.summary;
        if( gameInfo.cover ) {
            let coverPayload = "where id=" + gameInfo.cover + ";" + COVERS_FIELDS;
            let coverInfo = await axios.post( COVERS_ENDPOINT, coverPayload, { "headers": IGDB_HEADERS } );
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
                    currentMetadataContents.cover = coverInfo;
                }
            }
            currentMetadataContents.lastFetched = currentTime; // update the time fetched
            fs.writeFileSync(metaDataLocation, JSON.stringify(currentMetadataContents));
            return false;
        }
        else {
            currentMetadataContents.lastFetched = currentTime; // update the time fetched
            fs.writeFileSync(metaDataLocation, JSON.stringify(currentMetadataContents));
            return false;
        }
    }
    else {
        currentMetadataContents.lastFetched = currentTime; // update the time fetched
        fs.writeFileSync(metaDataLocation, JSON.stringify(currentMetadataContents));
        return ERROR_MESSAGES.noGameInfo;
    }
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
    proc.spawn( START_GUYSTATION_COMMAND, { shell: true, detached: true } );
    proc.execSync( KILL_GUYSTATION_COMMAND );
    return false;
}

/**
 * Reboot the computer guystation is running on.
 * @returns {boolean} False.
 */
function rebootGuystation() {
    proc.execSync( REBOOT_GUYSTATION_COMMAND );
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

// Listen for the "home" button to be pressed
ioHook.on("keydown", event => {
    if( event.keycode == ESCAPE_KEY ) {
        goHome();
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
} );

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
 * @param {id} - The id of the socket asking the menuPage to connect.
 * @returns {Promise<(boolean|string)>} An error message if there is one or false if there is not.
 */
async function connectScreencast( id ) {
    if( !menuPage || menuPage.isClosed() ) {
        return Promise.resolve(ERROR_MESSAGES.menuPageClosed);
    }

    resetScreencastTimeout( id ); // add to the screencast timeouts
    // this is extra security beyond oniceconnectionstatechange in case the connection never happens
    // so it never disconnects

    // do not connect again if we are already connected
    if( serverSocketId ) {
        return false;
    }
    // starting a screencast will activate the home tab
    // it is best to predict that and to it anyway
    if( currentEmulator && currentSystem != MEDIA && !startedClientIds.length && !menuPageIsActive() ) { 
        // Get the current resolution of the emulator	
        let emulatorResolution = proc.execSync(GET_RESOLUTION_COMMAND).toString();
        await goHome();
        if( !properResolution ) {	
            saveCurrentResolution();	
        }
        // Update the home resolution before we start the stream, so when we start the start it gets the right resolution for the emulator	
        let homeResolution = proc.execSync(GET_RESOLUTION_COMMAND).toString();	
        if( homeResolution != emulatorResolution ) {	
            proc.execSync(SET_RESOLUTION_COMMAND + emulatorResolution);	
        }
        needToRefocusGame = true; 
    }
    // focus on guy station
    await menuPage.evaluate( () => connectToSignalServer(true) );    

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
    let currentStartedClientIdsLength = startedClientIds.length;
    startedClientIds.push(id);
    await menuPage.evaluate( (id) => startConnectionToPeer(true, id), id );
    // we can return to the game now
    if( currentEmulator && currentSystem != MEDIA && !currentStartedClientIdsLength && needToRefocusGame ) {
        await launchGame( currentSystem, currentGame, false, currentParentsString.split(SEPARATOR).filter(el => el != ''), true ); 
        needToRefocusGame = false;
    }
    else if( !currentStartedClientIdsLength ) await goHome(); // focus on chrome from any screen share info popups
    return Promise.resolve(false);
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
    delete cancelStreamingTimeouts[id];

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
    try {
        if( menuPageIsActive() ) ensureProperResolution(); // we might have gone home and changed to resolution in preparation to go back to the emulator. If there was an error, we might not have gone back to the emulator. In this case, once the reset timeout fails, we should make sure we have the correct resolution.
    }
    catch(err) { /* ok */ }
    return Promise.resolve(false);
}

/**
 * Perform a click on guystation.
 * Works for left click, right click, and middle click.
 * @param {number} xPercent - The percentage x offset on which to perform the click.
 * @param {number} yPercent - The percentage y offset on which to perform the click.
 * @param {string} button - left, right, or middle.
 * @param {boolean} [down] - True if we are pushing the mouse down, false if up.
 * @returns {Promise<(boolean|string)>} A promise that is false if the action was successful or contains an error message if not.
 */
async function performScreencastMouse( xPercent, yPercent, button, down ) {
    if( xPercent < 0 || yPercent < 0 || xPercent > 1 || yPercent > 1 ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageInvalidCoordinates );
    }

    let screenResolution = proc.execSync(GET_RESOLUTION_COMMAND).toString().split("x");
    let width = parseInt(screenResolution[0]);
    let height = parseInt(screenResolution[1]);
    let x = width * xPercent;
    let y = height * yPercent;

    if( down ) {
        robot.moveMouse(x, y);
    }
    else {
        robot.dragMouse(x, y);
    }
    robot.mouseToggle(down ? DOWN : UP, button);

    return Promise.resolve(false);
}

/**
 * Perform a button key down or up on a screencast.
 * @param {Array<Number>} buttons - An array of button keycodes to press.
 * @param {boolean} [down] - True if we are pushing the buttons down, false if up.
 * @returns {Promise<(boolean|string)>} A promise that is false if the action was successful or contains an error message if not.
 */
async function performScreencastButtons( buttons, down ) {

    for( let button of buttons ) {
        try {
            let curKeycode = keycode(button);
            if( KEYCODE_TO_ROBOT_JS[curKeycode] ) curKeycode = KEYCODE_TO_ROBOT_JS[curKeycode];
            robot.keyToggle( curKeycode, down ? DOWN : UP);
        }
        catch(err) {/* invalid key code - ok */};
    }

    return Promise.resolve(false);
}

// End signal server section
