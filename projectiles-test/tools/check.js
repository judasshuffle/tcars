'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
for(const name of ['launch-tcars.js',...fs.readdirSync(path.join(root,'darkride')).filter(x=>x.endsWith('.js')).map(x=>'darkride/'+x)]){
    new vm.Script(fs.readFileSync(path.join(root,name),'utf8'),{filename:name});
}
assert(!fs.existsSync(path.join(root,'blockly-tcars')),'Blockly must be removed');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/manifest.json'),'utf8'));
const crypto=require('node:crypto');let count=0;
for(const asset of Object.values(manifest.assets)){
    if(!asset.available){continue;}
    const bytes=fs.readFileSync(path.join(root,asset.path));assert.equal(bytes.length,asset.bytes,asset.path);
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.path);count++;
}
console.log('Runtime JS parses; Blockly absent; '+count+' cached assets match their SHA-256 manifests.');
