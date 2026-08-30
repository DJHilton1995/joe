import { hexToU8, u8ToHex } from './src/lib/kyber.js';
const EXP = new Uint8Array(256);
const LOG = new Uint8Array(256);
let poly = 1;
for (let i = 0; i < 255; i++) {
    EXP[i] = poly;
    LOG[poly] = i;
    poly = (poly << 1) ^ ((poly & 128) ? 0x11b : 0);
}
EXP[255] = EXP[0];
console.log(EXP[0], LOG[1], EXP[1], LOG[EXP[1]]);
