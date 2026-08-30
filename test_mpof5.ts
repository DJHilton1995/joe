import { MultiPartyOutputFragmentation } from './src/lib/mpof.js';
import fs from 'fs';
const dataStr = fs.readFileSync('test_shards.json', 'utf8');
const data = JSON.parse(dataStr);
const mpof = new MultiPartyOutputFragmentation(3, 5);
console.log(mpof.reconstructFromShards(data.mpofShards));
