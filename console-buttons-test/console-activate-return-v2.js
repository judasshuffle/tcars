// TCARS console: activate version 2 (F exits and returns to the place beside the console).
(function () {
    'use strict';
    var SCRIPT = 'https://judasshuffle.github.io/tcars/console-buttons-test/console-game-return-v2.js';
    var found = [];
    Entities.findEntities(MyAvatar.position,25).forEach(function(id) {
        var p = Entities.getEntityProperties(id,['type','modelURL','position']);
        if (p.type==='Model' && /TCARS_Console\.fbx/i.test(String(p.modelURL||''))
          && Vec3.distance(p.position,MyAvatar.position)<25) { found.push(id); }
    });
    if (found.length!==1) { print('[TCARS return setup] STOP: expected one nearby console, found '+found.length); Script.stop(); return; }
    var root=found[0], p=Entities.getEntityProperties(root,['position','script']);
    if (p.script && !/console-controller\.js|console-game-playtest\.js|console-game-return-v2\.js/.test(String(p.script))) {
        print('[TCARS return setup] STOP: unfamiliar existing script '+p.script); Script.stop(); return;
    }
    var names={}, ids={};
    Entities.findEntities(p.position,8).forEach(function(id) {
        var b=Entities.getEntityProperties(id,['parentID','userData']);
        if(String(b.parentID)!==String(root)){return;}
        try {
            var name=JSON.parse(b.userData||'{}').tcarsConsoleButton;
            if(/^(CAR_0[1-5]|TRACK_0[1-5]|CLEANUP)$/.test(name)){names[name]=true;ids[name]=id;}
        } catch(e){}
    });
    if(Object.keys(names).length!==11){print('[TCARS return setup] STOP: needs all 11 button entities. Found '+Object.keys(names).length);Script.stop();return;}
    Object.keys(ids).forEach(function(name){Entities.editEntity(ids[name],{alpha:0.03});});
    var ok=Entities.editEntity(root,{script:SCRIPT});
    print('[TCARS return setup] New F-to-console controller attached='+ok+'. Re-enter the car and press F to test.');
    Script.stop();
}());
