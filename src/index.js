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
const SLEEP_COMMAND = "sleep 5";
const FOCUS_CHROMIUM_COMMAND = "wmctrl -a 'Chrom'";
const TMP_ROM_LOCATION = "/tmp/tmprom";
const NAND_ROM_FILE_PLACEHOLDER = "ROM_FILE_PLACEHOLDER";
const FULL_SCREEN_KEY = "f11";
const BROWSER = "browser";
const GOOGLE_SEARCH_URL = "https://google.com/search?q=";
const HTTP = "http://";
const UP = "up";
const DOWN = "down";
const SCROLL_AMOUNT_MULTIPLIER = 0.8;
const LINUX_CHROME_PATH = "/usr/bin/google-chrome";
const STREAM_LIMIT_TIME = 750;
const HOMEPAGE = "https://game103.net";

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
    "browseInvalidDirection": "Invalid scroll direction"
}

// We will only allow for one request at a time for app
let requestLocked = false;

let currentSystem = null;
let currentGame = null;
let currentEmulator = null;

let systemsDict = {};

let browser = null;
let menuPage = null;
let browsePage = null;
let lastOutputTime = 0;
let outputTimeout = null;

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
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
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
        let errorMessage = launchGame( request.body.system, request.body.game );
        getData();
        requestLocked = false;
        writeActionResponse( response, errorMessage );
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
        let errorMessage = quitGame();
        getData(); // Reload data
        requestLocked = false;
        writeActionResponse( response, errorMessage );
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
        let errorMessage = newSave( request.body.system, request.body.game, request.body.save );
        getData(); // Reload data
        requestLocked = false;
        writeActionResponse( response, errorMessage );
    }
    else {
        writeLockedResponse( response );
    }
});

// Change the current save
app.put("/save", async function(request, response) {
    console.log("app serving /save/ (PUT) with body: " + JSON.stringify(request.body));
    if( ! requestLocked ) {
        requestLocked = true;
        let errorMessage = changeSave( request.body.system, request.body.game, request.body.save );
        getData(); // Reload data
        requestLocked = false;
        writeActionResponse( response, errorMessage );
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
        let errorMessage = deleteSave( request.body.system, request.body.game, request.body.save );
        getData(); // Reload data
        requestLocked = false;
        writeActionResponse( response, errorMessage );
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
        let errorMessage = addGame( request.body.system, request.body.game, request.file );
        getData(); // Reload data
        requestLocked = false;
        writeActionResponse( response, errorMessage );
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
        let errorMessage = updateGame( request.body.oldSystem, request.body.oldGame, request.body.system, request.body.game, request.file );
        getData(); // Reload data
        requestLocked = false;
        writeActionResponse( response, errorMessage );
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
        let errorMessage = deleteGame( request.body.system, request.body.game );
        getData(); // Reload data
        requestLocked = false;
        writeActionResponse( response, errorMessage );
    }
    else {
        writeLockedResponse( response );
    }
});

// Respond to a click event from a browser
app.post("/browser/click", async function(request, response) {
    console.log("app serving /browser/click with body: " + JSON.stringify(request.body));
    let errorMessage = await performClick( request.body.xPercent, request.body.yPercent );
    writeActionResponse( response, errorMessage );
});

// Get input for the a browser
app.post("/browser/input", async function(request, response) {
    console.log("app serving /browser/input with body: " + JSON.stringify(request.body));
    let errorMessage = await performInput( request.body.input );
    writeActionResponse( response, errorMessage );
});

// Get input for the a browser
app.get("/browser/start-streaming", async function(request, response) {
    console.log("app serving /browser/start-streaming");
    // Don't worry about locking for these
    let errorMessage = await startStreaming();
    writeActionResponse( response, errorMessage );
});

// Get input for the a browser
app.get("/browser/stop-streaming", async function(request, response) {
    console.log("app serving /browser/stop-streaming");
    // Don't worry about locking for these
    let errorMessage = await stopStreaming();
    writeActionResponse( response, errorMessage );
});

// Get input for the a browser
app.get("/browser/url", async function(request, response) {
    console.log("app serving /browser/url");
    // Don't worry about locking for these
    let url = await getUrl();
    if( !(url in ERROR_MESSAGES) ) {
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

// START PROGRAM (Launch Browser and Listen)
server.listen(SOCKETS_PORT); // This is the screencast server
staticApp.listen(STATIC_PORT); // Launch the static assets first, so the browser can access them
launchBrowser().then( () => app.listen(PORT) );

/**************** Express & Puppeteer Functions ****************/

/**
 * Determine if a game is not available.
 * @param {string} system - the system the game is on
 * @param {string} game - the game to play
 * @returns false if the game is available, or an error message if it is not
 */
function isInvalidGame( system, game ) {
    if( !system || !systemsDict[system] ) {
        return ERROR_MESSAGES.noSystem;
    }
    else if( !game || !systemsDict[system].games[game] ) {
        return ERROR_MESSAGES.noGame;
    }
    return false;
}

/**
 * Write a standard response for when an action is taken
 * @param {Response} response - the response object
 * @param {string} errorMessage - the error message from running the code
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
 * Write a response indicating that the request is locked
 * @param {Response} response - the response object
 */
function writeLockedResponse( response ) {
    writeResponse( response, FAILURE, { "message": ERROR_MESSAGES.anotherRequestIsBeingProcessed}, HTTP_TEMPORARILY_UNAVAILABLE );
}

/**
 * Send a response to the user
 * @param {Response} response - the response object
 * @param {String} status - the status of the request
 * @param {Object} object - an object containing values to include in the response
 * @param {Number} code - the HTTP response code (defaults to 200)
 * @param {String} contentType - the content type of the response (defaults to application/json)
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
 * Launch a puppeteer browser
 */
async function launchBrowser() {
    let options = {
        headless: false,
        defaultViewport: null,
        args: ['--start-fullscreen', '--no-sandbox']
    };
    if(process.argv.indexOf("--chromium") == -1) {
        options.executablePath = LINUX_CHROME_PATH;
    }
    browser = await puppeteer.launch(options);
    let pages = await browser.pages();
    menuPage = await pages[0];
    await menuPage.goto(LOCALHOST + ":" + STATIC_PORT);
    ks.sendKey('tab');
}

/**
 * Perform a click on the page.
 * @param {Number} xPercent - the percentage x offset on which to perform the click
 * @param {Number} yPercent - the percentage y offset on which to perform the click
 * @returns {Promise} - a promise that is false if the action was successful or contains an error message if not
 */
async function performClick( xPercent, yPercent ) {
    if( !browsePage || browsePage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
    }
    else if( xPercent > xPercent > 0 && yPercent > 0 && xPercent < 1 && yPercent < 1 ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageInvalidCoordinates );
    }
    
    let width = await browsePage.evaluate( () => { return document.documentElement.clientWidth; } );
    let height = await browsePage.evaluate( () => { return document.documentElement.clientHeight; } );
    let x = width * xPercent;
    let y = height * yPercent;
    await browsePage.mouse.click(x, y);

    return Promise.resolve(false);
}

/**
 * Perform input on the page.
 * @param {String} input - the input to type
 * @returns {Promise} - a promise that is false if the action was successful or contains an error message if not
 */
async function performInput( input ) {
    if( !browsePage || browsePage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
    }
    
    await browsePage.keyboard.type(input);

    return Promise.resolve(false);
}

/**
 * Start streaming the browse page.
 * @returns {Promise} - a promise that is false if the action was successful or contains an error message if not
 */
async function startStreaming() {
    if( !browsePage || browsePage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
    }

    await browsePage._client.send("Page.startScreencast");
    browsePage._client.on("Page.screencastFrame", event => {
        let curOutputTime = Date.now();
        let timeToWait = STREAM_LIMIT_TIME - (curOutputTime - lastOutputTime);
        if (timeToWait < 0) {
            timeToWait = 0;
        }
        // Clear any current image waiting to send
        if( outputTimeout ) {
            clearTimeout(outputTimeout);
        }
        // Set the timeout to emit
        outputTimeout = setTimeout( function() {
            io.sockets.emit("canvas", event.data);
            lastOutputTime = Date.now();
            outputTimeout = null;
        }, timeToWait );
    } );
    return Promise.resolve(false);
}

/**
 * Stop streaming the browse page.
 * @returns {Promise} - a promise that is false if the action was successful or contains an error message if not
 */
async function stopStreaming() {
    if( !browsePage || browsePage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
    }

    await browsePage._client.send("Page.stopScreencast");
    return Promise.resolve(false);
}

/**
 * Get the current address of the browse page.
 * @returns {Promise} - a promise containing the current page or an error message
 */
async function getUrl() {
    if( !browsePage || browsePage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
    }

    return Promise.resolve(browsePage.url());
}

/**
 * Navigate to a url.
 * @param {String} url - the url to navigate to
 * @returns {Promise} - a promise containing the current page or an error message
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
 * @returns {Promise} - a promise containing the current page or an error message
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
 * Scroll.
 * @returns {Promise} - a promise containing the current page or an error message
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
 * Go forward.
 * This function will be a no-op if the browser cannot go forward.
 * @returns {Promise} - a promise containing the current page or an error message
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
 * Go back.
 * This function will be a no-op if the browser cannot go back.
 * @returns {Promise} - a promise containing the current page or an error message
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
 * @returns {Promise} - a promise that is false if the action was successful or contains an error message if not
 */
async function launchBrowseTab() {
    browsePage = await browser.newPage();
    await browsePage.goto(HOMEPAGE);
    browsePage.on("close", function() { if( currentSystem === BROWSER ) { blankCurrentGame(); } });
    return Promise.resolve(false);
}

/**
 * Close a browse tab.
 * @returns {Promise} - a promise that is false if the action was successful or contains an error message if not
 */
async function closeBrowseTab() {
    if( !browsePage || browsePage.isClosed() ) {
        return Promise.resolve( ERROR_MESSAGES.browsePageClosed );
    }

    await browsePage.close();
    browsePage = null;
    return Promise.resolve(false);
}

/**************** Data Functions ****************/

// TODO more emulators
// TODO find a way to use the error values returned from the asynchronous browser functions
// kill -9 not working right after start

/**
 * Generate data about available options to the user
 * The result is cached
 * This should be called again if the file structure is edited
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

        // Create the games dictionary - the key will be the name of the game
        let gamesDict = {};
        // Read all the games
        let games = [];
        let gamesDir = generateGamesDir(system);
        try {
            games = fs.readdirSync(generateGamesDir(system), {withFileTypes: true}).filter(file => file.isDirectory()).map(dir => dir.name);
        }
        catch( err ) {
            fs.mkdirSync( gamesDir );
        }
        // For each of the games
        for( let game of games ) {
            // Create an object the hold the game data
            let gameData = {};
            gameData.game = game;
            
            // Get the contents of the games directory
            let gameDirContents =  fs.readdirSync(generateGameDir(system, game));
            try {
                gameData.rom = JSON.parse(fs.readFileSync(generateGameMetaDataLocation(system, game))).rom;
            }
            catch(err) {
                // Try to figure out the ROM file
                for( let gameDirContent of gameDirContents ) {
                    if( gameDirContent != SAVES_DIR && !gameDirContent.match(/^\./) ) {
                        gameData.rom = gameDirContent;
                        break;
                    }
                }
            }
            
            if( system != BROWSER ) {
                let savesInfo = generateSaves(system, game);
                gameData.currentSave = savesInfo.currentSave;
                gameData.saves = savesInfo.savesDict;
            }

            // If this game is being played, indicate as such
            if( isBeingPlayed( system, game ) ) {
                gameData.playing = true;
            }

            // Add this game to the dictionary of games for this system
            gamesDict[game] = gameData;
        }
        // Set the games for this system
        systemData.games = gamesDict;

        // Add this system to the dictionary of systems
        systemsDict[system] = systemData;
    }

    // Make a log of the data
    //console.log(JSON.stringify(systemsDict));
}

/**
 * Generate the information about saves for a game
 * This function will create data (and files) if necessary
 * @param {string} system - the system the game is on
 * @param {string} game - the game we want to get saves information for
 * @returns {object} an object with a currentSave key containing the current save and a savesDict key containing the saves information
 */
function generateSaves( system, game ) {
    let savesDir = generateSavesDir(system, game);
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
        newSave( system, game, DEFAULT_SAVE_DIR, true ); // create a default save directory
        changeSave( system, game, DEFAULT_SAVE_DIR, true );
        saves.push( DEFAULT_SAVE_DIR );
    }

    // Create the dictionary for saves
    let savesDict = {};
    // Get the contents of the screenshots for the save
    for( let save of saves ) {
        let screenshotsDir = generateScreenshotsDir(system, game, save);
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

    let currentSave = getCurrentSave(system, game);
    // if the current save isn't working -- i.e. the symlink is messed up, get another one.
    // we know there will be at least one, since if there were 0 we already created one
    if( !currentSave ) {
        // force in case we just created a directory
        changeSave( system, game, saves[0], true );
        currentSave = getCurrentSave(system, game);
    }

    return { savesDict: savesDict, currentSave: currentSave };
}

/**
 * Generate the full directory for a system.
 * @param {string} system - the system to get the directory of
 * @returns the directory of the system (e.g. /home/user/guystation/systems/gba)
 */
function generateSystemDir(system) {
    return SYSTEMS_DIR_FULL + SEPARATOR + system;
}

/**
 * Generate the metadata location for a system.
 * @param {string} system - the system to get metadata for
 * @returns the metadata (e.g. /home/user/guystation/systems/gba/metadata.json)
 */
function generateMetaDataLocation(system) {
    return generateSystemDir(system) + SEPARATOR + METADATA_FILENAME;
}

/**
 * Generate the full directory for games of a system.
 * @param {string} system - the system the game is on
 * @returns the directory of the system games (e.g. /home/user/guystation/systems/gba/games)
 */
function generateGamesDir(system) {
    return generateSystemDir(system) + SEPARATOR + GAMES_DIR;
}

/**
 * Generate the full directory for a game.
 * @param {string} system - the system the game is on
 * @param {string} game - the game to get the directory of
 * @returns the directory of the game (e.g. /home/user/guystation/systems/gba/games/super-mario-world)
 */
function generateGameDir(system, game) {
    return generateGamesDir(system) + SEPARATOR + game;
}

/**
 * Generate the full path for a ROM.
 * @param {string} system - the system the game is on
 * @param {string} game - the game to get the ROM for
 * @param {string} rom - the ROM's filename
 * @returns the ROM filepath for the game (e.g. /home/user/guystation/systems/gba/games/super-mario-world/mario-world.gba)
 */
function generateRomLocation(system, game, rom) {
    return generateGameDir(system, game) + SEPARATOR + rom;
}

/**
 * Generate the full path for the metadata of a game.
 * @param {string} system - the system the game is on
 * @param {string} game - the game
 * @returns the metadata filepath for the game (e.g. /home/user/guystation/systems/gba/games/super-mario-world/metadata.json)
 */
function generateGameMetaDataLocation(system, game) {
    return generateGameDir(system, game) + SEPARATOR + METADATA_FILENAME;
}

/**
 * Generate the full directory for game saves.
 * @param {string} system - the system the game is on
 * @param {string} game - the game to get the directory of
 * @returns the directory of the game saves (e.g. /home/user/guystation/systems/gba/games/super-mario-world/saves)
 */
function generateSavesDir(system, game) {
    return generateGameDir(system, game) + SEPARATOR + SAVES_DIR;
}

/**
 * Generate the full directory for a game save.
 * @param {string} system - the system the game is on
 * @param {string} system - the game the save if for
 * @param {string} save - the save directory to get
 * @returns the directory of the save (e.g. /home/user/guystation/systems/gba/games/super-mario-world/saves/default)
 */
function generateSaveDir(system, game, save) {
    return generateSavesDir(system, game) + SEPARATOR + save;
}

/**
 * Generate the full directory for the screenshots for a save.
 * 
 * @param {string} system - the system the game is on
 * @param {string} system - the game the screenshots are for
 * @param {string} save - the save directory
 * @returns the directory of the screenshots (e.g. /home/user/guystation/systems/gba/games/super-mario-world/saves/default/screenshots)
 */
function generateScreenshotsDir(system, game, save) {
    return generateSaveDir(system, game, save) + SEPARATOR + SCREENSHOTS_DIR;
}

/**
 * Launch a game.
 * @param {string} system - the system to run the game on.
 * @param {string} game - the game to run.
 * @param {boolean} restart - if true, the game will be reloaded no matter what. If false, and the game is currently being played, it will just be brought to focus.
 * @returns {*} an error message if there was an error, or false if there was not
 */
function launchGame(system, game, restart=false) {

    // Error check
    let isInvalid = isInvalidGame( system, game );
    if( isInvalid ) {
        return isInvalid;
    }
    else if( !fs.existsSync(generateRomLocation( system, game, systemsDict[system].games[game].rom )) && system != BROWSER ) {
        return ERROR_MESSAGES.noRomFile;
    }

    // Restart unless restart is false, we have a current emulator, and we are playing the game we selected
    if( !isBeingPlayed(system, game) || restart || !currentEmulator ) {
        quitGame();

        let command = systemsDict[system].command;
        // We know it must be browser
        if( !command ) {
            launchBrowseTab();
            currentSystem = systemsDict[system].system;
            currentGame = systemsDict[system].games[ Object.keys(systemsDict[system].games)[0] ].game;
            currentEmulator = true; // Kind of hacky... but will pass for playing
            return false;
        }

        let arguments = [ 
            generateRomLocation( system, game, systemsDict[system].games[game].rom )
        ];

        if( systemsDict[system].saveDirFlag ) {
            if( systemsDict[system].optionPrefix ) { arguments.push( systemsDict[system].optionPrefix ); }
            arguments.push(systemsDict[system].saveDirFlag);

            let saveDir = generateSaveDir( system, game, CURRENT_SAVE_DIR );
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
            let screenshotsDir = generateScreenshotsDir( system, game, CURRENT_SAVE_DIR );
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

        currentEmulator = proc.spawn( command, arguments, {detached: true, stdio: 'ignore'} );
        currentEmulator.on('exit', blankCurrentGame);

        currentGame = game;
        currentSystem = system;

        // Sleep before either activating or full-screening, to give the program time to open
        if( systemsDict[system].activateCommand || systemsDict[system].fullScreenPress ) {
            proc.execSync( SLEEP_COMMAND ); // sleep before activating.
        }
        if( systemsDict[system].fullScreenPress ) {
            try {
                proc.execSync( systemsDict[system].activateCommand );
                ks.sendKey(FULL_SCREEN_KEY);
            }
            catch(err) { console.log("full screen failed."); }
        }
    }
    if( systemsDict[system].activateCommand ) {
        try {
            proc.execSync( systemsDict[system].activateCommand );
        }
        catch(err) { console.log("activate failed."); }
    }
    else if( system == BROWSER ) {
        if ( browsePage && !browsePage.isClosed() ) {
            browsePage.bringToFront();
        }
    }
    return false;
}

/**
 * Quit the game currently being played.
 * @returns {*} an error message if there was an error or false if there was not
 */
function quitGame() {
    if(currentEmulator) {
        if(currentSystem != BROWSER) {
            currentEmulator.removeListener('exit', blankCurrentGame);
            proc.execSync( KILL_COMMAND + currentEmulator.pid );
        }
        else if( browsePage && !browsePage.isClosed() ) {
            closeBrowseTab();
        }
        currentEmulator = null;
        currentGame = null;
        currentSystem = null;
        return false;
    }
    else {
        return ERROR_MESSAGES.noRunningGame;
    }
}

/**
 * Blank all the values from the current game.
 */
function blankCurrentGame() {
    currentGame = null;
    currentSystem = null;
    currentEmulator = null;
}

/**
 * Check if a game is currently being played.
 * @param {string} system - the system of the game to see if it's being played
 * @param {string} game - the game to check if it's being played
 * @returns true if the game is being played; false if it is not
 */
function isBeingPlayed(system, game) {
    return (currentSystem == system && currentGame == game && currentEmulator);
}

/**
 * Get the current save for a game
 * @param {string} system - the system the game is for
 * @param {string} game - the game to get the current save for
 * @returns the name of the current save or false if the save couldn't be fetched
 */
function getCurrentSave(system, game) {

    let currentSaveDir = generateSaveDir( system, game, CURRENT_SAVE_DIR );

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
 * @param {string} system - the system the game is on
 * @param {string} game - the game to create a save for
 * @param {string} save - the name of the new save
 * @param {boolean} force - skip error check
 * @returns {*} - an error message if there was an error, otherwise false
 */
function newSave(system, game, save, force) {

    if( !force ) {
        // Error check
        // Make sure the game is valid
        let isInvalid = isInvalidGame( system, game );
        if( isInvalid ) return isInvalid;
        // This name is reserved (current)
        if( save == CURRENT_SAVE_DIR ) {
            return ERROR_MESSAGES.usingReservedSaveName;
        }
        // Make sure the name is not already being used
        if( systemsDict[system].games[game].saves[save] ) {
            return ERROR_MESSAGES.saveAlreadyExists;
        }
        // Make sure there is a save
        if( !save ) return ERROR_MESSAGES.saveNameRequired;
    }

    // Create a new save directory
    fs.mkdirSync( generateSaveDir( system, game, save ) );
    // Create the screenshots directory for the save
    // Since we don't want spoilers for other saves, keep screenshots save specific
    fs.mkdirSync( generateScreenshotsDir( system, game, save ) );

    return false;
}

/**
 * Switch the current save.
 * @param {string} system - the system the game is on
 * @param {string} game - the game to change saves for
 * @param {string} save - the name of the save
 * @param {boolean} force - skip error check
 * @returns {*} - an error message if there was an error, otherwise false
 */
function changeSave(system, game, save, force) {

    if( !force ) {
        // Error check
        // Make sure the game is valid
        let isInvalid = isInvalidGame( system, game );
        if( isInvalid ) return isInvalid;
        // Can't change the save of a playing game
        if( isBeingPlayed( system, game) ) {
            return ERROR_MESSAGES.gameBeingPlayed;
        }
        // We need the save file to exist
        if( !systemsDict[system].games[game].saves[save] ) {
            return ERROR_MESSAGES.saveDoesNotExist;
        }
        if( systemsDict[system].games[game].currentSave == save ) {
            return ERROR_MESSAGES.saveAlreadySelected;
        }
    }

    let currentSaveDir = generateSaveDir( system, game, CURRENT_SAVE_DIR );
    // Remove the current symlink
    try {
        fs.unlinkSync( currentSaveDir );
    }
    catch(err) {} // OK, just means there was no current symlink

    // Symlink the current save
    fs.symlinkSync( generateSaveDir( system, game, save ), currentSaveDir, 'dir');

    return false;
}

/**
 * Delete a save.
 * @param {string} system - the name of the system.
 * @param {string} game - the name of the game.
 * @param {string} save - the name of the save.
 * @returns {*} - an error message if there was an error, otherwise false
 */
function deleteSave(system, game, save) {

    // Error check
    // Make sure the game is valid
    let isInvalid = isInvalidGame( system, game );
    if( isInvalid ) return isInvalid;
    // Can't change the save of a playing game
    if( isBeingPlayed( system, game) ) {
        return ERROR_MESSAGES.gameBeingPlayed;
    }
    // We need the save file to exist
    if( !systemsDict[system].games[game].saves[save] ) {
        return ERROR_MESSAGES.saveDoesNotExist;
    }

    let savesDir = generateSavesDir( system, game );
    let saveDir = generateSaveDir( system, game, save );

    // Delete the save
    rimraf.sync( saveDir );
        
    // Check if the symbolic link is now broken
    let currentSave = getCurrentSave( system, game );
    if( !currentSave ) {

        // If it is, try to switch to the default directory
        let defaultSaveDir = generateSaveDir( system, game, DEFAULT_SAVE_DIR );
        if( fs.existsSync( defaultSaveDir ) ) {
            changeSave( system, game, DEFAULT_SAVE_DIR );
        }
        // If the default directory does not exist, try to switch to any other save
        else {
            let currentSaves = fs.readdirSync(savesDir, {withFileTypes: true}).filter(file => file.isDirectory()).map(dir => dir.name);
            if( currentSaves.length ) {
                changeSave( system, game, currentSaves[0] );
            }
            // Otherwise, create the default directory and switch to that save
            else {
                // force is true, since we know there is no other directory and we know we want to make the save
                newSave( system, game, DEFAULT_SAVE_DIR, true );
                changeSave( system, game, DEFAULT_SAVE_DIR, true );
            }
        }
        
    }

    return false;
}

/**
 * Add a game.
 * @param {string} system - the system to add the game on
 * @param {string} game - the game name to add
 * @param {object} file - the file object
 */
function addGame( system, game, file ) {

    // Error check
    // Make sure the game is valid
    if( !systemsDict[system] ) return ERROR_MESSAGES.noSystem;
    if( systemsDict[system].games[game] ) return ERROR_MESSAGES.gameAlreadyExists;
    if( !game ) return ERROR_MESSAGES.gameNameRequired;
    if( !file || !file.path || !file.originalname ) return ERROR_MESSAGES.romFileRequired;

    // Make the directory for the game
    let gameDir = generateGameDir( system, game );
    fs.mkdirSync( gameDir );
    // Move the rom into the directory
    let errorMessage = saveUploadedRom( file, system, game );  
    if( errorMessage ) {
        // Delete the game directory
        rimraf.sync( gameDir );
        // Return the error message
        return errorMessage;
    }

    // Update the data (this will take care of making all the necessary directories for the game as well as updating the data)
    getData();

    // Do this AFTER running get data, so we know we are all set with the save directories
    updateNandSymlinks(system, game);

    return false;
}

/**
 * Get the NAND save path for a game on a system that requires a specific structure.
 * @param {String} system - the system the game is on
 * @param {String} game - the name of the game
 */
function getNandPath( system, game ) {
    if( systemsDict[system].nandPathCommand ) {
        let nandPathCommand = systemsDict[system].nandPathCommand.replace(NAND_ROM_FILE_PLACEHOLDER, generateRomLocation( system, game, systemsDict[system].games[game].rom ).replace("'", "'\"'\"'"));
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
 * @param {String} system - the system the game is on
 * @param {String} game - the name of the game
 */
function updateNandSymlinks( system, game, oldRomNandPath ) {
    // Make sure this is a system with the special file structure needed
    if( systemsDict[system].nandPathCommand ) {
        let nandSavePath = getNandPath( system, game );
        let currentSaveDir = generateSaveDir( system, game, CURRENT_SAVE_DIR );

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
 * @param {object} file - a file object
 * @param {string} system - the system the game is on
 * @param {string} game - the game the ROM is for
 * @returns {*} - an error message if there was an error, false if there was not.
 */
function saveUploadedRom( file, system, game ) {
    if( !file.originalname || !file.path ) {
        return ERROR_MESSAGES.noFileInUpload;
    }
    if( !fs.existsSync(generateGameDir(system, game)) ) {
        return ERROR_MESSAGES.locationDoesNotExist;
    }
    fs.renameSync(file.path, generateRomLocation(system, game, file.originalname));
    fs.writeFileSync(generateGameMetaDataLocation(system, game), JSON.stringify({"rom": file.originalname}));
    return false;
}

/**
 * Update a game.
 * @param {string} oldSystem - the old system for the game - needed so we know what we're updating
 * @param {string} oldGame - the old name for the game - needed so we know what we're updating
 * @param {string} system - the new system for the game - null if the same
 * @param {string} game - the new name for the game - null if the same
 * @param {object} file - the new file object - null if the same
 * @returns {*} - an error message if there was an error, false if there was not.
 */
function updateGame( oldSystem, oldGame, system, game, file ) {

    // Error check
    // Make sure the game and system are valid for old
    isInvalid = isInvalidGame( oldSystem, oldGame );
    if( isInvalid ) return isInvalid;
    // Can't change the save of a playing game
    if( isBeingPlayed( oldSystem, oldGame ) ) {
        return ERROR_MESSAGES.gameBeingPlayed;
    }
    // Make sure the new game doesn't already exist
    if( system && !systemsDict[system] ) return ERROR_MESSAGES.noSystem;
    if( game && systemsDict[system].games[game] ) return ERROR_MESSAGES.gameAlreadyExists;
       
    // Get the current game directory
    let oldGameDir = generateGameDir( oldSystem, oldGame );

    let oldRomNandPath = "";

    // Update the rom file if necessary 
    if( file ) {
        // Get the current game file and its name. We will move it for now,
        // but we will ultimately either move it back or get rid of it.
        // upload into the old directory and that will change if necessary next
        let oldRomPath = systemsDict[oldSystem].games[oldGame].rom ? generateRomLocation( oldSystem, oldGame, systemsDict[oldSystem].games[oldGame].rom ) : "";
        if( oldRomPath ) {
            oldRomNandPath = getNandPath( oldSystem, oldGame ); // We'll need this to clean up the old rom for NAND systems
            fs.renameSync( oldRomPath, TMP_ROM_LOCATION );
        }
        
        // Try to upload the new file
        errorMessage = saveUploadedRom( file, oldSystem, oldGame );

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
    if( (system && oldSystem != system) || (game && oldGame != game) ) {
        // Use the system command because node fs can't move directories
        let gameDir = generateGameDir( system ? system : oldSystem, game ? game : oldGame ); // update the game directory
        fsExtra.moveSync( oldGameDir, gameDir );
        // Update the symlink for the game
        // Force, since we've just updated the directory
        changeSave( system ? system : oldSystem, game ? game : oldGame, systemsDict[oldSystem].games[oldGame].currentSave, true );
    }
    
    // Update the data (this will take care of making all the necessary directories for the game as well as updating the data)
    getData();

    // Do this AFTER running get data, so we know we are all set with the save directories
    updateNandSymlinks(system, game, oldRomNandPath);

    return false;
}

/**
 * Delete a game.
 * @param {string} system - the game the system is on
 * @param {string} game - the game to delete
 * @returns {*} - an error message if there was an error, false if there was not.
 */
function deleteGame( system, game ) {

    // Error check
    // Make sure the game and system are valid
    isInvalid = isInvalidGame( system, game );
    if( isInvalid ) return isInvalid;
    // Can't change the save of a playing game
    if( isBeingPlayed( system, game ) ) {
        return ERROR_MESSAGES.gameBeingPlayed;
    }

    // If this is a NAND game, make sure we have a directory in place
    // in case they want to play the game outside of guystation
    let nandPath = getNandPath( system, game );
    if( nandPath && fs.existsSync(nandPath) ) {
        try {
            fs.unlinkSync(nandPath);
            fs.mkdirSync(nandPath);
        }
        catch(err) { /*It's already a directory for some reason*/ }
    }
    
    rimraf.sync( generateGameDir( system, game ) );
    
    getData();

    return false;
}

// Listen for the "home" button to be pressed
ioHook.on("keydown", event => {
    if( event.keycode == ESCAPE_KEY ) {
        proc.execSync(FOCUS_CHROMIUM_COMMAND);
        try {
            menuPage.bringToFront();
        }
        catch(err) {/*ok*/}
    }
});
ioHook.start();
