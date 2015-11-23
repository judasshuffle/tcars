const PORT = 18000;
const SESSION_PORTS_START = 18001;
const SESSION_PORTS_MAX_COUNT = 100;

Messages.sendMessage("TCarsDebug", "Lobby Started");

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

const SCRIPTS_PATH = 'http://hifi-external.s3.amazonaws.com/tcars/scripts/';

Script.include([
    SCRIPTS_PATH + 'libraries/constants.js',
    SCRIPTS_PATH + 'libraries/clientManager.js'
]);

function maxBlocksDimension(dimension) {
    return Math.floor(Math.abs(SESSION_AREA_START[dimension] - SESSION_AREA_END[dimension]) / SESSION_AREA_DIMENSIONS[dimension]);
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
                    z: Math.floor(Math.abs(SESSION_AREA_START.z - z) / SESSION_AREA_DIMENSIONS.z),
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
    for (var i = 0; i < SESSION_AREA_SAFEZONES.length; i++) {
        occupiedBlocks.push(getBlocksFromDimensions(SESSION_AREA_SAFEZONES[i]));
    }
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

function getFreeSessionPort() {
    var takenPorts = [];
    clientManager.doForAllClients(function(clientID, client) {
        if (client.sessionPort !== undefined) {
            takenPorts.push(client.sessionPort);
        }
    });
    var lastPort = SESSION_PORTS_START + SESSION_PORTS_MAX_COUNT;
    for (var i = SESSION_PORTS_START; i <= lastPort; i++) {
        if (takenPorts.indexOf(i) === -1) {
            return i;
        }
    }
    return -1;
}

var clientManager = new ClientManager(PORT);

clientManager.onClientConnect = function(clientID) {
    print('got client with id: ' + clientID);
};

clientManager.onClientDisconnect = function(clientID) {
    print('client disconnected with id: ' + clientID);
};

clientManager.onClientAction = function(clientID, action, data) {
    print('message from client with id: ' + clientID + ' action = ' + action);
    switch (action) {
        case LOBBY_ACTION.REGISTER_SESSION_REQUEST:
            var sessionPort = getFreeSessionPort();
            if (sessionPort !== -1) {
                // set session port if a free one was available
                clientManager.getClient(clientID).sessionPort = sessionPort;
            }
            var sessionBlock = getFreeSessionBlock();
            if (sessionBlock !== undefined) {
                // set session port if a free one was available
                clientManager.getClient(clientID).sessionBlock = sessionBlock;
            }
            var worldBlockCorner = Vec3.sum(Vec3.multiplyVbyV(sessionBlock, SESSION_AREA_DIMENSIONS), SESSION_AREA_START);
            var worldBlockCenter = Vec3.sum(worldBlockCorner, Vec3.multiply(SESSION_AREA_DIMENSIONS, 0.5));
            clientManager.send(clientID, {
                action: LOBBY_ACTION.REGISTER_SESSION_REPLY,
                port: sessionPort,
                block: {
                    center: worldBlockCenter,
                    dimensions: SESSION_AREA_DIMENSIONS
                }
            });
            break;
        case LOBBY_ACTION.SESSION_INFORMATION_UPDATE:
            var sessionClient = clientManager.getClient(clientID);
            sessionClient.sessionInfo = data.sessionInfo;
            break;
        case LOBBY_ACTION.PLAYER_SESSIONS_REQUEST:
            var sessions = [];
            clientManager.doForAllClients(function(clientID, client) {
                if (client.sessionPort !== undefined && client.sessionInfo !== undefined) {
                    sessions.push({
                        port: client.sessionPort,
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
            var sessionClient = clientManager.getClient(clientID);
            sessionClient.lastReceivedPing = Date.now();
            print('received ping from ' + clientID);
            clientManager.send(clientID, {action: LOBBY_ACTION.PONG});
            break;
    }
};


// Give max time of 10 seconds
const PING_TIMEOUT = 10000;

var cleanLobbySessions = function() {
    var deleteClientIDs = [];
    var now = Date.now();
    clientManager.doForAllClients(function(clientID, client) {
        if (client.sessionBlock !== undefined && (client.socket.readyState === client.socket.CLOSED || (client.lastReceivedPing + PING_TIMEOUT) < now)) {
            deleteClientIDs.push(clientID);
        }
    });

    for (var i = 0; i < deleteClientIDs.length; i++) {
        var deleteID = deleteClientIDs[i];
        print('removing session client with ID: ' + deleteID);
        clientManager.deleteClient(deleteID);
    }
};

var cleanLobbySessionsTimer = Script.setInterval(cleanLobbySessions, PING_TIMEOUT);
