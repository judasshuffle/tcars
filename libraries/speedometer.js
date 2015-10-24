//  TCars/library/speedometer.js
//
//  Creates a speedometer with a moving dial (currently not ready)
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

Speedometer = function() {
    var _this = this;

    var getRotation = function() {
        return Quat.multiply(Camera.orientation, Quat.fromPitchYawRollDegrees(90, 0, 0));
    };

    var getPosition = function() {
        return Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, {x: 0, y: 0, z: -1}));
    };

    _this.update = function(time) {
        Overlays.editOverlay(_this.overlay, {
            dimensions: {x: 0.3, y: 0.3, z: 0.3},
            rotation: getRotation(),
            position: getPosition()
        });
    };

    this.cleanup = function() {
        Overlays.deleteOverlay(_this.overlay);
    };
    
    _this.overlay = Overlays.addOverlay("model", {
        url: MODEL_FOLDER_URL + "speedo/dial.fbx?v=3",
        dimensions: {x: 0.3, y: 0.3, z: 0.3},
        scale: {x: 0.3, y: 0.3, z: 0.3},
        rotation: getRotation(),
        position: getPosition()
    });
};
