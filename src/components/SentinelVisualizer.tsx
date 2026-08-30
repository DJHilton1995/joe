import React, { useEffect, useState, useMemo } from 'react';
import { db, auth, handleFirestoreError, OperationType, collection, query, orderBy, limit, addDoc, serverTimestamp, onSnapshot } from '../firebase';
import { Shield, ShieldAlert, Cpu } from 'lucide-react';

interface SecurityLog {
  logId: string;
  type: string;
  timestamp: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
}

interface MemoryInsight {
  id: string;
  insight: string;
  timestamp: any;
}

interface SentinelVisualizerProps {
  logs: SecurityLog[];
  latestInsight?: string; // Passed down from the parent when a new insight is returned by the server
}

export default function SentinelVisualizer({ logs: passedLogs, latestInsight }: SentinelVisualizerProps) {
  const [memories, setMemories] = useState<MemoryInsight[]>([]);
  const [systemLogs, setSystemLogs] = useState<SecurityLog[]>([]);
  const [stats, setStats] = useState({ blacklistSize: 0, shieldMemorySize: 0 });

  // Fetch real server security logs
  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch('/api/security/logs');
        if (!response.ok) return;
        const data = await response.json();
        if (data.success && data.logs) {
          const formatted = data.logs.map((l: any) => ({
            logId: l.logId,
            type: l.type,
            timestamp: l.timestamp,
            severity: l.severity,
            details: l.details
          }));
          setSystemLogs(formatted);
          setStats({
            blacklistSize: data.blacklistSize,
            shieldMemorySize: data.shieldMemorySize
          });
        }
      } catch (err) {
        console.warn("Failed to fetch server security logs:", err);
      }
    }

    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  // Fetch memories from Firestore
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(
      collection(db, 'memories', auth.currentUser.uid, 'insights'),
      orderBy('timestamp', 'desc'),
      limit(15)
    );
    
    const path = `memories/${auth.currentUser.uid}/insights`;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMemories: MemoryInsight[] = [];
      snapshot.forEach((doc) => {
        fetchedMemories.push({ id: doc.id, ...doc.data() } as MemoryInsight);
      });
      setMemories(fetchedMemories);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  useEffect(() => {
    async function persistInsight() {
      if (!latestInsight || !auth.currentUser) return;
      const path = `memories/${auth.currentUser.uid}/insights`;
      try {
        await addDoc(collection(db, 'memories', auth.currentUser.uid, 'insights'), {
          insight: latestInsight,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    }
    persistInsight();
  }, [latestInsight, auth.currentUser]);

  const logEvents = useMemo(() => {
    const combined = [...passedLogs, ...systemLogs];
    // Sort chronologically
    return combined.sort((a, b) => {
      const timeA = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp).getTime();
      const timeB = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp).getTime();
      return timeA - timeB;
    }).slice(-50);
  }, [passedLogs, systemLogs]);

  return (
    <div className="flex flex-col gap-4">
      {/* Real-time Threat Logs & DDoS Monitor */}
      <div className="w-full bg-[#07090e] border border-stone-800 rounded-xl overflow-hidden relative p-4 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
           <div className="flex items-center gap-2">
             <span className={`w-2 h-2 rounded-full ${logEvents.length > 0 ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`}></span>
             <span className="text-[10px] font-mono font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
               <Shield className="w-3.5 h-3.5 text-cyan-400" />
               Joey Active DDoS & Impersonation Shield
             </span>
           </div>
           <div className="flex items-center gap-3 text-[9px] font-mono text-stone-500 uppercase">
             <span>Shield Cooldowns: <span className="text-cyan-400 font-bold">{stats.shieldMemorySize} IPs</span></span>
             <span className="text-stone-700">|</span>
             <span>Blacklist: <span className="text-red-500 font-bold">{stats.blacklistSize} IPs</span></span>
           </div>
        </div>
        
        {/* Graph representation of intrusion severity */}
        <div className="h-28 flex items-end gap-1 pb-1 pt-4 border-b border-stone-900 overflow-x-auto">
          {logEvents.length === 0 ? (
             <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-600 font-mono italic">
                No real-world DDoS or spoofing violations detected. System stable.
             </div>
          ) : (
             logEvents.map((log, index) => {
               const heightPercentage = log.severity === 'critical' ? '100%' : log.severity === 'high' ? '75%' : log.severity === 'medium' ? '50%' : '25%';
               const bgColor = log.severity === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : log.severity === 'high' ? 'bg-orange-500' : log.severity === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500';
               
               return (
                 <div 
                   key={log.logId || index} 
                   className={`w-3.5 ${bgColor} rounded-t-sm opacity-80 hover:opacity-100 transition-all cursor-crosshair group relative`}
                   style={{ height: heightPercentage }}
                 >
                   <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block whitespace-nowrap bg-black border border-stone-700 text-stone-300 text-[9px] px-2.5 py-1.5 rounded z-30 shadow-2xl">
                     <span className="font-bold text-white block">{log.type}</span>
                     <span className="text-stone-400 block text-[8px] mt-0.5">{log.details}</span>
                     <span className="text-[7px] text-stone-500 uppercase block mt-1">Severity: {log.severity}</span>
                   </div>
                 </div>
               );
             })
          )}
        </div>

        {/* Real-time textual scrollable logs */}
        <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
          <span className="text-[8px] font-mono text-stone-600 uppercase tracking-widest block mb-1">Live Firewall Event Log</span>
          {logEvents.length === 0 ? (
             <div className="text-[9px] text-stone-700 font-mono italic">
               Waiting for real network metrics...
             </div>
          ) : (
            [...logEvents].reverse().map((log) => {
              const borderCol = log.severity === 'critical' ? 'border-red-900/40 bg-red-950/10' : log.severity === 'high' ? 'border-orange-900/40 bg-orange-950/10' : 'border-stone-800 bg-stone-900/20';
              const textCol = log.severity === 'critical' ? 'text-red-400' : log.severity === 'high' ? 'text-orange-400' : 'text-stone-300';
              const dateStr = typeof log.timestamp === 'number' ? new Date(log.timestamp).toLocaleTimeString() : 'RECENT';
              return (
                <div key={log.logId} className={`border ${borderCol} rounded p-2 flex items-start justify-between gap-4 font-mono text-[9px] transition-colors`}>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1 h-1 rounded-full ${log.severity === 'critical' ? 'bg-red-500' : 'bg-orange-400'}`}></span>
                      <span className={`font-bold uppercase ${textCol}`}>{log.type}</span>
                    </div>
                    <p className="text-stone-400 leading-normal">{log.details}</p>
                  </div>
                  <span className="text-stone-600 shrink-0 text-[8px]">{dateStr}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Memory Bank */}
      <div className="w-full min-h-32 bg-[#0d091e]/80 border border-[#21153b] rounded-xl p-4 flex flex-col gap-3 shadow-[0_0_15px_rgba(33,21,59,0.5)]">
        <div className="flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
           <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest text-glow-3d">Joey Episodic Memory Bank</span>
        </div>
        
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
          {auth.currentUser ? (
            memories.length > 0 ? (
              memories.map((mem) => (
                <div key={mem.id} className="bg-black/50 border border-cyan-900/40 rounded p-2 text-[10px] font-mono text-cyan-100 flex flex-col gap-1">
                   <div className="text-cyan-500/70 text-[8px] flex justify-between">
                     <span>ID: {mem.id.slice(0, 8)}</span>
                     <span>{mem.timestamp?.toDate ? mem.timestamp.toDate().toLocaleTimeString() : 'Recent'}</span>
                   </div>
                   <p>{mem.insight}</p>
                </div>
              ))
            ) : (
              <div className="text-[10px] text-cyan-700/50 font-mono italic p-2 text-center">
                Memory bank empty. Engage in dialogue to populate insights.
              </div>
            )
          ) : (
            <div className="text-[10px] text-pink-500/70 font-mono italic p-2 text-center border border-pink-500/20 rounded bg-pink-500/5">
              Secure core offline. Authenticate to sync and decrypt memories.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
