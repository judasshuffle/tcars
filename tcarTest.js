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
    //new Car(VEHICLES[0], {x: 3022.720947265625, y: 3009.337890625, z: 3035.54345703125}, {x: 0, y: -0.392068088054657, z: 0, w: 0.9199361801147461}),
    //new Car(VEHICLES[0], {x: 3019.631103515625, y: 3009.038330078125, z: 3037.361328125}, {x: 0, y: 0.8413717150688171, z: 0, w: 0.5404568910598755})
    new Car(VEHICLES[0], {x: 2996.280029296875, y: 2988.702392578125, z: 3072.81640625}, {x: 0, y: -0.7598872780799866, z: 0, w: 0.6500548720359802}),    new Car(VEHICLES[0], {x: 2996.280029296875, y: 2988.702392578125, z: 3072.81640625}, {x: 0, y: -0.7598872780799866, z: 0, w: 0.6500548720359802}),    new Car(VEHICLES[0], {x: 2996.280029296875, y: 2988.702392578125, z: 3072.81640625}, {x: 0, y: -0.7598872780799866, z: 0, w: 0.6500548720359802}),    new Car(VEHICLES[0], {x: 2996.280029296875, y: 2988.702392578125, z: 3072.81640625}, {x: 0, y: -0.7598872780799866, z: 0, w: 0.6500548720359802}),    new Car(VEHICLES[0], {x: 2996.280029296875, y: 2988.702392578125, z: 3072.81640625}, {x: 0, y: -0.7598872780799866, z: 0, w: 0.6500548720359802}),    new Car(VEHICLES[0], {x: 2996.280029296875, y: 2988.702392578125, z: 3072.81640625}, {x: 0, y: -0.7598872780799866, z: 0, w: 0.6500548720359802}), 
  //  new Car(VEHICLES[0], {x: 2985.689453125, y: 3001.921875, z: 3046.72509765625}, {x: 0, y: 0.5538461804389954, z: 0, w: 0.8326190114021301})
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
