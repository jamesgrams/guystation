var messages = [];
var fetchedMessages = false;
var id;

self.addEventListener('message', function(event){
    var data = JSON.parse(event.data);
    id = data.id;
} );

self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    setInterval( syncMessages, 5000 );
});
  
self.addEventListener('activate', event => {
    console.log('Service Worker activating.');
});

self.addEventListener('fetch', event => {
    event.respondWith( fetch(event.request) );
});

/**
 * Display any new messages if needed.
 */
function syncMessages(){
    fetch( "//" + self.location.hostname + ":8080/message", {
        method: "get",
        credentials: "include"
    } )
    .then( function(response) {
            if( response.status != 200 ) return;
            response.json().then(
                function(response) {
                    if( JSON.stringify(messages) != JSON.stringify(response.messages) ) {

                        clients.matchAll({
                            type: 'window',
                            includeUncontrolled: true
                        })
                        .then(function(windowClients) {
                     
                            var clientIsVisible = false;
                     
                            for (var i = 0; i < windowClients.length; i++) {
                                const windowClient = windowClients[i];
                     
                                if (windowClient.visibilityState==="visible") {
                                    clientIsVisible = true;
                                    break;
                                }
                            }

                            if( !clientIsVisible && fetchedMessages ) {
                                var maxId = messages.length ? messages[messages.length-1].id : -1;
                                
                                var newMessages = [];
                                // determine the new messages
                                for( var i=response.messages.length-1; i>=0; i-- ) {
                                    if( response.messages[i].id > maxId ) {
                                        newMessages.push( response.messages[i] );
                                    }
                                    else{
                                        break;
                                    }
                                }
                                newMessages = newMessages.filter( el => el.user.id != id );
                                for( var i=0; i<newMessages.length; i++ ) {
                                    self.registration.showNotification( "GuyStation", {
                                        body: newMessages[i].user.name + ": " + newMessages[i].content,
                                        badge: "./icons/android-icon-96x96.png",
                                        icon: "./icons/android-icon-192x192.png"
                                    } );
                                }
                            }
                            messages = response.messages;
                            fetchedMessages = true;
                        });
            
                    }
                    else {
                        fetchedMessages = true;
                    }
                }
            )

        }
    );
}
