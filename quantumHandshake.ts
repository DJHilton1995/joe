import { Kyber768, hexToU8, u8ToHex } from './src/lib/kyber.js';
import { QuantumSealedPromptEnvelope } from './src/lib/promptSecurity.js';

export interface QuantumSessionState {
  tokenId: string;
  serverKyberPubKey: string; // The public key JSON string
  sharedSecret: string; // Hex representation
  sessionSeed: string;
  beaconValue: string;
  expiryTimestamp: number;
}

class QuantumClientHandshake {
  private state: QuantumSessionState | null = null;

  public async initializeHandshake(): Promise<QuantumSessionState> {
    // 1. Request fresh ephemeral quantum token and server Kyber public key
    const tokenRes = await fetch('/api/quantum/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (!tokenRes.ok) {
      throw new Error(`Token initialization rejected: HTTP ${tokenRes.status}`);
    }

    const tokenData = await tokenRes.json();
    const serverPubKey = tokenData.kyberPublicKey; // JSON string

    // 2. Encapsulate against the server's Kyber public key to generate sharedSecret & KEM ciphertext
    const { ciphertext, sharedSecret } = Kyber768.encapsulate(serverPubKey);

    this.state = {
      tokenId: tokenData.tokenId,
      serverKyberPubKey: serverPubKey,
      sharedSecret: sharedSecret,
      sessionSeed: tokenData.sessionSeed,
      beaconValue: tokenData.beaconValue,
      expiryTimestamp: Date.now() + 5 * 60 * 1000 // 5-minute local TTL
    };

    return this.state;
  }

  public async sealPromptEnvelope(prompt: string, metadata: Record<string, any> = {}): Promise<{
    kemCiphertext: string;
    ciphertext: string;
    nonce: string;
    expiryTimestamp: number;
    metadata?: string;
  }> {
    if (!this.state || Date.now() >= this.state.expiryTimestamp) {
      await this.initializeHandshake();
    }

    if (!this.state) {
      throw new Error('Quantum state could not be verified.');
    }

    // Generate fresh KEM encapsulation for this specific message envelope
    const { ciphertext: kemCiphertext, sharedSecret } = Kyber768.encapsulate(this.state.serverKyberPubKey);
    const sharedSecretHex = sharedSecret;

    const envelopeProcessor = new QuantumSealedPromptEnvelope('', 'client-side');
    const promptBytes = new TextEncoder().encode(prompt);
    
    // Derive keystream
    const oneTimePad = await envelopeProcessor.deriveOneTimePad(sharedSecretHex, promptBytes.length);
    const encryptedPromptHex = QuantumSealedPromptEnvelope.xorEncrypt(prompt, oneTimePad);

    const nonce = crypto.randomUUID().replace(/-/g, '');
    const expiryTimestamp = Date.now() + 5 * 60 * 1000;

    // Encrypt metadata if provided
    let encryptedMetadataHex: string | undefined = undefined;
    if (Object.keys(metadata).length > 0) {
      const metaBytes = new TextEncoder().encode(JSON.stringify(metadata));
      const metaPad = await envelopeProcessor.deriveOneTimePad(
        sharedSecretHex,
        metaBytes.length,
        'QuantumSealedPromptEnvelope-Metadata-OTP'
      );
      const encryptedMeta = new Uint8Array(metaBytes.length);
      for (let i = 0; i < metaBytes.length; i++) {
        encryptedMeta[i] = metaBytes[i] ^ metaPad[i];
      }
      encryptedMetadataHex = u8ToHex(encryptedMeta);
    }

    return {
      kemCiphertext: kemCiphertext,
      ciphertext: encryptedPromptHex,
      nonce,
      expiryTimestamp,
      metadata: encryptedMetadataHex
    };
  }

  public getActiveTokenId(): string | null {
    return this.state?.tokenId || null;
  }

  public resetLocalEntropy(): void {
    this.state = null;
  }
}

export const quantumHandshake = new QuantumClientHandshake();