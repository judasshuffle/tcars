const PORT = 18000;

const LOBBY_ACTION = {
    REGISTER_SESSION_REQUEST:   1,
    REGISTER_SESSION_REPLY:     2,
    SESSION_INFORMATION_UPDATE: 3,
    PLAYER_SESSIONS_REQUEST:    4,
    PLAYER_SESSIONS_REPLY:      5
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
print("Hosting TCars lobby on " + webSocketServer.url);

webSocketServer.newConnection.connect(function(newClient) {
    print("incomming connection");
    var newClientID = nextClientID++;
    clients[newClientID] = {socket: newClient, name: "Unknown", id: newClientID};

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
