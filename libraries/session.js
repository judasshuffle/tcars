//  TCars/library/session.js
//
//  A session class for the TCars Session AssignmentClients
//  Handles a session
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

Session = function(port, block) {
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
        req.open('GET', TRACK_ZONE_FOLDER_URL + TRACKS[trackID].trackJSON, false);
        req.send();
        track = req.response;
    };

    var numParticipantRole = function(role) {
        var roleParticipantCount = 0;
        print('looping through all clients:');
        clientManager.doForAllClients(function(clientID, client) {
            print('found client with ID ' + clientID + 'with client role: ' + client.role);
            if (client.role === role) {
                print('role matches!');
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

    _this.cleanup = function() {
        //TODO: delete track here if its built
    };

    clientManager.onClientConnect = function(clientID) {
        print('got client with id: ' + clientID);

        // inform the lobby that a player joined
        _this.sendSessionInfo();
    };

    clientManager.onClientDisconnect = function(clientID) {
        print('client disconnected with id: ' + clientID);
    };

    clientManager.onClientAction = function(clientID, action, data) {
        print('message from client with id: ' + clientID + ' action = ' + action);
        switch (action) {
            case SESSION_ACTION.JOIN_REQUEST:
                var sessionClient = clientManager.getClient(clientID);
                // ROLE.* PLAYER OR SPECTATOR
                //TODO: check max for role, switch to spectator if players are full, disconnect if spectators are full, and msg client.
                sessionClient.role = data.data.preferredRole;
                sessionClient.send({

                });
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
        //print('state: ' + state + ' TimeLeft: ' + timeLeft);
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
                //sendToAllActiveClients({action: ACTION.MESSAGE, message: 'GAME OVER, HIDERS WON!!!!'});
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
            //setDisplayName('nearby: ' + props.name + ' (' + Vec3.distance(Avatar.position, props.position) + 'm)');
       // }
        //var newCount = EntityViewer.getOctreeElementsCount();
        //if (newCount !== elementCount) {
        //    elementCount = newCount;
        //    print('elementCount:' + elementCount);
        //}
        //print(EntityViewer.getVoxelSizeScale() + ' ' + EntityViewer.getBoundaryLevelAdjust() + ' ' + EntityViewer.getMaxPacketsPerSecond());
    }

    _this.sendSessionInfo();
};
