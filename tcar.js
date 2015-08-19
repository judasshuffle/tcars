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

const MAX_DEGREES = 360;

// We have different states that the script switches between
const STATE_CAR_SELECTION = 0;
const STATE_PITSTOP = 1;
const STATE_DRIVING = 2;
const STATE_RACING = 3;
const STATE_GAMEOVER = 4;

const WHEEL_LEFT_FRONT = 0;
const WHEEL_RIGHT_FRONT = 1;
const WHEEL_LEFT_BACK = 2;
const WHEEL_RIGHT_BACK = 3;
const WHEEL_COUNT = 4;

const CAMERA_CAR_TOPVIEW = 0;
const CAMERA_CAR_HOOD = 1;
const CAMERA_CAR_MIRROR = 2;
const CAMERA_CAR_BEHIND_CLOSE = 3;
const CAMERA_CAR_BEHIND_MEDIUM = 4;
const CAMERA_CAR_BEHIND_FAR = 5;
const CAMERA_CAR_FIXED_WORLD = 6;
const CAMERA_CAR_SELECTOR = 7;
const CAMERA_CAR_FROM_USER_AUTOFOCUS = 8;
const CAMERA_CAR_FROM_USER_HMD = 9;

const CAR_SELECTOR_CAM_POS = {x: 7942.3974609375, y: 7919.84716796875, z: 7778.14501953125};
//const CAR_SELECTOR_CAM_ROT = {x: -0.030600588768720627, y: 0.9688771367073059, z: 0.18906143307685852, w: 0.15683221817016602};
const CAR_SELECTOR_CENTER = {x: 7937.99, y: 7913.61, z: 7801.6};
const CAR_SELECTOR_RADIUS = -9.5;
const CAR_SELECTOR_ROT_OFFSET = 10;
const CAR_SELECTOR_TURN_SPEED = 30;
const CAR_SELECTOR_ROT_SPEED = 2;

const DEFAULT_REGISTRATION_POINT = {x: 0.5, y: 0.5, z: 0.5};

const START_LOCATION = {pos: {x: 7969.8955078125, y: 7909.921875, z: 7788.82763671875}, rot: {x: 0, y: -0.8411639928817749, z: 0, w: 0.5407801270484924}};

const SPEED_FORWARD = 500;
const SPEED_BRAKES = 1015;

const SOUND_FOLDER_URL = "https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/";

const SOUND = false;

const MODEL_FOLDER_URL = "https://dl.dropboxusercontent.com/u/10483952/tcar/";

const VEHICLES = [
{
    name: "Capri",
    modelFile: "StandardisedCars/Capri.fbx",
    wheelModel: "StandardisedCars/capriwheelfbx.fbx?v2",
    dimensions: {x: 0.936, y: 0.778, z: 2.433},
    wheelDimensions: {x:0.098, y:0.348, Z:0.348},
    registrationPoint: {x: 0.5, y: 0.5, z: 0.8},
    frontAxlePos: {x: 0, y: -0.485, z: -2.919},
    backAxlePos: {x: 0, y: -0.485, z: 0.0},
    frontAxleLength: 1.65,
    backAxleLength: 1.65
},
{
    name: "The red one",
    modelFile: "Tcarchassis.fbx",
    wheelModel: "Twheel.fbx",
    dimensions: {x: 2.0, y: 1.5, z: 4.4},
    registrationPoint: {x: 0.5, y: 0.5, z: 0.8},
    frontAxlePos: {x: 0, y: -0.3, z: -2.6},
    backAxlePos: {x: 0, y: -0.3, z: 0.6},
    frontAxleLength: 2.5,
    backAxleLength: 2.5
},
{
    name: "BBCar",
    modelFile: "BBCAR.fbx",
    wheelModel: "Twheel.fbx",
    dimensions: {x: 3.21, y: 1.92, z: 4.39},
    registrationPoint: {x: 0.5, y: 0.5, z: 0.8},
    frontAxlePos: {x: 0, y: -0.3, z: -2.6},
    backAxlePos: {x: 0, y: -0.3, z: 0.2},
    frontAxleLength: 2.5,
    backAxleLength: 2.5
},
{
    name: "Wolf car",
    modelFile: "wolfcar.fbx",
    wheelModel: "Twheel.fbx",
    dimensions: {x: 4.73, y: 2.26, z: 5.61},
    registrationPoint: {x: 0.5, y: 0.5, z: 0.8},
    frontAxlePos: {x: 0, y: -0.7, z: -2.6},
    backAxlePos: {x: 0, y: -0.7, z: 0.6},
    frontAxleLength: 2.5,
    backAxleLength: 2.5
},
{
    name: "Cat",
    modelFile: "cat.fbx",
    wheelModel: "Twheel.fbx",
    dimensions: {x: 3.93, y: 2.73, z: 5.81},
    registrationPoint: {x: 0.5, y: 0.3, z: 0.8},
    frontAxlePos: {x: 0, y: -0.3, z: -3.0},
    backAxlePos: {x: 0, y: -0.3, z: 0.0},
    frontAxleLength: 2.5,
    backAxleLength: 2.5
},
{
    name: "Van the Hand",
    modelFile: "vanthehand.fbx",
    wheelModel: "Twheel.fbx",
    dimensions: {x: 4.80, y: 6.74, z: 5.37},
    registrationPoint: {x: 0.5, y: 0.5, z: 0.8},
    frontAxlePos: {x: 0, y: -0.3, z: -2.6},
    backAxlePos: {x: 0, y: -0.3, z: 0.6},
    frontAxleLength: 2.5,
    backAxleLength: 2.5
},
{
    name: "Shoe",
    modelFile: "SHOE1.fbx",
    wheelModel: "Twheel.fbx",
    dimensions: {x: 1.89, y: 4.34, z: 5.74},
    registrationPoint: {x: 0.5, y: 0.4, z: 0.75},
    frontAxlePos: {x: 0, y: -1.65, z: -3.2},
    backAxlePos: {x: 0.0, y: -1.65, z: -0.5}, // x is across y is up and down z is forward back.
    frontAxleLength: 2.5,
    backAxleLength: 2.5
},
{
    name: "Chaircar (BY FRAN)",
    modelFile: "Chaircar.fbx",
    wheelModel: "Twheel.fbx",
    dimensions: {x: 1.89, y: 4.34, z: 5.74},
    registrationPoint: {x: 0.5, y: 0.4, z: 0.75},
    frontAxlePos: {x: 0, y: -1.65, z: -3.2},
    backAxlePos: {x: 0.0, y: -1.65, z: -0.5}, // x is across y is up and down z is forward back.
    frontAxleLength: 2.5,
    backAxleLength: 2.5
}

];

var zoneInformation = {"rideZone":"School Tables", "seats": [
{"position":{"x":7938.66455078125,"y":7875.783203125,"z":7870.95166015625}, "rotation":{"x":-0.0000152587890625,"y":-0.0000152587890625,"z":-0.0000152587890625,"w":1}, "scale": 125}
]};


//Window.alert("you are in the zone: " +  zoneInformation.rideZone);

var seatInformation = zoneInformation.seats[0];

MyAvatar.scale = seatInformation.scale;
MyAvatar.position = seatInformation.position;
MyAvatar.orientation = seatInformation.rotation;

var car = null;

var state = STATE_CAR_SELECTION;

var soundAccelerating = SoundCache.getSound(SOUND_FOLDER_URL + "/accelerating.wav");
var soundDecelerating = SoundCache.getSound(SOUND_FOLDER_URL + "/decelerating.wav");
var soundIdle = SoundCache.getSound(SOUND_FOLDER_URL + "/idle.wav");
var soundShutdown = SoundCache.getSound(SOUND_FOLDER_URL + "/shutdown.wav");
var soundStarting = SoundCache.getSound(SOUND_FOLDER_URL + "/starting.wav");

//var newWindow = new WebWindow("Customize your vehicle", "https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/blockly-tcars/index.html", 700,700);
//newWindow.setVisible(true);

CameraHandler = function() {
    var _this = this;
    _this.cameraList = [CAMERA_CAR_FROM_USER_AUTOFOCUS, CAMERA_CAR_TOPVIEW, /*CAMERA_HOOD, */ CAMERA_CAR_BEHIND_CLOSE, /*CAMERA_BEHIND_MEDIUM, CAMERA_BEHIND_FAR, */ CAMERA_CAR_FIXED_WORLD];
    _this.stance = CAMERA_CAR_FIXED_WORLD;

    _this.shutdown = function() {
        Camera.mode = _this.oldCameraMode;
    };

    _this.updateCamera = function(updateTime, carProps) {
        if (_this.stance === CAMERA_CAR_TOPVIEW) {
            var targetPos = Vec3.sum(carProps.position, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 13, z: 13}));
            Camera.position = Vec3.mix(Camera.position, targetPos, updateTime);
            var previousOrientation = Camera.orientation;
            Camera.lookAt(Vec3.sum(carProps.position, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 2, z: -13})));
            Camera.orientation = Quat.mix(previousOrientation, Camera.orientation, updateTime * 2);
        } else if (_this.stance === CAMERA_CAR_BEHIND_CLOSE) {
            Camera.position = Vec3.sum(carProps.position, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 2, z: 5}));
            Camera.orientation = carProps.rotation;
        } else if (_this.stance === CAMERA_CAR_FIXED_WORLD) {
            Camera.position = Vec3.sum(carProps.position, {x: 15, y: 20 + (Vec3.length(carProps.velocity) * 2), z: 0});
            Camera.lookAt(carProps.position);
        } else if (_this.stance === CAMERA_CAR_SELECTOR) {
            Camera.position = CAR_SELECTOR_CAM_POS;
            Camera.lookAt(CAR_SELECTOR_CENTER);
        } else if (_this.stance === CAMERA_CAR_FROM_USER_AUTOFOCUS) {
            Camera.position = MyAvatar.getEyePosition();//Vec3.mix(Camera.position, targetPos, updateTime);
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

SpeedOMeter = function() {
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
//var speedOMeter = new SpeedOMeter();

function mixFloats(float1, float2, mixValue) {
    if (mixValue > 1.0) {
        mixValue = 1.0;
    }
    return float1 + ((float2 - float1) * mixValue);
}

CarSelectorWheel = function(selectableCar, wheelIndex) {
    var _this = this;
    _this.selectableCar = selectableCar;
    _this.wheelIndex = wheelIndex;
    var getPositionOffset = function() {
        switch (_this.wheelIndex) {
            case WHEEL_LEFT_FRONT:
                return Vec3.sum(_this.selectableCar.vehicle.frontAxlePos, {x: -_this.selectableCar.vehicle.frontAxleLength / 2});
            case WHEEL_RIGHT_FRONT:
                return Vec3.sum(_this.selectableCar.vehicle.frontAxlePos, {x: _this.selectableCar.vehicle.frontAxleLength / 2});
            case WHEEL_LEFT_BACK:
                return Vec3.sum(_this.selectableCar.vehicle.backAxlePos, {x: -_this.selectableCar.vehicle.backAxleLength / 2});
            case WHEEL_RIGHT_BACK:
                return Vec3.sum(_this.selectableCar.vehicle.backAxlePos, {x: _this.selectableCar.vehicle.backAxleLength / 2});
        }
        return {};
    };
    var getRotationOffset = function() {
        switch (_this.wheelIndex) {
            case WHEEL_LEFT_FRONT:
            case WHEEL_LEFT_BACK:
                return Quat.fromPitchYawRollDegrees(0, 0, 180);
            case WHEEL_RIGHT_FRONT:
            case WHEEL_RIGHT_BACK:
                return Quat.fromPitchYawRollDegrees(0, 0, 0);
        }
        return {};
    };
    var vehicleRegPoint = _this.selectableCar.vehicle.registrationPoint;
    _this.positionOffset = Vec3.sum(getPositionOffset(), {
        x: ((vehicleRegPoint.x - DEFAULT_REGISTRATION_POINT.x) * 4),
        y: ((vehicleRegPoint.y - DEFAULT_REGISTRATION_POINT.y) * 4),
        z: ((vehicleRegPoint.z - DEFAULT_REGISTRATION_POINT.z) * 4)
    });
    _this.rotationOffset = getRotationOffset();
    
    _this.overlay = Overlays.addOverlay("model", {
        url: MODEL_FOLDER_URL + _this.selectableCar.vehicle.wheelModel,
        dimensions: 0, // you cannot change the dimensions
        //position: wheelPos, dimensions: {x: 0.63, y: 0.99, z:0.99},
        //rotation: this.properties.rotation
    });

    _this.update = function(carPosition) {
      // print(JSON.stringify(carPosition));
        Overlays.editOverlay(_this.overlay, {
            position: Vec3.sum(carPosition, Vec3.multiplyQbyV(_this.selectableCar.rotation, _this.positionOffset)),
            rotation: Quat.multiply(_this.selectableCar.rotation, _this.rotationOffset)
        });
    };

    this.cleanup = function() {
        Overlays.deleteOverlay(_this.overlay);
    };
};

CarSelector = function() {
    var _this = this;
    _this.selectedCar = 0;
    _this.selectableCars = [];
    _this.carouselRot = 0;
    _this.carouselTargetRot = 0;
    _this.carTitleOverlay = null;
    _this.init = function() {
        print("Car selector initializing...");
        for (var i = 0; i < VEHICLES.length; i++) {
            var selectableCar = {vehicle: VEHICLES[i], rotation: {x: 0, y: 0, z: 0, w: 1}, currentDegrees: 0};
            selectableCar.overlay = Overlays.addOverlay("model", {
                url: MODEL_FOLDER_URL + selectableCar.vehicle.modelFile + "?v=" + (new Date()).getTime(),
                position: Vec3.sum(CAR_SELECTOR_CENTER, {x: 0, y: selectableCar.vehicle.dimensions.y / 2, z: 0}),
                dimensions: selectableCar.vehicle.dimensions,
                visible: true
                //scale: 0.01///alpha: 0.5
            });
            selectableCar.wheels = [];
            for (var j = 0; j < WHEEL_COUNT; j++) {
                //var wheelPos = Vec3.sum(this.properties.position, Vec3.multiplyQbyV(this.properties.rotation, getPositionOffset(i)));
                selectableCar.wheels[j] = new CarSelectorWheel(selectableCar, j);
            }            
            _this.selectableCars.push(selectableCar);
        }
        _this.carTitleOverlay = Overlays.addOverlay("text", {
            x: 200,
            y: 200,
            width: 1000,
            height: 200,
            textColor: {red: 0, green: 0, blue: 0},
            alpha: 1,
            backgroundAlpha: 0,
            visible: true
        });
        _this.updateCarSelectionText();
    };

    _this.nextCar = function() {
        _this.selectedCar = (_this.selectedCar + 1) % _this.selectableCars.length;
        _this.updateCarSelectionText();
    };

    _this.prevCar = function() {
        _this.selectedCar = (_this.selectedCar + (_this.selectableCars.length - 1)) % _this.selectableCars.length;
        _this.updateCarSelectionText();
    };

    _this.updateCarSelectionText = function() {
        _this.setSelectionText(_this.selectableCars[_this.selectedCar].vehicle.name)
    };

    _this.setSelectionText = function(text) {
        Overlays.editOverlay(_this.carTitleOverlay, {text: text});
    };

    function normalizeDegrees(degrees) {
        return (degrees + MAX_DEGREES) % MAX_DEGREES;
    }

    function mixDegreesTowards(currentRotation, targetRotation, mixValue) {
        if (mixValue > 1.0) {
            mixValue = 1.0;
        }
        currentRotation = normalizeDegrees(currentRotation);
        var leftDistance = normalizeDegrees(currentRotation - targetRotation);
        var rightDistance = normalizeDegrees(targetRotation - currentRotation);
        if (leftDistance < rightDistance) {
            return currentRotation - (leftDistance * mixValue);
        }
        return currentRotation + (rightDistance * mixValue);
    }  

    _this.update = function(time) {
        var radiusOffset = {x: 0, y: 0, z: CAR_SELECTOR_RADIUS};
        var degreesPerCar = MAX_DEGREES / _this.selectableCars.length;

        _this.carouselTargetRot = (_this.selectedCar * degreesPerCar) + CAR_SELECTOR_ROT_OFFSET;
        _this.carouselRot = mixDegreesTowards(_this.carouselRot, _this.carouselTargetRot, time * CAR_SELECTOR_ROT_SPEED);

        _this.selectableCars.forEach(function(selectableCar, index, object) {
            var rotationOffset = Quat.fromPitchYawRollDegrees(0.0, (index * degreesPerCar) - _this.carouselRot, 0.0);
            var newProperties = {
                position: Vec3.sum(Vec3.sum(CAR_SELECTOR_CENTER, Vec3.multiplyQbyV(rotationOffset, radiusOffset)), {x: 0, y: selectableCar.vehicle.dimensions.y / 2, z: 0})
            };
            if (index == _this.selectedCar) {
                selectableCar.rotation = Quat.multiply(selectableCar.rotation, Quat.fromVec3Degrees({x: 0, y: CAR_SELECTOR_TURN_SPEED * time, z: 0}));
                newProperties.rotation = selectableCar.rotation;
            }
            Overlays.editOverlay(selectableCar.overlay, newProperties);
            for (var i = 0; i < selectableCar.wheels.length; i++) {
                selectableCar.wheels[i].update(newProperties.position);
            }            
        });
    };

    _this.cleanup = function() {
        _this.selectableCars.forEach(function(selectableCar, index, object) {
            Overlays.deleteOverlay(selectableCar.overlay);
            for (var i = 0; i < selectableCar.wheels.length; i++) {
                selectableCar.wheels[i].cleanup();
            }  
        });
        Overlays.deleteOverlay(_this.carTitleOverlay);
        _this.selectableCars = [];
    };
};

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
};

var carSelector = new CarSelector();
carSelector.init();

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
function launchMissile(carProps) {
    Entities.addEntity({
            type: "Model",
            name: "Rocket",
            shapeType: "sphere",
            collisionsWillMove: true,
            ignoreForCollisions: false,
            position: Vec3.sum(carProps.position, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0, z: - 4})),
            rotation: Quat.multiply(carProps.rotation, Quat.fromVec3Degrees({x: 270, y: 0, z: 0})),
            dimensions: {x: 1.25, y: 2.56, z: 1.45},
            modelURL: MODEL_FOLDER_URL + "rockett.fbx?123",
            velocity: Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0, z: -10}),
            angularVelocity: Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0, z: 20}),
            damping: 0,
            lifetime: 5
        });
}

// part 1 - the engine
// part 2 - the wheels
/// X+  is forward
function handleDrivingKeyPress(event) {
    if (event.key == KEY_UP) {
        planking = true;
        soundLoopSwitcher.setSound(soundAccelerating);
    } else if (event.key == KEY_LEFT) {
        steeringLeft = true;
    } else if (event.key == KEY_RIGHT) {
        steeringRight = true;
    } else if (event.key == KEY_C) {
        event.isShifted ? cameraHandler.prevCamera() : cameraHandler.nextCamera();
    } else if (event.key == KEY_SPACE) {
        launchMissile(Entities.getEntityProperties(car));
    }
}

Controller.keyPressEvent.connect(function(event) {
    if (isCarDriving()) {
        handleDrivingKeyPress(event);
    }
    if (state == STATE_CAR_SELECTION) {
        if (event.key == KEY_LEFT) {
            carSelector.prevCar();
        } else if (event.key == KEY_RIGHT) {
            carSelector.nextCar();
        } else if (event.key == KEY_SPACE) {
            var selectedCar = carSelector.selectableCars[carSelector.selectedCar];
            var newProperties = {
                type: "Model",
                modelURL: MODEL_FOLDER_URL + selectedCar.vehicle.modelFile + "?v=" + (new Date()).getTime(),
                shapeType: "box",
                name: "TCarModel-" + selectedCar.vehicle.name,
                rotation: START_LOCATION.rot,//MyAvatar.orientation,
                position: START_LOCATION.pos,//Vec3.sum(MyAvatar.position, {x: 2}),
                color: {red: 0, green: 255, blue: 0},
                dimensions: selectedCar.vehicle.dimensions,
                collisionsWillMove: true,
                ignoreForCollisions: false,
                gravity: {x: 0, y: -9.81, z: 0},
                script: "https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/tcarEntityScript.js?v=" + (new Date()).getTime(),
                density: 4000,
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
            cameraHandler.stance = CAMERA_CAR_FIXED_WORLD;
            carSelector.cleanup();
        }
    }
});

Controller.keyReleaseEvent.connect(function(event) {
    if (isCarDriving()) {
        if (event.key == KEY_UP) {
             planking = false;
             soundLoopSwitcher.setSound(soundDecelerating);
        } else if (event.key == KEY_LEFT) {
            steeringLeft = false;
        } else if (event.key == KEY_RIGHT) {
            steeringRight = false;
        }
    }
});

var timeItWentWithoutMoving = 0;

var actionID = false;
function updateCar(time) {
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
        speedOMeter.update(time);
    } else if (state == STATE_CAR_SELECTION) {
        cameraHandler.stance = CAMERA_CAR_SELECTOR;
        cameraHandler.updateCamera(time, null);
        carSelector.update(time);
    }
});

//Entities



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
    MyAvatar.scale = 1;
    Entities.deleteEntity(car);
    soundLoopSwitcher.stopSound();
    cameraHandler.shutdown();
    carSelector.cleanup();
    speedOMeter.cleanup();
    Controller.releaseKeyEvents({key: KEY_UP});
    Controller.releaseKeyEvents({key: KEY_DOWN});
    Controller.releaseKeyEvents({key: KEY_LEFT});
    Controller.releaseKeyEvents({key: KEY_RIGHT});
    Controller.captureKeyEvents({key: KEY_C});
    Controller.captureKeyEvents({key: KEY_SPACE});
    Controller.captureKeyEvents({key: KEY_DEL});
   /* Audio.playSound(soundShutdown, {
      position: MyAvatar.position,
      volume: 0.1
    });*/
});

Controller.captureKeyEvents({key: KEY_UP});
Controller.captureKeyEvents({key: KEY_DOWN});
Controller.captureKeyEvents({key: KEY_LEFT});
Controller.captureKeyEvents({key: KEY_RIGHT});
Controller.captureKeyEvents({key: KEY_C});
Controller.captureKeyEvents({key: KEY_SPACE});
Controller.captureKeyEvents({key: KEY_DEL});
