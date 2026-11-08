// Apache-2.0. Isolated TCARS V5 test pad; no V4 entities are touched.
(function () {
    var LIFE = 1800, DELAY = 1500, LIMIT = 6, padID, cars = {};
    var wheels = [['FL',-1,-1],['FR',1,-1],['RL',-1,1],['RR',1,1]].map(function (w) {
        return {name:w[0],center:[w[1]*0.86,-0.42,w[2]*1.60],radius:0.36,width:0.22,mass:20,
            suspensionDistance:0.24,targetPosition:0.5,steer:w[2]<0?1:0,brake:1,handBrake:w[2]>0?1:0};
    });
    var spec = {type:'none',mass:1200,centerOfMass:{x:0,y:-0.25,z:0},wheels:JSON.stringify(wheels),
        seats:JSON.stringify([{name:'driver',position:[-0.42,0.18,-0.2],yaw:0,driver:true},
            {name:'passenger',position:[0.42,0.18,-0.2],yaw:0}]),
        maxSteerAngle:30,maxTorque:240,minRPM:800,maxRPM:6000,gearRatios:'[3.2,2.1,1.4,1,0.8]',
        reverseGearRatio:3.1,finalDriveRatio:3.6,maxBrakeTorque:1500,maxHandBrakeTorque:3000,
        driveType:'rear',suspensionFrequency:1.8,suspensionDamping:0.65};
    function valid(id) { return id && String(id)!==String(Uuid.NULL); }
    function exists(id) { return String(Entities.getEntityProperties(id,['id']).id)===String(id); }
    function clear(key) {
        var car=cars[key]; if (!car) { return; }
        delete cars[key];
        if (exists(car.id)) { Entities.deleteEntity(car.id); }
        print('[TCARS V5] removed '+car.id);
    }
    this.remotelyCallable=['rez','remove'];
    this.preload=function (id) { padID=id; };
    // The opaque token coordinates a client with its own car; it is not authenticated identity.
    this.remove=function (id, params) { var key=params && params[0]; if (typeof key==='string') { clear(key); } };
    this.rez=function (id, params) {
        var key=params && params[0];
        if (typeof key!=='string' || key.length<24 || key.length>200) { return; }
        Object.keys(cars).forEach(function (k) { if (!exists(cars[k].id)) { delete cars[k]; } });
        if (cars[key]) { print('[TCARS V5] remove your existing car before spawning again'); return; }
        var used={}; Object.keys(cars).forEach(function(k){used[cars[k].slot]=true;});
        var slot=0; while (used[slot] && slot<LIMIT) { slot++; }
        if (slot===LIMIT) { print('[TCARS V5] pad full; request rejected'); return; }
        var pad=Entities.getEntityProperties(padID,['position','dimensions','rotation']);
        var offset=Vec3.multiplyQbyV(pad.rotation,{x:(slot%3-1)*7,y:pad.dimensions.y/2+1.45,z:Math.floor(slot/3)*8-7});
        var chassis=Entities.addEntity({type:'Box',shape:'Cube',name:'TCARS V5 prototype Blues',
            position:Vec3.sum(pad.position,offset),rotation:pad.rotation,dimensions:{x:2.017,y:1.409,z:5.602},
            visible:false,dynamic:false,collisionless:false,gravity:{x:0,y:-9.8,z:0},damping:0.02,
            angularDamping:0.1,friction:0.6,restitution:0,lifetime:LIFE,grab:{grabbable:false},
            userData:JSON.stringify({madeBy:padID,tcarsV5:true}),vehicle:spec});
        if (!valid(chassis)) { print('[TCARS V5] chassis creation failed'); return; }
        var failed=false;
        wheels.forEach(function(w){
            var wheel=Entities.addEntity({type:'Shape',shape:'Cylinder',name:'TCARS V5 wheel '+w.name,parentID:chassis,
                localPosition:{x:w.center[0],y:w.center[1]-w.suspensionDistance/2,z:w.center[2]},
                localRotation:Quat.fromPitchYawRollDegrees(0,0,90),dimensions:{x:2*w.radius,y:w.width,z:2*w.radius},
                color:{red:22,green:22,blue:25},dynamic:false,collisionless:true,lifetime:LIFE,
                vehicle:{type:'wheel',wheel:w.name,axle:'y'}});
            if (!valid(wheel)) { failed=true; }
        });
        if (failed) { Entities.deleteEntity(chassis); print('[TCARS V5] wheel creation failed'); return; }
        var car={id:chassis,slot:slot}; cars[key]=car;
        Script.setTimeout(function(){
            if (cars[key]===car && exists(chassis)) {
                Entities.editEntity(chassis,{dynamic:true,vehicle:{type:'wheeled'}});
                print('[TCARS V5] activated '+chassis);
            }
        },DELAY);
        print('[TCARS V5] pending '+chassis+' slot '+slot);
    };
});
