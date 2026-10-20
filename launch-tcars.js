// TCARS DarkRide launcher. Run this one file from DarkRide's Running Scripts window.
// Apache-2.0. No legacy TCARS physics or assignment-client scripts are loaded.
(function () {
    'use strict';
    var root=Script.resolvePath('./'), session=null, tablet=null, button=null, overlay=null, shuttingDown=false;
    var page=Script.resolvePath('darkride/hud.html'), pageOpen=false, ready=false, requests=[];
    var C=Script.require('./darkride/core.js');
    var Catalog=Script.require('./darkride/catalog.js');
    var Session=Script.require('./darkride/session.js');
    var catalog=Catalog.make(Script.require('./modules/vehicles.js'),Script.require('./modules/tracks.js'));
    var manifest={assets:{}}, loadErrors=[];
    function log(text){print('[TCARS] '+text);}
    function send(){
        if(!session || !tablet){return;}
        var state=session.state();state.type='state';state.channel='tcars-darkride-v1';state.ready=ready;
        state.vehicles=catalog.vehicles.map(function(v){return {name:v.name,id:v.id};});
        state.tracks=catalog.tracks.map(function(t){
            var missing=[];
            if(t.data){t.data.entities.forEach(function(e){['modelURL','compoundShapeURL'].forEach(function(k){
                if(e[k]&&!session.asset(e[k])&&!C.assetException(e[k])&&missing.indexOf(e[k])<0){missing.push(e[k]);}
            });});}
            return {name:t.name,id:t.id,available:!!t.data&&!missing.length,description:t.description,
                missing:missing.length,reason:!t.data?'Track export could not be loaded.':missing.length+' missing assets'};
        });
        if(pageOpen){tablet.emitScriptEvent(JSON.stringify(state));}
        if(overlay){Overlays.editOverlay(overlay,{text:'TCARS   '+state.speed+' km/h'+(state.seated?'   F exit  |  R recover  |  T start':'   Open the TCARS tablet button'),visible:state.seated});}
    }
    function action(data){
        if(!data || data.channel!=='tcars-darkride-v1' || !session){return;}
        if(data.action==='ready'){send();return;}
        if(!ready){session.say('Loading catalog and assets...');return;}
        try{
            var index=Number(data.index);
            switch(data.action){
            case 'build':session.build(index);break;
            case 'spawn':session.spawn(index);break;
            case 'enter':session.enter();tablet.gotoHomeScreen();break;
            case 'exit':session.exit();break;
            case 'recover':session.reset(false);break;
            case 'start':session.reset(true);break;
            case 'resetTrack':session.race.reset();if(session.car){session.reset(true);}session.say('Track session reset.');break;
            case 'removeCar':session.removeCar();session.say('Your car removed.');break;
            case 'removeTrack':session.removeTrack();break;
            case 'cancel':session.cancelBuild();break;
            case 'camera':session.cameraMode=session.cameraMode==='chase'?'hood':'chase';session.cameraPosition=null;break;
            case 'sound':session.muted=!session.muted;session.stopSound();break;
            case 'close':tablet.gotoHomeScreen();break;
            case 'stop':Script.stop();break;
            case 'diagnostics':
                var stats=typeof Entities.getVehicleStats==='function'?Entities.getVehicleStats():{};
                session.say('Native controls: '+(typeof Entities.setVehicleControls==='function'?'available':'MISSING')+
                    '. Owned entities: '+Object.keys(session.owned).length+'. Physics: '+JSON.stringify(stats)+
                    (loadErrors.length?'. Load errors: '+loadErrors.join('; '):''));break;
            }
        }catch(error){session.say(error.message || String(error));}
        send();
    }
    function onWeb(message){try{action(typeof message==='string'?JSON.parse(message):message);}catch(error){log('Invalid HUD event: '+error);}}
    function toggle(){if(pageOpen){tablet.gotoHomeScreen();}else{tablet.gotoWebScreen(page);}}
    function screen(type,url){pageOpen=type==='Web' && String(url).split('?')[0]===page;button.editProperties({isActive:pageOpen});if(pageOpen){send();}}
    function key(event){
        if(!session || !session.seated || event.isAutoRepeat || event.isControl || event.isAlt || !event.text){return;}
        var k=event.text.toLowerCase();
        try{if(k==='f'){session.exit();}else if(k==='r'){session.reset(false);}else if(k==='t'){session.reset(true);}}
        catch(error){session.say(error.message);}
    }
    function update(dt){
        if(!session){return;}
        try{session.update(dt);}catch(error){session.exit();session.say('Runtime error; controls released: '+error.message);}
    }
    function cleanup(){
        if(shuttingDown){return;}shuttingDown=true;
        requests.forEach(function(r){r.abort();});
        if(session){session.cleanup();}
        Script.update.disconnect(update);Controller.keyPressEvent.disconnect(key);
        if(tablet){tablet.webEventReceived.disconnect(onWeb);tablet.screenChanged.disconnect(screen);
            if(pageOpen){tablet.gotoHomeScreen();}if(button){button.clicked.disconnect(toggle);tablet.removeButton(button);}}
        if(overlay){Overlays.deleteOverlay(overlay);}
    }
    function loadJSON(path,callback){
        var request=new XMLHttpRequest(),done=false,timer;
        requests.push(request);
        function finish(error,value){if(done){return;}done=true;Script.clearTimeout(timer);callback(error,value);}
        request.onreadystatechange=function(){
            if(request.readyState!==4 || shuttingDown){return;}
            try{
                if(request.status!==200 && request.status!==0){throw new Error('HTTP '+request.status);}
                finish(null,JSON.parse(request.responseText));
            }catch(e){finish(path+': '+e.message);}
        };
        timer=Script.setTimeout(function(){finish(path+': timed out');request.abort();},15000);
        request.open('GET',root+path,true);request.send();
    }
    try{
        tablet=Tablet.getTablet('com.highfidelity.interface.tablet.system');
        button=tablet.addButton({text:'TCARS',icon:Script.resolvePath('car-button.svg'),isActive:false});
        session=new Session({Entities:Entities,MyAvatar:MyAvatar,Camera:Camera,Controller:Controller,DriveKeys:DriveKeys,
            Quat:Quat,Uuid:Uuid,Script:Script,SoundCache:SoundCache,Audio:Audio,print:print},catalog,manifest,root,send);
        button.clicked.connect(toggle);tablet.webEventReceived.connect(onWeb);tablet.screenChanged.connect(screen);
        Controller.keyPressEvent.connect(key);Script.update.connect(update);Script.scriptEnding.connect(cleanup);
        if(typeof Overlays!=='undefined'){
            overlay=Overlays.addOverlay('text',{x:20,y:20,width:650,height:42,text:'TCARS',font:{size:16},
                color:{red:245,green:245,blue:245},backgroundColor:{red:20,green:24,blue:32},backgroundAlpha:0.85,visible:false});
        }
        tablet.gotoWebScreen(page);session.say('Loading track exports and asset manifest...');
        var remaining=6;
        function loaded(){if(--remaining===0){ready=true;
            try{session.checkAPI();session.say('Ready. Build Practice circuit for an offline first drive.');}
            catch(error){session.say(error.message);}send();}}
        loadJSON('assets/manifest.json',function(error,data){
            if(error){loadErrors.push(error);}else{manifest.assets=data.assets || {};}
            loaded();
        });
        catalog.tracks.forEach(function(track){if(!track.file){return;}
            loadJSON('trackzones/'+track.file,function(error,data){if(error){loadErrors.push(error);}else{track.data=data;}loaded();});
        });
    }catch(error){log('Launcher failed: '+error.message);cleanup();Window.alert('TCARS: '+error.message);Script.stop();}
}());
