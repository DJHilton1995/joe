import React from 'react';
import { X, Lock, Unlock } from 'lucide-react';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onSelectTheme: (theme: string) => void;
  isPaidUser: boolean;
}

export const FREE_THEMES = [
  '80s Futuristic',
  '70s Earthen',
  '90s Rave Scene'
];

export const PAID_THEMES = [
  'Martian Sands',
  'Just-Got-Out-of-Jail',
  'Y2K Partier',
  'New York Fashion Model',
  'Cookies-and-Cream Wonderland',
  'Psychedelic Come Up',
  'Gay Leather Bar',
  'Cyberpunk Dystopia',
  'Neon Noir'
];

export default function ThemeSettingsModal({ isOpen, onClose, currentTheme, onSelectTheme, isPaidUser }: ThemeSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0c101c] border border-[#00ffff]/30 w-full max-w-lg rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,255,255,0.15)] flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-[#1e293b] flex justify-between items-center bg-[#07090e]">
          <h2 className="text-xl font-bold font-mono text-[#00ffff] tracking-widest">VISUAL THEMES</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#1e293b] rounded-lg transition-colors text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Free Themes */}
          <div>
            <h3 className="text-xs font-mono text-emerald-400 mb-3 flex items-center gap-2">
              <Unlock className="w-3 h-3" /> STANDARD THEMES
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FREE_THEMES.map(theme => (
                <button
                  key={theme}
                  onClick={() => onSelectTheme(theme)}
                  className={`text-left p-3 rounded-xl border text-sm font-medium transition-all ${
                    currentTheme === theme
                      ? 'border-[#00ffff] bg-[#00ffff]/10 text-white shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                      : 'border-[#1e293b] bg-[#101726] text-slate-400 hover:border-[#00ffff]/50 hover:text-slate-200'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* Paid Themes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono text-[#b700ff] flex items-center gap-2">
                <Lock className="w-3 h-3" /> PREMIUM THEMES
              </h3>
              {!isPaidUser && (
                <span className="text-[10px] font-mono text-slate-500 bg-stone-900 px-2 py-1 rounded border border-stone-800 uppercase">
                  Pay-To-Use Version Only
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-90">
              {PAID_THEMES.map(theme => {
                const isSelected = currentTheme === theme;
                return (
                  <button
                    key={theme}
                    onClick={() => isPaidUser && onSelectTheme(theme)}
                    disabled={!isPaidUser}
                    className={`text-left p-3 rounded-xl border text-sm font-medium transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'border-[#b700ff] bg-[#b700ff]/10 text-white shadow-[0_0_15px_rgba(183,0,255,0.2)]'
                        : isPaidUser 
                          ? 'border-[#1e293b] bg-[#101726] text-slate-400 hover:border-[#b700ff]/50 hover:text-slate-200'
                          : 'border-stone-800 bg-stone-900/50 text-stone-600 cursor-not-allowed'
                    }`}
                  >
                    {!isPaidUser && (
                      <div className="absolute inset-0 bg-stone-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                        <Lock className="w-4 h-4 text-stone-400" />
                      </div>
                    )}
                    {theme}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
