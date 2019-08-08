var SPACING = 250;
var EXPAND_COUNT = 10; // Number to expand on each side of the selected element - Note: We may actually expand more than this. We need to have a number of items divisble by the number of systems for the loop to work properly.
var ROM_READ_ERROR = "An error ocurred readline the ROM file.";

var expandCountLeft; // We always need to have a complete list of systems, repeated however many times we want, so the loop works properly
var expandCountRight;
var systemsDict;
var ip;
var disableMenuControls;
var makingRequest = false;

window.addEventListener('load', load );

/**
 * Load.
 */
function load() {
    startRequest();
    makeRequest( "GET", "/data", {}, function(responseText) {
        var response = JSON.parse(responseText);
        systemsDict = response.systems;
        ip = response.ip;
        draw();
        enableControls();
        endRequest();
    }, load );
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
        }
        else {
            switch (event.keyCode) {
                // Escape
                case 27:
                        closeModal();
                        break;
            }
        }
    };
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
        var gamesKeys = Object.keys(system.games);

        var startGameIndex = startSystem && startSystem.games && startSystem.games[system.system] ? gamesKeys.indexOf(startSystem.games[system.system]) : 0;

        // For each of the games in the response
        for( var j=0; j<gamesKeys.length; j++) {
            // Get the game object
            var game = system.games[gamesKeys[j]];

            // Create an element for the game
            var gameElement = document.createElement("div");
            gameElement.classList.add("game");
            gameElement.setAttribute("data-game", game.game);
            if( j==startGameIndex ) {
                gameElement.classList.add("selected");
                if( j>0 ) {
                    var height = document.querySelector(".game").offsetHeight;
                    var newOffset = j * height * -1;
                    gamesElement.style.top = newOffset + "px";
                }
            }
            else if( j<startGameIndex ) {
                gameElement.classList.add("above");
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
    var startIndex = startSystem && startSystem.system ? Array.from(systemElements).map( (el) => el.getAttribute("data-system") ).indexOf(startSystem.system) : 0; // Start at 0 by default on draw
    systemsElement.innerHTML = ""; // clear out systems
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

    // Add functionality to the functions buttons
    document.getElementById("launch-game").onclick = launchGame;
    document.getElementById("quit-game").onclick = quitGame;
    document.getElementById("add-game").onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#add-game-form") ) displayAddGame(); };
    document.getElementById("update-game").onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#update-game-form") ) displayUpdateGame(); };
    document.getElementById("delete-game").onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#delete-game-form") ) displayDeleteGame(); };
    document.getElementById("add-save").onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#add-save-form") ) displayAddSave(); };
    document.getElementById("update-save").onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#change-save-form") ) displaySelectSave(); };
    document.getElementById("delete-save").onclick = function(e) { e.stopPropagation(); if( !document.querySelector("#delete-save-form") ) displayDeleteSave(); };
}

/**
 * Do a redraw maintaining the current position.
 * @param {string} oldGameName - the old name of the game if it changed
 * @param {string} newGameName - the new name of the game if it changed (null if it was deleted)
 */
function redraw( oldGameName, newGameName ) {
    var currentSystem = document.querySelector(".system.selected").getAttribute("data-system");
    var systems = document.querySelectorAll(".system");
    var games = {};
    for(var i=0; i<systems.length; i++) {
        var selectedGameElement = systems[i].querySelector(".game.selected");
        var selectedGame = selectedGameElement.getAttribute("data-game");
        // newGameName being null means the game was deleted, we have to try to get a close by index
        if( selectedGame == oldGameName && newGameName === null ) {
            if( selectedGameElement.previousElementSibling ) {
                selectedGame = selectedGameElement.previousElementSibling.getAttribute("data-game");
            }
            else if( selectedGame.nextElementSibling ) {
                selectedGame = selectedGameElement.nextElementSibling.getAttribute("data-game");
            }
            // No games left
            else {
                selectedGame = null;
            }
        }
        // If the game name is updated, we'll have to change it
        else if( selectedGame == oldGameName ) {
            selectedGame = newGameName;
        }
        games[systems[i].getAttribute("data-system")] = selectedGame;
    }
    draw( { system: currentSystem, games: games } );
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
 * Display the menu to delete a save.
 */
function displayDeleteSave() {
    var form = document.createElement("div");
    var currentSystem = document.querySelector(".system.selected").getAttribute("data-system");
    var currentGame = document.querySelector(".system.selected .game.selected").getAttribute("data-game");
    var currentSave = document.querySelector(".system.selected .game.selected .current-save").innerText;
    form.setAttribute("id", "delete-save-form");
    form.appendChild( createFormTitle("Delete Save") );
    form.appendChild( createSystemMenu( currentSystem, false, true ) );
    form.appendChild( createGameMenu(currentGame, currentSystem, false, true) );
    form.appendChild( createSaveMenu(currentSave, currentSystem, currentGame, true) );
    form.appendChild( createButton( "Delete Save", function() {
        if( !makingRequest ) {
            startRequest();
            var systemSelect = document.querySelector("#delete-save-form #system-select");
            var gameSelect = document.querySelector("#delete-save-form #game-select");
            var saveSelect = document.querySelector("#delete-save-form #save-select");
            deleteSave( systemSelect.options[systemSelect.selectedIndex].text, gameSelect.options[gameSelect.selectedIndex].text, saveSelect.options[saveSelect.selectedIndex].text );
        }
    } ) );
    launchModal( form );
}

/**
 * Display the menu to select a save.
 */
function displaySelectSave() {
    var form = document.createElement("div");
    var currentSystem = document.querySelector(".system.selected").getAttribute("data-system");
    var currentGame = document.querySelector(".system.selected .game.selected").getAttribute("data-game");
    var currentSave = document.querySelector(".system.selected .game.selected .current-save").innerText;
    form.setAttribute("id", "change-save-form");
    form.appendChild( createFormTitle("Change Save") );
    form.appendChild( createSystemMenu( currentSystem, false, true ) );
    form.appendChild( createGameMenu(currentGame, currentSystem, false, true) );
    form.appendChild( createSaveMenu(currentSave, currentSystem, currentGame, true) );
    form.appendChild( createButton( "Change Save", function() {
        if( !makingRequest ) {
            startRequest();
            var systemSelect = document.querySelector("#change-save-form #system-select");
            var gameSelect = document.querySelector("#change-save-form #game-select");
            var saveSelect = document.querySelector("#change-save-form #save-select");
            changeSave( systemSelect.options[systemSelect.selectedIndex].text, gameSelect.options[gameSelect.selectedIndex].text, saveSelect.options[saveSelect.selectedIndex].text );
        }
    } ) );
    launchModal( form );
}

/**
 * Display the menu to add a save.
 */
function displayAddSave() {
    var form = document.createElement("div");
    var currentSystem = document.querySelector(".system.selected").getAttribute("data-system");
    var currentGame = document.querySelector(".system.selected .game.selected").getAttribute("data-game");
    form.setAttribute("id", "add-save-form");
    form.appendChild( createFormTitle("Add Save") );
    form.appendChild( createSystemMenu( currentSystem, false, true ) );
    form.appendChild( createGameMenu(currentGame, currentSystem, false, true) );
    form.appendChild( createSaveInput(null, true) );
    form.appendChild( createButton( "Add Save", function() {
        if( !makingRequest ) {
            startRequest();
            var systemSelect = document.querySelector("#add-save-form #system-select");
            var gameSelect = document.querySelector("#add-save-form #game-select");
            var saveInput = document.querySelector("#add-save-form #save-input");
            addSave( systemSelect.options[systemSelect.selectedIndex].text, gameSelect.options[gameSelect.selectedIndex].text, saveInput.value );
        }
    } ) );
    launchModal( form );
}

/**
 * Display the menu to delete a game.
 */
function displayDeleteGame() {
    var form = document.createElement("div");
    var currentSystem = document.querySelector(".system.selected").getAttribute("data-system");
    var currentGame = document.querySelector(".system.selected .game.selected").getAttribute("data-game");
    form.setAttribute("id", "delete-game-form");
    form.appendChild( createFormTitle("Delete Game") );
    form.appendChild( createSystemMenu( currentSystem, false, true ) );
    form.appendChild( createGameMenu(currentGame, currentSystem, false, true) );
    form.appendChild( createButton( "Delete Game", function() {
        if( !makingRequest ) {
            startRequest();
            var systemSelect = document.querySelector("#delete-game-form #system-select");
            var gameSelect = document.querySelector("#delete-game-form #game-select");
            deleteGame( systemSelect.options[systemSelect.selectedIndex].text, gameSelect.options[gameSelect.selectedIndex].text );
        }
    } ) );
    //form.appendChild( createWarning("Are you sure you want to delete " + document.querySelector(".system.selected .game.selected").getAttribute("data-game") + " for " + document.querySelector(".system.selected").getAttribute("data-system") + "?") );
    //form.appendChild( createButton( "No" ) );
    //form.appendChild( createButton( "Yes" ) );
    launchModal( form );
}

/**
 * Display the menu to update a game.
 */
function displayUpdateGame() {
    var form = document.createElement("div");
    var currentSystem = document.querySelector(".system.selected").getAttribute("data-system");
    var currentGame = document.querySelector(".system.selected .game.selected").getAttribute("data-game");
    form.setAttribute("id", "update-game-form");
    form.appendChild( createFormTitle("Update Game") );
    form.appendChild( createSystemMenu( currentSystem, true, true ) );
    form.appendChild( createGameMenu( currentGame, currentSystem, true, true ) );
    form.appendChild( createWarning("If you do not wish to change a field, you may leave it blank.") );
    form.appendChild( createSystemMenu( currentSystem ) );
    form.appendChild( createGameInput() );
    form.appendChild( createRomFileInput() );
    form.appendChild( createButton( "Update Game", function() {
        if( !makingRequest ) {
            startRequest();
            var oldSystemSelect = document.querySelector("#update-game-form #old-system-select");
            var oldGameSelect = document.querySelector("#update-game-form #old-game-select");
            var systemSelect = document.querySelector("#update-game-form #system-select");
            var gameInput = document.querySelector("#update-game-form #game-input");
            var romFileInput = document.querySelector("#update-game-form #rom-file-input");

            if( romFileInput.files.length ) {
                getBase64( romFileInput.files[0], function(encoded) {
                    updateGame( oldSystemSelect.options[oldSystemSelect.selectedIndex].text, oldGameSelect.options[oldGameSelect.selectedIndex].text, systemSelect.options[systemSelect.selectedIndex].text, gameInput.value, {
                        "name": romFileInput.files[0].name,
                        "base64File": encoded
                    } );
                },
                function() {
                    alertError(ROM_READ_ERROR);
                    endRequest();
                } );
            }
            else {
                updateGame( oldSystemSelect.options[oldSystemSelect.selectedIndex].text, oldGameSelect.options[oldGameSelect.selectedIndex].text, systemSelect.options[systemSelect.selectedIndex].text, gameInput.value, null );
            }
        }
    } ) );
    launchModal( form );
}

/**
 * Display the menu to add a game.
 */
function displayAddGame() {
    var form = document.createElement("div");
    form.setAttribute("id", "add-game-form");
    form.appendChild( createFormTitle("Add Game") );
    form.appendChild( createSystemMenu( document.querySelector(".system.selected").getAttribute("data-system"), false, true ) );
    form.appendChild( createGameInput(null, true) );
    form.appendChild( createRomFileInput(true) );
    form.appendChild( createButton( "Add Game", function() {
        if( !makingRequest ) {
            startRequest();
            var systemSelect = document.querySelector("#add-game-form #system-select");
            var gameInput = document.querySelector("#add-game-form #game-input");
            var romFileInput = document.querySelector("#add-game-form #rom-file-input");
            getBase64( romFileInput.files[0], function(encoded) {
                addGame( systemSelect.options[systemSelect.selectedIndex].text, gameInput.value, {
                    "name": romFileInput.files[0].name,
                    "base64File": encoded
                } );
            },
            function() {
                alertError(ROM_READ_ERROR);
                endRequest();
            } );
        }
    } ) );
    launchModal( form );
}

/**
 * Create a select element containing systems.
 * @param {string} selected - the system selected by default
 * @param {boolean} old - true if the old system for chanding (changes the id)
 * @param {boolean} required - if the field is required
 * @returns {Element} - a select element containing the necessary keys
 */
function createSystemMenu( selected, old, required ) {
    return createMenu( selected, Object.keys(systemsDict), (old ? "old-" : "") + "system-select", (old ? "Current " : "") + "System: ", function() {
        var system = this.options[this.selectedIndex].text;
        var modal = document.querySelector(".modal");
        var gameSelect = modal.querySelector("#" + (old ? "old-" : "") + "game-select");
        if( gameSelect ) {
            var currentGame = document.querySelector(".system[data-system='"+system+"'] .game.selected").getAttribute("data-game");
            gameSelect.parentNode.replaceWith( createGameMenu( currentGame, system, old, gameSelect.hasAttribute("required") ) );
            var saveSelect = modal.querySelector("#save-select");
            if( saveSelect && !old ) {
                var currentSave = document.querySelector(".system[data-system='"+system+"'] .game.selected .current-save").innerText;
                saveSelect.parentNode.replaceWith( createSaveMenu( currentSave, system, currentGame, saveSelect.hasAttribute("required") ) );
            }
        }
    }, required );
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
 * @returns {Element} - a select element containing the necessary keys
 */
function createGameMenu( selected, system, old, required ) {
    return createMenu( selected, Object.keys(systemsDict[system].games), (old ? "old-" : "") + "game-select", (old ? "Current " : "") + "Game: ", function() {
        var game = this.options[this.selectedIndex].text;
        var modal = document.querySelector(".modal");
        var system = modal.querySelector("#system-select");
        var currentSystem = system.options[system.selectedIndex].text;
        var saveSelect = modal.querySelector("#save-select");
        if( saveSelect ) {
            var currentSave = document.querySelector(".system[data-system='"+currentSystem+"'] .game.selected .current-save").innerText;
            saveSelect.parentNode.replaceWith( createSaveMenu( currentSave, currentSystem, game, saveSelect.hasAttribute("required") ) );
        }
    }, required );
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
function createSaveMenu( selected, system, game, required ) {
    return createMenu( selected, Object.keys(systemsDict[system].games[game].saves), "save-select", "Save: ", null, required );
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
 * @param {function} onclick - the callback function to run on click
 */
function createButton( label, onclick ) {
    var button = document.createElement("button");
    button.innerText = label;
    button.onclick = onclick;
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
 */
function launchModal( element ) {
    if( !makingRequest ) {
        closeModal(); // Close any current modal
        var modal = document.createElement("div");
        modal.classList.add("modal");
        modal.appendChild(element);
        disableMenuControls = true;
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
 */
function closeModal() {
    if( !makingRequest ) {
        var modal = document.querySelector(".modal");
        if( modal ) {
            modal.classList.remove("modal-shown");
            document.body.classList.remove("modal-open");
            // set timeout to force draw prior
            setTimeout( function() { 
                if( modal ) {
                    modal.parentElement.removeChild(modal);
                    disableMenuControls = false;
                }
            }, 500 ); // Make sure this matches the transition time in the css
            document.body.onclick = null;
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
 */
function launchGame( system, game ) {
    if( !makingRequest ) {
        startRequest(); // Most other functions do this prior since they need to do other things
        makeRequest( "POST", "/launch", { "system": system, "game": game }, function( responseText ) {
            endRequest();
        }, function( responseText ) { standardFailure( responseText ) } );
    }
}

/**
 * Quit a game.
 */
function quitGame() {
    if( !makingRequest ) {
        startRequest(); // Most other functions do this prior since they need to do other things
        makeRequest( "POST", "/quit", {}, function( responseText ) {
            endRequest();
        }, function( responseText ) { standardFailure( responseText ) } );
    }
}

/**
 * Add a game.
 * @param {string} system - the system the game is on
 * @param {string} game - the name of the game
 * @param {object} file - an object containing two key/value pairs: name and base64file
 */
function addGame( system, game, file ) {
    makeRequest( "POST", "/game", { "system": system, "game": game, "file": file }, 
    function( responseText ) { standardSuccess(responseText, "Game successfully added") },
    function( responseText ) { standardFailure( responseText ) } );
}

/**
 * Update a game.
 * @param {string} oldSystem - the current system
 * @param {string} oldGame - the current game name
 * @param {string} system - the system the game is on
 * @param {string} game - the name of the game
 * @param {object} file - an object containing two key/value pairs: name and base64file
 */
function updateGame( oldSystem, oldGame, system, game, file ) {
    makeRequest( "PUT", "/game", { "oldSystem": oldSystem, "oldGame": oldGame, "system": system, "game": game, "file": file }, 
    function( responseText ) { standardSuccess(responseText, "Game successfully updated", oldGame, game) },
    function( responseText ) { standardFailure( responseText ) } );
}

/**
 * Delete a game.
 * @param {string} system - the system the game is on
 * @param {string} game - the name of the game
 */
function deleteGame( system, game ) {
    makeRequest( "DELETE", "/game", { "system": system, "game": game }, 
    function( responseText ) { standardSuccess(responseText, "Game successfully deleted", game, null) },
    function( responseText ) { standardFailure( responseText ) } );
}

/**
 * Add a save.
 * @param {string} system - the system the game is on
 * @param {string} game - the name of the game
 * @param {string} save - the name of the save to add
 */
function addSave( system, game, save ) {
    makeRequest( "POST", "/save", { "system": system, "game": game, "save": save }, 
    function( responseText ) { standardSuccess(responseText, "Save successfully added") },
    function( responseText ) { standardFailure( responseText ) } );
}

/**
 * Change the current save.
 * @param {string} system - the system the game is on
 * @param {string} game - the name of the game
 * @param {string} save - the name of the save to switch to
 */
function changeSave( system, game, save ) {
    makeRequest( "PUT", "/save", { "system": system, "game": game, "save": save }, 
    function( responseText ) { standardSuccess(responseText, "Save successfully changed") },
    function( responseText ) { standardFailure( responseText ) } );
}

/**
 * Delete a save.
 * @param {string} system - the system the game is on
 * @param {string} game - the name of the game
 * @param {string} save - the name of the save to delete
 */
function deleteSave( system, game, save ) {
    makeRequest( "DELETE", "/save", { "system": system, "game": game, "save": save }, 
    function( responseText ) { standardSuccess(responseText, "Save successfully deleted") },
    function( responseText ) { standardFailure( responseText ) } );
}

/**
 * Standard success function for a request
 * @param {string} responseText - the response from the server
 * @param {string} message - the message to display
 * @param {string} oldGameName - the name of the old game if the game changed
 * @param {string} newGameName - the name of the new game if the game changed
 */
function standardSuccess( responseText, message, oldGameName, newGameName ) {
    var response = JSON.parse(responseText);
    systemsDict = response.systems;
    redraw(oldGameName, newGameName);
    alertSuccess(message);
    endRequest();
    closeModal();
}

/**
 * Standard failure function for a request
 * @param {string} responseText - the response from the server
 * @param {string} message - the message to display
 */
function standardFailure( responseText ) {
    // No redraw since still in modal
    var message = "";
    try {
        message = JSON.parse(responseText).message;
    }
    catch(err) {}
    alertError(message); 
    endRequest();
}

/**
 * Start making a request.
 */
function startRequest() {
    makingRequest = true;
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

    if( type != "GET" && parameterKeys.length ) {
        xhttp.setRequestHeader("Content-type", "application/json");
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
        xhttp.send( JSON.stringify(parameters) );
    }
    else {
        xhttp.send();
    }
}

/**
 * Get the base64 version of a file
 * Taken from https://stackoverflow.com/questions/36280818/how-to-convert-file-to-base64-in-javascript
 * @param {*} file - the file to base64
 */
function getBase64(file, callback, errorCallback) {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
        var encoded = reader.result.replace(/^data:(.*,)?/, '');
        if ((encoded.length % 4) > 0) {
            encoded += '='.repeat(4 - (encoded.length % 4));
        }
        callback( encoded );
    };
    reader.onerror = function() { errorCallback() };
}