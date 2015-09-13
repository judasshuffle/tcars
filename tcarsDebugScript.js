// Copyright © 2015 TCaRS - Thijs Wenker
// This script initializes and closes the car script

var carScriptEnabled = false;

Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/libraries/toolBars.js");

var toolBar = null;

toolBar = new ToolBar(0, 0, ToolBar.HORIZONTAL, "tcars.debug.toolbar", function (windowDimensions, toolbar) {
    return {
        x: windowDimensions.x - (toolbar.width * 1.1),
        y: toolbar.height / 2
    };
});

var BUTTON_SIZE = 49;

var carScriptButton = toolBar.addTool({
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    imageURL: 'https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/car-button.svg',
    subImage: { x: 0, y: BUTTON_SIZE, width: BUTTON_SIZE, height: BUTTON_SIZE},
    alpha: 0.8,
    visible: true
}, true, false);

Controller.mousePressEvent.connect(function(event) {
    var clickedOverlay = Overlays.getOverlayAtPoint({x: event.x, y: event.y});
    if (toolBar.clicked(clickedOverlay) === carScriptButton) {
        carScriptEnabled = !carScriptEnabled;
        toolBar.selectTool(carScriptButton, carScriptEnabled);
        Script.load("http://hifi-external.s3.amazonaws.com/tcars/scripts/tcar.js?v=" + (new Date()).getTime());
    }
});

