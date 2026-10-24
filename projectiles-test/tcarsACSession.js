// var LOBBY_WS_URL_REQUEST_CHANNEL = 'tcarsRequestLobbyWSURL';
// var LOBBY_WS_URL_RESPONSE_CHANNEL = 'tcarsResponseLobbyWSURL';

var constants = Script.require('./modules/constants.js');
var Client = Script.require('./modules/client.js').Client;
var Session = Script.require('./modules/session.js').Session;

var LOBBY_ACTION = constants.LOBBY_ACTION;

var TCARS_RCON = 'tcarsRCON';

// Give max time of 5 seconds
var PING_TIMEOUT = 5000;

var lastPingRequest = null;
var lastPingResponse = null;
var currentSession = null;

var hadFirstPingReply = false;


Script.include([
    'libraries/trackZone.js',
    'libraries/trackZoneManager.js',
    'libraries/tracks.js',
    'libraries/clientManager.js'
]);

// Messages.subscribe(LOBBY_WS_URL_RESPONSE_CHANNEL);
Messages.subscribe(TCARS_RCON);

var lobbyClient = new Client('tcarsLobby', Agent.sessionUUID);
lobbyClient.onActionReceived = function(senderID, action, data) {
    switch (data.action) {
        case LOBBY_ACTION.REGISTER_SESSION_REPLY:
            print('received session registering reply!!!');
            currentSession = new Session(lobbyClient, data.block);
            break;
        case LOBBY_ACTION.PONG:
            lastPingResponse = Date.now();
            if (!hadFirstPingReply) {
                lobbyClient.send({
                    action: LOBBY_ACTION.REGISTER_SESSION_REQUEST
                });
                hadFirstPingReply = true;
            }
            // print('last ping response ' + lastPingResponse);
            break;
        default:
            print('received unknown action ' + action + ' from ' + senderID + ' with data ' + JSON.stringify(data));
    }
};

Messages.messageReceived.connect(function(channel, message /* , senderID */) {
    /*
    if (channel === LOBBY_WS_URL_RESPONSE_CHANNEL) {
        // Messages.sendMessage(LOBBY_WS_URL_RESPONSE_CHANNEL, LOBBY_WS_URL);
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
    } else 
    */
    if (channel === TCARS_RCON) {
        if (message === "stop") {
            Script.stop();
        }
    }
});

// Messages.sendMessage(LOBBY_WS_URL_RESPONSE_CHANNEL, 'requestForSession');

var ping = 0;

var lobbyPingTimer = Script.setInterval(function() {
    // Messages.sendMessage('TCarsDebug', 'session ping ' + (ping++));
    // if (lobbySocket !== null && lobbySocket.readyState === lobbySocket.OPEN) {
    var now = Date.now();
    // print("now " + now);
    if (lastPingRequest !== null && (lastPingResponse === null || (lastPingResponse + PING_TIMEOUT) < now)) {
        print('ping timeout with lobby, aborting in 5 seconds.');
        Script.setTimeout(function() {
            Script.stop();
        }, 5000);
        return;
    }
    lastPingRequest = now;
    lobbyClient.send({
        action: LOBBY_ACTION.PING,
        number: ping++
    });
    // }
}, PING_TIMEOUT);

Script.scriptEnding.connect(function() {
    print('Cleaning up session');
    if (currentSession !== null) {
        currentSession.cleanup();
    }
    /*
    if (lobbySocket !== null) {
        lobbySocket.close();
    }
    */
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
});
*/
