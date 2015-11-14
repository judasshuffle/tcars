//  TCars/library/sessionClient.js
//
//  Handles the session clientside
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

SessionClient = function() {
    var _this = this;
    var socket = null;
    var properties = {
        sessionInfo: null,
        preferredRole: ROLE.PLAYER
    };

    _this.joinSession = function(WSURL, sessionInfo, preferredRole) {
        properties.preferredRole = (preferredRole === undefined ? ROLE.PLAYER : preferredRole);
        properties.sessionInfo = sessionInfo;
        if (socket !== null) {
            if (socket.readyState !== socket.OPEN) {
                socket.close();
            }
        }
        socket = new WebSocket(WSURL);
        socket.onmessage = function(event) {
            var data = JSON.parse(event.data);
            switch (data.action) {
                case SESSION_ACTION.JOIN_REPLY:
                    //TODO: Get current game state and respond appropriatly (Track selection, racing, loading, etc..)
                    break;
    //JOIN_REQUEST:   1,
    //JOIN_REPLY:     2,
    //UPDATE:         3,
    //MESSAGE:        4,
    //PLAYER_JOIN:    5,
    //PLAYER_LEFT:    6,
    //GAME_STATE:     7,
    //PING:           8,
    //VOTE:           9                
                //case LOBBY_ACTION.REGISTER_SESSION_REPLY:
                //    new Session(parseInt(data.port), data.block);
                //    break;
            }
        };
        socket.onopen = function() {
            //TODO: ability to select role
            socket.send(JSON.stringify({
                action: SESSION_ACTION.JOIN_REQUEST,
                data: {
                    preferredRole: ROLE.PLAYER
                }
            }));
        };
        socket.onclose = function() {
            //TODO: do the disconnect things
            // destroy car?
            // reset state?
            // teleport back to lobby?
            // re-open lobby?
            socket = null;
        };
    };
};