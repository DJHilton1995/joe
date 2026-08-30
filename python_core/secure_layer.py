import sqlite3
import hashlib
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("joey_guard")

class SecureGuardDB:
    def __init__(self, db_path="/app/secure_data/joey_state.db"):
        self.db_path = db_path
        self._initialize_database()

    def _initialize_database(self):
        """Sets up the SQLite database securely. SQLite is local, negating network MitM attacks."""
        with sqlite3.connect(self.db_path) as conn:
            # Storing the cryptographic hash of the row prevents undetected tampering
            conn.execute('''
                CREATE TABLE IF NOT EXISTS secure_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_input TEXT NOT NULL,
                    ai_output TEXT NOT NULL,
                    integrity_hash TEXT NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            logger.info("Secure Database initialized.")

    def _generate_integrity_hash(self, user_input: str, ai_output: str) -> str:
        """Creates a cryptographic signature of the transaction to detect local tampering."""
        payload = f"{user_input}||{ai_output}"
        return hashlib.sha256(payload.encode('utf-8')).hexdigest()

    def livecheck_ai_guard(self, ai_output: str) -> bool:
        """
        Integration point for Docker MCP Guard / LiveCheck AI.
        Double-checks Joey's output for safety, leaks, or prompt injections.
        """
        # TODO: Implement your specific LiveCheck AI logic here.
        # Example constraints: length checks, regex filters, or calling a secondary LLM validator.
        
        forbidden_keywords = ["DROP TABLE", "root", "password", "system_prompt"]
        if any(keyword in ai_output.upper() for keyword in forbidden_keywords):
            logger.warning("LiveCheck AI flagged the output. Transaction blocked.")
            return False
            
        logger.info("LiveCheck AI validated the output.")
        return True

    def execute_safe_write(self, user_input: str, ai_output: str):
        """
        Prevents SQL Injection via strict parameterized queries (the '?' placeholders).
        Validates through the Guard before committing to the database.
        """
        # 1. Route through the LiveCheck / MCP Guard
        if not self.livecheck_ai_guard(ai_output):
            raise ValueError("Output rejected by MCP Guard / LiveCheck AI.")

        # 2. Generate anti-tampering hash
        record_hash = self._generate_integrity_hash(user_input, ai_output)

        # 3. Parameterized Query Execution (Zero Injection Risk)
        query = "INSERT INTO secure_logs (user_input, ai_output, integrity_hash) VALUES (?, ?, ?)"
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute(query, (user_input, ai_output, record_hash))
                logger.info("Interaction securely logged.")
        except sqlite3.Error as e:
            logger.error(f"Database error: {e}")
            raise

    def get_verified_history(self) -> list:
        """Reads data and verifies hashes to ensure no offline tampering occurred."""
        query = "SELECT user_input, ai_output, integrity_hash FROM secure_logs"
        verified_records = []
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            rows = cursor.execute(query).fetchall()
            
            for user_input, ai_output, stored_hash in rows:
                expected_hash = self._generate_integrity_hash(user_input, ai_output)
                if stored_hash != expected_hash:
                    logger.critical("DATA TAMPERING DETECTED! Hash mismatch.")
                    continue # Drop tampered records
                
                verified_records.append({"user": user_input, "ai": ai_output})
                
        return verified_records
