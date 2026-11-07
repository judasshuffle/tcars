// TCARS physical-console gameplay PLAYTEST. Independent per visitor; no Interface script launcher.
// The console remains in-world. This entity script may unload when the player drives out of range.
(function () {
    'use strict';
    var ROOT = 'https://judasshuffle.github.io/tcars/improvements-test/';
    var consoleID = null, session = null, catalog = null, ready = false, closed = false;
    var requests = [], lastHit = 0, failed = [], connected = false;
    var returnPose = null; // Capture the safe spot beside the console before entering a car.
    // F: leave car, remove owned vehicle, then return to console.\n    var carIds = ['BLUES', 'CAPRI', 'TORINO', '2BEATLE', 'DS'];
    var trackIds = ['school-new.json', 'street.json', 'toy.json', 'space.json'];
    function log(s) { print('[TCARS console] ' + s); }
    function say(s) {
        log(s);
        try { if (typeof Chat !== 'undefined' && typeof Chat.showMessage === 'function') {
            Chat.showMessage('TCARS: ' + s);
        } } catch (e) { log('Chat unavailable: ' + e); }
    }
    function loadJSON(path, cb) {
        var x = new XMLHttpRequest(), done = false, timer;
        requests.push(x);
        function finish(err, data) { if (done) { return; } done = true;
            Script.clearTimeout(timer); cb(err, data); }
        x.onreadystatechange = function () {
            if (x.readyState !== 4 || closed) { return; }
            try {
                if (x.status !== 200 && x.status !== 0) { throw new Error('HTTP ' + x.status); }
                finish(null, JSON.parse(x.responseText));
            } catch (e) { finish(path + ': ' + e.message); }
        };
        timer = Script.setTimeout(function () { finish(path + ': timeout'); try { x.abort(); } catch (e) {} }, 15000);
        x.open('GET', ROOT + path, true);
        x.send();
    }
    function action(mark) {
        if (!ready || !session) { say('Still loading track data; try again. ' + failed.join('; ')); return; }
        try {
            if (mark.indexOf('CAR_') === 0) {
                var id = carIds[Number(mark.slice(4)) - 1], carIndex = -1;
                for (var c = 0; c < catalog.vehicles.length; c++) {
                    if (catalog.vehicles[c].id === id) { carIndex = c; break; }
                }
                if (carIndex < 0) { throw new Error('Missing car ' + id); }
                var savedPose = {position: {x:MyAvatar.position.x,y:MyAvatar.position.y,z:MyAvatar.position.z},
                    orientation: {x:MyAvatar.orientation.x,y:MyAvatar.orientation.y,z:MyAvatar.orientation.z,w:MyAvatar.orientation.w}};
                session.spawn(carIndex);
                session.enter();
                returnPose = savedPose;
                say('Driving ' + catalog.vehicles[carIndex].name + ' — W/S, A/D, Space missile, Shift handbrake; F exits.');
            } else if (mark.indexOf('TRACK_') === 0) {
                var n = Number(mark.slice(6)) - 1;
                if (n === 4) { say('TRACK 5 reserved: only four working tracks are available.'); return; }
                var trackIndex = -1;
                for (var t = 0; t < catalog.tracks.length; t++) {
                    if (catalog.tracks[t].id === trackIds[n]) { trackIndex = t; break; }
                }
                if (trackIndex < 0) { throw new Error('Track unavailable: ' + trackIds[n]); }
                session.build(trackIndex);
            } else if (mark === 'CLEANUP') {
                session.removeTrack();
                say('Your TCARS car and track cleaned up. Other players are untouched.');
            }
        } catch (e) { say('Action failed: ' + (e.message || e)); }
    }
    function click(id) {
        if (!consoleID || closed || Date.now() - lastHit < 250) { return; }
        var p = Entities.getEntityProperties(id, ['parentID', 'userData']);
        if (String(p.parentID) !== String(consoleID)) { return; }
        var mark = '';
        try { mark = JSON.parse(p.userData || '{}').tcarsConsoleButton || ''; } catch (e) { return; }
        if (!/^(CAR_0[1-5]|TRACK_0[1-5]|CLEANUP)$/.test(mark)) { return; }
        lastHit = Date.now();
        log('CLICK ' + mark);
        action(mark);
    }
    function exitToConsole() {
        if (!session || !session.seated) { return; }
        session.exit(); // Restore avatar controls, parenting and camera first.
        // Delete only this visitor's vehicle; keep their track and the arcade intact.
        session.removeCar();
        say('Exited and cleaned up your car.');
        if (!returnPose) { say('No console return point recorded.'); return; }
        var target = returnPose;
        // Defer the teleport so the vehicle exit's own goToLocation has finished queuing.
        Script.setTimeout(function () {
            if (closed || !target) { return; }
            try {
                MyAvatar.goToLocation(target.position, true, target.orientation, false);
                say('Returned to TCARS console.');
            } catch (error) { say('Return teleport failed: ' + error.message); }
        }, 200);
    }
    function key(event) {
        if (!session || !session.seated || !event || event.isAutoRepeat || event.isAlt || event.isControl) { return; }
        var k = String(event.text || '').toLowerCase();
        try {
            if (k === 'f') { exitToConsole(); }
            else if (k === 'r') { session.reset(false); }
            else if (k === 't') { session.reset(true); }
        } catch (e) { say('Key failed: ' + e.message); }
    }
    function update(dt) {
        if (!session || closed) { return; }
        try { session.update(dt); }
        catch (e) {
            say('Driving update failed: ' + e.message);
            try { session.exit(); } catch (ignored) {}
        }
    }
    this.preload = function (id) {
        consoleID = id;
        closed = false;
        if (connected) { return; }
        try {
            var Catalog = Script.require(ROOT + 'darkride/catalog.js');
            var Session = Script.require(ROOT + 'darkride/session.js');
            var originals = Script.require(ROOT + 'modules/vehicles.js');
            var tracks = Script.require(ROOT + 'modules/tracks.js');
            catalog = Catalog.make(originals, tracks);
            var manifest = { assets: {} };
            // DriveKeys isn't exposed as a global in DarkRide world scripts; do not try
            // to bypass the viewer's restricted input-capture policy.
            session = new Session({
                Entities: Entities, MyAvatar: MyAvatar, Camera: Camera,
                Controller: Controller, DriveKeys: {},
                Quat: Quat, Uuid: Uuid, Script: Script,
                SoundCache: SoundCache, Audio: Audio, Window: Window, print: print
            }, catalog, manifest, ROOT, function () {});
            session.checkAPI();
            var remaining = 1 + catalog.tracks.length;
            function completed() {
                remaining--;
                if (remaining === 0) {
                    ready = failed.length === 0;
                    say(ready ? 'Console ready: 5 cars, 4 tracks; TRACK 5 reserved.' :
                        'Some data failed to load: ' + failed.join('; '));
                }
            }
            loadJSON('assets/manifest.json', function (error, data) {
                if (error) { failed.push(error); }
                else { manifest.assets = data.assets || {}; }
                completed();
            });
            catalog.tracks.forEach(function (track) {
                loadJSON('trackzones/' + track.file, function (error, data) {
                    if (error) { failed.push(error); }
                    else { if (track.file === 'space.json') { data.entities = data.entities.filter(function (e) { return !(e.modelURL && /\/cars\/spaceship\.fbx(?:\?|$)/i.test(e.modelURL)); }); } track.data = data; }
                    completed();
                });
            });
            Entities.mousePressOnEntity.connect(click);
            Controller.keyPressEvent.connect(key);
            Script.update.connect(update);
            connected = true;
            log('Physical controls connected; per-visitor gameplay test.');
        } catch (e) { say('Startup failed: ' + (e.message || e)); }
    };
    this.unload = function () {
        closed = true;
        if (connected) {
            Entities.mousePressOnEntity.disconnect(click);
            Controller.keyPressEvent.disconnect(key);
            Script.update.disconnect(update);
            connected = false;
        }
        requests.forEach(function (x) { try { x.abort(); } catch (e) {} });
        if (session) {
            try { session.cleanup(); } catch (e) { log('Cleanup error: ' + e); }
        }
        consoleID = null;
        session = null;
        returnPose = null;
        ready = false;
    };
});
