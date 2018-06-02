//  TCars/library/car.js
//
//  The car class for creating the vehicles in TCars
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

Car = function(vehicle, startPosition, startOrientation, speedMultiplier, newParentingMethod) {
    var _this = this;
    _this.vehicle = vehicle;
    _this.speed = 0;
    _this.speedI = 0;
    _this.lastSpeedI = 0;
    _this.lastAngularVelocityY = 0;
    _this.accelerating = false;
    _this.reversing = false;
    _this.steeringOffset = 0; // - will be left,  + will be right
    _this.steeringLeft = false;
    _this.steeringRight = false;
    _this.entity = null;
    _this.speedMultiplier = speedMultiplier !== undefined ? speedMultiplier : 1.0;

    _this.wheels = [];
    _this.wheelSpin = 0;

    var PARENTING_ROT_OFFSET = Quat.fromPitchYawRollDegrees(90, 0, 0);

    var useNewParentingMethod = newParentingMethod !== undefined ? newParentingMethod : true;
    var soundAccelerating = SoundCache.getSound(SOUND_FOLDER_URL + 'enginenoise2.wav');
    var soundDecelerating = SoundCache.getSound(SOUND_FOLDER_URL + 'decelerating.wav');
    var soundIdle = SoundCache.getSound(SOUND_FOLDER_URL + 'idle.wav');
    var soundShutdown = SoundCache.getSound(SOUND_FOLDER_URL + 'shutdown.wav');
    var soundStarting = SoundCache.getSound(SOUND_FOLDER_URL + 'starting.wav');

    // Every vehicle will have their own sound-player
    _this.soundLoopSwitcher = new SoundLoopSwitcher();

    var getPositionOffset = function(wheelIndex) {
        switch (wheelIndex) {
            case WHEEL_LEFT_FRONT:
                return Vec3.sum(_this.vehicle.frontAxlePos, {x: -_this.vehicle.frontAxleLength / 2});
            case WHEEL_RIGHT_FRONT:
                return Vec3.sum(_this.vehicle.frontAxlePos, {x: _this.vehicle.frontAxleLength / 2});
            case WHEEL_LEFT_BACK:
                return Vec3.sum(_this.vehicle.backAxlePos, {x: -_this.vehicle.backAxleLength / 2});
            case WHEEL_RIGHT_BACK:
                return Vec3.sum(_this.vehicle.backAxlePos, {x: _this.vehicle.backAxleLength / 2});
        }
        return {};
    };

    var getRotationOffset = function(wheelIndex) {
        switch (wheelIndex) {
            case WHEEL_LEFT_FRONT:
            case WHEEL_LEFT_BACK:
                return Quat.fromPitchYawRollDegrees(_this.wheelSpin % MAX_DEGREES, 0, ONE_EIGHTY);
            case WHEEL_RIGHT_FRONT:
            case WHEEL_RIGHT_BACK:
                return Quat.fromPitchYawRollDegrees(MAX_DEGREES - (_this.wheelSpin % MAX_DEGREES), 0, 0);
        }
        return {};
    };


    var getNewCarProperties = function(spawnPosition, spawnRotation) {
        var newProperties = {
            type: 'Model',
            modelURL: MODEL_FOLDER_URL + _this.vehicle.modelFile,
            shapeType: 'box',
            name: VEHICLE_MODEL_PREFIX + _this.vehicle.name,
            position: Vec3.sum(spawnPosition, {y: _this.vehicle.dimensions.y / 2}),
            rotation: spawnRotation,
            color: {red: 0, green: 255, blue: 0},
            dimensions: _this.vehicle.dimensions,
            collisionsWillMove: true,
            ignoreForCollisions: false,
            gravity: {x: 0, y: GRAVITY, z: 0},
            density: 3000,
            damping: 0.7,
            angularDamping: 0.7,
            // Test settings (falls better, slides too much)
            // damping: 0.02,
            // angularDamping: 0.5,
            // friction: 0.001,
            registrationPoint: _this.vehicle.registrationPoint
           // collisionSoundURL: "https://dl.dropboxusercontent.com/u/14997455/hifi/tcar/collision.wav?v=2"
        };
        if (!useNewParentingMethod) {
            newProperties.script = SCRIPTS_PATH + 'tcarEntityScript.js';
            newProperties.userData = JSON.stringify({
                wheelModel: _this.vehicle.wheelModel,
                frontAxlePos: _this.vehicle.frontAxlePos,
                backAxlePos: _this.vehicle.backAxlePos,
                frontAxleLength: _this.vehicle.frontAxleLength,
                backAxleLength: _this.vehicle.backAxleLength
            });
        }

        if (_this.vehicle.collisionModel !== undefined) {
            newProperties.shapeType = 'compound';
            newProperties.compoundShapeURL = MODEL_FOLDER_URL + _this.vehicle.collisionModel;
        }
        return newProperties;     
    };

    _this.init = function() {
        _this.entity = Entities.addEntity(getNewCarProperties(startPosition, startOrientation));
        if (useNewParentingMethod) {
            for (var i = 0; i < WHEEL_COUNT; i++) {
                var wheelPos = Vec3.multiplyQbyV(PARENTING_ROT_OFFSET, getPositionOffset(i));
                _this.wheels[i] = Entities.addEntity({
                    type: 'Model',
                    modelURL: MODEL_FOLDER_URL + _this.vehicle.wheelModel,
                    position: wheelPos,
                    parentID: _this.entity
                    // ANGULAR VELOCITY TEST FAILED
                    // angularVelocity: Quat.fromPitchYawRollDegrees(0, 0, 90),
                    // angularDamping: 0
                    // rotation: this.properties.rotation
                });
            }
        }
        var spotlightProps = {
            type: 'Light',
            isSpotlight: true,
            dimensions: {
                x: 40,
                y: 40,
                z: 40
            },
            color: {
                red: 255,
                green: 255,
                blue: 255
            },
            intensity: 2,
            exponent: 0.3,
            cutoff: 20
        };
        if (useNewParentingMethod) {
            spotlightProps.parentID = _this.entity;
            spotlightProps.rotation = PARENTING_ROT_OFFSET;
        }
        _this.spotlight = Entities.addEntity(spotlightProps);
        _this.glowLight = Entities.addEntity({
            type: 'Light',
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
            cutoff: 90 // in degrees
        });
        if (SOUND) {
            Audio.playSound(soundStarting, {
                position: MyAvatar.position,
                volume: 0.1
            });
        }
        _this.soundLoopSwitcher.setSound(soundIdle);
    };

    _this.update = function(time) {
        // this.wheelSpin += Vec3.length(_this.properties.velocity) * time * TIRE_SPIN_MULTIPLIER;
        var carProps = Entities.getEntityProperties(_this.entity);
        _this.soundLoopSwitcher.updatePosition(carProps.position);
        // MyAvatar.position = carProps.position;
        if (_this.accelerating) {
            _this.soundLoopSwitcher.setSound(soundAccelerating);
            _this.speedI += time * SPEED_FORWARD;
        } else {
            _this.speedI = Math.max(0, _this.speedI - time * SPEED_BRAKES);
            if (_this.speedI > 0) {
                _this.soundLoopSwitcher.setSound(soundDecelerating);
            }
        }
        // steering
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
        if (carProps.ignoreForCollisions) {
            newProperties.ignoreForCollisions = false;
        }

        if (_this.speedI === 0) {
            _this.soundLoopSwitcher.setSound(soundIdle);
        }
        // newProperties.ignoreForCollisions = false;
        /*
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
        */
        // cameraHandler.updateCamera(time, carProps);

        if (_this.speedI !== _this.lastSpeedI) {
            _this.lastSpeedI = _this.speedI;
            newProperties.velocity = Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0, z: -Math.log(1 + _this.speedI) *
                _this.speedMultiplier});
            newProperties.velocity.y = carProps.velocity.y;
        }
        
        var angularVelocityY = Math.log(1 + _this.speedI) * _this.steeringOffset;
        if (angularVelocityY !== _this.lastAngularVelocityY) {
            _this.lastAngularVelocityY = angularVelocityY;
            newProperties.angularVelocity = {x: 0.0, y: angularVelocityY, z: 0.0};
        }
        
        if (Object.keys(newProperties).length > 0) {
            Entities.editEntity(_this.entity, newProperties);
        }
        if (useNewParentingMethod) {
            _this.updateWheels(time, carProps);
        } else {
            Entities.editEntity(_this.spotlight, {
                position: carProps.position,
                rotation: carProps.rotation
            });
        }
        Entities.editEntity(_this.glowLight, {
            position: carProps.position,
            rotation: carProps.rotation
        });
    };

    _this.updateWheels = function(time, carProps) {
      //  var now = +new Date;
       // var time = (now - _this.lastTime) / 1000.0;
       // _this.lastTime = now;
       // print(time);

       // _this.updateProperties();
        _this.wheelSpin += Vec3.length(carProps.velocity) * time * TIRE_SPIN_MULTIPLIER;
        for (var i = 0; i < _this.wheels.length; i++) {
            // var newWheelProps = {
            // position: Vec3.multiplyQbyV(Quat.fromPitchYawRollDegrees(90, 0, 0), getPositionOffset(i)),
            // Vec3.sum(_this.properties.position, Vec3.multiplyQbyV(_this.properties.rotation, getPositionOffset(i))),
            //     rotation: getRotationOffset(i) //Quat.multiply(_this.properties.rotation, getRotationOffset(i))
            // };
           // print("wheel " + i + " new props = " + JSON.stringify(newWheelProps));
            Overlays.editOverlay(_this.wheels[i], {rotation: getRotationOffset(i)});
        }
    };

    _this.reset = function() {
        _this.speed = 0;
        _this.speedI = 0;
        _this.lastSpeedI = 0;
        _this.lastAngularVelocityY = 0;

        var carProps = Entities.getEntityProperties(_this.entity);
        var direction = Quat.safeEulerAngles(carProps.rotation).y;
        Entities.deleteEntity(_this.entity);
        _this.entity = Entities.addEntity(getNewCarProperties(Vec3.sum(carProps.position, {x: 0, y: carProps.dimensions.y, z: 0}), Quat.fromPitchYawRollDegrees(0, direction, 0)));
        // Entities.editEntity(_this.entity, {
        //     rotation: Quat.fromPitchYawRollDegrees(0, direction, 0),
        //     position: Vec3.sum(carProps.position, {x: 0, y: carProps.dimensions.y, z: 0}),
        //     ignoreForCollisions: true
        // });
        // newProperties.rotation = Quat.fromPitchYawRollDegrees(0, direction, 0);
        // newProperties.position = Vec3.sum(carProps.position, carProps.dimensions),
        // newProperties.ignoreForCollisions = true;
    };

    _this.cleanup = function() {
        print('Cleaning up a Car.');
        Audio.playSound(soundShutdown, {
            position: Entities.getEntityProperties(_this.entity).position,
            volume: 0.1
        });
        if (_this.wheels.length > 0) {
            for (var i = 0; i < _this.wheels.length; i++) {
                Entities.deleteEntity(_this.wheels[i]);
            }
        }
        Entities.deleteEntity(_this.entity);
        Entities.deleteEntity(_this.spotlight);
        Entities.deleteEntity(_this.glowLight);
        _this.soundLoopSwitcher.stopSound();
        print('Finished cleaning up a Car.');
    };

    _this.init();
};
