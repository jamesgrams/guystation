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

const PORT = 8080;
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
const IP = ip.address();
const ESCAPE_KEY = 1;
const KILL_COMMAND = "kill -9 ";
const SLEEP_COMMAND = "sleep 2";
const FOCUS_CHROMIUM_COMMAND = "wmctrl -a 'Chromium'";
const TMP_ROM_LOCATION = "/tmp/tmprom";

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
}

// We will only allow for one request at a time for app
let requestLocked = false;

let currentSystem = null;
let currentGame = null;
let currentEmulator = null;

let systemsDict = {};

let browser = null;

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
app.post("/game", async function(request, response) {
    console.log("app serving /game (POST)");
    if( ! requestLocked ) {
        requestLocked = true;
        let errorMessage = addGame( request.body.system, request.body.game, request.body.file );
        getData(); // Reload data
        requestLocked = false;
        writeActionResponse( response, errorMessage );
    }
    else {
        writeLockedResponse( response );
    }
});

// Update a game
app.put("/game", async function(request, response) {
    console.log("app serving /game (PUT)");
    if( ! requestLocked ) {
        requestLocked = true;
        let errorMessage = updateGame( request.body.oldSystem, request.body.oldGame, request.body.system, request.body.game, request.body.file );
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

// START PROGRAM (Launch Browser and Listen)
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
    browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-fullscreen', '--no-sandbox']
    });
    let pages = await browser.pages();
    let page = await pages[0];
    await page.goto(LOCALHOST + ":" + STATIC_PORT);
    ks.sendKey('tab');
}

/**************** Data Functions ****************/

// TODO more emulators
// TODO An xml mapping might be nice for controllers
// TODO refresh button keyboard mapping

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
            
	        let savesInfo = generateSaves(system, game);
            gameData.currentSave = savesInfo.currentSave;
            gameData.saves = savesInfo.savesDict;

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
    console.log(JSON.stringify(systemsDict));
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
        changeSave( system, game, saves[0] );
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
    else if( !fs.existsSync(generateRomLocation( system, game, systemsDict[system].games[game].rom )) ) {
        return ERROR_MESSAGES.noRomFile;
    }

    // Restart unless restart is false, we have a current emulator, and we are playing the game we selected
    if( !isBeingPlayed(system, game) || restart || !currentEmulator ) {
        quitGame();

        let command = systemsDict[system].command;

        let arguments = [ 
            generateRomLocation( system, game, systemsDict[system].games[game].rom ),
            systemsDict[system].saveDirFlag
        ];

        let saveDir = generateSaveDir( system, game, CURRENT_SAVE_DIR );
        // for space seperated arguments, add to arguments
        if( systemsDict[system].saveDirArgType == SPACE ) {
            arguments.push(saveDir);
        }
        // otherwise edit the argument
        else {
            arguments[arguments.length-1] += systemsDict[system].saveDirArgType + saveDir;
        }

        if( systemsDict[system].screenshotsDirFlag ) {
            arguments.push( systemsDict[system].screenshotsDirFlag );
            let screenshotsDir = generateScreenshotsDir( system, game, CURRENT_SAVE_DIR );
            // for space seperated arguments, add to arguments
            if( systemsDict[system].screenshotsDirArgType == SPACE ) {
                arguments.push(screenshotsDir);
            }
            // otherwise edit the argument
            else {
                arguments[arguments.length-1] += systemsDict[system].screenshotsDirArgType + screenshotsDir;
            }
        }
        if( systemsDict[system].extraFlags ) {
            arguments = arguments.concat( systemsDict[system].extraFlags );
        }

        if( systemsDict[system].argsFirst ) {
            arguments.push(arguments[0]);
            arguments.shift();
        }

        currentEmulator = proc.spawn( command, arguments, {detached: true} );
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
                ks.sendKey("f11");
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
    return false;
}

/**
 * Quit the game currently being played.
 * @returns {*} an error message if there was an error or false if there was not
 */
function quitGame() {
    if(currentEmulator) {
        currentEmulator.removeListener('exit', blankCurrentGame);
        proc.execSync( KILL_COMMAND + currentEmulator.pid );
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
    }

    // make sure the game currently isn't being played
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
 * @param {string} system - the system to add the game on.
 * @param {string} game - the game name to add.
 * @param {object} file - and object with two keys: name and base64file each containing what you might expect
 */
function addGame( system, game, file ) {

    // Error check
    // Make sure the game is valid
    if( !systemsDict[system] ) return ERROR_MESSAGES.noSystem;
    if( systemsDict[system].games[game] ) return ERROR_MESSAGES.gameAlreadyExists;
    if( !game ) return ERROR_MESSAGES.gameNameRequired;
    if( !file || !file.name || !file.base64File ) return ERROR_MESSAGES.romFileRequired;

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

    return false;
}

/**
 * Save an uploaded file.
 * @param {object} file - and object with two keys: name and base64file each containing what you might expect
 * @param {string} system - the system the game is on
 * @param {string} game - the game the ROM is for
 * @returns {*} - an error message if there was an error, false if there was not.
 */
function saveUploadedRom( file, system, game ) {
    if( !file.name || !file.base64File ) {
        return ERROR_MESSAGES.noFileInUpload;
    }
    if( !fs.existsSync(generateGameDir(system, game)) ) {
        return ERROR_MESSAGES.locationDoesNotExist;
    }
    let content = Buffer.from(file.base64File, 'base64');
    fs.writeFileSync(generateRomLocation(system, game, file.name), content);
    fs.writeFileSync(generateGameMetaDataLocation(system, game), JSON.stringify({"rom": file.name}));
    return false;
}

/**
 * Update a game.
 * @param {string} oldSystem - the old system for the game - needed so we know what we're updating
 * @param {string} oldGame - the old name for the game - needed so we know what we're updating
 * @param {string} system - the new system for the game - null if the same
 * @param {string} game - the new name for the game - null if the same
 * @param {object} file - the new file object with two keys: name and base64file each containing what you might expect for the new rom file - null if the same
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

    // Update the rom file if necessary 
    if( file ) {
        // Get the current game file and its name. We will move it for now,
        // but we will ultimately either move it back or get rid of it.
        // upload into the old directory and that will change if necessary next
        let oldRomPath = systemsDict[oldSystem].games[oldGame].rom ? generateRomLocation( oldSystem, oldGame, systemsDict[oldSystem].games[oldGame].rom ) : "";
        if( oldRomPath ) {
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
        changeSave( system ? system : oldSystem, game ? game : oldGame, systemsDict[oldSystem].games[oldGame].currentSave, true );
    }
    
    // Update the data (this will take care of making all the necessary directories for the game as well as updating the data)
    getData();

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

    rimraf.sync( generateGameDir( system, game ) );
    getData();
    return false;
}

// Listen for the "home" button to be pressed
ioHook.on("keydown", event => {
    if( event.keycode == ESCAPE_KEY ) {
        proc.execSync(FOCUS_CHROMIUM_COMMAND);
    }
});
ioHook.start();
