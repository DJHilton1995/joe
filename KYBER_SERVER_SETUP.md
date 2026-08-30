# 🛡️ Joey.AI Secure MCP Server Setup & Architecture

## 📋 Table of Contents
1. [Installation & Prerequisites](#1-installation--prerequisites)
2. [Running the Enclave](#2-running-the-enclave)
3. [Cryptographic API Endpoints](#3-cryptographic-api-endpoints)
4. [Testing & Verification](#4-testing--verification)
5. [Key Management & Lifecycle](#5-key-management--lifecycle)
6. [Security Architecture Overview](#6-security-architecture-overview)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Installation & Prerequisites

### 📂 Step 1: Navigate to the Joey.AI Vault
```powershell
cd "C:\Users\DJ Hilton\Joey.AI-secure"
```

### 📦 Step 2: Install Core Dependencies
Ensure you are using an isolated Python virtual environment or the user scope:
```powershell
pip install --user -r requirements.txt
pip install --user httpx2
```

### 🔐 Step 3: Install Post-Quantum Cryptography (Optional but Recommended)
For post-quantum cryptography support (Kyber KEM), install the `pqcrypto` module:
```powershell
pip install --user pqcrypto
```

> **Note:** If `pqcrypto` is unavailable for your platform, you can utilize alternative Kyber implementations:
> - **liboqs-python**: `pip install --user liboqs`
> - **pykyber**: `pip install --user pykyber`

---

## 2. Running the Enclave

Initiate the secure Uvicorn server:
```powershell
python -m uvicorn secure_mcp_server:app --reload
```
> The secure MCP Server will spin up at **http://127.0.0.1:8000**

---

## 3. Cryptographic API Endpoints

### 🔑 1. Retrieve Server Public Key
**Endpoint**: `GET /server_pubkey`
**Returns**: The server's X25519 public key (base64-encoded).

### 🏷️ 2. Register New Device
**Endpoint**: `POST /register_device`
**Payload**:
```json
{
  "device_id": "my-device-01",
  "device_pubkey_b64": "<base64-encoded-public-key>",
  "metadata": "optional metadata"
}
```

### 🛡️ 3. Send Encrypted Prompt (X25519 Hybrid Fallback)
**Endpoint**: `POST /prompt`
**Payload**:
```json
{
  "scheme": "x25519-hybrid",
  "device_id": "my-device-01",
  "ephemeral_pub_b64": "<ephemeral-public-key>",
  "nonce": "<base64-nonce>",
  "ciphertext": "<base64-encrypted-payload>"
}
```

### ⚛️ 4. Send Encrypted Prompt (Post-Quantum Kyber)
**Endpoint**: `POST /prompt`
**Payload**:
```json
{
  "scheme": "kyber",
  "device_id": "my-device-01",
  "kem_module": "pqcrypto.kem.kyber768",
  "encapsulation": "<base64-kyber-ct>",
  "nonce": "<base64-nonce>",
  "ciphertext": "<base64-encrypted-payload>"
}
```

### 🗃️ 5. Retrieve Messages (Secure Fetch)
**Endpoint**: `GET /messages/{device_id}?limit=100`

---

## 4. Testing & Verification

Run the entire security test suite to ensure cryptographic integrity:
```powershell
pip install --user -r requirements-dev.txt
python -m pytest tests/ -v
```

---

## 5. Key Management & Lifecycle

To provision and register a new device to the server:
```powershell
python scripts/generate_and_register.py my-device-01 --keys-dir .\keys --register http://127.0.0.1:8000
```
> **Security Note**: Keys are generated locally and stored with restrictive `0o600` permissions. Only the public key is transmitted during registration.

---

## 6. Security Architecture Overview

Joey's MCP Server relies on defense-in-depth methodologies:

*   **X25519 ECDH**: Elliptic curve Diffie-Hellman for robust, standard symmetric key derivation.
*   **AES-256-GCM**: Authenticated encryption ensuring integrity. Any single flipped bit in transit will break the authentication tag and halt decryption immediately.
*   **Kyber (PQC)**: Post-quantum resistant Key Encapsulation Mechanism (active when pqcrypto is available) to shield against "harvest now, decrypt later" attacks.
*   **Hardware Key Support**: Architectural hooks ready for PKCS#11, TPMs, or YubiKey secure element integration.
*   **Secure Key Storage**: Filesystem-level isolation. Keys are stored with strict `0o600` permissions (owner read/write exclusively).
*   **SQL Injection Prevention**: Exclusive use of parameterized SQLite queries; strict avoidance of string concatenation.
*   **XSS Mitigation**: Mandatory HTML escaping for all stored plaintext inputs.

### Data Flow Process:
1.  **Client** generates an X25519 keypair and registers the public key with the Server.
2.  **Client** encrypts payloads employing either Kyber KEM (if available) or an Ephemeral X25519 + AES-256-GCM hybrid fallback.
3.  **Server** receives the cryptogram, decrypts it utilizing the resident keypair.
4.  **Server** cryptographically validates the authentication tag—instantly rejecting tampered or MitM altered payloads.
5.  **Server** sanitizes (HTML-escapes) the plaintext and safely logs it into the SQLite nexus bound to the `device_id`.
6.  **Client** fetches verified history via TLS/Encrypted channels.

---

## 7. Troubleshooting

*   **ImportError on `pqcrypto`**: Re-run `pip install --user pqcrypto`. If binary wheels fail for your platform architecture, the server will seamlessly default to the X25519 hybrid fallback mode.
*   **Port 8000 Already in Use**: Terminate the blocking process or instruct Uvicorn to bind elsewhere: `python -m uvicorn secure_mcp_server:app --port 8001`.
*   **Permission Denied on `keys/` directory**: Your OS is enforcing restrictive ACLs (which is good). To manually grant your user access (Windows): 
    ```powershell
    icacls keys /grant:r %username%:(F) /inheritance:e
    ```
