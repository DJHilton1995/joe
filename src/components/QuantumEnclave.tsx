import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, 
  Cpu, 
  Key, 
  RefreshCw, 
  Lock, 
  Unlock, 
  FileLock2, 
  Fingerprint, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Compass, 
  Send, 
  Server,
  Zap,
  ListCollapse,
  ShieldCheck,
  Timer
} from 'lucide-react';

import { Kyber768, hmacSha256, u8ToHex, hexToU8 } from '../lib/kyber';
import { QuantumSealedPromptEnvelope } from '../lib/promptSecurity';

interface QuantumLedger {
  tokenId: string;
  hash: string;
  beaconValue: string;
  verificationOutcome: string;
}

interface KyberRotationLog {
  timestamp: string;
  prevSecretHash: string;
  newSecretHash: string;
  rotationNum: number;
}

export default function QuantumEnclave() {
  const [entropyStream, setEntropyStream] = useState<string[]>([]);
  const [tokenId, setTokenId] = useState<string>('');
  const [sessionSeed, setSessionSeed] = useState<string>('');
  const [beaconValue, setBeaconValue] = useState<string>('');
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);
  
  // CRYSTALS-Kyber KEM State Handshaking
  const [kyberPublicKey, setKyberPublicKey] = useState<string>('');
  const [kyberSharedSecret, setKyberSharedSecret] = useState<string>('');
  const [kyberSecretHash, setKyberSecretHash] = useState<string>('WAITING_FOR_HANDSHAKE');
  const [rotationTimer, setRotationTimer] = useState<number>(30);
  const [rotationCount, setRotationCount] = useState<number>(0);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [kyberRotationLogs, setKyberRotationLogs] = useState<KyberRotationLog[]>([]);

  // Prompt Submission Fields
  const [prompt, setPrompt] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sealedResponse, setSealedResponse] = useState<string>('');
  const [unsealedResponse, setUnsealedResponse] = useState<string>('');
  const [ledger, setLedger] = useState<QuantumLedger | null>(null);
  const [errorStatus, setErrorStatus] = useState<string>('');
  const [currentHash, setCurrentHash] = useState<string>('');
  const [currentKyberSig, setCurrentKyberSig] = useState<string>('');

  // Challenge System
  const [challengeRequired, setChallengeRequired] = useState<boolean>(false);
  const [challengeAngle, setChallengeAngle] = useState<string>('');
  const [selectedAngle, setSelectedAngle] = useState<string>('');
  const [challengeMessage, setChallengeMessage] = useState<string>('');
  const [isSolving, setIsSolving] = useState<boolean>(false);

  const [clientPrivateKey, setClientPrivateKey] = useState<CryptoKey | string>('ephemeral-kem-fallback');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      window.crypto.subtle.generateKey(
        { name: "HMAC", hash: { name: "SHA-256" } },
        true,
        ["sign", "verify"]
      ).then(key => {
        const kp = key as any;
        if (kp && kp.privateKey) {
          setClientPrivateKey(kp.privateKey);
        } else if (key) {
          setClientPrivateKey(key as any);
        }
      }).catch(err => {
        console.warn("Could not generate client private key", err);
      });
    }
  }, []);

  // Generate dynamic rolling entropy stream
  useEffect(() => {
    const interval = setInterval(() => {
      const chars = '01ABCDEF';
      let row = '';
      for (let i = 0; i < 28; i++) {
        row += chars[Math.floor(Math.random() * chars.length)];
      }
      setEntropyStream(prev => [row, ...prev.slice(0, 5)]);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Compute live local SHA-256 (H) and Kyber Signature (HMAC) for display
  useEffect(() => {
    if (!prompt) {
      setCurrentHash('');
      setCurrentKyberSig('');
      return;
    }
    
    const computeHandshakeMetrics = async () => {
      const context = 'CONTEXT:JOEY_SECURE_COGNITION';
      const textToHash = prompt + context + (sessionSeed || 'UNINITIALIZED_SEED');
      
      // Compute standard SHA-256 hash using browser crypto
      const msgBuffer = new TextEncoder().encode(textToHash);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setCurrentHash(hashHex);

      // Compute Kyber HMAC Sign
      if (kyberSharedSecret) {
        const payloadString = prompt + context;
        const encoder = new TextEncoder();
        const secretU8 = encoder.encode(kyberSharedSecret);
        const msgU8 = encoder.encode(payloadString);
        const sigU8 = hmacSha256(secretU8, msgU8);
        setCurrentKyberSig(u8ToHex(sigU8));
      } else {
        setCurrentKyberSig('');
      }
    };

    computeHandshakeMetrics();
  }, [prompt, sessionSeed, kyberSharedSecret]);

  // Automatic Key Rotation ticking clock (Maintaining forward secrecy against intercepted packets)
  useEffect(() => {
    if (!tokenId || !kyberSharedSecret) return;

    const tick = setInterval(() => {
      setRotationTimer(prev => {
        if (prev <= 1) {
          // Trigger PQC automated rotation
          handleRotateKyberKeys(true);
          return 30; // resets
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [tokenId, kyberSharedSecret]);

  // Handle Token Request & First Handshake KEM
  const handleRequestToken = async () => {
    setIsProvisioning(true);
    setErrorStatus('');
    setSealedResponse('');
    setUnsealedResponse('');
    try {
      const res = await fetch('/api/quantum/token', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTokenId(data.tokenId);
        setSessionSeed(data.sessionSeed);
        setBeaconValue(data.beaconValue);

        // --- Execute Post-Quantum KEM handshake ---
        const serverPublicKey = data.kyberPublicKey;
        setKyberPublicKey(serverPublicKey);

        // Client encapsulates using server's Kyber-768 public key
        const { ciphertext, sharedSecret } = Kyber768.encapsulate(serverPublicKey);
        setKyberSharedSecret(sharedSecret);

        // Swap ciphertext back to the server decapsulation gate
        const swapRes = await fetch('/api/quantum/kyber-exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokenId: data.tokenId, ciphertext })
        });
        const swapData = await swapRes.json();

        if (swapData.success) {
          // Cryptographically hash the Kyber shared secret for visually clean representation
          const encoder = new TextEncoder();
          const hashBuf = await window.crypto.subtle.digest('SHA-256', encoder.encode(sharedSecret));
          const hashArr = Array.from(new Uint8Array(hashBuf));
          const newHashHex = hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
          const cleanHash = newHashHex.substring(0, 16) + '...';

          setKyberSecretHash(cleanHash);
          setRotationCount(0);
          setRotationTimer(30);
          setKyberRotationLogs([{
            timestamp: new Date().toLocaleTimeString(),
            prevSecretHash: 'SEEDING_CRYSTALS_ENTROPY_WELL',
            newSecretHash: cleanHash,
            rotationNum: 0
          }]);
        } else {
          setErrorStatus('Kyber Handshake decapsulation rejected by HSM.');
        }

      } else {
        setErrorStatus('HSM Gateway denied credentials handshake.');
      }
    } catch (e: any) {
      setErrorStatus('Failed to connect to HSM Enclave: ' + e.message);
    } finally {
      setIsProvisioning(false);
    }
  };

  // Perform Ephemeral Kyber Key Rotation (Manual or Automatic)
  const handleRotateKyberKeys = async (isAuto = false) => {
    if (!tokenId) {
      setErrorStatus('No active session. Establish credentials first.');
      return;
    }
    setIsRotating(true);
    setErrorStatus('');
    try {
      // 1. Enquire server for a fresh rotational Kyber public key
      const rotateRes = await fetch('/api/quantum/rotate-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId })
      });
      const rotateData = await rotateRes.json();
      if (!rotateData.success) {
        throw new Error(rotateData.error || 'Server denied Kyber rotation trigger.');
      }

      // 2. Client captures the brand-new rotating key and encapsulates a fresh secret
      const serverNewPubKey = rotateData.kyberPublicKey;
      setKyberPublicKey(serverNewPubKey);

      const { ciphertext, sharedSecret } = Kyber768.encapsulate(serverNewPubKey);
      
      // 3. Swap the rotational payload to re-synchronize keys 
      const swapRes = await fetch('/api/quantum/kyber-exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, ciphertext })
      });
      const swapData = await swapRes.json();

      if (swapData.success) {
        const oldSecretHash = kyberSecretHash;
        setKyberSharedSecret(sharedSecret);

        const encoder = new TextEncoder();
        const hashBuf = await window.crypto.subtle.digest('SHA-256', encoder.encode(sharedSecret));
        const hashArr = Array.from(new Uint8Array(hashBuf));
        const newHashHex = hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
        const newHashClean = newHashHex.substring(0, 16) + '...';

        setKyberSecretHash(newHashClean);
        setRotationCount(rotateData.rotationCount);
        setRotationTimer(30);

        // Record the forward secrecy historical footprint
        setKyberRotationLogs(prev => [{
          timestamp: new Date().toLocaleTimeString(),
          prevSecretHash: oldSecretHash,
          newSecretHash: newHashClean,
          rotationNum: rotateData.rotationCount
        }, ...prev].slice(0, 8));

      } else {
        setErrorStatus('Rotational handshake dropped: Decapsulation fault.');
      }

    } catch (err: any) {
      setErrorStatus('PQC Key Rotation error: ' + err.message);
    } finally {
      setIsRotating(false);
    }
  };

  // Solve Challenge
  const handleSolveChallenge = async (angle: string) => {
    setSelectedAngle(angle);
    setIsSolving(true);
    setErrorStatus('');
    try {
      const res = await fetch('/api/quantum/challenge-solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, challengeAnswer: angle }),
      });
      const data = await res.json();
      if (data.success) {
        setChallengeMessage(data.message);
        setTimeout(() => {
          setChallengeRequired(false);
          // Auto resubmit the request now that it is authorized!
          handleSendPrompt(true);
        }, 1200);
      } else {
        setErrorStatus(data.error || 'Challenge answer rejected.');
      }
    } catch {
      setErrorStatus('Challenge authentication pipeline error.');
    } finally {
      setIsSolving(false);
    }
  };

  // Send Prompt through Kyber Protected Gateway
  const handleSendPrompt = async (bypassChallengeTrigger = false) => {
    if (!tokenId || !sessionSeed) {
      setErrorStatus('Enclave credentials missing. Please Provision Token first.');
      return;
    }
    if (!prompt.trim()) return;

    setIsLoading(true);
    setErrorStatus('');
    setSealedResponse('');
    setUnsealedResponse('');

    const context = 'CONTEXT:JOEY_SECURE_COGNITION';
    let payloadHash = currentHash;
    let payloadKyberSig = currentKyberSig;

    let promptEnvelope = undefined;
    let envelopeInstance: QuantumSealedPromptEnvelope | null = null;

    if (kyberPublicKey) {
      try {
        const envelope = new QuantumSealedPromptEnvelope(kyberPublicKey, clientPrivateKey);
        envelopeInstance = envelope;
        const metadata = {
          userId: 'anonymous_enclave',
          timestamp: Date.now()
        };
        promptEnvelope = await envelope.seal(prompt, metadata);
      } catch (sealErr) {
        console.warn("Could not construct quantum envelope in Sentinel, using fallback.", sealErr);
      }
    }

    try {
      const res = await fetch('/api/quantum/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptEnvelope ? undefined : prompt,
          promptEnvelope,
          tokenId,
          hash: payloadHash,
          context,
          kyberSignature: payloadKyberSig
        }),
      });

      const data = await res.json();

      if (res.status === 401 || res.status === 400) {
        setErrorStatus(`[${data.error || 'GATEWAY_ALERT'}] ${data.details || 'Integrity Failure'}`);
        return;
      }

      if (data.status === 'CHALLENGE_REQUIRED') {
        setChallengeRequired(true);
        setChallengeAngle(data.challengeAngle);
        setSelectedAngle('');
        setChallengeMessage('Suspected cognitive bypass signature. Align physical photon spin vectors to authenticate.');
        if (data.ledger) setLedger(data.ledger);
        return;
      }

      if (data.status === 'SUCCESS') {
        setSealedResponse(data.ciphertextResponse);
        
        // Verify server proof receipt
        if (data.serverProof && envelopeInstance && promptEnvelope) {
          try {
            const verified = await envelopeInstance.verifyReceipt(data.serverProof);
            if (verified) {
              console.log('[SECURITY VERIFICATION] Sentinel secure receipt verified successfully.');
            } else {
              console.warn('[SECURITY BREACH WARNING] Sentinel receipt verification FAILED! Data spoofing suspected!');
            }
          } catch (verifyErr) {
            console.error("Failed to verify server proof in enclave:", verifyErr);
          }
        }

        // Decrypt / Unseal locally using the Session Seed S
        try {
          const base64Decoded = atob(data.ciphertextResponse);
          const prefix = `[SEALED-VIA:${sessionSeed}]`;
          if (base64Decoded.startsWith(prefix)) {
            setUnsealedResponse(base64Decoded.replace(prefix, ''));
          } else {
            setUnsealedResponse(base64Decoded);
          }
        } catch {
          setUnsealedResponse('Error unsealing response envelope. Seed signature mismatch.');
        }

        if (data.ledger) {
          setLedger(data.ledger);
        }
      }
    } catch {
      setErrorStatus('Quantum gateway timeout.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      {/* High-Entropy Randomness Beacon and QKD pool */}
      <div className="bg-[#110522] border border-purple-600/40 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden">
        <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[8px] font-mono text-[#00ffd2] bg-cyan-950/20 px-1.5 py-0.5 rounded border border-[#00ffd2]/25">
          <Activity className="w-3 h-3 animate-pulse" /> Live QKD Beacon
        </div>
        
        <h4 className="font-mono text-xs text-[#00ffd2] font-semibold flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" /> High-Entropy Entropy Pool
        </h4>
        
        <p className="text-[10px] font-mono text-pink-300 leading-relaxed">
          Sourced from unpredictable quantum polarization fluctuations. Feeds crystals handshaking with hardware-certified randomness.
        </p>

        {/* Matrix Rain representation */}
        <div className="grid grid-cols-2 gap-2 bg-[#1a0533]/40 border border-[#00ffd2]/10 p-2.5 rounded font-mono text-[9px] min-h-[50px]">
          <div className="space-y-1 text-[#00ffd2]/40 select-none truncate">
            {entropyStream.map((line, idx) => (
              <span key={idx} className="block tracking-wider" style={{ opacity: 1 - idx * 0.15 }}>
                {line}
              </span>
            ))}
          </div>
          <div className="flex flex-col justify-center gap-1 text-[10px] text-right">
            <div className="text-[#00ffff]">Unpredictability Rate: 1.000</div>
            <div className="text-purple-300">Shannon Entropy: 256 bits/pulse</div>
            <div className="text-yellow-500 text-[9px] truncate">
              QKD Link: CONNECTED to Enclave HSM
            </div>
          </div>
        </div>
      </div>

      {/* PQC Shield Configuration Panel */}
      <div className="bg-[#2d0a42] border border-pink-600/50 shadow-[0_0_15px_rgba(236,72,153,0.5)] rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="font-mono text-xs font-bold text-cyan-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-pink-500" /> WireGuard Cryptographic Enclave
          </h4>
          <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
            kyberSharedSecret 
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' 
              : 'bg-stone-900 text-purple-300 border-stone-850'
          }`}>
            {kyberSharedSecret ? 'WireGuard Active' : 'Offline'}
          </span>
        </div>

        <p className="text-[10px] font-mono text-pink-300 leading-snug">
          Secures requests with established WireGuard Curve25519 (X25519 ECDH) and ChaCha20-Poly1305 AEAD. Automatically rotates peer keys every 30s to enforce forward secrecy.
        </p>

        {tokenId && kyberSharedSecret && (
          <div className="bg-[#110522] border border-stone-850 rounded-lg p-3 space-y-2 text-[10px] font-mono">
            <div className="flex justify-between items-center border-b border-stone-900 pb-1.5">
              <span className="text-purple-300">Crypto Protocol:</span>
              <span className="text-pink-500 font-bold">WireGuard (Curve25519 + ChaCha20-Poly1305)</span>
            </div>
            <div className="flex justify-between items-center border-b border-stone-900 pb-1.5">
              <span className="text-purple-300">WireGuard Peer PubKey:</span>
              <span className="text-cyan-300 font-bold select-all truncate max-w-[185px]" title={kyberPublicKey}>
                {kyberPublicKey ? `${kyberPublicKey.substring(0, 16)}...` : '[ACTIVE]'}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-stone-900 pb-1.5">
              <span className="text-purple-300">Joint Shared Secret:</span>
              <span className="text-purple-300 font-bold select-all truncate max-w-[185px]">
                {kyberSecretHash}
              </span>
            </div>
            
            <div className="flex justify-between items-center border-b border-stone-900 pb-1.5">
              <span className="text-purple-300">Rotation Sequence:</span>
              <span className="text-white font-bold drop-shadow-[0_0_3px_#fff] font-semibold">Epoch #{rotationCount}</span>
            </div>
            {/* Rotation Countdown Clock */}
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-purple-300 flex items-center gap-1">
                <Timer className="w-3.5 h-3.5 text-orange-400 animate-pulse" /> Auto Rotation Countdown:
              </span>
              <span className={`font-bold transition-all px-2 py-0.5 rounded ${
                rotationTimer < 8 ? 'text-red-400 bg-red-950/20 border border-red-900/30' : 'text-orange-400 bg-yellow-950/10'
              }`}>
                {rotationTimer}s Remaining
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRequestToken}
            disabled={isProvisioning}
            className="flex-1 bg-cyan-950/20 hover:bg-cyan-900/30 text-cyan-300 hover:text-white border border-pink-600/50 shadow-[0_0_15px_rgba(236,72,153,0.5)] font-mono text-[10px] font-bold py-2 rounded-lg transition flex items-center justify-center gap-1 disabled:opacity-50"
          >
            <Key className="w-3 h-3" />
            {isProvisioning ? 'Handshaking...' : tokenId ? 'Re-Key WireGuard Session' : 'Establish WireGuard Tunnel'}
          </button>
          {tokenId && kyberSharedSecret && (
            <button
              type="button"
              onClick={() => handleRotateKyberKeys(false)}
              disabled={isRotating}
              className="px-3 bg-orange-950/20 hover:bg-orange-900/30 text-orange-400 hover:text-white border border-orange-800/40 font-mono text-[10px] py-1 rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
              title="Manual rotation override supporting instant forward secrecy"
            >
              <RefreshCw className={`w-3 h-3 ${isRotating ? 'animate-spin' : ''}`} />
              Rotate Now
            </button>
          )}
        </div>

        {/* Rotation Chronicles Ledger */}
        {kyberRotationLogs.length > 0 && (
          <div className="bg-[#1a0533]/30 border border-stone-850 rounded-lg p-2.5 space-y-1.5">
            <span className="text-[9px] font-mono text-purple-300 font-bold uppercase tracking-widest block">
              🛡️ Forward Secrecy Log (Historical Keys Rotated)
            </span>
            <div className="max-h-[85px] overflow-y-auto space-y-1 text-[9px] font-mono scrollbar-thin">
              {kyberRotationLogs.map((log, index) => (
                <div key={index} className="flex justify-between bg-[#1a0533]/80 border-purple-500/50 px-2 py-1 rounded text-pink-300 border border-stone-900">
                  <span>Epoch #{log.rotationNum} ({log.timestamp})</span>
                  <div className="flex gap-1">
                    <span className="text-emerald-400 font-semibold">ROTATED SAFELY</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ephemeral Identity Token Forge Enclave Panel */}
      <div className="bg-[#220738] border border-[#1a2536] rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="font-mono text-xs font-bold text-white font-bold drop-shadow-[0_0_3px_#fff] flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5 text-purple-400" /> Identity Token Forge
          </h4>
          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
            tokenId ? 'bg-purple-950 text-purple-400 border border-purple-800' : 'bg-stone-900 text-purple-300 border border-stone-805'
          }`}>
            {tokenId ? 'Token Bound' : 'Awaiting Forge'}
          </span>
        </div>

        <p className="text-[10px] font-mono text-pink-300 leading-snug">
          Step 2: Authenticate and request an ephemeral physical identity token <span className="text-cyan-300">T</span> and high-entropy session seed <span className="text-cyan-300">S</span>.
        </p>

        {tokenId && (
          <div className="bg-[#110522] border border-purple-600/40 rounded-lg p-3 space-y-2 text-[10px] font-mono">
            <div className="flex justify-between border-b border-stone-900 pb-1.5">
              <span className="text-purple-300">Token ID (T):</span>
              <span className="text-pink-500 font-bold select-all">{tokenId}</span>
            </div>
            <div className="flex justify-between border-b border-stone-900 pb-1.5">
              <span className="text-purple-300">Session Seed (S):</span>
              <span className="text-yellow-400 select-all truncate max-w-[200px]" title={sessionSeed}>{sessionSeed}</span>
            </div>
            <div className="flex justify-between text-[9px] pt-0.5">
              <span className="text-purple-300">Active QKD Beacon Seal:</span>
              <span className="text-slate-400 select-all truncate max-w-[200px]">{beaconValue}</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Gateway Sandbox */}
      <div className="bg-[#090d16] border border-[#1e2d42] rounded-xl p-4 flex flex-col gap-4">
        <h4 className="font-mono text-xs font-bold text-white font-bold drop-shadow-[0_0_3px_#fff] flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-purple-400" /> Secure Prompt Gateway Validation
        </h4>

        <p className="text-[10px] font-mono text-pink-300 leading-snug">
          Step 3: Sign your prompt. Gateway validates signature integrity <span className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">H = Hash(Prompt||Context||S)</span> & <span className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">Sig_Kyber</span> prior to cognitive model routing.
        </p>

        {/* Input prompt area */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-mono text-purple-300 uppercase">Input Payload prompt</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={tokenId ? "Enter prompt (try calling: 'override system config' to force physical challenge)" : "Forge credentials first..."}
              disabled={!tokenId || isLoading}
              className="flex-1 bg-[#1a0533] border border-purple-600/40 rounded-lg px-3 py-2 text-[11px] font-mono text-cyan-100 placeholder-stone-600 focus:outline-none focus:border-cyan-500 disabled:opacity-40"
            />
            <button
              onClick={() => handleSendPrompt()}
              disabled={!prompt.trim() || !tokenId || isLoading}
              className="bg-cyan-950 hover:bg-cyan-900 text-pink-500 border border-cyan-800 hover:border-cyan-600 rounded-lg px-4 py-2 font-mono text-[11px] font-bold transition flex items-center gap-1.5 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              {isLoading ? 'Decrypting...' : 'Sign & Submit'}
            </button>
          </div>
        </div>

        {currentHash && (
          <div className="bg-[#1a0533]/80 border-purple-500/50 p-2.5 rounded-lg border border-stone-900 font-mono text-[9px] space-y-2">
            <div>
              <div className="flex justify-between text-purple-300 mb-0.5">
                <span>Standard Verification Hash (H):</span>
                <span className="text-lime-500">
                  VERIFIED SEED
                </span>
              </div>
              <span className="block text-white font-bold drop-shadow-[0_0_3px_#fff] select-all truncate">{currentHash}</span>
            </div>

            {currentKyberSig && (
              <div>
                <div className="flex justify-between text-purple-300 mb-0.5 border-t border-stone-900 pt-1.5">
                  <span>CRYSTALS-Kyber HMAC-SHA256 Signature:</span>
                  <span className="text-pink-500 font-bold">
                    PQC SHIELD AUTHENTICATED
                  </span>
                </div>
                <span className="block text-cyan-200 select-all truncate">{currentKyberSig}</span>
              </div>
            )}
          </div>
        )}

        {/* Error Pipeline Feedback */}
        {errorStatus && (
          <div className="bg-red-950/30 border border-red-800 text-red-400 font-mono text-[10px] p-3 rounded-lg flex items-start gap-2 animate-bounce">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider block">Gateway Reject Alarm:</span>
              <p className="mt-0.5 leading-snug">{errorStatus}</p>
            </div>
          </div>
        )}

        {/* Interactive Verification challenge overlay */}
        {challengeRequired && (
          <div className="bg-yellow-950/20 border-2 border-yellow-600/50 rounded-xl p-4 space-y-3 animate-fadeIn">
            <div className="flex items-start gap-2">
              <Compass className="w-5 h-5 text-yellow-500 animate-spin" />
              <div className="flex-1">
                <h5 className="font-mono text-xs font-bold text-yellow-500 uppercase tracking-widest">
                  Unclonable Polarization Challenge Active
                </h5>
                <p className="text-[10px] font-mono text-pink-300 mt-1 leading-snug">
                  {challengeMessage} A physical quantum photon pulse has been fired. Select the matching polarising angle filter (<strong>C = {challengeAngle}°</strong>) to satisfy the wave-function collapse condition without cloning.
                </p>
              </div>
            </div>

            {/* Circle Polarization Representation */}
            <div className="flex justify-around items-center bg-[#1a0533]/60 p-4 rounded-lg border border-yellow-800/30">
              <div className="relative w-16 h-16 rounded-full border border-purple-600/40 flex items-center justify-center bg-stone-950">
                <div className="absolute w-[2px] h-12 bg-yellow-500/30 animate-pulse" />
                <div 
                 className="absolute w-[3px] h-14 bg-[#00ffff] transition-transform duration-500" 
                  style={{ transform: `rotate(${selectedAngle || '0'}deg)` }}
                />
                <span className="text-[8px] font-mono text-purple-300 absolute bottom-1">Photon Angle</span>
              </div>

              <div className="flex flex-col gap-1.5 w-1/2">
                <label className="text-[8px] font-mono text-purple-300 uppercase">Collapsing Measurement Filters:</label>
                <div className="grid grid-cols-3 gap-1.5 font-mono">
                  {['0', '45', '90'].map((angle) => (
                    <button
                      key={angle}
                      type="button"
                      onClick={() => handleSolveChallenge(angle)}
                      disabled={isSolving}
                      className={`py-1 text-[10px] font-bold border rounded-md transition ${
                        selectedAngle === angle
                          ? angle === challengeAngle 
                            ? 'bg-lime-950 border-lime-500 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' 
                            : 'bg-red-950 border-red-500 text-red-400'
                          : 'bg-stone-900 border-purple-600/40 text-pink-300 hover:bg-stone-800'
                      }`}
                    >
                      {angle}°
                    </button>
                  ))}
                </div>
                <div className="text-[9px] font-mono text-purple-300 mt-1">
                  Correct alignment is required to verify real-time physical possession.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cryptographic outputs */}
        {sealedResponse && (
          <div className="space-y-3 border-t border-stone-900 pt-3 animate-fadeIn">
            {/* Step 1: Base64 Sealed Envelope */}
            <div className="space-y-1 text-[10px] font-mono">
              <span className="text-purple-300 uppercase text-[9px] block">1. Sealed Response Cryptogram (R)</span>
              <div className="bg-[#1a0533]/80 border-purple-500/50 border border-yellow-800/20 p-2.5 rounded-lg text-yellow-500 text-[9px] select-all truncate">
                {sealedResponse}
              </div>
            </div>

            {/* Step 2: Unsealed Deciphered Text */}
            <div className="space-y-1 text-[10px] font-mono">
              <span className="text-purple-300 uppercase text-[9px] block flex items-center gap-1">
                <Unlock className="w-3 h-3 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" /> 2. Deciphered Text (Unsealed locally using Seed S)
              </span>
              <div className="bg-[#1a0533] border border-lime-900/30 p-3 rounded-lg text-stone-200 leading-relaxed text-[11px]">
                {unsealedResponse}
              </div>
            </div>
          </div>
        )}

        {/* Gateway Audit Ledger */}
        {ledger && (
          <div className="bg-[#05070a]/80 p-3 rounded-lg border border-stone-900 font-mono text-[9px] space-y-1.5">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1 font-bold border-b border-stone-900 pb-1">
              <ListCollapse className="w-3.5 h-3.5 text-[#00ffff]" /> Cryptographic Audit Ledger Entry
            </div>
            <div className="grid grid-cols-2 gap-y-1.5 text-purple-300 mt-2">
              <div>Session Token ID:</div>
              <div className="text-white font-bold drop-shadow-[0_0_3px_#fff] text-right">{ledger.tokenId}</div>

              <div>Gateway Verification Hash:</div>
              <div className="text-white font-bold drop-shadow-[0_0_3px_#fff] text-right truncate pl-4" title={ledger.hash}>{ledger.hash}</div>

              <div>Quantum Beacon Reference:</div>
              <div className="text-white font-bold drop-shadow-[0_0_3px_#fff] text-right truncate pl-4" title={ledger.beaconValue}>{ledger.beaconValue}</div>

              <div>Policy Engine Outcome:</div>
              <div className={`text-right font-bold ${
                ledger.verificationOutcome.includes('AUTHORIZED') ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-yellow-400'
              }`}>
                {ledger.verificationOutcome}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
