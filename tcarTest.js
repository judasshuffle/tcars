// car scriptsa 1.0.2 © thoys 2015
// no refunds
// Audio effects by Konstantin
// Models by Judas VERY important code also by Judas
// Car tuning by unknown

var Car = Script.require('./modules/car.js').Car;
var VEHICLES = Script.require('./modules/vehicles.js');
var KEY = Script.require('./modules/keys.js').KEY;
var CameraHandler = Script.require('./modules/cameraHandler.js').CameraHandler;
/*
var newWindow = new WebWindow("Script your vehicle", TCARS_BLOCKLY_URL, 700, 700);
newWindow.setVisible(true);
newWindow.eventBridge.webEventReceived.connect(function(data) {
    data = JSON.parse(data);
    switch (data.action) {
        case 'ping':
           // Window.alert('pong');
            break;
        case 'run':
            Window.alert(data.script);
            break;
    }
});
newWindow.eventBridge.emitScriptEvent(JSON.stringify({action: 'hello'}));
*/

var cameraHandler = new CameraHandler();
cameraHandler.init();

var vehicles = [
    new Car(VEHICLES['BLUES'],
        Vec3.sum(MyAvatar.position, {x: 0, y: 1, z: 0}),
        MyAvatar.orientation, 1, true),
    new Car(VEHICLES['BLUES'],
        Vec3.sum(MyAvatar.position, {x: 0, y: 1, z: 0}),
        MyAvatar.orientation, 1, true),
    new Car(VEHICLES['BLUES'],
        Vec3.sum(MyAvatar.position, {x: 0, y: 1, z: 0}),
        MyAvatar.orientation, 1, true),

];
var selectedVehicle = vehicles[0];

vehicles.forEach(function(vehicle) {
    vehicle.accelerating = true;
});

Script.update.connect(function(time) {
    vehicles.forEach(function(vehicle) {
        vehicle.update(time);
        if (vehicle === selectedVehicle) {
            var carProps = Entities.getEntityProperties(vehicle.entity);
            cameraHandler.updateCamera(time, carProps);
        }
    });
});

Controller.keyPressEvent.connect(function(event) {
    if (event.key === KEY.UP || event.key === KEY.W) {
        selectedVehicle.accelerating = true;
    } else if (event.key === KEY.DOWN || event.key === KEY.S) {
        selectedVehicle.reversing = true;
    } else if (event.key === KEY.LEFT || event.key === KEY.A) {
        selectedVehicle.steeringLeft = true;
    } else if (event.key === KEY.RIGHT || event.key === KEY.D) {
        selectedVehicle.steeringRight = true;
    } else if (event.key === KEY.C) {
        selectedVehicle.isShifted ? cameraHandler.prevCamera() : cameraHandler.nextCamera();
    } else if (event.key === KEY.R) {
        selectedVehicle.reset();
    }
});

Controller.keyReleaseEvent.connect(function(event) {
    if (event.key === KEY.UP || event.key === KEY.W) {
        selectedVehicle.accelerating = false;
    } else if (event.key === KEY.DOWN || event.key === KEY.S) {
        selectedVehicle.reversing = false;
    } else if (event.key === KEY.LEFT || event.key === KEY.A) {
        selectedVehicle.steeringLeft = false;
    } else if (event.key === KEY.RIGHT || event.key === KEY.D) {
        selectedVehicle.steeringRight = false;
    }
});


Script.scriptEnding.connect(function() {
    vehicles.forEach(function(vehicle) {
        vehicle.cleanup();
    });
    cameraHandler.shutdown();
    Script.resetModuleCache(true);
});
