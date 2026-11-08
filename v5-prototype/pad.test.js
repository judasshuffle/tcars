const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function setup() {
    const objects = {pad:{id:'pad',position:{x:0,y:0,z:0},dimensions:{x:1,y:1,z:1},rotation:{}}};
    const timers=[], edits=[], deleted=[]; let next=0;
    const context={Uuid:{NULL:'null'},print(){},Vec3:{sum:(a,b)=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z}),multiplyQbyV:(q,v)=>v},
        Quat:{fromPitchYawRollDegrees:()=>({})},Script:{setTimeout:(fn,ms)=>timers.push({fn,ms})},
        Entities:{addEntity(p){const id='e'+(++next);objects[id]={...p,id};return id;},
            getEntityProperties(id){return objects[id]||{id:'null'};},
            editEntity(id,p){edits.push({id,p});},deleteEntity(id){deleted.push(id);delete objects[id];}}};
    const ctor=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'pad-server.js'),'utf8'),context);
    const server=new ctor(); server.preload('pad');
    return {server,objects,timers,edits,deleted};
}
test('two players get distinct pending cars and activation waits for all wheels',()=>{
    const s=setup(), a='player-a-token-123456789012345', b='player-b-token-123456789012345';
    s.server.rez('pad',[a]); s.server.rez('pad',[b]);
    const cars=Object.values(s.objects).filter(x=>x.name==='TCARS V5 prototype Blues');
    assert.equal(cars.length,2); assert.notDeepEqual(cars[0].position,cars[1].position);
    for (const c of cars) { assert.equal(c.dynamic,false); assert.equal(c.vehicle.type,'none');
        assert.equal(Object.values(s.objects).filter(x=>x.parentID===c.id).length,4); }
    assert.equal(s.edits.length,0); assert.deepEqual(s.timers.map(x=>x.ms),[1500,1500]);
    s.timers.forEach(x=>x.fn()); assert.equal(s.edits.length,2);
    assert.equal(s.edits[0].p.vehicle.type,'wheeled'); assert.equal(s.edits[0].p.dynamic,true);
    s.server.remove('pad',[a]); assert.deepEqual(s.deleted,[cars[0].id]); assert.ok(s.objects[cars[1].id]);
});
test('capacity never evicts another car and removed pending cars do not activate',()=>{
    const s=setup(), keys=Array.from({length:7},(_,i)=>'player-token-123456789012345-'+i);
    keys.forEach(k=>s.server.rez('pad',[k]));
    assert.equal(s.timers.length,6); assert.equal(s.deleted.length,0);
    s.server.remove('pad',[keys[0]]); s.timers[0].fn(); assert.equal(s.edits.length,0);
    s.server.rez('pad',[keys[6]]); assert.equal(s.timers.length,7);
});
