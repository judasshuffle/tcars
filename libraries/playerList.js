// PlayerList class definition.
PlayerList = function() {
    var _this = this;

    // Object containing the players.
    _this.players = {};

    // Gets the number of players in the list.
    _this.getLength = function() {
        return Object.keys(_this.players).length;
    };

    // Find a player by the given overlay.
  /*  _this.findPlayerByOverlay = function(overlayID) {
        // Loop through the players object.
        for (var player in _this.players) {
            // Once the positionBox equals to the overlayID then...
            if (_this.players[player].positionBox === overlayID) {
                // ... return the player object.
                return _this.players[player];
            }
        }
        // Return null (nothing) if the player is not found.
        return null;
    };*/
    
    // Add a Player to the PlayerList.
    _this.addPlayer = function(id, name) {
        _this.players[id] = new Player(id, name);
    };

    _this.removePlayer = function(id) {
        delete _this.players[id];
    };

    // Gets a player by its ID.
    _this.getPlayer = function(playerID) {
        return _this.players[playerID];
    };

    // Calls the cleanup event for all Player instances.
    _this.cleanup = function() {
        for (var player in _this.players) {
            _this.players[player].cleanup();
        }
    };
};
