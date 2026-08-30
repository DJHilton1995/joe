import React, { useState } from 'react';
import { Shield, Lock, Terminal, Activity, Settings, MessageSquare, Sparkles } from 'lucide-react';

interface CollapsibleWheelMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function CollapsibleWheelMenu({ activeTab, setActiveTab }: CollapsibleWheelMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverAngle, setHoverAngle] = useState(-90);

  const handleSliceClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, angle: -90 },
    { id: 'code', label: 'Canvas', icon: Terminal, angle: -38 },
    { id: 'vault', label: 'Vault', icon: Lock, angle: 13 },
    { id: 'sentinel', label: 'Sentinel', icon: Shield, angle: 64 },
    { id: 'synthesis', label: 'Synthesis', icon: Sparkles, angle: 115 },
    { id: 'growth', label: 'Growth', icon: Activity, angle: 166 },
    { id: 'settings', label: 'Settings', icon: Settings, angle: 217 },
  ];

  return (
    <div className="relative z-50 flex items-center justify-center">
      {/* The Baseball Cap Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-20 w-14 h-14 bg-stone-900 border-2 border-stone-700 rounded-full flex items-center justify-center transition-all duration-500 overflow-hidden group shadow-lg shadow-black/50 hover:border-cyan-500/50"
      >
        <div className={`absolute inset-0 bg-cyan-900/20 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
        <div 
          className="relative transition-transform duration-500 ease-out flex items-center justify-center"
          style={{ transform: `rotate(${hoverAngle}deg)` }}
        >
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* The bill pointing to the RIGHT by default (0 degrees) */}
            <path d="M45 25 C75 25 95 38 95 50 C95 62 75 75 45 75 Z" fill="#0ea5e9"/> 
            {/* The crown */}
            <circle cx="45" cy="50" r="30" fill="#0284c7" />
            <circle cx="45" cy="50" r="28" fill="#0369a1" />
            {/* Stitching / panels */}
            <path d="M45 22 C45 22 55 50 45 78" stroke="#0ea5e9" strokeWidth="2" fill="none" />
            <path d="M17 50 C17 50 45 40 73 50" stroke="#0ea5e9" strokeWidth="2" fill="none" />
            {/* A button on top */}
            <circle cx="45" cy="50" r="5" fill="#38bdf8" />
          </svg>
        </div>
      </button>

      {/* The Slices */}
      <div 
        className={`absolute inset-0 pointer-events-none flex items-center justify-center transition-all duration-700 ease-out`}
      >
        {tabs.map((tab, idx) => {
          const radius = isOpen ? 100 : 0; 
          const rad = (tab.angle * Math.PI) / 180;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;

          return (
            <div
              key={tab.id}
              className={`absolute transition-all duration-500 will-change-transform flex flex-col items-center justify-center ${
                isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
              style={{
                transform: `translate(${x}px, ${y}px) scale(${isOpen ? 1 : 0.5})`,
                transitionDelay: isOpen ? `${idx * 40}ms` : '0ms'
              }}
            >
              <button
                onClick={() => handleSliceClick(tab.id)}
                onMouseEnter={() => setHoverAngle(tab.angle)}
                className={`relative group w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-cyan-900/40 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                    : 'bg-stone-900 border-stone-700 hover:border-cyan-400/50 hover:bg-stone-800'
                }`}
                title={tab.label}
              >
                 <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-200'}`} />
                 <span className={`absolute -bottom-6 text-[9px] font-mono whitespace-nowrap bg-black px-1.5 rounded text-slate-300 transition-opacity ${isOpen ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}>
                   {tab.label}
                 </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
