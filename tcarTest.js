// car scriptsa 1.0.2 © thoys 2015
// no refunds
// Audio effects by Konstantin
// Models by Judas VERY important code also by Judas
// Car tuning by unknown

const TCARS_BLOCKLY_URL = 'https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/blockly-tcars/carTest.html';

Script.include([
    'libraries/constants.js',
    'libraries/keys.js',
    'libraries/vehicles.js',
   // 'libraries/cameraHandler.js',
    'libraries/soundLoopSwitcher.js',
    'libraries/car.js'
]);
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



var vehicles = [
   // new Car(VEHICLES[0], {x: 3086.9853515625, y: 9032.83203125, z: 2905.2724609375}, {x: 0, y: -0.9435096979141235, z: 0, w: 0.33134496212005615}),
   // new Car(VEHICLES[0], {x: 3086.9853515625, y: 9032.83203125, z: 2905.2724609375}, {x: 0, y: -0.9435096979141235, z: 0, w: 0.33134496212005615}),
    new Car(VEHICLES["BLUES"], {x:12.707011222839355,y:-91.72282409667969,z:82.1860580444336},{x:-0.00019260011322330683,y:0.7156859040260315,z:0.00019476395391393453,w:0.6984201669692993}, 1, true),
/* new Car(VEHICLES["BLUES"], {x:12.707011222839355,y:-90.72282409667969,z:82.1860580444336},{"x":-0.00019260011322330683,"y":0.7156859040260315,"z":0.00019476395391393453,"w":0.6984201669692993}, 1),
 new Car(VEHICLES["BLUES"], {x:12.707011222839355,y:-90.72282409667969,z:82.1860580444336},{"x":-0.00019260011322330683,"y":0.7156859040260315,"z":0.00019476395391393453,"w":0.6984201669692993}, 1),
 new Car(VEHICLES["BLUES"], {x:12.707011222839355,y:-90.72282409667969,z:82.1860580444336},{"x":-0.00019260011322330683,"y":0.7156859040260315,"z":0.00019476395391393453,"w":0.6984201669692993}, 1),
 new Car(VEHICLES["BLUES"], {x:12.707011222839355,y:-90.72282409667969,z:82.1860580444336},{"x":-0.00019260011322330683,"y":0.7156859040260315,"z":0.00019476395391393453,"w":0.6984201669692993}, 1),
 new Car(VEHICLES["SHOE"], {x:12.707011222839355,y:-90.72282409667969,z:82.1860580444336},{"x":-0.00019260011322330683,"y":0.7156859040260315,"z":0.00019476395391393453,"w":0.6984201669692993}, 1),
 new Car(VEHICLES["BLUES"], {x:12.707011222839355,y:-90.72282409667969,z:82.1860580444336},{"x":-0.00019260011322330683,"y":0.7156859040260315,"z":0.00019476395391393453,"w":0.6984201669692993}, 1),
 new Car(VEHICLES["BLUES"], {x:12.707011222839355,y:-90.72282409667969,z:82.1860580444336},{"x":-0.00019260011322330683,"y":0.7156859040260315,"z":0.00019476395391393453,"w":0.6984201669692993}, 1),
 new Car(VEHICLES["BLUES"], {x:12.707011222839355,y:-90.72282409667969,z:82.1860580444336},{"x":-0.00019260011322330683,"y":0.7156859040260315,"z":0.00019476395391393453,"w":0.6984201669692993}, 1)*/
];

for (var vehicle in vehicles) {
    vehicles[vehicle].accelerating = true;
}

Script.update.connect(function(time) {
    for (var vehicle in vehicles) {
        vehicles[vehicle].update(time);
    }
});

Script.scriptEnding.connect(function() {
    for (var vehicle in vehicles) {
        vehicles[vehicle].cleanup();
    }
});

