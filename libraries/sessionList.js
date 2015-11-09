//  TCars/libraries/sessionList.js
//
//  Creates a session list containing all sessions from the lobby
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

SessionList = function(properties, lobbyHostName, lobbyPort) {
    var _this = this;
    var sessions = [];
    var columns = {};
    var visible = true;

    var createWSLink = function(port) {
        return 'ws://' + lobbyHostName + ':' + port;
    };

    var COLUMNS = {
        NUM: 0,
        STATE: 1,
        TRACK: 2,
        PLAYERS: 3,
        SPECATORS: 4,
        COLUMN_COUNT: 5
    };

    var COLUMN_POS = {};
    COLUMN_POS[COLUMNS.NUM] = 0.0;
    COLUMN_POS[COLUMNS.STATE] = 0.1;
    COLUMN_POS[COLUMNS.TRACK] = 0.35;
    COLUMN_POS[COLUMNS.PLAYERS] = 0.6;
    COLUMN_POS[COLUMNS.SPECATORS] = 0.8;

    var TITLE_HEIGHT = 22;

    var HEADER_HEIGHT = 20;
    var HEADER_COLOR = {red: 20, blue: 20, red: 20};

    var ROW_HEIGHT = 20;

    var size = properties.size !== undefined ? properties.size : {width: 800, height: 600};

    var getColumnPos = function(column) {
        return Math.floor(size.width * COLUMN_POS[column]);    
    };

    var getColumnWidth = function(column) {
        var nextColumn = column + 1;
        var right = (nextColumn < COLUMNS.COLUMN_COUNT) ? getColumnPos(nextColumn) : size.width;
        return right - getColumnPos(column);
    };

    var position = properties.position !== undefined ? properties.position : {
        x: (Window.innerWidth / 2) - (size.width / 2),
        y: (Window.innerHeight / 2) - (size.height / 2)
    };
    
    var createColumn = function(column, text) {
        if (columns[column]) {
            Overlays.deleteOverlay(columns[column]);
        }
        columns[column] = Overlays.addOverlay("text", {
            x: position.x + getColumnPos(column),
            y: position.y + TITLE_HEIGHT,
            width: getColumnWidth(column),
            height: HEADER_HEIGHT,
            backgroundColor: HEADER_COLOR,
            text: text,
            visible: visible
        });
    };

    var Session = function(sessionList, index, session, rect, visible) {
        var _this = this;

        var sessionList = sessionList;

        var sessionInfo = session.info;
        var sessionPort = session.port;

        var visible = visible;

        var columns = {};

        var getBackgroundColor = function() {
            return ((index % 2) === 0) ? {red: 120, green: 120, blue: 120} : {red: 150, green: 150, blue: 150};
        };

        var createColumn = function(column, text) {
            if (columns[column]) {
                Overlays.deleteOverlay(columns[column]);
            }
            columns[column] = Overlays.addOverlay("text", {
                x: rect.x + getColumnPos(column),
                y: rect.y + TITLE_HEIGHT,
                width: getColumnWidth(column),
                height: ROW_HEIGHT,
                backgroundColor: getBackgroundColor(),
                text: text,
                visible: visible
            });
        };

        _this.getSessionInfo = function() {
            return sessionInfo;
        };

        _this.getSessionPort = function() {
            return sessionPort;
        };

        _this.getWSURL = function() {
            return createWSLink(sessionPort);
        };

        _this.containsOverlay = function(overlay) {
            for (column in columns) {
                if (columns[column] === overlay) {
                    return true;
                }
            }
            return false;
        };

        _this.getTrackName = function() {
            var trackID = sessionInfo.trackID;
            if (trackID === -1) {
                return "(no track selected)";
            }
            return TRACKS[trackID].name;
        };

        var setVisibility = function(newVisible) {
            for (column in columns) {
                Overlays.editOverlay(columns[column], {visible: newVisible});
            }
            visible = newVisible;
        };

        _this.hide = function() {
            if (!visible) {
                // already hidden.
                return;
            }

            setVisibility(false);
        };

        _this.show = function() {
            if (visible) {
                // already shown.
                return;
            }
            
            setVisibility(true);
        };

        createColumn(COLUMNS.NUM, parseInt(index) + 1);
        createColumn(COLUMNS.STATE, SESSION_STATE_TEXT[parseInt(sessionInfo.state)]);
        createColumn(COLUMNS.TRACK, _this.getTrackName());
        createColumn(COLUMNS.PLAYERS, sessionInfo.players + " / " + MAX_PLAYERS);
        createColumn(COLUMNS.SPECATORS, sessionInfo.spectators + " / " + MAX_SPECTATORS);

        _this.cleanup = function() {
            for (column in columns) {
                Overlays.deleteOverlay(columns[column]);
            }
        };
    };

    var clearSessions = function() {
        for (var i in sessions) {
            sessions[i].cleanup();
        }
        sessions = [];
    };

    var refreshSessions = function() {
        var lobbySocket = new WebSocket(createWSLink(lobbyPort));
        lobbySocket.onopen = function(event) {
            lobbySocket.send(JSON.stringify({
                action: LOBBY_ACTION.PLAYER_SESSIONS_REQUEST
            }));
        };

        lobbySocket.onmessage = function(event) {
            var data = JSON.parse(event.data);
            switch (data.action) {
                case LOBBY_ACTION.PLAYER_SESSIONS_REPLY:
                    clearSessions();
                    for (var i in data.sessions) {
                        sessions.push(new Session(_this, i, data.sessions[i], {x: position.x, y: position.y + TITLE_HEIGHT + HEADER_HEIGHT + (i * ROW_HEIGHT), h: ROW_HEIGHT, w: size.width}, visible));
                    }
                    break;
            }
            lobbySocket.close();
        };
    };

    _this.init = function() {
        _this.overlay = Overlays.addOverlay("text", {
            text: "TCARS - SESSION LIST",
            x: position.x,
            y: position.y,
            width: size.width,
            height: size.height,
            visible: visible
        });
        _this.refreshButton = Overlays.addOverlay("text", {
            text: "Refresh",
            x: position.x + (size.width - 120),
            y: position.y,
            width: 120,
            height: 20,
            visible: visible
        });
        createColumn(COLUMNS.NUM, "#");
        createColumn(COLUMNS.STATE, "Status");
        createColumn(COLUMNS.TRACK, "Track");
        createColumn(COLUMNS.PLAYERS, "Players");
        createColumn(COLUMNS.SPECATORS, "Spectators");
        refreshSessions();
    };

    // returns selected session
    // onSessionSelected(sessionWSURL, sessionInfo)
    _this.onSessionSelected = undefined;

    _this.handleClickEvent = function(x, y) {
        if (!visible) {
            return false;
        }
        var clickedOverlay = Overlays.getOverlayAtPoint({x: x, y: y});
        for (var i in sessions) {
            if (sessions[i].containsOverlay(clickedOverlay)) {
                if (_this.onSessionSelected !== undefined) {
                    _this.onSessionSelected.call(this, sessions[i].getWSURL(), sessions[i].getSessionInfo())
                }
                return true;
            }
        }
        if (clickedOverlay === _this.refreshButton) {
            refreshSessions();
            return true;
        }
        return false;
    };

    var setVisibility = function(newVisible) {
        for (column in columns) {
            Overlays.editOverlay(columns[column], {visible: newVisible});
        }
        Overlays.editOverlay(_this.refreshButton, {visible: newVisible});
        Overlays.editOverlay(_this.overlay, {visible: newVisible});
        visible = newVisible;
    };

    _this.hide = function() {
        if (!visible) {
            // already hidden.
            return;
        }
        for (var i in sessions) {
            sessions[i].hide();
        }
        setVisibility(false);
    };

    _this.show = function() {
        if (visible) {
            // already shown.
            return;
        }
        for (var i in sessions) {
            sessions[i].show();
        }
        setVisibility(true);
    };
    
    // Remove the overlay.
    _this.cleanup = function() {
        clearSessions();
        for (column in columns) {
            Overlays.deleteOverlay(columns[column]);
        }
        Overlays.deleteOverlay(_this.refreshButton);
        Overlays.deleteOverlay(_this.overlay);
    };
};
