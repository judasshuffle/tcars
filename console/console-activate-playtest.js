// One-time, owner-run TCARS console playtest switch. No edits to the FBX or other scripts.
(function () {
    'use strict';
    var SCRIPT = 'https://judasshuffle.github.io/tcars/console-buttons-test/console-game-playtest.js';
    var found = [];
    Entities.findEntities(MyAvatar.position, 25).forEach(function (id) {
        var p = Entities.getEntityProperties(id, ['type', 'modelURL', 'position']);
        if (p.type === 'Model' && /TCARS_Console\.fbx/i.test(String(p.modelURL || ''))
            && Vec3.distance(p.position, MyAvatar.position) < 25) { found.push(id); }
    });
    if (found.length !== 1) {
        print('[TCARS test setup] STOP: expected exactly one nearby console, found ' + found.length);
        Script.stop(); return;
    }
    var root = found[0], p = Entities.getEntityProperties(root, ['script', 'position']);
    if (p.script && p.script.indexOf('/console-controller.js') === -1 &&
        p.script.indexOf('/console-game-playtest.js') === -1) {
        print('[TCARS test setup] STOP: console has a different script. Nothing changed.');
        Script.stop(); return;
    }
    var buttons = {}, count = 0, changed = 0;
    Entities.findEntities(p.position, 8).forEach(function (id) {
        var b = Entities.getEntityProperties(id, ['parentID', 'userData']);
        if (String(b.parentID) !== String(root)) { return; }
        var name = '';
        try { name = JSON.parse(b.userData || '{}').tcarsConsoleButton || ''; } catch (e) {}
        if (!/^(CAR_0[1-5]|TRACK_0[1-5]|CLEANUP)$/.test(name)) { return; }
        if (buttons[name]) { return; } // avoid duplicate targets.
        buttons[name] = id; count++;
    });
    if (count !== 11) {
        print('[TCARS test setup] STOP: expected 11 named buttons, found ' + count + '. Nothing changed.');
        Script.stop(); return;
    }
    // Keep entities visible but nearly transparent; visibility:false would prevent pointer intersection.
    Object.keys(buttons).forEach(function (name) {
        if (Entities.editEntity(buttons[name], {alpha:0.03})) { changed++; }
    });
    var ok = Entities.editEntity(root, {script:SCRIPT});
    print('[TCARS test setup] Translucency changed on '+changed+'/11. Gameplay script assigned=' + ok);
    print('[TCARS test setup] If driving stops on leaving the console vicinity, this is the entity-script unload limitation.');
    Script.stop();
}());
