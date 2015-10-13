// TODO: export a zone
// SHOW JSON IN A WEBWINDOW

// IMPORT track, JSON

const TRACK_ZONE_SEARCH_DISTANCE = 2000; // search distance of trackzones (in meters)
const HALF_UNIT = 0.5;
/** 
 * creates a new TrackZone
 * a TrackZone is a Zone Entity which contains a complete TCars track
 * with this class you are able to export a track and also edit it.
 * @class 
 */
TrackZone = function(trackZoneEntityID) {
    var _this = this;
    
    /**
     * Variables
     */

    // The EntityID to keep track of the Track Zone Entity
    _this.trackZoneEntityID = trackZoneEntityID;

    // Is the TrackZone fully loaded?
    _this.loaded = false;
    
    _this.trackEntities = [];

    /**
     * Private Functions
     */
    var getZoneProperties = function() {
        return Entities.getEntityProperties(_this.trackZoneEntityID);
    };

    var getZoneUserData = function() {
        try {
            var userData = JSON.parse(getZoneProperties().userData).TCars;
            return userData;
        } catch (e) {
            // probably invalid JSON
            Window.alert("error getting ZONE DATA (Stopping script)");
            throw new "Script blew up!";
        }
    };

    var getZoneTCarsUserData = function() {
        try {
            var tCarsUserData = getZoneUserData().TCars;
            if (tCarsUserData === undefined) {
                throw "Could not find TCars userdata property";
            }
            return tCarsUserData;
        } catch (e) {
            // probably invalid JSON
            Window.alert("error getting ZONE DATA (Stopping script)");
            throw "Script blew up!";
        }
    };

    var setZoneTCarsUserData = function(variable, value) {
        try {
            var userData = getZoneUserData();
            if (userData.TCars === undefined) {
                throw new Exception("Could not find TCars userdata property");
            }            
            userData.TCars[variable] = value;
            Entities.editEntity(_this.trackZoneEntityID, {userData: JSON.stringify(userData)});
        } catch (e) {
            // probably invalid JSON
            Window.alert("error getting ZONE DATA (Stopping script)");
            throw new "Script blew up!";
        }        
    };

    /**
     * Public Functions
     */
    
    /**
     * get the name of the TrackZone
     */
    _this.getName = function() {
        return getZoneProperties().name;
    };

    _this.isLoaded = function() {
        return _this.loaded;
    };

    _this.getCheckPoints = function() {
        var checkpoints = [];
        var userDataCheckPoints = getZoneTCarsUserData().checkpoints;
        if (userDataCheckPoints !== undefined) {
            //TODO: sanetize checkpoints?
            checkpoints = userDataCheckPoints;
        }
        return checkpoints;
    };
    /**
     * Shows a Window with the exported TrackJSON
     */
    _this.exportTrack = function() {
        // do export voodoo Show JSON in window

    };

    /**
     * Checkpoint Charlie
     */
    _this.insertCheckpoint = function(position, rotation, dimensions) {
        // checkpoint!

    };

    _this.updateFromZone = function() {
        // Read zone userData here
        var zoneProperties = getZoneProperties();
        var corner = Vec3.subtract(zoneProperties.position, Vec3.multiply(zoneProperties.dimensions, HALF_UNIT));
        var entities = Entities.findEntitiesInBox(corner, zoneProperties.dimensions);
        for (key in entities) {
            var entity = entities[key];
            if (entity !== _this.trackZoneEntityID) {
                _this.trackEntities.push(entity);
                print("pushing entity to zone");
            }
        }
        _this.loaded = true;
    };
    
    _this.setBackgroundShader = function(shaderURL) {
        Window.alert("This feature is not implemented yet!");
    };
};

/**
 * create a TrackZoneManager
 * a TrackZoneManager allows you to find, create and import TrackZones
 * @class
 */
TrackZoneManager = function () {
    var _this = this;
    // list of keys which are zone-entity-id's
    _this.trackZones = {};

    var entityIsTrackZone = function(properties) {
        if (properties.type === "Zone") {
            try {
                var zoneUserData = JSON.parse(properties.userData);
                return (zoneUserData.TCars !== undefined && zoneUserData.TCars.type === "track");
            } catch (e) {
                // probably invalid JSON
            }
        }
        return false;
    };

    _this.createTrack = function(name, position, size) {
        //
        //Entities.createEntity()
    };

    _this.importTrack = function() {
        // do voodoo
        // Show Window for importing JSON
    };

    _this.refreshNearbyTracks = function() {
        // find nearby entities, for getting the trackzones
        //var addingTracks = [];
        var foundTracks = [];
        var entities = Entities.findEntities(MyAvatar.position, TRACK_ZONE_SEARCH_DISTANCE);
        for (var possibleTrackZone in entities) {
            var entity = entities[possibleTrackZone];
            var properties = Entities.getEntityProperties(entity);
            if (entityIsTrackZone(properties)) {
                print("found one!" + properties.name);
                foundTracks.push(entity);
                if (_this.trackZones[entity] === undefined) {
                    _this.trackZones[entity] = new TrackZone(entity);
                    //addingTracks.push(entity);
                }
                _this.trackZones[entity].updateFromZone();
            }
        }
        for (var trackZoneKey in _this.trackZones) {
            if (foundTracks.indexOf(trackZoneKey) === -1) {
                delete _this.trackZones[trackZoneKey];
                print("deleted one");
            }
        }
    };
};

var trackZoneManager = new TrackZoneManager();

trackZoneManager.refreshNearbyTracks();

TrackZoneEditingTools = function() {
    var _this = this;
    // add respawnable stuff
    // add solid stuff
    // set start line ( and 4 starting positions)
    // add checkpoints
};
