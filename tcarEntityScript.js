(function() {
    var _this = this;
    const MODEL_FOLDER_URL = "https://dl.dropboxusercontent.com/u/10483952/tcar/";
    const WHEEL_LEFT_FRONT = 0;
    const WHEEL_RIGHT_FRONT = 1;
    const WHEEL_LEFT_BACK = 2;
    const WHEEL_RIGHT_BACK = 3;
    const WHEEL_COUNT = 4;

    const STEERING_ANGLE_MULTIPLIER = 30;
    const ONE_EIGHTY = 180;

    const MAX_DEGREES = 360;

    const TIRE_SPIN_MULTIPLIER = 100;

    _this.entityID = null;
    _this.properties = null;

    _this.wheelModel = "Twheel.fbx"
    _this.frontAxlePos = {x: 0, y: -0.3, z: -2.6};
    _this.backAxlePos = {x: 0, y: -0.3, z: 0.6};
    _this.frontAxleLength = 2.5;
    _this.backAxleLength = 2.5;

    _this.sound = null;
    _this.wheels = [];
    _this.wheelSpin = 0;

    var getPositionOffset = function(wheelIndex) {
        switch (wheelIndex) {
            case WHEEL_LEFT_FRONT:
                return Vec3.sum(_this.frontAxlePos, {x: -_this.frontAxleLength / 2});
            case WHEEL_RIGHT_FRONT:
                return Vec3.sum(_this.frontAxlePos, {x: _this.frontAxleLength / 2});
            case WHEEL_LEFT_BACK:
                return Vec3.sum(_this.backAxlePos, {x: -_this.backAxleLength / 2});
            case WHEEL_RIGHT_BACK:
                return Vec3.sum(_this.backAxlePos, {x: _this.backAxleLength / 2});
        }
        return {};
    }

    var getRotationOffset = function(wheelIndex) {
        switch (wheelIndex) {
            case WHEEL_LEFT_FRONT:
                return Quat.fromPitchYawRollDegrees(_this.wheelSpin % MAX_DEGREES, -_this.properties.angularVelocity.y * STEERING_ANGLE_MULTIPLIER, ONE_EIGHTY);
            case WHEEL_LEFT_BACK:
                return Quat.fromPitchYawRollDegrees(_this.wheelSpin % MAX_DEGREES, 0, ONE_EIGHTY);
            case WHEEL_RIGHT_FRONT:
                return Quat.fromPitchYawRollDegrees(MAX_DEGREES - (_this.wheelSpin % MAX_DEGREES), _this.properties.angularVelocity.y * STEERING_ANGLE_MULTIPLIER, 0);
            case WHEEL_RIGHT_BACK:
                return Quat.fromPitchYawRollDegrees(MAX_DEGREES - (_this.wheelSpin % MAX_DEGREES), 0, 0);
        }
        return {};
    }

    // All callbacks start by updating the properties
    _this.updateProperties = function(entityID) {
        if (_this.entityID === null) {
            _this.entityID = entityID;
        }
        _this.properties = Entities.getEntityProperties(_this.entityID);
    }

    // Get an entity's user data
    _this.getEntityUserData = function(entityID) {
        var properties = Entities.getEntityProperties(entityID);
    
        if (properties && properties.userData){
            return JSON.parse(properties.userData);
        } else {
            print("No user data found.");
            return null;
        }
    };

    _this.updateFromUserData = function() {
        var userData = _this.getEntityUserData(_this.entityID);
        _this.wheelModel = userData.wheelModel;
        _this.frontAxlePos = userData.frontAxlePos;
        _this.backAxlePos = userData.backAxlePos;
        _this.frontAxleLength = userData.frontAxleLength;
        _this.backAxleLength = userData.backAxleLength;
    };
 
    // Download sound if needed
    _this.maybeDownloadSound = function() {
        if (this.sound === null) {
            this.sound = SoundCache.getSound("https://dl.dropboxusercontent.com/u/14997455/hifi/tcar/collision.wav?v=2");
        }
    }

    // Play drop sound
    _this.playSound = function() {
        if (this.sound && this.sound.downloaded) {
            Audio.playSound(this.sound, { position: this.properties.position });
        }
    }

    _this.firstTime = true;
    _this.preload = function(entityID) {
        this.updateProperties(entityID); // All callbacks start by updating the properties
        _this.updateFromUserData();
        this.maybeDownloadSound();
        if (this.firstTime) {
            this.firstTime = false;
            for (var i = 0; i < WHEEL_COUNT; i++) {
                var wheelPos = Vec3.sum(this.properties.position, Vec3.multiplyQbyV(this.properties.rotation, getPositionOffset(i)));
                _this.wheels[i] = Overlays.addOverlay("model", {url: MODEL_FOLDER_URL + _this.wheelModel, position: wheelPos, dimensions: {x: 0.63, y: 0.99, z:0.99}, rotation: this.properties.rotation});               
            }
            Script.update.connect(_this.updateWheels);
        }
    }

    _this.unload = function(entityID) {
        print("unloaded" + entityID);
        if (_this.wheels.length > 0) {
            for (var i = 0; i < _this.wheels.length; i++) {
                Overlays.deleteOverlay(_this.wheels[i]);
            }
        }
    };

    _this.updateWheels = function(time) {
        _this.updateProperties();
        _this.wheelSpin += Vec3.length(_this.properties.velocity) * time * TIRE_SPIN_MULTIPLIER;
        for (var i = 0; i < _this.wheels.length; i++) {
            Overlays.editOverlay(_this.wheels[i], {position: Vec3.sum(_this.properties.position, Vec3.multiplyQbyV(_this.properties.rotation, getPositionOffset(i))), rotation: Quat.multiply(_this.properties.rotation, getRotationOffset(i))});
        }
    };

    _this.clickDownOnEntity = function(entityID, mouseEvent) {
      //  this.preload(entityID); // TODO : remove
        this.updateProperties(entityID); // All callbacks start by updating the properties
        //this.grab(mouseEvent);
        this.playSound();
    };

    _this.holdingClickOnEntity = function(entityID, mouseEvent) {
        this.updateProperties(entityID); // All callbacks start by updating the properties
        //this.move(mouseEvent);
    };
    _this.clickReleaseOnEntity = function(entityID, mouseEvent) {
        this.updateProperties(entityID); // All callbacks start by updating the properties
        //this.release(mouseEvent);
    };
})
