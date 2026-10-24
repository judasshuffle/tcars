/* global EventBridge */
(function(){
    'use strict';var state=null,connected=false;
    function el(id){return document.getElementById(id);}
    function send(action){if(!connected){return;}EventBridge.emitWebEvent(JSON.stringify({channel:'tcars-darkride-v1',action:action,
        index:action==='build'?el('track').selectedIndex:el('vehicle').selectedIndex}));}
    function options(id,list){var select=el(id);if(select.options.length===list.length){return;}
        list.forEach(function(item){var option=document.createElement('option');option.textContent=item.name;select.appendChild(option);});}
    function time(n){return n===null?'—':n.toFixed(2)+' s';}
    function selection(){if(!state){return;}var t=state.tracks[el('track').selectedIndex];if(!t){return;}
        el('trackInfo').textContent=t.description+(t.available?'':' Unavailable: '+t.reason+'. Choose Practice circuit.');
        el('build').disabled=!state.ready||state.busy||state.seated||!t.available;}
    function receive(raw){var s;try{s=JSON.parse(raw);}catch(e){return;}if(s.channel!=='tcars-darkride-v1'||s.type!=='state'){return;}state=s;
        options('track',s.tracks);options('vehicle',s.vehicles);el('status').textContent=s.status;el('speed').textContent=s.speed;
        el('activeTrack').textContent=s.track;el('timing').textContent=s.next===null?'Free drive — no saved checkpoints':
            'Laps '+s.laps+' · Next gate '+s.next+' | Time '+time(s.elapsed)+' | Last '+time(s.last)+' | Best '+time(s.best);
        el('camera').textContent='Camera: '+s.camera;el('sound').textContent='Sound: '+(s.muted?'off':'on');
        el('spawn').disabled=!s.ready||s.busy;el('enter').disabled=!s.hasCar||s.seated||s.busy;el('exit').disabled=!s.seated;
        ['recover','start','removeCar'].forEach(function(id){el(id).disabled=!s.hasCar||s.busy;});
        ['resetTrack','removeTrack'].forEach(function(id){el(id).disabled=!s.hasTrack||s.busy;});
        el('cancel').disabled=!s.busy;selection();}
    document.querySelectorAll('button[data-action]').forEach(function(button){button.addEventListener('click',function(){send(button.getAttribute('data-action'));});});
    el('track').addEventListener('change',selection);
    // DarkRide injects EventBridge after the page loads; handshake retries avoid losing the first snapshot.
    var timer=setInterval(function(){if(typeof EventBridge!=='undefined' && EventBridge.scriptEventReceived){
        if(!connected){connected=true;EventBridge.scriptEventReceived.connect(receive);}send('ready');if(state){clearInterval(timer);}
    }},250);
}());
