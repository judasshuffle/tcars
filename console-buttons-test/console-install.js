// TCARS console — one-time click-target installer, aligned to TCARS_Console.fbx.
(function () {
 'use strict';
 var CONTROLLER='https://judasshuffle.github.io/tcars/console-buttons-test/console-controller.js';
 // Measured coordinates of the independent button meshes in the uploaded FBX.
 var BOUNDS={x:2.5888891,y:3.4332064,z:2.0673966,cx:-0.03497505,cy:-0.01544076};
 function say(s){print('[TCARS console install] '+s);}
 function stop(s){say('STOP '+s);Window.alert('TCARS console: '+s);Script.stop();}
 var matches=[];
 Entities.findEntities(MyAvatar.position,25).forEach(function(id){
  var p=Entities.getEntityProperties(id,['type','modelURL','position']);
  if(p.type==='Model' && /TCARS_Console\.fbx/i.test(String(p.modelURL||'')) &&
     Vec3.distance(p.position,MyAvatar.position)<25){matches.push(id);}
 });
 if(matches.length!==1){stop('Expected one nearby TCARS console Model; found '+matches.length);return;}
 var root=matches[0],p=Entities.getEntityProperties(root,['dimensions','script','position']);
 if(p.script && String(p.script).indexOf('console-controller.js')<0){stop('Console already has a different client script.');return;}
 var s={x:p.dimensions.x/BOUNDS.x,y:p.dimensions.y/BOUNDS.y,z:p.dimensions.z/BOUNDS.z};
 if(!(s.x>0 && s.y>0 && s.z>0)){stop('Console dimensions invalid');return;}
 var existing={};
 Entities.findEntities(p.position,5).forEach(function(id){
  var a=Entities.getEntityProperties(id,['parentID','userData']);
  if(String(a.parentID)!==String(root)){return;}
  try{var key=JSON.parse(a.userData||'{}').tcarsConsoleButton;if(key){existing[key]=1;}}catch(e){}
 });
 var buttons=[];
 function add(key,x,y,z,dx,dy,dz){buttons.push([key,x,y,z,dx,dy,dz]);}
 for(var i=0;i<5;i++){
  var across=-0.7272727+i*0.36363636;
  add('CAR_0'+(i+1),-0.0958535,across,0.877969,0.324,0.182,0.178);
  add('TRACK_0'+(i+1),0.5144666,across,0.609727,0.324,0.182,0.178);
 }
 add('CLEANUP',0.995680,0,0.398228,0.337,0.910,0.185);
 var made=0;
 buttons.forEach(function(b){
  if(existing[b[0]]){say(b[0]+' already exists');return;}
  // FBX -90-degree X conversion: source (x,y,z) -> world (x,z,-y).
  var pos={x:(b[1]-BOUNDS.cx+0.055)*s.x,y:(b[3]-BOUNDS.cy+0.05)*s.y,z:-b[2]*s.z};
  var dim={x:(b[4]+0.05)*s.x,y:(b[6]+0.05)*s.y,z:(b[5]+0.02)*s.z};
  var color=b[0]==='CLEANUP'?{red:255,green:60,blue:60}:
    b[0].indexOf('CAR_')===0?{red:50,green:165,blue:255}:{red:255,green:205,blue:45};
  var child=Entities.addEntity({type:'Box',name:'TCARS / '+b[0]+' click target',
   parentID:root,localPosition:pos,dimensions:dim,color:color,alpha:0.35,
   visible:true,collisionless:true,dynamic:false,lifetime:-1,grab:{grabbable:false},
   userData:JSON.stringify({tcarsConsoleButton:b[0]})},'domain');
  if(child && String(child)!==String(Uuid.NULL)){made++;say('placed '+b[0]);}
  else{say('FAILED '+b[0]);}
 });
 var ok=Entities.editEntity(root,{script:CONTROLLER});
 say('Created '+made+' buttons. Controller assigned='+ok);
 Window.alert('TCARS: '+made+' translucent click targets added. Click buttons and check log for [TCARS console] CLICK. This is an alignment test, not gameplay yet.');
 Script.stop();
}());
