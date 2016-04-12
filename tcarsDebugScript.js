//  TCars/tcarsDebugScript.js
//
//  This script initializes and closes the car script
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

var carScriptEnabled = false;

Script.include('https://raw.githubusercontent.com/highfidelity/hifi/master/examples/libraries/toolBars.js');

var toolBar = null;

toolBar = new ToolBar(0, 0, ToolBar.HORIZONTAL, 'tcars.debug.toolbar', function (windowDimensions, toolbar) {
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

function isScriptRunning(script) {
    script = script.toLowerCase().trim();
    var runningScripts = ScriptDiscoveryService.getRunning();
    for (var i in runningScripts) {
        if (runningScripts.hasOwnProperty(i) && runningScripts[i].url.toLowerCase().trim() == script) {
            return true;
        }
    }
    return false;
}

var carScript = 'http://hifi-external.s3.amazonaws.com/tcars/scripts/tcar.js';

var stopScriptByName = function(scriptName) {
    var runningScripts = ScriptDiscoveryService.getRunning();
    for (var i in runningScripts) {
        if (runningScripts.hasOwnProperty(i) && runningScripts[i].name === scriptName) {
            ScriptDiscoveryService.stopScript(runningScripts[i].url);
        }
    }
};

Controller.mousePressEvent.connect(function(event) {
    var clickedOverlay = Overlays.getOverlayAtPoint({x: event.x, y: event.y});
    if (toolBar.clicked(clickedOverlay) === carScriptButton) {
        carScriptEnabled = !isScriptRunning(carScript);
        if (carScriptEnabled) {
            Script.load(carScript);
        } else {
            stopScriptByName('tcar.js');
        }
        toolBar.selectTool(carScriptButton, carScriptEnabled);
    }
});

Script.scriptEnding.connect(function() {
    toolBar.cleanup();
});
