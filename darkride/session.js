// Apache-2.0. One TCARS session; native physics only. Environment injection enables lifecycle tests.
"use strict";
var C = typeof Script !== 'undefined' ? Script.require('./core.js') : require('./core.js');
function Session(env, catalog, manifest, rootURL, notify) {
    this.env=env;this.catalog=catalog;this.manifest=manifest;this.rootURL=rootURL;this.notify=notify;
    this.token=String(env.MyAvatar.sessionUUID)+'/'+Date.now()+'/'+Math.random();
    this.owned={};this.track=null;this.car=null;this.seated=null;this.busy=false;this.closed=false;
    this.pending=null;this.race=new C.Race([]);this.cameraPosition=null;this.cameraMode='chase';
    this.sound=null;this.injector=null;this.soundMode=null;this.muted=false;this.accumulator=0;this.lease=0;
    this.status='Ready. Build a track, then spawn a car.';this.keys={};this.errors=[];
    this.inputPaused=false;this.fireCooldown=0;this.projectileModels={};
}
Session.prototype.say=function(message){this.status=message;this.env.print('[TCARS] '+message);this.notify();};
Session.prototype.asset=function(url,localOnly){
    var entry=this.manifest.assets[url];
    if(!entry || !entry.available){return null;}
    // Collision resources must resolve on the domain physics server, not only on this client.
    // Use the verified upstream source for file/localhost launches; a shared web deployment uses its cache.
    var shared=/^https?:\/\//i.test(this.rootURL) && !/^https?:\/\/(localhost|127\.[0-9.]+|\[::1\])(:|\/)/i.test(this.rootURL);
    return localOnly || shared ? this.rootURL+entry.path : (entry.request || url.replace(/^http:/,'https:'));
};
Session.prototype.checkAPI=function(){
    var e=this.env.Entities;
    if(typeof e.setVehicleControls!=='function' || typeof e.clearVehicleControls!=='function'){
        throw new Error('This viewer lacks native Jolt vehicle controls. Install a current DarkRide Jolt build.');
    }
};
Session.prototype.checkRez=function(){
    if(typeof this.env.Entities.canRez==='function' && !this.env.Entities.canRez() &&
        !(typeof this.env.Entities.canRezTmp==='function' && this.env.Entities.canRezTmp())){
        throw new Error('This domain does not allow you to rez entities. Use your own domain or request rez permission.');
    }
};
Session.prototype.add=function(properties,kind,list){
    var p=C.copy(properties);p.name='TCARS / '+(p.name || kind);
    p.userData=JSON.stringify({tcars:{version:1,session:this.token,owner:String(this.env.MyAvatar.sessionUUID),kind:kind}});
    p.lifetime=kind==='projectile'?5:7200;p.grab={grabbable:false};
    var id=this.env.Entities.addEntity(p,'domain');
    if(!id || String(id)===String(this.env.Uuid.NULL)){throw new Error('Entity creation failed. Check domain rez permissions.');}
    this.owned[id]=kind;if(list){list.push(id);}return id;
};
Session.prototype.isOwned=function(id){
    if(!this.owned[id]){return false;}
    var p=this.env.Entities.getEntityProperties(id,['id','userData']);
    try{return String(p.id)===String(id) && JSON.parse(p.userData).tcars.session===this.token;}catch(e){return false;}
};
Session.prototype.removeIDs=function(ids){
    var self=this;
    ids.slice().reverse().forEach(function(id){
        if(self.isOwned(id)){self.env.Entities.deleteEntity(id);}delete self.owned[id];
    });
};
Session.prototype.front=function(distance){
    var rotation=C.level(this.env.MyAvatar.orientation), position=C.add(this.env.MyAvatar.position,C.rotate(rotation,{x:0,y:0,z:-distance}));
    // Avatar position is the hips, not the ground. Prefer the collision surface under the spawn point.
    var hit=this.env.Entities.findRayIntersection({origin:C.add(position,{x:0,y:2,z:0}),direction:{x:0,y:-1,z:0}},true);
    position.y=hit.intersects && hit.distance<20 ? hit.intersection.y+0.04 : position.y-1;
    return {position:position,rotation:rotation};
};
Session.prototype.build=function(index){
    if(this.busy){throw new Error('A track is already being built. Use Cancel build to stop.');}
    if(this.seated){throw new Error('Exit the car before building a track.');}
    this.checkAPI();this.checkRez();
    var track=this.catalog.tracks[index];if(!track || !track.data){throw new Error('Track data is not loaded.');}
    var pose=this.front(12), frame=C.trackFrame(track,pose.position,pose.rotation), self=this;
    pose.rotation=C.quat(frame.rotation,track.startOrientation || C.IDENTITY);
    // Preflight ALL geometry before touching the current track.
    var props=C.importEntities(track.data,frame,function(url){return self.asset(url);});
    var ids=[],i=0;
    this.busy=true;this.pending={ids:ids,cancelled:false};var pending=this.pending;
    function batch(){
        if(pending.cancelled || self.closed){return;}
        try{
            var limit=Math.min(i+12,props.length);
            for(;i<limit;i++){self.add(props[i],'track',ids);}
            self.say('Building '+track.name+': '+i+'/'+props.length);
            if(i<props.length){pending.timer=self.env.Script.setTimeout(batch,30);return;}
            var gates=(track.checkpoints || []).map(function(g){return {position:C.point(frame,g.position),
                rotation:C.quat(frame.rotation,g.rotation || C.IDENTITY),dimensions:C.copy(g.dimensions)};});
            self.removeCar();if(self.track){self.removeIDs(self.track.ids);}
            self.track={ids:ids,definition:track,pose:pose,frame:frame,gates:gates};
            self.race=new C.Race(gates);self.busy=false;self.pending=null;
            self.say(track.name+' built. Spawn a car. '+(gates.length?'Cross the start stripe to time laps.':'Free drive: no saved checkpoint data.'));
        }catch(error){self.removeIDs(ids);self.busy=false;self.pending=null;self.say('Build failed: '+error.message);}
    }
    batch();
};
Session.prototype.cancelBuild=function(){
    if(!this.pending){return;}
    this.pending.cancelled=true;if(this.pending.timer){this.env.Script.clearTimeout(this.pending.timer);}
    this.removeIDs(this.pending.ids);this.pending=null;this.busy=false;this.say('Build cancelled; previous track kept.');
};
Session.prototype.spawn=function(index){
    if(this.busy){throw new Error('Wait for the track build to finish.');}
    this.checkAPI();this.checkRez();
    var def=this.catalog.vehicles[index];if(!def){throw new Error('Unknown vehicle.');}
    var pose=this.track?C.copy(this.track.pose):this.front(6);
    if(this.track){
        var ground=this.env.Entities.findRayIntersection({origin:C.add(pose.position,{x:0,y:8,z:0}),direction:{x:0,y:-1,z:0}},
            true,this.track.ids,[],false,true);
        if(!ground.intersects || ground.distance>30){throw new Error('Track surface at the start is not ready. Wait for models to load, then Spawn again; check Diagnostics if this persists.');}
        pose.position.y=ground.intersection.y;
    }
    pose.position.y+=def.rideHeight+0.15;
    var ids=[],self=this,id,bodyURL=def.modelURL?this.asset(def.modelURL):null;
    try{
        id=this.add({type:'Box',name:def.name,position:pose.position,rotation:pose.rotation,dimensions:def.dimensions,
            color:def.color,visible:!bodyURL,dynamic:true,collisionless:false,gravity:{x:0,y:-9.8,z:0},
            damping:0.02,angularDamping:0.1,friction:0.6,restitution:0,vehicle:C.copy(def.spec)},'car',ids);
        if(bodyURL){this.add({type:'Model',name:def.name+' original body',modelURL:bodyURL,parentID:id,
            localPosition:C.ZERO,localRotation:C.IDENTITY,dimensions:def.dimensions,collisionless:true,dynamic:false},'car',ids);}
        else{
            this.add({type:'Box',name:'Windscreen',parentID:id,localPosition:{x:0,y:def.dimensions.y*0.65,z:-0.2},
                dimensions:{x:def.dimensions.x*0.78,y:0.42,z:def.dimensions.z*0.36},color:{red:55,green:110,blue:135},
                collisionless:true,dynamic:false},'car',ids);
            this.add({type:'Box',name:'Front marker',parentID:id,localPosition:{x:0,y:0.05,z:-def.dimensions.z/2-0.01},
                dimensions:{x:def.dimensions.x*0.7,y:0.12,z:0.025},color:{red:255,green:240,blue:160},collisionless:true},'car',ids);
        }
        JSON.parse(def.spec.wheels).forEach(function(w){
            self.add({type:'Shape',shape:'Cylinder',name:w.name,parentID:id,
                localPosition:{x:w.center[0],y:w.center[1]-w.suspensionDistance/2,z:w.center[2]},
                localRotation:{x:0,y:0,z:Math.SQRT1_2,w:Math.SQRT1_2},
                dimensions:{x:2*w.radius,y:w.width,z:2*w.radius},color:{red:25,green:25,blue:28},
                dynamic:false,collisionless:true,vehicle:{type:'wheel',wheel:w.name,axle:'y'}},'car',ids);
        });
        var nativeProps=this.env.Entities.getEntityProperties(id,['vehicle']);
        if(!nativeProps.vehicle || nativeProps.vehicle.type!=='wheeled'){
            throw new Error('Viewer rejected vehicle properties. A current Jolt DarkRide build is required.');
        }
    }catch(error){this.removeIDs(ids);throw error;}
    this.removeCar();this.car={id:id,ids:ids,definition:def,spawn:pose};this.race.reset();
    this.say(def.name+' spawned. Enter to drive.'+(def.modelURL&&!bodyURL?' Original body unavailable; using primitive substitute.':''));
};
Session.prototype.removeCar=function(){
    this.exit();
    if(this.car){this.env.Entities.clearVehicleControls(this.car.id);this.removeIDs(this.car.ids);this.car=null;}
    this.race.reset();
};
Session.prototype.removeTrack=function(){
    this.cancelBuild();this.removeCar();
    if(this.track){this.removeIDs(this.track.ids);this.track=null;}
    this.race=new C.Race([]);this.say('Your track and car removed.');
};
Session.prototype.driveKeys=function(){
    var d=this.env.DriveKeys;
    return ['TRANSLATE_X','TRANSLATE_Y','TRANSLATE_Z','YAW','STEP_YAW','STEP_TRANSLATE_X','STEP_TRANSLATE_Y','STEP_TRANSLATE_Z']
        .map(function(k){return d[k];}).filter(function(k){return k!==undefined;});
};
Session.prototype.enter=function(){
    if(this.seated){return;}
    if(!this.car || !this.isOwned(this.car.id)){throw new Error('Spawn a car first.');}
    var a=this.env.MyAvatar, p=this.env.Entities.getEntityProperties(this.car.id,['vehicle','position','rotation']);
    if(a.parentID && String(a.parentID)!==String(this.env.Uuid.NULL)){throw new Error('Leave your current seat before entering TCARS.');}
    if(p.vehicle.driver && String(p.vehicle.driver)!==String(this.env.Uuid.NULL) && String(p.vehicle.driver)!==String(a.sessionUUID)){
        throw new Error('This car already has a driver.');
    }
    if(!this.env.Entities.editEntity(this.car.id,{vehicle:{driver:a.sessionUUID}})){throw new Error('Cannot claim the driver seat.');}
    this.seated={collisions:a.collisionsEnabled,lean:a.hmdLeanRecenterEnabled,camera:this.env.Camera.mode,
        parent:a.parentID,joint:a.parentJointIndex,roles:[]};
    try{
        a.collisionsEnabled=false;a.hmdLeanRecenterEnabled=false;
        this.driveKeys().forEach(function(k){a.disableDriveKey(k);});
        a.parentID=this.car.id;a.parentJointIndex=65535;a.localPosition=C.copy(this.car.definition.seat);a.localOrientation=C.IDENTITY;
        // Native animation roles are optional: seating still works if the original remote animation is unavailable.
        if(typeof a.getAnimationRoles==='function'){
            var roles=a.getAnimationRoles().filter(function(r){return r.indexOf('left')!==0 && r.indexOf('right')!==0;});
            this.seated.roles=roles;
            roles.forEach(function(r){a.overrideRoleAnimation(r,'https://s3-us-west-1.amazonaws.com/hifi-content/clement/production/animations/sitting_idle.fbx',30,true,1,350);});
        }
        this.env.Camera.mode='independent';this.cameraPosition=null;this.keys={};
        this.say('Driving: W/S throttle and reverse; A/D steer; Space fire; Shift handbrake; F exit; R recover; T start.');
    }catch(error){this.exit();throw error;}
};
Session.prototype.exit=function(){
    if(!this.seated){return;}
    var saved=this.seated,a=this.env.MyAvatar,car=this.car,self=this;
    this.seated=null;this.keys={};this.stopSound();
    if(car){
        this.env.Entities.clearVehicleControls(car.id);
        if(this.isOwned(car.id)){
            var driver=this.env.Entities.getEntityProperties(car.id,['vehicle']).vehicle.driver;
            if(String(driver)===String(a.sessionUUID)){this.env.Entities.editEntity(car.id,{vehicle:{driver:this.env.Uuid.NULL}});}
        }
    }
    var position=C.copy(a.position),rotation=C.level(a.orientation);
    a.parentID=saved.parent || this.env.Uuid.NULL;a.parentJointIndex=saved.joint;
    // Native goToLocation applies between physics steps, avoiding stale seated transforms on exit.
    var offset=car?car.definition.dimensions.x/2+1.2:2;
    a.goToLocation(C.add(position,C.add(C.rotate(rotation,{x:offset,y:0,z:0}),{x:0,y:1,z:0})),true,rotation,false);
    this.driveKeys().forEach(function(k){a.enableDriveKey(k);});
    saved.roles.forEach(function(r){a.restoreRoleAnimation(r);});
    a.collisionsEnabled=saved.collisions;a.hmdLeanRecenterEnabled=saved.lean;this.env.Camera.mode=saved.camera;
    self.say('Exited vehicle.');
};
Session.prototype.reset=function(toStart){
    if(!this.car || !this.isOwned(this.car.id)){throw new Error('Spawn a car first.');}
    var p=this.env.Entities.getEntityProperties(this.car.id,['position','rotation']);
    var position=toStart?C.copy(this.car.spawn.position):C.add(p.position,{x:0,y:this.car.definition.rideHeight+0.5,z:0});
    var rotation=toStart?this.car.spawn.rotation:C.level(p.rotation);
    this.env.Entities.clearVehicleControls(this.car.id);this.keys={};
    this.env.Entities.editEntity(this.car.id,{position:position,rotation:rotation,velocity:C.ZERO,angularVelocity:C.ZERO});
    this.race.reset();this.cameraPosition=null;this.say(toStart?'Returned to start; timer reset.':'Car upright; timer reset.');
};
// Original TCARS ballistic projectile, owned independently by this session.
Session.prototype.fire=function(p){
    if(!this.seated || !this.car || this.fireCooldown>0){return;}
    this.fireCooldown=0.5;
    var id=this.add({type:'Box',name:'Projectile',dimensions:{x:1.25,y:1.45,z:2.56},
        color:{red:255,green:150,blue:35},visible:false,shapeType:'sphere',density:8000,
        dynamic:true,collisionless:false,gravity:C.ZERO,
        position:C.add(p.position,C.rotate(p.rotation,{x:0,y:0,z:-7})),rotation:p.rotation,
        velocity:C.add(p.velocity,C.rotate(p.rotation,{x:0,y:0,z:-10})),
        angularVelocity:C.rotate(p.rotation,{x:0,y:0,z:20}),damping:0,angularDamping:0},'projectile');
    // Keep the existing physical cube; swap only its visible appearance after the FBX loads.
    try{
        this.projectileModels[id]=this.add({type:'Model',name:'Original rocket',parentID:id,
            modelURL:'https://hifi-external.s3.amazonaws.com/tcars/models/rockett.fbx',
            localPosition:C.ZERO,localRotation:{x:Math.SQRT1_2,y:0,z:0,w:-Math.SQRT1_2},
            dimensions:{x:1.25,y:2.56,z:1.45},dynamic:false,collisionless:true},'projectile');
    }catch(error){this.env.print('[TCARS] Rocket unavailable; keeping cube.');}
};
Session.prototype.stopSound=function(){if(this.injector){this.injector.stop();this.injector=null;}this.soundMode=null;};
Session.prototype.audio=function(p,speed){
    if(this.muted || !this.env.SoundCache || !this.env.Audio){this.stopSound();return;}
    var mode=speed>2?'enginenoise2':'idle', url=this.asset('http://hifi-external.s3.amazonaws.com/tcars/sounds/'+mode+'.wav',true);
    if(!url){return;}
    if(this.soundMode!==mode){this.stopSound();this.sound=this.env.SoundCache.getSound(url);this.soundMode=mode;}
    if(!this.injector && this.sound.downloaded){this.injector=this.env.Audio.playSound(this.sound,{position:p.position,loop:true,volume:0.18,localOnly:true});}
    if(this.injector){this.injector.setOptions({position:p.position,volume:0.18});}
};
Session.prototype.update=function(dt){
    if(this.closed){return;}
    var self=this;
    Object.keys(this.projectileModels).forEach(function(id){
        if(!self.isOwned(id)){delete self.projectileModels[id];return;}
        var model=self.projectileModels[id], e=self.env.Entities;
        var loaded=self.isOwned(model) && typeof e.isLoaded==='function' && e.isLoaded(model);
        var visible=e.getEntityProperties(id,['visible']).visible;
        /* Rocket test: cube stays invisible. */
    });
    this.accumulator+=dt;this.lease+=dt;this.fireCooldown=Math.max(0,this.fireCooldown-dt);
    if(this.lease>60){
        this.lease=0;var self=this;
        Object.keys(this.owned).forEach(function(id){
            if(self.owned[id]==='projectile'){if(!self.isOwned(id)){delete self.owned[id];}return;}
            if(self.isOwned(id)){
            var p=self.env.Entities.getEntityProperties(id,['age']);self.env.Entities.editEntity(id,{lifetime:(p.age || 0)+7200});
        }});
    }
    if(this.car && !this.isOwned(this.car.id)){this.exit();this.removeIDs(this.car.ids);this.car=null;this.say('Vehicle was removed externally. Spawn another.');}
    if(this.seated && this.car){
        var p=this.env.Entities.getEntityProperties(this.car.id,['position','rotation','velocity','vehicle']);
        if(String(p.vehicle.driver)!==String(this.env.MyAvatar.sessionUUID) || String(this.env.MyAvatar.parentID)!==String(this.car.id)){
            this.exit();this.say('Driver ownership or seat changed; TCARS released controls.');return;
        }
        var k=this.env.Controller.Hardware.Keyboard, controller=this.env.Controller;
        function val(key){return k[key]===undefined?0:controller.getValue(k[key]);}
        var forward=(val('W')||val('Up'))-(val('S')||val('Down'));
        var steer=(val('D')||val('Right'))-(val('A')||val('Left'));
        // Tablet focus/chat must never leave a latched throttle. Qt keyboard values are read every frame.
        var focused=!this.env.Window || this.env.Window.hasFocus();
        var paused=this.inputPaused || !focused;
        var input=paused?{throttle:0,steering:0,brake:1,handBrake:1}:C.controls(forward,steer,val('Shift')>0.5?1:0,p.velocity,p.rotation);
        if(this.env.Entities.setVehicleControls(this.car.id,input)===false){this.exit();this.say('Native vehicle controls rejected this entity.');return;}
        if(!paused && val('Space')>0.5){
            try{this.fire(p);}catch(error){this.say('Cannot fire: '+error.message);}
        }
        var speed=C.length(p.velocity);this.car.speed=speed*3.6;
        this.race.update(p.position,Date.now()/1000);
        var front=C.rotate(p.rotation,{x:0,y:0,z:-1}), target;
        if(this.cameraMode==='hood'){
            target=C.add(p.position,C.rotate(p.rotation,{x:0,y:this.car.definition.dimensions.y/2+0.65,z:-0.6}));
            this.env.Camera.position=target;this.env.Camera.orientation=p.rotation;
        }else{
            target=C.add(p.position,C.add(C.mul(front,-Math.max(7,this.car.definition.dimensions.z*1.7)),{x:0,y:3.2,z:0}));
            this.cameraPosition=this.cameraPosition?C.add(this.cameraPosition,C.mul(C.sub(target,this.cameraPosition),1-Math.exp(-Math.min(dt,0.1)*6))):target;
            this.env.Camera.position=this.cameraPosition;
            this.env.Camera.orientation=this.env.Quat.lookAtSimple(this.cameraPosition,C.add(p.position,{x:0,y:0.6,z:0}));
        }
        if(this.accumulator>=0.15){this.audio(p,speed);}
    }
    if(this.accumulator>=0.15){this.accumulator=0;this.notify();}
};
Session.prototype.state=function(){
    return {status:this.status,busy:this.busy,hasCar:!!this.car,hasTrack:!!this.track,seated:!!this.seated,
        speed:this.car?Math.round(this.car.speed||0):0,track:this.track?this.track.definition.name:'No track',
        laps:this.race.laps,next:this.race.gates.length?this.race.next+1:null,
        elapsed:this.race.started===null?null:Date.now()/1000-this.race.started,last:this.race.last,best:this.race.best,
        camera:this.cameraMode,muted:this.muted};
};
Session.prototype.cleanup=function(){
    if(this.closed){return;}this.closed=true;this.cancelBuild();this.removeCar();
    this.removeIDs(Object.keys(this.owned));this.track=null;
};
module.exports=Session;
