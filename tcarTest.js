// car scriptsa 1.0.2 © thoys 2015
// no refunds
// Audio effects by Konstantin
// Models by Judas VERY important code also by Judas
// Car tuning by unknown

Script.include([
    'libraries/constants.js',
    'libraries/wkeys.js',
    'libraries/vehicles.js',
    'libraries/cameraHandler.js',
    'libraries/soundLoopSwitcher.js',
    'libraries/car.js'
]);

var vehicles = [
    new Car(VEHICLES[0], {x: 3086.9853515625, y: 9032.83203125, z: 2905.2724609375}, {x: 0, y: -0.9435096979141235, z: 0, w: 0.33134496212005615}),new Car(VEHICLES[0], {x: 3086.9853515625, y: 9032.83203125, z: 2905.2724609375}, {x: 0, y: -0.9435096979141235, z: 0, w: 0.33134496212005615}),new Car(VEHICLES[0], {x: 3086.9853515625, y: 9032.83203125, z: 2905.2724609375}, {x: 0, y: -0.9435096979141235, z: 0, w: 0.33134496212005615}),new Car(VEHICLES[0], {x: 3086.9853515625, y: 9032.83203125, z: 2905.2724609375}, {x: 0, y: -0.9435096979141235, z: 0, w: 0.33134496212005615}),
    new Car(VEHICLES[0], {x: 3086.9853515625, y: 9032.83203125, z: 2905.2724609375}, {x: 0, y: -0.9435096979141235, z: 0, w: 0.33134496212005615}),new Car(VEHICLES[0], {x: 3086.9853515625, y: 9032.83203125, z: 2905.2724609375}, {x: 0, y: -0.9435096979141235, z: 0, w: 0.33134496212005615}),new Car(VEHICLES[0], {x: 3086.9853515625, y: 9032.83203125, z: 2905.2724609375}, {x: 0, y: -0.9435096979141235, z: 0, w: 0.33134496212005615}),new Car(VEHICLES[0], {x: 3086.9853515625, y: 9032.83203125, z: 2905.2724609375}, {x: 0, y: -0.9435096979141235, z: 0, w: 0.33134496212005615}),
    new Car(VEHICLES[0], {x: 3086.9853515625, y: 9032.83203125, z: 2905.2724609375}, {x: 0, y: -0.9435096979141235, z: 0, w: 0.33134496212005615}),new Car(VEHICLES[0], {x: 3086.9853515625, y: 9032.83203125, z: 2905.2724609375}, {x: 0, y: -0.9435096979141235, z: 0, w: 0.33134496212005615}),new Car(VEHICLES[0], {x: 3086.9853515625, y: 9032.83203125, z: 2905.2724609375}, {x: 0, y: -0.9435096979141235, z: 0, w: 0.33134496212005615}),new Car(VEHICLES[0], {x: 3086.9853515625, y: 9032.83203125, z: 2905.2724609375}, {x: 0, y: -0.9435096979141235, z: 0, w: 0.33134496212005615}),
];

for (var vehicle in vehicles) {
    vehicles[vehicle].planking = true;
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
