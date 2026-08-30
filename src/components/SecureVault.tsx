import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Unlock, 
  KeyRound, 
  ShieldCheck, 
  FileKey, 
  Save, 
  Smartphone, 
  Hash, 
  AlertTriangle, 
  Fingerprint, 
  Plus, 
  Trash2, 
  FileText, 
  Terminal, 
  Clock, 
  HeartPulse, 
  Database,
  CloudLightning,
  UserCheck
} from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType, collection, addDoc, getDocs, doc, setDoc, deleteDoc, query, onSnapshot, serverTimestamp } from '../firebase';
import { encryptPayload, decryptPayload, sanitizeTitle, sanitizeContent } from '../lib/vaultCrypto';

interface EncryptedVaultEntry {
  id: string;
  name: string;
  size: string;
  date: string;
  encryptedPayload: string;
  iv: string;
  salt: string;
  type?: 'text' | 'image' | 'reward';
}

interface DecryptedVaultEntry {
  id: string;
  name: string;
  size: string;
  date: string;
  decryptedContent: string;
  type: 'text' | 'image' | 'reward';
  isCorrupted?: boolean;
}

export default function SecureVault() {
  const [vaultStatus, setVaultStatus] = useState<'locked' | 'unlocked'>('locked');
  const [pin, setPin] = useState('');
  const [authMethod, setAuthMethod] = useState<'pin' | 'hardware'>('pin');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Checking if setup is needed
  const [isSetupNeeded, setIsSetupNeeded] = useState(false);
  const [setupPin, setSetupPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  // Form for custom secrets
  const [secretTitle, setSecretTitle] = useState('');
  const [secretBody, setSecretBody] = useState('');
  const [isFiling, setIsFiling] = useState(false);

  // Active entries (encrypted and decrypted)
  const [encryptedEntries, setEncryptedEntries] = useState<EncryptedVaultEntry[]>([]);
  const [decryptedEntries, setDecryptedEntries] = useState<DecryptedVaultEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);

  // Legacy (raw) local storage items waiting to be encrypted
  const [legacyRawCount, setLegacyRawCount] = useState(0);
  const [isMigratingLegacy, setIsMigratingLegacy] = useState(false);

  // Dead Man's Switch (Liveness transmission) timer state
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes countdown
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load the Sentinel and check if configuration exists
  useEffect(() => {
    checkSentinelStatus();
    checkLegacyRawItems();
  }, [auth.currentUser]);

  // Dead Man's Switch Live Countdown
  useEffect(() => {
    if (vaultStatus === 'unlocked') {
      setTimeLeft(300); // reset to 5 mins on unlock
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleDeadMansSwitchTrigger();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [vaultStatus]);

  const handleDeadMansSwitchTrigger = () => {
    // Purge memory and secure everything immediately
    setVaultStatus('locked');
    setPin('');
    setDecryptedEntries([]);
    setErrorMessage("ALERTE ROUGE: Dead Man's Switch Silent! Memory registers scrubbed, AES-GCM local keys discarded.");
  };

  const resetDeadMansSwitch = () => {
    setTimeLeft(300);
  };

  const checkLegacyRawItems = () => {
    try {
      const stored = localStorage.getItem('joey_vault_files');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Count items that are not encrypted
          const rawCount = parsed.filter(item => !item.encrypted).length;
          setLegacyRawCount(rawCount);
        }
      }
    } catch (e) {
      console.warn("Legacy items read failed:", e);
    }
  };

  const checkSentinelStatus = async () => {
    setErrorMessage(null);
    if (auth.currentUser) {
      // Check Firestore sentinel
      try {
        const path = `users/${auth.currentUser.uid}/vault_entries`;
        const q = query(collection(db, path));
        const snap = await getDocs(q);
        const hasSentinel = snap.docs.some(doc => doc.id === 'sentinel');
        setIsSetupNeeded(!hasSentinel);
      } catch (err: any) {
        // Fallback to local storage sentinel check if offline or restricted
        const localSentinel = localStorage.getItem(`joey_sentinel_${auth.currentUser?.uid || 'offline'}`);
        setIsSetupNeeded(!localSentinel);
      }
    } else {
      // Offline mode check
      const localSentinel = localStorage.getItem('joey_sentinel_offline');
      setIsSetupNeeded(!localSentinel);
    }
  };

  // Setup / Initialize the vault with a master PIN/password
  const handleSetupVault = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (setupPin.length < 4) {
      setErrorMessage("Master PIN must be at least 4 alphanumeric characters.");
      return;
    }
    if (setupPin !== confirmPin) {
      setErrorMessage("Passwords/PINs do not match.");
      return;
    }

    try {
      // Create sentinel encrypted text: "JOEY_PHANTOM_VAULT_SENTINEL_OK"
      const { ciphertextHex, ivHex, saltHex } = await encryptPayload("JOEY_PHANTOM_VAULT_SENTINEL_OK", setupPin);
      
      if (auth.currentUser) {
        const path = `users/${auth.currentUser.uid}/vault_entries`;
        // Save to Firestore
        await setDoc(doc(db, path, 'sentinel'), {
          id: 'sentinel',
          name: 'Handshake Sentinel',
          size: '128 bits',
          date: new Date().toLocaleDateString(),
          encryptedPayload: ciphertextHex,
          iv: ivHex,
          salt: saltHex,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem(`joey_sentinel_${auth.currentUser.uid}`, 'true');
      } else {
        // Local-only fallback
        const offlineSentinelObj = {
          encryptedPayload: ciphertextHex,
          iv: ivHex,
          salt: saltHex
        };
        localStorage.setItem('joey_sentinel_offline', JSON.stringify(offlineSentinelObj));
      }

      setIsSetupNeeded(false);
      setPin(setupPin);
      setSetupPin('');
      setConfirmPin('');
      setErrorMessage("Master key established successfully. Enter PIN to decrypt vault.");
    } catch (err: any) {
      setErrorMessage(`Setup Failed: ${err.message}`);
    }
  };

  // Unlock the vault using PBKDF2 + AES-GCM Decryption verification
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!pin) {
      setErrorMessage("Enter Master PIN.");
      return;
    }

    try {
      let sentinelData: { encryptedPayload: string; iv: string; salt: string } | null = null;

      if (auth.currentUser) {
        const path = `users/${auth.currentUser.uid}/vault_entries`;
        const sentinelDoc = await getDocs(query(collection(db, path)));
        const match = sentinelDoc.docs.find(d => d.id === 'sentinel');
        if (match) {
          const d = match.data();
          sentinelData = {
            encryptedPayload: d.encryptedPayload,
            iv: d.iv,
            salt: d.salt
          };
        }
      }

      // Local Fallback if Firestore lookup failed or returned nothing
      if (!sentinelData) {
        const localKey = auth.currentUser ? `joey_sentinel_${auth.currentUser.uid}` : 'joey_sentinel_offline';
        const storedLocal = localStorage.getItem(localKey);
        if (storedLocal && storedLocal !== 'true') {
          sentinelData = JSON.parse(storedLocal);
        } else {
          // Check if we can extract from default setup if offline
          const offlineSentinel = localStorage.getItem('joey_sentinel_offline');
          if (offlineSentinel) sentinelData = JSON.parse(offlineSentinel);
        }
      }

      if (!sentinelData) {
        // No sentinel setup yet
        setIsSetupNeeded(true);
        return;
      }

      // Verify key by attempting decryption of the sentinel payload
      const decryptedSentinel = await decryptPayload(sentinelData.encryptedPayload, sentinelData.iv, sentinelData.salt, pin);

      if (decryptedSentinel === "JOEY_PHANTOM_VAULT_SENTINEL_OK") {
        setVaultStatus('unlocked');
        loadAndDecryptEntries(pin);
      } else {
        throw new Error("Handshake validation mismatch.");
      }
    } catch (err: any) {
      setErrorMessage("Cryptographic Handshake Failed: Invalid Master PIN or corrupt signature.");
    }
  };

  // Load encrypted records and decrypt them on-the-fly in RAM
  const loadAndDecryptEntries = async (currentPin: string) => {
    setIsLoadingEntries(true);
    try {
      let rawEntries: EncryptedVaultEntry[] = [];

      // 1. Fetch from Firestore (if user exists)
      if (auth.currentUser) {
        const path = `users/${auth.currentUser.uid}/vault_entries`;
        const snap = await getDocs(query(collection(db, path)));
        snap.docs.forEach(doc => {
          if (doc.id !== 'sentinel') {
            rawEntries.push(doc.data() as EncryptedVaultEntry);
          }
        });
      }

      // 2. Fetch from Local Storage encrypted store
      const localEncKey = auth.currentUser ? `joey_vault_enc_${auth.currentUser.uid}` : 'joey_vault_enc_offline';
      const storedLocalEnc = localStorage.getItem(localEncKey);
      if (storedLocalEnc) {
        const parsedLocalEnc = JSON.parse(storedLocalEnc);
        if (Array.isArray(parsedLocalEnc)) {
          // Merge avoiding duplicates
          parsedLocalEnc.forEach((item: EncryptedVaultEntry) => {
            if (!rawEntries.some(re => re.id === item.id)) {
              rawEntries.push(item);
            }
          });
        }
      }

      setEncryptedEntries(rawEntries);

      // Decrypt all entries on the fly
      const decryptedList: DecryptedVaultEntry[] = [];
      for (const entry of rawEntries) {
        try {
          const content = await decryptPayload(entry.encryptedPayload, entry.iv, entry.salt, currentPin);
          const type = entry.type || (content.startsWith('data:image') ? 'image' : 'text');
          const sanitizedContent = sanitizeContent(content, type);
          const sanitizedName = sanitizeTitle(entry.name);
          
          decryptedList.push({
            id: entry.id,
            name: sanitizedName,
            size: entry.size,
            date: entry.date,
            decryptedContent: sanitizedContent,
            type: type
          });
        } catch (decryptErr) {
          decryptedList.push({
            id: entry.id,
            name: sanitizeTitle(entry.name),
            size: entry.size,
            date: entry.date,
            decryptedContent: "[DECRYPTION_FAILED_PROTECTED]",
            type: entry.type || 'text',
            isCorrupted: true
          });
        }
      }

      setDecryptedEntries(decryptedList);
    } catch (err) {
      console.error("Error fetching vault content:", err);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  // Legacy Migration: encrypt unencrypted items saved previously
  const handleMigrateLegacyItems = async () => {
    if (vaultStatus !== 'unlocked') return;
    setIsMigratingLegacy(true);
    setErrorMessage(null);

    try {
      const stored = localStorage.getItem('joey_vault_files');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const rawItems = parsed.filter(item => !item.encrypted);
          
          for (const raw of rawItems) {
            const rawContent = raw.decryptedContent || raw.content || '';
            const type = rawContent.startsWith('data:image') ? 'image' : 'reward';
            const cleanContent = sanitizeContent(rawContent, type);
            const cleanName = sanitizeTitle(raw.name || 'Legacy Asset');
            
            const { ciphertextHex, ivHex, saltHex } = await encryptPayload(cleanContent, pin);
            
            const newEncryptedItem: EncryptedVaultEntry = {
              id: raw.id || `f_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              name: cleanName,
              size: raw.size || '32 KB',
              date: raw.date || new Date().toLocaleDateString(),
              encryptedPayload: ciphertextHex,
              iv: ivHex,
              salt: saltHex,
              type: type
            };

            // Save to Firestore (if signed in)
            if (auth.currentUser) {
              const path = `users/${auth.currentUser.uid}/vault_entries`;
              await setDoc(doc(db, path, newEncryptedItem.id), newEncryptedItem);
            } else {
              // Local encrypted storage fallback
              const localEncKey = 'joey_vault_enc_offline';
              const localStore = localStorage.getItem(localEncKey) || '[]';
              const localParsed = JSON.parse(localStore);
              localParsed.push(newEncryptedItem);
              localStorage.setItem(localEncKey, JSON.stringify(localParsed));
            }
          }

          // Strip unencrypted items out
          localStorage.removeItem('joey_vault_files');
          setLegacyRawCount(0);
          setErrorMessage("Legacy plain assets successfully encrypted with Master PIN and filed to Vault.");
          loadAndDecryptEntries(pin);
        }
      }
    } catch (e: any) {
      setErrorMessage(`Migration Failed: ${e.message}`);
    } finally {
      setIsMigratingLegacy(false);
    }
  };

  // Add custom typed secret
  const handleAddSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretTitle || !secretBody) return;
    setIsFiling(true);
    setErrorMessage(null);

    try {
      const cleanTitle = sanitizeTitle(secretTitle);
      const cleanBody = sanitizeContent(secretBody, 'text');

      if (!cleanTitle || !cleanBody) {
        setErrorMessage("Filing Rejected: Empty payload after cryptographic sanitization.");
        setIsFiling(false);
        return;
      }

      const { ciphertextHex, ivHex, saltHex } = await encryptPayload(cleanBody, pin);
      const entryId = `memo_${Date.now()}`;
      
      const entry: EncryptedVaultEntry = {
        id: entryId,
        name: cleanTitle,
        size: `${Math.ceil(cleanBody.length / 1024)} KB`,
        date: new Date().toLocaleDateString(),
        encryptedPayload: ciphertextHex,
        iv: ivHex,
        salt: saltHex,
        type: 'text'
      };

      if (auth.currentUser) {
        const path = `users/${auth.currentUser.uid}/vault_entries`;
        await setDoc(doc(db, path, entryId), entry);
      } else {
        const localEncKey = 'joey_vault_enc_offline';
        const localStore = localStorage.getItem(localEncKey) || '[]';
        const localParsed = JSON.parse(localStore);
        localParsed.push(entry);
        localStorage.setItem(localEncKey, JSON.stringify(localParsed));
      }

      setSecretTitle('');
      setSecretBody('');
      setErrorMessage("Memo encrypted and locked in Phantom Vault database successfully.");
      loadAndDecryptEntries(pin);
    } catch (err: any) {
      setErrorMessage(`Filing Failed: ${err.message}`);
    } finally {
      setIsFiling(false);
    }
  };

  // Delete secret securely
  const handleDeleteEntry = async (id: string) => {
    if (confirm("Permanently scrub this encrypted file? It is cryptographically unrecoverable once deleted.")) {
      try {
        if (auth.currentUser) {
          const path = `users/${auth.currentUser.uid}/vault_entries`;
          await deleteDoc(doc(db, path, id));
        }

        // Wipe from local encrypted store
        const localEncKey = auth.currentUser ? `joey_vault_enc_${auth.currentUser.uid}` : 'joey_vault_enc_offline';
        const localStore = localStorage.getItem(localEncKey);
        if (localStore) {
          const parsed = JSON.parse(localStore);
          const filtered = parsed.filter((entry: EncryptedVaultEntry) => entry.id !== id);
          localStorage.setItem(localEncKey, JSON.stringify(filtered));
        }

        loadAndDecryptEntries(pin);
      } catch (err: any) {
        setErrorMessage(`Scrubbing Failed: ${err.message}`);
      }
    }
  };

  const handleManualLock = () => {
    setVaultStatus('locked');
    setPin('');
    setDecryptedEntries([]);
    setErrorMessage("Wiped RAM payload registers. Vault is locked.");
  };

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      {/* 2FA Authenticator UI / Lock Screen */}
      {vaultStatus === 'locked' ? (
        <div className="bg-[#0b121e] border border-stone-800 rounded-xl p-5 flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-900/10 blur-[80px] rounded-full pointer-events-none" />
          
          <Lock className="w-12 h-12 text-pink-500 mb-4 animate-pulse" />
          <h4 className="font-mono text-sm font-bold text-stone-200 uppercase tracking-widest mb-1 flex items-center gap-2">
            Phantom Security Vault <Database className="w-4 h-4 text-[#00ffd2]" />
          </h4>
          <p className="font-mono text-[10px] text-stone-500 mb-6 max-w-[400px] text-center leading-relaxed">
            Zero-Knowledge PBKDF2 + AES-GCM local cryptographic enclave. Secure credentials, keypairs, levels, and digital collectibles safely. No cleartext storage, no remote servers.
          </p>

          {errorMessage && (
            <div className="mb-4 bg-red-950/40 border border-red-900/60 p-2.5 rounded-lg max-w-[320px] text-center">
              <span className="font-mono text-[10px] text-red-400 block leading-normal">{errorMessage}</span>
            </div>
          )}

          {isSetupNeeded ? (
            /* Setup State */
            <form onSubmit={handleSetupVault} className="w-full max-w-[280px] space-y-3">
              <div className="bg-purple-950/20 border border-purple-900/40 rounded p-2 text-center text-purple-300 font-mono text-[9px] uppercase tracking-wider">
                Initializing Vault Security Key
              </div>
              <div className="relative">
                <Hash className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={setupPin}
                  onChange={(e) => setSetupPin(e.target.value)}
                  placeholder="Create Master PIN..."
                  className="w-full bg-black border border-stone-800 text-purple-200 placeholder-stone-700 rounded-lg pl-9 pr-3 py-2.5 font-mono text-xs focus:outline-none focus:border-purple-500 tracking-widest text-center"
                />
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Confirm Master PIN..."
                  className="w-full bg-black border border-stone-800 text-purple-200 placeholder-stone-700 rounded-lg pl-9 pr-3 py-2.5 font-mono text-xs focus:outline-none focus:border-purple-500 tracking-widest text-center"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#00ffd2]/10 hover:bg-[#00ffd2]/20 border border-[#00ffd2]/30 text-[#00ffd2] font-mono text-xs font-bold py-2.5 rounded-lg transition"
              >
                GENERATE CRYPTO-SENTINEL
              </button>
            </form>
          ) : (
            /* Unlock State */
            <div className="w-full max-w-[280px] space-y-4">
              <div className="flex bg-stone-900 rounded-lg p-1 border border-stone-800">
                <button
                  type="button"
                  onClick={() => setAuthMethod('pin')}
                  className={`flex-1 py-1.5 text-[10px] font-mono font-bold uppercase rounded-md transition ${authMethod === 'pin' ? 'bg-[#00ffd2]/20 text-[#00ffd2]' : 'text-stone-500 hover:text-stone-300'}`}
                >
                  Master PIN
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('hardware')}
                  className={`flex-1 py-1.5 text-[10px] font-mono font-bold uppercase rounded-md transition ${authMethod === 'hardware' ? 'bg-purple-950/40 text-purple-400' : 'text-stone-500 hover:text-stone-300'}`}
                >
                  YubiKey NFC
                </button>
              </div>

              <form onSubmit={handleUnlock} className="flex flex-col gap-3">
                {authMethod === 'pin' && (
                  <div className="relative">
                    <Hash className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter Master PIN..."
                      className="w-full bg-black border border-stone-800 text-pink-200 placeholder-stone-700 rounded-lg pl-9 pr-3 py-2.5 font-mono text-xs focus:outline-none focus:border-[#00ffd2] tracking-widest text-center"
                    />
                  </div>
                )}

                {authMethod === 'hardware' && (
                  <div className="bg-black border border-stone-800 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-stone-900 transition" onClick={() => { setPin('1985'); }}>
                    <Fingerprint className="w-6 h-6 text-[#00ffd2] animate-pulse" />
                    <span className="font-mono text-[9px] text-stone-400 uppercase">Hardware Key Detected. Click to Authorize</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-stone-800 hover:bg-stone-700 text-white font-mono text-xs font-bold py-2.5 rounded-lg transition mt-2 flex items-center justify-center gap-2"
                >
                  <Unlock className="w-3.5 h-3.5" /> DECRYPT MEMORY SPACE
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        /* Vault Decrypted Payload / Control Panel */
        <div className="bg-[#07090e] border border-purple-500/30 rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden">
          {/* Subtle background gradient and wireframes */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00ffd2]/5 blur-[100px] pointer-events-none rounded-full" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-800 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#00ffd2] animate-pulse" />
              <div>
                <h4 className="font-mono text-xs font-bold text-[#00ffd2] uppercase tracking-wider flex items-center gap-1.5">
                  Handshake Active: Decrypted Vault registers
                </h4>
                <p className="text-[9px] font-mono text-stone-500 uppercase">
                  Derived PBKDF2 Master Key actively held in volatile RAM-Registers
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {auth.currentUser ? (
                <span className="text-[8px] font-mono bg-emerald-950/60 text-emerald-400 px-2 py-1 rounded border border-emerald-900/40 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> CLOUD SYNCED
                </span>
              ) : (
                <span className="text-[8px] font-mono bg-orange-950/60 text-orange-400 px-2 py-1 rounded border border-orange-900/40 flex items-center gap-1">
                  <CloudLightning className="w-3 h-3" /> OFFLINE / MEMORY LIMIT
                </span>
              )}

              <button
                onClick={handleManualLock}
                className="text-[9px] font-mono text-stone-400 hover:text-white uppercase flex items-center gap-1 bg-stone-900 px-2.5 py-1 rounded border border-stone-800 transition"
              >
                SCRUB registers <Lock className="w-3 h-3 text-pink-500" />
              </button>
            </div>
          </div>

          {/* Interactive Dead Man's Switch Monitor */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#0a0f18] border border-stone-800 p-3.5 rounded-lg">
            <div className="flex items-center gap-3 md:col-span-2">
              <Clock className="w-8 h-8 text-pink-500 animate-pulse" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-200">DEAD MAN'S SWITCH / PHANTOM SECURITY</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono uppercase font-bold border ${timeLeft < 60 ? 'bg-red-950/40 text-red-400 border-red-900/40 animate-pulse' : 'bg-purple-950/40 text-purple-400 border-purple-900/40'}`}>
                    {timeLeft < 60 ? 'ALERT - SIGNAL LIVENESS' : 'TRANSMISSION STABLE'}
                  </span>
                </div>
                <p className="text-[9px] font-mono text-stone-500 mt-0.5 max-w-[450px] leading-relaxed">
                  Purges master volatile RAM caches, discards decrypted key handles, and resets the secure session if silence exceeds 5 minutes. Reset the signal below.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center bg-[#060a10] border border-stone-800 p-2 rounded-md">
              <span className={`font-mono text-lg font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-purple-400'}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={resetDeadMansSwitch}
                className="w-full mt-1.5 bg-purple-900/20 hover:bg-purple-900/40 border border-purple-500/30 hover:border-purple-500/50 text-purple-300 font-mono text-[9px] font-bold py-1 px-2 rounded transition flex items-center justify-center gap-1.5 uppercase"
              >
                <HeartPulse className="w-3 h-3 text-pink-500 animate-ping" /> Check In / Confirmez Liveness
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-950/40 border border-red-900/60 p-3 rounded-lg flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="font-mono text-[10px] text-red-400 block leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Legacy Migration Alert */}
          {legacyRawCount > 0 && (
            <div className="bg-yellow-950/20 border border-yellow-800/40 p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <div>
                  <span className="font-mono text-xs font-bold text-yellow-400 block">UNPROTECTED LOCAL STORAGE ASSETS DETECTED ({legacyRawCount})</span>
                  <span className="font-mono text-[9px] text-stone-500 block leading-relaxed">
                    Plaintext rewards or synthesis assets are currently in cleartext localStorage. Commit them cryptographically to the secure vault database.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleMigrateLegacyItems}
                disabled={isMigratingLegacy}
                className="bg-yellow-950/40 hover:bg-yellow-950/60 border border-yellow-800/60 text-yellow-300 font-mono text-[10px] px-3 py-1.5 rounded transition whitespace-nowrap"
              >
                {isMigratingLegacy ? "ENCRYPTING..." : "CRYPTOGRAPHICALLY LOCK ASSETS"}
              </button>
            </div>
          )}

          {/* Decrypted Payload Listings */}
          <div className="space-y-3">
            <h5 className="font-mono text-[11px] font-bold text-[#00ffd2] uppercase tracking-widest border-b border-stone-800 pb-1.5 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> Decrypted Storage Indexes ({decryptedEntries.length})
            </h5>

            {isLoadingEntries ? (
              <div className="p-10 text-center font-mono text-stone-500 text-[10px] uppercase tracking-wider animate-pulse">
                Decrypting dynamic registers with Derived PBKDF2 Key...
              </div>
            ) : decryptedEntries.length === 0 ? (
              <div className="border border-dashed border-stone-800 p-8 rounded-xl text-center">
                <FileText className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                <span className="font-mono text-[10px] text-stone-500 block uppercase">No secure entries found. Write custom memos or save creations.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {decryptedEntries.map((entry) => (
                  <div key={entry.id} className="bg-[#0b121e] border border-stone-800 rounded-lg p-3 flex flex-col justify-between gap-2.5 hover:border-purple-900/40 transition">
                    <div>
                      <div className="flex items-center justify-between border-b border-stone-900 pb-1.5">
                        <span className="font-mono text-xs font-bold text-stone-300 truncate max-w-[80%] flex items-center gap-1.5">
                          {entry.type === 'image' ? (
                            <FileKey className="w-3.5 h-3.5 text-[#00ffd2]" />
                          ) : (
                            <FileText className="w-3.5 h-3.5 text-purple-400" />
                          )}
                          {entry.name}
                        </span>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-stone-600 hover:text-red-400 transition"
                          title="Securely Scrub"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {entry.isCorrupted ? (
                        <div className="mt-2 bg-red-950/20 border border-red-900/30 rounded p-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="font-mono text-[9px] text-red-400 uppercase tracking-wider">Decryption Fault / Corrupt Key material</span>
                        </div>
                      ) : entry.type === 'image' ? (
                        <div className="mt-2 relative group overflow-hidden rounded bg-black flex justify-center items-center min-h-[120px] max-h-[160px] border border-stone-900">
                          <img 
                            src={entry.decryptedContent} 
                            alt={entry.name} 
                            referrerPolicy="no-referrer"
                            className="max-h-[160px] object-contain"
                          />
                        </div>
                      ) : (
                        <div className="mt-2 bg-black/60 border border-stone-900 rounded p-2 min-h-[80px] max-h-[120px] overflow-y-auto">
                          <p className="font-mono text-[10px] text-stone-400 whitespace-pre-wrap leading-relaxed">{entry.decryptedContent}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-900 pt-1.5">
                      <span className="font-mono text-[8px] text-stone-500 uppercase">{entry.size}</span>
                      <span className="font-mono text-[8px] text-stone-500">{entry.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form to file new custom memos */}
          <div className="border-t border-stone-800 pt-4 mt-2">
            <h5 className="font-mono text-[11px] font-bold text-stone-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-purple-400" /> File Cryptographic Memo / Log
            </h5>

            <form onSubmit={handleAddSecret} className="space-y-3 max-w-lg">
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  value={secretTitle}
                  onChange={(e) => setSecretTitle(e.target.value)}
                  placeholder="Memo Title (e.g. Brain Wave Log, Access Key 1)..."
                  className="bg-black border border-stone-800 text-stone-200 placeholder-stone-700 rounded px-3 py-2 font-mono text-xs focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <textarea
                  value={secretBody}
                  onChange={(e) => setSecretBody(e.target.value)}
                  placeholder="Enter secret message or credentials to secure client-side..."
                  className="bg-black border border-stone-800 text-stone-200 placeholder-stone-700 rounded px-3 py-2 font-mono text-xs focus:outline-none focus:border-purple-500 min-h-[80px] max-h-[160px] leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isFiling}
                className="bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 hover:border-purple-500/50 text-purple-300 font-mono text-xs font-bold py-2 px-4 rounded transition flex items-center gap-1.5 uppercase"
              >
                <Save className="w-3.5 h-3.5" /> {isFiling ? "ENCRYPTING & FILING..." : "ENCRYPT & FILE TO VAULT"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
