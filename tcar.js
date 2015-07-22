// car script 1.0 © thoys 2015
// no refunds
// Audio effects by Konstantin
// Models by Judas
// Car tuning by unknown

const KEY_UP = 16777235;
const KEY_DOWN = 16777237;
const KEY_LEFT = 16777234;
const KEY_RIGHT = 16777236;
const KEY_C = 67;
const KEY_SPACE = 32;
const KEY_DEL = 16777223;


const CAMERA_TOPVIEW = 0;
const CAMERA_HOOD = 1;
const CAMERA_MIRROR = 2;
const CAMERA_BEHIND_CLOSE = 3;
const CAMERA_BEHIND_MEDIUM = 4;
const CAMERA_BEHIND_FAR = 5;
const CAMERA_FIXED_WORLD = 6;

const SPEED_FORWARD = 5;
const SPEED_BRAKES = 15;

const ASSET_URL = "https://dl.dropboxusercontent.com/u/14997455/hifi/tcar/";

const SOUND = false;

var soundAccelerating = SoundCache.getSound(ASSET_URL + "/accelerating.wav");
var soundDecelerating = SoundCache.getSound(ASSET_URL + "/decelerating.wav");
var soundIdle = SoundCache.getSound(ASSET_URL + "/idle.wav");
var soundShutdown = SoundCache.getSound(ASSET_URL + "/shutdown.wav");
var soundStarting = SoundCache.getSound(ASSET_URL + "/starting.wav");

if (SOUND) {
    Audio.playSound(soundStarting, {
	    position: MyAvatar.position,
        volume: 0.1
    });
}

CameraHandler = function() {
    var _this = this;
    _this.cameraList = [CAMERA_TOPVIEW, /*CAMERA_HOOD, */ CAMERA_BEHIND_CLOSE /*, CAMERA_BEHIND_MEDIUM, CAMERA_BEHIND_FAR*/, CAMERA_FIXED_WORLD];
    _this.stance = CAMERA_FIXED_WORLD;
    _this.shutdown = function() {
        Camera.mode = _this.oldCameraMode;
    };

    _this.updateCamera = function(updateTime, carProps) {
        if (_this.stance === CAMERA_TOPVIEW) {
            var targetPos = Vec3.sum(carProps.position, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 13, z: 13}));
            Camera.position = Vec3.mix(Camera.position, targetPos, updateTime);
            var previousOrientation = Camera.orientation;
            Camera.lookAt(Vec3.sum(carProps.position, {x: 0, y: 2, z: 0}));
            Camera.orientation = Quat.mix(previousOrientation, Camera.orientation, updateTime);
        } else if (_this.stance === CAMERA_BEHIND_CLOSE) {
            Camera.position = Vec3.sum(carProps.position, Vec3.multiplyQbyV(carProps.rotation ,{x: 0, y: 2, z: 5}));
            Camera.orientation = carProps.rotation;
        } else if (_this.stance === CAMERA_FIXED_WORLD) {
            Camera.position = Vec3.sum(carProps.position, {x: 15, y: 20 + (Vec3.length(carProps.velocity) * 2), z: 0});
            Camera.lookAt(carProps.position);
        }
    };

    _this.nextCamera = function() {
        _this.stance = _this.cameraList[(_this.cameraList.indexOf(_this.stance) + 1) % _this.cameraList.length];
    };

    _this.prevCamera = function() {
        _this.stance = _this.cameraList[(_this.cameraList.indexOf(_this.stance) + (_this.cameraList.length - 1)) % _this.cameraList.length];
    };

    _this.oldCameraMode = Camera.mode;
    Camera.mode = "independent";    
};

var cameraHandler = new CameraHandler();

SoundLoopSwitcher = function() {
    this.sound = null;
    this.injector = null;
    this.setSound = function(sound) {
        if (!SOUND) { return; }
        if (this.sound !== sound) {
            this.stopSound();
            this.sound = sound;
            this.injector = Audio.playSound(this.sound, {
	            position: MyAvatar.position,
                volume: 0.05,
                loop: true
            });
        }
    }
    this.stopSound = function() {
        if (this.injector !== null) {
            this.injector.stop();
            this.sound = null;
            this.injector = null;
        }
    }
}
var soundLoopSwitcher = new SoundLoopSwitcher();
soundLoopSwitcher.setSound(soundIdle);
// part 0 - the chassis

var car = Entities.addEntity({
    type: "Model",
    modelURL: "https://dl.dropboxusercontent.com/u/10483952/tcar/Tcarchassis.fbx?v=5",
    shapeType: "box",
    name: "TCarModel",
    rotation: MyAvatar.orientation,
    position: Vec3.sum(MyAvatar.position, {x: 2}),
    color: {red: 0, green: 255, blue: 0},
    dimensions: {x: 2.0, y: 1.5, z: 4.4},
    collisionsWillMove: true,
    ignoreForCollisions: false,
    gravity: {x: 0, y: -9.81, z: 0},
    script: "https://dl.dropboxusercontent.com/u/14997455/hifi/tcar/tcarEntityScript10.js?v=" + (new Date()).getTime(),
    density: 4000,
    damping: 0,
    angularDamping: 0,
    registrationPoint: {x: 0.5, y: 0.5, z: 0.8}
   // collisionSoundURL: "https://dl.dropboxusercontent.com/u/14997455/hifi/tcar/collision.wav?v=2"
    
});

var speed = 0;
var speedI = 0;
var lastSpeedI = 0;
var lastAngularVelocityY = 0;
var planking = false;
var steeringOffset = 0; // - will be left,  + will be right
var steeringLeft = false;
var steeringRight = false;

// part 1 - the engine
// part 2 - the wheels
/// X+  is forward
Controller.keyPressEvent.connect(function(event) {
    if (event.key == KEY_UP) {
        planking = true;
        soundLoopSwitcher.setSound(soundAccelerating);
    } else if (event.key == KEY_LEFT) {
        steeringLeft = true;
    } else if (event.key == KEY_RIGHT) {
        steeringRight = true;
    } else if (event.key == KEY_C) {
        cameraHandler.nextCamera();
    } else if (event.key == KEY_SPACE) {
        var carProps = Entities.getEntityProperties(car);
        Entities.addEntity({
            type: "Model",
            name: "Rocket",
            position: Vec3.sum(carProps.position, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0, z: - 4})),
            rotation: Quat.multiply(carProps.rotation, Quat.fromVec3Degrees({x: 270, y: 0, z: 0})),
            dimensions: {x: 1.25, y: 2.56, z: 1.45},
            modelURL: "https://dl.dropboxusercontent.com/u/10483952/tcar/rockett.fbx?123",
            velocity: Vec3.multiplyQbyV(carProps.rotation ,{x: 0, y: 0, z: -10}),
            damping: 0,
            lifetime: 5
        });
    }
});
Controller.keyReleaseEvent.connect(function(event) {
    if (event.key == KEY_UP) {
         planking = false;
         soundLoopSwitcher.setSound(soundDecelerating);
    } else if (event.key == KEY_LEFT) {
        steeringLeft = false;
    } else if (event.key == KEY_RIGHT) {
        steeringRight = false;
    }
});

var actionID = false;

Script.update.connect(function(time) {
    var carProps = Entities.getEntityProperties(car);
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
    //TODO: (optional) automatic turning back of steering wheel
    

    //steeringOffset -= 0.1;
    if (speedI < 0) {
        speedI = 0;
        soundLoopSwitcher.setSound(soundIdle);
    }
    // print(-Math.log(1 + speedI, 0.1));
    cameraHandler.updateCamera(time, carProps);
    
    var newProperties = {};
    if (speedI !== lastSpeedI) {
        newProperties.velocity = Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0, z: -Math.log(1 + speedI, 0.1)});
        newProperties.velocity.y = carProps.velocity.y;
    }
    
    var angularVelocityY = Math.log(1 + speedI, 0.1) * steeringOffset;
    if (angularVelocityY !== lastAngularVelocityY) {
        // Math.log(1 + speedI, 0.1) * steeringOffset;
        lastAngularVelocityY = angularVelocityY;
        newProperties.angularVelocity = {x: 0.0, y: angularVelocityY, z: 0.0};
    }
    //newProperties.angularVelocity = {x: 0.0, y: Math.log(1 + speedI, 0.1) * steeringOffset, z: 0.0};
    
    if (Object.keys(newProperties).length > 0) {
        Entities.editEntity(car, newProperties);
    }
    /*var actionArgs = {targetPosition: Vec3.sum(carProps, {x: 0, y: 0, z: -Math.log(1 + speedI, 0.1)}), linearTimeScale: 0.1};
    if (!actionID) {
        actionID = Entities.addAction("spring", car, actionArgs);
    } else {
        Entities.updateAction(car, actionID, actionArgs);
    }*/
});




// part 3 - the window wipers




// part 4 - the fuel cap



// part 5 - make sure there is gas (gas station)




// part 6 - car theft




// part 7 - proper camera movement




// part 8 - belt warning lights





// part 9 - other lights and sigaret lighter/electric input




// part 10 - doorhandles



// part 11 - think about part 12



// part 13 - tail lights
// part 13.1 - fog lights

// part 14 - handbreak

Script.scriptEnding.connect(function() {
    Entities.deleteEntity(car);
    soundLoopSwitcher.stopSound();
    cameraHandler.shutdown();
    Controller.releaseKeyEvents({key: KEY_UP});
    Controller.releaseKeyEvents({key: KEY_DOWN});
    Controller.releaseKeyEvents({key: KEY_LEFT});
    Controller.releaseKeyEvents({key: KEY_RIGHT});
    Controller.captureKeyEvents({key: KEY_C});
    Controller.captureKeyEvents({key: KEY_SPACE});
    Controller.captureKeyEvents({key: KEY_DEL});
    Audio.playSound(soundShutdown, {
	  position: MyAvatar.position,
      volume: 0.1
    });
});

Controller.captureKeyEvents({key: KEY_UP});
Controller.captureKeyEvents({key: KEY_DOWN});
Controller.captureKeyEvents({key: KEY_LEFT});
Controller.captureKeyEvents({key: KEY_RIGHT});
Controller.captureKeyEvents({key: KEY_C});
Controller.captureKeyEvents({key: KEY_SPACE});
Controller.captureKeyEvents({key: KEY_DEL});
