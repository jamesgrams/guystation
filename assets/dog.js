// Dog functions

var frame = 1;
var dogMoveRate = 20;
var playTimeout;
// These need to match the css
var MENU_OPEN_TIME = 500;

// On resize take care of the dog position
window.onresize = function() {
    var functions = document.querySelector("#functions");
    if( functions && functions.classList.contains("open") ) {
        var playerWrapper = document.querySelector(".player-wrapper");
        var newRight = Math.floor(getFunctionsAddedPixels() + parseInt(playerWrapper.getAttribute("data-original-right").replace("px","")));        
        var playerRight = parseInt(playerWrapper.style.right.replace("px",""));
        if( playerRight != newRight ) {
            if( playerRight > newRight ) {
                playerWrapper.querySelector(".player").classList.add("player-flipped");
            }
            playerWrapper.style.right = newRight;
            clearTimeout(playTimeout);
            playTimeout = setTimeout(play, dogMoveRate);
            setTimeout( function() {
                clearTimeout(playTimeout);
                playTimeout = null;
                var player = document.querySelector(".player");
                player.innerHTML = "";
                drawDog(0,0,player);
                playerWrapper.querySelector(".player").classList.remove("player-flipped");
            }, MENU_OPEN_TIME ); // Make sure this matches the css
        }
    }
}

/**
 * Get the difference between the number of pixels between the left side of the functions menu
 * and the right side of the screen when the functions menu is open and when it is closed.
 */
function getFunctionsAddedPixels() {
    var functions = document.querySelector("#functions");
    var dummyFunctions = functions.cloneNode(true);
    dummyFunctions.classList.remove("open");
    //dummyFunctions.style.visible = false;
    document.body.appendChild(dummyFunctions);
    var addedPixelsFromOpeningFunctions = new WebKitCSSMatrix(window.getComputedStyle(dummyFunctions).getPropertyValue("transform")).m41;
    document.body.removeChild(dummyFunctions);
    return addedPixelsFromOpeningFunctions;
}

/**
 * Add the dog to the screen.
 */
function addDog() {
    container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    container.classList.add("player");
    var wrapper = document.createElement("div");
    wrapper.classList.add("player-wrapper");
    wrapper.appendChild(container);
    document.body.appendChild(wrapper);
    drawDog(0, 0, container);

    // When the dog is click
    wrapper.onclick = function(e) {
        if( !disableMenuControls ) {
            var functions = document.querySelector("#functions");
            var playerWrapper = document.querySelector(".player-wrapper");

            // If the menu is closed, open it
            if( !functions.classList.contains("open") ) {
                functions.classList.add("open");
                // New right is current right plus the number of pixels that will be added by the functions menu coming out (should be 98% of the element width)
                playerWrapper.setAttribute("data-original-right", window.getComputedStyle(playerWrapper).getPropertyValue("right"));
                playerWrapper.style.right = parseInt(window.getComputedStyle(playerWrapper).getPropertyValue("right").replace("px","")) + Math.floor(new WebKitCSSMatrix(window.getComputedStyle(functions).getPropertyValue("transform")).m41) + "px";
                playTimeout = setTimeout(play, dogMoveRate);
                setTimeout( function() {
                    clearTimeout(playTimeout);
                    playTimeout = null;
                    var player = document.querySelector(".player");
                    player.innerHTML = "";
                    drawDog(0,0,player);
                }, MENU_OPEN_TIME ); // Make sure this matches the css
            }
            // If the menu is open, close it
            else {
                playerWrapper.querySelector(".player").classList.add("player-flipped");
                functions.classList.remove("open");
                playerWrapper.style.right = playerWrapper.getAttribute("data-original-right");
                playTimeout = setTimeout(play, dogMoveRate);
                setTimeout( function() {
                    clearTimeout(playTimeout);
                    playTimeout = null;
                    var player = document.querySelector(".player");
                    player.innerHTML = "";
                    drawDog(0,0,player);
                    playerWrapper.querySelector(".player").classList.remove("player-flipped");
                }, MENU_OPEN_TIME ); // Make sure this matches the css
            }
            e.stopPropagation();

        }
    }
}

/**
 * Move the dog.
 */
function play() {
    var player = document.querySelector(".player");
    player.innerHTML = "";
    window["drawDogFrame" + frame](0, 0, player);
    if( frame == 8 ) {
        frame = 0;
    }
    frame++;
    
    playTimeout = setTimeout(play, dogMoveRate);
}

// The following functions have been taken from CocoaTown
// https://github.com/game103/cocoatown/blob/master/index.js

/**
 * Draw the dog (still)
 * @param {number} x - the x coordinate of the left side of the dog
 * @param {number} y - the y coordinate of the top of the dog
 * @param {HTMLElement} container - the svg container on which to draw
 */
function drawDog(x, y, container) {

    var legOffsets = [8, 46];
    for(var i=0; i<legOffsets.length; i++) {
        var legOffset = legOffsets[i];
        drawDogLeg(x, y, legOffset, container);
    }

    drawDogBody(container);

    var legOffsets = [0, 54];
    for(var i=0; i<legOffsets.length; i++) {
        var legOffset = legOffsets[i];
        drawDogLeg(x, y, legOffset, container);
    }
}

/**
 * Draw a dog leg
 * @param {number} x - the x coordinate of the left side of the DOG
 * @param {number} y - the y coordinate of the left side of the DOG
 * @param {number} legOffset - the x offset for this particular leg
 * @param {HTMLElement} container - the svg container on which to draw
 */
function drawDogLeg(x, y, legOffset, container) {
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = legOffset + x;
    d.push("M " + (17+legOffset) + " " + (y+27));
    d.push("C " + (12+legOffset) + " " + (y+40) + "," + (22+legOffset) + " " + (y+50) + "," + (15+legOffset) + " " + (y+54));
    d.push("C " + (15+legOffset) + " " + (y+54) + "," + (7+legOffset) + " " + (y+56) + "," + (15+legOffset) + " " + (y+60));
    d.push("C " + (15+legOffset) + " " + (y+60) + "," + (24+legOffset) + " " + (y+60) + "," + (23+legOffset) + " " + (y+55));
    d.push("C " + (23+legOffset) + " " + (y+45) + "," + (26+legOffset) + " " + (y+40) + "," + (25+legOffset) + " " + (y+25));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");
}

/**
 * Draw the body of the dog
 * Note: the body includes everything on the dog but the legs
 * @param {HTMLElement} container - the svg container on which to draw
 * @returns a group element containing the dog body
 */
function drawDogBody(container) {
    var bodyGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var x = 0;
    var y = 0;

    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    d.push("M " + (x+5) + " " + (y+10));
    d.push("C " + (x) + " " + (y+10) + "," + (x-5) + " " + (y) + "," + (x+5) + " " + y);
    d.push("C " + (x+5) + " " + (y) + "," + (x+10) + " " + (y) + "," + (x+10) + " " + (y-5));
    d.push("C " + (x+10) + " " + (y-5) + "," + (x+12) + " " + (y-10) + "," + (x+20) + " " + (y-10));
    d.push("C " + (x+20) + " " + (y-10) + "," + (x+34) + " " + (y-10) + "," + (x+32) + " " + (y+7));
    d.push("C " + (x+37) + " " + (y+20) + "," + (x+50) + " " + (y+10) + "," + (x+70) + " " + (y+15));
    d.push("C " + (x+80) + " " + (y+20) + "," + (x+85) + " " + (y+35) + "," + (x+70) + " " + (y+35));
    d.push("C " + (x+70) + " " + (y+35) + "," + (x+55) + " " + (y+40) + "," + (x+30) + " " + (y+35));
    d.push("C " + (x+5) + " " + (y+35) + "," + (x+28) + " " + (y+15) + "," + (x+5) + " " + (y+10));
    path.setAttribute("d", d.join(" "));
    bodyGroup.appendChild( path );
    path.classList.add("dog");

    drawCircle(x + 13, y-2, 1, bodyGroup);
    drawCircle(x+2, y+3, 3, bodyGroup);

    var ear = document.createElementNS("http://www.w3.org/2000/svg", "path");
    d = [];
    d.push("M " + (x+18) + " " + (y-5));
    d.push("C " + (x+22) + " " + (y+5) + "," + (x+22) + " " + (y+5) + "," + (x+26) + " " + (y-5));
    ear.setAttribute("d", d.join(" "));
    bodyGroup.appendChild( ear );
    ear.classList.add("dog");

    var tail = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    d.push("M " + (x+70) + " " + (y+15));
    d.push("C " + (x+70) + " " + (y+15) + "," + (x+78) + " " + (y+21) + "," + (x+96) + " " + (y+15));
    d.push("C " + (x+96) + " " + (y+15) + "," + (x+86) + " " + (y+22) + "," + (x+77) + " " + (y+21));
    tail.setAttribute("d", d.join(" "));
    bodyGroup.appendChild( tail );
    tail.classList.add("dog");

    // These are all for white space between the body and the tail.
    var cover = drawLine(x+76.3, y+20, x+76.3, y+24, bodyGroup);
    cover.classList.add("dog-cover");
    cover.setAttribute("stroke-width", "1.5");
    cover = drawLine(x+71.3, y+18.05, x+76.3, y+20, bodyGroup);
    cover.classList.add("dog-cover");
    cover.setAttribute("stroke-width", "2");

    container.appendChild(bodyGroup);
    bodyGroup.classList.add("dog-body");

    return bodyGroup;
}

/**
 * Draw the 1st frame of the running dog
 * @param {number} x - the x coordinate of the left side of the dog
 * @param {number} y - the y coordinate of the top of the dog
 * @param {HTMLElement} container - the svg container on which to draw
 */
function drawDogFrame1(x, y, container) {

    var rotationYModifier = -3;

    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+6;
    d.push("M " + (17+legOffset) + " " + (y+27));
    d.push("C " + (17+legOffset) + " " + (y+40) + "," + (31+legOffset) + " " + (y+50) + "," + (32+legOffset) + " " + (y+54));
    d.push("C " + (32+legOffset) + " " + (y+54) + "," + (22+legOffset) + " " + (y+62) + "," + (34+legOffset) + " " + (y+60));
    d.push("C " + (34+legOffset) + " " + (y+60) + "," + (35+legOffset) + " " + (y+60) + "," + (38+legOffset) + " " + (y+55));
    d.push("C " + (36+legOffset) + " " + (y+45) + "," + (31+legOffset) + " " + (y+45) + "," + (31+legOffset) + " " + (y+28));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y + rotationYModifier;

    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+45;
    d.push("M " + (17+legOffset) + " " + (y+27));
    d.push("C " + (17+legOffset) + " " + (y+32) + "," + (8+legOffset) + " " + (y+38) + "," + (25+legOffset) + " " + (y+44));
    d.push("C " + (25+legOffset) + " " + (y+44) + "," + (22+legOffset) + " " + (y+48) + "," + (20+legOffset) + " " + (y+50));
    d.push("C " + (20+legOffset) + " " + (y+50) + "," + (18+legOffset) + " " + (y+52) + "," + (22+legOffset) + " " + (y+54));
    d.push("C " + (22+legOffset) + " " + (y+56) + "," + (32+legOffset) + " " + (y+56) + "," + (26+legOffset) + " " + (y+50));
    d.push("C " + (27+legOffset) + " " + (y+48) + "," + (39+legOffset) + " " + (y+40) + "," + (27+legOffset) + " " + (y+27));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y - rotationYModifier;

    var body = drawDogBody(container);
    body.style.transform = "rotate(-6deg)";

    // Front
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x;
    d.push("M " + (19+legOffset) + " " + (y+27));
    d.push("C " + (19+legOffset) + " " + (y+40) + "," + (31+legOffset) + " " + (y+52) + "," + (32+legOffset) + " " + (y+54));
    d.push("C " + (32+legOffset) + " " + (y+54) + "," + (36+legOffset) + " " + (y+57) + "," + (40+legOffset) + " " + (y+55));
    d.push("C " + (41+legOffset) + " " + (y+53) + "," + (41+legOffset) + " " + (y+50.5) + "," + (36+legOffset) + " " + (y+50));
    d.push("C " + (36+legOffset) + " " + (y+50) + "," + (31+legOffset) + " " + (y+45) + "," + (29+legOffset) + " " + (y+28));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y + rotationYModifier;

    // Back
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x + 52;
    d.push("M " + (15+legOffset) + " " + (y+27));
    d.push("C " + (17+legOffset) + " " + (y+32) + "," + (8+legOffset) + " " + (y+38) + "," + (25+legOffset) + " " + (y+44));
    d.push("C " + (27+legOffset) + " " + (y+46) + "," + (22+legOffset) + " " + (y+53) + "," + (25+legOffset) + " " + (y+55));
    d.push("C " + (25+legOffset) + " " + (y+55) + "," + (25+legOffset) + " " + (y+55) + "," + (27+legOffset) + " " + (y+57));
    d.push("C " + (27+legOffset) + " " + (y+57) + "," + (33+legOffset) + " " + (y+57) + "," + (29+legOffset) + " " + (y+51));
    d.push("C " + (29+legOffset) + " " + (y+51) + "," + (34+legOffset) + " " + (y+40) + "," + (27+legOffset) + " " + (y+37));
    d.push("C " + (27+legOffset) + " " + (y+35.9) + "," + (25+legOffset) + " " + (y+40) + "," + (27+legOffset) + " " + (y+27));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y - rotationYModifier;
}

/**
 * Draw the 2nd frame of the running dog
 * @param {number} x - the x coordinate of the left side of the dog
 * @param {number} y - the y coordinate of the top of the dog
 * @param {HTMLElement} container - the svg container on which to draw
 */
function drawDogFrame2(x, y, container) {

    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+2.5;
    d.push("M " + (17+legOffset) + " " + (y+27));
    d.push("C " + (27+legOffset) + " " + (y+34) + "," + (22+legOffset) + " " + (y+44) + "," + (38+legOffset) + " " + (y+55));
    d.push("C " + (42+legOffset) + " " + (y+55) + "," + (42+legOffset) + " " + (y+50) + "," + (38+legOffset) + " " + (y+48));
    d.push("C " + (35+legOffset) + " " + (y+48) + "," + (28+legOffset) + " " + (y+32) + "," + (28+legOffset) + " " + (y+27));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+52;
    d.push("M " + (18+legOffset) + " " + (y+27));
    d.push("C " + (7+legOffset) + " " + (y+34) + "," + (9+legOffset) + " " + (y+44) + "," + (legOffset) + " " + (y+50));
    d.push("C " + (legOffset) + " " + (y+50) + "," + (-8+legOffset) + " " + (y+56) + "," + (legOffset) + " " + (y+56));
    d.push("C " + (legOffset) + " " + (y+58) + "," + (legOffset+27) + " " + (y+32) + "," + (22+legOffset) + " " + (y+24));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    drawDogBody(container);
    
    // Front
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x;
    d.push("M " + (17+legOffset) + " " + (y+27));
    d.push("C " + (17+legOffset) + " " + (y+32) + "," + (17+legOffset) + " " + (y+38) + "," + (22+legOffset) + " " + (y+44));
    d.push("C " + (23+legOffset) + " " + (y+44) + "," + (19+legOffset) + " " + (y+53) + "," + (22+legOffset) + " " + (y+55));
    d.push("C " + (22+legOffset) + " " + (y+55) + "," + (22+legOffset) + " " + (y+56) + "," + (27+legOffset) + " " + (y+56));
    d.push("C " + (27+legOffset) + " " + (y+56) + "," + (32+legOffset) + " " + (y+53) + "," + (26+legOffset) + " " + (y+51));
    d.push("C " + (26+legOffset) + " " + (y+51) + "," + (29+legOffset) + " " + (y+40) + "," + (28+legOffset) + " " + (y+37));
    d.push("C " + (27+legOffset) + " " + (y+37) + "," + (27+legOffset) + " " + (y+32) + "," + (28+legOffset) + " " + (y+28));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    // Back
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x + 52;
    d.push("M " + (17+legOffset) + " " + (y+27));
    d.push("C " + (17+legOffset) + " " + (y+32) + "," + (8+legOffset) + " " + (y+38) + "," + (17+legOffset) + " " + (y+44));
    d.push("C " + (17+legOffset) + " " + (y+44) + "," + (7+legOffset) + " " + (y+46) + "," + (7+legOffset) + " " + (y+46));
    d.push("C " + (legOffset) + " " + (y+46) + "," + (legOffset) + " " + (y+50) + "," + (7+legOffset) + " " + (y+51));
    d.push("C " + (7+legOffset) + " " + (y+51) + "," + (17+legOffset) + " " + (y+50) + "," + (27+legOffset) + " " + (y+46));
    d.push("C " + (28+legOffset) + " " + (y+45) + "," + (26+legOffset) + " " + (y+44) + "," + (25+legOffset) + " " + (y+43));
    d.push("C " + (23+legOffset) + " " + (y+37) + "," + (29+legOffset) + " " + (y+40) + "," + (27+legOffset) + " " + (y+27));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");
}

/**
 * Draw the 3rd frame of the running dog
 * @param {number} x - the x coordinate of the left side of the dog
 * @param {number} y - the y coordinate of the top of the dog
 * @param {HTMLElement} container - the svg container on which to draw
 */
function drawDogFrame3(x, y, container) {

    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+2.5;
    d.push("M " + (17+legOffset) + " " + (y+27));
    d.push("C " + (27+legOffset) + " " + (y+34) + "," + (20+legOffset) + " " + (y+52) + "," + (30+legOffset) + " " + (y+53));
    d.push("C " + (36+legOffset) + " " + (y+52) + "," + (33+legOffset) + " " + (y+48) + "," + (30+legOffset) + " " + (y+48));
    d.push("C " + (29+legOffset) + " " + (y+48) + "," + (26+legOffset) + " " + (y+32) + "," + (35+legOffset) + " " + (y+27));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+52;
    d.push("M " + (17+legOffset) + " " + (y+27));
    d.push("C " + (7+legOffset) + " " + (y+34) + "," + (9+legOffset) + " " + (y+44) + "," + (8+legOffset) + " " + (y+55));
    d.push("C " + (2+legOffset) + " " + (y+56) + "," + (2+legOffset) + " " + (y+62) + "," + (12+legOffset) + " " + (y+60));
    d.push("C " + (13+legOffset) + " " + (y+58) + "," + (legOffset+19) + " " + (y+32) + "," + (22+legOffset) + " " + (y+24));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    drawDogBody(container);
    
    // Front
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+4;
    d.push("M " + (17+legOffset) + " " + (y+25));
    d.push("C " + (15+legOffset) + " " + (y+32) + "," + (13+legOffset) + " " + (y+32) + "," + (17+legOffset) + " " + (y+40));
    d.push("C " + (17+legOffset) + " " + (y+44) + "," + (12+legOffset) + " " + (y+44) + "," + (10+legOffset) + " " + (y+46));
    d.push("C " + (8+legOffset) + " " + (y+48) + "," + (10+legOffset) + " " + (y+52) + "," + (10+legOffset) + " " + (y+52.5));
    d.push("C " + (11+legOffset) + " " + (y+54) + "," + (14+legOffset) + " " + (y+54) + "," + (15+legOffset) + " " + (y+49));
    d.push("C " + (15+legOffset) + " " + (y+49) + "," + (19+legOffset) + " " + (y+48) + "," + (24+legOffset) + " " + (y+42));
    d.push("C " + (25+legOffset) + " " + (y+42) + "," + (23+legOffset) + " " + (y+32) + "," + (27+legOffset) + " " + (y+27));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    // Back
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x + 52;
    d.push("M " + (17+legOffset) + " " + (y+27));
    d.push("C " + (17+legOffset) + " " + (y+32) + "," + (8+legOffset) + " " + (y+38) + "," + (17+legOffset) + " " + (y+44));
    d.push("C " + (17+legOffset) + " " + (y+45) + "," + (20+legOffset) + " " + (y+46) + "," + (17+legOffset) + " " + (y+47.5));
    d.push("C " + (15+legOffset) + " " + (y+49) + "," + (4+legOffset) + " " + (y+54) + "," + (8+legOffset) + " " + (y+58));
    d.push("C " + (8+legOffset) + " " + (y+58) + "," + (18+legOffset) + " " + (y+56) + "," + (26.5+legOffset) + " " + (y+46));
    d.push("C " + (26.5+legOffset) + " " + (y+46) + "," + (28+legOffset) + " " + (y+45) + "," + (26+legOffset) + " " + (y+43.5));
    d.push("C " + (23+legOffset) + " " + (y+37) + "," + (29+legOffset) + " " + (y+40) + "," + (27+legOffset) + " " + (y+27));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");
}

/**
 * Draw the 4th frame of the running dog
 * @param {number} x - the x coordinate of the left side of the dog
 * @param {number} y - the y coordinate of the top of the dog
 * @param {HTMLElement} container - the svg container on which to draw
 */
function drawDogFrame4(x, y, container) {

    var rotationYModifier = -2.5;
    y = y + rotationYModifier;

    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+10;
    d.push("M " + (19+legOffset) + " " + (y+25));
    d.push("C " + (15+legOffset) + " " + (y+30) + "," + (11+legOffset) + " " + (y+32) + "," + (17+legOffset) + " " + (y+40));
    d.push("C " + (18+legOffset) + " " + (y+42) + "," + (12+legOffset) + " " + (y+43) + "," + (8+legOffset) + " " + (y+45));
    d.push("C " + (6+legOffset) + " " + (y+47) + "," + (6+legOffset) + " " + (y+50) + "," + (9+legOffset) + " " + (y+53));
    d.push("C " + (10+legOffset) + " " + (y+53) + "," + (13+legOffset) + " " + (y+54) + "," + (12.5+legOffset) + " " + (y+49));
    d.push("C " + (13+legOffset) + " " + (y+48) + "," + (20+legOffset) + " " + (y+46) + "," + (22+legOffset) + " " + (y+43));
    d.push("C " + (24+legOffset) + " " + (y+40) + "," + (23+legOffset) + " " + (y+32) + "," + (24+legOffset) + " " + (y+29));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y - rotationYModifier;
    
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+57.5;//x+59;
    d.push("M " + (17+legOffset) + " " + (y+27));
    d.push("C " + (7+legOffset) + " " + (y+34) + "," + (10+legOffset) + " " + (y+38) + "," + (17+legOffset) + " " + (y+43));
    d.push("C " + (19+legOffset) + " " + (y+44) + "," + (26+legOffset) + " " + (y+55) + "," + (21+legOffset) + " " + (y+55.5));
    d.push("C " + (14+legOffset) + " " + (y+55.5) + "," + (19+legOffset) + " " + (y+61) + "," + (23+legOffset) + " " + (y+60));
    d.push("C " + (27+legOffset) + " " + (y+60) + "," + (30+legOffset) + " " + (y+58) + "," + (26+legOffset) + " " + (y+43));
    d.push("C " + (21+legOffset) + " " + (y+37) + "," + (23+legOffset) + " " + (y+30) + "," + (20+legOffset) + " " + (y+27));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    var body = drawDogBody(container);
    body.style.transform = "rotate(5deg)";
    
    y = y + rotationYModifier;

    // Front
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+2;
    d.push("M " + (19+legOffset) + " " + (y+25));
    d.push("C " + (15+legOffset) + " " + (y+30) + "," + (13.5+legOffset) + " " + (y+32) + "," + (17+legOffset) + " " + (y+40));
    d.push("C " + (19+legOffset) + " " + (y+42) + "," + (12+legOffset) + " " + (y+42) + "," + (6+legOffset) + " " + (y+43));
    d.push("C " + (4+legOffset) + " " + (y+44) + "," + (2+legOffset) + " " + (y+50) + "," + (4+legOffset) + " " + (y+51));
    d.push("C " + (4+legOffset) + " " + (y+51) + "," + (8+legOffset) + " " + (y+54) + "," + (9+legOffset) + " " + (y+48));
    d.push("C " + (15+legOffset) + " " + (y+46) + "," + (19+legOffset) + " " + (y+48) + "," + (24.5+legOffset) + " " + (y+42));
    d.push("C " + (28+legOffset) + " " + (y+40) + "," + (23+legOffset) + " " + (y+32) + "," + (28+legOffset) + " " + (y+29));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y - rotationYModifier;

    // Back
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+50.5;//x + 52;
    d.push("M " + (17+legOffset) + " " + (y+27));
    d.push("C " + (17+legOffset) + " " + (y+32) + "," + (8+legOffset) + " " + (y+38) + "," + (17+legOffset) + " " + (y+44));
    d.push("C " + (17+legOffset) + " " + (y+44) + "," + (20+legOffset) + " " + (y+46) + "," + (17+legOffset) + " " + (y+49));
    d.push("C " + (17+legOffset) + " " + (y+49) + "," + (13+legOffset) + " " + (y+55) + "," + (8+legOffset) + " " + (y+55));
    d.push("C " + (5+legOffset) + " " + (y+55) + "," + (2+legOffset) + " " + (y+60) + "," + (8+legOffset) + " " + (y+60));
    d.push("C " + (9+legOffset) + " " + (y+62) + "," + (32+legOffset) + " " + (y+49) + "," + (25+legOffset) + " " + (y+44));
    d.push("C " + (23+legOffset) + " " + (y+37) + "," + (29+legOffset) + " " + (y+40) + "," + (27.5+legOffset) + " " + (y+27));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");
}

/**
 * Draw the 5th frame of the running dog
 * @param {number} x - the x coordinate of the left side of the dog
 * @param {number} y - the y coordinate of the top of the dog
 * @param {HTMLElement} container - the svg container on which to draw
 */
function drawDogFrame5(x, y, container) {

    var rotationYModifier = -2.5;
    y = y + rotationYModifier;

    // This leg is somewhat fake
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+5;
    d.push("M " + (19+legOffset) + " " + (y+28));
    d.push("C " + (19+legOffset) + " " + (y+28) + "," + (-5+legOffset) + " " + (y+31) + "," + (-2+legOffset) + " " + (y+38));
    d.push("C " + (-2+legOffset) + " " + (y+38) + "," + (legOffset) + " " + (y+40) + "," + (19+legOffset) + " " + (y+31));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y - rotationYModifier;

    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+57.5;//x+59;
    d.push("M " + (17+legOffset) + " " + (y+27));
    d.push("C " + (7+legOffset) + " " + (y+34) + "," + (10+legOffset) + " " + (y+38) + "," + (17+legOffset) + " " + (y+43));
    d.push("C " + (19+legOffset) + " " + (y+44) + "," + (21+legOffset) + " " + (y+55) + "," + (23+legOffset) + " " + (y+55));
    d.push("C " + (25+legOffset) + " " + (y+56) + "," + (27+legOffset) + " " + (y+56) + "," + (28.5+legOffset) + " " + (y+55));
    d.push("C " + (31+legOffset) + " " + (y+54) + "," + (28.5+legOffset) + " " + (y+50) + "," + (26+legOffset) + " " + (y+50.5));
    d.push("C " + (25+legOffset) + " " + (y+50.5) + "," + (25+legOffset) + " " + (y+43) + "," + (23+legOffset) + " " + (y+41));
    d.push("C " + (23+legOffset) + " " + (y+41) + "," + (20+legOffset) + " " + (y+38) + "," + (20+legOffset) + " " + (y+27));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    var body = drawDogBody(container);
    body.style.transform = "rotate(5deg)";

    y = y + rotationYModifier;
    
    // Front
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+2;
    d.push("M " + (19+legOffset) + " " + (y+22));
    d.push("C " + (14+legOffset) + " " + (y+28) + "," + (21+legOffset) + " " + (y+37) + "," + (legOffset) + " " + (y+38));
    d.push("C " + (-1+legOffset) + " " + (y+34.5) + "," + (-5+legOffset) + " " + (y+32.5) + "," + (-5+legOffset) + " " + (y+39));
    d.push("C " + (-4.5+legOffset) + " " + (y+39) + "," + (-6+legOffset) + " " + (y+42) + "," + (legOffset) + " " + (y+43.5));
    d.push("C " + (31+legOffset) + " " + (y+40) + "," + (26+legOffset) + " " + (y+33) + "," + (29+legOffset) + " " + (y+26));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y - rotationYModifier;

    // Back
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+50.5;//x + 52;
    d.push("M " + (17+legOffset) + " " + (y+27));
    d.push("C " + (17+legOffset) + " " + (y+32) + "," + (8+legOffset) + " " + (y+38) + "," + (17+legOffset) + " " + (y+44));
    d.push("C " + (17+legOffset) + " " + (y+44) + "," + (18+legOffset) + " " + (y+46) + "," + (18+legOffset) + " " + (y+47));
    d.push("C " + (19+legOffset) + " " + (y+50) + "," + (21+legOffset) + " " + (y+53) + "," + (19.5+legOffset) + " " + (y+55));
    d.push("C " + (19.5+legOffset) + " " + (y+55) + "," + (11+legOffset) + " " + (y+56) + "," + (18+legOffset) + " " + (y+60));
    d.push("C " + (28+legOffset) + " " + (y+61) + "," + (24+legOffset) + " " + (y+46) + "," + (24+legOffset) + " " + (y+44));
    d.push("C " + (23+legOffset) + " " + (y+37) + "," + (29+legOffset) + " " + (y+40) + "," + (27.5+legOffset) + " " + (y+27));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");
}

/**
 * Draw the 6th frame of the running dog
 * @param {number} x - the x coordinate of the left side of the dog
 * @param {number} y - the y coordinate of the top of the dog
 * @param {HTMLElement} container - the svg container on which to draw
 */
function drawDogFrame6(x, y, container) {

    var rotationYModifier = -1.25;

    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+2.5;
    d.push("M " + (17+legOffset) + " " + (y+27));
    d.push("C " + (27+legOffset) + " " + (y+24) + "," + (20+legOffset) + " " + (y+22) + "," + (legOffset-1) + " " + (y+40.1));
    d.push("C " + (-3+legOffset) + " " + (y+40) + "," + (-5+legOffset) + " " + (y+38) + "," + (legOffset-6) + " " + (y+42));
    d.push("C " + (-3+legOffset) + " " + (y+49) + "," + (2+legOffset) + " " + (y+46) + "," + (legOffset+9.5) + " " + (y+39));
    d.push("C " + (12+legOffset) + " " + (y+36) + "," + (42+legOffset) + " " + (y+30) + "," + (42+legOffset) + " " + (y+30));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y + rotationYModifier;

    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+52;
    d.push("M " + (20+legOffset) + " " + (y+27));
    d.push("C " + (legOffset) + " " + (y+30) + "," + (35+legOffset) + " " + (y+25) + "," + (39.5+legOffset) + " " + (y+37));
    d.push("C " + (46+legOffset) + " " + (y+37) + "," + (44+legOffset) + " " + (y+41) + "," + (44+legOffset) + " " + (y+42));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y - rotationYModifier;

    var body = drawDogBody(container);
    body.style.transform = "rotate(-2.5deg)";
    
    // Front
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x;
    d.push("M " + (17+legOffset) + " " + (y+26));
    d.push("C " + (17+legOffset) + " " + (y+38) + "," + (30+legOffset) + " " + (y+39) + "," + (17+legOffset) + " " + (y+55));
    d.push("C " + (12+legOffset) + " " + (y+56) + "," + (12+legOffset) + " " + (y+60) + "," + (17+legOffset) + " " + (y+60));
    d.push("C " + (26+legOffset) + " " + (y+59) + "," + (27.5+legOffset) + " " + (y+46) + "," + (30+legOffset) + " " + (y+40));
    d.push("C " + (31+legOffset) + " " + (y+39) + "," + (27+legOffset) + " " + (y+30) + "," + (29+legOffset) + " " + (y+27))
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y + rotationYModifier;

    // Back
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x + 52;
    d.push("M " + (17+legOffset) + " " + (y+29));
    d.push("C " + (17+legOffset) + " " + (y+32) + "," + (12+legOffset) + " " + (y+38) + "," + (28+legOffset) + " " + (y+40));
    d.push("C " + (39+legOffset) + " " + (y+42) + "," + (38+legOffset) + " " + (y+49) + "," + (42+legOffset) + " " + (y+47));
    d.push("C " + (49+legOffset) + " " + (y+44) + "," + (48+legOffset) + " " + (y+40) + "," + (41+legOffset) + " " + (y+41));
    d.push("C " + (23+legOffset) + " " + (y+30) + "," + (29+legOffset) + " " + (y+25) + "," + (27+legOffset) + " " + (y+27));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y - rotationYModifier;
}

/**
 * Draw the 7th frame of the running dog
 * @param {number} x - the x coordinate of the left side of the dog
 * @param {number} y - the y coordinate of the top of the dog
 * @param {HTMLElement} container - the svg container on which to draw
 */
function drawDogFrame7(x, y, container) {

    var rotationYModifier = -4.25;

    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+2.5;
    d.push("M " + (17+legOffset) + " " + (y));
    d.push("C " + (22+legOffset) + " " + (y) + "," + (19+legOffset) + " " + (y+33.5) + "," + (legOffset+3) + " " + (y+44.3));
    d.push("C " + (1+legOffset) + " " + (y+43.5) + "," + (-5+legOffset) + " " + (y+44) + "," + (legOffset) + " " + (y+49));
    d.push("C " + (legOffset) + " " + (y+49) + "," + (5.5+legOffset) + " " + (y+53) + "," + (legOffset+14) + " " + (y+41));
    d.push("C " + (15+legOffset) + " " + (y+39) + "," + (35+legOffset) + " " + (y+30) + "," + (35+legOffset) + " " + (y+30));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y + rotationYModifier;

    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+48.5;
    d.push("M " + (14+legOffset) + " " + (y+24));
    d.push("C " + (17+legOffset) + " " + (y+29) + "," + (8+legOffset) + " " + (y+43) + "," + (25+legOffset) + " " + (y+40));
    d.push("C " + (27+legOffset) + " " + (y+43) + "," + (22+legOffset) + " " + (y+50) + "," + (25+legOffset) + " " + (y+51));
    d.push("C " + (25+legOffset) + " " + (y+51) + "," + (26+legOffset) + " " + (y+51.5) + "," + (27+legOffset) + " " + (y+51.5));
    d.push("C " + (32+legOffset) + " " + (y+52) + "," + (35+legOffset) + " " + (y+47.5) + "," + (29.5+legOffset) + " " + (y+46.5));
    d.push("C " + (29+legOffset) + " " + (y+48) + "," + (34+legOffset) + " " + (y+37) + "," + (27+legOffset) + " " + (y+34));
    d.push("C " + (27+legOffset) + " " + (y+32.9) + "," + (25+legOffset) + " " + (y+37) + "," + (27+legOffset) + " " + (y+24));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y - rotationYModifier;

    var body = drawDogBody(container);
    body.style.transform = "rotate(-8.5deg)";
    
    // Front
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+4;
    d.push("M " + (17+legOffset) + " " + (y+26));
    d.push("C " + (17+legOffset) + " " + (y+27) + "," + (13+legOffset) + " " + (y+33) + "," + (19+legOffset) + " " + (y+43));
    d.push("C " + (20+legOffset) + " " + (y+44) + "," + (24+legOffset) + " " + (y+50) + "," + (19+legOffset) + " " + (y+55));
    d.push("C " + (15+legOffset) + " " + (y+54) + "," + (11+legOffset) + " " + (y+60) + "," + (19+legOffset) + " " + (y+60));
    d.push("C " + (26+legOffset) + " " + (y+59) + "," + (31+legOffset) + " " + (y+46) + "," + (27+legOffset) + " " + (y+43));
    d.push("C " + (26+legOffset) + " " + (y+42) + "," + (25+legOffset) + " " + (y+36) + "," + (26+legOffset) + " " + (y+29));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y + rotationYModifier;

    // Back
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x + 52;
    d.push("M " + (14+legOffset) + " " + (y+27));
    d.push("C " + (17+legOffset) + " " + (y+32) + "," + (8+legOffset) + " " + (y+38) + "," + (25+legOffset) + " " + (y+43));
    d.push("C " + (27+legOffset) + " " + (y+46) + "," + (22+legOffset) + " " + (y+53) + "," + (25+legOffset) + " " + (y+54));
    d.push("C " + (25+legOffset) + " " + (y+54) + "," + (26+legOffset) + " " + (y+54.5) + "," + (27+legOffset) + " " + (y+54.5));
    d.push("C " + (32+legOffset) + " " + (y+55) + "," + (35+legOffset) + " " + (y+50.5) + "," + (29.5+legOffset) + " " + (y+49.5));
    d.push("C " + (29+legOffset) + " " + (y+51) + "," + (34+legOffset) + " " + (y+40) + "," + (27+legOffset) + " " + (y+37));
    d.push("C " + (27+legOffset) + " " + (y+35.9) + "," + (25+legOffset) + " " + (y+40) + "," + (27+legOffset) + " " + (y+26));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y - rotationYModifier;
}

/**
 * Draw the 8th frame of the running dog
 * @param {number} x - the x coordinate of the left side of the dog
 * @param {number} y - the y coordinate of the top of the dog
 * @param {HTMLElement} container - the svg container on which to draw
 */
function drawDogFrame8(x, y, container) {

    var rotationYModifier = -3;

    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x+2;
    d.push("M " + (17+legOffset) + " " + (y+26));
    d.push("C " + (17+legOffset) + " " + (y+27) + "," + (13+legOffset) + " " + (y+33) + "," + (19+legOffset) + " " + (y+43));
    d.push("C " + (20+legOffset) + " " + (y+44) + "," + (22+legOffset) + " " + (y+50) + "," + (19+legOffset) + " " + (y+55));
    d.push("C " + (15+legOffset) + " " + (y+54) + "," + (11+legOffset) + " " + (y+60) + "," + (19+legOffset) + " " + (y+60));
    d.push("C " + (26+legOffset) + " " + (y+59) + "," + (28+legOffset) + " " + (y+46) + "," + (27+legOffset) + " " + (y+43));
    d.push("C " + (26+legOffset) + " " + (y+42) + "," + (25+legOffset) + " " + (y+36) + "," + (26+legOffset) + " " + (y+29));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y + rotationYModifier;

    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x + 47;
    d.push("M " + (15+legOffset) + " " + (y+27));
    d.push("C " + (15+legOffset) + " " + (y+32) + "," + (8+legOffset) + " " + (y+39) + "," + (25+legOffset) + " " + (y+43));
    d.push("C " + (27+legOffset) + " " + (y+44) + "," + (22+legOffset) + " " + (y+46) + "," + (21+legOffset) + " " + (y+47));
    d.push("C " + (20+legOffset) + " " + (y+47.5) + "," + (23+legOffset) + " " + (y+53) + "," + (26+legOffset) + " " + (y+48));
    d.push("C " + (39+legOffset) + " " + (y+50) + "," + (30+legOffset) + " " + (y+42) + "," + (27+legOffset) + " " + (y+27));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y - rotationYModifier;

    var body = drawDogBody(container);
    body.style.transform = "rotate(-6deg)";
    
    // Front
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x;
    d.push("M " + (17+legOffset) + " " + (y+28));
    d.push("C " + (18+legOffset) + " " + (y+32) + "," + (23+legOffset) + " " + (y+39) + "," + (27+legOffset) + " " + (y+41));
    d.push("C " + (30+legOffset) + " " + (y+42) + "," + (33+legOffset) + " " + (y+41) + "," + (38+legOffset) + " " + (y+51));
    d.push("C " + (45+legOffset) + " " + (y+53) + "," + (47+legOffset) + " " + (y+44.5) + "," + (42+legOffset) + " " + (y+45.5));
    d.push("C " + (39+legOffset) + " " + (y+44) + "," + (39+legOffset) + " " + (y+38) + "," + (34.5+legOffset) + " " + (y+36.5));
    d.push("C " + (32+legOffset) + " " + (y+34) + "," + (32+legOffset) + " " + (y+31) + "," + (29+legOffset) + " " + (y+28));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y + rotationYModifier;

    // Back
    var leg = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = [];
    var legOffset = x + 52;
    d.push("M " + (15+legOffset) + " " + (y+27));
    d.push("C " + (15+legOffset) + " " + (y+32) + "," + (8+legOffset) + " " + (y+39) + "," + (25+legOffset) + " " + (y+43));
    d.push("C " + (27+legOffset) + " " + (y+44) + "," + (22+legOffset) + " " + (y+46) + "," + (19+legOffset) + " " + (y+48));
    d.push("C " + (17+legOffset) + " " + (y+49) + "," + (17+legOffset) + " " + (y+52) + "," + (20+legOffset) + " " + (y+54));
    d.push("C " + (20+legOffset) + " " + (y+54) + "," + (24+legOffset) + " " + (y+56) + "," + (23.5+legOffset) + " " + (y+51));
    d.push("C " + (26+legOffset) + " " + (y+50) + "," + (38+legOffset) + " " + (y+42) + "," + (27+legOffset) + " " + (y+37));
    d.push("C " + (27+legOffset) + " " + (y+35.9) + "," + (25+legOffset) + " " + (y+40) + "," + (27+legOffset) + " " + (y+27));
    leg.setAttribute("d", d.join(" "));
    container.appendChild( leg );
    leg.classList.add("dog");

    y = y - rotationYModifier;
}

/**
 * Draw a circle
 * @param {number} x - the x coordinate of the center of the circle
 * @param {number} y - the y coordinate of the center of the circle
 * @param {*} r - the radius of the circle
 * @param {HTMLElement} container - the svg container on which to draw
 * @returns the newly drawn circle
 */
function drawCircle( x, y, r, container ) {
    var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute( "cx", x );
    circle.setAttribute( "cy", y );
    circle.setAttribute( "r", r );
    container.appendChild( circle );
    return circle;
}

/**
 * Draw a line
 * @param {number} x1 - the x coordinate of the start of the line
 * @param {number} y1 - the y coordinate of the start of the line
 * @param {number} x2 - the x coordinate of the end of the line
 * @param {number} y2 - the y coordinate of the end of the line
 * @param {HTMLElement} container - the svg container on which to draw
 * @returns the newly drawn line
 */
function drawLine( x1, y1, x2, y2, container ) {
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute( "x1", x1 );
    line.setAttribute( "y1", y1 );
    line.setAttribute( "x2", x2 );
    line.setAttribute( "y2", y2 );
    container.appendChild( line );
    return line;
}