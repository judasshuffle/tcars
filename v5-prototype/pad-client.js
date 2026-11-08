// Apache-2.0. Local visuals follow the supplied vehicle-pad workaround.
(function () {
    var NAME='TCARS V5 prototype Blues', RADIUS=1000, padID, position, timer, sign, parts={}, last=0;
    var token=String(MyAvatar.sessionUUID)+'/'+Date.now()+'/'+Math.random()+'/'+Math.random();
    function scan() {
        var found={};
        Entities.findEntitiesByName(NAME,position,RADIUS,true).forEach(function(id){
            var data; try { data=JSON.parse(Entities.getEntityProperties(id,['userData']).userData || '{}'); } catch(e) { return; }
            if (String(data.madeBy)!==String(padID) || !data.tcarsV5) { return; }
            found[id]=true;
            if (!parts[id]) {
                parts[id]=Entities.addEntity({type:'Model',name:NAME+' local body',parentID:id,
                    modelURL:'https://hifi-external.s3.amazonaws.com/tcars/models/cars/Bluesmobile.fbx',
                    localPosition:{x:0,y:0,z:0},dimensions:{x:2.017,y:1.409,z:5.602},
                    collisionless:true,dynamic:false},'local');
            }
        });
        Object.keys(parts).forEach(function(id){ if(!found[id]) { Entities.deleteEntity(parts[id]); delete parts[id]; } });
    }
    function rez(){ if(Date.now()-last<2000){return;} last=Date.now(); Entities.callEntityServerMethod(padID,'rez',[token]); }
    this.preload=function(id){
        padID=id; position=Entities.getEntityProperties(id,['position']).position;
        sign=Entities.addEntity({type:'Text',name:'TCARS V5 test sign',position:{x:position.x,y:position.y+3,z:position.z},
            dimensions:{x:5,y:1.5,z:0.01},text:'TCARS V5 TEST\nClick pad: spawn | Ctrl-click pad: remove yours\nClick car: enter | W/S A/D drive | Space brake | F exit',
            lineHeight:0.18,textColor:{red:62,green:232,blue:255},backgroundColor:{red:20,green:22,blue:28},
            backgroundAlpha:0.6,billboardMode:'yaw',unlit:true,collisionless:true},'local');
        scan(); timer=Script.setInterval(scan,1000);
    };
    this.clickDownOnEntity=function(id,event){
        if(event.isPrimaryButton){ if(event.isControl){Entities.callEntityServerMethod(padID,'remove',[token]);} else {rez();} }
    };
    this.startFarTrigger=rez; this.startNearTrigger=rez;
    this.unload=function(){
        if(timer){Script.clearInterval(timer);} Object.keys(parts).forEach(function(id){Entities.deleteEntity(parts[id]);});
        if(sign){Entities.deleteEntity(sign);}
    };
});
