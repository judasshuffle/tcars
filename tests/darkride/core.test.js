'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const C=require('../../darkride/core'),Catalog=require('../../darkride/catalog');
const root=path.resolve(__dirname,'../..');
function oldTracks(){const context={module:{exports:{}},Script:{require:()=>({CAMERA:{}})}};
    vm.runInNewContext(fs.readFileSync(path.join(root,'modules/tracks.js'),'utf8'),context);return context.module.exports;}
function close(a,b){assert(Math.abs(a-b)<1e-6,`${a} != ${b}`);}
test('every original track keeps distances and dimensions; start is moved to avatar-forward pose',()=>{
    const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/manifest.json'),'utf8')).assets;
    for(const track of oldTracks()){
        const data=JSON.parse(fs.readFileSync(path.join(root,'trackzones',track.trackJSON),'utf8'));
        const target={x:30,y:7,z:-80},q=C.yaw(1.2),frame=C.trackFrame(track,target,q);
        const start=C.point(frame,track.startPosition);for(const k of ['x','y','z']){close(start[k],target[k]);}
        const first=data.entities.find(e=>e.type==='Model' && manifest[e.modelURL]?.available);
        const result=C.importEntities(data,frame,u=>manifest[u]?.available?manifest[u].path:null);
        const transformed=result.find(e=>e.modelURL===manifest[first.modelURL].path);
        assert.deepEqual(transformed.dimensions,first.dimensions);
        close(C.length(C.sub(transformed.position,target)),C.length(C.sub(first.localPosition,track.startPosition)));
        const heading=C.quat(frame.rotation,track.startOrientation);close(C.dot(C.rotate(heading,{x:0,y:0,z:-1}),C.rotate(q,{x:0,y:0,z:-1})),1);
        assert(result.every(e=>!e.script && !e.userData && !e.dynamic && e.type!=='Zone'));
    }
});
test('missing required geometry fails preflight instead of building invisible roads',()=>{
    const data={entities:[{type:'Model',dimensions:{x:1,y:1,z:1},localPosition:C.ZERO,modelURL:'missing'}]};
    assert.throws(()=>C.importEntities(data,C.trackFrame({},C.ZERO,C.IDENTITY),()=>null),/Missing model/);
});
test('brake before reverse, steering sign and native control ranges',()=>{
    assert.deepEqual(C.controls(-1,1,0,{x:0,y:0,z:-10},C.IDENTITY),{throttle:0,steering:1,brake:1,handBrake:0});
    assert.equal(C.controls(-1,0,0,C.ZERO,C.IDENTITY).throttle,-1);
    assert.equal(C.controls(1,0,0,{x:0,y:0,z:10},C.IDENTITY).brake,1);
});
test('ordered swept checkpoints cannot skip gates or count resting inside start',()=>{
    const gates=[0,10,20].map(z=>({position:{x:0,y:0,z},dimensions:{x:4,y:4,z:1},rotation:C.IDENTITY}));
    const race=new C.Race(gates);race.update({x:0,y:0,z:-2},0);race.update({x:0,y:0,z:2},1);
    assert.equal(race.next,1);race.update({x:0,y:0,z:0},2);assert.equal(race.laps,0);
    race.update({x:0,y:0,z:12},3);race.update({x:0,y:0,z:22},4);assert.equal(race.next,0);
    race.update({x:0,y:0,z:-2},5);assert.equal(race.laps,1);assert.equal(race.last,4);
    race.update({x:0,y:0,z:0},6);assert.equal(race.laps,1);
    race.reset();assert.equal(race.laps,0);assert.equal(race.started,null);
});
test('offline circuit and native car are complete without URLs',()=>{
    const t=Catalog.practice(),v=Catalog.vehicle('test',1.8,0.8,4);
    assert(t.data.entities.length>=6);assert.equal(t.checkpoints.length,4);
    const wheels=JSON.parse(v.spec.wheels);assert.equal(wheels.length,4);assert(wheels[0].center[2]<wheels[2].center[2]);
    assert.equal(v.spec.seats,'[]');assert.equal(wheels.filter(w=>w.steer===1).length,2);
    assert.equal(C.importEntities(t.data,C.trackFrame(t,C.ZERO,C.IDENTITY),()=>null).length,t.data.entities.length);
});
