//  TCars/library/TrackZone.js
//
//  Handles a single TrackZone
//  
//  a TrackZone is a Zone Entity which contains a complete TCars track
//  with this class you are able to export a track and also edit it.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


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
    
    //TODO: physical respawnable entities need userdata that tells us that they are such
    _this.trackEntities = [];

    var exportableProperties = {
        "all": ["rotation", "dimensions", "name", "userData", "type", "visible"],
        "Zone": ["keyLight", "skybox", "shapeType", "stage", "backgroundMode"],
        "Light": ["isSpotlight", "color", "intensity", "exponent", "cutoff"],
        "Sphere": ["gravity", "color", "density", "damping", "angularDamping", "restitution", "friction"],
        "Box": ["gravity", "color", "density", "damping", "angularDamping", "restitution", "friction"],
        "Model": ["gravity", "modelURL", "compoundShapeURL", "shapeType", "density", "damping", "angularDamping", "restitution", "friction"]
    };

    /**
     * Private Functions
     */
    var getZoneProperties = function() {
        return Entities.getEntityProperties(_this.trackZoneEntityID);
    };

    var getZoneUserData = function() {
        try {
            return JSON.parse(getZoneProperties().userData).TCars;
        } catch (e) {
            // probably invalid JSON
            Window.alert('error getting ZONE DATA (Stopping script)');
            throw 'Script blew up!';
        }
    };

    var getZoneTCarsUserData = function() {
        try {
            var tCarsUserData = getZoneUserData().TCars;
            if (tCarsUserData === undefined) {
                //noinspection ExceptionCaughtLocallyJS
                throw 'Could not find TCars userdata property';
            }
            return tCarsUserData;
        } catch (e) {
            // probably invalid JSON
            Window.alert('error getting ZONE DATA (Stopping script)');
            throw 'Script blew up!';
        }
    };

    var setZoneTCarsUserData = function(variable, value) {
        try {
            var userData = getZoneUserData();
            if (userData.TCars === undefined) {
                //noinspection ExceptionCaughtLocallyJS
                throw new Exception('Could not find TCars userdata property');
            }
            userData.TCars[variable] = value;
            Entities.editEntity(_this.trackZoneEntityID, {userData: JSON.stringify(userData)});
        } catch (e) {
            // probably invalid JSON
            Window.alert('error getting ZONE DATA (Stopping script)');
            throw 'Script blew up!';
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

    _this.getPosition = function() {
        return getZoneProperties().position;
    };

    _this.isLoaded = function() {
        return _this.loaded;
    };

    _this.getCheckPoints = function() {
        var checkpoints = [];
        var userDataCheckPoints = getZoneTCarsUserData().checkpoints;
        if (userDataCheckPoints !== undefined) {
            //TODO: sanitize checkpoints?
            checkpoints = userDataCheckPoints;
        }
        return checkpoints;
    };

    /**
     * Checkpoint Charlie
     */
    _this.insertCheckpoint = function(position, rotation, dimensions) {
        // checkpoint!
        var checkpoints = _this.getCheckPoints();
        checkpoints.push({
            position: position,
            rotation: rotation,
            dimensions: dimensions
        });
    };


    /**
     * Shows a Window with the exported TrackJSON
     */
    _this.exportTrack = function() {
        // do export voodoo Show JSON in window
        var zoneProperties = {};
        var properties = getZoneProperties();
        for (var property in properties) {
            if (properties.hasOwnProperty(property) && (exportableProperties["all"].indexOf(property) !== -1 || exportableProperties["Zone"].indexOf(property) !== -1) && property !== "dimensions") {
                zoneProperties[property] = properties[property];
            }
        }

        return {
            name: _this.getName(),
            entities: _this.getEntityPropertySet(),
            zoneProperties: zoneProperties
        };
    };

    _this.getEntityPropertySet = function() {
        // be sure its up to date
        _this.updateFromZone();
        var zonePosition = getZoneProperties().position;

        var result = [];
        
        for (var i = 0; i < _this.trackEntities.length; i++) {
            var properties = Entities.getEntityProperties(_this.trackEntities[i]);
            var filteredProperties = {};
            for (var property in properties) {
                if (properties.hasOwnProperty(property) && (exportableProperties["all"].indexOf(property) !== -1 ||
                    (exportableProperties[properties.type] !== undefined &&
                    exportableProperties[properties.type].indexOf(property) !== -1)))
                {
                    filteredProperties[property] = properties[property];
                }
            }
            // calculate position
            filteredProperties['localPosition'] = Vec3.subtract(properties.position, zonePosition);

            result.push(filteredProperties);
        }
        return result;
    };

    _this.updateFromZone = function() {
        // Read zone userData here
        var zoneProperties = getZoneProperties();
        var corner = Vec3.subtract(zoneProperties.position, Vec3.multiply(zoneProperties.dimensions, HALF_UNIT));
        var entities = Entities.findEntitiesInBox(corner, zoneProperties.dimensions);
        _this.trackEntities = [];
        for (var key in entities) {
            if (entities.hasOwnProperty(key)) {
                var entity = entities[key];
                if (entity !== _this.trackZoneEntityID) {
                    var properties = Entities.getEntityProperties(entity);
                    if (properties.name.substring(0, VEHICLE_MODEL_PREFIX.length) === VEHICLE_MODEL_PREFIX) {
                        continue; //skip vehicles
                    }
                    _this.trackEntities.push(entity);
                }
            }
        }
        _this.loaded = true;
    };
    
    _this.setBackgroundShader = function(shaderURL) {
        Window.alert('This feature is not implemented yet!');
    };

    _this.deleteTrackZone = function() {
        print('deleting TrackZone ' + _this.trackZoneEntityID);
        for (var i = 0; i < _this.trackEntities.length; i++) {
            Entities.deleteEntity(_this.trackEntities[i]);
        }
        Entities.deleteEntity(_this.trackZoneEntityID);
    };
};
