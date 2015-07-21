// car script 1.0  © thoys 2015
// no refunds
// Audio effects by Konstantin
// Models by Judas
// Car tuning by unknown

const KEY_UP = 16777235;
const KEY_DOWN = 16777237;
const KEY_LEFT = 16777234;
const KEY_RIGHT = 16777236;
const KEY_C = 241242141424124;

const CAMERA_TOPVIEW = 0;
const CAMERA_HOOD = 1;
const CAMERA_MIRROR = 2;
const CAMERA_BEHIND_CLOSE = 3;
const CAMERA_BEHIND_MEDIUM = 4;
const CAMERA_BEHIND_FAR = 5;

const SPEED_FORWARD = 5;
const SPEED_BRAKES = 15;

const ASSET_URL = "https://dl.dropboxusercontent.com/u/14997455/hifi/tcar/";

const SOUND = true;

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
    _this.stance = CAMERA_TOPVIEW;
    _this.shutdown = function() {
        Camera.mode = _this.oldCameraMode;
    };

    this.updateCamera = function(carProps) {
        if (_this.stance === CAMERA_TOPVIEW) {
            Camera.position = Vec3.sum(carProps.position,  Vec3.multiplyQbyV(carProps.rotation ,{x: 0, y: 13, z: 13}));
            //Camera.orientation = carProps.rotation;
            Camera.lookAt(carProps.position);
        } else if (_this.stance === CAMERA_BEHIND_CLOSE) {
            Camera.position = Vec3.sum(carProps.position,  Vec3.multiplyQbyV(carProps.rotation ,{x: 0, y: 2, z: 5}));
            Camera.orientation = carProps.rotation;
        } 
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

print(JSON.stringify(Entities.getEntityProperties(car)));

var speed = 0;
var speedI = 0;
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
    }
    print(JSON.stringify(event));
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
    //print(JSON.stringify(event));
});

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
    //TODO: automatic turning back of wheels
    

    //steeringOffset -= 0.1;
    if (speedI < 0) {
        speedI = 0;
        soundLoopSwitcher.setSound(soundIdle);
    }
    cameraHandler.updateCamera(carProps);
    Entities.editEntity(car, {
        velocity: Vec3.multiplyQbyV(carProps.rotation ,{x: 0, y: 0, z: -Math.log(1 + speedI, 0.1)}),
        angularVelocity: {x: 0.0, y: Math.log(1 + speedI, 0.1) * steeringOffset, z: 0.0}
    });
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
