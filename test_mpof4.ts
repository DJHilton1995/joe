import { MultiPartyOutputFragmentation } from './src/lib/mpof.js';
const mpof = new MultiPartyOutputFragmentation(3, 5);
const shards = mpof.fragmentOutput("Hello World!");
const recon = mpof.reconstructFromShards(shards);
console.log(recon);
