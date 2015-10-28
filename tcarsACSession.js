// TODO: make another assignment-client that manages all sessions

const PORT = 18001;

// this has to match with the ACTION object in the participant script
const ACTION = {
    JOIN_REQUEST:           1,
    JOIN_REQUEST_ACCEPTED:  2,
    UPDATE:                 3,
    MESSAGE:                4,
    PLAYER_JOIN:            5,
    PLAYER_LEFT:            6,
    GAME_STATE:             7,
    SPECTATE:               8
    //START_HIDING:           7,
    //COUNTING:               8,
    //START_SEEKING:          9,
    //GAMEOVER:               10,
    //PING_PLAYER:            11,
    //FOUND:                  12
};

const GAME_STATE = {
    WAITING:            1,
    VOTE_TRACK:         2,
};

// The clients are stored in this object.
var clients = {};

// We add to this number when a new client connects.
var nextClientID = 0;

// Finds a client in the clients list by the WebSocket.
function findClientByWebSocket(socket) {
    for (client in clients) {
        if (clients[client].socket === socket) {
            return clients[client];
        }
    }
    return null;
}

function sendToAllActiveClients(data, exceptSocket) {
    var stringData = JSON.stringify(data);
    for (client in clients) {
        var clientObj = clients[client];
        if (clientObj.socket !== exceptSocket && clientObj.socket.readyState === clientObj.socket.OPEN) {
            clientObj.socket.send(stringData);
        }
    }
}

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
print("Hosting game on " + webSocketServer.url);

webSocketServer.newConnection.connect(function(newClient) {
    print("incomming connection");
    var newClientID = nextClientID++;
    clients[newClientID] = {socket: newClient, name: "Unknown", location: null, participating: false, found: false,
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
                    message: "found " + foundPlayer.name + " (" + hidersLeft + " hiders left)"
                }, newClient);

                if (hidersLeft <= 0) {
                    //sendToAllActiveClients({action: ACTION.MESSAGE, message: "GAME OVER, SEEKER WON!!!!"});
                    sendToAllActiveClients({action: ACTION.GAMEOVER, seekerWon: true});
                    gameOver();
                }
            }
        }*/
    };
    newClient.onclose = function(event) {
        //client = findClientByWebSocket(newClient);
        sendToAllActiveClients({action: ACTION.PLAYER_LEFT, id: newClientID}, newClient);
    };
    newClient.send(JSON.stringify({action: ACTION.JOIN_REQUEST, id: newClientID, players: getPlayersToObject()}));
});
const SCRIPTS_PATH = "https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/";

Script.include([
    SCRIPTS_PATH + "libraries/constants.js",
    SCRIPTS_PATH + "libraries/trackZone.js",
    SCRIPTS_PATH + "libraries/trackZoneManager.js",
    SCRIPTS_PATH + "libraries/tracks.js"
]);

const SESSION_AREA_SIZE = 2000; // size in square meters

var sessionArea = {center: {x: -8000, y: -8000, z: -8000}, dimensions: {x: SESSION_AREA_SIZE, y: SESSION_AREA_SIZE, z: SESSION_AREA_SIZE}};

//print("¡¡!¡!¡!¡!¡?¿?¿!¡!¡hello worldH");

var elementCount = 0;

vantagePoint = sessionArea.center;//Vec3.sum(sessionArea)

var req = new XMLHttpRequest();
req.open("GET", "https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/trackzones/spacetrack.json", false);
req.send();
//var lines = req.response.split("\n");

var testTrackJSON = req.response;

var trackZoneManager = new TrackZoneManager();
trackZoneManager.importTrack(vantagePoint, testTrackJSON);


//var y = 7910.02;
//var vantagePoint = {x: 8060.22, y: y, z: 7708.39}; //{x: 8000, y: 8000, z: 8000};
/*

function updateAvatarPos() {
    Avatar.position = EntityViewer.getPosition();
    Avatar.orientation = EntityViewer.getOrientation();
    //print(JSON.stringify(EntityViewer.getPosition()));
//    print("hifi://" + Avatar.position.x + "," + Avatar.position.y + "," + Avatar.position.z);
}

function setDisplayName(newDisplayName) {
    if (newDisplayName != Avatar.displayName) {
        Avatar.displayName = newDisplayName;
    }
}
*/
//Agent.isAvatar = true;//8060.22,7910.02,7708.39/0,0.678913,0,0.734219
//Avatar.scale = 1;// 75;
//Avatar.position = vantagePoint;

//for (i in Entities) { print(i); }
Entities.setPacketsPerSecond(2000);
EntityViewer.setPosition(vantagePoint);
EntityViewer.setOrientation(Quat.fromPitchYawRollDegrees(0, 90, 0));
EntityViewer.setKeyholeRadius(Vec3.distance(Vec3.multiply(sessionArea.dimensions, 0.5), {}));
//EntityViewer.getBoundaryLevelAdjust(20000);
EntityViewer.queryOctree();
//Avatar.displayName = "Bot initialized";


Entities.addingEntity.connect(function(EntityItemID) {
    if (EntityItemID == "{87387ebb-adb8-4f23-b6eb-3c65581bc936}") { 
        setDisplayName("FOUND!");
    }
    if (Entities.getEntityProperties(EntityItemID).name == "TrackingBox") {
        setDisplayName("TrackingBox found!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    }
    print("addingf: " + EntityItemID + " " + Entities.getEntityProperties(EntityItemID).name);
});

Entities.deletingEntity.connect(function(EntityItemID) {
    print("deleting: " + EntityItemID);
});
//for(i in Entities) { print(i) }
var i = 0;

function updating(deltaTime) {
 //   EntityViewer.setPosition({x: 8040.73046875, y: y, z: 7730.63916015625});
//    y -= deltaTime;
   // updateAvatarPos();
    EntityViewer.queryOctree();
   // entityID = Entities.findEntit (sessionArea.center, SESSION_AREA_SIZE);
   // if (entityID) {
   //     var props = Entities.getEntityProperties(entityID);
        //setDisplayName("nearby: " + props.name + " (" + Vec3.distance(Avatar.position, props.position) + "m)");
   // }
    var newCount = EntityViewer.getOctreeElementsCount();
    if (newCount !== elementCount) {
        elementCount = newCount;
        print("elementCount:" + elementCount);
    }
    //print(EntityViewer.getVoxelSizeScale() + " " + EntityViewer.getBoundaryLevelAdjust() + " " + EntityViewer.getMaxPacketsPerSecond());
}

Script.update.connect(updating);
