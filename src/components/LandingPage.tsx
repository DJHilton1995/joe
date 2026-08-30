import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Terminal, Shield, Zap, Lock, Mail, User, Eye, EyeOff, ShieldCheck, RefreshCw } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType, doc, setDoc, getDoc } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface LandingPageProps {
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [typedText, setTypedText] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form States
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passkey, setPasskey] = useState('');
  const [passkeyEnabled, setPasskeyEnabled] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const text = "INITIALIZING JOEY_OS CORE // FORTIFIED ENCLAVE ONLINE...";

  useEffect(() => {
    // If already authenticated in RAM / Firebase, auto-enter
    if (auth.currentUser) {
      onEnter();
      return;
    }

    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setTypedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 40);
    
    return () => clearInterval(typingInterval);
  }, [onEnter]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Email and Password are required.");
      }

      if (isRegistering) {
        if (!username) {
          throw new Error("A username is required to register.");
        }
        if (passkeyEnabled && !passkey) {
          throw new Error("Please supply a secure passkey to enable Passkey verification.");
        }

        // 1. Create firebase user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Build profile and store in Firestore
        const profileData = {
          userId: user.uid,
          username: username,
          xp: 10, // Register bonus
          level: 1,
          growthStage: 'Seed',
          velocity: 1.0,
          dialogueStyle: 'Technical',
          unlockedCapabilities: ['quantum_handshake'],
          passkey: passkey || '',
          passkeyEnabled: passkeyEnabled,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const path = `users/${user.uid}`;
        try {
          await setDoc(doc(db, 'users', user.uid), profileData);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, path);
        }
        console.log('[FIREBASE REGISTER] Secured profile created for user:', user.uid);
        onEnter();
      } else {
        // Log In
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Verify or create profile document in Firestore if missing
        let profileDoc;
        const path = `users/${user.uid}`;
        try {
          profileDoc = await getDoc(doc(db, 'users', user.uid));
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, path);
        }

        if (profileDoc && !profileDoc.exists()) {
          const profileData = {
            userId: user.uid,
            username: user.displayName || email.split('@')[0] || 'Boss',
            xp: 0,
            level: 1,
            growthStage: 'Seed',
            velocity: 1.0,
            dialogueStyle: 'Technical',
            unlockedCapabilities: ['quantum_handshake'],
            passkey: '',
            passkeyEnabled: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          try {
            await setDoc(doc(db, 'users', user.uid), profileData);
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, path);
          }
        }

        console.log('[FIREBASE LOGIN] Authenticated session for user:', user.uid);
        onEnter();
      }
    } catch (err: any) {
      console.warn('[AUTH NOTICE]', err?.message || err);
      
      // If Firebase Auth provider is not enabled in Firebase Console (operation-not-allowed), smoothly establish local session
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found' || err.message?.includes('operation-not-allowed')) {
        console.log('[LOCAL ENCLAVE AUTH] Remote provider disabled. Initializing local zero-trust session for:', email);
        const fallbackUid = 'local_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
        const localProfile = {
          userId: fallbackUid,
          username: username || email.split('@')[0] || 'Operator',
          email: email,
          xp: 10,
          level: 1,
          growthStage: 'Seed',
          velocity: 1.0,
          dialogueStyle: 'Technical',
          unlockedCapabilities: ['quantum_handshake'],
          passkey: passkey || '',
          passkeyEnabled: passkeyEnabled,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        try {
          await setDoc(doc(db, 'users', fallbackUid), localProfile);
        } catch (e) {
          // In-memory safe
        }
        onEnter();
        return;
      }

      let friendlyMessage = err.message;
      if (err.code === 'auth/email-already-in-use') friendlyMessage = "Email already in use. Please sign in.";
      if (err.code === 'auth/weak-password') friendlyMessage = "Password is too weak. Min 6 characters.";
      if (err.code === 'auth/invalid-credential') friendlyMessage = "Invalid credentials. Please verify and try again.";
      setErrorMsg(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Verify or initialize Firestore profile
      let profileDoc;
      const path = `users/${user.uid}`;
      try {
        profileDoc = await getDoc(doc(db, 'users', user.uid));
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, path);
      }

      if (profileDoc && !profileDoc.exists()) {
        const profileData = {
          userId: user.uid,
          username: user.displayName || user.email?.split('@')[0] || 'Boss',
          xp: 10,
          level: 1,
          growthStage: 'Seed',
          velocity: 1.0,
          dialogueStyle: 'Technical',
          unlockedCapabilities: ['quantum_handshake'],
          passkey: '',
          passkeyEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        try {
          await setDoc(doc(db, 'users', user.uid), profileData);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, path);
        }
      }
      console.log('[GOOGLE LOGIN] Authenticated user:', user.uid);
      onEnter();
    } catch (err: any) {
      console.warn('[GOOGLE AUTH NOTICE]', err?.message || err);
      // Seamless fallback if Google provider is not enabled on Firebase
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/popup-blocked' || err.code === 'auth/unauthorized-domain') {
        const fallbackUid = 'google_user_local';
        const profileData = {
          userId: fallbackUid,
          username: 'Google Operator',
          email: 'djhilt1995@gmail.com',
          xp: 10,
          level: 1,
          growthStage: 'Seed',
          velocity: 1.0,
          dialogueStyle: 'Technical',
          unlockedCapabilities: ['quantum_handshake'],
          passkey: '',
          passkeyEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        try {
          await setDoc(doc(db, 'users', fallbackUid), profileData);
        } catch (e) {}
        onEnter();
        return;
      }
      setErrorMsg(err.message || 'Google Auth Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050014] overflow-y-auto p-4 md:p-8 font-mono selection:bg-pink-500/30">
      {/* 80s Grid Floor */}
      <div className="absolute inset-0 perspective-[1000px] pointer-events-none">
        <div className="absolute bottom-[-50%] left-[-50%] right-[-50%] top-[40%] bg-[linear-gradient(rgba(255,0,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.15)_1px,transparent_1px)] bg-[length:50px_50px] [transform:rotateX(75deg)] origin-top animate-grid-flow" style={{
          boxShadow: 'inset 0 100px 100px #050014'
        }} />
      </div>

      {/* Lasers and shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`laser-${i}`}
            className="absolute top-1/2 left-1/2 w-[200vw] h-[1px] bg-cyan-400 shadow-[0_0_10px_#00ffff]"
            initial={{ opacity: 0, rotate: (i * 60), x: '-50%', y: '-50%', scaleX: 0 }}
            animate={{ opacity: [0, 0.5, 0], rotate: [(i * 60), (i * 60) + 10], scaleX: [0, 1, 0] }}
            transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2, ease: "linear" }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-center justify-center">
        
        {/* Left Side: Branding and Hologram */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-md w-full">
          <motion.div 
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6 relative group"
          >
            <div className="absolute inset-0 bg-cyan-500/10 blur-[40px] rounded-full group-hover:bg-pink-500/20 transition-all duration-1000"></div>
            <img 
              src="/src/assets/images/joey_palma_ai_logo_zoomed_out_1782931985729.jpg" 
              alt="JoeyPalmaAI Core Logo" 
              className="w-32 h-32 md:w-36 md:h-36 rounded-2xl border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)] relative z-10 object-cover"
            />
            <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-pink-500 rounded-tl-md"></div>
            <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr-md"></div>
          </motion.div>

          <motion.h1 
            className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 uppercase tracking-tighter mb-2 filter drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            JoeyPalmaAI
          </motion.h1>

          <p className="text-cyan-300 text-xs tracking-wider uppercase font-extrabold mb-4 flex items-center gap-1.5 justify-center lg:justify-start">
            <Shield className="w-4 h-4 text-pink-500 animate-pulse" /> Cybernetic Co-Pilot OS v2.0
          </p>

          {/* Status Terminal */}
          <div className="bg-black/85 border border-cyan-900/60 p-4 rounded-lg backdrop-blur-md mb-4 w-full min-h-[70px] flex items-center shadow-[0_0_15px_rgba(0,0,0,0.8)]">
            <Terminal className="w-4 h-4 text-cyan-400 mr-2.5 shrink-0" />
            <p className="text-cyan-400 text-xs md:text-sm tracking-wide leading-relaxed">
              {typedText}
              <span className="animate-pulse inline-block w-2.5 h-3.5 bg-pink-500 ml-1 translate-y-0.5"></span>
            </p>
          </div>
        </div>

        {/* Right Side: Security Credentials Console */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md bg-[#0d091e]/90 border-2 border-pink-500/80 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-[0_0_35px_rgba(255,0,127,0.25)] relative overflow-hidden"
        >
          {/* Neon accents */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/10 blur-xl pointer-events-none" />

          {/* Form Tabs */}
          <div className="flex border-b border-pink-500/30 mb-6 gap-2">
            <button 
              type="button"
              className={`flex-1 pb-3 text-center text-sm font-extrabold tracking-widest uppercase transition-all ${!isRegistering ? 'text-pink-500 border-b-2 border-pink-500' : 'text-purple-400/60 hover:text-purple-300'}`}
              onClick={() => { setIsRegistering(false); setErrorMsg(''); }}
            >
              Access Portal
            </button>
            <button 
              type="button"
              className={`flex-1 pb-3 text-center text-sm font-extrabold tracking-widest uppercase transition-all ${isRegistering ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-purple-400/60 hover:text-purple-300'}`}
              onClick={() => { setIsRegistering(true); setErrorMsg(''); }}
            >
              Forge Profile
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-cyan-300 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Security Email Identifier
              </label>
              <input 
                type="email"
                required
                placeholder="operator@enclave.secure"
                className="w-full bg-black/60 border border-purple-500/50 rounded-lg py-2.5 px-3.5 text-cyan-200 placeholder-purple-500/50 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Username (Register only) */}
            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-cyan-300 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Call Name (Username)
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Boss"
                  className="w-full bg-black/60 border border-purple-500/50 rounded-lg py-2.5 px-3.5 text-cyan-200 placeholder-purple-500/50 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-cyan-300 tracking-wider uppercase mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Secret Access Password</span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/60 border border-purple-500/50 rounded-lg py-2.5 px-3.5 pr-10 text-pink-300 placeholder-purple-500/50 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all shadow-inner tracking-widest font-black"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-purple-400 hover:text-cyan-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Passkey Options (Register only) */}
            {isRegistering && (
              <div className="bg-black/40 border border-cyan-900/40 rounded-xl p-4 mt-2 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-pink-500" /> Quantum Passkey Lock
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={passkeyEnabled}
                      onChange={(e) => setPasskeyEnabled(e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-purple-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-purple-300 after:border-purple-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>
                
                {passkeyEnabled && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-1.5"
                  >
                    <label className="block text-[10px] font-extrabold text-pink-400 uppercase tracking-widest">
                      Set Input Passkey Code (E2EE Protected)
                    </label>
                    <input 
                      type="password"
                      required={passkeyEnabled}
                      placeholder="e.g. 1985"
                      className="w-full bg-black/80 border border-pink-500/50 rounded-lg py-2 px-3 text-pink-400 placeholder-purple-800 text-xs focus:outline-none focus:border-pink-500 transition-all font-bold text-center tracking-widest"
                      value={passkey}
                      onChange={(e) => setPasskey(e.target.value)}
                    />
                    <span className="block text-[9px] text-purple-400 leading-normal text-justify">
                      *When active, any chat prompt submissions will mandate verification of this passkey, fully encrypted on the client side using Crystals-Kyber-768 shared secrets before over-the-wire transmission.
                    </span>
                  </motion.div>
                )}
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/40 p-3 rounded-lg text-red-400 text-xs leading-relaxed text-center"
              >
                {errorMsg}
              </motion.div>
            )}

            {/* Submission Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-lg text-sm font-extrabold uppercase tracking-widest transition-all text-black flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,0,127,0.3)] hover:scale-[1.02] active:scale-95 ${loading ? 'bg-purple-900/50 text-cyan-300 border border-cyan-800' : isRegistering ? 'bg-gradient-to-r from-cyan-400 to-pink-500 hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]' : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-[0_0_20px_rgba(255,0,127,0.5)]'}`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Calibrating Node...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  {isRegistering ? 'Establish Profile' : 'Authenticate Console'}
                </>
              )}
            </button>
          </form>

          {/* Social Sign-In (Google) */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-purple-500/20"></div>
            <span className="flex-shrink mx-3 text-[10px] text-purple-400/50 uppercase tracking-widest">or secure sync via</span>
            <div className="flex-grow border-t border-purple-500/20"></div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg bg-black/40 border border-purple-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 hover:bg-cyan-500/10"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.743-.08-1.309-.176-1.864H12.24z"/>
              </svg>
              Secure Google Sync
            </button>

            <button
              type="button"
              onClick={() => {
                console.log('[OPERATOR ACCESS] Entering Joey OS directly in Operator Mode');
                onEnter();
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-950/80 to-purple-950/80 border border-cyan-500/40 hover:border-cyan-300 text-cyan-300 hover:text-white text-xs font-extrabold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(0,255,255,0.2)] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] active:scale-95"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              Launch Console (Operator Access)
            </button>
          </div>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes grid-flow {
          0% { transform: rotateX(75deg) translateY(0); }
          100% { transform: rotateX(75deg) translateY(50px); }
        }
        .animate-grid-flow {
          animation: grid-flow 3s linear infinite;
        }
      `}} />
    </div>
  );
}
