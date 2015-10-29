// car script 1.0.2 © thoys 2015
// no refunds
// Audio effects by Konstantin
// Models by Judas VERY important code also by Judas
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
    'libraries/soundLoopSwitcher.js',
    'libraries/car.js'
]);


AvatarSeater = function() {
    var _this = this;
    _this.originalPosition = MyAvatar.position;
    _this.originalOrientation = MyAvatar.orientation;
    _this.originalScale = MyAvatar.scale;

    _this.setSeat = function(seat) {
        MyAvatar.position = seat.position;
        MyAvatar.orientation = seat.rotation;
        MyAvatar.scale = seat.scale;
    };

    _this.cleanup = function() {
        MyAvatar.position = _this.originalPosition;
        MyAvatar.orientation = _this.originalOrientation;
        MyAvatar.scale = _this.originalScale;
    };
};

var avatarSeater = new AvatarSeater();

var car = null;

var state = STATE_TRACK_SELECTION;

var soundAccelerating = SoundCache.getSound(SOUND_FOLDER_URL + "enginenoise1.wav");
var soundDecelerating = SoundCache.getSound(SOUND_FOLDER_URL + "decelerating.wav");
var soundIdle = SoundCache.getSound(SOUND_FOLDER_URL + "idle.wav");
var soundShutdown = SoundCache.getSound(SOUND_FOLDER_URL + "shutdown.wav");
var soundStarting = SoundCache.getSound(SOUND_FOLDER_URL + "starting.wav");

var timeItWentWithoutMoving = 0;
var actionID = false;

var spacebarBlockly = 'Window.alert("You have not made a blockly script for this button yet!");'

var newWindow = new WebWindow("Customize your vehicle", "https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/blockly-tcars/index.html", 700,700);
newWindow.eventBridge.webEventReceived.connect(function(data) {
    data = JSON.parse(data);
    switch (data.action) {
        case 'ping':
           // Window.alert('pong');
            break;
        case 'run':
            Window.alert(data.script);
            spacebarBlockly = data.script;
            break;
    }
});

//var speedometer = new Speedometer();



function doSpaceBarBlockly() {
    eval(spacebarBlockly);
}

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
        velocity: Vec3.sum(carProps.velocity, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0, z: -10})),
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
    if (event.key == KEY.UP || event.key == KEY.W) {
        car.accelerating = true;
        car.soundLoopSwitcher.setSound(soundAccelerating);
    } else if (event.key == KEY.LEFT || event.key == KEY.A) {
        car.steeringLeft = true;
    } else if (event.key == KEY.RIGHT || event.key == KEY.D) {
        car.steeringRight = true;
    } else if (event.key == KEY.C) {
        event.isShifted ? cameraHandler.prevCamera() : cameraHandler.nextCamera();
    } else if (event.key == KEY.R) {
        car.reset();
    } else if (event.key == KEY.B) {
        newWindow.setVisible(true);
    } else if (event.key == KEY.SPACE) {
        //launchProjectile(Entities.getEntityProperties(car.entity));
        doSpaceBarBlockly();
    }
}

Controller.keyPressEvent.connect(function(event) {
    if (isCarDriving()) {
        handleDrivingKeyPress(event);
    }
    if (state === STATE_TRACK_SELECTION) {
        if (event.key == KEY.LEFT || event.key == KEY.A) {
            trackSelector.prevTrack();
        } else if (event.key == KEY.RIGHT || event.key == KEY.D) {
            trackSelector.nextTrack();
        } else if (event.key == KEY.SPACE) {
            trackSelector.hide();
            carSelector.init(TRACKS[trackSelector.selectedTrack].vehicles);
            cameraHandler.setCameras(TRACKS[trackSelector.selectedTrack].cameras);
            state = STATE_CAR_SELECTION;
        }
    } else if (state == STATE_CAR_SELECTION) {
        if (event.key == KEY.LEFT || event.key == KEY.A) {
            carSelector.prevCar();
        } else if (event.key == KEY.RIGHT || event.key == KEY.D) {
            carSelector.nextCar();
        } else if (event.key == KEY.SPACE) {
            var selectedCar = carSelector.selectableCars[carSelector.selectedCar];
            var selectedTrack = TRACKS[trackSelector.selectedTrack];
            avatarSeater.setSeat(selectedTrack.seats[0])
            car = new Car(selectedCar.vehicle, selectedTrack.startPosition, selectedTrack.startOrientation);
            state = STATE_DRIVING;
            cameraHandler.firstCamera();
            carSelector.cleanup();
        }
    }
});

Controller.keyReleaseEvent.connect(function(event) {
    if (isCarDriving()) {
        if (event.key == KEY.UP || event.key == KEY.W) {
            car.accelerating = false;
            car.soundLoopSwitcher.setSound(soundDecelerating);
        } else if (event.key == KEY.LEFT || event.key == KEY.A) {
            car.steeringLeft = false;
        } else if (event.key == KEY.RIGHT || event.key == KEY.D) {
            car.steeringRight = false;
        }
    }
});

Script.update.connect(function(time) {
    if (isCarDriving()) {
        car.update(time);
        var carProps = Entities.getEntityProperties(car.entity);
        cameraHandler.updateCamera(time, carProps);
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
    //for (var i in trackedCars) {
    var entities = Entities.findEntities(Camera.position, 100);
    for (key in entities) {
        entityItemID = entities[key];
        var properties = Entities.getEntityProperties(entityItemID);
        if (properties.name.substring(0, VEHICLE_MODEL_PREFIX.length) === VEHICLE_MODEL_PREFIX) {
            Entities.callEntityMethod(entityItemID, "updateWheels");
        }
    }
});

Script.scriptEnding.connect(function() {
    print('TCars script closing...');
    avatarSeater.cleanup();
    if (car !== null) {
        car.cleanup();
    }
    cameraHandler.shutdown();
    for (var i = 0; i < ALL_KEYS.length; i++) {
        Controller.releaseKeyEvents({key: ALL_KEYS[i]});
    }
    carSelector.cleanup();
    trackSelector.cleanup();
    print('TCars script finished closing!')
    //speedometer.cleanup();
   /* Audio.playSound(soundShutdown, {
      position: MyAvatar.position,
      volume: 0.1
    });*/
});

for (var i = 0; i < ALL_KEYS.length; i++) {
    Controller.captureKeyEvents({key: ALL_KEYS[i]});
}
