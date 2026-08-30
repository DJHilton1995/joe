import crypto from 'crypto';

/**
 * Interface for providing encryption keys.
 * Allows swapping in a hardware/HSM or environment-backed key provider later.
 */
export interface KeyProvider {
  currentKey(): Buffer;
  getKeyVersion?(): string;
}

/**
 * Custom Exception for secure variable operations.
 */
export class SecureVariableException extends Error {
  constructor(message: string, public override readonly cause?: any) {
    super(message);
    this.name = 'SecureVariableException';
  }
}

/**
 * A secure in-memory variable wrapper that stores data only in encrypted form.
 * Decrypts to a short-lived plaintext buffer upon access and immediately zeroizes it.
 */
export class SecureVariable<T> {
  private static readonly TRANSFORMATION = 'aes-256-gcm';
  private static readonly IV_LEN_BYTES = 12;      // 96-bit IV is optimal for GCM
  private static readonly TAG_LEN_BYTES = 16;     // 128-bit authentication tag
  private static readonly MAX_SERIALIZED_SIZE = 10 * 1024 * 1024; // 10MB limit to prevent DoS

  private readonly keyProvider: KeyProvider;
  private readonly contextBinding: Buffer; // For transcript/context binding
  private encryptedBlob: Buffer | null = null;

  /**
   * Constructor.
   * @param keyProvider Source for the AES key.
   * @param context A unique context string/Buffer to bind data to (prevents copy/paste replay).
   */
  constructor(keyProvider: KeyProvider, context: Buffer | string | null) {
    this.keyProvider = keyProvider;
    if (context) {
      this.contextBinding = Buffer.isBuffer(context) ? Buffer.from(context) : Buffer.from(context, 'utf8');
    } else {
      this.contextBinding = Buffer.alloc(0);
    }
  }

  /**
   * Stores a value securely.
   * 1. Serializes to bytes.
   * 2. Encrypts with AES-GCM using a fresh IV and context binding.
   * 3. Stores only (IV || Ciphertext || Tag).
   * 4. Zeroizes the plaintext buffer immediately.
   */
  public set(value: T | null): void {
    if (value === null || value === undefined) {
      this.clear();
      return;
    }

    let pt: Buffer | null = null;
    try {
      pt = this.serialize(value);
      const key = this.keyProvider.currentKey();
      if (key.length !== 32) {
        throw new Error('Key must be exactly 256 bits (32 bytes) for AES-256.');
      }

      // Generate fresh IV
      const iv = crypto.randomBytes(SecureVariable.IV_LEN_BYTES);

      const cipher = crypto.createCipheriv(SecureVariable.TRANSFORMATION, key, iv);
      
      // Update with context binding data to ensure transcript binding (AAD)
      cipher.setAAD(this.contextBinding);

      const ct = Buffer.concat([cipher.update(pt), cipher.final()]);
      const tag = cipher.getAuthTag();

      // Construct blob: [IV (12)] + [Ciphertext] + [Tag (16)]
      const out = Buffer.concat([iv, ct, tag]);
      this.encryptedBlob = out;

    } catch (err: any) {
      throw new SecureVariableException('Encryption failed', err);
    } finally {
      // CRITICAL: Zeroize plaintext immediately
      if (pt) {
        pt.fill(0);
      }
    }
  }

  /**
   * Retrieves and decrypts the value.
   * 1. Fetches encrypted blob.
   * 2. Decrypts using current key and context.
   * 3. Deserializes.
   * 4. Returns object.
   * 5. Zeroizes the internal plaintext buffer used during deserialization.
   */
  public get(): T | null {
    const localBlob = this.encryptedBlob;
    if (!localBlob) return null;

    const minSize = SecureVariable.IV_LEN_BYTES + SecureVariable.TAG_LEN_BYTES;
    if (localBlob.length < minSize) {
      throw new SecureVariableException('Invalid encrypted blob size');
    }

    const iv = localBlob.subarray(0, SecureVariable.IV_LEN_BYTES);
    const tag = localBlob.subarray(localBlob.length - SecureVariable.TAG_LEN_BYTES);
    const ct = localBlob.subarray(SecureVariable.IV_LEN_BYTES, localBlob.length - SecureVariable.TAG_LEN_BYTES);

    const key = this.keyProvider.currentKey();
    let pt: Buffer | null = null;

    try {
      const decipher = crypto.createDecipheriv(SecureVariable.TRANSFORMATION, key, iv);
      decipher.setAAD(this.contextBinding);
      decipher.setAuthTag(tag);

      pt = Buffer.concat([decipher.update(ct), decipher.final()]);
      
      return this.deserialize(pt);

    } catch (err: any) {
      throw new SecureVariableException('Decryption/Integrity check failed: Data tampered or context mismatch', err);
    } finally {
      // CRITICAL: Zeroize the plaintext buffer used during decryption/deserialization
      if (pt) {
        pt.fill(0);
      }
    }
  }

  /**
   * Explicitly clears the stored value and zeroizes any residual references.
   */
  public clear(): void {
    if (this.encryptedBlob) {
      this.encryptedBlob.fill(0);
      this.encryptedBlob = null;
    }
  }

  // --- Serialization Helpers ---

  private serialize(obj: T): Buffer {
    const str = JSON.stringify(obj);
    const buf = Buffer.from(str, 'utf8');
    if (buf.length > SecureVariable.MAX_SERIALIZED_SIZE) {
      throw new Error('Serialized object exceeds maximum allowed size');
    }
    return buf;
  }

  private deserialize(data: Buffer): T {
    const str = data.toString('utf8');
    return JSON.parse(str);
  }
}
