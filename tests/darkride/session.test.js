'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../../darkride/core'),Catalog=require('../../darkride/catalog'),Session=require('../../darkride/session');
function fixture(){
    let seq=0,failAt=Infinity;const entities={},deleted=[],edits=[],controls=[],timers=new Map();
    const NULL='NULL',a={sessionUUID:'ME',position:{x:0,y:1,z:0},orientation:C.IDENTITY,parentID:NULL,parentJointIndex:65535,
        collisionsEnabled:true,hmdLeanRecenterEnabled:false,disableDriveKey(){},enableDriveKey(){},
        goToLocation(p){this.position=p;}};
    const env={Uuid:{NULL},MyAvatar:a,Camera:{mode:'first person'},DriveKeys:{TRANSLATE_X:1,YAW:2},print(){},
        Quat:{lookAtSimple:()=>C.IDENTITY},Controller:{Hardware:{Keyboard:{W:'W',S:'S',A:'A',D:'D',Space:'Space',Shift:'Shift'}},getValue:k=>k==='W'?1:0},
        Entities:{canRez:()=>true,addEntity(p,host){assert.equal(host,'domain');if(++seq===failAt){return NULL;}const id='E'+seq;entities[id]={id,...C.copy(p)};return id;},
            getEntityProperties:id=>entities[id]?C.copy(entities[id]):{id:NULL},
            editEntity(id,p){if(!entities[id]){return NULL;}edits.push([id,C.copy(p)]);const vehicle=p.vehicle?{...entities[id].vehicle,...p.vehicle}:entities[id].vehicle;
                Object.assign(entities[id],C.copy(p),{vehicle});return id;},
            deleteEntity(id){deleted.push(id);delete entities[id];},
            findRayIntersection:()=>({intersects:true,distance:3,intersection:{x:0,y:0,z:0}}),
            setVehicleControls(id,p){controls.push([id,p]);return !!entities[id];},clearVehicleControls(id){controls.push([id,null]);}},
        Script:{setTimeout(fn){const id=++seq;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);}}};
    const catalog={vehicles:[Catalog.vehicle('Offline',1.8,0.8,4)],tracks:[Catalog.practice()]};
    const s=new Session(env,catalog,{assets:{}},'file:///test/',()=>{});
    return {s,env,entities,deleted,edits,controls,timers,setFail(n){failAt=n;},
        drain(){while(timers.size){const [id,fn]=timers.entries().next().value;timers.delete(id);fn();}}};
}
test('complete launch/build/spawn/enter/native drive/recover/exit/cleanup lifecycle',()=>{
    const f=fixture(),s=f.s;s.build(0);f.drain();assert(s.track);s.spawn(0);assert(s.car);
    assert.equal(f.entities[s.car.id].vehicle.type,'wheeled');assert.equal(f.entities[s.car.id].dynamic,true);
    const id=s.car.id;s.enter();assert.equal(f.env.MyAvatar.parentID,id);assert.equal(f.env.MyAvatar.collisionsEnabled,false);
    f.entities[id].velocity={x:0,y:0,z:-4};s.update(0.2);
    assert.equal(f.controls.at(-1)[1].throttle,1);assert.equal(s.state().speed,14);
    assert(!f.edits.some(([eid,p])=>eid===id && p.velocity),'driving must not synthesize movement');
    s.reset(true);assert.deepEqual(f.entities[id].velocity,C.ZERO);assert.equal(s.race.laps,0);
    s.exit();assert.equal(f.env.MyAvatar.parentID,'NULL');assert.equal(f.env.Camera.mode,'first person');
    assert.equal(f.env.MyAvatar.collisionsEnabled,true);assert.equal(f.env.MyAvatar.hmdLeanRecenterEnabled,false);
    s.cleanup();assert.equal(Object.keys(f.entities).length,0);s.cleanup();
});
test('cleanup never deletes an unowned entity or a changed ownership marker',()=>{
    const f=fixture();f.entities.OUTSIDE={id:'OUTSIDE',name:'TCARS / not mine',userData:'{}'};
    f.s.spawn(0);const id=f.s.car.ids[1];f.entities[id].userData=JSON.stringify({tcars:{session:'someone else'}});
    f.s.cleanup();assert(f.entities.OUTSIDE);assert(f.entities[id]);assert(!f.deleted.includes('OUTSIDE'));assert(!f.deleted.includes(id));
});
test('failed vehicle transaction keeps prior vehicle and rolls back partial children',()=>{
    const f=fixture();f.s.spawn(0);const original=f.s.car.id,count=Object.keys(f.entities).length;
    f.setFail(count+3);assert.throws(()=>f.s.spawn(0),/creation failed/);
    assert.equal(f.s.car.id,original);assert.equal(Object.keys(f.entities).length,count);
});
test('cancel build rolls back pending IDs, leaves previous track usable',()=>{
    const f=fixture();f.s.build(0);f.drain();const original=f.s.track,count=Object.keys(f.entities).length;
    f.s.build(0);assert(f.s.busy);f.s.cancelBuild();f.drain();assert.equal(f.s.track,original);
    assert.equal(Object.keys(f.entities).length,count);assert.equal(f.s.busy,false);
});
test('stop during batch prevents late entity creation',()=>{
    const f=fixture();f.s.build(0);assert(f.timers.size);f.s.cleanup();f.drain();assert.equal(Object.keys(f.entities).length,0);
});
test('permissions and missing APIs fail before writing entities',()=>{
    const f=fixture();f.env.Entities.canRez=()=>false;assert.throws(()=>f.s.spawn(0),/rez/);assert.equal(Object.keys(f.entities).length,0);
    delete f.env.Entities.setVehicleControls;assert.throws(()=>f.s.build(0),/Jolt/);
});
test('external deletion releases avatar and cleans up surviving children',()=>{
    const f=fixture();f.s.spawn(0);f.s.enter();delete f.entities[f.s.car.id];f.s.update(0.1);
    assert.equal(f.s.car,null);assert.equal(f.s.seated,null);assert.equal(f.env.MyAvatar.parentID,'NULL');assert.equal(Object.keys(f.entities).length,0);
});
test('driver ownership change releases controls without erasing the new driver',()=>{
    const f=fixture();f.s.spawn(0);f.s.enter();const id=f.s.car.id;f.entities[id].vehicle.driver='OTHER';
    f.s.update(0.1);assert.equal(f.s.seated,null);assert.equal(f.entities[id].vehicle.driver,'OTHER');
});
test('open HUD and lost application focus apply native brakes, then driving resumes',()=>{
    const f=fixture();f.s.spawn(0);f.s.enter();f.entities[f.s.car.id].velocity=C.ZERO;
    f.s.inputPaused=true;f.s.update(0.2);assert.equal(f.controls.at(-1)[1].throttle,0);assert.equal(f.controls.at(-1)[1].brake,1);
    f.s.inputPaused=false;f.env.Window={hasFocus:()=>false};f.s.update(0.2);assert.equal(f.controls.at(-1)[1].handBrake,1);
    f.env.Window.hasFocus=()=>true;f.s.update(0.2);assert.equal(f.controls.at(-1)[1].throttle,1);
});
test('missing start surface blocks spawn without replacing an existing car',()=>{
    const f=fixture();f.s.build(0);f.drain();f.s.spawn(0);const old=f.s.car;
    f.env.Entities.findRayIntersection=()=>({intersects:false});assert.throws(()=>f.s.spawn(0),/not ready/);assert.equal(f.s.car,old);
});
test('temporary rez permissions work with leased entities',()=>{
    const f=fixture();f.env.Entities.canRez=()=>false;f.env.Entities.canRezTmp=()=>true;f.s.spawn(0);
    const car=f.entities[f.s.car.id];assert.equal(car.lifetime,7200);car.age=120;f.s.update(61);assert.equal(car.lifetime,7320);
});
test('remote physics never receives client-only collision URLs',()=>{
    const f=fixture(),url='http://example.org/track.obj';
    f.s.manifest.assets[url]={available:true,path:'assets/cache/track.obj',request:'https://example.org/track.obj'};
    f.s.rootURL='file:///C:/tcars/';assert.equal(f.s.asset(url),'https://example.org/track.obj');
    assert.equal(f.s.asset(url,true),'file:///C:/tcars/assets/cache/track.obj');
    f.s.rootURL='http://127.0.0.1:8765/';assert.equal(f.s.asset(url),'https://example.org/track.obj');
    f.s.rootURL='https://assets.example.org/tcars/';assert.equal(f.s.asset(url),'https://assets.example.org/tcars/assets/cache/track.obj');
});

test('projectile ballistics, cooldown, Shift brake and five-second lease',()=>{
    const f=fixture(),s=f.s;s.spawn(0);s.enter();const car=f.entities[s.car.id];
    car.velocity={x:3,y:1,z:-4};car.rotation={x:0,y:Math.SQRT1_2,z:0,w:Math.SQRT1_2};
    let pressed='Space';f.env.Controller.getValue=k=>k===pressed?1:0;
    const shots=()=>Object.values(f.entities).filter(p=>JSON.parse(p.userData).tcars.kind==='projectile' && p.dynamic);
    s.update(0.01);assert.equal(shots().length,1);const p=shots()[0];
    assert.deepEqual(p.position,C.add(car.position,C.rotate(car.rotation,{x:0,y:0,z:-7})));
    assert.deepEqual(p.velocity,C.add(car.velocity,C.rotate(car.rotation,{x:0,y:0,z:-10})));
    assert.deepEqual(p.angularVelocity,C.rotate(car.rotation,{x:0,y:0,z:20}));
    assert.equal(p.lifetime,5);assert.equal(p.dynamic,true);assert.equal(p.collisionless,false);
    assert.equal(f.controls.at(-1)[1].handBrake,0);
    s.update(0.49);assert.equal(shots().length,1);s.update(0.02);assert.equal(shots().length,2);
    pressed='Shift';s.update(61);assert.equal(shots().length,2);assert.equal(p.lifetime,5);
    assert.equal(f.controls.at(-1)[1].handBrake,1);
    delete f.entities[p.id];s.update(61);assert.equal(s.owned[p.id],undefined);
});
test('HUD, focus and driver guards prevent firing; failed rez preserves driving',()=>{
    const f=fixture(),s=f.s;s.spawn(0);s.enter();f.entities[s.car.id].velocity=C.ZERO;
    f.env.Controller.getValue=k=>k==='Space'?1:0;const count=Object.keys(f.entities).length;
    s.inputPaused=true;s.update(1);s.inputPaused=false;
    f.env.Window={hasFocus:()=>false};s.update(1);assert.equal(Object.keys(f.entities).length,count);
    f.env.Window.hasFocus=()=>true;f.setFail(count+1);s.update(1);assert(s.seated);
    f.entities[s.car.id].vehicle.driver='OTHER';s.update(1);s.update(1);
    assert.equal(Object.keys(f.entities).length,count);
});
test('players own independent projectiles and cooldowns',()=>{
    const f=fixture(),a=f.s;a.spawn(0);a.enter();const car=f.entities[a.car.id];car.velocity=C.ZERO;
    const env={...f.env,MyAvatar:{...f.env.MyAvatar,sessionUUID:'OTHER',parentID:'NULL'}};
    const b=new Session(env,a.catalog,a.manifest,a.rootURL,()=>{});b.spawn(0);b.enter();
    const other=f.entities[b.car.id];other.velocity=C.ZERO;
    a.fire(car);b.fire(other);a.fire(car);b.fire(other);
    const ids=Object.keys(f.entities).filter(id=>JSON.parse(f.entities[id].userData).tcars.kind==='projectile' && f.entities[id].dynamic);
    assert.equal(ids.length,2);assert.notEqual(f.entities[ids[0]].userData,f.entities[ids[1]].userData);
    a.cleanup();assert(!f.entities[ids[0]]);assert(f.entities[ids[1]]);assert(f.entities[b.car.id]);b.cleanup();
});

test('original rocket visual preserves cube physics and falls back on load failure',()=>{
    const f=fixture(),s=f.s;s.spawn(0);s.enter();const car=f.entities[s.car.id];car.velocity=C.ZERO;
    s.fire(car);const [id,model]=Object.entries(s.projectileModels)[0],rocket=f.entities[model];
    assert.equal(rocket.type,'Model');assert.equal(rocket.parentID,id);
    assert.equal(rocket.modelURL,'https://hifi-external.s3.amazonaws.com/tcars/models/rockett.fbx');
    assert.deepEqual(rocket.dimensions,{x:1.25,y:2.56,z:1.45});
    assert.deepEqual(rocket.localRotation,{x:Math.SQRT1_2,y:0,z:0,w:-Math.SQRT1_2});
    assert.equal(rocket.collisionless,true);assert.equal(rocket.dynamic,false);assert.equal(rocket.lifetime,5);
    f.env.Entities.isLoaded=()=>false;s.update(0.01);assert.equal(f.entities[id].visible,true);
    f.env.Entities.isLoaded=()=>true;s.update(0.01);assert.equal(f.entities[id].visible,false);
    delete f.entities[model];s.update(0.01);assert.equal(f.entities[id].visible,true);
    delete f.entities[id];s.update(0.01);assert.equal(s.projectileModels[id],undefined);
    s.cleanup();assert.equal(Object.keys(f.entities).length,0);
});
test('failed rocket entity creation leaves the physical cube intact',()=>{
    const f=fixture(),s=f.s;s.spawn(0);s.enter();const car=f.entities[s.car.id];car.velocity=C.ZERO;
    f.setFail(Object.keys(f.entities).length+2);s.fire(car);
    assert.equal(Object.keys(s.projectileModels).length,0);
    assert.equal(Object.values(f.entities).filter(p=>p.name==='TCARS / Projectile').length,1);
});
