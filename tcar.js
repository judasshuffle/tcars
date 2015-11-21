//  TCars/tcar.js
//
//  The main script to run TCars as a client
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

Script.include([
    'libraries/constants.js',
    'libraries/keys.js',
    'libraries/vehicles.js',
    'libraries/tracks.js',
    'libraries/player.js',
    'libraries/playerList.js',
    'libraries/messageViewer.js',
    'libraries/sessionList.js',
    'libraries/sessionClient.js',
    'libraries/speedometer.js',
    'libraries/carSelector.js',
    'libraries/avatarSeater.js',
    'libraries/cameraHandler.js',
    'libraries/trackSelector.js',
    'libraries/soundLoopSwitcher.js',
    'libraries/car.js'
]);

const MAX_MESSAGES = 20;
var messageViewer = new MessageViewer({x: 100, y: 100}, 'TCars MessagesViewer', MAX_MESSAGES);
var avatarSeater = new AvatarSeater();
var keyCapturer = new KeyCapturer();
var trackSelector = new TrackSelector();
var carSelector = new CarSelector();
var cameraHandler = new CameraHandler();
cameraHandler.init();
var car = null;
var state = STATE.LOBBY;
var lastSessionState = null;
var sessionBlock = null;
var selectedTrackID = null;

function setSessionState(sessionState) {
    lastSessionState = sessionState;
    switch(sessionState) {
        case SESSION_STATE.INITIAL:
            state = STATE.LOBBY;
            break;
        case SESSION_STATE.VOTE_TRACK:
            trackSelector.init();
            state = STATE.TRACK_SELECTION;
            break;
        case SESSION_STATE.LOADING:
            state = STATE.CAR_SELECTION;
            carSelector.init(TRACKS[selectedTrackID].vehicles);
            cameraHandler.setCameras(TRACKS[selectedTrackID].cameras);            
            break;
        case SESSION_STATE.COUNT_DOWN:
            state = STATE.RACE;
            break;
        case SESSION_STATE.RACING:
            state = STATE.RACE;
            break;
    }
}

var sessionClient = new SessionClient();
sessionClient.onMessage = messageViewer.append;
sessionClient.onUpdate = function(update) {
    print("update " + JSON.stringify(update) );
    if (update.seat !== undefined) {
        avatarSeater.setSeat(update.seat);
    }
    if (update.counter !== undefined) {
        //TODO: set countdown here (In seconds, make sure the client just keeps counting)
    }
    if (update.block !== undefined) {
        sessionBlock = update.block;
    }
    if (update.trackID !== undefined && update.trackID !== selectedTrackID) {
        selectedTrackID = update.trackID;
    }
    if (update.state !== undefined && update.state !== lastSessionState) {
        setSessionState(update.state);
    }

};
var sessionList = new SessionList({}, 'no-ip.thoysvps.nl', 18000);
sessionList.onSessionSelected = function(sessionWSURL, sessionInfo) {
    sessionClient.joinSession(sessionWSURL, sessionInfo);
    sessionList.hide();
};
sessionList.init();

var timeItWentWithoutMoving = 0;
var actionID = false;

var spacebarBlockly = 'Window.alert("You have not made a blockly script for this button yet!");'

var newWindow = new WebWindow('Customize your vehicle', 'https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/blockly-tcars/index.html', 700, 700);
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

function doSpaceBarBlockly() {
    eval(spacebarBlockly);
}

function mixFloats(float1, float2, mixValue) {
    if (mixValue > 1.0) {
        mixValue = 1.0;
    }
    return float1 + ((float2 - float1) * mixValue);
}

function isCarDriving() {
    return state == STATE.DRIVING || state == STATE.RACING;
}

function launchProjectile(carProps) {
    Entities.addEntity({
        type: 'Model',
        name: 'Projectile',
        shapeType: 'sphere',
        density: 8000,
        collisionsWillMove: true,
        ignoreForCollisions: false,
        position: Vec3.sum(carProps.position, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0, z: -7})),
        rotation: Quat.multiply(carProps.rotation, Quat.fromVec3Degrees({x: 270, y: 0, z: 0})),
        dimensions: {x: 1.25, y: 2.56, z: 1.45},
        modelURL: MODEL_FOLDER_URL + 'rockett.fbx',
        velocity: Vec3.sum(carProps.velocity, Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0, z: -10})),
        angularVelocity: Vec3.multiplyQbyV(carProps.rotation, {x: 0, y: 0, z: 20}),
        damping: 0,
        lifetime: 5
    });
    // TODO: attach this light to the projectile when parenting PR is merged
    Entities.addEntity({
        type: 'Light',
        name: 'Projectile-Light',
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

function handleDrivingKeyPress(event) {
    if (event.key == KEY.UP || event.key == KEY.W) {
        car.accelerating = true;
    } else if (event.key == KEY.DOWN || event.key == KEY.S) {
        car.reversing = true;
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

Controller.mousePressEvent.connect(function(event) {
    if (event.isLeftButton && sessionList.handleClickEvent(event.x, event.y)) {
        return true;
    }
});

Controller.keyPressEvent.connect(function(event) {
    if (isCarDriving()) {
        handleDrivingKeyPress(event);
    }
    if (state === STATE.TRACK_SELECTION) {
        if (event.key == KEY.LEFT || event.key == KEY.A) {
            trackSelector.prevTrack();
        } else if (event.key == KEY.RIGHT || event.key == KEY.D) {
            trackSelector.nextTrack();
        } else if (event.key == KEY.SPACE) {
            trackSelector.hide();
            sessionClient.voteTrack(trackSelector.selectedTrack);
            //
            //state = STATE.CAR_SELECTION;
        }
    } else if (state == STATE.CAR_SELECTION) {
        if (event.key == KEY.LEFT || event.key == KEY.A) {
            carSelector.prevCar();
        } else if (event.key == KEY.RIGHT || event.key == KEY.D) {
            carSelector.nextCar();
        } else if (event.key == KEY.SPACE) {
            var selectedCar = carSelector.selectableCars[carSelector.selectedCar];
            var selectedTrack = TRACKS[trackSelector.selectedTrack];
            //TODO: let the session-AC decide the seat
            //avatarSeater.setSeat(selectedTrack.seats[0]);
            car = new Car(selectedCar.vehicle, selectedTrack.startPosition, selectedTrack.startOrientation);
            state = STATE.DRIVING;
            cameraHandler.firstCamera();
            carSelector.cleanup();
        }
    }
});

Controller.keyReleaseEvent.connect(function(event) {
    if (isCarDriving()) {
        if (event.key == KEY.UP || event.key == KEY.W) {
            car.accelerating = false;
        } else if (event.key == KEY.DOWN || event.key == KEY.S) {
            car.reversing = false;
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
    } else if (state == STATE.TRACK_SELECTION) {
        cameraHandler.stance = CAMERA.TRACK_SELECTOR;
        cameraHandler.updateCamera(time, null);
        trackSelector.update(time);
    } else if (state == STATE.CAR_SELECTION) {
        cameraHandler.stance = CAMERA.CAR_SELECTOR;
        cameraHandler.updateCamera(time, null);
        carSelector.update(time);
    }
    var entities = Entities.findEntities(Camera.position, 100);
    for (key in entities) {
        entityItemID = entities[key];
        var properties = Entities.getEntityProperties(entityItemID);
        if (properties.name.substring(0, VEHICLE_MODEL_PREFIX.length) === VEHICLE_MODEL_PREFIX) {
            Entities.callEntityMethod(entityItemID, 'updateWheels');
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
    keyCapturer.releaseKeys();
    carSelector.cleanup();
    trackSelector.cleanup();
    sessionList.cleanup();
    messageViewer.cleanup();
    print('TCars script finished closing!')
    //speedometer.cleanup();
});
