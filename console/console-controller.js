// TCARS physical console — click-target calibration prototype.
// Client entity script attached to the permanent console Model entity.
// Buttons are separate domain entities, placed by console-install.js.
(function () {
    'use strict';
    var consoleID = null;
    var lastHit = 0;
    function handleClick(id) {
        if (!consoleID || Date.now() - lastHit < 200) { return; }
        var p = Entities.getEntityProperties(id, ['parentID', 'userData', 'name']);
        if (String(p.parentID) !== String(consoleID)) { return; }
        var mark;
        try { mark = JSON.parse(p.userData || '{}').tcarsConsoleButton; } catch (e) { return; }
        if (!mark || !/^(CAR_0[1-5]|TRACK_0[1-5]|CLEANUP)$/.test(mark)) { return; }
        lastHit = Date.now();
        print('[TCARS console] CLICK ' + mark);
        if (typeof Chat !== 'undefined' && typeof Chat.showMessage === 'function') {
            Chat.showMessage('TCARS console: ' + mark + ' — button detected (prototype)');
        }
    }
    this.preload = function (id) {
        consoleID = id;
        Entities.mousePressOnEntity.connect(handleClick);
        print('[TCARS console] Ready. Click one of 11 prototype targets.');
    };
    this.unload = function () {
        Entities.mousePressOnEntity.disconnect(handleClick);
        consoleID = null;
    };
});
