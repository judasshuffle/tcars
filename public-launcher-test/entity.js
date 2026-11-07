// Client entity script. This entity is installed and owned separately from TCARS sessions.
(function () {
    'use strict';
    var LAUNCHER = 'https://judasshuffle.github.io/tcars/public-launcher-test/launch-tcars.js';
    var PENDING_KEY = 'tcars/public-launcher/load-requested-at';
    var PENDING_MS = 60000;

    this.clickDownOnEntity = function () {
        try {
            var running = ScriptDiscoveryService.getRunning();
            for (var i = 0; i < running.length; i++) {
                var url = String(running[i].url || '').split('?')[0];
                // Reuse an already-running TCARS launcher, including the existing test builds.
                if (/\/tcars\/(?:[^\/]+\/)?launch-tcars\.js$/i.test(url) ||
                    /\/tcars-darkride\/launch-tcars\.js$/i.test(url)) {
                    Settings.setValue(PENDING_KEY, 0);
                    Tablet.getTablet('com.highfidelity.interface.tablet.system')
                        .gotoWebScreen(url.replace(/launch-tcars\.js$/i, 'darkride/hud.html'));
                    return;
                }
            }
            // The service registers a script after download, so guard concurrent clicks across
            // launcher entities on this client while the request is in flight.
            var now = Date.now(), pending = Number(Settings.getValue(PENDING_KEY, 0));
            if (pending && now >= pending && now - pending < PENDING_MS) { return; }
            Settings.setValue(PENDING_KEY, now);
            ScriptDiscoveryService.loadScript(LAUNCHER, false);
        } catch (error) {
            Settings.setValue(PENDING_KEY, 0);
            print('[TCARS launcher] Could not start TCARS: ' + error);
        }
    };
});
