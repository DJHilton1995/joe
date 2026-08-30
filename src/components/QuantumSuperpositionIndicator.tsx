import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldAlert, Cpu, CheckCircle, HelpCircle, Activity, Key, Fingerprint, Lock } from 'lucide-react';
import { SuperpositionData } from '../utils/quantumCrypto';

interface QuantumSuperpositionIndicatorProps {
  superposition?: SuperpositionData;
  role: string;
}

export default function QuantumSuperpositionIndicator({ superposition, role }: QuantumSuperpositionIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!superposition) return null;

  const { is_measured, collapsed_state, confidence, verification_reason, states } = superposition;
  
  const isGenuine = collapsed_state === 'GENUINE';
  const isSpoofed = collapsed_state === 'SPOOFED';
  
  // Status styling configurations
  const statusConfig = {
    GENUINE: {
      color: '#00ffff',
      bgColor: 'rgba(0, 255, 255, 0.08)',
      borderColor: '#00ffff',
      glow: 'shadow-[0_0_12px_rgba(0,255,255,0.3)] border-[#00ffff]/40',
      icon: CheckCircle,
      text: 'ATT_GENUINE // PASS'
    },
    SPOOFED: {
      color: '#ff007f',
      bgColor: 'rgba(255, 0, 127, 0.08)',
      borderColor: '#ff007f',
      glow: 'shadow-[0_0_15px_rgba(255,0,127,0.5)] border-[#ff007f]/50 animate-pulse',
      icon: ShieldAlert,
      text: 'TAMPER_SPOOFED // BLOCK'
    },
    UNCERTAIN: {
      color: '#ffaa00',
      bgColor: 'rgba(255, 170, 0, 0.08)',
      borderColor: '#ffaa00',
      glow: 'shadow-[0_0_10px_rgba(255,170,0,0.3)] border-[#ffaa00]/30',
      icon: HelpCircle,
      text: 'ATT_UNKNOWN // QUARANTINE'
    }
  }[collapsed_state || 'GENUINE'];

  return (
    <div className="mt-2 pt-2 border-t border-white/5 font-mono text-[9px] w-full selection:bg-cyan-500/20">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-stone-400">
          <Activity className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-[8px] text-stone-400">
            Quantum Attestation:
          </span>
          {is_measured ? (
            <span className="text-[8px] bg-white/5 px-1 py-0.5 rounded text-white/70 font-semibold uppercase">
              Collapsed State
            </span>
          ) : (
            <span className="text-[8px] bg-purple-950/40 px-1 py-0.5 rounded text-[#b700ff] border border-[#b700ff]/30 animate-pulse">
              Superimposed
            </span>
          )}
        </div>

        {/* Status Badge Toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md border font-black uppercase tracking-tight text-[9px] transition-all cursor-pointer ${statusConfig.glow} hover:brightness-125`}
          style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
          title="Click to audit TPM 2.0 cryptographic details"
        >
          <statusConfig.icon className="w-3 h-3" />
          <span>{statusConfig.text}</span>
          <span className="text-[7px] text-white/55 ml-1">
            {isOpen ? '▲ CLOSE_AUDIT' : '▼ AUDIT_REGISTERS'}
          </span>
        </button>
      </div>

      {/* Collapse/Attestation interactive panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden mt-2 bg-black/75 border border-white/10 rounded-lg p-2.5 space-y-2.5 relative"
          >
            {/* Background Diagonal Glimmer */}
            <div className="absolute inset-0 glimmer-diagonal-overlay pointer-events-none opacity-10" />

            {/* Verification message banner */}
            <div className="bg-white/5 border border-white/10 p-2 rounded-md flex items-start gap-1.5">
              <Shield className="w-3.5 h-3.5 shrink-0 text-white/70 mt-0.5" />
              <div>
                <p className="text-white/90 font-bold uppercase tracking-tight text-[8px]">
                  Measurement Result
                </p>
                <p className="text-stone-300 leading-normal mt-0.5 text-[8px]">
                  {verification_reason}
                </p>
              </div>
            </div>

            {/* Superposition Probability Distributions */}
            <div>
              <span className="text-[7.5px] uppercase text-stone-400 font-bold tracking-wider">
                Measurement Probabilities (Quantum State Vector)
              </span>
              <div className="space-y-1.5 mt-1.5">
                {/* Genuine meter */}
                <div>
                  <div className="flex justify-between text-[7px] text-stone-300">
                    <span>Ψ_GENUINE (Hardware Signature Key validated)</span>
                    <span className="font-bold text-[#00ffff]">{(states.genuine.probability * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden mt-0.5">
                    <motion.div 
                      className="h-full bg-cyan-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${states.genuine.probability * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Spoofed meter */}
                <div>
                  <div className="flex justify-between text-[7px] text-stone-300">
                    <span>Ψ_SPOOFED (Integrity compromised / packet altered)</span>
                    <span className="font-bold text-[#ff007f]">{(states.spoofed.probability * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden mt-0.5">
                    <motion.div 
                      className="h-full bg-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${states.spoofed.probability * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Uncertain meter */}
                <div>
                  <div className="flex justify-between text-[7px] text-stone-300">
                    <span>Ψ_UNCERTAIN (Out-of-sync / timing anomalies)</span>
                    <span className="font-bold text-[#ffaa00]">{(states.uncertain.probability * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden mt-0.5">
                    <motion.div 
                      className="h-full bg-orange-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${states.uncertain.probability * 100}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic Proof Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border-t border-white/5 pt-2 text-[7.5px] leading-tight text-stone-400">
              <div className="space-y-1">
                <div className="flex items-center gap-1 font-semibold uppercase">
                  <Key className="w-3 h-3 text-pink-500" />
                  <span>Derived Enclave Key Active</span>
                </div>
              </div>
            </div>
            {/* Metadata Footer */}
            <div className="flex justify-between items-center text-[7px] text-stone-500 border-t border-white/5 pt-1.5">
              <div className="font-semibold text-white/55">
                Confidence Level: {(confidence * 100).toFixed(1)}%
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
