Car = function(vehicle, startPosition, startOrientation, speedMultiplier) {
    var _this = this;
    _this.vehicle = vehicle;
    _this.speed = 0;
    _this.speedI = 0;
    _this.lastSpeedI = 0;
    _this.lastAngularVelocityY = 0;
    _this.planking = false;
    _this.steeringOffset = 0; // - will be left,  + will be right
    _this.steeringLeft = false;
    _this.steeringRight = false;
    _this.entity = null;
    _this.speedMultiplier = speedMultiplier !== undefined ? speedMultiplier : 1.0;

    var soundAccelerating = SoundCache.getSound(SOUND_FOLDER_URL + "/capriii2.wav");
    var soundDecelerating = SoundCache.getSound(SOUND_FOLDER_URL + "/decelerating.wav");
    var soundIdle = SoundCache.getSound(SOUND_FOLDER_URL + "/idle.wav");
    var soundShutdown = SoundCache.getSound(SOUND_FOLDER_URL + "/shutdown.wav");
    var soundStarting = SoundCache.getSound(SOUND_FOLDER_URL + "/starting.wav");

    // Every vehicle will have their own sound-player
    _this.soundLoopSwitcher = new SoundLoopSwitcher();

    _this.init = function() {
        var newProperties = {
            type: "Model",
            modelURL: MODEL_FOLDER_URL + _this.vehicle.modelFile, // + "?v=" + (new Date()).getTime(),
            shapeType: "box",
            name: "TCarModel-" + _this.vehicle.name,
            position: startPosition,
            rotation: startOrientation,
            color: {red: 0, green: 255, blue: 0},
            dimensions: _this.vehicle.dimensions,
            collisionsWillMove: true,
            ignoreForCollisions: false,
            gravity: {x: 0, y: GRAVITY, z: 0},
            script: "https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/tcarEntityScript.js?v=" + (new Date()).getTime(),
            density: 3000,
            damping: 0.7,
            angularDamping: 0.7,
            registrationPoint: _this.vehicle.registrationPoint,
            userData: JSON.stringify({
                wheelModel: _this.vehicle.wheelModel,
                frontAxlePos: _this.vehicle.frontAxlePos,
                backAxlePos: _this.vehicle.backAxlePos,
                frontAxleLength: _this.vehicle.frontAxleLength,
                backAxleLength: _this.vehicle.backAxleLength
            })
           // collisionSoundURL: "https://dl.dropboxusercontent.com/u/14997455/hifi/tcar/collision.wav?v=2"
        };
        if (_this.vehicle.collisionModel !== undefined) {
            newProperties.shapeType = 'compound';
            newProperties.compoundShapeURL = MODEL_FOLDER_URL + _this.vehicle.collisionModel;// + "?v=" + (new Date()).getTime(),
        }

        // Loaned this code from the flashlight script:
        _this.spotlight = Entities.addEntity({
            type: "Light",
            isSpotlight: true,
            dimensions: {
                x: 2,
                y: 2,
                z: 20
            },
            color: {
                red: 255,
                green: 255,
                blue: 255
            },
            intensity: 2,
            exponent: 0.3,
            cutoff: 20
        });
        _this.glowLight = Entities.addEntity({
            type: "Light",
            dimensions: {
                x: 0.25,
                y: 0.25,
                z: 0.25
            },
            isSpotlight: false,
            color: {
                red: 255,
                green: 255,
                blue: 255
            },
            exponent: 0,
            cutoff: 90, // in degrees
        });
        _this.entity = Entities.addEntity(newProperties);
        if (SOUND) {
            Audio.playSound(soundStarting, {
                position: MyAvatar.position,
                volume: 0.1
            });
        }
        _this.soundLoopSwitcher.setSound(soundIdle);
    }

    _this.update = function(time) {
        var carProps = Entities.getEntityProperties(_this.entity);
        _this.soundLoopSwitcher.updatePosition(carProps.position);
        //MyAvatar.position = carProps.position;
        if (_this.planking) {
            _this.speedI += time * SPEED_FORWARD;
        } else {
            _this.speedI -= time * SPEED_BRAKES;
        }
        //steering
        if (_this.steeringLeft && _this.steeringOffset < 0.2) {
            _this.steeringOffset += time;
        }
        if (_this.steeringRight && _this.steeringOffset > -0.2) {
            _this.steeringOffset -= time;
        }

        // automatic turning back of steering wheel
        // non of the steering is pressed, autocenter
        if (!_this.steeringRight && !_this.steeringLeft) {
            _this.steeringOffset = 0; // 0 is DIRECT!
        }
        
        var newProperties = {};
        newProperties.ignoreForCollisions = false;
        if (_this.speedI < 0) {
            _this.speedI = 0;
            _this.soundLoopSwitcher.setSound(soundIdle);
            _this.timeItWentWithoutMoving += time;
            if (_this.timeItWentWithoutMoving > 5) {
                var direction = Quat.safeEulerAngles(carProps.rotation).y;
                newProperties.rotation = Quat.fromPitchYawRollDegrees(0, direction, 0);
                newProperties.position = Vec3.sum(carProps.position, carProps.dimensions),
                newProperties.ignoreForCollisions = true;
                _this.timeItWentWithoutMoving = 0;
            }
        } else {
            _this.timeItWentWithoutMoving = 0;
        }
        //cameraHandler.updateCamera(time, carProps);
        
        
        if (_this.speedI !== _this.lastSpeedI) {
            newProperties.velocity = Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0, z: -Math.log(1 + _this.speedI, 0.3) * _this.speedMultiplier});
            newProperties.velocity.y = carProps.velocity.y;
        }
        
        var angularVelocityY = Math.log(1 + _this.speedI, 0.1) * _this.steeringOffset;
        if (angularVelocityY !== _this.lastAngularVelocityY) {
            _this.lastAngularVelocityY = angularVelocityY;
            newProperties.angularVelocity = {x: 0.0, y: angularVelocityY, z: 0.0};
        }
        
        if (Object.keys(newProperties).length > 0) {
            Entities.editEntity(_this.entity, newProperties);
        }
        Entities.editEntity(_this.spotlight, {
            position: carProps.position,
            rotation: carProps.rotation
        });
        Entities.editEntity(_this.glowLight, {
            position: carProps.position,
            rotation: carProps.rotation
        });
    };

    _this.cleanup = function() {
        print('Cleaning up a Car.')
        Entities.deleteEntity(_this.entity);
        Entities.deleteEntity(_this.spotlight);
        Entities.deleteEntity(_this.glowLight);
        _this.soundLoopSwitcher.stopSound();
        print('The car has been impounded.')
    };

    _this.init();
};
