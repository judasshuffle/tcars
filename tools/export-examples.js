'use strict';
const fs=require('node:fs'),path=require('node:path'),catalog=require('../darkride/catalog');
const out=path.resolve(__dirname,'../examples');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'roadster.json'),JSON.stringify(catalog.vehicle('TCARS Roadster (offline)',1.8,0.8,4),null,2)+'\n');
fs.writeFileSync(path.join(out,'practice-track.json'),JSON.stringify(catalog.practice(),null,2)+'\n');
console.log('Exported the actual runtime example configurations to examples/.');
