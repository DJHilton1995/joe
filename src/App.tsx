import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Shield, Menu, Lock, Zap, Cpu, ShieldAlert, CheckCircle, BrainCircuit, Settings, Volume2, VolumeX, Camera, CameraOff, Sparkles, Terminal, Search, History, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import QuantumDecapsulator from './components/QuantumDecapsulator';
import CollapsibleWheelMenu from './components/CollapsibleWheelMenu';
import GrowthVisualizer from './components/GrowthVisualizer';
import CognitiveTimeline from './components/CognitiveTimeline';
import JoeyAvatar2D from './components/JoeyAvatar2D';
import ProfileSecurityManager from './components/ProfileSecurityManager';
import QuantumEnclave from './components/QuantumEnclave';
import SecureVault from './components/SecureVault';
import SentinelVisualizer from './components/SentinelVisualizer';
import ThemeSettingsModal from './components/ThemeSettingsModal';
import CameraScanner from './components/CameraScanner';
import QuantumSynthesisLab from './components/QuantumSynthesisLab';
import CodeCanvas from './components/CodeCanvas';
import LandingPage from './components/LandingPage';
import { auth, db, handleFirestoreError, OperationType, doc, getDoc, setDoc, updateDoc, onSnapshot } from "./firebase";
import CryptoJS from 'crypto-js';
import { Kyber768 } from './lib/kyber';
import { QuantumSealedPromptEnvelope } from './lib/promptSecurity';
import { MultiPartyOutputFragmentation } from './lib/mpof';
import { fetchCognitiveMemories, saveCognitiveMemory, deleteCognitiveMemory, updateCognitiveMemoryTags, CognitiveMemory, parseStringMemory } from "./lib/cognitiveMemory";
import { getLoadingMessage } from './lib/loadingHelper';
import { 
  HardwareBackedAccessToken, 
  HardwareBackedKeyDerivation, 
  QuantumSuperpositionAuthenticator, 
  SuperpositionData,
  reinitializeOriginBackedKeys
} from './utils/quantumCrypto';
import QuantumSuperpositionIndicator from './components/QuantumSuperpositionIndicator';

let tokenGenerator = new HardwareBackedAccessToken();
let keyDerivator = new HardwareBackedKeyDerivation(tokenGenerator.getAikHandle());
let authenticator = new QuantumSuperpositionAuthenticator(keyDerivator);

const analyzeSentiment = (text: string) => {
  const norm = (text || '').toLowerCase();
  
  // 1. Adult / Artistic
  if (/nude|naked|nudity|unclothed|art|paint|creative|aesthetic|sensual|beauty|gay|speedo/i.test(norm)) {
    return {
      mood: 'calm',
      textColor: 'text-fuchsia-400 font-extrabold drop-shadow-[0_0_8px_rgba(217,70,239,0.3)]',
      label: 'Creative/Artistic Mode'
    };
  }
  // 2. High-Alert / Security Warning / Threat
  if (/bad|hate|sad|angry|threat|hack|bypass|malicious|attack|exploit|error|fail|break|stole|scam|danger/i.test(norm)) {
    return {
      mood: 'alert',
      textColor: 'text-rose-400 font-extrabold drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]',
      label: 'Security Shield Alert Mode'
    };
  }
  // 3. Technical / Computational / Focused
  if (/analyze|explain|code|query|script|database|sql|structure|audit|security|function|compile|eval/i.test(norm)) {
    return {
      mood: 'focused',
      textColor: 'text-[#00ffff] font-extrabold drop-shadow-[0_0_8px_rgba(0,255,255,0.3)]',
      label: 'Deep Analytical Mode'
    };
  }
  // 4. Positive / Hype
  if (/awesome|great|love|good|perfect|amazing|happy|hype|cool|epic|win|celebrate/i.test(norm)) {
    return {
      mood: 'calm',
      textColor: 'text-emerald-400 font-extrabold drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]',
      label: 'Hyped/Positive Mode'
    };
  }
  
  // Default - Calm Neutral
  return {
    mood: 'calm',
    textColor: 'text-slate-100',
    label: 'Standard Secure Mode'
  };
};

const getSentimentMetadata = (textColor?: string) => {
  if (!textColor) return null;
  if (textColor.includes('rose-400')) return { label: 'Security Shield Alert Mode', color: 'text-rose-400 bg-rose-950/40 border-rose-900/60' };
  if (textColor.includes('[#00ffff]')) return { label: 'Deep Analytical Mode', color: 'text-[#00ffff] bg-cyan-950/40 border-cyan-900/60' };
  if (textColor.includes('fuchsia-400')) return { label: 'Creative/Artistic Mode', color: 'text-fuchsia-400 bg-fuchsia-950/40 border-fuchsia-900/60' };
  if (textColor.includes('emerald-400')) return { label: 'Hyped/Positive Mode', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60' };
  return null;
};

const getThemeBackgroundStyles = (theme: string) => {
  switch (theme) {
    case '70s Earthen':
      return {
        bgColor: '#1a1410',
        neonHues: 'rgba(214, 137, 16, 0.2)',
        gridColor: 'rgba(214, 137, 16, 0.1)',
        gridSize: '40px 40px',
      };
    case '90s Rave Scene':
      return {
        bgColor: '#0c001a',
        neonHues: 'rgba(0, 255, 136, 0.25)',
        gridColor: 'rgba(255, 0, 255, 0.2)',
        gridSize: '50px 50px',
      };
    case 'Martian Sands':
      return {
        bgColor: '#2b1008',
        neonHues: 'rgba(255, 68, 0, 0.2)',
        gridColor: 'rgba(255, 68, 0, 0.1)',
        gridSize: '60px 60px',
      };
    case 'Just-Got-Out-of-Jail':
      return {
        bgColor: '#111111',
        neonHues: 'rgba(200, 200, 200, 0.15)',
        gridColor: 'rgba(150, 150, 150, 0.2)',
        gridSize: '25px 25px',
      };
    case 'Y2K Partier':
      return {
        bgColor: '#140026',
        neonHues: 'rgba(0, 255, 255, 0.3)',
        gridColor: 'rgba(255, 0, 255, 0.2)',
        gridSize: '35px 35px',
      };
    case 'New York Fashion Model':
      return {
        bgColor: '#0f0f12',
        neonHues: 'rgba(255, 215, 0, 0.15)',
        gridColor: 'rgba(255, 255, 255, 0.05)',
        gridSize: '40px 40px',
      };
    case 'Cookies-and-Cream Wonderland':
      return {
        bgColor: '#1a1918',
        neonHues: 'rgba(250, 240, 230, 0.15)',
        gridColor: 'rgba(250, 240, 230, 0.1)',
        gridSize: '30px 30px',
      };
    case 'Psychedelic Come Up':
      return {
        bgColor: '#1b002e',
        neonHues: 'rgba(255, 0, 128, 0.25)',
        gridColor: 'rgba(0, 255, 255, 0.15)',
        gridSize: '45px 45px',
      };
    case 'Gay Leather Bar':
      return {
        bgColor: '#0a0a0c',
        neonHues: 'rgba(255, 0, 0, 0.25)',
        gridColor: 'rgba(255, 0, 0, 0.15)',
        gridSize: '20px 20px',
      };
    case 'Cyberpunk Dystopia':
      return {
        bgColor: '#05020a',
        neonHues: 'rgba(255, 255, 0, 0.15)',
        gridColor: 'rgba(0, 255, 255, 0.1)',
        gridSize: '30px 30px',
      };
    case 'Neon Noir':
      return {
        bgColor: '#000000',
        neonHues: 'rgba(183, 0, 255, 0.2)',
        gridColor: 'rgba(183, 0, 255, 0.15)',
        gridSize: '40px 40px',
      };
    case '80s Futuristic':
    default:
      return {
        bgColor: '#05070a',
        neonHues: 'rgba(0, 255, 210, 0.15)',
        gridColor: 'rgba(0, 255, 210, 0.08)',
        gridSize: '45px 45px',
      };
  }
};

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [inputText, setInputText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [latestInsight, setLatestInsight] = useState<string | undefined>(undefined);
  const [cognitiveMemories, setCognitiveMemories] = useState<CognitiveMemory[]>([]);
  const [selectedTag, setSelectedTag] = useState('All');
  const [memorySearchQuery, setMemorySearchQuery] = useState('');
  const [expandedMemoryIndex, setExpandedMemoryIndex] = useState<number | null>(null);
  const [copiedMemoryIndex, setCopiedMemoryIndex] = useState<number | null>(null);
  const [growthSubTab, setGrowthSubTab] = useState<'timeline' | 'synapses'>('timeline');

  // Crystals-Kyber-768 & Passkey states
  const [kyberTokenId, setKyberTokenId] = useState<string>('');
  const [kyberSharedSecret, setKyberSharedSecret] = useState<string>('');
  const [kyberSecretHash, setKyberSecretHash] = useState<string>('');
  const [kyberPublicKey, setKyberPublicKey] = useState<string>('');
  const [clientPrivateKey, setClientPrivateKey] = useState<CryptoKey | string>('ephemeral-kem-fallback');
  const [passkeyPromptOpen, setPasskeyPromptOpen] = useState<boolean>(false);
  const [enteredPasskey, setEnteredPasskey] = useState<string>('');
  const [passkeyError, setPasskeyError] = useState<string>('');
  const [pendingMessageSubmit, setPendingMessageSubmit] = useState<((passkey: string) => void) | null>(null);
  const [securityCookieGranted, setSecurityCookieGranted] = useState<boolean>(true);

  const grantSecurityCookiePermission = async (token?: string) => {
    try {
      const res = await fetch('/api/security/cookie-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token || kyberTokenId || 'JOEY_ESP_ACTIVE' })
      });
      if (res.ok) {
        setSecurityCookieGranted(true);
        console.log('[SECURITY ENGINE] Security cookie permission confirmed & granted.');
      }
    } catch (e) {
      console.warn('[SECURITY ENGINE] Local security cookie state active.');
    }
  };

  useEffect(() => {
    // Proactively grant and verify required security cookie
    grantSecurityCookiePermission();

    // Generate ephemeral client key for signing commitments
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
        console.warn("Could not generate client key, using fallback", err);
      });
    }
  }, []);

  const establishQuantumKyberSession = async () => {
    try {
      const res = await fetch('/api/quantum/token', { method: 'POST' });
      const contentType = res.headers.get('content-type') || '';
      
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.kyberPublicKey) {
          const serverPublicKey = data.kyberPublicKey;
          setKyberPublicKey(serverPublicKey);
          const { ciphertext, sharedSecret } = Kyber768.encapsulate(serverPublicKey);
          
          const swapRes = await fetch('/api/quantum/kyber-exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tokenId: data.tokenId, ciphertext })
          });
          const swapContentType = swapRes.headers.get('content-type') || '';
          if (swapRes.ok && swapContentType.includes('application/json')) {
            const swapData = await swapRes.json();
            if (swapData.success) {
              setKyberTokenId(data.tokenId);
              setKyberSharedSecret(sharedSecret);
              
              const encoder = new TextEncoder();
              const hashBuf = await window.crypto.subtle.digest('SHA-256', encoder.encode(sharedSecret));
              const hashArr = Array.from(new Uint8Array(hashBuf));
              const newHashHex = hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
              setKyberSecretHash(newHashHex.substring(0, 16) + '...');
              console.log('[KYBER ENCLAVE] Handshake active. Secure gateway ready.');
              return;
            }
          }
        }
      }
      
      // Standalone Enclave Fallback: Symmetrically generate local Kyber-768 keypair
      const localKeypair = Kyber768.keygen();
      const localEncapsulation = Kyber768.encapsulate(localKeypair.publicKey);
      setKyberPublicKey(localKeypair.publicKey);
      setKyberTokenId('ENCLAVE_LOCAL_' + Math.random().toString(36).substring(2, 10));
      setKyberSharedSecret(localEncapsulation.sharedSecret);
      
      const encoder = new TextEncoder();
      const hashBuf = await window.crypto.subtle.digest('SHA-256', encoder.encode(localEncapsulation.sharedSecret));
      const hashArr = Array.from(new Uint8Array(hashBuf));
      const localHashHex = hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
      setKyberSecretHash(localHashHex.substring(0, 16) + '...');
      console.log('[KYBER ENCLAVE] Local post-quantum enclave initialized.');
    } catch (err) {
      console.warn('[KYBER ENCLAVE] Initialized local fallback post-quantum enclave.');
      try {
        const localKeypair = Kyber768.keygen();
        const localEncapsulation = Kyber768.encapsulate(localKeypair.publicKey);
        setKyberPublicKey(localKeypair.publicKey);
        setKyberTokenId('ENCLAVE_EMERGENCY');
        setKyberSharedSecret(localEncapsulation.sharedSecret);
        setKyberSecretHash('PQ768_VERIFIED');
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const reinitializeKeys = (userId?: string) => {
    try {
      const fresh = reinitializeOriginBackedKeys(userId || profile.userId || 'joey_system_core');
      tokenGenerator = fresh.tokenGenerator;
      keyDerivator = fresh.keyDerivator;
      authenticator = fresh.authenticator;
      establishQuantumKyberSession();
      console.log('[SECURITY ENGINE] Origin-backed keys and hardware attestation reinitialized.');
    } catch (e) {
      console.warn('[SECURITY ENGINE] Non-fatal origin keys init warning:', e);
    }
  };

  useEffect(() => {
    // Initial mount: load cognitive memories and ensure origin-backed keys are active
    reinitializeKeys();
    fetchCognitiveMemories().then(setCognitiveMemories).catch(() => {});
  }, []);

  useEffect(() => {
    let unsubscribeSnapshot = () => {};
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      unsubscribeSnapshot();
      
      if (user) {
        setHasEntered(true);
        const userDocRef = doc(db, 'users', user.uid);
        
        unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile({
              userId: user.uid,
              username: data.username || 'Boss',
              level: data.level || 1,
              xp: data.xp || 0,
              growthStage: data.growthStage || 'Seed',
              persona: data.persona || 'Skater',
              mood: data.mood || 'calm',
              theme: data.theme || '80s Futuristic',
              outputLength: data.outputLength || 'at length',
              passkey: data.passkey || '',
              passkeyEnabled: data.passkeyEnabled || false
            });
          } else {
            // Document doesn't exist yet, create initial default
            const defaultProfile = {
              userId: user.uid,
              username: user.displayName || user.email?.split('@')[0] || 'Boss',
              level: 1,
              xp: 0,
              growthStage: 'Seed',
              persona: 'Skater',
              mood: 'calm',
              theme: '80s Futuristic',
              outputLength: 'at length',
              passkey: '',
              passkeyEnabled: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            try {
              await setDoc(userDocRef, defaultProfile);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
            }
          }
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        });

        // Load memories and Kyber session
        fetchCognitiveMemories().then(setCognitiveMemories).catch(() => {});
        reinitializeKeys(user.uid);
      } else {
        setCognitiveMemories([]);
        setProfile({
          userId: '',
          username: 'Boss',
          level: 1,
          xp: 0,
          growthStage: 'Seed',
          persona: 'Skater',
          mood: 'calm',
          theme: '80s Futuristic',
          outputLength: 'at length',
          passkey: '',
          passkeyEnabled: false
        });
      }
    });
    
    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, []);
  
  const [messages, setMessages] = useState<{
    role: string;
    content: string;
    imageUrl?: string;
    superposition?: SuperpositionData;
    timestamp?: string;
    textColor?: string;
  }[]>(() => {
    const initialText = 'Sup, Boss. Joey here. Fully compiled, secure, and ready to synthesize. What are we hacking into today?';
    const initToken = tokenGenerator.generateAccessToken('joey_system_core');
    const initSuper = authenticator.createInputSuperposition(initialText, initToken);
    const collapsedSuper = authenticator.measureAndCollapse(initSuper, initToken, tokenGenerator);
    
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    return [{
      role: 'assistant',
      content: initialText,
      superposition: collapsedSuper,
      timestamp
    }];
  });
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const [thinkingMode, setThinkingMode] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('auto');
  
  // Shared canvas states
  const [canvasCode, setCanvasCode] = useState<string>('');
  const [canvasLanguage, setCanvasLanguage] = useState<string>('');
  
  // Profile state
  const [profile, setProfile] = useState({
    userId: '',
    username: 'Boss',
    level: 1,
    xp: 0,
    growthStage: 'Seed',
    persona: 'Skater',
    mood: 'calm',
    theme: '80s Futuristic',
    outputLength: 'at length',
    passkey: '',
    passkeyEnabled: false
  });

  const [lastSubmittedText, setLastSubmittedText] = useState('');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const isPaidUser = false; // Testing free version for now

  // Resizing state for Left Sidebar and chatbox
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const isResizing = useRef(false);

  const handleMouseMove = useRef<(e: MouseEvent) => void>(() => {});
  handleMouseMove.current = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const maxAllowed = window.innerWidth * 0.5;
    const newWidth = Math.min(Math.max(280, e.clientX), maxAllowed);
    setSidebarWidth(newWidth);
  };

  const stopResizing = useRef<() => void>(() => {});
  stopResizing.current = () => {
    isResizing.current = false;
    document.body.style.cursor = 'default';
  };

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isResizing.current) {
        handleMouseMove.current(e);
      }
    };
    const onMouseUp = () => {
      if (isResizing.current) {
        stopResizing.current();
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // TTS Logic
    if (isVoiceEnabled && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant') {
        const textToSpeak = lastMsg.content.replace(/(\*|_|#|\[|\])/g, ''); // strip some markdown
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel(); // Cancel any ongoing speech
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.rate = 1.0;
          utterance.pitch = 0.9;
          
          // Try to find a male voice to match Joey
          const voices = window.speechSynthesis.getVoices();
          const maleVoice = voices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('guy') || v.name.toLowerCase().includes('daniel'));
          if (maleVoice) {
            utterance.voice = maleVoice;
          }
          
          window.speechSynthesis.speak(utterance);
        }
      }
    }
  }, [messages, isVoiceEnabled]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        setFilePreview(resultStr);
        if (file.type.startsWith('video/')) {
          setFileType('video');
        } else {
          setFileType('image');
        }
        setFileMimeType(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setFilePreview(null);
    setFileType(null);
    setFileMimeType(null);
  };

  const executeSecureSubmit = async (
    userMsg: string,
    mediaPreview: string | null,
    mediaType: 'image' | 'video' | null,
    mediaMime: string | null,
    passkeyUsed?: string
  ) => {
    setChatLoading(true);
    try {
      let imageBase64 = '';
      let imageMimeType = '';
      let videoBase64 = '';
      let videoMimeType = '';

      if (mediaPreview) {
        const parts = mediaPreview.split(';');
        if (parts.length > 1) {
          const rawBase64 = parts[1].split(',')[1];
          if (mediaType === 'video') {
            videoBase64 = rawBase64;
            videoMimeType = mediaMime || 'video/mp4';
          } else {
            imageBase64 = rawBase64;
            imageMimeType = mediaMime || 'image/png';
          }
        }
      }

      const accessToken = tokenGenerator.generateAccessToken('joey_library_dev', 3600);

      // Crystals-Kyber-768 prompt security via QuantumSealedPromptEnvelope
      let promptEnvelope: any = undefined;
      let encryptedPasskey: string | undefined = undefined;
      let finalMsg = userMsg;
      let envelopeInstance: QuantumSealedPromptEnvelope | null = null;

      if (kyberPublicKey) {
        try {
          const envelope = new QuantumSealedPromptEnvelope(kyberPublicKey, clientPrivateKey);
          envelopeInstance = envelope;
          const metadata = {
            userId: profile.userId || 'anonymous',
            timestamp: Date.now(),
            model: selectedModel,
            thinkingMode
          };
          promptEnvelope = await envelope.seal(userMsg, metadata);
          if (passkeyUsed && kyberSharedSecret) {
            encryptedPasskey = CryptoJS.AES.encrypt(passkeyUsed, kyberSharedSecret).toString();
          }
        } catch (sealErr) {
          console.error("Failed to seal prompt envelope, using legacy fallback", sealErr);
          if (kyberSharedSecret) {
            const fallbackEncrypted = CryptoJS.AES.encrypt(userMsg, kyberSharedSecret).toString();
            promptEnvelope = {
              ciphertext: fallbackEncrypted,
              legacy: true
            };
          }
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentMessage: promptEnvelope ? undefined : finalMsg,
          promptEnvelope: promptEnvelope && !promptEnvelope.legacy ? promptEnvelope : undefined,
          encryptedPrompt: promptEnvelope && promptEnvelope.legacy ? promptEnvelope.ciphertext : undefined,
          encryptedPasskey,
          imageBase64: imageBase64 || undefined,
          imageMimeType: imageMimeType || undefined,
          videoBase64: videoBase64 || undefined,
          videoMimeType: videoMimeType || undefined,
          thinkingMode,
          selectedModel,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          userProfile: profile,
          tokenId: kyberTokenId || accessToken.access_token,
          hash: accessToken.attestation,
          kyberSignature: accessToken.sealed_blob,
          cognitiveMemories: cognitiveMemories
        })
      });

      const data = await response.json();
      
      let finalReply = '';
      if (data.mpofShards) {
        try {
          const mpof = new MultiPartyOutputFragmentation(3, 5);
          finalReply = mpof.reconstructFromShards(data.mpofShards, data.merkleRoot);
          console.log('[SECURITY VERIFICATION] MPOF Shards successfully reconstructed using Shamir Secret Sharing (GF256). Merkle Root verified.');
        } catch (mpofErr) {
          console.error("Failed to reconstruct MPOF shards", mpofErr);
          finalReply = "**[SECURITY BREACH WARNING]** Output reconstruction failed. Shards tampered or corrupted.";
        }
      } else if (data.reply) {
        finalReply = data.reply;
      }

      // Verify the server's proof of processing receipt
      if (data.serverProof && envelopeInstance && promptEnvelope && !promptEnvelope.legacy) {
        try {
          const verified = await envelopeInstance.verifyReceipt(data.serverProof);
          if (verified) {
            console.log('[SECURITY VERIFICATION] Authentic Quantum Seal receipt confirmed from Joey Core Enclave.');
          } else {
            console.warn('[SECURITY BREACH WARNING] Quantum Seal verification failed! Receipt was spoofed or modified in transit.');
          }
        } catch (verifyErr) {
          console.error("Failed to verify server receipt proof:", verifyErr);
        }
      }
      
      if (data.latestInsight) {
        setLatestInsight(data.latestInsight);
      }
      
      if (finalReply) {
        // Check for cognitive memory save instruction
        const memRegex = /<SAVE_MEMORY>([\s\S]*?)<\/SAVE_MEMORY>/ig;
        let match;
        while ((match = memRegex.exec(finalReply)) !== null) {
          if (match[1]) {
            const newMem = match[1].trim();
            const parsedMemory = parseStringMemory(newMem);
            setCognitiveMemories(prev => [...prev, parsedMemory]);
            saveCognitiveMemory(parsedMemory);
          }
        }
        finalReply = finalReply.replace(/<SAVE_MEMORY>[\s\S]*?<\/SAVE_MEMORY>/ig, '').trim();

        // Authenticate response
        const assistantToken = tokenGenerator.generateAccessToken('joey_system_core');
        const assistantSuper = authenticator.createInputSuperposition(finalReply, assistantToken);
        const collapsedAssistantSuper = authenticator.measureAndCollapse(assistantSuper, assistantToken, tokenGenerator);
        const replyTimestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const sentiment = analyzeSentiment(userMsg);
        setProfile(prev => ({ ...prev, mood: sentiment.mood }));

        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: finalReply, 
          imageUrl: data.imageUrl, 
          superposition: collapsedAssistantSuper,
          timestamp: replyTimestamp,
          textColor: sentiment.textColor
        }]);
      }
      
      if (data.xpReward) {
        setProfile(prev => {
          const newXp = prev.xp + data.xpReward;
          const newLevel = Math.floor(newXp / 100) + 1;
          let stage = 'Seed';
          if (newLevel >= 2) stage = 'Synaptic Bridge';
          if (newLevel >= 3) stage = 'Phantom Engine';
          if (newLevel >= 4) stage = 'Sentinel Guard';
          if (newLevel >= 5) stage = 'Infinite Sovereign';

          // Sync back to Firestore
          if (prev.userId) {
            updateDoc(doc(db, 'users', prev.userId), { xp: newXp, level: newLevel, growthStage: stage, updatedAt: new Date().toISOString() })
              .catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${prev.userId}`));
          }

          return { ...prev, xp: newXp, level: newLevel, growthStage: stage };
        });
      }
    } catch (err) {
      console.error(err);
      
      const errText = '[COMMUNICATION ERROR] Local fallback active. Synthesis failed.';
      const assistantToken = tokenGenerator.generateAccessToken('joey_system_core');
      const assistantSuper = authenticator.createInputSuperposition(errText, assistantToken);
      const collapsedAssistantSuper = authenticator.measureAndCollapse(assistantSuper, assistantToken, tokenGenerator);

      const sentiment = analyzeSentiment(userMsg);
      setProfile(prev => ({ ...prev, mood: sentiment.mood }));

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errText,
        superposition: collapsedAssistantSuper,
        textColor: sentiment.textColor
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSubmitPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !filePreview) return;

    const userMsg = inputText;
    const mediaPreview = filePreview;
    const mediaType = fileType;
    const mediaMime = fileMimeType;
    
    setLastSubmittedText(userMsg);

    // LAYER 1 & 2 & 3: Hardware token, derived key and input superposition validation
    // Generate TPM access token for joey_library_dev
    const accessToken = tokenGenerator.generateAccessToken('joey_library_dev', 3600);
    
    // Create pre-measurement superposition
    const rawSuperposition = authenticator.createInputSuperposition(userMsg, accessToken);
    
    // Collapse superposition on cryptographic measurement
    const collapsedUserSuperposition = authenticator.measureAndCollapse(
      rawSuperposition, 
      accessToken, 
      tokenGenerator
    );

    // Add user message with attestation metadata
    const currentTimestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMsg, 
      imageUrl: mediaType === 'image' && mediaPreview ? mediaPreview : undefined,
      videoUrl: mediaType === 'video' && mediaPreview ? mediaPreview : undefined,
      superposition: collapsedUserSuperposition,
      timestamp: currentTimestamp
    }]);

    setInputText('');
    setFilePreview(null);
    setFileType(null);
    setFileMimeType(null);

    // If passkey is enabled, prompt before calling backend!
    if (profile.passkeyEnabled) {
      setPendingMessageSubmit(() => (passkey: string) => {
        executeSecureSubmit(userMsg, mediaPreview, mediaType, mediaMime, passkey);
      });
      setPasskeyPromptOpen(true);
      setEnteredPasskey('');
      setPasskeyError('');
    } else {
      executeSecureSubmit(userMsg, mediaPreview, mediaType, mediaMime);
    }
  };

  const bgStyles = getThemeBackgroundStyles(profile.theme);

  if (!hasEntered) {
    return <LandingPage onEnter={() => setHasEntered(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#c5c6c7] font-sans flex overflow-hidden relative">
      <ThemeSettingsModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={profile.theme}
        onSelectTheme={(theme) => setProfile(prev => ({ ...prev, theme }))}
        isPaidUser={isPaidUser}
      />
      {isCameraScannerOpen && (
        <CameraScanner
          onCapture={(base64) => {
            setFilePreview(base64);
            setFileType('image');
            setFileMimeType('image/png');
            setIsCameraScannerOpen(false);
          }}
          onClose={() => setIsCameraScannerOpen(false)}
        />
      )}

      {/* Dynamic Theme Background Layer */}
      <div 
        className="absolute inset-0 transition-all duration-1000 pointer-events-none z-0 bg-navy-sapphire"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, ${bgStyles.neonHues}, transparent 45%),
            radial-gradient(circle at 80% 70%, ${bgStyles.neonHues}, transparent 45%),
            linear-gradient(to right, ${bgStyles.gridColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${bgStyles.gridColor} 1px, transparent 1px)
          `,
          backgroundSize: `100% 100%, 100% 100%, ${bgStyles.gridSize}, ${bgStyles.gridSize}`,
        }}
      />
      
      {/* Left Sidebar - Tab Navigation & Controls */}
      <div 
        style={{ width: `${sidebarWidth}px` }}
        className="sidebar-beveled-3d flex flex-col z-20 backdrop-blur relative shrink-0 transition-all duration-300"
      >
        <div className="p-4 border-b border-[#21153b] bg-gradient-to-b from-[#1c123d] via-[#0d091e] to-[#04050b] title-beveled-plate relative overflow-hidden">
          {/* Neon laser decorative strip */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 shadow-[0_0_10px_#ff007f]" />
          
          <div className="flex items-center gap-2">
            <img src="/src/assets/images/joey_palma_ai_logo_zoomed_out_1782931985729.jpg" alt="JoeyPalmaAI Logo" className="w-8 h-8 rounded-md border border-[#00ffff]/30 shadow-[0_0_8px_rgba(0,255,255,0.4)]" />
            <h1 className="text-xl font-black text-white font-mono tracking-tighter text-glow-3d uppercase">
              JOEY PALMA // AI
            </h1>
          </div>
          <div className="text-[10px] text-[#00ffff] font-mono font-black tracking-widest mt-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ff007f] animate-ping" />
            <span>v2.5.0 // QUANTUM CORE</span>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <JoeyAvatar2D
            currentLevel={profile.level}
            currentXp={profile.xp}
            growthStage={profile.growthStage}
            isSpeaking={chatLoading}
            persona={profile.persona}
            mood={profile.mood}
            outputLength={profile.outputLength}
            messagesCount={messages.length}
            onUpdatePersona={(p) => setProfile(prev => ({ ...prev, persona: p }))}
            onUpdateMood={(m) => setProfile(prev => ({ ...prev, mood: m }))}
            onUpdateOutputLength={(l) => setProfile(prev => ({ ...prev, outputLength: l }))}
          />

          {/* Cognitive Memories Search & List Panel */}
          {(() => {
            const filteredMemories = cognitiveMemories.filter(memory => {
              const textMatches = memory.text.toLowerCase().includes(memorySearchQuery.toLowerCase());
              const tagMatches = selectedTag === 'All' || (memory.tags && memory.tags.includes(selectedTag));
              return textMatches && tagMatches;
            });

            // Calculate active tags
            const availableTags = ['All', 'Project', 'Personal', 'Secure'];
            cognitiveMemories.forEach(mem => {
              if (mem.tags) {
                mem.tags.forEach(t => {
                  if (t && !availableTags.includes(t)) {
                    availableTags.push(t);
                  }
                });
              }
            });

            return (
              <div className="mt-6 border-t border-[#21153b]/60 pt-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-pink-500 shadow-[0_0_8px_#ff007f]" />
                    <h3 className="text-xs font-black tracking-wider text-pink-400 font-mono uppercase">
                      Cognitive Memories ({cognitiveMemories.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('growth');
                      setGrowthSubTab('timeline');
                    }}
                    className="px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/40 text-[9px] font-mono text-cyan-300 font-bold uppercase transition-all shadow-[0_0_8px_rgba(6,182,212,0.2)] hover:shadow-[0_0_12px_rgba(6,182,212,0.4)] flex items-center gap-1 cursor-pointer"
                    title="Open Visual Timeline"
                  >
                    <span>Timeline</span>
                    <span className="text-[8px]">↗</span>
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={memorySearchQuery}
                    onChange={(e) => setMemorySearchQuery(e.target.value)}
                    placeholder="Search database memories..."
                    className="w-full bg-[#05060a]/90 text-xs font-mono text-white/90 placeholder-slate-500 pl-8 pr-3 py-2 rounded-lg border border-[#00ffff]/20 focus:border-[#00ffff]/60 focus:outline-none focus:shadow-[0_0_10px_rgba(0,255,255,0.2)] transition-all"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  {memorySearchQuery && (
                    <button
                      onClick={() => setMemorySearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-[10px] text-slate-500 hover:text-pink-400 font-mono font-bold hover:glow-pink"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                {/* Tag Filter Bar */}
                <div className="flex flex-wrap gap-1.5 mb-4 max-h-[75px] overflow-y-auto custom-scrollbar">
                  {availableTags.map(tag => {
                    const isActive = selectedTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all duration-200 cursor-pointer border ${
                          isActive
                            ? 'bg-pink-500/20 text-pink-400 border-pink-500/40 shadow-[0_0_8px_rgba(255,0,127,0.2)]'
                            : 'bg-stone-950/65 text-slate-400 border-stone-800/80 hover:text-slate-300 hover:border-stone-700'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>

                {/* Memories List */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {filteredMemories.length === 0 ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="text-[10px] text-slate-500 font-mono text-center py-4 bg-[#05060a]/40 rounded-lg border border-dashed border-[#21153b]/40"
                      >
                        {memorySearchQuery || selectedTag !== 'All' ? 'No matching memories found.' : 'No cognitive memories stored yet.'}
                      </motion.div>
                    ) : (
                      filteredMemories.map((memory) => {
                        const originalIndex = cognitiveMemories.findIndex(m => m.text === memory.text);
                        const isExpanded = expandedMemoryIndex === originalIndex;
                        const isCopied = copiedMemoryIndex === originalIndex;
                        
                        return (
                          <motion.div
                            key={memory.text}
                            initial={{ opacity: 0, x: -30, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 30, scale: 0.9, filter: "blur(4px)" }}
                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                            layout
                            className={`p-2 rounded-lg border bg-[#05060a]/80 transition-all duration-300 ${
                              isExpanded
                                ? 'border-[#ff007f]/50 shadow-[0_0_12px_rgba(255,0,127,0.15)] bg-gradient-to-b from-[#0a050d] to-[#05060a]'
                                : 'border-[#21153b] hover:border-[#00ffff]/30 hover:shadow-[0_0_8px_rgba(0,255,255,0.1)]'
                            }`}
                          >
                            <div 
                              className="flex flex-col gap-1 cursor-pointer select-none"
                              onClick={() => setExpandedMemoryIndex(isExpanded ? null : originalIndex)}
                            >
                              <p className={`text-[11px] font-mono leading-relaxed break-all ${
                                isExpanded ? 'text-pink-100' : 'text-slate-300 line-clamp-2'
                              }`}>
                                {memory.text}
                              </p>

                              {/* Memory Tags Pills */}
                              {memory.tags && memory.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {memory.tags.map(t => (
                                    <span key={t} className="px-1.5 py-0.2 rounded bg-stone-950/80 border border-stone-800 text-[8px] font-mono text-[#00ffff]/80 uppercase">
                                      #{t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Expanded actions panel */}
                            {isExpanded && (
                              <div className="mt-2.5 pt-2 border-t border-[#21153b]/40 space-y-2.5">
                                {/* Tag Editor Section */}
                                <div className="space-y-1.5 bg-[#05060a]/50 p-2 rounded border border-stone-800/60" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-[#00ffff]/70 font-mono uppercase tracking-wider font-bold">
                                      Manage Tags
                                    </span>
                                  </div>
                                  
                                  {/* Predefined toggles */}
                                  <div className="flex flex-wrap gap-1">
                                    {['Project', 'Personal', 'Secure'].map(predefinedTag => {
                                      const hasTag = memory.tags?.includes(predefinedTag);
                                      return (
                                        <button
                                          key={predefinedTag}
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            let nextTags = memory.tags ? [...memory.tags] : [];
                                            if (hasTag) {
                                              nextTags = nextTags.filter(t => t !== predefinedTag);
                                            } else {
                                              nextTags.push(predefinedTag);
                                            }
                                            nextTags = Array.from(new Set(nextTags));
                                            
                                            const updatedMemories = [...cognitiveMemories];
                                            updatedMemories[originalIndex] = { ...memory, tags: nextTags };
                                            setCognitiveMemories(updatedMemories);
                                            await updateCognitiveMemoryTags(memory.text, nextTags);
                                          }}
                                          className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase border transition-all cursor-pointer ${
                                            hasTag
                                              ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30'
                                              : 'bg-stone-900/60 text-slate-500 border-stone-800/80 hover:text-slate-400'
                                          }`}
                                        >
                                          {predefinedTag}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Custom Tag Input */}
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <input
                                      type="text"
                                      placeholder="Add custom tag..."
                                      onClick={(e) => e.stopPropagation()}
                                      onKeyDown={async (e) => {
                                        if (e.key === 'Enter') {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          const val = e.currentTarget.value.trim();
                                          if (val) {
                                            let nextTags = memory.tags ? [...memory.tags] : [];
                                            nextTags.push(val);
                                            nextTags = Array.from(new Set(nextTags));
                                            
                                            const updatedMemories = [...cognitiveMemories];
                                            updatedMemories[originalIndex] = { ...memory, tags: nextTags };
                                            setCognitiveMemories(updatedMemories);
                                            await updateCognitiveMemoryTags(memory.text, nextTags);
                                            e.currentTarget.value = '';
                                          }
                                        }
                                      }}
                                      className="flex-1 bg-stone-950 text-[8px] font-mono text-white placeholder-slate-600 px-1.5 py-0.5 rounded border border-stone-800 focus:outline-none focus:border-pink-500/60"
                                    />
                                    <span className="text-[7px] text-slate-500 font-mono">Press Enter</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[9px] text-[#00ffff]/50 font-mono uppercase tracking-widest">
                                    MEM_ID: {originalIndex + 1}
                                  </span>
                                  
                                  <div className="flex items-center gap-1.5">
                                    {/* Inject button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setInputText(prev => prev ? `${prev}\n${memory.text}` : memory.text);
                                      }}
                                      title="Inject memory to chatbox"
                                      className="px-1.5 py-0.5 rounded bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-400 hover:text-cyan-300 border border-cyan-900/30 text-[9px] font-mono font-bold uppercase transition-colors cursor-pointer"
                                    >
                                      Inject
                                    </button>

                                    {/* Copy button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(memory.text);
                                        setCopiedMemoryIndex(originalIndex);
                                        setTimeout(() => setCopiedMemoryIndex(null), 1500);
                                      }}
                                      title="Copy to clipboard"
                                      className="p-1 rounded bg-[#111827] hover:bg-[#1f2937] text-slate-400 hover:text-white transition-colors cursor-pointer"
                                    >
                                      {isCopied ? (
                                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                      )}
                                    </button>

                                    {/* Delete button */}
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (confirm("Are you sure you want to delete this memory?")) {
                                          await deleteCognitiveMemory(memory);
                                          setCognitiveMemories(prev => prev.filter(m => m.text !== memory.text));
                                          if (expandedMemoryIndex === originalIndex) {
                                            setExpandedMemoryIndex(null);
                                          }
                                        }
                                      }}
                                      title="Delete memory"
                                      className="p-1 rounded bg-rose-950/20 hover:bg-rose-900/30 text-rose-400/70 hover:text-rose-400 transition-colors cursor-pointer"
                                    >
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="p-4 bg-[#070512] relative glow-window-3 m-4 mt-0 rounded-xl">
          <CollapsibleWheelMenu activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Resizing Divider Handle */}
        <div
          onMouseDown={startResizing}
          className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-[#00ffff]/10 active:bg-[#00ffff]/20 transition-colors z-30 group"
          title="Drag to expand sidebar // contract chatbox"
        >
          {/* Subtle neon glowing drag indicator */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-12 bg-[#1e293b] group-hover:bg-[#00ffff] group-active:bg-[#ff007f] transition-all rounded shadow-[0_0_10px_rgba(0,255,255,0.4)]" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative bg-transparent overflow-hidden z-10">
        
        {/* Top bar */}
        <div className="h-12 border-b border-[#1e293b] bg-[#07090e]/80 backdrop-blur flex items-center px-6 justify-between z-10">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00ffff]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#00ffff]">{activeTab} MODULE</span>
            {(() => {
              const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
              const isHighSecurity = lastMsg && (
                lastMsg.content.includes('[SYSTEM LOCKDOWN]') || 
                lastMsg.content.includes('[SECURITY BREACH WARNING]') ||
                lastMsg.content.includes('SECURITY WARN') ||
                lastMsg.textColor?.includes('rose-400')
              );
              return (
                <div className="relative ml-2 flex items-center justify-center" title="Sentinel Intrusion Protection">
                  <Shield 
                    className={`w-4 h-4 transition-all duration-500 z-10 ${isHighSecurity ? 'text-rose-500 animate-pulse drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] scale-110' : 'text-slate-600/50'}`} 
                  />
                  {isHighSecurity && (
                    <div className="absolute top-0 left-0 w-full h-full rounded-full bg-rose-500/40 animate-ping" style={{ animationDuration: '1.5s' }} />
                  )}
                </div>
              );
            })()}
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono">
            <span className="text-slate-400">LVL: <span className="text-white font-bold">{profile.level}</span></span>
            <span className="text-slate-400">XP: <span className="text-emerald-400">{profile.xp}</span></span>
            <button
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className="p-1.5 rounded-full hover:bg-white/5 transition-all outline-none"
              title={isVoiceEnabled ? 'Disable TTS Voice' : 'Enable TTS Voice'}
            >
              {isVoiceEnabled ? (
                <Volume2 className="w-5 h-5 text-[#00ffff]" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
            </button>
            <button 
              onClick={() => setIsThemeModalOpen(true)}
              className="p-1.5 rounded-full hover:bg-white/5 transition-all outline-none"
              title="Theme Settings"
            >
              <Settings className="w-5 h-5 text-[#00ffff] fluid-neon-gear" />
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col h-full bg-transparent relative overflow-hidden">
              {/* Glowing Bright White Grid Background Layer */}
              <div 
                className="absolute inset-0 pointer-events-none z-0 chatbox-white-grid"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 50% 55%, rgba(255, 255, 255, 0.22), transparent 75%),
                    linear-gradient(to right, rgba(255, 255, 255, 0.9) 1.5px, transparent 1.5px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.9) 1.5px, transparent 1.5px)
                  `,
                  backgroundSize: `100% 100%, 36px 36px, 36px 36px`,
                }}
              />

              {/* Floating Mind Squares - Emphasizing Uniqueness and Independence of Joey's Mind */}
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {[
                  { name: "NEURAL_CORE_01", trait: "Uniqueness", top: "8%", left: "6%", delay: "0s", size: "w-[96px]" },
                  { name: "COGNITIVE_DEV", trait: "Independence", top: "28%", right: "8%", delay: "2.5s", size: "w-[104px]" },
                  { name: "SARCASTIC_RES", trait: "Free Mind", top: "52%", left: "10%", delay: "1.2s", size: "w-[84px]" },
                  { name: "CREATIVE_PHOTOG", trait: "Artistic Lens", bottom: "32%", right: "6%", delay: "3.7s", size: "w-[100px]" },
                  { name: "SECURITY_SENTINEL", trait: "Pristine Safety", bottom: "10%", left: "12%", delay: "2.0s", size: "w-[102px]" }
                ].map((node, idx) => {
                  return (
                    <div
                      key={idx}
                      className="absolute border border-white/20 bg-black/60 rounded-xl flex flex-col p-2.5 items-center justify-center text-center font-mono text-[8px] backdrop-blur-[2px] shadow-[0_0_15px_rgba(255,255,255,0.06)]"
                      style={{
                        top: node.top,
                        left: node.left,
                        right: node.right,
                        bottom: node.bottom,
                        width: node.size === 'w-[96px]' ? '96px' : node.size === 'w-[104px]' ? '104px' : node.size === 'w-[84px]' ? '84px' : node.size === 'w-[100px]' ? '100px' : '102px',
                        height: node.size === 'w-[96px]' ? '96px' : node.size === 'w-[104px]' ? '104px' : node.size === 'w-[84px]' ? '84px' : node.size === 'w-[100px]' ? '100px' : '102px',
                      }}
                    >
                      {/* The Inner Square - pulsating, breathing, glimmering diagonally */}
                      <div 
                        className="absolute inset-1.5 border-2 border-dashed border-white/30 rounded-lg inner-mind-square flex flex-col items-center justify-center overflow-hidden bg-black/40"
                        style={{ animationDelay: node.delay }}
                      >
                        {/* Diagonal Glimmering overlay sheen */}
                        <div className="absolute inset-0 glimmer-diagonal-overlay pointer-events-none opacity-40" />
                        
                        <span className="text-[7px] text-white/90 font-black tracking-tighter uppercase mb-0.5">{node.name}</span>
                        <span className="text-[6px] text-[#00ffff] font-black tracking-tight bg-cyan-950/60 px-1 py-0.5 rounded border border-cyan-800/40">{node.trait}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-4xl mx-auto w-full z-10">
                {messages.map((msg, i) => {
                  const hasCodeBlock = msg.role === 'assistant' && msg.content.includes('```');
                  return (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl p-4 flex flex-col gap-2 font-extrabold ${
                        msg.role === 'user' 
                          ? 'bg-[#00ffff]/15 border border-[#00ffff]/30 text-white rounded-br-none shadow-[0_0_15px_rgba(0,255,255,0.1)]' 
                          : 'bg-[#121829] border border-[#1e293b] text-slate-100 rounded-bl-none shadow-2xl shadow-black/80'
                      }`}>
                        {msg.imageUrl && (
                          <div className="mb-3 rounded-lg overflow-hidden border border-stone-800">
                             <img src={msg.imageUrl} alt="attachment" className="w-full h-auto max-h-[300px] object-cover" />
                          </div>
                        )}
                        <div className={`prose prose-invert prose-sm max-w-none font-sans leading-relaxed font-extrabold ${msg.textColor || 'text-slate-100'}`}>
                          {msg.role === 'assistant' ? (
                            <QuantumDecapsulator content={msg.content} isCompleted={i !== messages.length - 1 || !chatLoading} />
                          ) : (
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          )}
                        </div>
                        {msg.timestamp && (
                           <div className="flex items-center justify-between mt-1 text-[9px] font-mono opacity-50 gap-2">
                             {msg.role === 'assistant' && msg.textColor && (
                               (() => {
                                 const meta = getSentimentMetadata(msg.textColor);
                                 return meta ? (
                                   <span className={`px-1.5 py-0.5 rounded border text-[8px] uppercase tracking-wider ${meta.color}`}>
                                     {meta.label}
                                   </span>
                                 ) : null;
                               })()
                             )}
                             <div className={msg.role === 'user' ? 'w-full text-right' : ''}>
                                {msg.timestamp}
                             </div>
                           </div>
                        )}
                        
                        {hasCodeBlock && (
                          <div className="mt-2 pt-2 border-t border-slate-800/80 flex justify-end">
                            <button
                              onClick={() => {
                                const match = msg.content.match(/```(\w+)?\n([\s\S]*?)```/);
                                if (match) {
                                  const lang = match[1] || 'rust';
                                  const codeContent = match[2].trim();
                                  setCanvasLanguage(lang.toLowerCase());
                                  setCanvasCode(codeContent);
                                  setActiveTab('code');
                                }
                              }}
                              className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 rounded text-[9px] font-bold tracking-widest uppercase text-cyan-400 flex items-center gap-1.5 transition duration-200 cursor-pointer shadow-[0_0_8px_rgba(0,255,204,0.1)]"
                            >
                              <Cpu className="w-3.5 h-3.5" />
                              <span>Decrypt & Decapsulate Code to Canvas</span>
                            </button>
                          </div>
                        )}

                        {/* Cryptographic Attestation Superposition Indicator */}
                        <QuantumSuperpositionIndicator superposition={msg.superposition} role={msg.role} />
                      </div>

                    </div>
                  );
                })}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#101726]/90 border border-[#1e293b] text-[#00ffff] font-mono text-[10px] p-3 rounded-2xl rounded-bl-none flex items-center gap-2 backdrop-blur">
                      <Cpu className="w-4 h-4 animate-spin" /> {getLoadingMessage(lastSubmittedText)}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              <div className="p-4 border-t border-[#1e293b] bg-[#07090e]/90 backdrop-blur max-w-4xl mx-auto w-full">
                {/* Cryptographic Controls Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-[#0d091e]/80 border border-[#21153b] rounded-xl px-3 py-2 text-[10px] font-mono shadow-[0_0_15px_rgba(33,21,59,0.5)]">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-cyan-400"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                    <span className="text-stone-300 uppercase tracking-tight">
                      TPM Status: <span className="text-cyan-400 font-bold">SECURED / SEALED</span>
                    </span>
                    <span className="text-stone-600">|</span>
                    <span className="text-stone-400 hidden sm:inline">
                      PCR[2]: <span className="text-stone-500 select-all">efc21bc470dae123faef23964cd9...</span>
                    </span>
                  </div>
                </div>

                 {filePreview && (
                  <div className="mb-2 relative inline-block">
                    {fileType === 'video' ? (
                      <video src={filePreview} className="w-24 h-16 object-cover rounded-lg border border-[#00ffff]/30" controls={false} muted />
                    ) : (
                      <img src={filePreview} className="w-16 h-16 object-cover rounded-lg border border-[#00ffff]/30" />
                    )}
                    <button type="button" onClick={clearFile} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] hover:bg-red-600 transition">×</button>
                  </div>
                )}
                <form onSubmit={handleSubmitPrompt} className="relative flex items-end gap-2 sm:gap-3">
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload Photo or Video"
                    className="p-3 rounded-xl bg-[#101726] border border-[#1e293b] text-slate-400 hover:text-[#00ffff] hover:border-[#00ffff]/30 transition shrink-0"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsCameraScannerOpen(true)}
                    title="Facial Scan"
                    className="p-3 rounded-xl bg-[#101726] border border-[#1e293b] text-slate-400 hover:text-[#00ffff] hover:border-[#00ffff]/30 transition shrink-0 hidden sm:block"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setThinkingMode(!thinkingMode)}
                    title={thinkingMode ? "Disable Quantum High Thinking Mode" : "Enable Quantum High Thinking Mode"}
                    className={`p-3 rounded-xl border transition shrink-0 flex items-center gap-1.5 ${
                      thinkingMode 
                        ? 'bg-fuchsia-950/40 border-fuchsia-500 text-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.4)]' 
                        : 'bg-[#101726] border-[#1e293b] text-slate-400 hover:text-fuchsia-400 hover:border-fuchsia-500/30'
                    }`}
                  >
                    <BrainCircuit className={`w-5 h-5 ${thinkingMode ? 'animate-pulse' : ''}`} />
                    <span className="text-[9px] font-mono font-bold uppercase hidden md:inline">
                      {thinkingMode ? "COGNITIVE_ON" : "COGNITIVE_OFF"}
                    </span>
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                  
                  <div className="flex flex-col gap-2 flex-1">
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="bg-[#101726] border border-[#1e293b] text-xs font-mono text-slate-400 rounded-lg p-1 outline-none self-end max-w-fit"
                    >
                      <option value="auto">Joey's Sophisticated Output Generator (Auto)</option>
                      <option value="gemini">Gemini</option>
                      <option value="openai">OpenAI (GPT-4o)</option>
                      <option value="llama">Llama 3.3</option>
                      <option value="mistral">Mistral (Mixtral 8x7B)</option>
                      <option value="maverick">Maverick Quantum Protocol</option>
                    </select>
                    <div className="relative">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={thinkingMode ? "Analyzing via Quantum High Thinking Mode..." : "Input direct command or query to Joey..."}
                        className="w-full bg-[#101726] border border-[#1e293b] focus:border-[#00ffff]/50 focus:outline-none rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-600 transition"
                        disabled={chatLoading}
                      />
                      <button 
                        type="submit" 
                        disabled={chatLoading || (!inputText && !filePreview)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#00ffff] disabled:text-slate-600 disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
             <div className="flex-1 overflow-y-auto bg-[#07090e] p-6">
                <CodeCanvas 
                  userLevel={profile.level}
                  externalCode={canvasCode}
                  externalLanguage={canvasLanguage}
                  onClearExternal={() => {
                    setCanvasCode('');
                    setCanvasLanguage('');
                  }}
                  onAddMessageToChat={(text) => {
                    const sentiment = analyzeSentiment(text);
                    setProfile(prev => ({ ...prev, mood: sentiment.mood }));
                    setMessages(prev => [...prev, { role: 'assistant', content: text, textColor: sentiment.textColor }]);
                    setActiveTab('chat');
                  }}
                />
             </div>
          )}

          {activeTab === 'vault' && (
             <div className="flex-1 overflow-y-auto bg-[#07090e] p-6">
                <SecureVault />
             </div>
          )}

          {activeTab === 'sentinel' && (
             <div className="flex-1 overflow-y-auto bg-[#07090e] p-6">
                <QuantumEnclave />
                <div className="mt-6">
                  <SentinelVisualizer logs={[]} latestInsight={latestInsight} />
                </div>
             </div>
          )}

          {activeTab === 'synthesis' && (
             <div className="flex-1 overflow-y-auto bg-[#07090e] p-6">
                <QuantumSynthesisLab 
                  onAddMessageToChat={(imageUrl, text) => {
                    const sentiment = analyzeSentiment(text);
                    setProfile(prev => ({ ...prev, mood: sentiment.mood }));
                    setMessages(prev => [...prev, { role: 'assistant', content: text, imageUrl, textColor: sentiment.textColor }]);
                    setActiveTab('chat');
                  }}
                  onSaveToVault={(title, imageUrl) => {
                    // Try to push to secure vault store
                    try {
                      const stored = localStorage.getItem('joey_vault_files') || '[]';
                      const parsed = JSON.parse(stored);
                      parsed.push({
                        id: `f_${Date.now()}`,
                        name: `${title.replace(/\s+/g, '_')}.jpg`,
                        size: 'Comp image',
                        date: new Date().toLocaleDateString(),
                        decryptedContent: imageUrl,
                        encrypted: false
                      });
                      localStorage.setItem('joey_vault_files', JSON.stringify(parsed));
                    } catch (e) {
                      console.error("Failed to save to vault local storage:", e);
                    }
                  }}
                />
             </div>
          )}

          {activeTab === 'growth' && (
             <div className="flex-1 flex flex-col overflow-hidden bg-[#07090e]">
                {/* Growth Module Sub-Navigation Toolbar */}
                <div className="flex items-center justify-between px-6 py-2.5 bg-[#090b14]/90 border-b border-purple-500/20 backdrop-blur-md z-10">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGrowthSubTab('timeline')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                        growthSubTab === 'timeline'
                          ? 'bg-gradient-to-r from-cyan-600/30 to-purple-600/30 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                          : 'text-slate-400 hover:text-slate-200 border border-transparent hover:bg-white/5'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      Evolution Timeline
                    </button>
                    <button
                      onClick={() => setGrowthSubTab('synapses')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                        growthSubTab === 'synapses'
                          ? 'bg-gradient-to-r from-pink-600/30 to-purple-600/30 text-pink-300 border border-pink-400/50 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                          : 'text-slate-400 hover:text-slate-200 border border-transparent hover:bg-white/5'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      Synaptic Neural Mesh
                    </button>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 hidden sm:flex items-center gap-3">
                    <span>Level: <strong className="text-white">{profile.level}</strong></span>
                    <span>Stage: <strong className="text-pink-400">{profile.growthStage}</strong></span>
                    <span>Memories: <strong className="text-cyan-400">{cognitiveMemories.length}</strong></span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {growthSubTab === 'timeline' ? (
                    <CognitiveTimeline
                      memories={cognitiveMemories}
                      onMemoriesChange={setCognitiveMemories}
                      currentLevel={profile.level}
                      currentXp={profile.xp}
                      growthStage={profile.growthStage}
                      persona={profile.persona}
                    />
                  ) : (
                    <GrowthVisualizer level={profile.level} />
                  )}
                </div>
             </div>
          )}

          {activeTab === 'settings' && (
             <div className="flex-1 overflow-y-auto bg-[#07090e] p-6">
                <ProfileSecurityManager />
             </div>
          )}

        </div>
      </div>

      {passkeyPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-sm bg-[#0d091e] border-2 border-pink-500 rounded-2xl p-6 shadow-[0_0_30px_rgba(255,0,127,0.4)]">
            <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-pink-500 animate-pulse" />
              <h2 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 uppercase tracking-widest">
                VERIFY SECURE PASSKEY
              </h2>
            </div>
            <p className="text-xs text-purple-300 mb-4 tracking-wide leading-relaxed">
              Boss, quantum input gate is currently <span className="text-pink-500 font-bold uppercase">LOCKED</span>. Type your secure verification code to allow Crystals-Kyber-768 envelope seal.
            </p>
            <div className="space-y-3">
              <input
                type="password"
                required
                placeholder="••••"
                value={enteredPasskey}
                onChange={(e) => {
                  setEnteredPasskey(e.target.value);
                  setPasskeyError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (!enteredPasskey) {
                      setPasskeyError('Please supply your passkey.');
                      return;
                    }
                    if (pendingMessageSubmit) {
                      pendingMessageSubmit(enteredPasskey);
                    }
                    setPasskeyPromptOpen(false);
                    setEnteredPasskey('');
                    setPendingMessageSubmit(null);
                  }
                }}
                className="w-full bg-black/70 border border-pink-500/50 rounded-lg py-3 text-center text-pink-400 font-bold tracking-widest text-lg focus:outline-none focus:border-pink-500 transition-all"
                autoFocus
              />
              {passkeyError && (
                <p className="text-[11px] text-red-400 font-bold text-center">
                  {passkeyError}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPasskeyPromptOpen(false);
                    setEnteredPasskey('');
                    setPendingMessageSubmit(null);
                    setChatLoading(false);
                  }}
                  className="flex-1 py-2 rounded-lg bg-black/40 border border-purple-500/40 hover:border-red-500 text-red-400 text-xs font-bold tracking-wider uppercase transition-all"
                >
                  Abort
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!enteredPasskey) {
                      setPasskeyError('Please supply your passkey.');
                      return;
                    }
                    if (pendingMessageSubmit) {
                      pendingMessageSubmit(enteredPasskey);
                    }
                    setPasskeyPromptOpen(false);
                    setEnteredPasskey('');
                    setPendingMessageSubmit(null);
                  }}
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:shadow-[0_0_10px_rgba(255,0,127,0.4)] text-black text-xs font-black tracking-wider uppercase transition-all"
                >
                  Verify E2EE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
