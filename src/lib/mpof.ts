import { sha256, u8ToHex, hexToU8 } from './kyber.js';

const EXP = new Uint8Array(256);
const LOG = new Uint8Array(256);
let poly = 1;
for (let i = 0; i < 255; i++) {
    EXP[i] = poly;
    LOG[poly] = i;
    const p2 = (poly << 1) ^ ((poly & 128) ? 0x11b : 0);
    poly = poly ^ p2;
}
EXP[255] = EXP[0];

function gfMul(a: number, b: number): number {
    return (a === 0 || b === 0) ? 0 : EXP[(LOG[a] + LOG[b]) % 255];
}

function gfDiv(a: number, b: number): number {
    if (b === 0) throw new Error("Divide by zero");
    return (a === 0) ? 0 : EXP[(LOG[a] + 255 - LOG[b]) % 255];
}

export interface Shard {
    shard_id: number;
    data: string; // hex
    auth_tag: string; // hex
    merkle_leaf: string; // hex
}

export class MultiPartyOutputFragmentation {
    private threshold: number;
    private total_shards: number;
    public merkle_root: string | null = null;

    constructor(threshold: number = 3, total_shards: number = 5) {
        this.threshold = threshold;
        this.total_shards = total_shards;
    }

    private getRandomBytes(length: number): Uint8Array {
        const arr = new Uint8Array(length);
        if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
            window.crypto.getRandomValues(arr);
        } else if (typeof globalThis !== 'undefined' && (globalThis as any).crypto && (globalThis as any).crypto.getRandomValues) {
            (globalThis as any).crypto.getRandomValues(arr);
        } else {
            for (let i = 0; i < length; i++) {
                arr[i] = Math.floor(Math.random() * 256);
            }
        }
        return arr;
    }

    private padToBlock(data: Uint8Array, blockSize: number): Uint8Array {
        const paddingLen = blockSize - (data.length % blockSize);
        const result = new Uint8Array(data.length + paddingLen);
        result.set(data, 0);
        
        // PKCS#7 padding
        for (let i = data.length; i < result.length; i++) {
            result[i] = paddingLen;
        }
        return result;
    }

    private removePadding(data: Uint8Array): Uint8Array {
        if (data.length === 0) return data;
        const paddingLen = data[data.length - 1];
        if (paddingLen < 1 || paddingLen > data.length) return data;
        return data.slice(0, data.length - paddingLen);
    }

    private evaluatePolynomial(coeffs: Uint8Array[], x: number, byteIndex: number): number {
        let result = 0;
        let x_power = 1;
        for (let i = 0; i < coeffs.length; i++) {
            result ^= gfMul(coeffs[i][byteIndex], x_power);
            x_power = gfMul(x_power, x);
        }
        return result;
    }

    public fragmentOutput(aiResponse: string): Shard[] {
        const responseBytes = new TextEncoder().encode(aiResponse);
        const blockSize = 128; // block size can be arbitrary since we evaluate byte-by-byte
        const paddedResponse = this.padToBlock(responseBytes, blockSize);
        const len = paddedResponse.length;

        // Generate polynomial coefficients
        const coefficients: Uint8Array[] = [];
        coefficients.push(paddedResponse); // Secret is constant term
        for (let i = 1; i < this.threshold; i++) {
            coefficients.push(this.getRandomBytes(len));
        }

        const shards: Shard[] = [];
        const merkleNodes: string[] = [];

        for (let shard_id = 1; shard_id <= this.total_shards; shard_id++) {
            const shardData = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                shardData[i] = this.evaluatePolynomial(coefficients, shard_id, i);
            }

            // auth tag
            const idBytes = new Uint8Array([shard_id]);
            const toHash = new Uint8Array(shardData.length + 1);
            toHash.set(shardData, 0);
            toHash.set(idBytes, shardData.length);
            const authTag = u8ToHex(sha256(toHash));

            const merkleLeaf = u8ToHex(sha256(toHash)); // simplified merkle leaf
            
            shards.push({
                shard_id: shard_id,
                data: u8ToHex(shardData),
                auth_tag: authTag,
                merkle_leaf: merkleLeaf
            });
            merkleNodes.push(merkleLeaf);
        }

        // compute merkle root (simplified, just hash all leaves together)
        this.merkle_root = u8ToHex(sha256(new TextEncoder().encode(merkleNodes.join(''))));

        return shards;
    }

    /**
     * Alias for fragmentOutput for compatibility across callers
     */
    public fragmentResponse(aiResponse: string): Shard[] {
        return this.fragmentOutput(aiResponse);
    }

    public reconstructFromShards(shards: Shard[], expectedMerkleRoot: string | null = null): string {
        if (!shards || shards.length < this.threshold) {
            throw new Error(`Need ${this.threshold} shards, got ${shards ? shards.length : 0}`);
        }

        // Use first 'threshold' shards
        const useShards = shards.slice(0, this.threshold);
        
        // Lagrange interpolation
        const len = useShards[0].data.length / 2;
        const result = new Uint8Array(len);
        
        const xs = useShards.map(s => s.shard_id);
        const ys = useShards.map(s => hexToU8(s.data));

        for (let byteIdx = 0; byteIdx < len; byteIdx++) {
            let byteResult = 0;
            for (let i = 0; i < this.threshold; i++) {
                let weight = 1;
                for (let j = 0; j < this.threshold; j++) {
                    if (i !== j) {
                        weight = gfMul(weight, gfDiv(xs[j], xs[j] ^ xs[i]));
                    }
                }
                byteResult ^= gfMul(ys[i][byteIdx], weight);
            }
            result[byteIdx] = byteResult;
        }

        const unpadded = this.removePadding(result);
        return new TextDecoder().decode(unpadded);
    }
}
