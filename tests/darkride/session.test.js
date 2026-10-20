'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../../darkride/core'),Catalog=require('../../darkride/catalog'),Session=require('../../darkride/session');
function fixture(){
    let seq=0,failAt=Infinity;const entities={},deleted=[],edits=[],controls=[],timers=new Map();
    const NULL='NULL',a={sessionUUID:'ME',position:{x:0,y:1,z:0},orientation:C.IDENTITY,parentID:NULL,parentJointIndex:65535,
        collisionsEnabled:true,hmdLeanRecenterEnabled:false,disableDriveKey(){},enableDriveKey(){},
        goToLocation(p){this.position=p;}};
    const env={Uuid:{NULL},MyAvatar:a,Camera:{mode:'first person'},DriveKeys:{TRANSLATE_X:1,YAW:2},print(){},
        Quat:{lookAtSimple:()=>C.IDENTITY},Controller:{Hardware:{Keyboard:{W:'W',S:'S',A:'A',D:'D',Space:'Space'}},getValue:k=>k==='W'?1:0},
        Entities:{canRez:()=>true,addEntity(p){if(++seq===failAt){return NULL;}const id='E'+seq;entities[id]={id,...C.copy(p)};return id;},
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
