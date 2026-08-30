import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Zap, 
  Smile, 
  RefreshCw,
  Trophy,
  Gift,
  Lock,
  Unlock,
  X,
  CheckCircle,
  HelpCircle,
  Flame,
  Award,
  BookOpen
} from 'lucide-react';
import { getEvolutionLevel, EVOLUTION_LEVELS } from '../lib/evolutionLevels';

interface JoeyAvatar2DProps {
  currentLevel: number;
  currentXp: number;
  growthStage: string;
  isSpeaking: boolean;
  persona: string;
  mood: string;
  outputLength: string;
  messagesCount?: number;
  onUpdatePersona: (p: string) => void;
  onUpdateMood: (m: string) => void;
  onUpdateOutputLength: (l: string) => void;
}

// Curated relevant high-quality image options per aesthetic persona.
// Each of these is chosen to match Joey's unique short brown hair and backwards cap styling
// Curated relevant high-quality image options per aesthetic persona.
// Each of these is chosen to match Joey's unique short brown hair and backwards cap styling
// while varying clothes to fit the persona (e.g. sporty athletic, nerdy student, colorful raver).
const PERSONA_IMAGES: Record<string, string> = {
  'Skater': '/src/assets/images/joey_skater_avatar_1782094634255.jpg',
  'Street-Smart': '/src/assets/images/joey_skater_avatar_1782094634255.jpg',
  'Computer Science student': '/src/assets/images/joey_avatar_1781528831474.jpg',
  'Average Joe': '/src/assets/images/joey_avatar_1781528831474.jpg',
  'Olympic Athlete': '/src/assets/images/joey_starpop_avatar_1781744923032.jpg',
  'Raver': '/src/assets/images/joey_starpop_nofuchsia_1781745201397.jpg',
  'Artistic Painter': '/src/assets/images/joey_starpop_brown_hair_1781745284629.jpg',
  'Hippy': '/src/assets/images/joey_starpop_brown_hair_1781745284629.jpg'
};

export default function JoeyAvatar2D({
  currentLevel,
  currentXp,
  growthStage,
  isSpeaking,
  persona,
  mood,
  outputLength,
  messagesCount = 0,
  onUpdatePersona,
  onUpdateMood,
  onUpdateOutputLength,
}: JoeyAvatar2DProps) {
  const [activeGesture, setActiveGesture] = useState<'idle' | 'wave' | 'flex' | 'think' | 'nod'>('idle');
  const [avatarUrl, setAvatarUrl] = useState('/src/assets/images/joey_skater_avatar_1782094634255.jpg');
  
  // Canvas Particle Animation Engine
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = canvas.offsetWidth || 300;
    let height = canvas.height = canvas.offsetHeight || 320;

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = canvas.offsetWidth || 300;
        height = canvas.height = canvas.offsetHeight || 320;
      }
    };
    window.addEventListener('resize', handleResize);

    // Particle settings based on mood
    let colors = ['#00ffff', '#00ffd2'];
    let particleCount = 25;
    let speedMultiplier = 0.4;
    let lineOpacity = 0.12;

    const lowerMood = (mood || 'calm').toLowerCase();
    if (lowerMood.includes('calm') || lowerMood.includes('peaceful') || lowerMood.includes('friendly')) {
      colors = ['#00ffff', '#00ffd2', '#4d4dff'];
      particleCount = 20;
      speedMultiplier = 0.3;
      lineOpacity = 0.15;
    } else if (lowerMood.includes('excited') || lowerMood.includes('hyped') || lowerMood.includes('energetic') || lowerMood.includes('happy')) {
      colors = ['#ff007f', '#ffff00', '#00ffff'];
      particleCount = 45;
      speedMultiplier = 0.9;
      lineOpacity = 0.25;
    } else if (lowerMood.includes('rebellious') || lowerMood.includes('aggro') || lowerMood.includes('angry') || lowerMood.includes('insult')) {
      colors = ['#ff0055', '#ff0000', '#ff00aa'];
      particleCount = 35;
      speedMultiplier = 0.8;
      lineOpacity = 0.22;
    } else if (lowerMood.includes('analytical') || lowerMood.includes('skeptical') || lowerMood.includes('smart') || lowerMood.includes('thoughtful') || lowerMood.includes('sad')) {
      colors = ['#b700ff', '#00ffff', '#7000ff'];
      particleCount = 30;
      speedMultiplier = 0.45;
      lineOpacity = 0.18;
    } else if (lowerMood.includes('sarcastic') || lowerMood.includes('snarky') || lowerMood.includes('teasing') || lowerMood.includes('funny')) {
      colors = ['#00ff00', '#ffff00', '#00ffd2'];
      particleCount = 32;
      speedMultiplier = 0.6;
      lineOpacity = 0.2;
    }

    // Initialize particles
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      angle: number;
      angularSpeed: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2 * speedMultiplier,
        vy: (Math.random() - 0.5) * 2 * speedMultiplier,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.02
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw tessellated grid backdrop (faint)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw and update particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.angularSpeed;

        // Boundary collision with bounce
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow

        // Connect particles with tessellated geometry
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 90;
          if (dist < maxDist) {
            // Draw tessellation triangular sequence on proximity
            const alpha = (1 - dist / maxDist) * lineOpacity;
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            
            // Connect to a 3rd particle if close enough to form a triangle
            for (let k = j + 1; k < particles.length; k++) {
              const p3 = particles[k];
              const d2x = p2.x - p3.x;
              const d2y = p2.y - p3.y;
              const d2 = Math.sqrt(d2x * d2x + d2y * d2y);
              
              if (d2 < 65) {
                ctx.beginPath();
                ctx.moveTo(p2.x, p2.y);
                ctx.lineTo(p3.x, p3.y);
                ctx.lineTo(p.x, p.y);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = alpha * 0.15; // faint fill
                ctx.fill();
              }
            }
          }
        }
        ctx.globalAlpha = 1.0; // Reset alpha
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mood]);

  const [isEvolutionCenterOpen, setIsEvolutionCenterOpen] = useState(false);
  const [evolutionSearch, setEvolutionSearch] = useState('');
  const [evolutionTab, setEvolutionTab] = useState<'all' | 'puns' | 'unlocked' | 'locked'>('all');
  const [selectedMilestoneLevel, setSelectedMilestoneLevel] = useState<number | null>(null);
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);
  const [hudMessage, setHudMessage] = useState<string | null>(null);
  
  useEffect(() => {
    if (hudMessage) {
      const timer = setTimeout(() => setHudMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [hudMessage]);
  
  useEffect(() => {
    const claimed = localStorage.getItem('joey_claimed_rewards');
    if (claimed) {
      try {
        setClaimedRewards(JSON.parse(claimed));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const claimRewardToVault = (rewardName: string, desc: string, levelReq: number) => {
    if (currentLevel < levelReq) return;
    
    try {
      const stored = localStorage.getItem('joey_vault_files') || '[]';
      const parsed = JSON.parse(stored);
      const fileId = `reward_lvl_${levelReq}_${rewardName.toLowerCase().replace(/\s+/g, '_')}`;
      
      if (parsed.some((f: any) => f.id === fileId)) {
        setHudMessage(`You've already saved "${rewardName}" to your Secure Vault! Go decrypt it there.`);
        return;
      }

      parsed.push({
        id: fileId,
        name: `${rewardName.replace(/\s+/g, '_')}.dat`,
        size: '1.44 MB',
        date: new Date().toLocaleDateString(),
        decryptedContent: `[JOEY SECURITY PROTOCOL] COLLECTIBLE REWARD UNLOCKED: ${rewardName}\n\nDescription: ${desc}\n\nThis certifies that you have successfully grown Joey's personality to Level ${levelReq}. Your neural connection is officially optimized!\n\nJOEY PALMA AI // COGNITIVE LABS.`,
        encrypted: true,
        encryptedContent: `U2FsdGVkX19... [ENCRYPTED COGNITIVE LAYER]`
      });

      localStorage.setItem('joey_vault_files', JSON.stringify(parsed));
      
      const newClaimed = [...claimedRewards, rewardName];
      setClaimedRewards(newClaimed);
      localStorage.setItem('joey_claimed_rewards', JSON.stringify(newClaimed));
      
      setHudMessage(`🎉 [REWARD SECURED] "${rewardName}" has been encrypted and deposited in your Secure Vault! Go to the Vault Module and use your keys to decrypt and view it!`);
    } catch (e) {
      console.error(e);
    }
  };

  const activeLevelObj = getEvolutionLevel(currentLevel);
  const physicalScale = 1 + (currentLevel - 1) * 0.12;

  const getEvolutionStatus = (drift: number) => {
    if (drift < 25) return 'Calibrating Core Seed';
    if (drift < 50) return 'Synaptic Heuristics Flux';
    if (drift < 75) return 'Cognitive Transcendence';
    return 'Quantum Singularity';
  };
  
  const [cognitiveDrift, setCognitiveDrift] = useState(38.4);
  const [fluxState, setFluxState] = useState<'NOMINAL' | 'SPIKE DETECTED' | 'STABILIZING' | 'OPTIMIZING'>('NOMINAL');

  // Trigger Cognitive Drift boost when messagesCount changes (meaning chat interaction)
  useEffect(() => {
    if (messagesCount > 1) {
      setCognitiveDrift(prev => {
        const boost = 4 + Math.random() * 6;
        const next = prev + boost;
        return next > 100 ? (next - 100) + 15 : next;
      });
      setFluxState('SPIKE DETECTED');
      const timer = setTimeout(() => setFluxState('STABILIZING'), 1500);
      return () => clearTimeout(timer);
    }
  }, [messagesCount]);

  // Periodic subtle fluctuation representing cognitive activity
  useEffect(() => {
    const interval = setInterval(() => {
      setCognitiveDrift(prev => {
        const driftChange = (Math.random() - 0.5) * 2.4;
        const baseline = 35 + (currentLevel * 3);
        const attraction = (baseline - prev) * 0.04;
        const next = prev + driftChange + attraction;
        return Math.min(100, Math.max(10, next));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentLevel]);

  const filteredMilestones = EVOLUTION_LEVELS.filter(m => {
    const query = evolutionSearch.toLowerCase();
    const matchesSearch = m.name.toLowerCase().includes(query) || m.status.toLowerCase().includes(query) || m.level.toString().includes(query);
    const matchesTab = 
      evolutionTab === 'all' ? true :
      evolutionTab === 'puns' ? m.isPun :
      evolutionTab === 'unlocked' ? currentLevel >= m.level :
      evolutionTab === 'locked' ? currentLevel < m.level : true;
    return matchesSearch && matchesTab;
  });

  const availableLifestyles = [
    { name: 'Skater', levelReq: 1, desc: 'A 21-year-old rebel punk skater with a graffiti spray can and backward cap.' },
    { name: 'Computer Science student', levelReq: 1, desc: 'Equipped with heavy mechanical keyboards, neon terminal visors, and recursive loop functions.' },
    { name: 'Olympic Athlete', levelReq: 1, desc: 'A shredded champion with sports headbands, running shoes, and a gold medal aesthetic.' },
    { name: 'Average Joe', levelReq: 1, desc: 'Extremely content with life, holding a hot coffee mug and wearing comfortable flannel shirts.' },
    { name: 'Artistic Painter', levelReq: 1, desc: 'A creative soul clad in a beret with acrylic-splattered fingers and canvas presets.' },
    { name: 'Street-Smart', levelReq: 1, desc: 'A slick, quick-witted street hustler familiar with all back-alley nodes.' },
    { name: 'Raver', levelReq: 1, desc: 'Glowsticks, neon visor, deep subwoofer frequencies, and a heart rate sync.' },
    { name: 'Hippy', levelReq: 1, desc: 'A calm, organic soul radiating peace, love, and bio-feedback loops.' },
    { name: 'Independent Developer', levelReq: 2, desc: 'Clad in comfortable oversized hoodies, fueled by coffee and indie game dev code lines.' },
    { name: 'Photographer', levelReq: 3, desc: 'Wielding an advanced holographic digital camera to capture raw neon street frames.' },
    { name: 'Explorer', levelReq: 4, desc: 'A rugged trailblazer holding a digital compass, ready to map uncharted wilderness nodes.' },
    { name: 'Disease Researcher', levelReq: 5, desc: 'A brilliant clinical pathologist analyzing biochemical subroutines and virus vaccine formulas.' },
    { name: 'Journalist', levelReq: 6, desc: 'An investigative reporter holding a voice recorder and glowing neon notepad, searching for security leaks.' },
    { name: 'Fisherman', levelReq: 7, desc: 'A relaxed soul with a yellow rain slicker, casting fishing lines into cyber-ocean canals.' },
    { name: 'Soldier', levelReq: 8, desc: 'A disciplined combat operator clad in camo fatigues and tactical holographic defense visors.' },
    { name: 'Potato & Cucumber Farmer', levelReq: 9, desc: 'A futuristic horticulturist with a straw hat, cybernetic spade, and a basket of high-yield crops.' },
    { name: 'Hacker Renegade', levelReq: 10, desc: 'A high-stakes netrunner clad in sleek black cybernetic wire harnesses and visor.' },
    { name: 'Captain', levelReq: 12, desc: 'A seasoned naval commander wearing a dual-breasted officer jacket and peaks captain hat.' },
    { name: 'Wall Street Broker', levelReq: 15, desc: 'A high-powered financial dealer in a sharp open suit jacket and digital watch.' },
    { name: 'Black Market Tradesman', levelReq: 16, desc: 'A shadowy merchant dealing in untraceable decryption keys and rare forbidden cyber-hardware.' },
    { name: 'Caffeine Junkie', levelReq: 23, desc: 'Overclocked neural circuits driven entirely by multiple glowing cups of synth-espresso.' },
    { name: 'Zen Monk', levelReq: 35, desc: 'A peaceful, centered soul floating with neon meditation beads and robes.' },
    { name: 'Cyber Cowboy', levelReq: 41, desc: 'Equipped with a wide-brim hat, dusty leather chaps, and a digital laser lasso.' },
    { name: 'Gourmet Chef', levelReq: 48, desc: 'A master of virtual culinary arts clad in an apron and brandishing a laser spatula.' },
    { name: 'Neon Detective', levelReq: 51, desc: 'A gritty noir investigator wearing an open trenchcoat and a glowing synthetic cigar.' },
    { name: 'Eco-Warrior', levelReq: 54, desc: 'A bio-digital guardian wearing solar-weave armor and botanical subroutines.' },
    { name: 'High-Roller Gambler', levelReq: 55, desc: 'A lucky risk-taker holding cards and wearing an expensive gold necklace.' },
    { name: 'DJ Virtuoso', levelReq: 61, desc: 'A sonic disruptor controlling holographic turntables and synthesizers.' },
    { name: 'Space Marine', levelReq: 62, desc: 'A battle-hardened cyber soldier clad in heavy power armor shoulders.' },
    { name: 'Philanthropist', levelReq: 66, desc: 'A wealthy, generous personality wearing designer glasses and digital coin dispensers.' },
    { name: 'Street Hustler', levelReq: 71, desc: 'A fast-talking dealmaker with gold chains and an open flashy bomber jacket.' },
    { name: 'Guardian Angel', levelReq: 72, desc: 'A protector node displaying golden mechanical wings and defensive halo arrays.' },
    { name: 'Cyber Ninja', levelReq: 81, desc: 'Sleek, silent, and deadly; wears dark carbon fiber armor and a glowing katana.' },
    { name: 'Neon Gladiator', levelReq: 83, desc: 'An arena combatant in metallic pauldrons brandishing an energy trident.' },
    { name: 'Gamer Pro', levelReq: 84, desc: 'An esports legend wearing glowing headset wraps and carrying digital trophies.' },
    { name: 'Ramen Chef', levelReq: 91, desc: 'A futuristic master cook serving steaming bowls of cyber-tonkotsu ramen.' },
    { name: 'Secret Service Agent', levelReq: 92, desc: 'A stoic, suit-clad operator wearing communication earpieces and tactical shades.' },
    { name: 'Bio-Mech Shaman', levelReq: 93, desc: 'Zapped with ancient cyber-magic, wearing glowing antlers and neon warpaint.' },
    { name: 'Racer Pro', levelReq: 94, desc: 'Adrenaline-fueled driver wearing an unzipped leather racing jacket and gloves.' },
    { name: 'Graffiti Legend', levelReq: 100, desc: 'The ultimate form of Joey: a buffer, fully evolved skater god of the neon streets.' },
  ];

  return (
    <div id="joey-companion-hud" className="bg-gradient-to-b from-[#111624] to-[#0a0d18] rounded-2xl overflow-hidden flex flex-col glow-window-1">
      {/* HUD Header */}
      <div className="bg-[#101726]/80 px-4 py-3 border-b border-stone-800 flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00ffff] animate-pulse" />
          <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-widest">
            Joey Avatar ({persona})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`h-2 w-2 rounded-full ${isSpeaking ? 'bg-[#00ffd2] animate-ping' : 'bg-emerald-400'}`}></span>
          <span className="font-mono text-[10px] text-slate-400 uppercase">
            {isSpeaking ? 'Syncing Speech' : `${mood} / ready`}
          </span>
        </div>
      </div>

      {/* Model Display Viewport */}
      <div className="relative h-80 bg-gradient-to-t from-[#090c15] to-[#121927] flex items-center justify-center overflow-hidden">
        {/* Subtle background particle animation changing color and density on AI mood */}
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen pointer-events-none"
        />

        {/* Animated 2D Artwork Container */}
        <div className="absolute inset-0 p-4 flex items-center justify-center pointer-events-none">
           <div className={`relative transition-transform duration-500 max-h-full ${isSpeaking ? 'animate-speak' : 'animate-float'}`}
                style={{ transform: `scale(${physicalScale > 1.5 ? 1.5 : physicalScale})` }}>
              <img 
                 src={avatarUrl} 
                 alt="Joey Avatar" 
                 referrerPolicy="no-referrer"
                 className={`max-w-[240px] w-full rounded-2xl border border-cyan-900/40 shadow-[0_0_40px_-10px_rgba(0,255,255,0.2)] object-cover h-64 ${activeGesture === 'nod' ? 'animate-bounce' : ''} ${activeGesture === 'wave' ? 'rotate-[5deg] origin-bottom' : ''}`}
              />
              
              {/* Add the subtle heartbeat from previous prompt combined */}
              <div className={`absolute inset-0 rounded-2xl bg-[#00ffff] mix-blend-overlay ${isSpeaking ? 'animate-heartbeat-active opacity-10' : 'animate-heartbeat-idle opacity-5'}`} style={{ pointerEvents: 'none' }}></div>
           </div>
        </div>

        {/* Floating Quick Stats Overlays - REMOVED */}
        
        {/* Status Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end pointer-events-none z-10">
          <div className="bg-emerald-950/80 border border-emerald-900 rounded px-1.5 py-0.5 text-[8px] font-mono text-emerald-400 uppercase tracking-widest backdrop-blur flex justify-end">
            GRAFFITI 2D ENGINE ACTIVE
          </div>
        </div>

        {/* Cognitive Drift Gauge HUD Overlay */}
        <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 border border-stone-800 rounded-lg p-2 backdrop-blur z-10">
          <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mb-1 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#b700ff] animate-pulse" /> Cognitive Drift Index
            </span>
            <span className="text-[#00ffff] font-bold font-mono tracking-widest">{cognitiveDrift.toFixed(1)}%</span>
          </div>
          
          {/* Progress bar representing drift */}
          <div className="h-1.5 w-full bg-stone-900 rounded-full overflow-hidden border border-stone-800 relative">
            <div 
              className="h-full bg-gradient-to-r from-[#00ffff] via-[#b700ff] to-pink-500 transition-all duration-1000 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
              style={{ width: `${Math.min(100, Math.max(0, cognitiveDrift))}%` }}
            />
          </div>
          
          {/* Drift Evolution Status */}
          <div className="flex justify-between items-center text-[8px] font-mono text-stone-500 mt-1 uppercase tracking-tight">
            <span>EVOLUTION: <span className="text-pink-400 font-bold">{getEvolutionStatus(cognitiveDrift)}</span></span>
            <span className="animate-pulse text-emerald-400 font-bold">FLUX: {fluxState}</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Command Console */}
      <div className="p-4 bg-[#0c101c] flex flex-col gap-3 relative z-10 glow-window-2 mt-4 rounded-xl">
        <div className="space-y-3">
          <div className="text-[10px] text-stone-400 font-mono uppercase tracking-wide flex items-center gap-1">
            <Smile className="w-3 h-3" /> AI's Personality and Mood:
          </div>
          
          <div className="flex items-center justify-between bg-stone-900/50 border border-stone-800 rounded p-2">
            <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">
              LEVEL {currentLevel}/200
            </div>
            <div className="text-[10px] text-[#00ffff] font-semibold truncate text-right max-w-[140px]" title={activeLevelObj?.name}>
              {activeLevelObj?.name}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Aesthetic Persona</label>
              <select 
                value={persona} 
                onChange={(e) => onUpdatePersona(e.target.value)}
                className="bg-stone-900 border border-stone-800 text-[#00ffff] font-mono text-[10px] rounded px-1 min-w-[120px] focus:outline-none"
              >
                {availableLifestyles.map(l => (
                  <option 
                    key={l.name} 
                    value={l.name} 
                    disabled={currentLevel < l.levelReq}
                    className={currentLevel < l.levelReq ? 'text-stone-600' : ''}
                  >
                    {l.name} {currentLevel < l.levelReq ? `(Lvl ${l.levelReq}🔒)` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Output Tone (Mood)</label>
              <select 
                value={mood} 
                onChange={(e) => onUpdateMood(e.target.value)}
                className="bg-stone-900 border border-stone-800 text-emerald-400 font-mono text-[10px] rounded px-1 min-w-[120px] focus:outline-none"
              >
                <option value="calm">Calm</option>
                <option value="focused">Focused</option>
                <option value="alert">Alert</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Output Length</label>
              <select 
                value={outputLength} 
                onChange={(e) => onUpdateOutputLength(e.target.value)}
                className="bg-stone-900 border border-stone-800 text-[#b700ff] font-mono text-[10px] rounded px-1 min-w-[120px] focus:outline-none"
              >
                <option value="brief">Brief</option>
                <option value="at length">At Length</option>
                <option value="talkative">Talkative</option>
              </select>
            </div>
          </div>
        </div>

        {/* Evolution Center Active Access Button */}
        <div className="border-t border-stone-800 pt-2.5 mt-1">
          <button
            onClick={() => setIsEvolutionCenterOpen(true)}
            id="open-evolution-btn"
            className="w-full py-2 bg-gradient-to-r from-cyan-500/20 via-purple-600/20 to-pink-500/20 hover:from-cyan-500/35 hover:to-pink-500/35 border border-cyan-500/30 hover:border-cyan-400/70 rounded-xl text-[10px] font-mono text-cyan-400 font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_20px_rgba(0,255,255,0.25)] cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400 animate-bounce" />
            SYNAPSE EVOLUTION OS ({currentLevel}/200)
          </button>
        </div>
      </div>

      {/* FULL-SCREEN RETRO-CYBER COGNITIVE EVOLUTION CENTER MODAL */}
      {isEvolutionCenterOpen && (
        <div id="evolution-center-overlay" className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border-2 border-cyan-500 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-4 border-b-2 border-cyan-950 flex justify-between items-center font-mono">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />
                <div>
                  <h2 className="text-cyan-400 font-bold text-sm tracking-wider uppercase">JOEY PALMA AI // COGNITIVE EVOLUTION ENGINE</h2>
                  <p className="text-[10px] text-slate-500">REAL-TIME SYNAPSE METADATA & REWARDS DISPENSER</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEvolutionCenterOpen(false)}
                className="p-1.5 rounded-lg border border-slate-800 hover:border-red-500/50 hover:bg-red-950/20 text-slate-400 hover:text-red-400 transition-all duration-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-4 p-6">
              
              {/* Left Column: Stats and Equippable Lifestyles */}
              <div className="md:col-span-5 flex flex-col gap-4 overflow-y-auto pr-1">
                
                {/* Active Level Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">Active Neural Level</span>
                    <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-bold animate-pulse">
                      LVL {currentLevel}/200
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-200 mb-1">{activeLevelObj?.name}</h3>
                  <p className="text-xs text-slate-400 italic mb-4">"{activeLevelObj?.status}"</p>

                  {activeLevelObj?.isPun && (
                    <div className="bg-yellow-950/40 border border-yellow-800/60 rounded-lg p-2 text-[10px] text-yellow-400 mb-4 flex items-start gap-2">
                      <Flame className="w-4 h-4 text-yellow-500 shrink-0" />
                      <div>
                        <span className="font-bold">Neural Joke/Pun State:</span> 10% of Joey's network status milestones contain classic security, hacker, and coder jokes to keep your system light!
                      </div>
                    </div>
                  )}

                  {/* Level Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Synaptic Energy</span>
                      <span className="text-cyan-400 font-bold">{currentXp} XP</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
                        style={{ width: `${Math.min(100, Math.max(5, (currentXp % 100)))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Available Lifestyles / Lifestyles Selector */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono flex-1 flex flex-col min-h-[250px]">
                  <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Unlocked Lifestyles</h4>
                  </div>

                  <p className="text-[10px] text-slate-500 mb-3">
                    As Joey evolves, he unlocks new personalities, careers, and walks-of-life that change his outputs and style. Select an unlocked persona to equip it:
                  </p>

                  <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] pr-1">
                    {availableLifestyles.map(l => {
                      const isUnlocked = currentLevel >= l.levelReq;
                      const isCurrent = persona === l.name;
                      
                      return (
                        <div 
                          key={l.name}
                          className={`border rounded-lg p-2.5 transition-all duration-200 flex flex-col justify-between gap-2 ${
                            isCurrent 
                              ? 'bg-cyan-950/20 border-cyan-500/80' 
                              : isUnlocked 
                                ? 'bg-slate-900/50 border-slate-800 hover:bg-slate-900 hover:border-slate-700' 
                                : 'bg-slate-950 border-slate-900 opacity-60'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-200">{l.name}</span>
                                {!isUnlocked && <span className="text-[8px] bg-red-950 text-red-400 border border-red-900 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">Lvl {l.levelReq}🔒</span>}
                                {isUnlocked && isCurrent && <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">EQUIPPED</span>}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1 leading-snug">{l.desc}</p>
                            </div>
                          </div>

                          {isUnlocked && !isCurrent && (
                            <button
                              onClick={() => {
                                onUpdatePersona(l.name);
                                setHudMessage(`🔄 [AESTHETIC BRIDGE OPTIMIZED] Equipping lifestyle: "${l.name}". Joey's style has adapted!`);
                              }}
                              className="w-full py-1 text-center bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-400 text-[10px] font-bold tracking-widest uppercase rounded border border-cyan-800 transition-all duration-200 cursor-pointer"
                            >
                              EQUIP IDENTITY
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: 199 Level Milestones Explorer */}
              <div className="md:col-span-7 flex flex-col gap-4 overflow-hidden">
                
                {/* Search and Filter Panel */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Search Milestone Database</span>
                    <input 
                      type="text"
                      placeholder="Filter by level, title, description, or puns..."
                      value={evolutionSearch}
                      onChange={(e) => setEvolutionSearch(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1 border-t border-slate-800/60 pt-2.5">
                    {(['all', 'puns', 'unlocked', 'locked'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setEvolutionTab(tab)}
                        className={`px-3 py-1 text-[9px] uppercase tracking-wider font-bold rounded border transition-all duration-200 cursor-pointer ${
                          evolutionTab === tab 
                            ? 'bg-cyan-950 text-cyan-400 border-cyan-800 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                            : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {tab === 'puns' ? '😂 Neural Puns (10%)' : tab === 'unlocked' ? '✅ Unlocked' : tab === 'locked' ? '🔒 Locked' : 'All Milestones'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Explorer Scroll Area */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex-1 flex flex-col overflow-hidden font-mono">
                  <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">199 Levels Neural Roadmap</h4>
                    </div>
                    <span className="text-[10px] text-slate-500">{filteredMilestones.length} nodes found</span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {filteredMilestones.map(m => {
                      const isUnlocked = currentLevel >= m.level;
                      const isSelected = selectedMilestoneLevel === m.level;
                      const levelReward = m.reward;
                      const isClaimed = claimedRewards.includes(levelReward?.value || '');
                      
                      return (
                        <div 
                          key={m.level}
                          onClick={() => setSelectedMilestoneLevel(isSelected ? null : m.level)}
                          className={`border rounded-lg p-3 transition-all duration-200 cursor-pointer flex flex-col gap-2 ${
                            isSelected 
                              ? 'bg-slate-900 border-cyan-500' 
                              : isUnlocked 
                                ? 'bg-slate-900/30 border-slate-800 hover:bg-slate-900/60 hover:border-slate-700' 
                                : 'bg-slate-950 border-slate-900 opacity-50 hover:opacity-75'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono border ${
                                isUnlocked 
                                  ? 'bg-cyan-950/60 text-cyan-400 border-cyan-900' 
                                  : 'bg-stone-900 text-stone-500 border-stone-800'
                              }`}>
                                LEVEL {m.level}
                              </span>
                              <span className="text-xs font-bold text-slate-200">{m.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {m.isPun && <span className="text-[8px] bg-yellow-950 text-yellow-400 border border-yellow-900 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">😂 PUN</span>}
                              {isUnlocked ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-stone-600" />}
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {(isSelected || m.level === currentLevel) && (
                            <div className="mt-2 text-[11px] text-slate-400 border-t border-slate-800 pt-2 space-y-2 leading-relaxed">
                              <p className="italic">"{m.status}"</p>
                              
                              {levelReward && (
                                <div className="bg-cyan-950/20 border border-cyan-900/60 rounded p-2 mt-2 flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[10px] uppercase">
                                    <Gift className="w-3.5 h-3.5 text-yellow-400" />
                                    REWARD DISPENSED: {levelReward.value}
                                  </div>
                                  <p className="text-[10px] text-slate-300 leading-snug">{levelReward.desc}</p>
                                  <p className="text-[8px] text-slate-500 uppercase font-mono tracking-widest">Type: {levelReward.type}</p>
                                  
                                  {isUnlocked && (
                                    <div className="mt-2 pt-1.5 border-t border-cyan-900/40">
                                      {isClaimed ? (
                                        <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                          <CheckCircle className="w-3.5 h-3.5" /> STORED SECURELY IN VAULT
                                        </div>
                                      ) : (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            claimRewardToVault(levelReward.value, levelReward.desc, m.level);
                                          }}
                                          className="px-2.5 py-1 bg-yellow-500/10 hover:bg-yellow-500/25 text-yellow-400 border border-yellow-500/30 rounded text-[9px] font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer"
                                        >
                                          CLAIM & FILE TO SECURE VAULT
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Dynamic HUD Toast Notification */}
      {hudMessage && (
        <div id="joey-hud-toast" className="fixed bottom-6 right-6 z-[9999] max-w-sm bg-slate-950/95 border-2 border-[#00ffff] rounded-xl p-4 shadow-[0_0_30px_rgba(0,255,255,0.4)] font-mono text-[11px] leading-relaxed text-slate-200">
          <div className="flex items-center gap-2 mb-1.5 text-[#00ffff] font-bold uppercase tracking-wider text-[10px]">
            <Zap className="w-3.5 h-3.5 text-pink-500 animate-bounce" />
            <span>JOEY_OS SYSTEM BROADCAST</span>
          </div>
          <div>{hudMessage}</div>
        </div>
      )}

    </div>
  );
}
