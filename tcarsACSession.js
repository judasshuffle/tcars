const LOBBY_WS_URL = 'ws://no-ip.thoysvps.nl:18000';
const SCRIPTS_PATH = 'https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/';

const TRACK_SELECTION_TIME = 10; //seconds

Script.include([
    SCRIPTS_PATH + 'libraries/constants.js',
    SCRIPTS_PATH + 'libraries/trackZone.js',
    SCRIPTS_PATH + 'libraries/trackZoneManager.js',
    SCRIPTS_PATH + 'libraries/tracks.js',
    SCRIPTS_PATH + 'libraries/clientManager.js',
    SCRIPTS_PATH + 'libraries/session.js'
]);

// Give max time of 5 seconds
const PING_TIMEOUT = 5000;

var lastPingRequest = null;
var lastPingResponse = null;

var lobbySocket = new WebSocket(LOBBY_WS_URL);

var ping = 0;
var pingLobby = function() {
    print('ping: ' + (ping++));
    if (lobbySocket.readyState === lobbySocket.OPEN) {
        var now = Date.now();
        if (lastPingRequest !== null && (lastPingResponse === null || (lastPingResponse + PING_TIMEOUT) < now)) {
            print('ping timeout with lobby, aborting!');
            Script.stop();
            return;
        }
        lastPingRequest = now;
        lobbySocket.send(JSON.stringify({
            action: LOBBY_ACTION.PING
        }));
    }
};

var lobbyPingTimer = Script.setInterval(pingLobby, PING_TIMEOUT);

var currentSession = null;
/*
function startRace() {
    const SESSION_AREA_SIZE = 2000; // size in square meters

    var sessionArea = {center: {x: -8000, y: -8000, z: -8000}, dimensions: {x: SESSION_AREA_SIZE, y: SESSION_AREA_SIZE, z: SESSION_AREA_SIZE}};

    //print('¡¡!¡!¡!¡!¡?¿?¿!¡!¡hello worldH');

    var elementCount = 0;

    vantagePoint = sessionArea.center;//Vec3.sum(sessionArea)

    var req = new XMLHttpRequest();
    req.open('GET', 'https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/trackzones/spacetrack.json', false);
    req.send();
    //var lines = req.response.split('\n');

    var testTrackJSON = req.response;

    var trackZoneManager = new TrackZoneManager();
    trackZoneManager.importTrack(vantagePoint, testTrackJSON);

    //for (i in Entities) { print(i); }
    Entities.setPacketsPerSecond(2000);
    EntityViewer.setPosition(vantagePoint);
    EntityViewer.setOrientation(Quat.fromPitchYawRollDegrees(0, 90, 0));
    EntityViewer.setKeyholeRadius(Vec3.distance(Vec3.multiply(sessionArea.dimensions, 0.5), {}));
    //EntityViewer.getBoundaryLevelAdjust(20000);
    EntityViewer.queryOctree();
    //Avatar.displayName = 'Bot initialized';


    Entities.addingEntity.connect(function(EntityItemID) {
        if (EntityItemID == '{87387ebb-adb8-4f23-b6eb-3c65581bc936}') { 
            setDisplayName('FOUND!');
        }
        if (Entities.getEntityProperties(EntityItemID).name == 'TrackingBox') {
            setDisplayName('TrackingBox found!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        }
        print('addingf: ' + EntityItemID + ' ' + Entities.getEntityProperties(EntityItemID).name);
    });

    Entities.deletingEntity.connect(function(EntityItemID) {
        print('deleting: ' + EntityItemID);
    });
    //for(i in Entities) { print(i) }
    //var i = 0;
    //var elementCount = 0;
    function updating(deltaTime) {
     //   EntityViewer.setPosition({x: 8040.73046875, y: y, z: 7730.63916015625});
    //    y -= deltaTime;
       // updateAvatarPos();
        //EntityViewer.queryOctree();
       // entityID = Entities.findEntit (sessionArea.center, SESSION_AREA_SIZE);
       // if (entityID) {
       //     var props = Entities.getEntityProperties(entityID);
            //setDisplayName('nearby: ' + props.name + ' (' + Vec3.distance(Avatar.position, props.position) + 'm)');
       // }
        //var newCount = EntityViewer.getOctreeElementsCount();
        //if (newCount !== elementCount) {
        //    elementCount = newCount;
        //    print('elementCount:' + elementCount);
        //}
        //print(EntityViewer.getVoxelSizeScale() + ' ' + EntityViewer.getBoundaryLevelAdjust() + ' ' + EntityViewer.getMaxPacketsPerSecond());
    }

    Script.update.connect(updating);
}*/

lobbySocket.onopen = function(event) {
    lobbySocket.send(JSON.stringify({
        action: LOBBY_ACTION.REGISTER_SESSION_REQUEST
    }));
};

lobbySocket.onmessage = function(event) {
    var data = JSON.parse(event.data);
    switch (data.action) {
        case LOBBY_ACTION.REGISTER_SESSION_REPLY:
            currentSession = new Session(parseInt(data.port), data.block);
            break;
        case LOBBY_ACTION.PONG:
            lastPingResponse = Date.now();
            break;
    }
};


Script.scriptEnding.connect(function() {
    print('Cleaning up session');
    if (currentSession !== null) {
        currentSession.cleanup();
    }
    lobbySocket.close();
})

/*
function getPlayersToObject() {
    var players = {};
    for (client in clients) {
        var clientObj = clients[client];
        if (clientObj.participating && clientObj.socket.readyState === clientObj.socket.OPEN) {
            players[clientObj.id] = {id: clientObj.id, name: clientObj.name};
        }
    }
    return players;
}

// We start a WebSocketServer on the given port.
var webSocketServer = new WebSocketServer({port: PORT});

// Output the local URL in the console.
print('Hosting game on ' + webSocketServer.url);
*/

/*
webSocketServer.newConnection.connect(function(newClient) {
    print('incomming connection');
    var newClientID = nextClientID++;
    clients[newClientID] = {socket: newClient, name: 'Unknown', location: null, participating: false, found: false,
                            id: newClientID};

    newClient.onmessage = function(event) {
        var data = JSON.parse(event.data);
        switch (data.action) {
            case ACTION.JOIN_REQUEST_ACCEPTED:
                client = findClientByWebSocket(newClient);
                if (client) {
                    client.participating = true;
                    client.name = data.name;
                }
                sendToAllActiveClients({action: ACTION.PLAYER_JOIN, name: data.name, id: newClientID}, newClient);
                break;
            case ACTION.UPDATE:
                if (seeker !== -1) {
                    clients[seeker].socket.send(JSON.stringify({action: ACTION.UPDATE, position: data.position, id: newClientID}));
                }
                break;
        } /*else if (data.action === ACTION.FOUND) {
            client = findClientByWebSocket(newClient);
            if (seeker === client.id) {
                foundPlayer = clients[data.id];
                foundPlayer.found = true;
                var hidersLeft = getPlayersLeftToFind();
                sendToAllActiveClients({
                    action: ACTION.MESSAGE,
                    message: 'found ' + foundPlayer.name + ' (' + hidersLeft + ' hiders left)'
                }, newClient);

                if (hidersLeft <= 0) {
                    //sendToAllActiveClients({action: ACTION.MESSAGE, message: 'GAME OVER, SEEKER WON!!!!'});
                    sendToAllActiveClients({action: ACTION.GAMEOVER, seekerWon: true});
                    gameOver();
                }
            }
        }*//*
    };
    newClient.onclose = function(event) {
        //client = findClientByWebSocket(newClient);
        sendToAllActiveClients({action: ACTION.PLAYER_LEFT, id: newClientID}, newClient);
    };
    newClient.send(JSON.stringify({action: ACTION.JOIN_REQUEST, id: newClientID, players: getPlayersToObject()}));
});*/


