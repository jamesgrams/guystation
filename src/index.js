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

const PORT = 8081;
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

let currentSystem = null;
let currentGame = null;
let currentEmulator = null;

let systemsDict = {};

// Load the data on startup
getData();

//Launch Puppeteer
let browser = await puppeteer.launch({
    headless: false,
    args: ['--disable-infobars','--start-fullscreen']
});

/**************** Express ****************/

const app = express();
app.use( ASSETS_DIR, express.static(ASSETS_DIR) );
app.use( SYSTEMS_DIR, express.static(SYSTEMS_DIR) );
app.use( express.json() );

// Get Data
app.get("/data", async function(request, response) {
    writeResponse( response, SUCCESS, systemsDict );
});

// Launch a game
app.post("/launch", async function(request, response) {
    let errorMessage = isInvalidGame( request.body.system, request.body.game ) ;
    if( errorMessage ) {
        writeResponse( response, FAILURE, { "message": errorMessage }, HTTP_SEMANTIC_ERROR );
    }
    else {
        launchGame( request.body.system, request.body.game );
        getData(); // Reload data
        writeResponse( response, SUCCESS, systemsDict ); // Respond with the updated data
    }
});

// Quit a game
app.post("/quit", async function(request, response) {
    quitGame();
    // TODO refocus Puppeteer
    getData(); // Reload data
    writeResponse( response, SUCCESS, systemsDict ); // Respond with the updated data
});

// Listen for requests
app.listen(PORT);

/**
 * Determine if a game is not available.
 * @param {string} system - the system the game is on
 * @param {string} game - the game to play
 * @returns false if the game is available, or an error message if it is not
 */
function isInvalidGame( system, game ) {
    if( !system || !systemsDict[system] ) {
        return "system does not exist.";
    }
    else if( !game || !systemsDict[system].games[game] ) {
        return "game does not exist.";
    }
    return false;
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
    
    let responseObject = Object.assign( {status:status}, object );
    response.end(JSON.stringify(responseObject));
}

/**************** Functions ****************/

// TODO express
// TODO frontend && Puppeteer
// TODO: Setup script to open on startup
// TODO add/delete/update a game functions - this will be good for boradcasting the ip, so you can control the interface
// with you phone in addition to the puppeteer browser
// TODO don't listen until browser is ready

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
            // Try to figure out the ROM file
            for( let gameDirContent of gameDirContents ) {
                if( gameDirContent != "saves" && !gameDirContent.match(/^\./) ) {
                    gameData.rom = gameDirContent;
                    break;
                }
            }

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
                newSave( system, game, DEFAULT_SAVE_DIR ); // create a default save directory
                changeSave( system, game, DEFAULT_SAVE_DIR );
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

            gameData.saves = savesDict;
            gameData.currentSave = getCurrentSave(system, game);
            // if the current save isn't working -- i.e. the symlink is messed up, get another one.
            // we know there will be at least one, since if there were 0 we already created one
            if( !gameData.currentSave ) {
                changeSave( system, game, saves[0] );
                gameData.currentSave = getCurrentSave(system, game);
            }

            // If this game is being played, indicate as such
            if( isBeingPlayed( system, game ) ) {
                gamesDict[game].playing = true;
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
 */
function launchGame(system, game, restart=false) {
    // Restart unless restart is false, we have a current emulator, and we are playing the game we selected
    if( isBeingPlayed(system, game) || restart || !currentEmulator ) {
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

        currentEmulator = proc.spawn( command, arguments, {detached: true} );
        currentEmulator.on('exit', code => {
            currentGame = null;
            currentSystem = null;
            currentEmulator = null;
        });

        currentGame = game;
        currentSystem = system;

        if( systemsDict[system].activateCommand ) {
            proc.execSync( systemsDict[system].activateCommand )
        }
    }
}

/**
 * Quit the game currently being played.
 */
function quitGame() {
    if(currentEmulator) {
        currentEmulator.kill("SIGINT");
    }
}

/**
 * Check if a game is currently being played.
 * @param {string} system - the system of the game to see if it's being played
 * @param {string} game - the game to check if it's being played
 * @returns true if the game is being played; false if it is not
 */
function isBeingPlayed(system, game) {
    return ((currentSystem != system || currentGame != game) && currentEmulator);
}

/**
 * Get the current save for a game
 * @param {string} system - the system the game is for
 * @param {string} game - the game to get the current save for
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
 * @returns {boolean} - whether the save was created successfully or not
 */
function newSave(system, game, save) {
    // This name is reserved
    if( save == CURRENT_SAVE_DIR ) {
        return false;
    }
    // Create a new save directory
    fs.mkdirSync( generateSaveDir( system, game, save ) );
    // Create the screenshots directory for the save
    // Since we don't want spoilers for other saves, keep screenshots save specific
    fs.mkdirSync( generateScreenshotsDir( system, game, save ) );

    return true;
}

// Switch the current save by changing symlink
/**
 * Switch the current save.
 * @param {string} system - the system the game is on
 * @param {string} game - the game to change saves for
 * @param {string} save - the name of the save
 * @returns {boolean} - whether the save was switched to or not
 */
function changeSave(system, game, save) {
    // make sure the game currently isn't being played
    if( !isBeingPlayed( system, game ) ) {

        let currentSaveDir = generateSaveDir( system, game, CURRENT_SAVE_DIR );
        // Remove the current symlink
        try {
            fs.unlinkSync( currentSaveDir );
        }
        catch(err) {} // OK, just means there was no current symlink

        // Symlink the 
        fs.symlinkSync( generateSaveDir( system, game, save ), currentSaveDir, 'dir');

        return true;
    }
    return false;
}

// Delete a save
function deleteSave(system, game, save) {

    let currentSaveDir = generateSaveDir( system, game, CURRENT_SAVE_DIR );
    let saveDir = generateSaveDir( system, game, save );

    // make sure the game currently isn't being played
    if( !isBeingPlayed( system, game ) ) {
        // Delete the save
        fs.unlinkSync( saveDir );
        
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
                    newSave( system, game, DEFAULT_SAVE_DIR );
                    changeSave( system, game, DEFAULT_SAVE_DIR );
                }
            }

        }
        return true;
        
    }
    return false;
}

// Listen for the "home" button to be pressed