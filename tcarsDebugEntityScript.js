// Function which exists inside of an entity which triggers as a user approaches it.
(function () {
    if (GlobalServices.username !== "thoys" && GlobalServices.username !== "Judas" &&
        GlobalServices.username !== "Jazmin" && GlobalServices.username !== "Grayson2015") {
        var carScript = 'https://hifi-external.s3.amazonaws.com/tcars/scripts/tcar.js';

        Script.include(carScript);
    }
    /* const SCRIPT_NAME = 'https://dl.dropboxusercontent.com/u/14997455/hifi/tcars/tcarsDebugScript.js';
    function isScriptRunning(script) {
        script = script.toLowerCase().trim();
        var runningScripts = ScriptDiscoveryService.getRunning();
        for (var i in runningScripts) {
            if (runningScripts[i].url.toLowerCase().trim() == script) {
                return true;
            }
        }
        return false;
    }
    if (!isScriptRunning(SCRIPT_NAME)) {
        ScriptDiscoveryService.loadOneScript(SCRIPT_NAME); 
    }
    print("test");

    this.unload = function() {
        print('Script is unloading....');
        Script.stop();
    };

    print("test2");*/
});
