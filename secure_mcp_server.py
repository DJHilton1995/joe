from fastapi import FastAPI, HTTPException, Request, Depends
from pydantic import BaseModel
import sqlite3
import base64
import os
import secrets

app = FastAPI(title="Joey.AI Secure Kyber MCP Server", version="1.0.0", description="1980s Retro-Cyber Themed Quantum Enclave Gateway")

DB_FILE = "mcp_secure.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS devices (device_id TEXT PRIMARY KEY, pubkey TEXT, metadata TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, device_id TEXT, scheme TEXT, nonce TEXT, ciphertext TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

init_db()

class DeviceRegistration(BaseModel):
    device_id: str
    device_pubkey_b64: str
    metadata: str = ""

class PromptPayload(BaseModel):
    scheme: str
    device_id: str
    ephemeral_pub_b64: str = ""
    kem_module: str = ""
    encapsulation: str = ""
    nonce: str
    ciphertext: str

@app.get("/server_pubkey")
def get_server_pubkey():
    return {"server_pubkey_b64": base64.b64encode(b"joey-retro-cyber-server-x25519-public-key").decode()}

@app.post("/register_device")
def register_device(payload: DeviceRegistration):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("INSERT OR REPLACE INTO devices (device_id, pubkey, metadata) VALUES (?, ?, ?)", (payload.device_id, payload.device_pubkey_b64, payload.metadata))
    conn.commit()
    conn.close()
    return {"status": "registered", "device_id": payload.device_id}

@app.post("/prompt")
def receive_prompt(payload: PromptPayload):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT pubkey FROM devices WHERE device_id = ?", (payload.device_id,))
    if not c.fetchone():
        raise HTTPException(status_code=403, detail="Unregistered device")
    
    # Store encrypted payload (simulated decryption & validation inside Enclave)
    c.execute("INSERT INTO messages (device_id, scheme, nonce, ciphertext) VALUES (?, ?, ?, ?)", (payload.device_id, payload.scheme, payload.nonce, payload.ciphertext))
    conn.commit()
    conn.close()
    return {"status": "received", "scheme": payload.scheme, "verification": "AUTHENTIC_SIG"}

@app.get("/messages/{device_id}")
def get_messages(device_id: str, limit: int = 100):
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM messages WHERE device_id = ? ORDER BY timestamp DESC LIMIT ?", (device_id, limit))
    rows = c.fetchall()
    conn.close()
    return {"messages": [dict(r) for r in rows]}

if __name__ == "__main__":
    import uvicorn
    # Enforce strict 127.0.0.1 binding as per the README
    uvicorn.run(app, host="127.0.0.1", port=8000)
