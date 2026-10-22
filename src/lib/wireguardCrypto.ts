/**
 * Established WireGuard Cryptography Suite
 * Built upon Curve25519 (X25519 ECDH), ChaCha20-Poly1305 AEAD, and BLAKE2s / SHA-256.
 * Replaces customized/pseudo-cryptography with audited, established WireGuard primitives.
 */

import { x25519 } from '@noble/curves/ed25519.js';
import { chacha20poly1305 } from '@noble/ciphers/chacha.js';
import * as wgKeygen from 'wireguard-keygen';
import { sha256, hmacSha256 } from './kyber.js';

export { sha256, hmacSha256 };

export interface WireguardKeyPair {
  privateKey: string; // 44-character standard WireGuard base64 string
  publicKey: string;  // 44-character standard WireGuard base64 string
}

export interface WireguardEnvelope {
  ciphertext: string;       // Hex encoded ChaCha20-Poly1305 ciphertext
  nonce: string;            // 12-byte hex nonce
  senderPublicKey: string;  // Ephemeral WireGuard base64 public key
  commitment: string;       // Integrity commitment
  metadata?: string;        // Hex encoded encrypted metadata
  expiryTimestamp: number;  // TTL timestamp
  kemCiphertext?: string;   // WireGuard sender public key payload alias
}

export interface ServerReceiptProof {
  status: string;
  nonce: string;
  attestation: string;
}

// -------------------------------------------------------------
// Buffer & Encoding Utilities
// -------------------------------------------------------------

export function u8ToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export function hexToU8(hex: string): Uint8Array {
  const clean = hex.length % 2 !== 0 ? '0' + hex : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function u8ToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToU8(b64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(b64, 'base64'));
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function getRandomBytes(len: number): Uint8Array {
  const arr = new Uint8Array(len);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(arr);
  } else if (typeof globalThis !== 'undefined' && (globalThis as any).crypto && (globalThis as any).crypto.getRandomValues) {
    (globalThis as any).crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < len; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }
  return arr;
}

// -------------------------------------------------------------
// Core WireGuard Key Operations
// -------------------------------------------------------------

/**
 * Generate standard WireGuard Curve25519 keypair formatted in base64
 */
export function generateWireguardKeyPair(): WireguardKeyPair {
  try {
    if (wgKeygen && typeof (wgKeygen as any).generateWireguardKeyPair === 'function') {
      return (wgKeygen as any).generateWireguardKeyPair();
    }
  } catch (e) {
    // fallback to noble x25519
  }
  
  const privU8 = x25519.utils.randomSecretKey();
  const pubU8 = x25519.getPublicKey(privU8);
  return {
    privateKey: u8ToBase64(privU8),
    publicKey: u8ToBase64(pubU8)
  };
}

/**
 * Derives the WireGuard public key from a base64 private key
 */
export function deriveWireguardPublicKey(privateKeyBase64: string): string {
  try {
    if (wgKeygen && typeof (wgKeygen as any).derivePublicKey === 'function') {
      return (wgKeygen as any).derivePublicKey(privateKeyBase64);
    }
  } catch (e) {}

  const privU8 = base64ToU8(privateKeyBase64);
  const pubU8 = x25519.getPublicKey(privU8);
  return u8ToBase64(pubU8);
}

/**
 * Computes WireGuard Curve25519 (X25519) Diffie-Hellman Shared Secret
 */
export function computeWireguardSharedSecret(privateKeyBase64: string, peerPublicKeyBase64: string): Uint8Array {
  const privU8 = base64ToU8(privateKeyBase64);
  const peerPubU8 = base64ToU8(peerPublicKeyBase64);
  return x25519.getSharedSecret(privU8, peerPubU8);
}

export function computeWireguardSharedSecretHex(privateKeyBase64: string, peerPublicKeyBase64: string): string {
  const shared = computeWireguardSharedSecret(privateKeyBase64, peerPublicKeyBase64);
  return u8ToHex(shared);
}

// -------------------------------------------------------------
// ChaCha20-Poly1305 AEAD Symmetric Cryptography
// -------------------------------------------------------------

/**
 * Standard WireGuard Authenticated Encryption with Associated Data (ChaCha20-Poly1305)
 */
export function encryptWireguardPayload(
  plaintext: string | Uint8Array,
  sharedSecret: Uint8Array | string,
  nonce?: Uint8Array,
  additionalData?: Uint8Array
): { ciphertextHex: string; nonceHex: string } {
  const keyU8 = typeof sharedSecret === 'string' 
    ? (sharedSecret.length === 64 ? hexToU8(sharedSecret) : base64ToU8(sharedSecret))
    : sharedSecret;

  const key32 = keyU8.length === 32 ? keyU8 : sha256(keyU8);
  const nonce12 = nonce || getRandomBytes(12);

  const cipher = chacha20poly1305(key32, nonce12, additionalData);
  const dataU8 = typeof plaintext === 'string' ? new TextEncoder().encode(plaintext) : plaintext;
  const encrypted = cipher.encrypt(dataU8);

  return {
    ciphertextHex: u8ToHex(encrypted),
    nonceHex: u8ToHex(nonce12)
  };
}

/**
 * Standard WireGuard Authenticated Decryption with Associated Data (ChaCha20-Poly1305)
 */
export function decryptWireguardPayload(
  ciphertextHex: string,
  nonceHex: string,
  sharedSecret: Uint8Array | string,
  additionalData?: Uint8Array
): string {
  const keyU8 = typeof sharedSecret === 'string'
    ? (sharedSecret.length === 64 ? hexToU8(sharedSecret) : base64ToU8(sharedSecret))
    : sharedSecret;

  const key32 = keyU8.length === 32 ? keyU8 : sha256(keyU8);
  const nonce12 = hexToU8(nonceHex);
  const cipherBytes = hexToU8(ciphertextHex);

  const cipher = chacha20poly1305(key32, nonce12, additionalData);
  const decrypted = cipher.decrypt(cipherBytes);
  return new TextDecoder().decode(decrypted);
}

// -------------------------------------------------------------
// WireGuard Sealed Prompt Envelope
// -------------------------------------------------------------

export class WireguardSealedPromptEnvelope {
  private lastNonce: string = '';
  private lastSharedSecret: string = '';

  constructor(
    private recipientPublicKey: string,
    private clientSigningKey?: CryptoKey | string
  ) {}

  public async seal(prompt: string, metadata: object = {}): Promise<WireguardEnvelope> {
    // 1. Generate ephemeral WireGuard client keypair (Forward Secrecy)
    const ephemeralKeypair = generateWireguardKeyPair();
    
    // 2. Compute 32-byte shared secret via X25519
    const sharedSecret = computeWireguardSharedSecret(ephemeralKeypair.privateKey, this.recipientPublicKey);
    const sharedSecretHex = u8ToHex(sharedSecret);
    this.lastSharedSecret = sharedSecretHex;

    // 3. Encrypt prompt with ChaCha20-Poly1305 AEAD
    const nonce12 = getRandomBytes(12);
    const nonceHex = u8ToHex(nonce12);
    this.lastNonce = nonceHex;

    const { ciphertextHex } = encryptWireguardPayload(prompt, sharedSecret, nonce12);

    // 4. Encrypt metadata with unique subkey
    const metaBytes = new TextEncoder().encode(JSON.stringify(metadata));
    const metaNonce = getRandomBytes(12);
    const metaSubKey = sha256(new Uint8Array([...sharedSecret, ...new TextEncoder().encode("WG_METADATA_SUBKEY")]));
    const metaCipher = chacha20poly1305(metaSubKey, metaNonce).encrypt(metaBytes);
    const metadataPayload = u8ToHex(metaNonce) + ':' + u8ToHex(metaCipher);

    // 5. Create integrity commitment (SHA-256 HMAC)
    const promptHash = u8ToHex(sha256(new TextEncoder().encode(prompt)));
    const commitmentBytes = hmacSha256(sharedSecret, new TextEncoder().encode(promptHash + ':' + nonceHex));
    const commitment = u8ToHex(commitmentBytes);

    return {
      ciphertext: ciphertextHex,
      nonce: nonceHex,
      senderPublicKey: ephemeralKeypair.publicKey,
      commitment,
      metadata: metadataPayload,
      expiryTimestamp: Date.now() + (5 * 60 * 1000), // 5-minute TTL
      kemCiphertext: ephemeralKeypair.publicKey // backwards compatibility mapping
    };
  }

  public static unseal(envelope: WireguardEnvelope, recipientPrivateKey: string): string {
    const senderPubKey = envelope.senderPublicKey || envelope.kemCiphertext;
    if (!senderPubKey) {
      throw new Error("Missing sender WireGuard public key in envelope.");
    }
    const sharedSecret = computeWireguardSharedSecret(recipientPrivateKey, senderPubKey);
    return decryptWireguardPayload(envelope.ciphertext, envelope.nonce, sharedSecret);
  }

  public static unsealMetadata(metadataPayload: string, sharedSecret: Uint8Array | string): any {
    const [nonceHex, cipherHex] = metadataPayload.split(':');
    if (!nonceHex || !cipherHex) return null;
    const secU8 = typeof sharedSecret === 'string' ? hexToU8(sharedSecret) : sharedSecret;
    const metaSubKey = sha256(new Uint8Array([...secU8, ...new TextEncoder().encode("WG_METADATA_SUBKEY")]));
    const decrypted = chacha20poly1305(metaSubKey, hexToU8(nonceHex)).decrypt(hexToU8(cipherHex));
    return JSON.parse(new TextDecoder().decode(decrypted));
  }

  public async verifyReceipt(serverProof: ServerReceiptProof): Promise<boolean> {
    if (!serverProof || !serverProof.attestation) return false;
    const expectedAttestation = u8ToHex(sha256(new TextEncoder().encode(serverProof.nonce + ":" + this.lastSharedSecret)));
    return serverProof.attestation === expectedAttestation;
  }
}

/**
 * Drop-in Wireguard KEM compatibility layer mapping old Kyber768 API calls to real WireGuard Curve25519
 */
export class WireguardKEM {
  static keygen(): { publicKey: string; privateKey: string } {
    return generateWireguardKeyPair();
  }

  static encapsulate(recipientPublicKey: string): { ciphertext: string; sharedSecret: string } {
    const ephemeral = generateWireguardKeyPair();
    const sharedSecret = computeWireguardSharedSecret(ephemeral.privateKey, recipientPublicKey);
    return {
      ciphertext: ephemeral.publicKey, // in WireGuard, sending the ephemeral public key achieves KEM
      sharedSecret: u8ToHex(sharedSecret)
    };
  }

  static decapsulate(ephemeralPublicKey: string, recipientPrivateKey: string): string {
    const sharedSecret = computeWireguardSharedSecret(recipientPrivateKey, ephemeralPublicKey);
    return u8ToHex(sharedSecret);
  }
}
