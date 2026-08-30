/**
 * Joey Cryptographic Vault Module
 * Utilizes Web Crypto API (SubtleCrypto) for secure client-side zero-knowledge encryption.
 * Password/PIN-derived AES-GCM-256 keys safeguard metadata and files.
 */

// Helper to convert Uint8Array to Hex string
export function bufToHex(buf: Uint8Array): string {
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper to convert Hex string to Uint8Array
export function hexToBuf(hex: string): Uint8Array {
  const len = hex.length / 2;
  const buf = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buf[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return buf;
}

// Derive AES-GCM key from password/PIN using PBKDF2
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);
  
  // Import raw password as key material
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  // Derive 256-bit AES-GCM key
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt plaintext using AES-GCM with PBKDF2-derived key from password/PIN
export async function encryptPayload(plaintext: string, pin: string): Promise<{ ciphertextHex: string; ivHex: string; saltHex: string }> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const key = await deriveKey(pin, salt);
  const enc = new TextEncoder();
  const plaintextBuffer = enc.encode(plaintext);
  
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    plaintextBuffer
  );
  
  return {
    ciphertextHex: bufToHex(new Uint8Array(ciphertextBuffer)),
    ivHex: bufToHex(iv),
    saltHex: bufToHex(salt)
  };
}

// Decrypt ciphertext using AES-GCM with PBKDF2-derived key from password/PIN
export async function decryptPayload(ciphertextHex: string, ivHex: string, saltHex: string, pin: string): Promise<string> {
  const salt = hexToBuf(saltHex);
  const iv = hexToBuf(ivHex);
  const ciphertext = hexToBuf(ciphertextHex);
  
  const key = await deriveKey(pin, salt);
  
  const plaintextBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    ciphertext
  );
  
  const dec = new TextDecoder();
  return dec.decode(plaintextBuffer);
}

/**
 * Sanitizes the Title/Name of a Vault record to strip dangerous HTML tags and prevent XSS or styling breakages.
 */
export function sanitizeTitle(title: string): string {
  if (!title) return '';
  // Strip any HTML tags
  let clean = title.replace(/<\/?[^>]+(>|$)/g, "");
  // Remove control characters and limit length to 128
  clean = clean.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
  return clean.substring(0, 128).trim();
}

/**
 * Sanitizes decrypted content or input payloads based on their type to prevent XSS (such as javascript: URLs or script injection).
 */
export function sanitizeContent(content: string, type: 'text' | 'image' | 'reward'): string {
  if (!content) return '';

  if (type === 'image') {
    const trimmed = content.trim();
    // Allow only safe URLs: base64 encoded images with proper mime-types or secure web URLs (HTTP/HTTPS)
    const isDataImage = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/i.test(trimmed);
    const isHttpImage = /^https?:\/\//i.test(trimmed);

    if (isDataImage || isHttpImage) {
      return trimmed;
    }
    // Safe replacement SVG if the URL is dangerous (e.g. javascript:, data:text/html, etc.)
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="%231a0a1a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ff007f" font-family="monospace" font-size="8">BLOCKED_UNSAFE</text></svg>';
  }

  // Prevent memory exhaustion/crash by capping text at a massive enterprise-scale limit (500MB)
  const maxTextSize = 500 * 1024 * 1024;
  if (content.length > maxTextSize) {
    return content.substring(0, maxTextSize) + " [TRUNCATED - MAX SIZE EXCEEDED]";
  }

  return content;
}

