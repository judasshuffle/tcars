// Client entity script. This entity is installed and owned separately from TCARS sessions.
(function () {
    'use strict';
    var LAUNCHER = 'https://judasshuffle.github.io/tcars/public-launcher-test/launch-tcars.js';
    var PENDING_KEY = 'tcars/public-launcher/load-requested-at';
    var PENDING_MS = 60000;

    this.clickDownOnEntity = function () {
        try {
            var now = Date.now(), pending = Number(Settings.getValue(PENDING_KEY, 0));
            if (pending && now >= pending && now - pending < PENDING_MS) { return; }
            Settings.setValue(PENDING_KEY, now);
            if (typeof Script.load !== 'function') { throw new Error('Script.load unavailable in entity scripts'); } Script.load(LAUNCHER); print('[TCARS launcher] Script.load called');
        } catch (error) {
            Settings.setValue(PENDING_KEY, 0);
            print('[TCARS launcher] Could not start TCARS: ' + error);
        }
    };
});
