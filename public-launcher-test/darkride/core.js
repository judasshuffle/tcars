// TCARS DarkRide. Apache-2.0. Pure geometry, import and race logic, shared with Node tests.
"use strict";
var ZERO = { x: 0, y: 0, z: 0 };
var IDENTITY = { x: 0, y: 0, z: 0, w: 1 };
function copy(v) { return JSON.parse(JSON.stringify(v)); }
function add(a, b) { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
function sub(a, b) { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
function mul(a, s) { return { x: a.x * s, y: a.y * s, z: a.z * s }; }
function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
function length(a) { return Math.sqrt(dot(a, a)); }
function quat(a, b) {
    return { x: a.w*b.x+a.x*b.w+a.y*b.z-a.z*b.y, y: a.w*b.y-a.x*b.z+a.y*b.w+a.z*b.x,
        z: a.w*b.z+a.x*b.y-a.y*b.x+a.z*b.w, w: a.w*b.w-a.x*b.x-a.y*b.y-a.z*b.z };
}
function inverse(q) { var n=q.x*q.x+q.y*q.y+q.z*q.z+q.w*q.w; return {x:-q.x/n,y:-q.y/n,z:-q.z/n,w:q.w/n}; }
function rotate(q, p) { var r=quat(quat(q,{x:p.x,y:p.y,z:p.z,w:0}),inverse(q)); return {x:r.x,y:r.y,z:r.z}; }
function yaw(angle) { return { x: 0, y: Math.sin(angle/2), z: 0, w: Math.cos(angle/2) }; }
function level(q) { var f=rotate(q,{x:0,y:0,z:-1}); return yaw(Math.atan2(-f.x,-f.z)); }
function validVector(p) { return p && ['x','y','z'].every(function(k){return typeof p[k]==='number' && isFinite(p[k]);}); }
function controls(forward, steering, handBrake, velocity, rotation) {
    var speed=dot(velocity,rotate(rotation,{x:0,y:0,z:-1}));
    var brake=forward*speed<0 && Math.abs(speed)>0.5 ? Math.abs(forward) : 0;
    return {throttle:brake?0:forward,steering:steering,brake:brake,handBrake:handBrake};
}
// Saved localPosition is relative to the old zone's translation, NOT its rotation.
// Rotate the whole export around its start so the original heading faces the avatar's forward.
function trackFrame(track, position, rotation) {
    return {position:position,rotation:quat(level(rotation),inverse(level(track.startOrientation || IDENTITY))),origin:track.startPosition || ZERO};
}
function point(frame, local) { return add(frame.position,rotate(frame.rotation,sub(local,frame.origin))); }
var OPTIONAL_MODELS=['https://hifi-public.s3.amazonaws.com/models/props/flashlight.fbx','https://hifi-public.s3.amazonaws.com/ryan/ryan_phoneApt01.fbx'];
var LOST_COLLISION='https://dl.dropboxusercontent.com/u/96759331/fbx/collision_track.obj';
function assetException(url) { return url===LOST_COLLISION || OPTIONAL_MODELS.indexOf(url)>=0; }
function importEntities(data, frame, resolveAsset) {
    var allowed=['type','name','dimensions','color','visible','shape','shapeType','friction','restitution',
        'isSpotlight','intensity','exponent','cutoff','falloffRadius'];
    var output=[];
    data.entities.forEach(function(source){
        // Old global lighting zones and executable userData are deliberately not imported.
        if (['Box','Sphere','Shape','Model','Light'].indexOf(source.type)<0) { return; }
        if (!validVector(source.localPosition) || !validVector(source.dimensions)) { throw new Error('Invalid track entity transform'); }
        var e={}; allowed.forEach(function(k){ if(source[k]!==undefined){e[k]=copy(source[k]);} });
        e.position=point(frame,source.localPosition);
        e.rotation=quat(frame.rotation,source.rotation || IDENTITY);
        e.dynamic=false; e.gravity=copy(ZERO); e.collisionless=source.type==='Light';
        e.visible=source.visible!==0 && source.visible!==false;
        if(source.type==='Model') {
            e.modelURL=resolveAsset(source.modelURL);
            if(!e.modelURL){if(assetException(source.modelURL)){return;}throw new Error('Missing model: '+source.modelURL);}
            if(source.compoundShapeURL){
                e.compoundShapeURL=resolveAsset(source.compoundShapeURL);
                if(!e.compoundShapeURL){
                    if(source.compoundShapeURL!==LOST_COLLISION){throw new Error('Missing collision mesh: '+source.compoundShapeURL);}
                    delete e.compoundShapeURL;e.shapeType='static-mesh';
                }
            }
            // Static mesh is the native fallback for models exported without a collision hull.
            if(!e.shapeType || e.shapeType==='none'){e.shapeType='static-mesh';}
        }
        output.push(e);
    });
    return output;
}
function inside(p, gate) {
    var v=rotate(inverse(gate.rotation || IDENTITY),sub(p,gate.position));
    return Math.abs(v.x)<=gate.dimensions.x/2 && Math.abs(v.y)<=gate.dimensions.y/2 && Math.abs(v.z)<=gate.dimensions.z/2;
}
// Swept segment/OBB intersection catches a fast car crossing between UI ticks.
function crosses(a,b,gate) {
    var inv=inverse(gate.rotation || IDENTITY), p=rotate(inv,sub(a,gate.position)), q=rotate(inv,sub(b,gate.position));
    var lo=0,hi=1;
    ['x','y','z'].forEach(function(k){
        var d=q[k]-p[k],h=gate.dimensions[k]/2;
        if(Math.abs(d)<1e-8){if(Math.abs(p[k])>h){hi=-1;} return;}
        var t1=(-h-p[k])/d,t2=(h-p[k])/d;
        lo=Math.max(lo,Math.min(t1,t2)); hi=Math.min(hi,Math.max(t1,t2));
    });
    return lo<=hi;
}
function Race(gates) { this.gates=gates || []; this.reset(); }
Race.prototype.reset=function(){this.next=0;this.laps=0;this.started=null;this.last=null;this.best=null;this.previous=null;};
Race.prototype.update=function(position,now){
    if(!this.gates.length){return false;}
    var gate=this.gates[this.next], hit=this.previous && !inside(this.previous,gate) && crosses(this.previous,position,gate);
    // A teleport cannot complete a lap; the caller also resets on every recovery.
    if(this.previous && length(sub(position,this.previous))>100){this.reset();hit=false;}
    this.previous=copy(position);
    if(!hit){return false;}
    if(this.next===0){
        if(this.started!==null){this.last=now-this.started;this.best=this.best===null?this.last:Math.min(this.best,this.last);this.laps++;}
        this.started=now;
    }
    this.next=(this.next+1)%this.gates.length;
    return true;
};
module.exports={ZERO:ZERO,IDENTITY:IDENTITY,copy:copy,add:add,sub:sub,mul:mul,dot:dot,length:length,quat:quat,inverse:inverse,
    rotate:rotate,yaw:yaw,level:level,controls:controls,trackFrame:trackFrame,point:point,importEntities:importEntities,
    assetException:assetException,Race:Race,crosses:crosses};
