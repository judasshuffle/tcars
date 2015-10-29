const PORT = 18000;
const SESSION_PORTS_START = 18001;
const SESSION_PORTS_MAX_COUNT = 100;

const SCRIPTS_PATH = "https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/";

Script.include([
    SCRIPTS_PATH + "libraries/constants.js",
    SCRIPTS_PATH + "libraries/clientManager.js"
]);

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
    print("got client with id: " + clientID);
};

clientManager.onClientDisconnect = function(clientID) {
    print("client disconnected with id: " + clientID);
};

clientManager.onClientAction = function(clientID, action, data) {
    print("message from client with id: " + clientID + " action = " + action);
    switch (action) {
        case LOBBY_ACTION.REGISTER_SESSION_REQUEST:
            var sessionPort = getFreeSessionPort();
            if (sessionPort !== -1) {
                // set session port if a free one was available
                clientManager.getClient(clientID).sessionPort = getFreeSessionPort();
            }
            clientManager.send(clientID, {
                action: LOBBY_ACTION.REGISTER_SESSION_REPLY,
                port: getFreeSessionPort()
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
    }
};
