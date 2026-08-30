# vault.py
import sqlite3
import os
import io
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import hmac
import hashlib

class PhantomVault:
    def __init__(self):
        self.hw_sig_path = "/app/hw_sig"
        self.blob_path = "/app/secure_data/eidetic_memory.enc"
        
    def _get_hardware_key(self) -> bytes:
        """Dérive une clé AES basée sur la carte mère physique."""
        if not os.path.exists(self.hw_sig_path):
            raise Exception("[FATAL] Matériel non reconnu.")
        with open(self.hw_sig_path, 'r') as f:
            hw_id = f.read().strip()
        # Dérivation de clé avec un poivre (pepper) statique
        return hashlib.sha256((hw_id + "JOEY_PROJECT_PEPPER_991").encode()).digest()

    def boot_sequence(self):
        """Charge le SQLite directement en RAM."""
        key = self._get_hardware_key()
        aesgcm = AESGCM(key)
        
        with open(self.blob_path, 'rb') as f:
            data = f.read()
            
        nonce, ciphertext = data[:12], data[12:]
        try:
            # Déchiffrement AES-GCM (échouera si le fichier est corrompu/modifié)
            raw_sqlite_db = aesgcm.decrypt(nonce, ciphertext, None)
        except Exception:
            raise Exception("[FATAL] Intégrité compromise. Autodestruction de la séquence.")

        # Chargement de la base de données en Mémoire Vive Uniquement
        self.conn = sqlite3.connect(':memory:')
        self.conn.executescript(raw_sqlite_db.decode('utf-8'))
        print("[VAULT] Base de données chargée en RAM avec succès.")

    def secure_query(self, query: str, params: tuple = ()):
        cursor = self.conn.cursor()
        cursor.execute(query, params)
        return cursor.fetchall()
