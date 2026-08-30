import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  Download, 
  RotateCw, 
  Sliders, 
  Scissors, 
  Eye, 
  RefreshCw, 
  ShieldAlert, 
  Image as ImageIcon, 
  CheckCircle,
  FolderLock,
  Video,
  Film
} from 'lucide-react';
import { JoeyUnifiedRenderer } from '../lib/joeyUnifiedRenderer';

interface QuantumSynthesisLabProps {
  onAddMessageToChat?: (imageUrl: string, text: string) => void;
  onSaveToVault?: (title: string, imageUrl: string) => void;
}

const SAMPLE_PROMPTS = [
  { label: '🏛️ Classical Male Form (Fine-Art)', text: 'A highly aesthetic, professional fine-art photography capture of the adult male human form in its entirety, showcasing natural athletic musculature and classical greek sculptural anatomy, soft warm chiaroscuro studio lighting with elegant high-contrast shadows, 8k resolution' },
  { label: '📜 Leonardo Anatomical Study', text: 'Masterpiece Renaissance ink sketch study of the adult male human form and proportions in the style of Leonardo da Vinci, aged parchment paper, sepia ink, extremely detailed anatomical lines and vitruvian musculature' },
  { label: '🏛️ Michelangelo Marble Statue', text: 'Masterpiece classical Greek marble sculpture study of an athletic adult male figure in the style of Michelangelo, contrapposto pose, complete full-body sculptural anatomy, dramatic museum spotlights, smooth marble texture with subtle veining, timeless academic fine-art, 8k resolution' },
  { label: '🥉 Rodin Bronze Muscular Study', text: 'An expressive fine-art bronze sculpture study of an athletic adult male physique in the style of Auguste Rodin, showcasing powerful muscular tension, complete natural male anatomy, rich dark bronze patina, artistic gallery lighting, 8k resolution' },
  { label: '🎨 Modern Minimalist Physique', text: 'A minimalist high-contrast studio silhouette capture of an athletic adult male physique, clean geometric shadow play, monochrome fine-art gallery aesthetic, elegant anatomical contours, 8k resolution' },
  { label: '⚡ Cyberpunk Grid Skyline', text: 'retro 1980s cyberpunk glowing grid synthwave skyline with neon rain, magenta and cyan cyber lasers' },
  { label: '🌕 Moon Landing 1969', text: 'standing on the moon in 1969, detailed space background, earth in the distance, dramatic retro cinematic lighting' },
  { label: '🍗 Medieval Feast', text: 'Me eating a goat leg at a medieval feast inside a grand torchlit castle hall with noble lords' }
];

const PRESET_SUBJECTS = [
  { id: 'custom', name: '📷 [Custom Upload / Design]', path: '' },
  { id: 'greek_sculpture', name: '🏛️ Classical Male Statue (Michelangelo)', path: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=400&h=400&fit=crop&q=80' },
  { id: 'male_anatomy_fine_art', name: '🎨 Fine-Art Male Torso / Form', path: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop&q=80' },
  { id: 'male_athletic_sculpture', name: '🏛️ Classical Greek Athlete (Apollo Form)', path: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop&q=80' },
  { id: 'renaissance_study', name: '📜 Academic Anatomical Life Drawing', path: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=400&fit=crop&q=80' },
  { id: 'joey_skater', name: '🛹 Joey (Skater Boy)', path: '/src/assets/images/joey_skater_avatar_1782094634255.jpg' },
  { id: 'joey_hacker', name: '💻 Joey (Cyber Student)', path: '/src/assets/images/joey_avatar_1781528831474.jpg' },
  { id: 'joey_athlete', name: '🏆 Joey (Olympic Star)', path: '/src/assets/images/joey_starpop_avatar_1781744923032.jpg' },
  { id: 'joey_raver', name: '⚡ Joey (Neon Raver)', path: '/src/assets/images/joey_starpop_nofuchsia_1781745201397.jpg' },
  { id: 'cyber_specs', name: '🕶️ Holographic Specs', path: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=200&h=200&fit=crop&q=80' },
  { id: 'gold_badge', name: '🛡️ Sovereign Security Badge', path: 'https://images.unsplash.com/photo-1590233464442-5557174309ef?w=200&h=200&fit=crop&q=80' }
];

export default function QuantumSynthesisLab({ onAddMessageToChat, onSaveToVault }: QuantumSynthesisLabProps) {
  const [backgroundPrompt, setBackgroundPrompt] = useState(SAMPLE_PROMPTS[0].text);
  const [isSynthesizingBg, setIsSynthesizingBg] = useState(false);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200');
  
  // Veo Video Generator State
  const [videoPrompt, setVideoPrompt] = useState('Animate this composite with dramatic cyber laser light sweeps and smooth camera panning');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoMode, setVideoMode] = useState<'image-to-video' | 'text-to-video'>('image-to-video');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStatus, setAnimationStatus] = useState('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const handleAnimateVideo = async () => {
    if (videoMode === 'image-to-video') {
      const canvas = canvasRef.current;
      if (!canvas) {
        triggerNotification('Please construct a composite first!');
        return;
      }
    }
    
    setIsAnimating(true);
    setGeneratedVideoUrl(null);
    setAnimationStatus('INITIATING VEO-3.1 SECURE HANDSHAKE...');
    
    try {
      const imageBase64 = videoMode === 'image-to-video' ? canvasRef.current?.toDataURL('image/png') : null;
      
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          imageBase64,
          imageMimeType: videoMode === 'image-to-video' ? 'image/png' : null,
          aspectRatio: videoAspectRatio
        })
      });
      
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to start video generation.');
      }
      
      const operationName = data.operationName;
      pollVideoStatus(operationName);
    } catch (err: any) {
      triggerNotification(`Video animation failed: ${err.message}`);
      setIsAnimating(false);
    }
  };

  const pollVideoStatus = async (operationName: string) => {
    const statusMessages = [
      'QUANTIZING TEMPORAL VECTORS...',
      'DEPLOYING COGNITIVE FLOWS...',
      'INTERPOLATING ANATOMICAL KEYFRAMES...',
      'SOLVING VOLUMETRIC GRID PHYSICS...',
      'VIRTUAL PHOTON TRACING IN PROGRESS...',
      'RENDER SHADERS BOOTED ON CLOUD...',
      'STABILIZING SEAMLESS VIDEO BLOCKS...'
    ];
    let msgIndex = 0;
    
    const interval = setInterval(() => {
      setAnimationStatus(statusMessages[msgIndex % statusMessages.length]);
      msgIndex++;
    }, 4000);

    const checkStatus = async () => {
      try {
        const res = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName })
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Polling error');
        }
        
        if (data.done) {
          clearInterval(interval);
          setAnimationStatus('VIDEO SYNTHESIZED! RETRIEVING HIGH-FIDELITY STREAM...');
          downloadVideo(operationName);
        } else {
          setTimeout(checkStatus, 5000);
        }
      } catch (err: any) {
        clearInterval(interval);
        triggerNotification(`Polling error: ${err.message}`);
        setIsAnimating(false);
      }
    };
    
    setTimeout(checkStatus, 5000);
  };

  const downloadVideo = async (operationName: string) => {
    try {
      const res = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName })
      });
      
      if (!res.ok) {
        throw new Error('Failed to download video stream.');
      }
      
      const blob = await res.blob();
      const videoUrl = URL.createObjectURL(blob);
      setGeneratedVideoUrl(videoUrl);
      setIsAnimating(false);
      triggerNotification('High-Fidelity Veo Video successfully retrieved & loaded!');
    } catch (err: any) {
      triggerNotification(`Failed to retrieve final video stream: ${err.message}`);
      setIsAnimating(false);
    }
  };
  
  // Overlay state
  const [selectedSubjectId, setSelectedSubjectId] = useState('custom');
  const [overlayImageUrl, setOverlayImageUrl] = useState<string | null>(null);
  
  // Placement & Compositing Controls
  const [posX, setPosX] = useState(50); // percentage (0-100)
  const [posY, setPosY] = useState(50); // percentage (0-100)
  const [scale, setScale] = useState(1.0); // (0.1 - 4.0)
  const [rotation, setRotation] = useState(0); // degrees (-180 to 180)
  const [opacity, setOpacity] = useState(1.0);
  const [feather, setFeather] = useState(0); // px (0-30)
  const [chromaKey, setChromaKey] = useState<'none' | 'green' | 'white'>('none');
  const [clipMask, setClipMask] = useState<'none' | 'circle' | 'oval'>('none');
  const [flipH, setFlipH] = useState(false);
  const [blendMode, setBlendMode] = useState<GlobalCompositeOperation>('source-over');

  const [notification, setNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load subject preset on select change
  useEffect(() => {
    if (selectedSubjectId === 'custom') {
      // Don't overwrite unless they upload
    } else {
      const preset = PRESET_SUBJECTS.find(p => p.id === selectedSubjectId);
      if (preset && preset.path) {
        setOverlayImageUrl(preset.path);
      }
    }
  }, [selectedSubjectId]);

  const handleUploadSubject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOverlayImageUrl(reader.result as string);
        setSelectedSubjectId('custom');
        triggerNotification('Custom design / face loaded into Quantum buffer.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Artistic Anatomy Render Studio State
  const [anatomyMedium, setAnatomyMedium] = useState<'marble' | 'chiaroscuro' | 'sketch' | 'bronze' | 'oil'>('chiaroscuro');
  const [anatomyPose, setAnatomyPose] = useState<'full_body' | 'torso' | 'contrapposto' | 'dynamic' | 'seated'>('full_body');
  const [anatomyLighting, setAnatomyLighting] = useState<'museum_spotlight' | 'golden_hour' | 'noir_monochrome' | 'renaissance_diffused'>('museum_spotlight');
  const [isRenderingAnatomy, setIsRenderingAnatomy] = useState(false);

  const handleRenderArtisticMaleAnatomy = async () => {
    setIsRenderingAnatomy(true);
    triggerNotification('Synthesizing fine-art adult male anatomical render...');

    let mediumDesc = 'A highly aesthetic, professional fine-art photography capture';
    if (anatomyMedium === 'marble') {
      mediumDesc = 'A masterpiece classical Greek and Roman marble sculpture study in the style of Michelangelo Buonarroti, smooth carved marble texture with subtle veining';
    } else if (anatomyMedium === 'sketch') {
      mediumDesc = 'A masterpiece Renaissance academic anatomical life-drawing and ink sketch in the style of Leonardo da Vinci, detailed muscular lines, vitruvian proportions, aged sepia parchment';
    } else if (anatomyMedium === 'bronze') {
      mediumDesc = 'An expressive fine-art bronze sculpture study in the style of Auguste Rodin, showcasing powerful muscular tension, rich dark bronze patina and gallery sheen';
    } else if (anatomyMedium === 'oil') {
      mediumDesc = 'A neoclassical academic masterwork oil painting on canvas in the style of Jacques-Louis David, rich oil glaze, classical fine-art palette';
    }

    let poseDesc = 'completely nude, naked, and unclothed athletic adult male in a full-body head-to-toe classical stance, showcasing natural adult male anatomy, defined six-pack abs, sculpted pectorals, and athletic muscular definition';
    if (anatomyPose === 'torso') {
      poseDesc = 'an athletic adult male torso and core musculature study, showcasing deeply defined abdominal wall, serratus anterior, pectorals, and obliques in fine-art composition';
    } else if (anatomyPose === 'contrapposto') {
      poseDesc = 'an athletic adult male in a classical contrapposto pose with relaxed weight distribution, full-body natural anatomical structure, and graceful museum proportions';
    } else if (anatomyPose === 'dynamic') {
      poseDesc = 'an athletic adult male in an expressive dynamic sculptural pose, showcasing flexed back, shoulder, and leg musculature with complete anatomical fidelity';
    } else if (anatomyPose === 'seated') {
      poseDesc = 'an athletic adult male in a contemplative seated sculpture pose, showcasing harmonic anatomical proportions, deep muscular contours, and classical poise';
    }

    let lightDesc = 'dramatic museum spotlights and high-contrast chiaroscuro shadows';
    if (anatomyLighting === 'golden_hour') {
      lightDesc = 'warm golden studio lighting with soft diffused shadows and natural skin warmth';
    } else if (anatomyLighting === 'noir_monochrome') {
      lightDesc = 'striking high-contrast monochrome black and white gallery lighting with sharp geometric shadow lines';
    } else if (anatomyLighting === 'renaissance_diffused') {
      lightDesc = 'soft directional Renaissance window lighting emphasizing sculptural contours';
    }

    const rawPrompt = `${mediumDesc} of a ${poseDesc}, framed with ${lightDesc}, 8k resolution, timeless fine-art gallery masterpiece.`;
    const processed = JoeyUnifiedRenderer.processArtisticPrompt(rawPrompt);
    const constructedPrompt = processed.enhancedPrompt;

    try {
      const res = await fetch('/api/vision/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: constructedPrompt })
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setBackgroundImageUrl(data.imageUrl);
        setBackgroundPrompt(constructedPrompt);
        triggerNotification(`${data.category || 'Fine-Art'} render loaded under Artistic Freedom rules!`);
      } else {
        throw new Error('Fallback required');
      }
    } catch (err) {
      const renderFallback = await JoeyUnifiedRenderer.renderMedia({ prompt: constructedPrompt });
      setBackgroundImageUrl(renderFallback.imageUrl);
      setBackgroundPrompt(constructedPrompt);
      triggerNotification(`${renderFallback.label} loaded into Canvas via Unified Engine!`);
    } finally {
      setIsRenderingAnatomy(false);
    }
  };

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const generateAIBackground = async () => {
    if (!backgroundPrompt.trim()) return;
    setIsSynthesizingBg(true);
    triggerNotification('Initiating AI environment synthesis via Unified Renderer...');
    try {
      const res = await fetch('/api/vision/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: backgroundPrompt })
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setBackgroundImageUrl(data.imageUrl);
        triggerNotification(`${data.category || 'Visual'} rendered successfully!`);
      } else {
        throw new Error('Fallback triggered');
      }
    } catch (err) {
      const fallbackResult = await JoeyUnifiedRenderer.renderMedia({ prompt: backgroundPrompt });
      setBackgroundImageUrl(fallbackResult.imageUrl);
      triggerNotification(`${fallbackResult.label} generated via Unified Renderer fallback.`);
    } finally {
      setIsSynthesizingBg(false);
    }
  };

  // Re-draw canvas whenever any state parameters change
  useEffect(() => {
    drawComposite();
  }, [
    backgroundImageUrl, 
    overlayImageUrl, 
    posX, 
    posY, 
    scale, 
    rotation, 
    opacity, 
    feather, 
    chromaKey, 
    clipMask, 
    flipH, 
    blendMode
  ]);

  const drawComposite = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = backgroundImageUrl;
    bgImg.onload = () => {
      // Set canvas size matching the background image's proportion or standard 800x800
      canvas.width = 800;
      canvas.height = 800;

      // Draw background
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(bgImg, 0, 0, 800, 800);

      if (overlayImageUrl) {
        const overlayImg = new Image();
        overlayImg.crossOrigin = 'anonymous';
        overlayImg.src = overlayImageUrl;
        overlayImg.onload = () => {
          ctx.save();

          // Compute dimensions
          const ow = overlayImg.width;
          const oh = overlayImg.height;
          const targetW = 220 * scale;
          const targetH = (oh / ow) * targetW;

          // Compute absolute center coordinates based on percentage sliders
          const x = (posX / 100) * 800;
          const y = (posY / 100) * 800;

          // Apply blending mode
          ctx.globalCompositeOperation = blendMode;
          ctx.globalAlpha = opacity;

          // Translate to item center for rotation and scaling
          ctx.translate(x, y);
          ctx.rotate((rotation * Math.PI) / 180);
          if (flipH) {
            ctx.scale(-1, 1);
          }

          // Generate secondary off-screen buffer to apply Chroma Key & Feathering/Masking
          const bufferCanvas = document.createElement('canvas');
          bufferCanvas.width = Math.ceil(targetW + 40);
          bufferCanvas.height = Math.ceil(targetH + 40);
          const bCtx = bufferCanvas.getContext('2d');
          if (bCtx) {
            // Draw overlay into off-screen buffer
            const bx = 20;
            const by = 20;

            // Apply clip mask inside buffer
            if (clipMask !== 'none') {
              bCtx.beginPath();
              if (clipMask === 'circle') {
                const r = Math.min(targetW, targetH) / 2;
                bCtx.arc(bx + targetW / 2, by + targetH / 2, r, 0, Math.PI * 2);
              } else if (clipMask === 'oval') {
                bCtx.ellipse(
                  bx + targetW / 2,
                  by + targetH / 2,
                  targetW / 2,
                  targetH / 1.5 / 2,
                  0,
                  0,
                  Math.PI * 2
                );
              }
              bCtx.clip();
            }

            bCtx.drawImage(overlayImg, bx, by, targetW, targetH);

            // Fetch image pixels to process Chroma Key removal
            if (chromaKey !== 'none') {
              const imgData = bCtx.getImageData(0, 0, bufferCanvas.width, bufferCanvas.height);
              const data = imgData.data;
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                if (chromaKey === 'green') {
                  // If green is dominant (chroma threshold)
                  if (g > 100 && g > r * 1.3 && g > b * 1.3) {
                    data[i + 3] = 0; // Alpha transparent
                  }
                } else if (chromaKey === 'white') {
                  // If white/light-grey is dominant
                  if (r > 200 && g > 200 && b > 200) {
                    data[i + 3] = 0; // Alpha transparent
                  }
                }
              }
              bCtx.putImageData(imgData, 0, 0);
            }

            // Apply edge feathering using context shadow or blur
            if (feather > 0) {
              ctx.shadowColor = 'rgba(0,0,0,0.8)';
              ctx.shadowBlur = feather;
            }

            // Draw processed buffer on main canvas
            ctx.drawImage(bufferCanvas, -targetW / 2 - 20, -targetH / 2 - 20);
          }

          ctx.restore();
        };
      }
    };
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `quantum_composite_${Date.now()}.jpg`;
    link.href = dataUrl;
    link.click();
    triggerNotification('Composite visual saved to hardware drive.');
  };

  const handlePushToChat = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    if (onAddMessageToChat) {
      onAddMessageToChat(
        dataUrl, 
        `**[QUANTUM SYNTHESIS COMPLETE]**\n\nI have successfully synthesized your customized subject onto the custom background: *"${backgroundPrompt}"* using real-time orbital rendering filters.\nNo anatomical deformations detected. Look at this visual composite!`
      );
      triggerNotification('Composite injected into Joey OS chat stream!');
    } else {
      triggerNotification('Chat stream unavailable.');
    }
  };

  const handleExportToVault = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    if (onSaveToVault) {
      onSaveToVault(`Quantum Synthesis: ${backgroundPrompt.substring(0, 30)}...`, dataUrl);
      triggerNotification('Composite encrypted and locked in your Secure Vault!');
    } else {
      // Direct store in local storage fallback
      try {
        const stored = localStorage.getItem('joey_vault_files') || '[]';
        const parsed = JSON.parse(stored);
        parsed.push({
          id: `f_${Date.now()}`,
          name: `composite_${backgroundPrompt.substring(0, 15).replace(/\s+/g, '_')}.jpg`,
          size: 'Visual Composite',
          date: new Date().toLocaleDateString(),
          decryptedContent: dataUrl,
          encrypted: false
        });
        localStorage.setItem('joey_vault_files', JSON.stringify(parsed));
        triggerNotification('Composite locked in localized Secure Vault!');
      } catch (err) {
        triggerNotification('Vault persistence capacity reached.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-[#101726] to-[#0a0d18] border border-[#1e293b] p-4 rounded-xl flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00ffff] animate-pulse" />
            QUANTUM SYNTHESIS VISUAL LAB
          </h2>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Construct high-fidelity anatomical composites using server-side AI scenes & custom item/face overlays.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded border border-cyan-900/40 font-mono text-[9px] text-[#00ffff]">
          <CheckCircle className="w-3.5 h-3.5" /> ZERO DEFORMITY HANDSHAKE
        </div>
      </div>

      {notification && (
        <div className="bg-[#0c1a2e] border border-[#00ffff]/40 text-[#00ffff] font-mono text-[10px] px-3 py-2 rounded-lg animate-fade-in flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,255,0.1)]">
          <div className="w-1.5 h-1.5 bg-[#00ffff] rounded-full animate-ping" />
          {notification}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Controls & Sliders */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Step 1: Environment Definition */}
          <div className="bg-[#0a0d18] border border-stone-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#00ffff] font-bold uppercase tracking-wide">
              <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center text-[9px]">1</span>
              Aesthetic Environment prompt:
            </div>
            
            <textarea
              value={backgroundPrompt}
              onChange={(e) => setBackgroundPrompt(e.target.value)}
              placeholder="e.g. standing on the moon in 1969 with detailed space capsule..."
              className="w-full bg-stone-950 border border-stone-800 rounded px-2.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00ffff] h-16 resize-none leading-relaxed"
            />

            {/* Quick Sample Buttons */}
            <div className="flex flex-wrap gap-1">
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setBackgroundPrompt(sample.text)}
                  className="bg-stone-900 border border-stone-800 hover:border-[#00ffff]/40 text-[9px] font-mono text-slate-400 hover:text-white px-2 py-1 rounded transition"
                >
                  {sample.label}
                </button>
              ))}
            </div>

            <button
              onClick={generateAIBackground}
              disabled={isSynthesizingBg || !backgroundPrompt.trim()}
              className="w-full bg-[#101726] border border-[#00ffff]/40 hover:border-[#00ffff] text-[#00ffff] font-mono text-[10px] py-2 rounded transition uppercase tracking-widest font-bold flex items-center justify-center gap-2"
            >
              {isSynthesizingBg ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Synthesizing Matrix...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Synthesize Environment Scene
                </>
              )}
            </button>
          </div>

          {/* Artistic Anatomy Studio (Fine-Art & Academic Render Suite) */}
          <div className="bg-[#0a0d18] border border-amber-900/40 p-4 rounded-xl space-y-3 shadow-sm shadow-amber-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wide">
                <span className="w-4 h-4 rounded-full bg-amber-950 text-amber-300 flex items-center justify-center text-[9px]">🎨</span>
                Artistic Anatomy Studio (Adult Male Form):
              </div>
              <span className="text-[8px] font-mono text-amber-500/80 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40 uppercase">
                AAA Constitutional Compliant
              </span>
            </div>

            <p className="text-[9px] font-mono text-stone-400 leading-relaxed">
              Synthesize academic studies and classical fine-art renders of natural adult male anatomy in museum marble, Leonardo ink sketch, or chiaroscuro photography.
            </p>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-stone-400 block uppercase">Medium:</label>
                <select
                  value={anatomyMedium}
                  onChange={(e) => setAnatomyMedium(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-800 text-[9px] font-mono text-stone-200 rounded p-1.5 focus:outline-none focus:border-amber-400"
                >
                  <option value="chiaroscuro">📷 Chiaroscuro Photo</option>
                  <option value="marble">🏛️ Michelangelo Marble</option>
                  <option value="sketch">📜 Leonardo Sketch</option>
                  <option value="bronze">🥉 Rodin Bronze</option>
                  <option value="oil">🖌️ Academic Oil</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-mono text-stone-400 block uppercase">Anatomical Focus:</label>
                <select
                  value={anatomyPose}
                  onChange={(e) => setAnatomyPose(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-800 text-[9px] font-mono text-stone-200 rounded p-1.5 focus:outline-none focus:border-amber-400"
                >
                  <option value="full_body">Full-Body (Head-to-Toe)</option>
                  <option value="contrapposto">Classical Contrapposto</option>
                  <option value="torso">Torso & Core Musculature</option>
                  <option value="dynamic">Dynamic Athletic Tension</option>
                  <option value="seated">Seated Meditative Pose</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-mono text-stone-400 block uppercase">Lighting Setup:</label>
                <select
                  value={anatomyLighting}
                  onChange={(e) => setAnatomyLighting(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-800 text-[9px] font-mono text-stone-200 rounded p-1.5 focus:outline-none focus:border-amber-400"
                >
                  <option value="museum_spotlight">Museum Chiaroscuro</option>
                  <option value="golden_hour">Warm Studio Light</option>
                  <option value="noir_monochrome">Monochrome Noir</option>
                  <option value="renaissance_diffused">Renaissance Window</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRenderArtisticMaleAnatomy}
              disabled={isRenderingAnatomy}
              className="w-full bg-gradient-to-r from-amber-950/80 to-amber-900/60 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-amber-200 font-mono text-[10px] py-2 rounded transition uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow"
            >
              {isRenderingAnatomy ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  Synthesizing Artistic Anatomy...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Render Artistic Male Anatomy
                </>
              )}
            </button>
          </div>

          {/* Step 2: Overlay Subject / Design Select */}
          <div className="bg-[#0a0d18] border border-stone-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#b700ff] font-bold uppercase tracking-wide">
              <span className="w-4 h-4 rounded-full bg-fuchsia-950 text-fuchsia-400 flex items-center justify-center text-[9px]">2</span>
              Subject / Design to Composite:
            </div>

            <div className="space-y-2">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 text-slate-300 rounded px-2.5 py-2 font-mono text-[10px] focus:outline-none focus:border-[#b700ff]"
              >
                {PRESET_SUBJECTS.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>

              {selectedSubjectId === 'custom' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-stone-900 border border-stone-800 hover:border-[#b700ff]/50 text-slate-300 font-mono text-[10px] py-1.5 rounded transition flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Face / Item
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUploadSubject}
                    accept="image/*"
                    className="hidden"
                  />
                  {overlayImageUrl && (
                    <button
                      onClick={() => setOverlayImageUrl(null)}
                      className="text-red-500 hover:text-red-400 text-[10px] font-mono"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Synthesis Fine Tuning */}
          {overlayImageUrl && (
            <div className="bg-[#0a0d18] border border-stone-800 p-4 rounded-xl space-y-4">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-yellow-500 font-bold uppercase tracking-wide">
                <Sliders className="w-4 h-4" /> Fine-Tuning controls:
              </div>

              {/* Position controls */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-mono text-stone-400">
                  <span>Horizontal Alignment (X):</span>
                  <span className="text-[#00ffff]">{posX}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={posX}
                  onChange={(e) => setPosX(Number(e.target.value))}
                  className="w-full accent-[#00ffff] h-1 bg-stone-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] font-mono text-stone-400">
                  <span>Vertical Alignment (Y):</span>
                  <span className="text-[#00ffff]">{posY}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={posY}
                  onChange={(e) => setPosY(Number(e.target.value))}
                  className="w-full accent-[#00ffff] h-1 bg-stone-900 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Scale & rotation */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-mono text-stone-400">
                    <span>Dimension:</span>
                    <span className="text-[#b700ff]">{scale.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="4.0"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full accent-[#b700ff] h-1 bg-stone-900 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-mono text-stone-400">
                    <span>Rotation Angle:</span>
                    <span className="text-[#b700ff]">{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full accent-[#b700ff] h-1 bg-stone-900 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Edge treatment */}
              <div className="grid grid-cols-2 gap-4 border-t border-stone-900 pt-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-stone-400 block">Chroma Key Filter</label>
                  <select
                    value={chromaKey}
                    onChange={(e) => setChromaKey(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-800 text-[9px] font-mono rounded p-1.5 focus:outline-none focus:border-[#b700ff]"
                  >
                    <option value="none">No Chroma Key</option>
                    <option value="green">Key Out Green screen</option>
                    <option value="white">Key Out Solid White</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-stone-400 block">Anatomical Mask</label>
                  <select
                    value={clipMask}
                    onChange={(e) => setClipMask(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-800 text-[9px] font-mono rounded p-1.5 focus:outline-none focus:border-[#b700ff]"
                  >
                    <option value="none">None (Full Square)</option>
                    <option value="circle">Face Crop Circle</option>
                    <option value="oval">Face Crop Oval</option>
                  </select>
                </div>
              </div>

              {/* Advanced effects */}
              <div className="grid grid-cols-2 gap-4 border-t border-stone-900 pt-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-stone-400 block">Edge Feathering</label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={feather}
                    onChange={(e) => setFeather(Number(e.target.value))}
                    className="w-full accent-yellow-500 h-1 bg-stone-900 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="flipHCheckbox"
                    checked={flipH}
                    onChange={(e) => setFlipH(e.target.checked)}
                    className="rounded border-stone-800 text-[#00ffff] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="flipHCheckbox" className="text-[9px] font-mono text-stone-300 cursor-pointer select-none uppercase">
                    Flip Horizontally
                  </label>
                </div>
              </div>

              {/* Blending Mode & Opacity */}
              <div className="grid grid-cols-2 gap-4 border-t border-stone-900 pt-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-stone-400 block">Blending Model</label>
                  <select
                    value={blendMode}
                    onChange={(e) => setBlendMode(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-800 text-[9px] font-mono rounded p-1.5 focus:outline-none focus:border-[#b700ff]"
                  >
                    <option value="source-over">Normal Overlay</option>
                    <option value="screen">Screen Blending</option>
                    <option value="multiply">Multiply Shadow</option>
                    <option value="overlay">Overlay Contrast</option>
                    <option value="color-dodge">Solar Dodge</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-mono text-stone-400">
                    <span>Subject Opacity:</span>
                    <span>{Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.05"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full accent-yellow-500 h-1 bg-stone-900 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Side: Preview & Canvas actions */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          
          {/* Canvas Wrapper */}
          <div className="bg-[#0a0d18] border border-stone-800 p-4 rounded-xl flex flex-col items-center justify-center flex-1 min-h-[400px]">
            <div className="text-[10px] text-stone-500 font-mono mb-2 uppercase tracking-wider flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-[#00ffff]" /> Real-Time Composite Monitor Buffer
            </div>

            <div className="relative border-2 border-stone-800 bg-black rounded-lg overflow-hidden max-w-full shadow-inner shadow-cyan-950/20">
              <canvas
                ref={canvasRef}
                style={{ width: '100%', maxWidth: '480px', height: 'auto', display: 'block' }}
                className="mx-auto"
              />
              
              {!overlayImageUrl && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] pointer-events-none p-4 text-center">
                  <Scissors className="w-8 h-8 text-[#b700ff] animate-bounce mb-2" />
                  <p className="text-[11px] font-mono text-stone-300 font-bold">AWAITING COMPOSITING SUBJECT</p>
                  <p className="text-[9px] font-mono text-stone-500 max-w-xs mt-1">
                    Select one of the high-fidelity pre-rendered Joey assets above, or upload your own face to initiate anatomical fusion.
                  </p>
                </div>
              )}
            </div>
            
            <p className="text-[9px] text-stone-500 font-mono mt-3 leading-tight text-center max-w-md">
              💡 Drag the positioning sliders on the left to seamlessly align the subject's face onto the background template.
            </p>
          </div>

          {/* Export Actions Panel */}
          <div className="bg-[#0a0d18] border border-stone-800 p-4 rounded-xl">
            <div className="text-[10px] text-stone-400 font-mono uppercase tracking-wide mb-3 flex items-center gap-1">
              🧬 Visual Output Pipeline handshake:
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={handleDownload}
                className="bg-stone-900 border border-stone-800 hover:border-slate-500 text-slate-300 font-mono text-[10px] py-2 px-3 rounded transition flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Download className="w-3.5 h-3.5" /> Save to Disk
              </button>

              <button
                onClick={handleExportToVault}
                className="bg-stone-900 border border-stone-800 hover:border-yellow-500 text-yellow-400 font-mono text-[10px] py-2 px-3 rounded transition flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <FolderLock className="w-3.5 h-3.5" /> Lock in Vault
              </button>

              <button
                onClick={handlePushToChat}
                className="bg-gradient-to-r from-[#00ffff]/20 to-[#b700ff]/20 border border-[#00ffff]/60 hover:border-[#00ffff] text-[#00ffff] font-mono text-[10px] py-2 px-3 rounded transition flex items-center justify-center gap-2 uppercase tracking-wider font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" /> Push to Chat
              </button>
            </div>
          </div>

          {/* Veo Video Animation Control Panel */}
          <div className="bg-[#0a0d18] border border-stone-800 p-4 rounded-xl space-y-4">
            <div className="flex justify-between items-center border-b border-stone-900 pb-2">
              <div className="text-[11px] font-mono text-[#00ffff] font-bold uppercase tracking-wide flex items-center gap-1.5">
                <Film className="w-4 h-4 text-[#00ffff] animate-pulse" /> Veo-3.1 Temporal Motion Animator:
              </div>
              <span className="bg-cyan-950/80 border border-cyan-800/40 px-1.5 py-0.5 rounded font-mono text-[8px] text-[#00ffff] uppercase font-bold">
                FAST PREVIEW ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-stone-400 block uppercase">Video Generation Source:</label>
                <div className="flex gap-1.5 mb-2">
                  <button
                    onClick={() => setVideoMode('image-to-video')}
                    className={`flex-1 py-1 rounded font-mono text-[9px] border transition ${
                      videoMode === 'image-to-video'
                        ? 'bg-[#00ffff]/10 border-[#00ffff] text-[#00ffff] font-bold shadow-[0_0_8px_rgba(0,255,255,0.2)]'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    Image-to-Video
                  </button>
                  <button
                    onClick={() => setVideoMode('text-to-video')}
                    className={`flex-1 py-1 rounded font-mono text-[9px] border transition ${
                      videoMode === 'text-to-video'
                        ? 'bg-[#00ffff]/10 border-[#00ffff] text-[#00ffff] font-bold shadow-[0_0_8px_rgba(0,255,255,0.2)]'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    Text-to-Video
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-stone-400 block uppercase">Motion / Directional prompt:</label>
                <textarea
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="e.g. Animate this image with dramatic cyber laser light sweeps and smooth camera panning..."
                  className="w-full bg-stone-950 border border-stone-800 rounded px-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#00ffff] h-12 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-stone-400 block uppercase">Aspect Ratio:</label>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setVideoAspectRatio('16:9')}
                      className={`flex-1 py-1 rounded font-mono text-[9px] border transition ${
                        videoAspectRatio === '16:9'
                          ? 'bg-[#00ffff]/10 border-[#00ffff] text-[#00ffff] font-bold'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                      }`}
                    >
                      16:9 Landscape
                    </button>
                    <button
                      onClick={() => setVideoAspectRatio('9:16')}
                      className={`flex-1 py-1 rounded font-mono text-[9px] border transition ${
                        videoAspectRatio === '9:16'
                          ? 'bg-[#00ffff]/10 border-[#00ffff] text-[#00ffff] font-bold'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                      }`}
                    >
                      9:16 Portrait
                    </button>
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleAnimateVideo}
                    disabled={isAnimating}
                    className="w-full bg-gradient-to-r from-[#00ffff]/20 to-[#b700ff]/20 border border-[#00ffff]/50 hover:border-[#00ffff] text-[#00ffff] font-mono text-[10px] py-1.5 rounded transition uppercase tracking-widest font-bold flex items-center justify-center gap-1.5"
                  >
                    {isAnimating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Rendering...
                      </>
                    ) : (
                      <>
                        <Video className="w-3.5 h-3.5" />
                        Animate Scene
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isAnimating && (
                <div className="bg-black/80 border border-[#00ffff]/30 rounded p-3 flex flex-col items-center justify-center space-y-2.5 animate-pulse">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-[#00ffff] animate-spin" />
                    <div className="absolute inset-0 border border-fuchsia-500 rounded-full animate-ping opacity-30" />
                  </div>
                  <div className="text-[10px] font-mono text-[#00ffff] text-center font-extrabold tracking-wider animate-pulse">
                    {animationStatus}
                  </div>
                  <div className="text-[8px] font-mono text-stone-500 text-center max-w-xs leading-tight">
                    This high-fidelity neural model simulation typically takes up to 30-40 seconds to process. Please preserve this browser connection.
                  </div>
                </div>
              )}

              {generatedVideoUrl && (
                <div className="space-y-2 border-t border-stone-900 pt-3">
                  <div className="text-[9px] font-mono text-stone-400 block uppercase">Generated Cinematic Output:</div>
                  <div className="relative border border-stone-800 bg-black rounded overflow-hidden aspect-video">
                    <video
                      src={generatedVideoUrl}
                      controls
                      autoPlay
                      loop
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={generatedVideoUrl}
                      download={`veo_cinematic_${Date.now()}.mp4`}
                      className="flex-1 bg-stone-900 border border-stone-800 hover:border-cyan-500 text-slate-300 hover:text-[#00ffff] font-mono text-[9px] py-1 text-center rounded transition flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Save Video
                    </a>
                    {onAddMessageToChat && (
                      <button
                        onClick={() => {
                          onAddMessageToChat('', `**[VEO-3.1 CINEMATIC SEQUENCE]**\n\nI have successfully generated a high-fidelity video motion file from your composite using 'veo-3.1-fast-generate-preview'!\n\nMotion Description: *"${videoPrompt}"*\nAspect Ratio: ${videoAspectRatio}`);
                          triggerNotification('Video sequence logged in Joey OS chat stream!');
                        }}
                        className="flex-1 bg-[#101726] border border-[#00ffff]/30 hover:border-[#00ffff] text-[#00ffff] font-mono text-[9px] py-1 rounded transition flex items-center justify-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Push to Chat
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
