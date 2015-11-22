/**
 * create a TrackZoneManager
 * a TrackZoneManager allows you to find, create and import TrackZones
 * @class
 */
TrackZoneManager = function () {
    var _this = this;
    // list of keys which are zone-entity-id's
    _this.trackZones = {};

    var selectedTrackZone = null;

    var entityIsTrackZone = function(properties) {
        if (properties.type === "Zone") {
            try {
                var zoneUserData = JSON.parse(properties.userData);
                return (zoneUserData.TCars !== undefined && zoneUserData.TCars.type === "track");
            } catch (e) {
                print(e);
                // probably invalid JSON
            }
        }
        return false;
    };

    _this.getSelectedTrackZone = function() {
        if (_this.trackZones[selectedTrackZone] !== undefined) {
            return _this.trackZones[selectedTrackZone];
        }
        return null;
    };

    _this.selectNearestTrackZone = function(position) {
        var closestDistance = Number.MAX_VALUE;
        var closestTrackZoneID = null;
        for (var trackZoneID in _this.trackZones) {
            var distance = Vec3.distance(position, _this.trackZones[trackZoneID].getPosition());
            if (distance < closestDistance) {
                closestDistance = distance;
                closestTrackZoneID = trackZoneID;
            }
        }
        selectedTrackZone = closestTrackZoneID;
        return selectedTrackZone;
    };

    _this.createTrack = function(name, position, dimensions, entityProperties) {
        print('name: ' + name);

        var newProperties = {
            type: 'Zone',
            name: name,
            userData: JSON.stringify({TCars: {type: 'track'}}),
            position: position,
            dimensions: dimensions
        };
        if (entityProperties !== undefined) {
            for (property in entityProperties) {
                newProperties[property] = entityProperties[property];
            }
        }

        print('adding: ' + JSON.stringify(newProperties));
        return Entities.addEntity(newProperties);
    };

    _this.importTrack = function(position, json) {
        try {
            var trackZoneData = JSON.parse(json);
            var newTrackZoneEntity = _this.createTrack(trackZoneData.name, position, TRACK_ZONE_DIMENSIONS, trackZoneData.zoneProperties);
            for (var i = 0; i < trackZoneData.entities.length; i++) {
                var properties = trackZoneData.entities[i];
                var newProperties = {};
                for (property in properties) {
                    if (property === 'localPosition') {
                        continue;
                    }
                    newProperties[property] = properties[property];
                }
                newProperties.position = Vec3.sum(position, properties.localPosition);
                Entities.addEntity(newProperties);
            }

            // Finally select and refresh
            selectedTrackZone = newTrackZoneEntity;
            _this.refreshNearbyTracks(position);
            return selectedTrackZone;
        } catch (e) {
            print(e);
        }
        return false;
    };

    _this.refreshNearbyTracks = function(position) {
        // find nearby entities, for getting the trackzones
        var foundTracks = [];
        var entities = Entities.findEntities(position, TRACK_ZONE_SEARCH_DISTANCE);
        for (var possibleTrackZone in entities) {
            var entity = entities[possibleTrackZone];
            var properties = Entities.getEntityProperties(entity);
            if (entityIsTrackZone(properties)) {
                print('Found zone: ' + properties.name);
                foundTracks.push(entity);
                if (_this.trackZones[entity] === undefined) {
                    _this.trackZones[entity] = new TrackZone(entity);
                }
                _this.trackZones[entity].updateFromZone();
            }
        }
        for (var trackZoneKey in _this.trackZones) {
            if (foundTracks.indexOf(trackZoneKey) === -1) {
                delete _this.trackZones[trackZoneKey];
                print('Lost a TrackZone out of vision.');
            }
        }
    };
};
