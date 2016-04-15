//  TCars/library/session.js
//
//  A session class for the TCars Session AssignmentClients
//  Handles a session
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

Session = function(pBlock) {
    var _this = this;

    const HTTP_GET_TIMEOUT = 60000;
    const GAME_TIMER_INTERVAL = 1000;
    var block = pBlock;
    var trackZoneManager = new TrackZoneManager();
    var state = SESSION_STATE.INITIAL;
    var trackID = -1;
    var track = null;
    var trackZone = null;

    var clientManager = new ClientManager(TCARS_SESSION_CHANNEL_PREFIX + '[' + Agent.sessionUUID + ']');

    var timeLeft = Number.MAX_VALUE;

    var sendUpdateToPlayers = function(update) {
        clientManager.sendToAllActiveClients({action: SESSION_ACTION.UPDATE, update: update});
    };

    var getWinningTrackVote = function() {
        var trackVotes = {};
        clientManager.doForAllClients(function(clientID, client) {
            if (client.trackVote !== undefined) {
                if (trackVotes[client.trackVote] === undefined) {
                    trackVotes[client.trackVote] = 0;
                }
                trackVotes[client.trackVote]++;
            }
        });
        var maxVoteNum = 0;
        var selectedTrackIDs = [];
        for (var trackID in trackVotes) {
            if (trackVotes.hasOwnProperty(trackID)) {
                if (trackVotes[trackID] > maxVoteNum) {
                    maxVoteNum = trackVotes;
                    selectedTrackIDs = [trackID];
                } else if (trackVotes[trackID] === maxVoteNum) {
                    selectedTrackIDs.push(trackID);
                }
            }
        }
        if (selectedTrackIDs.length === 0) {
            return Math.floor(Math.random() * TRACKS.length);
        }
        return selectedTrackIDs[Math.floor(Math.random() * selectedTrackIDs.length)];
    };

    var updateTrackInfo = function() {
        if (trackID === -1) {
            track = null;
            return;
        }
        var trackURL = TRACK_ZONE_FOLDER_URL + TRACKS[trackID].trackJSON;
        print("The trackzone URL is: " + trackURL);
        var req = new XMLHttpRequest();
        req.open('GET', trackURL, true);
        req.timeout = HTTP_GET_TIMEOUT;
        req.ontimeout = function() { print("failed to load track!!!!!"); };
        req.onreadystatechange =  function() {
            if (req.readyState === req.DONE) {
                if (req.status === 200) {
                    track = req.response;
                    print('the track:');
                    print(track);
                    setupTrack();
                }
            }
        };
        req.send();
       // req.open('GET', trackURL, false);
       // req.send();


    };

    var numParticipantRole = function(role) {
        var roleParticipantCount = 0;
      //  print('looping through all clients:');
        clientManager.doForAllClients(function(clientID, client) {
            //print('found client with ID ' + clientID + 'with client role: ' + client.role);
            if (client.role === role) {
              //  print('role matches!');
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
        trackZone = trackZoneManager.importTrack(block.center, track);
        Entities.setPacketsPerSecond(2000);
        EntityViewer.setPosition(block.center);
        EntityViewer.setOrientation(Quat.fromPitchYawRollDegrees(0, 90, 0));
        EntityViewer.setKeyholeRadius(Vec3.distance(Vec3.multiply(block.dimensions, 0.5), {}));
        EntityViewer.queryOctree();
    };

    var sendSessionInfo = function() {
        lobbyClient.send({
            action: LOBBY_ACTION.SESSION_INFORMATION_UPDATE,
            sessionInfo: {
                state: state,
                trackID: trackID,
                players: numPlayers(),
                spectators: numSpectators()
            }
        });
    };

    var changeSessionState = function(newSessionState, extraUpdateData) {
        state = newSessionState;
        sendSessionInfo();
        var update = extraUpdateData !== undefined ? extraUpdateData : {};
        update['state'] = newSessionState;
        sendUpdateToPlayers(update)
    };

    _this.cleanup = function() {
        //TODO: delete track here if its built
        if (trackZone !== null) {
            trackZone.deleteTrack();
            trackZone = null;
        }
    };

    clientManager.onClientConnect = function(clientID) {
        print('got client with id: ' + clientID);

        // inform the lobby that a player joined
        sendSessionInfo();
    };

    clientManager.onClientDisconnect = function(clientID) {
        print('client disconnected with id: ' + clientID);
    };

    clientManager.onClientAction = function(clientID, action, data) {
        print('message from client with id: ' + clientID + ' action = ' + action);
        var sessionClient = clientManager.getClient(clientID);
        switch (action) {
            case SESSION_ACTION.JOIN_REQUEST:
                // ROLE.* PLAYER OR SPECTATOR
                //TODO: check max for role, switch to spectator if players are full, disconnect if spectators are full, and msg client.
                sessionClient.role = data.data.preferredRole;
                if (state === SESSION_STATE.INITIAL) {
                    state = SESSION_STATE.VOTE_TRACK;
                    timeLeft = TRACK_SELECTION_TIME;
                }
                clientManager.send(clientID, {action: SESSION_ACTION.JOIN_REPLY, update: {state: state, counter: timeLeft, trackID: trackID, block: block}});
                clientManager.sendToAllActiveClients({action: SESSION_ACTION.PLAYER_JOIN });
                sendSessionInfo();
                break;
            case SESSION_ACTION.VOTE:
                //if (state === SESSION_STATE.INITIAL) {
                //    state = SESSION_STATE.VOTE_TRACK;
                //    timeleft = TRACK_SELECTION_TIME;
                //}
                sessionClient.trackVote = data.data.trackID;
                print('trackvote received with ID ' + sessionClient.trackVote);
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
                changeSessionState(SESSION_STATE.LOADING, {trackID: trackID, block: block});
                updateTrackInfo();
                //setupTrack();
                //sendSessionInfo();
               // gameState = GAME_STATE.HIDING;
               // timeLeft = HIDING_TIME;
               // seeker = Math.floor(Math.random() * Object.keys(clients).length);
               // sendToAllActiveClients({action: ACTION.START_HIDING, seeker: seeker});
                return;
            }
            if (numPlayers() > 0) { // we can only play with more then one players
                timeLeft--;
            }
        } else if (state === SESSION_STATE.LOADING) {
            var isLoaded = trackZone !== null;
            if (isLoaded) {
                timeLeft = 3; // Count 3 seconds before start
                //state = SESSION_STATE.COUNT_DOWN;
                //sendSessionInfo();
                changeSessionState(SESSION_STATE.COUNT_DOWN, {});
            }
        } else if (state === SESSION_STATE.COUNT_DOWN) {
            if (timeLeft <= 0) {
                //state = SESSION_STATE.RACE;
                //sendSessionInfo();
                changeSessionState(SESSION_STATE.RACE, {});
                //trackID = getWinningTrackVote();
                //state = SESSION_STATE.LOADING;
                //sendSessionInfo();
                // gameState = GAME_STATE.HIDING;
                // timeLeft = HIDING_TIME;
                // seeker = Math.floor(Math.random() * Object.keys(clients).length);
                // sendToAllActiveClients({action: ACTION.START_HIDING, seeker: seeker});
                return;
            }
            //if (numPlayers() > 0) { // we can only play with more then one players
            timeLeft--;
            //}
        }


        /* else if (gameState === GAME_STATE.SEEKING) {
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
    }, GAME_TIMER_INTERVAL);

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

    sendSessionInfo();
};
