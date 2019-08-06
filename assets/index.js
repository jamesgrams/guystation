var SPACING = 250;
var EXPAND_COUNT = 10; // Number to expand on each side of the selected element - Note: We may actually expand more than this. We need to have a number of items divisble by the number of systems for the loop to work properly.

var expandCountLeft; // We always need to have a complete list of systems, repeated however many times we want, so the loop works properly
var expandCountRight;
var systemsDict;
var ip;

window.addEventListener('load', load );

/**
 * Load.
 */
function load() {
    makeRequest( "GET", "/data", {}, function(responseText) {
        var response = JSON.parse(responseText);
        systemsDict = response.systems;
        ip = response.ip;
        draw();
        enableControls();
    }, load );
}

/**
 * Enable controls.
 */
function enableControls() {
    document.onkeydown = function(event) {
        switch (event.keyCode) {
            // Left
            case 37:
                moveMenu(-1);
                break;
            // Up
            case 38:
                moveSubMenu(-1);
                break;
            // Right
            case 39:
                moveMenu(1);
                break;
            // Down
            case 40:
                moveSubMenu(1);
                break;
            // Enter
            case 13:
                launchGame( document.querySelector(".system.selected").getAttribute( "data-system" ),
                document.querySelector(".system.selected .game.selected").getAttribute( "data-game" ) );
                break;
        }
    };
}

/**
 * Draw the page.
 */
function draw() {
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
        var gamesKeys = Object.keys(system.games);
        
        // For each of the games in the response
        for( var j=0; j<gamesKeys.length; j++) {
            // Get the game object
            var game = system.games[gamesKeys[j]];

            // Create an element for the game
            var gameElement = document.createElement("div");
            gameElement.classList.add("game");
            gameElement.setAttribute("data-game", game.game);
            if( j==0 ) {
                gameElement.classList.add("selected");
            }
            gameElement.innerText = game.game;

            // Create an element for the current save
            var currentSaveDiv = document.createElement("div");
            currentSaveDiv.classList.add("current-save");
            currentSaveDiv.innerText = game.currentSave;

            // Append the game element to the list of elements
            gameElement.appendChild(currentSaveDiv);
            gamesElement.appendChild(gameElement);
        }

        // Append the games list element to the system
        systemElement.appendChild(gamesElement);

        // Add the system element to the list of systems
        systemElements.push(systemElement);
    }

    // Draw the menu
    // The menu will basically be a loop
    var systemsElement = document.querySelector("#systems");
    systemsElement.innerHTML = ""; // clear out systems
    var startIndex = 0; // Start at 0 by default on draw
    // Calculate the appropriate expand counts on each side
    expandCountLeft = Math.ceil(EXPAND_COUNT/systemElements.length) * systemElements.length;
    expandCountRight = expandCountLeft - 1;

    // Add the systems elements
    systemsElement.appendChild( systemElements[startIndex] );
    for( var i=1; i<expandCountRight+1; i++ ) {
        var nextIndex = getIndex( startIndex+(i-1), systemElements, 1 );
        var nextElement = systemElements[nextIndex].cloneNode(true);
        nextElement.style.left = "calc( 50% + " + (i*SPACING) + "px )";
        systemsElement.appendChild(nextElement);
    }
    for( var i=1; i<expandCountLeft+1; i++ ) {
        var prevIndex = getIndex( startIndex+(i-1), systemElements, -1 );
        var prevElement = systemElements[prevIndex].cloneNode(true);
        prevElement.style.left = "calc( 50% + -" + (i*SPACING) + "px )";
        systemsElement.appendChild(prevElement);
    }

    // Add the selected class
    systemElements[startIndex].classList.add("selected");

    // Draw the ip
    document.querySelector("#ip").innerText = ip;
}

/**
 * Get the index of an array given a starting position and offset if treating the array like a circle
 * @param {number} index - the starting index
 * @param {Array} arr - the array to find the index of
 * @param {number} offset - the offset amount
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
            offset = parseInt(offset.match(/(-?\d+)px/)[1]);
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
}

/**
 * Move the sub menu a given spaces
 * @param {number} spaces - the number of spaces to move the submenu
 */
function moveSubMenu( spaces ) {
    // We have to update all systems
    // Get the currently selected system
    var currentSystem = document.querySelector(".system.selected").getAttribute("data-system");
    // Get all menu items matching that system
    var subMenus = document.querySelectorAll(".system[data-system="+currentSystem+"] .games");
    // Get the height of elements
    var height = document.querySelector(".game").offsetHeight;

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
        var games = subMenu.querySelectorAll(".game");
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

        // Set the submenu offset
        subMenu.style.top = newOffset + "px";
    }
}

/**
 * Launch a game
 * @param {string} system - the system to launch the game on
 * @param {string} game - the game to launch
 */
function launchGame( system, game ) {
    makeRequest( "POST", "/launch", { "system": system, "game": game }, function( responseText ) {
        console.log( JSON.parse(responseText) );
    } );
}

/**
 * Make a request
 * @param {string} type - "GET" or "POST"
 * @param {string} url - the url to make the request ro
 * @param {object} parameters - an object with keys being parameter keys and values being parameter values to send with the request
 * @param {function} callback - callback function to run upon request completion
 */
function makeRequest(type, url, parameters, callback, errorCallback) {
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

    if( type == "POST" && parameterKeys.length ) {
        xhttp.setRequestHeader("Content-type", "application/json");
    } 

    xhttp.onreadystatechange = function() {
        if( this.readyState == 4 ) {
            if( this.status == 200 ) {
                if( callback ) { callback(this.responseText); }
            }
            else {
                if( errorCallback ) { errorCallback(); }
            }
        }
    }    
    if( type == "POST" && Object.keys(parameters).length ) {
        xhttp.send( JSON.stringify(parameters) );
    }
    else {
        xhttp.send();
    }
}