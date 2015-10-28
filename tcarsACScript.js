// TODO: make another assignment-client that manages all sessions

const PORT = 40105;

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

var testTrackJSON = req.response; //"{\"name\":\"space zone\",\"entities\":[{\"type\":\"Light\",\"dimensions\":{\"x\":300,\"y\":300,\"z\":300},\"rotation\":{\"x\":-0.0000152587890625,\"y\":-0.0000152587890625,\"z\":-0.0000152587890625,\"w\":1},\"userData\":\"\",\"name\":\"\",\"localPosition\":{\"x\":68.165771484375,\"y\":-75.216796875,\"z\":30.14013671875}},{\"type\":\"Light\",\"dimensions\":{\"x\":300,\"y\":300,\"z\":300},\"rotation\":{\"x\":-0.0000152587890625,\"y\":-0.0000152587890625,\"z\":-0.0000152587890625,\"w\":1},\"userData\":\"\",\"name\":\"\",\"localPosition\":{\"x\":1.01025390625,\"y\":-75.216796875,\"z\":40.308837890625}},{\"type\":\"Model\",\"dimensions\":{\"x\":327.0225830078125,\"y\":205.71221923828125,\"z\":312.3404846191406},\"rotation\":{\"x\":-0.0000152587890625,\"y\":-0.0000152587890625,\"z\":-0.0000152587890625,\"w\":1},\"userData\":\"{}\",\"name\":\"\",\"modelURL\":\"http://hifi-external.s3.amazonaws.com/tcars/models/tracks/Space/spacetrack.fbx\",\"shapeType\":\"compound\",\"compoundShapeURL\":\"http://hifi-external.s3.amazonaws.com/tcars/models/tracks/Space/tubecollision.obj\",\"localPosition\":{\"x\":5.006103515625,\"y\":-100.009765625,\"z\":6.899658203125}},{\"type\":\"Light\",\"dimensions\":{\"x\":13.680805206298828,\"y\":13.680805206298828,\"z\":40},\"rotation\":{\"x\":-0.038651108741760254,\"y\":0.7578088045120239,\"z\":0.049271345138549805,\"w\":0.6494392156600952},\"userData\":\"\",\"name\":\"\",\"localPosition\":{\"x\":-19.175048828125,\"y\":-88.7265625,\"z\":93.1845703125}},{\"type\":\"Light\",\"dimensions\":{\"x\":0.25,\"y\":0.25,\"z\":0.25},\"rotation\":{\"x\":-0.038651108741760254,\"y\":0.7578088045120239,\"z\":0.049271345138549805,\"w\":0.6494392156600952},\"userData\":\"\",\"name\":\"\",\"localPosition\":{\"x\":-19.175048828125,\"y\":-88.7265625,\"z\":93.1845703125}},{\"type\":\"Model\",\"dimensions\":{\"x\":3.0162997245788574,\"y\":2.4744372367858887,\"z\":5.443283557891846},\"rotation\":{\"x\":-0.0000152587890625,\"y\":-0.7071488499641418,\"z\":-0.0000152587890625,\"w\":0.7070878744125366},\"userData\":\"\",\"name\":\"\",\"modelURL\":\"http://hifi-external.s3.amazonaws.com/tcars/models/cars/spaceship.fbx?v37\",\"shapeType\":\"none\",\"compoundShapeURL\":\"\",\"localPosition\":{\"x\":0.997802734375,\"y\":-84.357421875,\"z\":96.674560546875}},{\"type\":\"Light\",\"dimensions\":{\"x\":0.25,\"y\":0.25,\"z\":0.25},\"rotation\":{\"x\":0.4773784875869751,\"y\":0.534904956817627,\"z\":-0.45067518949508667,\"w\":0.531822681427002},\"userData\":\"\",\"name\":\"\",\"localPosition\":{\"x\":4.084228515625,\"y\":-84.73828125,\"z\":93.841064453125}}],\"zoneProperties\":{\"type\":\"Zone\",\"rotation\":{\"x\":-0.0000152587890625,\"y\":-0.0000152587890625,\"z\":-0.0000152587890625,\"w\":1},\"userData\":\"{\\n    \\\"ProceduralEntity\\\": {\\n        \\\"shaderUrl\\\": \\\"http://hifi-external.s3.amazonaws.com/tcars/models/tracks/shaders/space.fs?v7\\\"\\n    },\\n    \\\"TCars\\\": {\\n            \\\"type\\\": \\\"track\\\"\\n     }\\n}\",\"name\":\"space zone\",\"shapeType\":\"box\",\"keyLightColor\":{\"red\":255,\"green\":255,\"blue\":255},\"keyLightIntensity\":1,\"keyLightDirection\":{\"x\":0,\"y\":-1,\"z\":0},\"backgroundMode\":\"skybox\",\"stage\":{\"sunModelEnabled\":0,\"latitude\":37.777000427246094,\"longitude\":122.40699768066406,\"altitude\":0.029999999329447746,\"day\":60,\"hour\":12,\"automaticHourDay\":0}}}";

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
