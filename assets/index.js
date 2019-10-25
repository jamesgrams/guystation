var SPACING = 400;
var EXPAND_COUNT = 10; // Number to expand on each side of the selected element - Note: We may actually expand more than this. We need to have a number of items divisble by the number of systems for the loop to work properly.
var ROM_READ_ERROR = "An error ocurred readline the ROM file.";
var BUBBLE_SCREENSHOTS_INTERVAL = 10000;
var QUIT_TIME = 2500; // Time to hold escape to quit a game
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

var expandCountLeft; // We always need to have a complete list of systems, repeated however many times we want, so the loop works properly
var expandCountRight;
var systemsDict;
var ip;
var disableMenuControls;
var enableModalControls;
var makingRequest = false;
var bubbleScreenshotsSet;
var focusInterval = null;
var closeModalCallback;
var sendInputTimeout;
var currentAddress;
var browserAddressHeartbeat;
var tabsHeartbeat;
var navigating = false;
var sendString = "";
var activePageId = null;
var nonGameSystems = ["browser"];
var nonSaveSystems = ["browser", "media"];
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

// Hold escape for 5 seconds to quit
// Note this variable contains a function interval, not a boolean value
var escapeDown = null; 

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
var buttonsUp = {
    "gamepad": {},
    "keyboard": {
        "13": true, // Enter
        "8": true // Backspace
    }
};
buttonsUp.gamepad[joyMapping["A"]] = true;
buttonsUp.gamepad[joyMapping["Start"]] = true;
buttonsUp.gamepad[joyMapping["Select"]] = true;
buttonsUp.gamepad[joyMapping["Right Trigger"]] = true;
buttonsUp.gamepad[joyMapping["Left Trigger"]] = true;

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
 * Display a preview of the game
 */
function displayGamePreview() {
    var currentPreview = document.querySelector(".game-preview:not(.game-preview-dying)");
    if( currentPreview ) {
        clearTimeout( showPreviewTimeout );
        currentPreview.classList.remove("game-preview-shown");
        currentPreview.classList.add("game-preview-dying");
        setTimeout( function() {
            currentPreview.parentElement.removeChild(currentPreview)
        }, PREVIEW_ANIMATION_TIME ); // make sure this matches the css
    }

    var currentSystemElement = document.querySelector(".system.selected");
    var currentGameElement = currentSystemElement.querySelector(".game.selected");
    if( currentGameElement ) {
        var currentSystem = currentSystemElement.getAttribute("data-system");
        var currentGame = decodeURIComponent( currentGameElement.getAttribute("data-game") );
        var currentParents = parentsStringToArray( currentGameElement.getAttribute("data-parents") );
        var gameDictEntry = getGamesInFolder( currentParents, currentSystem )[currentGame];
        if( gameDictEntry.cover && gameDictEntry.name ) {
            var previewElement = document.createElement("div");
            previewElement.classList.add("game-preview");
            previewElement.onclick = function() { 
                if( this.classList.contains("game-preview-clicked") ) {
                    this.classList.remove("game-preview-clicked");
                }
                else {
                    this.classList.add("game-preview-clicked"); 
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

            if( gameDictEntry.summary ) {
                var previewSummary = document.createElement("div");
                previewSummary.classList.add("game-preview-summary");
                previewSummary.innerText = gameDictEntry.summary;
                let imageWidth = 200; //make sure this matches the css
                let imageHeight = gameDictEntry.cover.height/gameDictEntry.cover.width * imageWidth;
                previewSummary.style.maxHeight = imageHeight - previewTitle.offsetHeight - (previewReleaseDate ? previewReleaseDate.offsetHeight : 0);
                previewInfo.appendChild(previewSummary);
            }

            // set timeout to force draw prior
            showPreviewTimeout = setTimeout( function() { 
                previewElement.classList.add("game-preview-shown");
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
 * Set the marquee for the selected element
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
 * Remove all marquees
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
 * @param {HTMLElement} element - the element to add marquee too
 * @param {HTMLElement} gameElement - the game element containing the element
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
    var totalAnimationTime = totalDistance / pixelsPerSecond; // todo get this value somehow
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
        element.classList.add("game-marquee");
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

    startRequest();
    makeRequest( "GET", "/data", {}, function(responseText) {
        var response = JSON.parse(responseText);
        systemsDict = response.systems;

        var startSystem = {};
        if( window.localStorage.guystationStartSystem ) {
            startSystem = JSON.parse(window.localStorage.guystationStartSystem);
        }
        if( window.localStorage.guystationJoyMapping ) {
            joyMapping = JSON.parse(window.localStorage.guystationJoyMapping);
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
            if( !makingRequest ) {
                makeRequest( "GET", "/data", {}, function(responseText) {
                    var response = JSON.parse(responseText);
                    var newSystemsDict = response.systems;
                    if( JSON.stringify(newSystemsDict) != JSON.stringify(systemsDict) ) {
                        createToast( "Changes detected" );
                        systemsDict = newSystemsDict;
                        redraw();
                    }
                } );
            }
        }, REDRAW_INTERVAL );

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
 * Close the menu by clicking Cocoa
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
            }
        }
        else if( enableModalControls ) {
            switch (event.keyCode) {
                // Enter
                case 13:
                    if( document.querySelector(".modal #address-bar") && document.querySelector(".modal #address-bar") === document.activeElement && !navigating ) {
                        document.querySelector(".modal #go-button").click();
                    }
                    break;
                // Backspace
                case 8:
                    if( buttonsUp.keyboard["8"] && document.querySelector( "#browser-controls-form" ) && (document.activeElement === document.body) ) {
                        makeRequest( "POST", "/browser/button", { button: "Backspace" } );
                    }
                    buttonsUp.keyboard["8"] = false;
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
                break;
            // Backspace
            case 8:
                buttonsUp.keyboard["8"] = true;
                break;
            // Escape
            case 27:
                clearTimeout(escapeDown);
                escapeDown = null;
                break;
        }
    }
    // keypress for forwarding input
    // Forward input for the browser
    document.onkeypress = function(event) {
        if( document.querySelector( "#browser-controls-form" ) && (document.activeElement === document.body || document.activeElement === document.querySelector("#forward-input") ) ) {
            var keyLetter = String.fromCharCode(event.which);
            // the user has pressed a key
            if( keyLetter ) {
                sendString += keyLetter;

                if( sendInputTimeout ) {
                    clearTimeout(sendInputTimeout);
                }
                sendInputTimeout = setTimeout( function() {
                    makeRequest( "POST", "/browser/input", { input: sendString } );
                    sendString = "";
                    document.querySelector("#forward-input").value = "";
                }, SEND_INPUT_TIME);
                document.querySelector("#forward-input").value = sendString;
            }
            
            event.preventDefault();
        }
    }
}

/**
 * Go to the game currently being played
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
 * @param {object} startSystem - an object with a system key for the system to start on and an array of objects with system keys and games for games to start on.
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
            gamesElement.style.top = newOffset + "px";
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
    var clickToMove = function() {
        var myOffset = this.parentElement.style.left;
        if( myOffset )
            myOffset = parseInt(myOffset.match(/(-?\s?\d+)px/)[1].replace(/\s/,""));
        else
            myOffset = 0;
        var mySpaces = myOffset/SPACING;
        moveMenu(-mySpaces);
    };
    var clickToMoveSubmenu = function(element) {
        // Add the onclick element
        var parentGamesList = element.closest(".games");
        if( parentGamesList.parentElement.classList.contains("selected") && !element.classList.contains("above") ) {
            var parentGamesArray = Array.prototype.slice.call( parentGamesList.querySelectorAll(".game") );
            var currentGame = parentGamesList.querySelector(".game.selected");
            var currentPosition = parentGamesArray.indexOf( currentGame );
            var myPosition = parentGamesArray.indexOf( element );
            moveSubMenu( myPosition - currentPosition );
            return myPosition - currentPosition; 
        }
        return -1;
    }

    systemsElementNew.appendChild( systemElements[startIndex] );
    systemsElementNew.querySelector("img").onclick = clickToMove;

    for( var i=1; i<expandCountRight+1; i++ ) {
        var nextIndex = getIndex( startIndex, systemElements, i );
        var nextElement = systemElements[nextIndex].cloneNode(true);
        nextElement.style.left = "calc( 50% + " + (i*SPACING) + "px )";
        nextElement.querySelector("img").onclick = clickToMove;
        systemsElementNew.appendChild(nextElement);
    }
    for( var i=1; i<expandCountLeft+1; i++ ) {
        var prevIndex = getIndex( startIndex, systemElements, -1*i );
        var prevElement = systemElements[prevIndex].cloneNode(true);
        prevElement.style.left = "calc( 50% + -" + (i*SPACING) + "px )";
        prevElement.querySelector("img").onclick = clickToMove;
        systemsElementNew.appendChild(prevElement);
    }

    // onclick move submenu, if we don't move anywhere, then launch the game
    systemsElementNew.querySelectorAll(".games .game").forEach( function(element) { element.onclick = function() {
        var spacesMoved = clickToMoveSubmenu(element); if(!spacesMoved) document.querySelector("#launch-game").click(); }
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
 * Populate the games portion of the menu
 * @param {string} system - the system the games are for
 * @param {Object} games - the object of games as returned from the server
 * @param {object} startSystem - an object with a system key for the system to start on and an array of objects with system keys and games for games to start on.
 * @param {HTMLElement} gamesElement - the element to append the games to
 * @param {boolean} hidden - true if the element should be hidden
 * @param {Array} parents - an array of parent folders for the game
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
 * Determine if two terms match for searching
 * @param {string} searchTerm - the first term
 * @param {string} matchTerm - the second term
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
 * Save the current menu position
 */
function saveMenuPosition() {
    window.localStorage.guystationStartSystem = JSON.stringify(generateStartSystem());
}

/**
 * Toggle what buttons are available to click.
 */
function toggleButtons() {

    var selectedSystem = document.querySelector(".system.selected");
    var selectedGame = selectedSystem.querySelector(".game.selected");
    var launchGameButton = document.getElementById("launch-game");
    // Only allow a game to be launched if one is selected
    if( !selectedGame ) {
        launchGameButton.classList.add("inactive");
        launchGameButton.onclick = null;
    }
    else {
        launchGameButton.classList.remove("inactive");
        launchGameButton.onclick = function(e) { 
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
    if( !document.querySelector(".game.playing") ) {
        quitGameButton.classList.add("inactive");
        quitGameButton.onclick = null;
        goHomeButton.classList.add("inactive");
        goHomeButton.onclick = null;
    }
    else {
        quitGameButton.classList.remove("inactive");
        quitGameButton.onclick = quitGame;
        goHomeButton.classList.remove("inactive");
        goHomeButton.onclick = goHome;
    }

    // Only allow browser if we are "playing" it
    var browserControlsButton = document.getElementById("browser-controls");
    if( !systemsDict["browser"].games[ Object.keys(systemsDict["browser"].games)[0] ].playing ) {
        browserControlsButton.onclick = null;
        browserControlsButton.classList.add("inactive");
    }
    else {
        browserControlsButton.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#browser-controls-form") ) displayBrowserControls(); };
        browserControlsButton.classList.remove("inactive");
    }

    // Only allow media if we are "on" a playable file
    var remoteMediaButton = document.getElementById("remote-media");
    if( selectedSystem.getAttribute("data-system") == "media" && selectedGame && !selectedGame.hasAttribute("data-is-folder") && !selectedGame.hasAttribute("data-is-playlist") ) {
        remoteMediaButton.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#remote-media-form") ) displayRemoteMedia(); };
        remoteMediaButton.classList.remove("inactive");
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
                displayRemoteMedia( selectedSystem.getAttribute("data-system"), playlistEntry.games[ Object.keys(playlistEntry.games)[0] ].game, parents ); 
            }
        };
        remoteMediaButton.classList.remove("inactive");
    }
    else if( nonSaveSystems.indexOf(selectedSystem.getAttribute("data-system")) == -1 && selectedGame 
        && getAllScreenshots(selectedSystem.getAttribute("data-system"), decodeURIComponent(selectedGame.getAttribute("data-game")), parentsStringToArray(selectedGame.getAttribute("data-parents")) ).length > 0 ) {
        remoteMediaButton.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#remote-media-form-screenshots") ) displayRemoteMediaScreenshots(); };
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
    var anyGame = document.querySelector(".game");
    var anyGameNotFolder = document.querySelector(".game:not([data-is-folder])");
    var updateGameButton = document.getElementById("update-game");
    var deleteGameButton = document.getElementById("delete-game");
    var addSaveButton = document.getElementById("add-save");
    var updateSaveButton = document.getElementById("update-save");
    var deleteSaveButton = document.getElementById("delete-save");
    var joypadConfigButton = document.getElementById("joypad-config");
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
    if(!anyGameNotFolder) {
        addSaveButton.onclick = null;
        addSaveButton.classList.add("inactive");
        updateSaveButton.onclick = null;
        updateSaveButton.classList.add("inactive");
        deleteSaveButton.onclick = null;
        deleteSaveButton.classList.add("inactive");
    }
    else {
        addSaveButton.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#add-save-form") ) displayAddSave(); };
        addSaveButton.classList.remove("inactive");
        updateSaveButton.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#change-save-form") ) displaySelectSave(); };
        updateSaveButton.classList.remove("inactive");
        deleteSaveButton.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#delete-save-form") ) displayDeleteSave(); };
        deleteSaveButton.classList.remove("inactive");
    }
    
    // Always allow add game
    document.getElementById("add-game").onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#add-game-form") ) displayAddGame(); };
 
    // Always allow joypad config
    joypadConfigButton.onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#joypad-config-form") ) displayJoypadConfig(); };

    // Always allow power controls
    document.getElementById("power-options").onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#power-options-form") ) displayPowerOptions(); }
}

/**
 * Determine if a game is being played
 * @param {string} system - the system to check
 * @param {string} game - the game to check
 * @param {Array} parents - the parents of the game
 * @returns {boolean} - whether the game is being played or not
 */
function isBeingPlayed( system, game, parents ) {
    var gameInFolder = getGamesInFolder(parents, system)[game];
    if( systemsDict[system] && gameInFolder && gameInFolder.playing ) return true;
    return false;
}

/**
 * Do a redraw maintaining the current position.
 * @param {string} oldSystemName - the old name of the system if it changed
 * @param {string} newSystemName - the new name of the system if it changed (null if it was deleted)
 * @param {string} oldGameName - the old name of the game if it changed
 * @param {string} newGameName - the new name of the game if it changed (null if it was deleted)
 * @param {Array} oldParents - the old parents if it changed
 * @param {Array} newParents - the new parents if it changed
 * @param {boolean} keepCurrentSearch - keep the current search (only in place on a search to not blank out search, other than that we don't want redraw to keep a search)
 */
function redraw( oldSystemName, newSystemName, oldGameName, newGameName, oldParents, newParents, keepCurrentSearch ) {
    if( !keepCurrentSearch ) {
        clearSearch();
    }
    draw( generateStartSystem( oldSystemName, newSystemName, oldGameName, newGameName, oldParents, newParents ) );
}

/**
 * Get all the open folders.
 * @param {Object} games - a games object (e.g. systems[system].games)
 * @param {Array} arr - an array that will be populated by the function
 * @param {Array} parents - the parents of the current games object
 * @param {string} system - the system the folders are for
 * @param {string} oldSystemName - the old name of the system if it changed
 * @param {string} newSystemName - the new name of the system if it changed (null if it was deleted)
 * @param {string} oldGameName - the old name of the game if it changed
 * @param {string} newGameName - the new name of the game if it changed (null if it was deleted)
 * @param {Array} oldParents - the old parents if it changed
 * @param {Array} newParents - the new parents if it changed
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
 * @param {string} oldSystemName - the old name of the system if it changed
 * @param {string} newSystemName - the new name of the system if it changed (null if it was deleted)
 * @param {string} oldGameName - the old name of the game if it changed
 * @param {string} newGameName - the new name of the game if it changed (null if it was deleted)
 * @param {Array} oldParents - the old parents if it changed
 * @param {Array} newParents - the new parents if it changed
 * @returns {object} - an object that can be passed to the draw function to start - include the parents string and game
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
        var useNewParents = true;
        if( selectedGameElement ) {
            selectedGame = decodeURIComponent(selectedGameElement.getAttribute("data-game"));
            // newGameName being null means the game was deleted, we have to try to get a close by index
            // also if we are changing systems we want to do a delete
            // TODO should we look first in the same folder rather than siblings?
            // TODO deleting an item might also delete a playlist(s) if it was the last item in the list(s) which might result in the previous/next sibling being removed. In this case, we restart at the top but should we?
            if( systems[i].getAttribute("data-system") == oldSystemName && selectedGame == oldGameName && (newGameName === null || oldSystemName != newSystemName) ) {
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
                useNewParents = false; // when the system is changed, we aren't selected on the element anymore, so we don't want to use new parents
                // new parents are null on delete
            }
            // If the game name is updated, we'll have to change it
            else if( systems[i].getAttribute("data-system") == oldSystemName && selectedGame == oldGameName ) {
                selectedGame = newGameName;
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
 * Get the index of an array given a starting position and offset if treating the array like a circle
 * @param {number} index - the starting index
 * @param {Array} arr - the array to find the index of
 * @param {number} offset - the offset amount
 * @returns {number} the index
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
 * Move the menu a given number of spaces
 * @param {number} spaces - the number of spaces to move the menu
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
        var offset = systems[i].style.left;
        if( offset ) {
            offset = parseInt(offset.match(/(-?\s?\d+)px/)[1].replace(/\s/,""));
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
        systems[i].style.left = "calc( 50% + " + (offset) + "px )";
    }
    toggleButtons();
    saveMenuPosition();
    setMarquee();
    displayGamePreview();
}

/**
 * Move the sub menu a given spaces
 * @param {number} spaces - the number of spaces to move the submenu
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

        var currentOffset = subMenu.style.top;

        // Get the current offset of the sub menu
        if( currentOffset ) {
            currentOffset = currentOffset.match(/-?\d+/)[0];
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
        subMenu.style.top = newOffset + "px";
    }
    toggleButtons();
    saveMenuPosition();
    setMarquee();
    displayGamePreview();
}

/**
 * Get the selected values to display in menus.
 * so first it will look at the selected item, then it will look for items in the same folder, then it will look for any item, then any system
 * of course changeSystem will not look at any selected system, since we are assured the one we are on is valid before switching
 * of course changeFolders will not look at system nor any item, since we are assured there is one in the same folder before switching
 * @param {boolean} systemSaveAllowedOnly - true if we should only consider systems that allow for saves - the current save will not be returned without it.
 * @param {boolean} noFolders - true if we should exclude all folders from consideration - the current save will not be returned without it.
 * @returns {Object} an object with selected values
 */
function getSelectedValues(systemSaveAllowedOnly, noFolders) {
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
    if( currentGameElement && !excludeArray.includes(currentSystem) && (!noFolders || !currentGameElement.hasAttribute("data-is-folder")) ) {
        // We have a currently selected game we can use
        currentGame = decodeURIComponent(currentGameElement.getAttribute("data-game"));
        currentParents = parentsStringToArray(gameElementParentsString);
        if( systemSaveAllowedOnly && noFolders ) {
            currentSave = currentGameElement.querySelector(".current-save").innerText;
        }
        highlighted = true; // The system is selected to the user
    }
    // We have an item, but its a folder, and we aren't allowing folders
    // Try to find another item in the same system that is not a folder
    // note how we know know we don't want a folder
    else if( currentGameElement && !excludeArray.includes(currentSystem) && document.querySelector('.system.selected .game[data-parents="'+gameElementParentsString+'"]:not([data-is-folder])') ) {
        currentGameElement = document.querySelector('.system.selected .game[data-parents="'+gameElementParentsString+'"]:not([data-is-folder])');
        currentGame = decodeURIComponent(currentGameElement.getAttribute("data-game"));
        currentParents = parentsStringToArray(currentGameElement.getAttribute("data-parents"));
        if( systemSaveAllowedOnly && noFolders ) {
            currentSave = currentGameElement.querySelector(".current-save").innerText;
        }
    }
    // We've failed at finding an item in the same folder, so try to find any item that is not a folder in the system
    // TODO - should we try to find highest level first in this and in createSystemMenu?
    else if( currentGameElement && !excludeArray.includes(currentSystem) && document.querySelector(".system.selected .game:not([data-is-folder])") ) {
        currentGameElement = document.querySelector(".system.selected .game:not([data-is-folder])");
        currentGame = decodeURIComponent(currentGameElement.getAttribute("data-game"));
        currentParents = parentsStringToArray(currentGameElement.getAttribute("data-parents"));
        if( systemSaveAllowedOnly && noFolders ) {
            currentSave = currentGameElement.querySelector(".current-save").innerText;
        }
    }
    else {
        // We'll have to use a different system
        var nots = excludeArray.map( el => { return ":not([data-system='" + el + "'])"} ).join("");
        var selector = ".system" + nots + " .game.selected";
        if( noFolders ) {
            selector += ":not([data-is-folder])";
        }
        var anySelectedGameElement = document.querySelector(selector);
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
 * Display remote media for a game - an album of screenshots
 * This should not be shown if there are no screenshots
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
 * @param {string} system - the system to look at instead of the selected system (optional)
 * @param {string} game - the game to look at instead of the selected game (optional)
 * @param {Array} parents - the parents to look at instead of the selected parents (optional)
 * @param {boolean} serverLaunched - true if the modal was launched by the server (will call quitGame when modal closed)
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
    if( isPlaylistMedia ) {
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

    var parentGameDictEntryGamesKeys = Object.keys(removePlaylists(filterGameTypes(getGamesInFolder(selected.parents, selected.system, true), false)));
    var elementIndex = parentGameDictEntryGamesKeys.indexOf( selected.game );
    form.appendChild(createPositionIndicator( elementIndex+1, parentGameDictEntryGamesKeys.length ));
    
    launchModal( form, function() { if(serverLaunched) { quitGame(); } }, serverLaunched ? true : false );
}

/**
 * Go to the previous media with the option to restart the current
 * media if time is past 5 seconds
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
 * Play the next piece of media in a folder
 * @param {Number} offset - the offset of media to play 
 */
function playNextMedia(offset) {
    if( !offset ) offset = 1;
    var video = document.querySelector(".modal #remote-media-form video");
    if( video ) {
        var system = video.getAttribute("data-system");
        var game = decodeURIComponent(video.getAttribute("data-game"));
        var parents = parentsStringToArray(video.getAttribute("data-parents"));
        var parentGameDictEntryGamesKeys = Object.keys(removePlaylists(filterGameTypes(getGamesInFolder(parents, system, true), false)));
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
 * Minimize the remote media (for server calls only)
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
 * Maximize the remote media (for server calls only)
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
 * Remove the remote media placeholder if it exists. (for server calls only)
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
 * Determine if remote media is being played (for server calls only)
 * @param {string} system - the system to determine if being played 
 * @param {string} game - the game to determine if being played
 * @param {Array} parents - the parents of the game being determined if it is being played
 */
function isRemoteMediaPlaying( system, game, parents ) {
    return document.querySelector('#remote-media-form[data-is-server-launched] video[data-system="'+system+'"][data-game="'+encodeURIComponent(game)+'"][data-parents="'+parentsArrayToString(parents)+'"]') ? true : false;
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

    launchModal( form, function() { stopConnectionToPeer(false); clearInterval(browserAddressHeartbeat); clearInterval(tabsHeartbeat); } );
    
    //video
    var video = document.createElement("video");
    video.setAttribute("autoplay", "true");
    video.onclick = function(e) {
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
        if( xPercent > 0 && yPercent > 0 && xPercent < 1 && yPercent < 1 ) {
            makeRequest( "POST", "/browser/click", {"xPercent": xPercent, "yPercent": yPercent} );
        }
    };
    makeRequest( "GET", "/screencast/connect", [], function() {
        // start letting the server know we exist after it is now looking for us i.e. won't accept another connection
        // (serverSocketId is set)
        resetCancelStreamingInterval = setInterval( function() {
            makeRequest( "GET", "/screencast/reset-cancel", [] );
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
    for( var i=0; i<joyButtons.length; i++ ) {
        var label = createInput( joyMapping[joyButtons[i]], "input-" + i, joyButtons[i] + ": ", "number", true );
        label.setAttribute("data-button", joyButtons[i]);
        form.appendChild( label );
    }
    form.appendChild( createButton( "Save", function() {
        var inputs = document.querySelectorAll("#joypad-config-form input");
        for(var i=0; i<inputs.length; i++) {
            var button = inputs[i].parentElement.getAttribute("data-button");
            joyMapping[button] = inputs[i].value;
        }
        window.localStorage.guystationJoyMapping = JSON.stringify(joyMapping);
        closeModal();
    } ) );
    launchModal( form );
}

/**
 * Display the screencast.
 */
function displayScreencast() {
    if( isServer ) {
        return;
    }
    var form = document.createElement("div");
    form.appendChild( createFormTitle("Screencast") );
    var video = document.createElement("video");
    video.setAttribute("autoplay", "true");
    video.setAttribute("controls", "true");
    form.setAttribute("id", "remote-screencast-form");
    form.appendChild(video);
    makeRequest( "GET", "/screencast/connect", [], function() {
        // start letting the server know we exist after it is now looking for us i.e. won't accept another connection
        // (serverSocketId is set)
        resetCancelStreamingInterval = setInterval( function() {
            makeRequest( "GET", "/screencast/reset-cancel", [] );
        }, RESET_CANCEL_STREAMING_INTERVAL );
        launchModal( form, function() { stopConnectionToPeer(false); } );
        connectToSignalServer(false);
    }, function(responseText) { standardFailure(responseText, true) } );
}

/**
 * Display power options.
 */
function displayPowerOptions() {
    var form = document.createElement("div");
    form.appendChild( createFormTitle("Power Options") );
    form.setAttribute("id", "power-options-form");
    var updateButton = createButton("Update GuyStation", function() {
        if( !makingRequest && !this.classList.contains("inactive") ) {
            displayConfirm( "Are you sure you want to update GuyStation?", function() { 
                startRequest(); 
                makeRequest( "GET", "/system/update", [], function() {
                    createToast("Please restart GuyStation to apply updates");
                    endRequest();
                    closeModal();
                }, function() {
                    createToast("An error occurred while trying to update");
                    endRequest();
                } );
            }, closeModal);
        }
    });
    updateButton.classList.add("inactive");
    form.appendChild(updateButton);
    // See if there are updates
    makeRequest( "GET", "/system/has-updates", function(responseText) {
        var response = JSON.parse(responseText);
        if( response.hasUpdates ) {
            updateButton.classList.remove("inactive");
        }
    });
    form.appendChild( createButton("Restart GuyStation", function() {
        if( !makingRequest ) {
            displayConfirm( "Are you sure you want to restart GuyStation?", function() { 
                startRequest(); 
                makeRequest( "GET", "/system/restart", [], null, function() {
                    createToast("An error occurred while trying to restart");
                    endRequest();
                } );
            }, closeModal);
        }
    }) );
    form.appendChild( createButton("Reboot Machine"), function() {
        if( !makingRequest ) {
            displayConfirm( "Are you sure you want to reboot GuyStation?", function() { 
                startRequest(); 
                makeRequest( "GET", "/system/reboot", [], null, function() {
                    createToast("An error occurred while trying to reboot");
                    endRequest();
                } );
            }, closeModal);
        }
    } );
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
    form.appendChild( createButton( "Delete Save", function() {
        if( !makingRequest ) {
            var systemSelect = document.querySelector(".modal #delete-save-form #system-select");
            var gameSelect = document.querySelector(".modal #delete-save-form #game-select");
            var saveSelect = document.querySelector(".modal #delete-save-form #save-select");
            var system = systemSelect.options[systemSelect.selectedIndex].text;
            var game = gameSelect.options[gameSelect.selectedIndex].text;
            var save = saveSelect.options[saveSelect.selectedIndex].text;
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
    form.appendChild( createButton( "Change Save", function() {
        if( !makingRequest ) {
            startRequest();
            var systemSelect = document.querySelector(".modal #change-save-form #system-select");
            var gameSelect = document.querySelector(".modal #change-save-form #game-select");
            var saveSelect = document.querySelector(".modal #change-save-form #save-select");
            var parents = extractParentsFromFolderMenu();
            changeSave( systemSelect.options[systemSelect.selectedIndex].text, gameSelect.options[gameSelect.selectedIndex].text, saveSelect.options[saveSelect.selectedIndex].text, parents );
        }
    } ) );
    launchModal( form );
}

/**
 * Cycle to the next save.
 * @param {Number} offset - the number of positions to cycle
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
    form.appendChild( createButton( "Add Save", function() {
        if( !makingRequest ) {
            startRequest();
            var systemSelect = document.querySelector(".modal #add-save-form #system-select");
            var gameSelect = document.querySelector(".modal #add-save-form #game-select");
            var saveInput = document.querySelector(".modal #add-save-form #save-input");
            var parents = extractParentsFromFolderMenu();
            addSave( systemSelect.options[systemSelect.selectedIndex].text, gameSelect.options[gameSelect.selectedIndex].text, saveInput.value, parents );
        }
    }, [saveInput.firstElementChild.nextElementSibling] ) );
    launchModal( form );
}

/**
 * Display the menu to delete a game.
 */
function displayDeleteGame() {
    var form = document.createElement("div");
    var selected = getSelectedValues();
    form.setAttribute("id", "delete-game-form");
    form.appendChild( createFormTitle("Delete Game") );
    form.appendChild( createSystemMenu( selected.system, false, true, true, false, false, true ) );
    form.appendChild( createFolderMenu( selected.parents, selected.system, false, false, true, false, null, true) );
    form.appendChild( createGameMenu(selected.game, selected.system, false, true, selected.parents, false, true) );
    form.appendChild( createButton( "Delete Game", function() {
        if( !makingRequest ) {
            var systemSelect = document.querySelector(".modal #delete-game-form #system-select");
            var gameSelect = document.querySelector(".modal #delete-game-form #game-select");
            var system = systemSelect.options[systemSelect.selectedIndex].text;
            var game = gameSelect.options[gameSelect.selectedIndex].text;
            var parents = extractParentsFromFolderMenu();
            displayConfirm( "Are you sure you want to delete " + game + " for " + system + "?", function() { startRequest(); deleteGame(system, game, parents); }, closeModal )
        }
    } ) );
    launchModal( form );
}

/**
 * Display a confirm modal.
 * @param {string} message - the message to display in the confirm box
 * @param {Function} yesCallback - the function to execute if yes is selected
 * @param {Function} noCallback - the function to execute if no is selected
 */
function displayConfirm( message, yesCallback, noCallback ) {
    var form = document.createElement("div");
    form.setAttribute("id", "are-you-sure");
    form.appendChild( createFormTitle("Are You Sure?") );
    form.appendChild( createWarning(message) );
    form.appendChild( createButton( "No", noCallback ) );
    form.appendChild( createButton( "Yes", yesCallback ) );
    launchModal(form);
}

/**
 * Display the menu to update a game.
 */
function displayUpdateGame() {
    var form = document.createElement("div");
    var selected = getSelectedValues();
    form.setAttribute("id", "update-game-form");
    form.appendChild( createFormTitle("Update Game") );
    form.appendChild( createSystemMenu( selected.system, true, true, true, false, false ) );
    form.appendChild( createFolderMenu( selected.parents, selected.system, true, false, true, false) );
    form.appendChild( createGameMenu( selected.game, selected.system, true, true, selected.parents, false ) );
    form.appendChild( createWarning("If you do not wish to change a field, you may leave it blank.") );
    form.appendChild( createSystemMenu( selected.system, false, false, false, false, false ) );
    form.appendChild( createFolderMenu( selected.parents, selected.system, false, false, false, false, form) );
    var gameInput = createGameInput();
    form.appendChild( gameInput );
    var romFileInput = createRomFileInput();
    form.appendChild( romFileInput );
    form.appendChild( createPlaylistMenu( translateSymlinks(getGamesInFolder(selected.parents, selected.system)[selected.game], selected.system) ) );
    // Do this here 
    ensureRomInputAndPlaylistSelectIsDisplayedOrHidden( form, true );
    form.appendChild( createButton( "Update Game", function() {
        if( !makingRequest ) {
            startRequest();
            var oldSystemSelect = document.querySelector(".modal #update-game-form #old-system-select");
            var oldGameSelect = document.querySelector(".modal #update-game-form #old-game-select");
            var systemSelect = document.querySelector(".modal #update-game-form #system-select");
            var gameInput = document.querySelector(".modal #update-game-form #game-input");
            var romFileInput = document.querySelector(".modal #update-game-form #rom-file-input");
            var parents = extractParentsFromFolderMenu();
            var oldParents = extractParentsFromFolderMenu(true);
            var isFolder = getGamesInFolder(oldParents, oldSystemSelect.options[oldSystemSelect.selectedIndex].text)[oldGameSelect.options[oldGameSelect.selectedIndex].text].isFolder;
            var isPlaylist = getGamesInFolder(oldParents, oldSystemSelect.options[oldSystemSelect.selectedIndex].text)[oldGameSelect.options[oldGameSelect.selectedIndex].text].isPlaylist;
            var playlistItems = extractItemsfromPlaylistContainer();

            updateGame( oldSystemSelect.options[oldSystemSelect.selectedIndex].text, oldGameSelect.options[oldGameSelect.selectedIndex].text, oldParents, systemSelect.options[systemSelect.selectedIndex].text, gameInput.value, romFileInput.files[0], parents, isFolder, isPlaylist, playlistItems );
        }
    } ) );
    launchModal( form );
}

/**
 * Translate symlinked entries into what they actually refernce
 * All that is needed is the name which includes parents to dereference
 * all symlinks are on the same system as what they reference.
 * @param {HTMLElement} gameDictEntry - a playlist entry
 * @param {string} system - the system the game is on
 * @returns {Array} - an array of games that are what the playlists .games values point to
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
    var selectedSystem = selectedSystemElement.options[selectedSystemElement.selectedIndex].text;

    var selectedGameElement = document.querySelector(".system[data-system='"+selectedSystem+"'] .game.selected");
    var selectedParents = selectedGameElement ? parentsStringToArray(selectedGameElement.getAttribute("data-parents")) : [];
    form.appendChild( createFolderMenu( selectedParents, selectedSystem, false, false, false, false) );
    var gameInput = createGameInput(null, true);
    form.appendChild( gameInput );
    form.appendChild( createTypeMenu(null, getTypeOptions( selectedSystem ), true) );
    var romFileInput = createRomFileInput(true);
    form.appendChild( romFileInput );

    var playlistMenu = createPlaylistMenu();
    playlistMenu.classList.add("hidden");
    form.appendChild( playlistMenu );
    form.appendChild( createButton( "Add Game", function() {
        if( !makingRequest ) {
            startRequest();
            var systemSelect = document.querySelector(".modal #add-game-form #system-select");
            var gameInput = document.querySelector(".modal #add-game-form #game-input");
            var romFileInput = document.querySelector(".modal #add-game-form #rom-file-input");
            var typeSelect = document.querySelector(".modal #add-game-form #type-select"); 
            var parents = extractParentsFromFolderMenu();
            var playlistItems = extractItemsfromPlaylistContainer();

            addGame( systemSelect.options[systemSelect.selectedIndex].text, gameInput.value, romFileInput.files[0], parents, typeSelect.options[typeSelect.selectedIndex].text == "Folder", typeSelect.options[typeSelect.selectedIndex].text == "Playlist", playlistItems );
        }
    }, [ gameInput.firstElementChild.nextElementSibling ] ) );
    launchModal( form );
}

/**
 * Get available type options
 * @param {String} system - the system
 */
function getTypeOptions(system) {
    if( system == "media" ) return ["Game", "Folder", "Playlist"];
    return ["Game", "Folder"];
}

/**
 * Check if a folder contains real games.
 * A playlist is not considered a real game in this instance.
 * @param {object} games - a standard games object
 * @returns {boolean} - whether or not the folder contains real games
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
 * @param {string} selected - the system selected by default
 * @param {boolean} old - true if the old system for chanding (changes the id)
 * @param {boolean} required - if the field is required
 * @param {boolean} onlyWithGames - true if we should only show systems with games in the menu - this will get passed to sub menus
 * @param {boolean} onlySystemsSupportingSaves - true if we should only allow systems supporting saves
 * @param {boolean} onlyWithRealGames - true if we should only show systems with real games in the menu - this will get passed to sub menus
 * @param {boolean} onlyWithLeafNodes - true if we only want to show "leaf nodes" (only impacts the game menu) - i.e. empty folders or games - if onlyWithGames is true (which it should be when this is), then we won't ever selected a leaf node as a folder, so that's why it is only needed for the game menu
 * @returns {Element} - a select element containing the necessary keys
 */
function createSystemMenu( selected, old, required, onlyWithGames, onlySystemsSupportingSaves, onlyWithRealGames, onlyWithLeafNodes ) {
    var systemsKeys = Object.keys(systemsDict).filter( (element) => !nonGameSystems.includes(element) );
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
        var system = this.options[this.selectedIndex].text;
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
            folderSelect.parentNode.replaceWith( createFolderMenu( selectedParents, system, old, folderSelect.hasAttribute("required"), onlyWithGames, onlyWithRealGames, null, onlyWithLeafNodes ) );
        }
        if( gameSelect ) {
            var currentGameElement = document.querySelector(".system[data-system='"+system+"'] .game.selected")
            var currentGame = null;
            var selectedParents = null;
            if( currentGameElement && (!onlyWithRealGames || !currentGameElement.hasAttribute("data-is-folder")) ) {
                currentGame = decodeURIComponent(currentGameElement.getAttribute("data-game"));
            }
            // next try to look for a folder in the same level as the selected game like we do in getSelected
            else if( currentGameElement ) {
                var folderParents = currentGameElement.getAttribute("data-parents");
                currentGameElement = document.querySelector('.system[data-system="'+system+'"] .game[data-parents="'+folderParents+'"]:not([data-is-folder])');
                if( currentGameElement ) {
                    currentGame = decodeURIComponent(currentGameElement.getAttribute("data-game"));
                }
            }
            // there is no selected game element in our folder, just find any one
            // we KNOW there is at least one game in there since we filtered earlier - we wouldn't select a system with a game select that has no games/no real games
            if( !currentGame ) { // This could change the value needed for folder select
                var not = onlyWithRealGames ? ":not([data-is-folder])" : ""; // see IMPORTANT NOTE -  you should not  allow a game select with the potentiality of there being nothing to have selected by default
                currentGameElement = document.querySelector(".system[data-system='"+system+"'] .game" + not);
                currentGame = decodeURIComponent(currentGameElement.getAttribute("data-game"));
            }
            if( folderSelect ) {
                folderSelect.parentNode.replaceWith( createFolderMenu( parentsStringToArray(currentGameElement.getAttribute("data-parents")), system, old, folderSelect.hasAttribute("required"), onlyWithGames, onlyWithRealGames, null, onlyWithLeafNodes ) );
            }
            // Again, it's fine to use a folder as parents
            var selectedParents = parentsStringToArray(currentGameElement.getAttribute("data-parents"));
            gameSelect.parentNode.replaceWith( createGameMenu( currentGame, system, old, gameSelect.hasAttribute("required"), selectedParents, onlyWithRealGames, onlyWithLeafNodes ) );
            var saveSelect = modal.querySelector("#save-select");
            if( saveSelect && !old ) {
                var currentSave = null;
                if( currentGame  ) {
                    var currentSaveElement = document.querySelector(".system[data-system='"+system+"'] .game.selected .current-save");
                    if( currentSaveElement ) { // ensures not a folder
                        currentSave = currentSaveElement.innerText;
                    }
                }
                saveSelect.parentNode.replaceWith( createSaveMenu( currentSave, system, currentGame, saveSelect.hasAttribute("required"), selectedParents ) );
            }
        }
        if( typeSelect ) {
            var newTypeSelect = createTypeMenu( typeSelect.options[typeSelect.selectedIndex].text, getTypeOptions(system), typeSelect.getAttribute("required") );
            typeSelect.parentNode.replaceWith(newTypeSelect);
            newTypeSelect.querySelector("#type-select").onchange(); // ensure the proper items are shown
        }

        // when we change an old menu - be it system, game or folder, we need to make sure that the new folder menu has all options available
        // to do this, just regenerate the new folder menu
        ensureNewFolderMenuHasCorrectOptions( modal, old );
        ensureRomInputAndPlaylistSelectIsDisplayedOrHidden( modal, old );
    }, required );
}

/**
 * Convert an array of parents to a string
 * @param {Array} parents - the array of parents
 * @returns {string} the parents string
 */
function parentsArrayToString(parents) {
    return encodeURIComponent(parents.join(UUID));
}

/**
 * Convert a string of parents to an array
 * @param {string} parents - the string of parents
 * @returns {Array} the parents array
 */
function parentsStringToArray(parents) {
    return parents.split(UUID).map( (el) => decodeURIComponent(el) ).filter( (el) => el !== "" );
}

/**
 * Create an input element for a game.
 * @param {string} defaultValue - the default value of the element
 * @param {boolean} required - if the field is required
 * @returns {Element} - an input element
 */
function createGameInput( defaultValue, required ) {
    return createInput( defaultValue, "game-input", "Game: ", null, required );
}

/**
 * Create a select element containing games.
 * @param {string} selected - the game selected by default
 * @param {string} system - the system the game is on
 * @param {boolean} old - true if the old game for chanding (changes the id)
 * @param {boolean} required - if the field is required
 * @param {Array} parents - a list of parent folders for games - options are limited to their contents
 * @param {boolean} onlyWithRealGames - true if we should only show systems with real games in the menu - this will get passed to sub menus
 * @param {boolean} onlyWithLeafNodes - true if we only want to show "leaf nodes" (only impacts the game menu) - i.e. empty folders or games
 * @returns {Element} - a select element containing the necessary keys
 */
function createGameMenu( selected, system, old, required, parents, onlyWithRealGames, onlyWithLeafNodes ) {
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
        var game = this.options[this.selectedIndex].text;
        var modal = document.querySelector(".modal");
        var system = modal.querySelector("#system-select");
        var currentSystem = system.options[system.selectedIndex].text;
        var saveSelect = modal.querySelector("#save-select");
        if( saveSelect ) {
            var currentSaveElement = document.querySelector('.system[data-system="'+currentSystem+'"] .game[data-game="'+encodeURIComponent(game)+'"] .current-save');
            var currentSave = null;
            if( currentSaveElement ) {
                currentSave = currentSaveElement.innerText;
                // If we're only changing game, parents shouldn't have changed. We'll get a new game menu if parents change.
            }
            saveSelect.parentNode.replaceWith( createSaveMenu( currentSave, currentSystem, game, saveSelect.hasAttribute("required"), parents ) );
        }

        // when we change an old menu - be it system, game or folder, we need to make sure that the new folder menu has all options available
        // to do this, just regenerate the new folder menu
        ensureNewFolderMenuHasCorrectOptions( modal, old );
        ensureRomInputAndPlaylistSelectIsDisplayedOrHidden( modal, old );
        
    }, required );
}

/**
 * Ensure the rom input is displayed or hidden properly
 * @param {HTMLElement} modal - the modal
 * @param {boolean} old - a check to make sure the old item is the one that changed
 */
function ensureRomInputAndPlaylistSelectIsDisplayedOrHidden( modal, old ) {
    if( old && modal ) {
        var oldSystemSelect = modal.querySelector("#old-system-select");
        var oldGameSelect = modal.querySelector("#old-game-select");
        var romFileInput = modal.querySelector("#rom-file-input");
        var playlistSelect = modal.querySelector("#playlist-container");
        var oldParents = extractParentsFromFolderMenu(true, modal);
        var oldSystem = oldSystemSelect.options[oldSystemSelect.selectedIndex].text;
        var oldGame = oldGameSelect.options[oldGameSelect.selectedIndex].text;
        var isFolder = getGamesInFolder(oldParents, oldSystem)[oldGame].isFolder;
        var isPlaylist = getGamesInFolder(oldParents, oldSystem)[oldGame].isPlaylist;
        if( isFolder ) {
            romFileInput.parentNode.classList.add("hidden");
            playlistSelect.parentNode.classList.add("hidden");
        }
        else if( isPlaylist ) {
            romFileInput.parentNode.classList.add("hidden");
            playlistSelect.parentNode.classList.remove("hidden");
        }
        else {
            playlistSelect.parentNode.classList.add("hidden");
            romFileInput.parentNode.classList.remove("hidden");
        }
        if( !playlistSelect.parentNode.classList.contains("hidden") ) {
            playlistSelect.parentNode.replaceWith( createPlaylistMenu( translateSymlinks(getGamesInFolder(oldParents, oldSystem)[oldGame], oldSystem) ) );
        }
    }
}

/**
 * Ensure that the new folder menu has correct options - some can be taken out based on the value
 * of the currently selection item in createFolderMenu for old to prevent a folder from being placed inside itself
 * However, if we then switch the old game by changing system, game or folder, we want to make sure the new menu updates.
 * @param {HTMLElement} modal - the modal
 * @param {boolean} old - a check to make sure the old item is the one that changed
 */
function ensureNewFolderMenuHasCorrectOptions( modal, old ) {
    if( old && modal && modal.querySelector("#folder-select-container") ) {
        var newParents = extractParentsFromFolderMenu(false, modal);
        var newSystem = modal.querySelector("#system-select");
        // this is like the second options in createFolder in displayUpdateGame
        modal.querySelector("#folder-select-container").parentNode.replaceWith( createFolderMenu(newParents, newSystem.options[newSystem.selectedIndex].text, false, false, false, false, modal ) );
    }
}

/**
 * Get all the games in a folder
 * This will return folders too
 * Note how on the server the method we often use, getGameDictEntry will get a game object (of which games is a key),
 * but this will get a the games object. They are similar, and you can get a game object he simply by using the game's
 * parents and then looking up the game by key in the object this function returns.
 * This works well with filterGameTypes
 * @param {Array} parents - the parent folders
 * @param {string} system - the system the folders are for
 * @param {boolean} allowPlaylist - allow playlists to count as folders
 * @returns {object} the games object for the specified parents
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
 * @param {Object} games - a games object (e.g. systems[system].games)
 * @param {Array} arr - an array that will be populated by the function
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
 * Filter a game object to only include folders/games
 * In this case a playlist is considered a game
 * @param {Object} games - a games object (e.g. systems[system].games)
 * @param {boolean} getFolders - true if we are getting folders, false if we are getting games
 * @returns {object} the filtered games object
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
 * Remove playlists. (Filter out)
 * @param {Object} games - a games object (e.g. systems[system].games)
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
 * Extract a parents array from folder menus.
 * @param {boolen} old - true if this is an old list (changes looked for)
 * @param {HTMLElement} modal - the modal containing the menus
 * @param {Array<HTMLElement>} folderDropdowns - the dropdowns
 * @returns {Array} a list of the parents in order
 */
function extractParentsFromFolderMenu(old, modal, folderDropdowns) {
    if( !modal ) modal = document.querySelector(".modal");
    if( !folderDropdowns ) folderDropdowns = modal.querySelectorAll("#" + (old ? "old-" : "") + "folder-select-container select");
    var parents = [];
    for( var i=0; i<folderDropdowns.length; i++ ) {
        var currentDropdown = folderDropdowns[i];
        var value = currentDropdown.options[currentDropdown.selectedIndex].text;
        if(value) {
            parents.push( value );
        }
    }
    return parents;
}

/**
 * Extract items from
 * @param {HTMLElement} modal - the modal containing the playlists
 * @returns {Array<Array<String>>} - An array of arrays of items
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
 * Create position indicator
 * @param {number} currentPosition - the current position
 * @param {number} maxPosition - the max position
 * @returns {HTMLElement} - the position indicator
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
 * Create a playlist menu
 * @param {Array<HTMLElement>} gameDictEntries - a list of game dict entries with parents included
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
 * @param {Array} parents - a list of the current parents (folders) - it is ok if there are "" items in the parents array, they will be removed
 * @param {string} system - the system the menu is for
 * @param {boolen} old - true if this is an old list (changes id)
 * @param {boolean} required - true if the dropdowns are required
 * @param {boolean} onlyWithGames - true if we should only show systems with games in the menu
 * @param {boolean} onlyWithRealGames - true if we should only show systems with real games in the menu
 * @param {HTMLElement} helperElement - an element that contains other dropdowns (like the old dropdown) that we may need to change
 * @param {boolean} onlyWithLeafNodes - true if we only want to show "leaf nodes" (only impacts the game menu) - i.e. empty folders or games - if onlyWithGames is true (which it should be when this is), then we won't ever selected a leaf node as a folder, so that's why it is only needed for the game menu
 * @returns {HTMLElement} - a div element containing dynamic folder dropdowns
 */
function createFolderMenu( parents, system, old, required, onlyWithGames, onlyWithRealGames, helperElement, onlyWithLeafNodes, isForPlaylist, playlistId ) {
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
                    var oldParents = extractParentsFromFolderMenu(true, helperElement);
                    var oldGameSelect = helperElement.querySelector("#old-game-select");
                    oldParents.push( oldGameSelect.options[oldGameSelect.selectedIndex].text );
                    options = options.filter( function(option) {
                        var currentParentsCopy = currentParents.slice(0);
                        currentParentsCopy.push(option);
                        return JSON.stringify(oldParents) != JSON.stringify(currentParentsCopy);
                    } );
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
                        newParents.push( currentDropdown.options[currentDropdown.selectedIndex].text );
                    }
                    // for a playlist, add another playlist option when the last one gets a selected value
                    var allPlaylistSelects = document.querySelectorAll(".modal .playlist-select-container");
                    var lastPlaylistId = digitRegex.exec( allPlaylistSelects[allPlaylistSelects.length-1].getAttribute("id") )[1];
                    if( isForPlaylist && (myIndex > 0 || newParents[0] != "") && playlistId == lastPlaylistId ) {
                        document.querySelector(".modal #playlist-container").appendChild( createFolderMenu( [], "media", false, false, true, true, null, true, true, parseInt(lastPlaylistId) + 1 ) );
                    }

                    // for a playlist, first element set to null, remove 
                    if( isForPlaylist && newParents[0] == "" && allPlaylistSelects.length > 1 ) {
                        this.parentNode.parentNode.parentNode.parentNode.removeChild( this.parentNode.parentNode.parentNode );
                    }
                    else
                        this.parentNode.parentNode.parentNode.replaceWith( createFolderMenu( newParents, system, old, required, onlyWithGames, onlyWithRealGames, null, onlyWithLeafNodes, isForPlaylist, playlistId ) );
                    
                    if( !isForPlaylist ) {
                        // If there are any game menus below the folders, trigger them to change
                        var gameSelect = modal.querySelector("#" + (old ? "old-" : "") + "game-select");
                        if( gameSelect ) { // See important note : this means onlyWithGames should be true
                            var parentsForGameMenu = extractParentsFromFolderMenu(old);
                            // Get the game element that is selected - it must be available for this folder though
                            var selectedGameElement = document.querySelector('.system[data-system="'+system+'"] .game.selected[data-parents="'+parentsArrayToString(parentsForGameMenu)+'"]');
                            if( onlyWithRealGames && selectedGameElement && selectedGameElement.hasAttribute("data-is-folder") ) {
                                selectedGameElement = null;
                            }
                            var selectedGame = null;
                            if( selectedGameElement ) {
                                selectedGame = decodeURIComponent(selectedGameElement.getAttribute("data-game"));
                            }
                            // there is no selected game element in our folder, just find any one
                            // we KNOW there is at least one game (with the same parents) in there since we filtered earlier
                            else {
                                var not = onlyWithRealGames ? ":not([data-is-folder])" : ""; // if onlyWithGames - IMPORTANT NOTE: gameSelect shouldn't exist without either onlyWithGames or onlyWithRequiredGames - otherwise this might throw an error as we'd have an empty folder - you should not  allow a game select with the potentiality of there being nothing to have selected by default
                                selectedGameElement = document.querySelector('.system[data-system="'+system+'"] .game[data-parents="'+parentsArrayToString(parentsForGameMenu)+'"]' + not);
                                selectedGame = decodeURIComponent(selectedGameElement.getAttribute("data-game"));
                            }
                            
                            // See if we can get a selected game within the folder
                            gameSelect.parentNode.replaceWith( createGameMenu(selectedGame, system, old, gameSelect.hasAttribute("required"), parentsForGameMenu, onlyWithRealGames, onlyWithLeafNodes) );

                            var saveSelect = modal.querySelector("#save-select");
                            if( saveSelect && !old ) {
                                var currentSave = null;
                                if( selectedGameElement ) {
                                    var currentSaveElement = selectedGameElement.querySelector(".current-save");
                                    if( currentSaveElement ) currentSave = currentSaveElement.innerText;
                                }
                                saveSelect.parentNode.replaceWith( createSaveMenu( currentSave, system, selectedGame, saveSelect.hasAttribute("required"), parentsForGameMenu ) );
                            }
                        }

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
 * @param {string} defaultValue - the default value of the element
 * @param {boolean} required - if the field is required
 * @returns {Element} - an input element
 */
function createRomFileInput(required) {
    return createInput( null, "rom-file-input", "Rom File: ", "file", required );
}

/**
 * Create an input element for a save file.
 * @param {string} defaultValue - the default value of the element
* @param {boolean} required - if the field is required
 * @returns {Element} - a select element containing the necessary keys
 */
function createSaveInput( defaultValue, required ) {
    return createInput( defaultValue, "save-input", "Save: ", null, required );
}

/**
 * Create a select element containing saves.
 * @param {string} selected - the save selected by default
 * @param {boolean} old - true if the old game for chanding (changes the id)
 * @param {boolean} required - if the field is required
 * @returns {Element} - a select element containing the necessary keys
 */
function createSaveMenu( selected, system, game, required, parents ) {
    return createMenu( selected, Object.keys(getGamesInFolder( parents, system )[game].saves), "save-select", "Save: ", null, required );
}

/**
 * Create a select element containing type
 * @param {string} selected - the save selected by default
 * @param {Array<string>} options - a list of options for the select (should contain one or more of "Game", "Folder", and "Playlist")
 * @param {boolean} required - if the field is required
 */
function createTypeMenu( selected, options, required ) {
    return createMenu( selected, options, "type-select", "Type: ", function() {
        if( this.options[this.selectedIndex].text == "Game" ) {
            document.querySelector(".modal #playlist-container").parentNode.classList.add("hidden");
            document.querySelector(".modal #rom-file-input").parentNode.classList.remove("hidden");
        }
        else if ( this.options[this.selectedIndex].text == "Folder" ) {
            document.querySelector(".modal #rom-file-input").parentNode.classList.add("hidden");
            document.querySelector(".modal #playlist-container").parentNode.classList.add("hidden");
        }
        else { // Playlist
            document.querySelector(".modal #rom-file-input").parentNode.classList.add("hidden");
            document.querySelector(".modal #playlist-container").parentNode.classList.remove("hidden");
        }
    }, required );
}

/**
 * Add a label to an element
 * @param {Element} element - the element to attach a label to
 * @param {string} text - the label text
 * @returns {Element} - a label element wrapping the input element
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
 * @param {string} defaultValue - the default value of the element
 * @param {string} id - the id of the element
 * @param {string} label - the label text for the element
 * @param {string} type - the type attribute of the element
 * @param {boolean} required - if the field is required
 * @returns {Element} - an input element
 */
function createInput( defaultValue, id, label, type, required ) {
    var input = document.createElement("input");
    input.type = type ? type : "text";
    if( defaultValue ) input.value = defaultValue;
    input.setAttribute("id", id);
    if( required ) {
        input.setAttribute("required", "required");
    }
    return addLabel( input, label );
}

/**
 * Create a select element. 
 * @param {string} selected - which element should be selected by default
 * @param {Array<string>} options - a list of options for the select
 * @param {string} id - the id of the element
 * @param {string} label - the label text of the menu
 * @param {Function} onchange - the onchange function for the menu
 * @param {boolean} required - if the field is required
 * @returns {Element} - a select element
 */
function createMenu( selected, options, id, label, onchange, required ) {
    var select = document.createElement("select");
    select.setAttribute("id", id);
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
 * @param {string} label - the label text of the button 
 * @param {function} onclick - the callback function to run on click - it won't be available until all the required fields have a value
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
 * @param {string} text - the text for the warning
 * @returns {Element} - a div element containing the warning
 */
function createWarning( text ) {
    var warning = document.createElement("div");
    warning.innerText = text;
    warning.classList.add("warning");
    return warning;
}

/**
 * Create a form title.
 * @param {string} title - the title of the form
 * @returns {Element} - a h2 element containing the title
 */
function createFormTitle( title ) {
    var element = document.createElement("h2");
    element.innerText = title;
    return element;
}

/**
 * Launch a modal.
 * @param {Element} element - the element within the modal.
 * @param {Function} closeModalCallbackFunction - a function to set the global closeModalCallback to after any current modal has closed
 * @param {boolean} force - allow launch during a request - should only happen from a server side request
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
 * @param {boolean} force - allow launch during a request - should only happen from a server side request
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
 * @param {string} message - the message to display
 */
function alertError(message) {
    if( ! message ) message = "An error has ocurred.";
    createToast(message, "failure");
}

/**
 * Alert that a success took place.
 * @param {string} message - the message to display
 */
function alertSuccess(message) {
    createToast(message, "success");
}

/**
 * Create a toast
 * @param {string} message - the message to display in the toast
 * @param {string} type - the type of toast (success or failure)
 */
function createToast(message, type) {
    var toast = document.createElement("div");
    toast.classList.add("toast");
    toast.innerText = message;
    document.body.appendChild(toast);
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
 * Launch a game
 * @param {string} system - the system to launch the game on
 * @param {string} game - the game to launch
 * @param {Array} parents - the parents of the game to launch
 */
function launchGame( system, game, parents ) {
    if( !makingRequest ) {
        startRequest(); // Most other functions do this prior since they need to do other things
        makeRequest( "POST", "/launch", { "system": system, "game": game, "parents": parents },
        function( responseText ) { standardSuccess(responseText, "Game launched", null, null, null, null, null, null, true) },
        function( responseText ) { standardFailure( responseText ) } );
    }
}

/**
 * Quit a game.
 * @param {boolean} quitModalOnCallback - true if the modal should be quit after a successful request (used by the browser)
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
                systemsDict = response.systems;
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
 * @param {string} system - the system the game is on
 * @param {string} game - the name of the game
 * @param {object} file - a file object
 * @param {Array} parents - the parents of a game
 * @param {boolean} isFolder - true if the "game" is a folder
 * @param {boolean} isPlaylist - true if the "game" is a playlist
 * @param {Array<Array>} playlistItems - the items in the playlist
 */
function addGame( system, game, file, parents, isFolder, isPlaylist, playlistItems ) {
    makeRequest( "POST", "/game", { "system": system, "game": game, "file": file ? file : "", "parents": JSON.stringify(parents), "isFolder": isFolder ? isFolder : "", "isPlaylist": isPlaylist ? isPlaylist : "", "playlistItems": JSON.stringify(playlistItems) }, 
    function( responseText ) { standardSuccess(responseText, "Game successfully added") },
    function( responseText ) { standardFailure( responseText ) }, true );
}

/**
 * Update a game.
 * @param {string} oldSystem - the current system
 * @param {string} oldGame - the current game name
 * @param {Array} oldParents - the current parents of a game
 * @param {string} system - the system the game is on
 * @param {string} game - the name of the game
 * @param {object} file - a file object
 * @param {Array} parents - the parents of a game
 * @param {boolean} isFolder - true if the "game" is a folder
 * @param {boolean} isPlaylist - true if the "game" is a playlist
 * @param {Array<Array>} playlistItems - the items in the playlist
 */
function updateGame( oldSystem, oldGame, oldParents, system, game, file, parents, isFolder, isPlaylist, playlistItems ) {
    makeRequest( "PUT", "/game", { "oldSystem": oldSystem, "oldGame": oldGame, "oldParents": JSON.stringify(oldParents), "system": system, "game": game, "file": file ? file : "", "parents": JSON.stringify(parents), "isFolder": isFolder ? isFolder : "", "isPlaylist": isPlaylist ? isPlaylist : "", "playlistItems": JSON.stringify(playlistItems) }, 
    function( responseText ) { standardSuccess(responseText, "Game successfully updated", oldSystem, system ? system : oldSystem, oldGame, game ? game: oldGame, oldParents, parents) },
    function( responseText ) { standardFailure( responseText ) }, true );
}

/**
 * Delete a game.
 * @param {string} system - the system the game is on
 * @param {string} game - the name of the game
 * @param {Array} parents - the parents of a game
 */
function deleteGame( system, game, parents ) {
    makeRequest( "DELETE", "/game", { "system": system, "game": game, "parents": parents }, 
    function( responseText ) { standardSuccess(responseText, "Game successfully deleted", system, null, game, null, parents, null) },
    function( responseText ) { standardFailure( responseText ) } );
}

/**
 * Add a save.
 * @param {string} system - the system the game is on
 * @param {string} game - the name of the game
 * @param {string} save - the name of the save to add
 * @param {Array} parents - the parents of a game
 */
function addSave( system, game, save, parents ) {
    makeRequest( "POST", "/save", { "system": system, "game": game, "save": save, "parents": parents }, 
    function( responseText ) { standardSuccess(responseText, "Save successfully added") },
    function( responseText ) { standardFailure( responseText ) } );
}

/**
 * Change the current save.
 * @param {string} system - the system the game is on
 * @param {string} game - the name of the game
 * @param {string} save - the name of the save to switch to
 * @param {Array} parents - the parents of a game
 */
function changeSave( system, game, save, parents ) {
    makeRequest( "PUT", "/save", { "system": system, "game": game, "save": save, "parents": parents }, 
    function( responseText ) { standardSuccess(responseText, "Save successfully changed") },
    function( responseText ) { standardFailure( responseText ) } );
}

/**
 * Delete a save.
 * @param {string} system - the system the game is on
 * @param {string} game - the name of the game
 * @param {string} save - the name of the save to delete
 * @param {Array} parents - the parents of a game
 */
function deleteSave( system, game, save, parents ) {
    makeRequest( "DELETE", "/save", { "system": system, "game": game, "save": save, "parents": parents }, 
    function( responseText ) { standardSuccess(responseText, "Save successfully deleted") },
    function( responseText ) { standardFailure( responseText ) } );
}

/**
 * Standard success function for a request
 * @param {string} responseText - the response from the server
 * @param {string} message - the message to display
 * @param {string} oldSystemName - the old name of the system if it changed
 * @param {string} newSystemName - the new name of the system if it changed (null if it was deleted)
 * @param {string} oldGameName - the old name of the game if it changed
 * @param {string} newGameName - the new name of the game if it changed (null if it was deleted)
 * @param {Array} oldParents - the old parents if it changed
 * @param {Array} newParents - the new parents if it changed
 * @param {boolean} preventModalClose - true if the modal should not close
 */
function standardSuccess( responseText, message, oldSystemName, newSystemName, oldGameName, newGameName, oldParents, newParents, preventModalClose ) {
    var response = JSON.parse(responseText);
    systemsDict = response.systems;
    redraw(oldSystemName, newSystemName, oldGameName, newGameName, oldParents, newParents);
    if(message) alertSuccess(message);
    endRequest();
    if( !preventModalClose) closeModal();
}

/**
 * Standard failure function for a request
 * @param {string} responseText - the response from the server
 * @param {boolean} async - true if we don't have to update makingRequest
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
 * Make a request
 * @param {string} type - "GET" or "POST"
 * @param {string} url - the url to make the request ro
 * @param {object} parameters - an object with keys being parameter keys and values being parameter values to send with the request
 * @param {function} callback - callback function to run upon request completion
 * @param {boolean} useFormData - true if we should use form data instead of json
 */
function makeRequest(type, url, parameters, callback, errorCallback, useFormData) {
    var parameterKeys = Object.keys(parameters);

    url = "http://" + window.location.hostname + ":8080" + url;
    if( type == "GET" && parameterKeys.length ) {
        var parameterArray = [];
        for( var i=0; i<parameterKeys.length; i++ ) {
            parameterArray.push( parameterKeys[i] + "=" + parameters[parameterKeys[i]] );
        }
        url = url + "?" + parameterArray.join("&");
    }
   
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
    
    var gp = gamepads[0];
    if( !disableMenuControls && document.hasFocus() ) {

        // See this helpful image for mappings: https://www.html5rocks.com/en/tutorials/doodles/gamepad/gamepad_diagram.png
        
        var aPressed = buttonPressed(gp.buttons[joyMapping["A"]]);
        var startPressed = buttonPressed(gp.buttons[joyMapping["Start"]]);
        // A or Start - launch a game (no need to quit a game, since they should have escape mapped to a key so they can go back to the menu)
        if( (aPressed && buttonsUp.gamepad[joyMapping["A"]]) 
            || (startPressed && buttonsUp.gamepad[joyMapping["Start"]]) ) {
            
            if( aPressed ) buttonsUp.gamepad[joyMapping["A"]] = false;
            if( startPressed ) buttonsUp.gamepad[joyMapping["Start"]] = false;
            
            document.querySelector("#launch-game").click();
        }
        else {
            if(!aPressed) buttonsUp.gamepad[joyMapping["A"]] = true;
            if(!startPressed) buttonsUp.gamepad[joyMapping["Start"]] = true;
        }
      
        var rightTriggerPressed = buttonPressed(gp.buttons[joyMapping["Right Trigger"]]);
        // Right shoulder or trigger - cycle saves - only if there is a game in front of the user
        if( rightTriggerPressed && buttonsUp.gamepad[joyMapping["Right Trigger"]] && document.querySelector(".system.selected .game.selected") ) {
            buttonsUp.gamepad[joyMapping["Right Trigger"]] = false;
            cycleSave(1);
            menuChangeDelay("right-trigger");
        }
        else {
            if( menuDirection == "right-trigger" ) menuDirection = null;
            buttonsUp.gamepad[joyMapping["Right Trigger"]] = true;
        }

        var leftTriggerPressed = buttonPressed(gp.buttons[joyMapping["Left Trigger"]]);
        // Left shoulder or trigger - cycle saves
        if( leftTriggerPressed && buttonsUp.gamepad[joyMapping["Left Trigger"]] && document.querySelector(".system.selected .game.selected") ) {
            buttonsUp.gamepad[joyMapping["Left Trigger"]] = false;
            cycleSave(-1);
            menuChangeDelay("left-trigger");
        }
        else {
            if( menuDirection == "left-trigger" ) menuDirection = null;
            buttonsUp.gamepad[joyMapping["Left Trigger"]] = true;
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
        var inputs = document.querySelectorAll("#joypad-config-form input");
        // Check if an input is focused
        for( var i=0; i<inputs.length; i++ ) {
            if( inputs[i] === document.activeElement ) {
                // If so, check if any buttons are pressed
                for( var j=0; j<gp.buttons.length; j++ ) {
                    // If so, set the input's value to be that of the pressed button
                    if(buttonPressed(gp.buttons[j])) {
                        inputs[i].value = j;
                        if( inputs[i+1] ) {
                            if( focusInterval ) {
                                clearTimeout(focusInterval);
                                focusInterval = null;
                            }
                            focusInterval = setTimeout( function() { inputs[i+1].focus() }, FOCUS_NEXT_INTERVAL );
                        } 
                    }
                }
                break;
            }
        }
    }
    // Check if we are controlling media
    else if( document.hasFocus() && document.querySelector(".modal #remote-media-form") ) {
        var aPressed = buttonPressed(gp.buttons[joyMapping["A"]]);
        var startPressed = buttonPressed(gp.buttons[joyMapping["Start"]]);
        // A or Start - will pause/play
        if( (aPressed && buttonsUp.gamepad[joyMapping["A"]]) 
            || (startPressed && buttonsUp.gamepad[joyMapping["Start"]]) ) {
            
            if( aPressed ) buttonsUp.gamepad[joyMapping["A"]] = false;
            if( startPressed ) buttonsUp.gamepad[joyMapping["Start"]] = false;
            
            var video = document.querySelector(".modal #remote-media-form video");
            if( video.paused ) {
                video.play();
            }
            else {
                video.pause();
            }
        }
        else {
            if(!aPressed) buttonsUp.gamepad[joyMapping["A"]] = true;
            if(!startPressed) buttonsUp.gamepad[joyMapping["Start"]] = true;
        }

        // Select will go full screen
        var selectPressed = buttonPressed(gp.buttons[joyMapping["Select"]]);
        if( selectPressed && buttonsUp.gamepad[joyMapping["Select"]] ) {
            buttonsUp.gamepad[joyMapping["Select"]] = false;

            if(document.fullscreenElement && document.fullscreenElement == document.querySelector(".modal #remote-media-form video")) {
                document.exitFullscreen();
            }
            else {
                document.querySelector(".modal #remote-media-form video").requestFullscreen();
            }
        }
        else if(!selectPressed) {
            buttonsUp.gamepad[joyMapping["Select"]] = true;
        }

        // Right trigger will got to next
        var rightTriggerPressed = buttonPressed(gp.buttons[joyMapping["Right Trigger"]]);
        if( rightTriggerPressed && buttonsUp.gamepad[joyMapping["Right Trigger"]] ) {
            buttonsUp.gamepad[joyMapping["Right Trigger"]] = false;

            playNextMedia(1);
        }
        else if(!rightTriggerPressed) {
            buttonsUp.gamepad[joyMapping["Right Trigger"]] = true;
        }

        // Left trigger will go to previous
        var leftTriggerPressed = buttonPressed(gp.buttons[joyMapping["Left Trigger"]]);
        if( leftTriggerPressed && buttonsUp.gamepad[joyMapping["Left Trigger"]] ) {
            buttonsUp.gamepad[joyMapping["Left Trigger"]] = false;

            previousMedia();
        }
        else if(!leftTriggerPressed) {
            buttonsUp.gamepad[joyMapping["Left Trigger"]] = true;
        }
    }
    setTimeout(manageGamepadInput, GAMEPAD_INPUT_INTERVAL);
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

var xDown = null;                                                        
var yDown = null;

/**
 * Get the touches that occurred.
 * @param {Event} evt - the touch event
 */
function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery
}                                                     

/**
 * Handle the touch start event.
 * @param {Event} evt - the touch event
 */
function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};                                                

/**
 * Handle the touch move event.
 * @param {Event} evt - the touch event
 */
function handleTouchMove(evt) {
    if ( ! xDown || ! yDown || disableMenuControls ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

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
    /* reset values */
    xDown = null;
    yDown = null;                                             
};


// Screencast section

// WebRTC protocol
// Offer - Answer (exchanging descriptions - includes information about each peer)
// Exchange ICE Candidates (ways to connect)
// Connection is made and remote streams handled with ontrack

var localStream = null;
var peerConnection = null;

/**
 * Connect to the signal server
 * @param {boolean} isStreamer - true if this is being called from the menuPage of guystation > we stream from guystation
 */
function connectToSignalServer( isStreamer ) {

    var event = "connect-screencast-" + (isStreamer ? "streamer" : "client");
    socket.emit( event, true );
    socket.off()
    socket.on( 'sdp', handleRemoteSdp );
    socket.on( 'ice', handleRemoteIce );

    if( isStreamer ) {
        navigator.mediaDevices.getDisplayMedia({"video": true}).then(getDisplayMediaSuccess).catch(errorHandler);
    }

}

/**
 * Set the value of the localStream variable once it is successfully fetched
 * This should only ever be called from guystation, since we don't stream the page on the client
 * @param {Object} stream - the screencast
 */
function getDisplayMediaSuccess(stream) {
    localStream = stream;
    socket.emit("streamer-media-ready");
}

/**
 * Start a connection to the peer
 * Peer connection should already be defined.
 * This should be initially called by the menuPage (using puppeteer evaluate) after it detects a client connect to it.
 * Once the server is connected to the client, the client will connect to the server automaitcally as seen in the handle functions
 * @param {boolean} isStreamer - true if this is the streamer, false if this is the client
 */
function startConnectionToPeer( isStreamer ) {
    peerConnection = new RTCPeerConnection(null);
    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onicecandidate
    // onicecandidate is not called when you do addIceCandidate. It is called whenever
    // it is deemed necessary that you send your ice candidates to the signal server
    // (usually after you have sent an offer or an answer).
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.oniceconnectionstatechange = handlePotentialDisconnect;
    // Only the receiver will need to worry about what happens when it gets a remote stream
    if( !isStreamer ) {
        peerConnection.ontrack = gotRemoteStream;
    }
    // Only the streamer needs to add its own local sctream
    if( isStreamer ) {
        peerConnection.addStream(localStream);
        // the streamer will create an offer once it creates its peer connection
        peerConnection.createOffer({offerToReceiveVideo: true}).then(createdDescription).catch(errorHandler);
    }
}

/**
 * Handle a potential disconnect
 */
function handlePotentialDisconnect() {
    if( peerConnection && peerConnection.iceConnectionState == "disconnected" ) {
        stopConnectionToPeer(false); // note we pretend we are not the streamer even if we are here.
        // this will close the connection, but then it will call all the server functions we need to allow for
        // another connection to take place. Then, the server will try to stop the connection on the menuPage, but
        // it will not pass any of the checks, since peerConnection will already be null as will localStream
    }
}

/**
 * Stop the peer connection.
 * Since the connection will always be closed from the client, if this is the client
 * this will tell the server to stop too once it has closed.
 * @param {boolean} isStreamer - true if this is the streamer, or we want to pretend that we are
 */
function stopConnectionToPeer( isStreamer ) {
    if( peerConnection ) {
        peerConnection.close();
        peerConnection = null;
    }
    if( !isStreamer ) {
        var stopLettingServerKnowWeExist = function() { clearInterval(resetCancelStreamingInterval); };
        // stop letting the server know we exist once it stops expecting us
        makeRequest("GET", "/screencast/stop", [], stopLettingServerKnowWeExist, stopLettingServerKnowWeExist);

        // this should only be called on the client
        // if this is because the server disconnects, we'll close the modal here
        // if they have manually quit the modal, this check will fail and we will
        // not call it again
        if( document.querySelector(".modal #remote-screencast-form") ) {
            closeModalCallback = null; // we don't need to call stop connection again
            closeModal();
        }
    }
    else if(localStream) {
        localStream.getTracks().forEach( function(tr) {tr.stop();} ); // should be idempotent, tracks aren't started again, localStream is just overwritten
        localStream = null;
    }
}
 
/**
 * Handle an offer/answer in WebRTC protocl
 * @param {Object} data - the data associated with the offer/answer
 */
function handleRemoteSdp(data) {
    // this is to create the peer connection on the client (an offer has been received from guystation)
    if(!peerConnection) startConnectionToPeer(false);

    // Set the information about the remote peer set in the offer/answer
    peerConnection.setRemoteDescription(new RTCSessionDescription(data)).then(function() {
        // If this was an offer sent from guystation, respond to the client
        if( data.type == "offer" ) {
            // Send an answer
            peerConnection.createAnswer().then(createdDescription).catch(errorHandler);
        }
    });
}

/**
 * Handle receiving information about and ICE candidate in the WebRTC protocol
 * Note: this can happen simulatneously with the offer/call although theoretically happens after 
 * @param {Object} data - the data associated with the offer/answer
 */
function handleRemoteIce(data) {
    // this is to create the peer connection on the client (an offer has been received from guystation)
    if(!peerConnection) startConnectionToPeer(false);

    // Set the information about the remote peer set in the offer/answer
    peerConnection.addIceCandidate(new RTCIceCandidate(data)).catch(errorHandler);
}

/**
 * Handle when we have successfully determined one of our OWN ice candidates
 * @param {Event} event - the event that triggers this handler
 */
function gotIceCandidate(event) {
    if(event.candidate != null) {
        // alert the signal server about this ice candidate
        socket.emit("ice", event.candidate);
    }
}

/**
 * Handle when the local description has been successfully determined
 * @param {Object} description - A generated local description necessary to include in an offer/answer
 */
function createdDescription(description) {
    peerConnection.setLocalDescription(description).then(function() {
        socket.emit("sdp", peerConnection.localDescription);
    }).catch(errorHandler);
}

/**
 * Handler for when a remote stream has been found
 * @param {Event} event - The event that triggered the stream
 */
function gotRemoteStream(event) {
    document.querySelector(".modal #remote-screencast-form video, .modal #browser-controls-form video").srcObject = event.streams[0];
}

/**
 * The error handler for Screencast
 * @param {Error} error - the error
 */
function errorHandler(error) {
    console.log(error);
}


// End screencast section