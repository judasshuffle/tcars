// car script 1.0.2 © thoys 2015
// no refunds
// Audio effects by Konstantin
// Models by Judas important code also by Judas
// Car tuning by unknown

Script.include([
    'libraries/constants.js',
    'libraries/keys.js',
    'libraries/vehicles.js',
    'libraries/tracks.js',
    'libraries/speedometer.js',
    'libraries/carSelector.js',
    'libraries/cameraHandler.js',
    'libraries/trackSelector.js',
    'libraries/soundLoopSwitcher.js'
]);

var zoneInformation = {"rideZone":"School Tables", "seats": [
{"position":{"x":7938.66455078125,"y":7875.783203125,"z":7870.95166015625}, "rotation":{"x":-0.0000152587890625,"y":-0.0000152587890625,"z":-0.0000152587890625,"w":1}, "scale": 125}
]};

var seatInformation = zoneInformation.seats[0];

MyAvatar.scale = seatInformation.scale;
MyAvatar.position = seatInformation.position;
MyAvatar.orientation = seatInformation.rotation;

var car = null;

var state = STATE_TRACK_SELECTION;

var soundAccelerating = SoundCache.getSound(SOUND_FOLDER_URL + "/capriii2.wav");
var soundDecelerating = SoundCache.getSound(SOUND_FOLDER_URL + "/decelerating.wav");
var soundIdle = SoundCache.getSound(SOUND_FOLDER_URL + "/idle.wav");
var soundShutdown = SoundCache.getSound(SOUND_FOLDER_URL + "/shutdown.wav");
var soundStarting = SoundCache.getSound(SOUND_FOLDER_URL + "/starting.wav");

var timeItWentWithoutMoving = 0;
var actionID = false;

//var newWindow = new WebWindow("Customize your vehicle", "https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/blockly-tcars/index.html", 700,700);
//newWindow.setVisible(true);

//var speedometer = new Speedometer();

function mixFloats(float1, float2, mixValue) {
    if (mixValue > 1.0) {
        mixValue = 1.0;
    }
    return float1 + ((float2 - float1) * mixValue);
}

var trackSelector = new TrackSelector();
trackSelector.init();

var carSelector = new CarSelector();
var cameraHandler = new CameraHandler();
var soundLoopSwitcher = new SoundLoopSwitcher();
soundLoopSwitcher.setSound(soundIdle);

// part 0 - the chassis
var speed = 0;
var speedI = 0;
var lastSpeedI = 0;
var lastAngularVelocityY = 0;
var planking = false;
var steeringOffset = 0; // - will be left,  + will be right
var steeringLeft = false;
var steeringRight = false;

function isCarDriving() {
    return state == STATE_DRIVING || state == STATE_RACING;
}

function launchProjectile(carProps) {
    Entities.addEntity({
        type: "Model",
        name: "Rocket",
        shapeType: "sphere",
        density: 8000,
        collisionsWillMove: true,
        ignoreForCollisions: false,
        position: Vec3.sum(carProps.position, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0, z: -7})),
        rotation: Quat.multiply(carProps.rotation, Quat.fromVec3Degrees({x: 270, y: 0, z: 0})),
        dimensions: {x: 1.25, y: 2.56, z: 1.45},
        modelURL: MODEL_FOLDER_URL + "rockett.fbx?123",
        velocity: Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0, z: -10}),
        angularVelocity: Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0, z: 20}),
        damping: 0,
        lifetime: 5
    });
    Entities.addEntity({
        type: "Light",
        name: "Rocket",
        density: 8000,
        //collisionsWillMove: true,
        ignoreForCollisions: false,
        position: Vec3.sum(carProps.position, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0, z: -7})),
        rotation: Quat.multiply(carProps.rotation, Quat.fromVec3Degrees({x: 270, y: 0, z: 0})),
        dimensions: {x: 1.25, y: 2.56, z: 1.45},
        velocity: Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0, z: -10}),
        angularVelocity: Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0, z: 20}),
        damping: 0,
        lifetime: 5,
        isSpotlight: 0,
        intensity: 1,
        exponent: 0,
        cutoff: 33,
        color: {red: 242, green: 237, blue: 237}
    });
}

/// X+  is forward
function handleDrivingKeyPress(event) {
    if (event.key == KEY.UP) {
        planking = true;
        soundLoopSwitcher.setSound(soundAccelerating);
    } else if (event.key == KEY.LEFT) {
        steeringLeft = true;
    } else if (event.key == KEY.RIGHT) {
        steeringRight = true;
    } else if (event.key == KEY.C) {
        event.isShifted ? cameraHandler.prevCamera() : cameraHandler.nextCamera();
    } else if (event.key == KEY.SPACE) {
        launchProjectile(Entities.getEntityProperties(car));
    }
}

Controller.keyPressEvent.connect(function(event) {
    if (isCarDriving()) {
        handleDrivingKeyPress(event);
    }
    if (state === STATE_TRACK_SELECTION) {
        if (event.key == KEY.LEFT) {
            trackSelector.prevTrack();
        } else if (event.key == KEY.RIGHT) {
            trackSelector.nextTrack();
        } else if (event.key == KEY.SPACE) {
            carSelector.init();
            cameraHandler.setCameras(TRACKS[trackSelector.selectedTrack].cameras);
            state = STATE_CAR_SELECTION;
        }
    } else if (state == STATE_CAR_SELECTION) {
        if (event.key == KEY.LEFT) {
            carSelector.prevCar();
        } else if (event.key == KEY.RIGHT) {
            carSelector.nextCar();
        } else if (event.key == KEY.SPACE) {
            var selectedCar = carSelector.selectableCars[carSelector.selectedCar];
            var selectedTrack = TRACKS[trackSelector.selectedTrack];
            var newProperties = {
                type: "Model",
                modelURL: MODEL_FOLDER_URL + selectedCar.vehicle.modelFile + "?v=" + (new Date()).getTime(),
                shapeType: "box",
                name: "TCarModel-" + selectedCar.vehicle.name,
                position: selectedTrack.startPosition,
                rotation: selectedTrack.startOrientation,
                color: {red: 0, green: 255, blue: 0},
                dimensions: selectedCar.vehicle.dimensions,
                collisionsWillMove: true,
                ignoreForCollisions: false,
                gravity: {x: 0, y: GRAVITY, z: 0},
                script: "https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/tcarEntityScript.js?v=" + (new Date()).getTime(),
                density: 6000,
                damping: 0,
                angularDamping: 0,
                registrationPoint: selectedCar.vehicle.registrationPoint,
                userData: JSON.stringify({
                    wheelModel: selectedCar.vehicle.wheelModel,
                    frontAxlePos: selectedCar.vehicle.frontAxlePos,
                    backAxlePos: selectedCar.vehicle.backAxlePos,
                    frontAxleLength: selectedCar.vehicle.frontAxleLength,
                    backAxleLength: selectedCar.vehicle.backAxleLength
                })
               // collisionSoundURL: "https://dl.dropboxusercontent.com/u/14997455/hifi/tcar/collision.wav?v=2"
            };
            if (selectedCar.vehicle.collisionModel !== undefined) {
                newProperties.shapeType = 'compound';
                newProperties.compoundShapeURL = MODEL_FOLDER_URL + selectedCar.vehicle.collisionModel + "?v=" + (new Date()).getTime(),
            }

            car = Entities.addEntity(newProperties);
            if (SOUND) {
                Audio.playSound(soundStarting, {
                    position: MyAvatar.position,
                    volume: 0.1
                });
            }
            state = STATE_DRIVING;
            cameraHandler.firstCamera();
            carSelector.cleanup();
        }
    }
});

Controller.keyReleaseEvent.connect(function(event) {
    if (isCarDriving()) {
        if (event.key == KEY.UP) {
            planking = false;
            soundLoopSwitcher.setSound(soundDecelerating);
        } else if (event.key == KEY.LEFT) {
            steeringLeft = false;
        } else if (event.key == KEY.RIGHT) {
            steeringRight = false;
        }
    }
});

function updateCar(time) {
    var carProps = Entities.getEntityProperties(car);
    soundLoopSwitcher.updatePosition(carProps.position);
    //MyAvatar.position = carProps.position;
    if (planking) {
        speedI += time * SPEED_FORWARD;
    } else {
        speedI -= time * SPEED_BRAKES;
    }
    //steering
    if (steeringLeft && steeringOffset < 0.2) {
        steeringOffset += time;
    }
    if (steeringRight && steeringOffset > -0.2) {
        steeringOffset -= time;
    }

    // automatic turning back of steering wheel
    // non of the steering is pressed, autocenter
    if (!steeringRight && !steeringLeft) {
        steeringOffset = 0; // 0 is DIRECT!
    }
    
    var newProperties = {};
    newProperties.ignoreForCollisions = false;
    if (speedI < 0) {
        speedI = 0;
        soundLoopSwitcher.setSound(soundIdle);
        timeItWentWithoutMoving += time;
        if (timeItWentWithoutMoving > 5) {
            var direction = Quat.safeEulerAngles(carProps.rotation).y;
            newProperties.rotation = Quat.fromPitchYawRollDegrees(0, direction, 0);
            newProperties.position = Vec3.sum(carProps.position, carProps.dimensions),
            newProperties.ignoreForCollisions = true;
            timeItWentWithoutMoving = 0;
        }
    } else {
        timeItWentWithoutMoving = 0;
    }
    cameraHandler.updateCamera(time, carProps);
    
    
    if (speedI !== lastSpeedI) {
        newProperties.velocity = Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0, z: -Math.log(1 + speedI, 0.3)});
        newProperties.velocity.y = carProps.velocity.y;
    }
    
    var angularVelocityY = Math.log(1 + speedI, 0.1) * steeringOffset;
    if (angularVelocityY !== lastAngularVelocityY) {
        lastAngularVelocityY = angularVelocityY;
        newProperties.angularVelocity = {x: 0.0, y: angularVelocityY, z: 0.0};
    }
    
    if (Object.keys(newProperties).length > 0) {
        Entities.editEntity(car, newProperties);
    }
}

Script.update.connect(function(time) {
    if (isCarDriving()) {
        updateCar(time);
        //speedometer.update(time);
    } else if (state == STATE_TRACK_SELECTION) {
        cameraHandler.stance = CAMERA_TRACK_SELECTOR;
        cameraHandler.updateCamera(time, null);
        trackSelector.update(time);
    } else if (state == STATE_CAR_SELECTION) {
        cameraHandler.stance = CAMERA_CAR_SELECTOR;
        cameraHandler.updateCamera(time, null);
        carSelector.update(time);
    }
});

Script.scriptEnding.connect(function() {
    MyAvatar.scale = 1;
    Entities.deleteEntity(car);
    soundLoopSwitcher.stopSound();
    cameraHandler.shutdown();
    Controller.releaseKeyEvents({key: KEY.UP});
    Controller.releaseKeyEvents({key: KEY.DOWN});
    Controller.releaseKeyEvents({key: KEY.LEFT});
    Controller.releaseKeyEvents({key: KEY.RIGHT});
    Controller.captureKeyEvents({key: KEY.C});
    Controller.captureKeyEvents({key: KEY.SPACE});
    Controller.captureKeyEvents({key: KEY.DEL});
    carSelector.cleanup();
    trackSelector.cleanup();
    //speedometer.cleanup();
   /* Audio.playSound(soundShutdown, {
      position: MyAvatar.position,
      volume: 0.1
    });*/
});

Controller.captureKeyEvents({key: KEY.UP});
Controller.captureKeyEvents({key: KEY.DOWN});
Controller.captureKeyEvents({key: KEY.LEFT});
Controller.captureKeyEvents({key: KEY.RIGHT});
Controller.captureKeyEvents({key: KEY.C});
Controller.captureKeyEvents({key: KEY.SPACE});
Controller.captureKeyEvents({key: KEY.DEL});