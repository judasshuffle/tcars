const LOBBY_WS_URL_REQUEST_CHANNEL = 'tcarsRequestLobbyWSURL';
const LOBBY_WS_URL_RESPONSE_CHANNEL = 'tcarsResponseLobbyWSURL';
const TCARS_RCON = 'tcarsRCON';

// Give max time of 5 seconds
const PING_TIMEOUT = 5000;

const SCRIPTS_PATH = 'http://hifi-external.s3.amazonaws.com/tcars/scripts/';

var lastPingRequest = null;
var lastPingResponse = null;
var currentSession = null;
var lobbySocket = null;

TRACK_SELECTION_TIME = 10; //seconds

Script.include([
    SCRIPTS_PATH + 'libraries/constants.js',
    SCRIPTS_PATH + 'libraries/trackZone.js',
    SCRIPTS_PATH + 'libraries/trackZoneManager.js',
    SCRIPTS_PATH + 'libraries/tracks.js',
    SCRIPTS_PATH + 'libraries/clientManager.js',
    SCRIPTS_PATH + 'libraries/session.js'
]);

Messages.subscribe(LOBBY_WS_URL_RESPONSE_CHANNEL);
Messages.subscribe(TCARS_RCON);

Messages.messageReceived.connect(function(channel, message, senderID) {
    if (channel === LOBBY_WS_URL_RESPONSE_CHANNEL) {
//        Messages.sendMessage(LOBBY_WS_URL_RESPONSE_CHANNEL, LOBBY_WS_URL);
        Messages.unsubscribe(LOBBY_WS_URL_RESPONSE_CHANNEL);

        lobbySocket = new WebSocket(message);

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

        Messages.sendMessage('TCarsDebug', 'Session started');
    } else if (channel === TCARS_RCON) {
        if (message === "stop") {
            Script.stop();
        }
    }
});

Messages.sendMessage(LOBBY_WS_URL_RESPONSE_CHANNEL, 'requestForSession');

var ping = 0;

var lobbyPingTimer = Script.setInterval(function() {
    Messages.sendMessage('TCarsDebug', 'session ping ' + (ping++));
    if (lobbySocket !== null && lobbySocket.readyState === lobbySocket.OPEN) {
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
}, PING_TIMEOUT);

Script.scriptEnding.connect(function() {
    print('Cleaning up session');
    if (currentSession !== null) {
        currentSession.cleanup();
    }
    if (lobbySocket !== null) {
        lobbySocket.close();
    }
});

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


