'use strict';
const test = require('node:test'), assert = require('node:assert/strict'), vm = require('node:vm'), fs = require('node:fs');
test('public entity starts one independent script and reopens existing menu', () => {
    const code = fs.readFileSync('public-launcher/entity.js', 'utf8');
    const values = {}, loads = [], pages = [], running = [];
    const context = {Date, print(){}, Settings:{getValue:(k,d)=>values[k] || d,setValue:(k,v)=>{values[k]=v;}},
        ScriptDiscoveryService:{getRunning:()=>running,loadScript:(url,user)=>loads.push({url,user})},
        Tablet:{getTablet:()=>({gotoWebScreen:url=>pages.push(url)})}};
    const create = () => {const fn=vm.runInNewContext(code,context); const entity={}; fn.call(entity); return entity;};
    const a=create(),b=create(); a.clickDownOnEntity(); b.clickDownOnEntity();
    assert.equal(loads.length,1); assert.equal(loads[0].user,false);
    running.push({url:loads[0].url}); b.clickDownOnEntity();
    assert.equal(loads.length,1); assert.equal(pages[0],loads[0].url.replace('launch-tcars.js','darkride/hud.html'));
    running.length=0; a.clickDownOnEntity(); assert.equal(loads.length,2);
});
