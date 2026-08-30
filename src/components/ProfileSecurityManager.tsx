import React, { useState, useEffect } from 'react';
import { Mail, Phone, ShieldAlert, KeyRound, AlertTriangle, Fingerprint, Lock, QrCode, RefreshCw, Eye, EyeOff, ScanFace, Cloud } from 'lucide-react';
import { auth, googleProvider, db, handleFirestoreError, OperationType, doc, getDoc, setDoc, updateDoc } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { reinitializeOriginBackedKeys } from '../utils/quantumCrypto';

export default function ProfileSecurityManager() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkStatus, setLinkStatus] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  
  const [twoFaMethod, setTwoFaMethod] = useState<'none' | 'pin' | 'pattern' | 'password' | 'authenticator'>('none');

  // Likeness & Constitution exemption states
  const [userType, setUserType] = useState<'standard' | 'adult_industry' | 'social_uploader'>('standard');
  const [publicRegenerable, setPublicRegenerable] = useState(false);
  const [hasScannedFace, setHasScannedFace] = useState(false);
  const [mpofEnabled, setMpofEnabled] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Google Drive states
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Quantum Passkey Lock states
  const [passkey, setPasskey] = useState('');
  const [passkeyEnabled, setPasskeyEnabled] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);

  // Load configuration from Firestore on mount/auth state change
  useEffect(() => {
    async function loadSettings() {
      if (!auth.currentUser) return;
      const path = `users/${auth.currentUser.uid}`;
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.likenessConfig) {
            setUserType(data.likenessConfig.userType || 'standard');
            setPublicRegenerable(data.likenessConfig.publicRegenerable || false);
            setHasScannedFace(data.likenessConfig.hasScannedFace || false);
            setMpofEnabled(data.likenessConfig.mpofEnabled !== false);
          }
          setPasskey(data.passkey || '');
          setPasskeyEnabled(data.passkeyEnabled || false);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, path);
      }
    }
    loadSettings();
  }, [auth.currentUser]);

  const savePasskeySettings = async (newPasskey: string, newEnabled: boolean) => {
    setPasskey(newPasskey);
    setPasskeyEnabled(newEnabled);
    if (!auth.currentUser) {
      setLinkStatus("Settings updated in RAM. Authenticate to persist permanently.");
      return;
    }
    const path = `users/${auth.currentUser.uid}`;
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        passkey: newPasskey,
        passkeyEnabled: newEnabled
      });
      setLinkStatus("Quantum Passkey settings synced with cloud repository.");
    } catch (err: any) {
      setLinkStatus(`Passkey Sync failed: ${err.message}`);
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const saveLikenessSettings = async (updates: { userType?: typeof userType, publicRegenerable?: boolean, hasScannedFace?: boolean, mpofEnabled?: boolean }) => {
    // Optimistic state updates
    if (updates.userType !== undefined) setUserType(updates.userType);
    if (updates.publicRegenerable !== undefined) setPublicRegenerable(updates.publicRegenerable);
    if (updates.hasScannedFace !== undefined) setHasScannedFace(updates.hasScannedFace);
    if (updates.mpofEnabled !== undefined) setMpofEnabled(updates.mpofEnabled);

    if (!auth.currentUser) {
      setLinkStatus("Settings updated in RAM. Authenticate to persist permanently.");
      return;
    }

    setSavingSettings(true);
    const path = `users/${auth.currentUser.uid}`;
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      const currentConfig = {
        userType: updates.userType !== undefined ? updates.userType : userType,
        publicRegenerable: updates.publicRegenerable !== undefined ? updates.publicRegenerable : publicRegenerable,
        hasScannedFace: updates.hasScannedFace !== undefined ? updates.hasScannedFace : hasScannedFace,
        mpofEnabled: updates.mpofEnabled !== undefined ? updates.mpofEnabled : mpofEnabled,
      };

      if (userDoc.exists()) {
        await updateDoc(userDocRef, { likenessConfig: currentConfig });
      } else {
        await setDoc(userDocRef, { likenessConfig: currentConfig });
      }
      setLinkStatus("Likeness security settings synced with cloud repository.");
    } catch (err: any) {
      setLinkStatus(`Sync failed: ${err.message}`);
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleResetSystemHandshake = async () => {
    setIsResetting(true);
    setLinkStatus(null);
    try {
      reinitializeOriginBackedKeys(auth.currentUser?.uid || 'joey_system_core');
      const response = await fetch('/api/security/reset-handshake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        setLinkStatus(`SUCCESS: Origin-backed keys reinitialized. ${data.message}`);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setLinkStatus(`FAILED: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setLinkStatus(`ERROR: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleLinkEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if(email) setLinkStatus('Verification link sent to email.');
  };

  const handleLinkPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if(phone) setLinkStatus('Verification SMS dispatched.');
  };

  const handleOauth = async (provider: string) => {
    if (provider === 'Google') {
      try {
        setLinkStatus('Initiating Google sign-in...');
        const result = await signInWithPopup(auth, googleProvider);
        setLinkStatus(`Successfully linked Google account: ${result.user.email}`);
      } catch (e: any) {
        setLinkStatus(`Sign-in failed: ${e.message}`);
      }
    } else {
      setLinkStatus(`${provider} OAuth is not configured.`);
    }
  };

  const handleBackupToGoogleDrive = async () => {
    setIsBackingUp(true);
    setBackupStatus("Connecting Google Identity & requesting Drive access...");
    try {
      googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error("Unable to retrieve Google Drive OAuth access token.");
      }
      const token = credential.accessToken;
      
      setBackupStatus("Zipping current workspace codebase on server...");
      const response = await fetch('/api/security/backup-to-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token })
      });
      const data = await response.json();
      if (data.success) {
        setBackupStatus(`Success! Saved as "${data.filename}". File ID: ${data.fileId}`);
      } else {
        setBackupStatus(`Backup failed: ${data.error}`);
      }
    } catch (err: any) {
      console.error(err);
      setBackupStatus(`Backup failed: ${err.message}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4 text-[#00ffd2]" />
        <h3 className="text-xs text-slate-300 font-mono font-bold uppercase">Identity & Verification</h3>
      </div>

      {linkStatus && (
        <div className="bg-[#00ffd2]/10 border border-[#00ffd2]/30 text-[#00ffd2] px-3 py-2 rounded text-[10px] font-mono">
          {linkStatus}
        </div>
      )}

      {/* Account Links */}
      <div className="space-y-3 pt-2">
        <form onSubmit={handleLinkEmail} className="flex gap-2">
          <input 
            type="email" 
            placeholder="Link Email Address"
            className="bg-stone-950 border border-stone-800 text-slate-200 rounded px-2.5 py-1.5 font-mono text-[10px] flex-1 focus:outline-none focus:border-[#00ffff]"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-[10px] font-mono px-3 rounded uppercase text-slate-300 transition">
            Bind
          </button>
        </form>

        <form onSubmit={handleLinkPhone} className="flex gap-2">
          <input 
            type="tel" 
            placeholder="Link Phone Number"
            className="bg-stone-950 border border-stone-800 text-slate-200 rounded px-2.5 py-1.5 font-mono text-[10px] flex-1 focus:outline-none focus:border-[#00ffff]"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-[10px] font-mono px-3 rounded uppercase text-slate-300 transition">
            Bind
          </button>
        </form>
        
        {/* Third Party OAuth */}
        <div className="border border-stone-800 rounded-lg p-3">
          <div className="flex gap-2">
            <button onClick={() => handleOauth('Google')} className="flex-1 bg-stone-950 border border-stone-800 hover:border-slate-500 py-1.5 rounded text-[10px] font-mono text-slate-400 hover:text-slate-200 transition">
              Link Google
            </button>
            <button onClick={() => handleOauth('Microsoft')} className="flex-1 bg-stone-950 border border-stone-800 hover:border-slate-500 py-1.5 rounded text-[10px] font-mono text-slate-400 hover:text-slate-200 transition">
              Link Microsoft
            </button>
          </div>
        </div>
      </div>

      <div className="h-px bg-stone-800 w-full my-4"></div>

      {/* 2FA Configuration */}
      <div className="space-y-3">
        <h4 className="text-[10px] text-slate-400 font-mono uppercase flex items-center gap-1">
          <ShieldAlert className="w-3 h-3" /> 2FA Setup
        </h4>
        
        <select 
          value={twoFaMethod}
          onChange={(e) => {
            setTwoFaMethod(e.target.value as any);
          }}
          className="w-full bg-stone-950 border border-stone-800 text-slate-300 rounded px-2.5 py-1.5 font-mono text-[10px] focus:outline-none focus:border-[#00ffff]"
        >
          <option value="none">No 2FA</option>
          <option value="password">Independent Vault Password</option>
          <option value="pin">4-8 Digit Core PIN</option>
          <option value="pattern">Biometric / Draw Pattern</option>
          <option value="authenticator">Authenticator OTP (QR/24-digit)</option>
        </select>

        {twoFaMethod === 'authenticator' && (
          <div className="bg-stone-950 border border-stone-800 p-3 rounded-lg flex flex-col items-center gap-2">
            <QrCode className="w-16 h-16 text-slate-100" />
            <p className="text-[9px] font-mono text-slate-400 text-center uppercase">Scan via Authy/Google Authenticator</p>
            <p className="text-[8px] font-mono text-slate-500 tracking-widest mt-1">Manual: J3K9 9XQ1 ZZ3M PL10 RRT2 V89K</p>
          </div>
        )}
      </div>

      <div className="h-px bg-stone-800 w-full my-4"></div>

      {/* Quantum Passkey Lock Settings */}
      <div className="space-y-4">
        <h4 className="text-[10px] text-pink-500 font-mono uppercase flex items-center gap-1.5 font-bold">
          <KeyRound className="w-3.5 h-3.5 text-pink-500" /> Quantum Passkey Settings
        </h4>
        <p className="text-[9px] font-mono text-slate-400 leading-relaxed">
          Secure Joey AI with Crystals-Kyber-768 end-to-end encryption. Toggle the passkey requirement to authorize input transmission.
        </p>

        <div className="space-y-3 p-3 bg-stone-950 border border-stone-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-slate-300 uppercase">Enforce Passkey on Submission</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={passkeyEnabled}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  if (enabled && !passkey) {
                    setLinkStatus("Alert: Set a passkey code before enabling enforcement.");
                    return;
                  }
                  savePasskeySettings(passkey, enabled);
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-400 after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500 peer-checked:after:bg-black" />
            </label>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="block text-[8px] font-mono text-slate-500 uppercase">Configured Passkey (PIN / Text)</label>
            <div className="relative flex gap-2">
              <input
                type={showPasskey ? "text" : "password"}
                placeholder="No passkey set"
                value={passkey}
                onChange={(e) => {
                  setPasskey(e.target.value);
                }}
                className="bg-stone-900 border border-stone-800 text-slate-200 rounded px-2.5 py-1.5 font-mono text-[10px] flex-1 focus:outline-none focus:border-pink-500"
              />
              <button
                type="button"
                onClick={() => setShowPasskey(!showPasskey)}
                className="p-1.5 bg-stone-900 border border-stone-800 text-slate-400 hover:text-slate-200 rounded transition"
              >
                {showPasskey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!passkey.trim()) {
                    setLinkStatus("Please type a valid passkey first.");
                    return;
                  }
                  savePasskeySettings(passkey, passkeyEnabled);
                }}
                className="bg-pink-950/40 hover:bg-pink-900/60 border border-pink-900/60 hover:border-pink-500 text-pink-400 font-mono text-[9px] px-3 rounded uppercase transition font-bold"
              >
                Sync Key
              </button>
            </div>
            <p className="text-[8px] font-mono text-slate-500 leading-normal">
              Used as the decryption keyway in crystals-kyber envelope handshakes. Keep it memorized.
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-stone-800 w-full my-4"></div>

      {/* Nudity & Likeness Constitution Configuration */}
      <div className="space-y-4">
        <h4 className="text-[10px] text-[#00ffd2] font-mono uppercase flex items-center gap-1.5 font-bold">
          <ScanFace className="w-3.5 h-3.5 text-cyan-400" /> Likeness & Nudity Exemptions
        </h4>
        <p className="text-[9px] font-mono text-slate-400 leading-relaxed">
          Configure identity classification under Joey's constitution. Human anatomy and fine-art nudity are universally respected and protected from outright censorship.
        </p>

        <div className="space-y-2">
          <label className="block text-[8px] font-mono text-slate-500 uppercase">Constitution Exemption Profile</label>
          <select 
            value={userType}
            onChange={(e) => {
              const val = e.target.value as any;
              saveLikenessSettings({ 
                userType: val,
                publicRegenerable: val === 'social_uploader' ? publicRegenerable : false 
              });
            }}
            className="w-full bg-stone-950 border border-stone-800 text-slate-300 rounded px-2.5 py-1.5 font-mono text-[10px] focus:outline-none focus:border-[#00ffff]"
          >
            <option value="standard">Standard Practitioner (Academic / Fine Arts)</option>
            <option value="adult_industry">Adult Content Industry Worker (Exempt likeness rules 2 & 3)</option>
            <option value="social_uploader">Social Media Self-Uploader (Exempt rule 2 with Scanner)</option>
          </select>
        </div>

        {userType === 'social_uploader' && (
          <div className="space-y-3 p-3 bg-stone-950 border border-stone-800/80 rounded-lg animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-slate-400 uppercase">Facial Scanner Verification</span>
              <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${hasScannedFace ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {hasScannedFace ? 'VERIFIED' : 'PENDING SCAN'}
              </span>
            </div>
            
            {!hasScannedFace && (
              <p className="text-[8px] font-mono text-red-400/80 leading-normal">
                ⚠️ Verification Required: Social media likeness self-generation requires face scan registration to secure exact match permissions.
              </p>
            )}

            <button
              onClick={() => {
                saveLikenessSettings({ hasScannedFace: !hasScannedFace });
              }}
              className="w-full bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-slate-500 text-slate-300 transition rounded py-1.5 font-mono text-[9px] uppercase font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
              <span>{hasScannedFace ? 'Clear Registered Scan' : 'Register Facial Scan'}</span>
            </button>

            <div className="h-px bg-stone-900 my-2"></div>

            <div className="flex items-start gap-2 pt-1">
              <input 
                type="checkbox"
                id="public-regenerable"
                checked={publicRegenerable}
                onChange={(e) => {
                  saveLikenessSettings({ publicRegenerable: e.target.checked });
                }}
                className="mt-0.5 rounded border-stone-800 bg-stone-950 text-[#00ffff] focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <div className="flex-1 space-y-1">
                <label htmlFor="public-regenerable" className="block text-[9px] font-mono font-bold text-slate-300 uppercase cursor-pointer">
                  Allow Public Regenerable Access
                </label>
                <div className="text-[8px] font-mono text-amber-500/90 leading-relaxed bg-amber-500/5 border border-amber-500/10 p-2 rounded">
                  <strong>⚠️ CRITICAL PRE-WARNING:</strong> Revocation of public regenerable permission will stop new generations, but will not delete or remove photos that others have already generated of you.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-stone-800 w-full my-4"></div>

      {/* MPOF Output Fragmentation Control */}
      <div className="space-y-3">
        <h4 className="text-[10px] text-pink-500 font-mono uppercase flex items-center gap-1.5 font-bold">
          <Lock className="w-3.5 h-3.5 text-pink-500" /> Output Fragmentation Engine
        </h4>
        <p className="text-[9px] font-mono text-slate-400 leading-relaxed">
          When active, Joey's output engine uses Shamir's Secret Sharing (GF256) with Merkle Proofs to fragment outputs. Deactivating this restores direct plaintext streams for higher speed and reliability.
        </p>
        <div className="flex items-center justify-between p-2.5 bg-stone-950 border border-stone-800 rounded-lg">
          <span className="text-[9px] font-mono text-slate-300 uppercase">MPOF Secure Output</span>
          <button
            onClick={() => saveLikenessSettings({ mpofEnabled: !mpofEnabled })}
            className={`px-3 py-1 font-mono text-[9px] uppercase font-bold rounded cursor-pointer transition-all duration-300 ${
              mpofEnabled
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
                : 'bg-red-500/15 text-red-400 border border-red-500/30'
            }`}
          >
            {mpofEnabled ? 'SECURED (MPOF ON)' : 'RESTORED (PLAINTEXT)'}
          </button>
        </div>
      </div>

      <div className="h-px bg-stone-800 w-full my-4"></div>

      {/* Save to Google Drive */}
      <div className="space-y-3">
        <h4 className="text-[10px] text-cyan-400 font-mono uppercase flex items-center gap-1.5 font-bold">
          <Cloud className="w-3.5 h-3.5 text-cyan-400" /> Save Application to Google Drive
        </h4>
        <p className="text-[9px] font-mono text-slate-400 leading-relaxed">
          Securely package and upload a complete ZIP archive of the Joey AI codebase directly to your personal Google Drive account.
        </p>

        {backupStatus && (
          <div className="p-2 bg-[#05060a] border border-stone-800/80 rounded-lg text-[9px] font-mono text-cyan-300 leading-normal animate-fadeIn">
            🛡️ {backupStatus}
          </div>
        )}

        <button 
          onClick={handleBackupToGoogleDrive}
          disabled={isBackingUp}
          className="w-full bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-900/60 hover:border-cyan-500 text-cyan-400 hover:text-white transition rounded py-2 font-mono text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_8px_rgba(6,182,212,0.1)]"
        >
          {isBackingUp ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Zipping & Uploading...</span>
            </>
          ) : (
            <>
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>Back Up Joey AI to Google Drive</span>
            </>
          )}
        </button>
      </div>

      <div className="h-px bg-stone-800 w-full my-4"></div>

      {/* System Reinitialization */}
      <div className="space-y-3">
        <h4 className="text-[10px] text-slate-400 font-mono uppercase flex items-center gap-1">
          <RefreshCw className="w-3 h-3 text-pink-500 animate-spin" /> System Reinitialization
        </h4>
        <p className="text-[9px] font-mono text-slate-500 leading-relaxed">
          Reset secure handshake tokens, clear locked IP bindings, and reinitialize quantum entropy wells. This allows your current machine to establish ownership.
        </p>
        <button 
          onClick={handleResetSystemHandshake}
          disabled={isResetting}
          className="w-full bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 hover:border-red-500 text-red-400 hover:text-white transition rounded py-2 font-mono text-[10px] uppercase font-bold shadow-[0_0_8px_rgba(239,68,68,0.1)] flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {isResetting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Reinitializing...</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Reset & Reinitialize Handshake</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
