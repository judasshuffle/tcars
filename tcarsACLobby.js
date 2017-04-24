//const LOBBY_WS_URL = 'ws://54.176.3.23:18000';
//const LOBBY_WS_URL_REQUEST_CHANNEL = 'tcarsRequestLobbyWSURL';
//const LOBBY_WS_URL_RESPONSE_CHANNEL = 'tcarsResponseLobbyWSURL';
//const PORT = 18000;
//const SESSION_PORTS_START = 18001;
//const SESSION_PORTS_MAX_COUNT = 100;

// Allow to run the lobby through Interface for testing purposes
const LOCAL_RUN = this.MyAvatar !== undefined;

const SCRIPTS_PATH = 'http://hifi-external.s3.amazonaws.com/tcars/scripts/';
//'https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/';
//'http://hifi-external.s3.amazonaws.com/tcars/scripts/';
const LOBBY_ENTITIES_PATH = SCRIPTS_PATH + 'entities/lobby.svo.json';
const LOBBY_POSITION = {x: 0, y: 0, z: 0};
const TCARS_RCON = 'tcarsRCON';

var scriptIncludePath = LOCAL_RUN ? '' : SCRIPTS_PATH;
Script.include([
    scriptIncludePath + 'libraries/constants.js',
    scriptIncludePath + 'libraries/clientManager.js'
]);

const DEBUG_OVER_MESSAGES_PROTOCOL = false;

var startupDate = (new Date());
var timeZoneOffset = startupDate.getTimezoneOffset() * 60 * 1000;
var startupTimestamp = startupDate.getTime();

var getMillisecondsFromTime = function(dateString) {
    return (new Date(dateString.slice(0, -1).replace('-', '/').replace('-', '/').replace('T', ' ')).getTime());
};

print('start time = ' + startupTimestamp);

//Entities.setPacketsPerSecond(2000);
Agent.isAvatar = true;
if (!LOCAL_RUN) {
    EntityViewer.setPosition(LOBBY_POSITION);
    EntityViewer.setOrientation(Quat.fromPitchYawRollDegrees(0, 90, 0));
    EntityViewer.setCenterRadius(60000);
    EntityViewer.setVoxelSizeScale(Number.MAX_VALUE);
}
//EntityViewer.queryOctree();

//Messages.subscribe(LOBBY_WS_URL_REQUEST_CHANNEL);

//Messages.messageReceived.connect(function (channel, message, senderID) {
//    if (channel === LOBBY_WS_URL_REQUEST_CHANNEL) {
//        Messages.sendMessage(LOBBY_WS_URL_RESPONSE_CHANNEL, LOBBY_WS_URL);
//    }
//});

Messages.subscribe(TCARS_RCON);

Messages.messageReceived.connect(function(channel, message/*, senderID*/) {
    if (channel === TCARS_RCON) {
        if (message === 'stop') {
            Script.stop();
        }
    }
});

var debugPrint = function(message) {
    var preText = '[TCarsLobby] > ';
    if (DEBUG_OVER_MESSAGES_PROTOCOL) {
        Messages.sendMessage('TCarsDebug', preText + message);
        return;
    }
    print(preText + message);
};

Script.setTimeout(function() {
    debugPrint('Lobby Started, sent after 5 seconds.');
    setupLobbyEntities();
}, 5000);

const SESSION_AREA_START = {
    x: -16000,
    y: -16000,
    z: -16000
};

const SESSION_AREA_END = {
    x: 16000,
    y: 16000,
    z: 16000
};

const SESSION_AREA_SIZE = 2000; 

const SESSION_AREA_SAFEZONES = [
    {
        start: {x: -SESSION_AREA_SIZE, y: -SESSION_AREA_SIZE, z: -SESSION_AREA_SIZE},
        end: {x: SESSION_AREA_SIZE, y: SESSION_AREA_SIZE, z: SESSION_AREA_SIZE}
    }
];

const SESSION_AREA_DIMENSIONS = {
    x: SESSION_AREA_SIZE,
    y: SESSION_AREA_SIZE,
    z: SESSION_AREA_SIZE
};

function setupLobbyEntities() {
    try {
        var webRequest = new XMLHttpRequest();
        webRequest.open('GET', LOBBY_ENTITIES_PATH, false);
        webRequest.send();
        var lobbyEntityData = JSON.parse(webRequest.response.toString());
        var entities = lobbyEntityData.Entities;
        for (var i = 0; i < entities.length; i++) {
            Entities.addEntity(entities[i]);
        }
    } catch (e) {
        debugPrint('Error: ' + JSON.stringify(e));
    }
}

function maxBlocksDimension(dimension) {
    return Math.floor(Math.abs(SESSION_AREA_START[dimension] - SESSION_AREA_END[dimension]) /
        SESSION_AREA_DIMENSIONS[dimension]);
}

// get blocks positions from specific dimensions
function getBlocksFromDimensions(area) {
    var blocks = [];
    for (var x = area.start.x; x < area.end.x; x += SESSION_AREA_DIMENSIONS.x) {
        for (var y = area.start.y; y < area.end.y; y += SESSION_AREA_DIMENSIONS.y) {
            for (var z = area.start.z; z < area.end.z; z += SESSION_AREA_DIMENSIONS.z) {
                blocks.push({
                    x: Math.floor(Math.abs(SESSION_AREA_START.x - x) / SESSION_AREA_DIMENSIONS.x),
                    y: Math.floor(Math.abs(SESSION_AREA_START.y - y) / SESSION_AREA_DIMENSIONS.y),
                    z: Math.floor(Math.abs(SESSION_AREA_START.z - z) / SESSION_AREA_DIMENSIONS.z)
                });
            }
        }
    }
    return blocks;
}

function getFreeSessionBlock() {
    var maxX = maxBlocksDimension('x');
    var maxY = maxBlocksDimension('y');
    var maxZ = maxBlocksDimension('z');
    var occupiedBlocks = [];
    SESSION_AREA_SAFEZONES.forEach(function(sessionAreaSafeZone) {
        occupiedBlocks.push(getBlocksFromDimensions(sessionAreaSafeZone));
    });
    clientManager.doForAllClients(function(clientID, client) {
        if (client.sessionBlock !== undefined) {
            occupiedBlocks.push(client.sessionBlock);
        }
    });

    var bestPosition = undefined;
    var bestDistance = 0;
    for (var x = 0; x < maxX; x++) {
        for (var y = 0; y < maxY; y++) {
            for (var z = 0; z < maxZ; z++) {
                var closestDistance = Number.MAX_VALUE;
                for (var i = 0; i < occupiedBlocks.length; i++) {
                    var blockDistance = Vec3.distance({x: x, y: y, z: z}, occupiedBlocks[i]);
                    if (blockDistance < closestDistance) {
                        closestDistance = blockDistance;
                    }
                }
                if (bestDistance < closestDistance) {
                    bestDistance = closestDistance;
                    bestPosition = {x: x, y: y, z: z};
                }
            }
        }
    }
    return bestPosition;
}

var checkForEntities = function() {
    // clear old entities
    if (!LOCAL_RUN) {
        EntityViewer.queryOctree();
    }
    var foundEntities = 0;
    var entities = Entities.findEntities(LOBBY_POSITION, 60000);
    entities.forEach(function (entity) {
        var entityProperties = Entities.getEntityProperties(entity, ['created', 'locked']);
        var entityCreationTimeStamp = getMillisecondsFromTime(entityProperties.created);
        //var entityCreationTimeStamp = (new Date(entityProperties.created.slice(0, -1).replace('-', '/').replace('-', '/').replace('T', ' ')).getTime()) - timeZoneOffset;
        //   print(entityProperties.created + ' ' + entityCreationTimeStamp);
        if (startupTimestamp > entityCreationTimeStamp) {
            foundEntities++;
            if (entityProperties.locked) {
                Entities.editEntity(entity, {locked: false});
            }
            Entities.deleteEntity(entity);
        }
    });
    //
    if (foundEntities > 0) {
        print('startup timestamp:\n' + startupDate + ' ' + startupTimestamp + ' ' + startupDate.toUTCString() + ' ' + timeZoneOffset);
        print("found entities: " + foundEntities);
    }// else {
    //    print("found no entities" + entities.length);
    //}
};

var initialized = false;

var updateTimer;

function update(/*deltaTime*/) {
    if (!initialized) {
        if (Entities.serversExist() && Entities.canRez()) {
            print('initialized');
            Entities.setPacketsPerSecond(6000);
           // deleteBoxes()
            initialized = true;
            //Script.update.disconnect(update);
            //Script.clearInterval(updateTimer);
        }
        return;
    }
    checkForEntities();
}

//Script.update.connect(update);

updateTimer = Script.setInterval(update, 1000 / 60);

var clientManager = new ClientManager(TCARS_LOBBY_CHANNEL);

clientManager.onClientConnect = function(clientID) {
    debugPrint('got client with id: ' + clientID);
};

clientManager.onClientDisconnect = function(clientID) {
    debugPrint('client disconnected with id: ' + clientID);
};

clientManager.onClientAction = function(clientID, action, data) {

    switch (action) {
        case LOBBY_ACTION.REGISTER_SESSION_REQUEST:
            var sessionBlock = getFreeSessionBlock();
            if (sessionBlock !== undefined) {
                // set session port if a free one was available
                clientManager.getClient(clientID).sessionBlock = sessionBlock;
            }
            var worldBlockCorner = Vec3.sum(Vec3.multiplyVbyV(sessionBlock, SESSION_AREA_DIMENSIONS), SESSION_AREA_START);
            var worldBlockCenter = Vec3.sum(worldBlockCorner, Vec3.multiply(SESSION_AREA_DIMENSIONS, 0.5));
            clientManager.send(clientID, {
                action: LOBBY_ACTION.REGISTER_SESSION_REPLY,
                block: {
                    center: worldBlockCenter,
                    dimensions: SESSION_AREA_DIMENSIONS
                }
            });
            break;
        case LOBBY_ACTION.SESSION_INFORMATION_UPDATE:
            print("sessionInfoUpdate");
            clientManager.getClient(clientID).sessionInfo = data.sessionInfo;
            break;
        case LOBBY_ACTION.PLAYER_SESSIONS_REQUEST:
            var sessions = [];
            clientManager.doForAllClients(function(clientID, client) {
                if (client.sessionInfo !== undefined) {
                    sessions.push({
                        uuid: clientID,
                        info: client.sessionInfo
                    });
                }
            });
            clientManager.send(clientID, {
                action: LOBBY_ACTION.PLAYER_SESSIONS_REPLY,
                sessions: sessions
            });
            break;
        case LOBBY_ACTION.PING:
            clientManager.getClient(clientID).lastReceivedPing = Date.now();
            debugPrint('received ping from ' + clientID);
            clientManager.send(clientID, {action: LOBBY_ACTION.PONG});
            break;
        default:
            debugPrint('unknown message from client with id: ' + clientID + ' action = ' + action);
    }
};

// Give max time of 10 seconds
const PING_TIMEOUT = 10000;

var cleanLobbySessions = function() {
    var deleteClientIDs = [];
    var now = Date.now();
    clientManager.doForAllClients(function(clientID, client) {
        if (client.sessionBlock !== undefined && (client.lastReceivedPing + PING_TIMEOUT) < now) {
            print(client.lastReceivedPing);
            deleteClientIDs.push(clientID);
        }
    });

    for (var deleteClientIndex = 0; deleteClientIndex < deleteClientIDs.length; deleteClientIndex++) {
        var deleteID = deleteClientIDs[deleteClientIndex];
        debugPrint('removing session client with ID: ' + deleteID);
        clientManager.deleteClient(deleteID);
    }
};
EntityCleaner = function() {
    var _this = this;

    _this.init = function() {

    };

    _this.checkForOldEntities = function() {

    };

    _this.cleanup = function() {

    };

    _this.init();
};

var cleanLobbySessionsTimer = Script.setInterval(cleanLobbySessions, PING_TIMEOUT);
