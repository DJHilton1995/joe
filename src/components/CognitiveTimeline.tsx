import React, { useState, useMemo } from 'react';
import { 
  History, 
  Brain, 
  Sparkles, 
  Calendar, 
  Clock, 
  Tag, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  Zap, 
  Layers, 
  ArrowDownUp, 
  TrendingUp, 
  Award,
  Shield,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CognitiveMemory, saveCognitiveMemory, deleteCognitiveMemory, updateCognitiveMemoryTags } from '../lib/cognitiveMemory';
import { EVOLUTION_LEVELS, EvolutionLevel } from '../lib/evolutionLevels';

interface CognitiveTimelineProps {
  memories: CognitiveMemory[];
  onMemoriesChange?: (updated: CognitiveMemory[]) => void;
  currentLevel: number;
  currentXp: number;
  growthStage?: string;
  persona?: string;
}

export default function CognitiveTimeline({
  memories,
  onMemoriesChange,
  currentLevel,
  currentXp,
  growthStage = 'Seed',
  persona = 'Skater'
}: CognitiveTimelineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [newMemoryText, setNewMemoryText] = useState('');
  const [newMemoryTag, setNewMemoryTag] = useState('Project');
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [scrubberValue, setScrubberValue] = useState(100);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    memories.forEach(m => {
      if (m.tags) {
        m.tags.forEach(t => set.add(t));
      }
    });
    return Array.from(set);
  }, [memories]);

  // Current evolution info from EVOLUTION_LEVELS
  const currentEvolution = useMemo(() => {
    return EVOLUTION_LEVELS.find(lvl => lvl.level === currentLevel) || EVOLUTION_LEVELS[0];
  }, [currentLevel]);

  // Next milestone level
  const nextMilestone = useMemo(() => {
    return EVOLUTION_LEVELS.find(lvl => lvl.level > currentLevel && (lvl.reward || lvl.isPun || lvl.level % 5 === 0)) || EVOLUTION_LEVELS[Math.min(currentLevel, EVOLUTION_LEVELS.length - 1)];
  }, [currentLevel]);

  // Filter and sort memories
  const processedTimeline = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    let list = [...memories].map((m, originalIdx) => ({
      ...m,
      originalIdx,
      timestamp: m.createdAt || (now - (memories.length - originalIdx) * 3600000)
    }));

    // Timeframe filter
    if (timeframeFilter === 'today') {
      list = list.filter(m => now - m.timestamp < oneDay);
    } else if (timeframeFilter === 'week') {
      list = list.filter(m => now - m.timestamp < oneDay * 7);
    } else if (timeframeFilter === 'month') {
      list = list.filter(m => now - m.timestamp < oneDay * 30);
    }

    // Tag filter
    if (selectedTag !== 'ALL') {
      list = list.filter(m => m.tags?.includes(selectedTag));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => 
        m.text.toLowerCase().includes(q) || 
        m.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort order
    list.sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.timestamp - a.timestamp;
      } else {
        return a.timestamp - b.timestamp;
      }
    });

    // Scrubber slice (percentage of timeline shown)
    if (scrubberValue < 100 && list.length > 0) {
      const maxCount = Math.max(1, Math.ceil((list.length * scrubberValue) / 100));
      list = list.slice(0, maxCount);
    }

    return list;
  }, [memories, timeframeFilter, selectedTag, searchQuery, sortOrder, scrubberValue]);

  // Handle adding new cognitive memory
  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;

    const newObj: CognitiveMemory = {
      text: newMemoryText.trim(),
      tags: [newMemoryTag],
      createdAt: Date.now()
    };

    await saveCognitiveMemory(newObj);
    const updated = [...memories, newObj];
    if (onMemoriesChange) {
      onMemoriesChange(updated);
    }
    setNewMemoryText('');
    setIsAddingOpen(false);
  };

  // Handle deleting memory
  const handleDelete = async (memory: CognitiveMemory, index: number) => {
    await deleteCognitiveMemory(memory);
    const updated = memories.filter((_, i) => i !== index);
    if (onMemoriesChange) {
      onMemoriesChange(updated);
    }
  };

  // Format date helper
  const formatDate = (ms: number) => {
    const d = new Date(ms);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      relative: getRelativeTime(ms)
    };
  };

  const getRelativeTime = (ms: number) => {
    const diff = Date.now() - ms;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  // Evolution correlation lookup based on timestamp
  const getEvolutionAtTimestamp = (timestamp: number, idx: number) => {
    // Determine relative level progression based on position in timeline
    const total = Math.max(1, memories.length);
    const ratio = (idx + 1) / total;
    const estimatedLvl = Math.max(1, Math.min(currentLevel, Math.ceil(ratio * currentLevel)));
    const evo = EVOLUTION_LEVELS.find(l => l.level === estimatedLvl) || EVOLUTION_LEVELS[0];
    return { estimatedLvl, evo };
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4 text-slate-200">
      
      {/* Header & Metric Banner */}
      <div className="bg-[#090b14]/90 border border-purple-500/30 rounded-2xl p-5 shadow-[0_0_25px_rgba(147,51,234,0.15)] relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-cyan-500/10 via-pink-500/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <History className="w-5 h-5 text-cyan-400 animate-pulse" />
              <h2 className="text-lg font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-300">
                Cognitive Evolution Timeline
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                Lvl {currentLevel} • {growthStage}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Chronological ledger tracking neural synapses, learned behavioral memories, and Joey's dynamic personality evolution across system interactions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddingOpen(!isAddingOpen)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600/30 to-purple-600/30 hover:from-cyan-500/50 hover:to-purple-500/50 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Record Memory
            </button>
          </div>
        </div>

        {/* Dynamic Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-purple-500/20 text-xs font-mono">
          <div className="bg-black/40 border border-purple-500/20 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Total Memories</div>
              <div className="text-sm font-bold text-white">{memories.length} synapses</div>
            </div>
          </div>

          <div className="bg-black/40 border border-purple-500/20 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Joey Persona</div>
              <div className="text-sm font-bold text-pink-300 truncate max-w-[110px]">{persona}</div>
            </div>
          </div>

          <div className="bg-black/40 border border-purple-500/20 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Evolution Stage</div>
              <div className="text-sm font-bold text-purple-300 truncate max-w-[110px]">
                {currentEvolution.name}
              </div>
            </div>
          </div>

          <div className="bg-black/40 border border-purple-500/20 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase">Next Milestone</div>
              <div className="text-sm font-bold text-emerald-300">Lvl {nextMilestone.level}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Memory Injection Form */}
      <AnimatePresence>
        {isAddingOpen && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddMemory}
            className="bg-[#0e0a1f] border border-cyan-500/40 rounded-2xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.15)] overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-2">
                <Brain className="w-3.5 h-3.5" /> Inject New Cognitive Anchor
              </span>
              <button
                type="button"
                onClick={() => setIsAddingOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-300 font-mono"
              >
                Cancel
              </button>
            </div>
            <div className="space-y-3">
              <textarea
                value={newMemoryText}
                onChange={(e) => setNewMemoryText(e.target.value)}
                placeholder="E.g., User prefers quantum cryptography and 80s synth aesthetics..."
                rows={2}
                className="w-full bg-black/60 border border-purple-500/30 focus:border-cyan-400 rounded-xl p-3 text-xs text-cyan-100 placeholder-slate-600 outline-none resize-none font-mono"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Category:</span>
                  {['Project', 'Personal', 'Secure', 'Art', 'Technical'].map(tag => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => setNewMemoryTag(tag)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                        newMemoryTag === tag
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                          : 'bg-black/40 text-slate-500 border border-purple-500/20 hover:text-slate-300'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={!newMemoryText.trim()}
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs font-mono font-black uppercase transition-all shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                >
                  Commit to RAM & Store
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filter & Control Toolbar */}
      <div className="bg-[#090b14]/70 border border-purple-500/20 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 backdrop-blur-sm">
        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search synaptic logs..."
            className="w-full bg-black/50 border border-purple-500/30 focus:border-cyan-400 rounded-lg pl-8 pr-3 py-1.5 text-xs text-cyan-200 placeholder-slate-600 outline-none font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tag & Timeframe Chips */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {/* Timeframe selector */}
          <div className="flex items-center bg-black/40 border border-purple-500/20 rounded-lg p-0.5 text-[10px] font-mono">
            {(['all', 'today', 'week', 'month'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframeFilter(tf)}
                className={`px-2 py-1 rounded capitalize transition-all ${
                  timeframeFilter === tf
                    ? 'bg-purple-600/40 text-pink-300 font-bold border border-purple-400/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Tag filter */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-xs py-0.5">
            <button
              onClick={() => setSelectedTag('ALL')}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono uppercase transition-all ${
                selectedTag === 'ALL'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50'
                  : 'bg-black/30 text-slate-500 border border-purple-500/10 hover:text-slate-300'
              }`}
            >
              All Tags
            </button>
            {allTags.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono uppercase whitespace-nowrap transition-all ${
                  selectedTag === t
                    ? 'bg-pink-950/80 text-pink-300 border border-pink-500/50'
                    : 'bg-black/30 text-slate-500 border border-purple-500/10 hover:text-slate-300'
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        </div>

        {/* Sort & Scrubber controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-purple-500/30 hover:border-cyan-400 text-slate-400 hover:text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-all"
            title="Toggle chronological direction"
          >
            <ArrowDownUp className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase font-bold">
              {sortOrder === 'desc' ? 'Newest First' : 'Genesis First'}
            </span>
          </button>
        </div>
      </div>

      {/* Chronological Timeline Stream */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-6 relative min-h-[400px]">
        {/* Central Vertical Neon Line */}
        <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500 via-pink-500 to-purple-600 -translate-x-1/2 pointer-events-none opacity-40 shadow-[0_0_10px_rgba(236,72,153,0.5)]" />

        {processedTimeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 bg-[#090b14]/40 border border-purple-500/20 rounded-2xl p-8">
            <div className="p-4 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 animate-pulse">
              <Brain className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
              No Memory Anchors in Selected Range
            </h3>
            <p className="text-xs text-slate-500 max-w-sm font-mono">
              Chat with Joey or use the "Record Memory" button to log milestones in the cognitive timeline.
            </p>
          </div>
        ) : (
          processedTimeline.map((item, idx) => {
            const isLeft = idx % 2 === 0;
            const isExpanded = expandedId === item.originalIdx;
            const dateInfo = formatDate(item.timestamp);
            const evoInfo = getEvolutionAtTimestamp(item.timestamp, idx);

            return (
              <motion.div
                key={`${item.originalIdx}-${item.timestamp}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.05, 0.5) }}
                className={`relative flex items-start gap-4 md:gap-0 ${
                  isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Center Node on Vertical Line */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-3 z-20 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-stone-950 border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-pink-500 animate-ping" style={{ animationDuration: '3s' }} />
                  </div>
                </div>

                {/* Timeline Card Container */}
                <div className={`w-full md:w-[calc(50%-2rem)] pl-12 md:pl-0 ${
                  isLeft ? 'md:pr-8' : 'md:pl-8'
                }`}>
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : item.originalIdx)}
                    className={`bg-[#0b0c16]/90 border rounded-2xl p-4 transition-all duration-300 cursor-pointer relative overflow-hidden group hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] ${
                      isExpanded 
                        ? 'border-pink-500/60 shadow-[0_0_25px_rgba(236,72,153,0.25)]' 
                        : 'border-purple-500/30 hover:border-cyan-400/50'
                    }`}
                  >
                    {/* Glowing corner accent */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-xl pointer-events-none group-hover:bg-cyan-500/10 transition-all" />

                    {/* Top Metadata Row */}
                    <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-purple-500/15">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400">
                        <Calendar className="w-3 h-3" />
                        <span>{dateInfo.date}</span>
                        <span className="text-slate-500">•</span>
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-400">{dateInfo.time}</span>
                      </div>

                      <span className="text-[9px] font-mono text-pink-400/80 bg-pink-950/40 px-2 py-0.5 rounded-full border border-pink-500/30">
                        {dateInfo.relative}
                      </span>
                    </div>

                    {/* Main Memory Text */}
                    <p className={`text-xs font-mono leading-relaxed transition-all ${
                      isExpanded ? 'text-white' : 'text-slate-300 line-clamp-3'
                    }`}>
                      {item.text}
                    </p>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.tags.map(t => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded bg-black/60 border border-cyan-500/30 text-[9px] font-mono text-cyan-300 uppercase tracking-wide"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Joey Evolution Synchronization Banner */}
                    <div className="mt-3 pt-2.5 border-t border-purple-500/15 flex items-center justify-between text-[10px] font-mono">
                      <div className="flex items-center gap-1.5 text-purple-300">
                        <Zap className="w-3 h-3 text-pink-400" />
                        <span className="font-bold text-white">Joey Lvl {evoInfo.estimatedLvl}:</span>
                        <span className="text-slate-400 truncate max-w-[140px]">{evoInfo.evo.name}</span>
                      </div>
                      <div className="text-slate-500 group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    {/* Expanded Detailed Diagnostics */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-purple-500/25 space-y-2 text-xs font-mono"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="bg-black/50 p-2.5 rounded-xl border border-purple-500/20 space-y-1.5">
                            <div className="text-[10px] text-pink-400 font-bold uppercase flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" /> Joey Persona Snapshot
                            </div>
                            <p className="text-[11px] text-slate-300 italic">
                              "{evoInfo.evo.status}"
                            </p>
                            {evoInfo.evo.reward && (
                              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/30 p-1.5 rounded border border-emerald-500/30">
                                <Award className="w-3 h-3" />
                                <span>Unlocked: {evoInfo.evo.reward.value}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[9px] text-slate-500">Synapse Anchor ID #{item.originalIdx + 1}</span>
                            <button
                              onClick={() => handleDelete(item, item.originalIdx)}
                              className="px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-[10px] flex items-center gap-1 transition-all"
                            >
                              <Trash2 className="w-3 h-3" /> Delete Memory
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

    </div>
  );
}
