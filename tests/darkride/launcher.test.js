'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const C=require('../../darkride/core');const root=path.resolve(__dirname,'../..');
function signal(){const listeners=new Set();return {connect:f=>listeners.add(f),disconnect:f=>listeners.delete(f),emit(...args){[...listeners].forEach(f=>f(...args));},listeners};}
test('actual launcher boots catalog, handles HUD actions, and disconnects on stop',()=>{
    const sent=[],timers=new Map();let n=0,entity=0,stopped=false;const entities={};
    const button={clicked:signal(),editProperties(){}};
    const tablet={webEventReceived:signal(),screenChanged:signal(),addButton:()=>button,removeButton(){},
        emitScriptEvent:text=>sent.push(JSON.parse(text)),gotoWebScreen:url=>tablet.screenChanged.emit('Web',url),
        gotoHomeScreen:()=>tablet.screenChanged.emit('Home','')};
    const context={print(){},Uuid:{NULL:'NULL'},DriveKeys:{TRANSLATE_X:0},SoundCache:{},Audio:{},
        Window:{domainChanged:signal(),alert:message=>assert.fail(message),hasFocus:()=>true},
        Tablet:{getTablet:()=>tablet},Camera:{mode:'first person'},Quat:{lookAtSimple:()=>C.IDENTITY},
        MyAvatar:{sessionUUID:'ME',position:{x:0,y:1,z:0},orientation:C.IDENTITY,parentID:'NULL',collisionsEnabled:true,
            hmdLeanRecenterEnabled:true,disableDriveKey(){},enableDriveKey(){},goToLocation(){}},
        Overlays:{addOverlay:()=>1,editOverlay(){},deleteOverlay(){}},
        Controller:{keyPressEvent:signal(),Hardware:{Keyboard:{}},getValue:()=>0},
        Entities:{canRez:()=>true,findRayIntersection:()=>({intersects:true,distance:3,intersection:C.ZERO}),
            setVehicleControls:()=>true,clearVehicleControls(){},addEntity(p){const id='E'+(++entity);entities[id]={id,...C.copy(p)};return id;},
            getEntityProperties:id=>entities[id]?C.copy(entities[id]):{id:'NULL'},deleteEntity:id=>delete entities[id],
            editEntity(id,p){const v={...entities[id].vehicle,...p.vehicle};Object.assign(entities[id],C.copy(p),{vehicle:v});return id;}}};
    context.Script={resolvePath:p=>'file:///'+root.replaceAll('\\','/')+'/'+p.replace(/^\.\//,''),
        update:signal(),scriptEnding:signal(),setTimeout(fn){const id=++n;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id),
        stop(){stopped=true;context.Script.scriptEnding.emit();}};
    const modules=new Map();
    function load(file){file=path.resolve(file);if(modules.has(file)){return modules.get(file);}const m={exports:{}};
        const scope={...context,module:m,Script:{...context.Script,require:p=>load(path.resolve(path.dirname(file),p))}};
        vm.runInNewContext(fs.readFileSync(file,'utf8'),scope,{filename:file});modules.set(file,m.exports);return m.exports;}
    context.Script.require=p=>load(path.resolve(root,p));
    context.XMLHttpRequest=function(){this.open=(method,url)=>{this.url=url;};this.abort=()=>{};this.send=()=>{
        context.Script.setTimeout(()=>{this.readyState=4;this.status=0;this.responseText=fs.readFileSync(new URL(this.url),'utf8');this.onreadystatechange();},0);};};
    vm.runInNewContext(fs.readFileSync(path.join(root,'launch-tcars.js'),'utf8'),context);
    // Run only resource callbacks first (timeout entries are cancelled by their callback).
    for(const [id,fn] of [...timers]){if(id%2===0 && timers.has(id)){timers.delete(id);fn();}}
    assert.equal(sent.at(-1).ready,true);assert.equal(sent.at(-1).tracks.length,6);assert(sent.at(-1).tracks.every(t=>t.available));
    function action(action,index=0){tablet.webEventReceived.emit(JSON.stringify({channel:'tcars-darkride-v1',action,index}));}
    action('build');while(timers.size){const [id,fn]=timers.entries().next().value;timers.delete(id);fn();}
    assert.equal(sent.at(-1).hasTrack,true);action('spawn');assert.equal(sent.at(-1).hasCar,true);
    action('enter');assert.notEqual(context.MyAvatar.parentID,'NULL');context.Controller.keyPressEvent.emit({text:'f'});
    assert.equal(context.MyAvatar.parentID,'NULL');action('stop');assert(stopped);assert.equal(Object.keys(entities).length,0);
    assert.equal(context.Script.update.listeners.size,0);assert.equal(context.Controller.keyPressEvent.listeners.size,0);
    assert.equal(tablet.webEventReceived.listeners.size,0);assert.equal(context.Window.domainChanged.listeners.size,0);
});
