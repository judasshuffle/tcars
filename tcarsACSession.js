const LOBBY_WS_URL = "ws://no-ip.thoysvps.nl:18000";
const SCRIPTS_PATH = "https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/";

const TRACK_SELECTION_TIME = 10; //seconds

Script.include([
    SCRIPTS_PATH + "libraries/constants.js",
    SCRIPTS_PATH + "libraries/trackZone.js",
    SCRIPTS_PATH + "libraries/trackZoneManager.js",
    SCRIPTS_PATH + "libraries/tracks.js",
    SCRIPTS_PATH + "libraries/clientManager.js"
]);

var lobbySocket = new WebSocket(LOBBY_WS_URL);
/*
function startRace() {
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
            //setDisplayName("nearby: " + props.name + " (" + Vec3.distance(Avatar.position, props.position) + "m)");
       // }
        //var newCount = EntityViewer.getOctreeElementsCount();
        //if (newCount !== elementCount) {
        //    elementCount = newCount;
        //    print("elementCount:" + elementCount);
        //}
        //print(EntityViewer.getVoxelSizeScale() + " " + EntityViewer.getBoundaryLevelAdjust() + " " + EntityViewer.getMaxPacketsPerSecond());
    }

    Script.update.connect(updating);
}*/


var Session = function(port, block) {
    var _this = this;

    var block = block;
    var state = SESSION_STATE.INITIAL;
    var trackID = -1;
    var track = null;

    var clientManager = new ClientManager(port);

    var timeLeft = Number.MAX_VALUE;

    var getWinningTrackVote = function() {
        var trackVotes = {};
        clientManager.doForAllClients(function(clientID, client) {
            if (client.trackVote !== undefined) {
                if (trackVotes[client.trackVotes] === undefined) {
                    trackVotes[client.trackVotes] = 0;
                }
                trackVotes[client.trackVotes]++;
            }
        });
        var maxVoteNum = 0;
        var selectedTrackID = -1;
        for (var trackID in trackVotes) {
            if (trackVotes[trackID] > maxVoteNum) {
                maxVoteNum = trackVotes;
                selectedTrackID = trackID;
            }
        }
        return selectedTrackID;
    };

    var updateTrackInfo = function() {
        if (trackID === -1) {
            track = null;
            return;
        }
        var req = new XMLHttpRequest();
        req.open("GET", TRACK_ZONE_FOLDER_URL + TRACKS[trackID].trackJSON, false);
        req.send();
        track = req.response;
    };

    var numParticipantRole = function(role) {
        var roleParticipantCount = 0;
        clientManager.doForAllClients(function(clientID, client) {
            if (client.role === role) {
                roleParticipantCount++;
            }
        });
        return roleParticipantCount;
    };

    var numPlayers = function() {
        return numParticipantRole(ROLE.PLAYER);
    };

    var numSpectators = function() {
        return numParticipantRole(ROLE.SPECTATOR);
    };

    var setupTrack = function() {
        var trackZoneManager = new TrackZoneManager();
        trackZoneManager.importTrack(block.center, track);
        Entities.setPacketsPerSecond(2000);
        EntityViewer.setPosition(block.center);
        EntityViewer.setOrientation(Quat.fromPitchYawRollDegrees(0, 90, 0));
        EntityViewer.setKeyholeRadius(Vec3.distance(Vec3.multiply(block.dimensions, 0.5), {}));
        EntityViewer.queryOctree();
    };

    _this.sendSessionInfo = function() {
        lobbySocket.send(JSON.stringify({
            action: LOBBY_ACTION.SESSION_INFORMATION_UPDATE,
            sessionInfo: {
                state: state,
                trackID: trackID,
                players: numPlayers(),
                spectators: numSpectators()
            }
        }));
    };

    clientManager.onClientConnect = function(clientID) {
        print("got client with id: " + clientID);

        // inform the lobby that a player joined
        _this.sendSessionInfo();
    };

    clientManager.onClientDisconnect = function(clientID) {
        print("client disconnected with id: " + clientID);
    };

    clientManager.onClientAction = function(clientID, action, data) {
        print("message from client with id: " + clientID + " action = " + action);
        switch (action) {
            case SESSION_ACTION.JOIN_REQUEST:
                var sessionClient = clientManager.getClient(clientID);
                // ROLE.* PLAYER OR SPECTATOR
                sessionClient.role = data.role;
                _this.sendSessionInfo();
                break;
            case SESSION_ACTION.VOTE:
                if (state === SESSION_STATE.INITIAL) {
                    state = SESSION_STATE.VOTE_TRACK;
                    timeleft = TRACK_SELECTION_TIME;
                }
                var sessionClient = clientManager.getClient(clientID);
                sessionClient.trackVote = vote;
                break;
            case SESSION_ACTION.UPDATE:

                // Get player updates here?
                break;
        }
    };

    var gameTimer = Script.setInterval(function() {
       // if (timeLeft !== lastTime) {
       //     lastTime = timeLeft;
       //     sendToAllActiveClients({action: ACTION.COUNTING, timeleft: timeLeft});
       // }
        print("state: " + state + " TimeLeft: " + timeLeft);
        if (state === SESSION_STATE.VOTE_TRACK) {
            if (timeLeft <= 0) {
                trackID = getWinningTrackVote();
                state = SESSION_STATE.LOADING;
               // gameState = GAME_STATE.HIDING;
               // timeLeft = HIDING_TIME;
               // seeker = Math.floor(Math.random() * Object.keys(clients).length);
               // sendToAllActiveClients({action: ACTION.START_HIDING, seeker: seeker});
                return;
            }
            if (numPlayers() > 0) { // we can only play with more then one players
                timeLeft--;
                return;
            }
        } /*else if (state === SESSION_STATE.LOADING) {
            if (timeLeft <= 0) {
                //gameState = GAME_STATE.SEEKING;
                //timeLeft = GAME_TIME;
                //sendToAllActiveClients({action: ACTION.START_SEEKING, beep: (timeLeft != 0)});
                return;
            }
            timeLeft--;
        } else if (gameState === GAME_STATE.SEEKING) {
            if (timeLeft <= 0) {
                //gameState = GAME_STATE.WAITING_FOR_PLAYERS;
                //timeLeft = GAME_TIME;
                //sendToAllActiveClients({action: ACTION.MESSAGE, message: "GAME OVER, HIDERS WON!!!!"});
                sendToAllActiveClients({action: ACTION.GAMEOVER, seekerWon: false});
                gameOver();
                return;
            }
            timeLeft--;
        }*/
    }, 1000);

    //var elementCount = 0;
    function updating(deltaTime) {
        if (!RACING) { 
            return;
        }
     //   EntityViewer.setPosition({x: 8040.73046875, y: y, z: 7730.63916015625});
    //    y -= deltaTime;
       // updateAvatarPos();
        EntityViewer.queryOctree();
       // entityID = Entities.findEntit (sessionArea.center, SESSION_AREA_SIZE);
       // if (entityID) {
       //     var props = Entities.getEntityProperties(entityID);
            //setDisplayName("nearby: " + props.name + " (" + Vec3.distance(Avatar.position, props.position) + "m)");
       // }
        //var newCount = EntityViewer.getOctreeElementsCount();
        //if (newCount !== elementCount) {
        //    elementCount = newCount;
        //    print("elementCount:" + elementCount);
        //}
        //print(EntityViewer.getVoxelSizeScale() + " " + EntityViewer.getBoundaryLevelAdjust() + " " + EntityViewer.getMaxPacketsPerSecond());
    }

    _this.sendSessionInfo();
};

lobbySocket.onopen = function(event) {
    lobbySocket.send(JSON.stringify({
        action: LOBBY_ACTION.REGISTER_SESSION_REQUEST
    }));
};

lobbySocket.onmessage = function(event) {
    var data = JSON.parse(event.data);
    switch (data.action) {
        case LOBBY_ACTION.REGISTER_SESSION_REPLY:
            new Session(parseInt(data.port), data.block);
            break;
    }
};


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
print("Hosting game on " + webSocketServer.url);
*/

/*
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
        }*//*
    };
    newClient.onclose = function(event) {
        //client = findClientByWebSocket(newClient);
        sendToAllActiveClients({action: ACTION.PLAYER_LEFT, id: newClientID}, newClient);
    };
    newClient.send(JSON.stringify({action: ACTION.JOIN_REQUEST, id: newClientID, players: getPlayersToObject()}));
});*/


