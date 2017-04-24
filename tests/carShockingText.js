// Shocking!

// overlay which display position X
var displayOverlay = Overlays.addOverlay('text', {
    x: 200,
    y: 200,
    width: 1000,
    height: 200,
    textColor: {red: 0, green: 0, blue: 0},
    alpha: 1,
    backgroundAlpha: 0,
    visible: true,
    text: 'I AM HERE'
});
// floor object
var floor = Entities.addEntity('Box', {
    position: {x: -200, y: -200, z: -200},
    dimensions: {x: 50, y: 50, z: 50},
    color: {red: 0, green: 0, blue: 50}

});
// box that moves over floor object

// camera
Camera.mode = 'independent';
Camera.position = {x: -200, y: -130, z: -200};
Camera.lookAt({x: -200, y: -200, z: -200});

Script.scriptEnding.connect(function () {
    Overlays.deleteOverlay(displayOverlay);
    Entities.deleteEntity(floor);
    Camera.mode = 'firstperson';
});
