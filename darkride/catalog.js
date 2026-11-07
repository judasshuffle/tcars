// Apache-2.0. Offline examples plus the original TCARS catalogue, without legacy movement code.
"use strict";
var C = typeof Script !== 'undefined' ? Script.require('./core.js') : require('./core.js');
function vehicle(name, width, height, length) {
    var radius=0.36, travel=0.24, ride=height/2+0.32;
    var wheels=[['FL',-1,-1],['FR',1,-1],['RL',-1,1],['RR',1,1]].map(function(w){
        return {name:w[0],center:[w[1]*width*0.46,radius+travel*0.5-ride,w[2]*length*0.33],
            radius:radius,width:0.22,mass:20,suspensionDistance:travel,targetPosition:0.5,steer:w[2]<0?1:0,
            brake:1,handBrake:w[2]>0?1:0};
    });
    return {id:'roadster',name:name,dimensions:{x:width,y:height,z:length},rideHeight:ride,
        seat:{x:0,y:0.18,z:-0.2},color:{red:225,green:70,blue:35},
        spec:{type:'wheeled',mass:1200,centerOfMass:{x:0,y:-0.25,z:0},wheels:JSON.stringify(wheels),
            // TCARS handles entering from the HUD. Empty native seats prevent system/vehicles.js taking a second seat.
            seats:'[]',maxSteerAngle:30,maxTorque:240,minRPM:800,maxRPM:6000,gearRatios:'[3.2,2.1,1.4,1.0,0.8]',
            reverseGearRatio:3.1,finalDriveRatio:3.6,maxBrakeTorque:1500,maxHandBrakeTorque:3000,
            driveType:'rear',suspensionFrequency:1.8,suspensionDamping:0.65}};
}
function practice() {
    var entities=[];
    function box(name,x,y,z,dx,dy,dz,color){entities.push({type:'Box',name:name,localPosition:{x:x,y:y,z:z},
        dimensions:{x:dx,y:dy,z:dz},rotation:C.IDENTITY,color:color,friction:0.85,restitution:0});}
    var road={red:65,green:70,blue:78},wall={red:230,green:125,blue:35};
    box('Practice circuit road',0,-0.5,-40,80,1,100,road);
    box('Centre island',0,0.35,-40,40,0.7,60,{red:65,green:125,blue:70});
    box('Left barrier',-40,0.7,-40,1,1.4,100,wall);box('Right barrier',40,0.7,-40,1,1.4,100,wall);
    box('Far barrier',0,0.7,-90,80,1.4,1,wall);box('Near barrier',0,0.7,10,80,1.4,1,wall);
    for(var i=0;i<10;i++){box('Start stripe',-39+i*2,0.012,-3,2,0.024,1,i%2?{red:255,green:255,blue:255}:{red:15,green:15,blue:15});}
    var gates=[{x:-30,y:2,z:-3},{x:-30,y:2,z:-75},{x:30,y:2,z:-75},{x:30,y:2,z:0}].map(function(p,i){
        if(i>0){box('Checkpoint '+(i+1),p.x,0.018,p.z,18,0.036,0.5,{red:65,green:210,blue:220});}
        return {position:p,rotation:C.IDENTITY,dimensions:{x:18,y:6,z:i===0?2:12}};
    });
    return {id:'practice',name:'Practice circuit (offline)',description:'New primitive circuit, not an original recovered TCARS track. Four ordered checkpoints.',
        startPosition:{x:-30,y:0,z:3},startOrientation:C.IDENTITY,data:{entities:entities},checkpoints:gates};
}
function make(originalVehicles,originalTracks){
    var cars=[vehicle('TCARS Roadster (offline)',1.8,0.8,4)];
    Object.keys(originalVehicles).forEach(function(id){
        var old=originalVehicles[id], scale=['BBCAR','WOLF','CAT','HANDVAN','SHOE'].indexOf(id)>=0?0.25:1;
        var car=vehicle(old.name,old.dimensions.x,old.dimensions.y,old.dimensions.z);
        if(scale!==1){
            car.dimensions={x:old.dimensions.x*scale,y:old.dimensions.y*scale,z:old.dimensions.z*scale};car.seat={x:0,y:0.18*scale,z:-0.2*scale};
            var wheels=JSON.parse(car.spec.wheels); wheels.forEach(function(w){w.radius*=scale;w.width*=scale;w.suspensionDistance*=scale;w.center=w.center.map(function(n){return n*scale;});});
            car.spec.wheels=JSON.stringify(wheels);car.rideHeight*=scale;car.spec.centerOfMass.y*=scale;
        }
        if(id==='SHOE'){car.spec.centerOfMass.y=-car.dimensions.y*0.45;}
        car.id=id;car.modelURL='http://hifi-external.s3.amazonaws.com/tcars/models/'+old.modelFile;
        // Original geometry is visual only; the native chassis is centred and uses Jolt wheels.
        car.description='Original body; new native Jolt chassis. Primitive body if asset unavailable.';
        cars.push(car);
    });
    var newModels=[
        {path:'texture-rescue-final-20261021T070855Z-v2/b41b3e4a8495c34f6fbf',dimensions:{x:2,y:1.5,z:4.5},rotation:{x:0,y:0,z:0,w:1}},
        {path:'texture-rescue-final-20261021T070855Z-v2/e533be549255a8b6e6ab',dimensions:{x:2,y:1.5,z:4.5},rotation:{x:0,y:0,z:0,w:1}},
        {path:'texture-repair-20261020/931d35c864b7e761616a',dimensions:{x:2,y:1.5,z:4.5},rotation:{x:0,y:0,z:0,w:1}},
        {path:'texture-rescue-final-20261021T070855Z-v2/446723d942f05df61e2f',dimensions:{x:2,y:1.5,z:4.5},rotation:{x:0,y:0,z:0,w:1}}
    ];
    newModels.forEach(function(model,i){var d=model.dimensions,car=vehicle('New Vehicle '+(i+1),d.x,d.y,d.z);
        car.id='NEW'+(i+1);car.modelURL='https://raw.githubusercontent.com/judasshuffle/robotdolly-world-assets/main/assets/texture-repair/'+model.path+'/model.fbx';
        car.modelDimensions=C.copy(d);car.modelRotation=C.copy(model.rotation);cars.push(car);});
    var tracks=[];
    originalTracks.filter(function(t){return t.trackJSON!=='school.json';}).forEach(function(t){tracks.push({id:t.trackJSON,name:t.name+' (original)',description:'Original layout and scale. No saved checkpoints. '+
        (t.trackJSON==='school.json'?'Missing old collision hull: uses the recovered visual mesh for static collision.':
            t.trackJSON==='street.json'?'Two unavailable phone props and one flashlight omitted.':'Recovered geometry; textures may be incomplete.'),
        file:t.trackJSON,startPosition:t.startPosition,startOrientation:t.startOrientation,checkpoints:[]});});
    return {vehicles:cars,tracks:tracks};
}
module.exports={make:make,vehicle:vehicle,practice:practice};
