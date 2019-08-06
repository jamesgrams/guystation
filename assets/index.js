var systemsDict;

window.addEventListener('load', load );

function load() {
    makeRequest( "GET", "/data", {}, function(responseText) {
        updateSystemsDict(responseText);
        draw();
    }, load );
}

function updateSystemsDict(responseText) {
    systemsDict = JSON.parse(responseText);
}

function draw() {
    for(var i=0; i<Object.keys(systemsDict).length; i++) {
        console.log(systemsDict);
    }
}

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