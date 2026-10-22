import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Radio, Volume2, Sparkles, Send, Waves, X } from 'lucide-react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTranscriptToChat?: (userText: string, assistantText: string) => void;
}

interface TranscriptEntry {
  id: string;
  speaker: 'user' | 'joey';
  text: string;
  timestamp: string;
}

export default function LiveVoiceModal({ isOpen, onClose, onAddTranscriptToChat }: LiveVoiceModalProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isJoeySpeaking, setIsJoeySpeaking] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [textInput, setTextInput] = useState<string>('');

  const wsRef = useRef<WebSocket | null>(null);
  const captureContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const isMicMutedRef = useRef<boolean>(false);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  useEffect(() => {
    if (!isOpen) {
      cleanupSession();
    }
    return () => {
      cleanupSession();
    };
  }, [isOpen]);

  const stopPlaybackQueue = () => {
    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {}
    }
    activeSourcesRef.current = [];
    if (playbackContextRef.current) {
      nextStartTimeRef.current = playbackContextRef.current.currentTime;
    } else {
      nextStartTimeRef.current = 0;
    }
    setIsJoeySpeaking(false);
  };

  const cleanupSession = () => {
    stopPlaybackQueue();
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (e) {}
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (captureContextRef.current) {
      try {
        captureContextRef.current.close();
      } catch (e) {}
      captureContextRef.current = null;
    }
    if (playbackContextRef.current) {
      try {
        playbackContextRef.current.close();
      } catch (e) {}
      playbackContextRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }
    setStatus('idle');
    setMicLevel(0);
    setIsJoeySpeaking(false);
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
    }
    return btoa(binary);
  };

  const playPcm24kBase64 = (base64Data: string) => {
    if (!playbackContextRef.current) {
      playbackContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
    }
    const ctx = playbackContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const currentTime = ctx.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime + 0.02;
    }

    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;
    activeSourcesRef.current.push(source);
    setIsJoeySpeaking(true);

    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
      if (activeSourcesRef.current.length === 0) {
        setIsJoeySpeaking(false);
      }
    };
  };

  const appendTranscript = (speaker: 'user' | 'joey', text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const now = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setTranscripts((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].speaker === speaker) {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          text: `${updated[updated.length - 1].text} ${clean}`.trim(),
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: `tr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          speaker,
          text: clean,
          timestamp: now,
        },
      ];
    });
  };

  const startLiveSession = async () => {
    cleanupSession();
    setErrorMessage('');
    setStatus('connecting');

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'connected') {
            setStatus('connected');
            await startMicCapture(ws);
          } else if (msg.type === 'audio' && msg.data) {
            playPcm24kBase64(msg.data);
          } else if (msg.type === 'interrupted') {
            stopPlaybackQueue();
          } else if (msg.type === 'input_transcript' && msg.text) {
            appendTranscript('user', msg.text);
          } else if (msg.type === 'output_transcript' && msg.text) {
            appendTranscript('joey', msg.text);
          } else if (msg.type === 'text' && msg.text) {
            appendTranscript('joey', msg.text);
          } else if (msg.type === 'error') {
            setErrorMessage(msg.message || 'Live voice error occurred.');
            setStatus('error');
          }
        } catch (err) {
          console.error('Error parsing Live WS message:', err);
        }
      };

      ws.onerror = () => {
        setErrorMessage('WebSocket connection error to Gemini 3.8 Live bridge.');
        setStatus('error');
      };

      ws.onclose = () => {
        setStatus((prev) => (prev === 'error' ? 'error' : 'idle'));
      };
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not start Live voice session.');
      setStatus('error');
    }
  };

  const startMicCapture = async (ws: WebSocket) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      captureContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioCtx.destination);

      processor.onaudioprocess = (e) => {
        if (isMicMutedRef.current || ws.readyState !== WebSocket.OPEN) {
          setMicLevel(0);
          return;
        }
        const inputData = e.inputBuffer.getChannelData(0);
        let sumSq = 0;
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const sample = Math.max(-1, Math.min(1, inputData[i]));
          sumSq += sample * sample;
          pcm16[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        }
        const rms = Math.sqrt(sumSq / inputData.length);
        setMicLevel(Math.min(100, Math.round(rms * 350)));

        const base64Audio = arrayBufferToBase64(pcm16.buffer);
        ws.send(JSON.stringify({ type: 'audio', data: base64Audio }));
      };
    } catch (micErr: any) {
      setErrorMessage(`Microphone access unavailable (${micErr.message}). You can still send live text turns below.`);
    }
  };

  const handleSendLiveText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const clean = textInput.trim();
    wsRef.current.send(JSON.stringify({ type: 'text', text: clean }));
    appendTranscript('user', clean);
    setTextInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
      <div className="relative w-full max-w-2xl bg-[#090d1a] border-2 border-[#00ffff]/60 rounded-2xl shadow-[0_0_40px_rgba(0,255,255,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Neon Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00ffff] via-[#ff007f] to-[#b700ff]" />

        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0d1326]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-[#00ffff]/50 flex items-center justify-center">
              <Radio className={`w-5 h-5 text-[#00ffff] ${status === 'connected' ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h2 className="text-sm font-black font-mono text-white tracking-wider uppercase flex items-center gap-2">
                JOEY LIVE VOICE COMMS
                <span className="text-[9px] px-2 py-0.5 rounded bg-fuchsia-950/80 border border-fuchsia-500/40 text-fuchsia-300">
                  gemini-3.8-live
                </span>
              </h2>
              <p className="text-[10px] font-mono text-slate-400">
                Real-time low-latency bidirectional PCM voice link (16kHz In / 24kHz Out)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              cleanupSession();
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-rose-500 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visualizer & Status Stage */}
        <div className="p-6 flex flex-col items-center justify-center bg-gradient-to-b from-[#0b1021] to-[#070912] border-b border-slate-800/80 relative">
          <div className="relative w-32 h-32 rounded-full flex items-center justify-center border-2 border-[#00ffff]/40 bg-[#050811] shadow-[0_0_30px_rgba(0,255,255,0.15)]">
            {status === 'connected' && (
              <div
                className="absolute inset-0 rounded-full border-2 border-[#ff007f] transition-transform duration-75 pointer-events-none"
                style={{
                  transform: `scale(${1 + (isJoeySpeaking ? 0.28 : micLevel / 250)})`,
                  opacity: isJoeySpeaking ? 0.85 : Math.max(0.25, micLevel / 100),
                }}
              />
            )}
            <div className="flex items-end gap-1 h-12">
              {[0, 1, 2, 3, 4, 5, 6].map((bar) => {
                const activeHeight =
                  status === 'connected'
                    ? isJoeySpeaking
                      ? 16 + ((bar * 13 + Date.now() / 50) % 32)
                      : Math.max(8, Math.min(44, (micLevel * ((bar % 3) + 1)) / 2.2))
                    : 8;
                return (
                  <div
                    key={bar}
                    className={`w-2 rounded-full transition-all duration-100 ${
                      isJoeySpeaking ? 'bg-[#ff007f]' : status === 'connected' ? 'bg-[#00ffff]' : 'bg-slate-700'
                    }`}
                    style={{ height: `${activeHeight}px` }}
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-4 text-center">
            {status === 'idle' && (
              <span className="text-xs font-mono text-slate-400">
                Press <strong className="text-[#00ffff]">INITIALIZE LIVE VOICE LINK</strong> to speak with Joey in real time.
              </span>
            )}
            {status === 'connecting' && (
              <span className="text-xs font-mono text-amber-400 animate-pulse">
                Establishing encrypted WebSocket handshake with gemini-3.8-live...
              </span>
            )}
            {status === 'connected' && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-2 justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {isJoeySpeaking
                  ? 'JOEY SPEAKING (24kHz PCM STREAM) — Speak anytime to interrupt'
                  : isMicMuted
                  ? 'MICROPHONE MUTED'
                  : 'LISTENING ON 16kHz PCM CHANNEL...'}
              </span>
            )}
            {status === 'error' && (
              <span className="text-xs font-mono text-rose-400">{errorMessage}</span>
            )}
          </div>

          {/* Primary Call Controls */}
          <div className="mt-5 flex items-center gap-3">
            {status !== 'connected' ? (
              <button
                onClick={startLiveSession}
                disabled={status === 'connecting'}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00ffff] to-[#0284c7] text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:brightness-110 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Mic className="w-4 h-4" />
                {status === 'connecting' ? 'Connecting...' : 'Initialize Live Voice Link'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`px-4 py-2.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider border transition flex items-center gap-2 cursor-pointer ${
                    isMicMuted
                      ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-[#00ffff]/50 text-[#00ffff] hover:bg-cyan-950/40'
                  }`}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
                </button>

                <button
                  onClick={cleanupSession}
                  className="px-4 py-2.5 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-300 hover:bg-rose-900 font-mono font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  End Link
                </button>
              </>
            )}
          </div>
        </div>

        {/* Live Transcript Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[#060810] min-h-[160px] max-h-[240px]">
          {transcripts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 font-mono text-[11px] py-8">
              <Waves className="w-6 h-6 mb-1.5 opacity-40" />
              Real-time voice transcriptions will appear here during your conversation.
            </div>
          ) : (
            transcripts.map((item) => (
              <div
                key={item.id}
                className={`flex ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-xl px-3 py-2 text-xs font-mono ${
                    item.speaker === 'user'
                      ? 'bg-cyan-950/60 border border-[#00ffff]/40 text-cyan-100'
                      : 'bg-purple-950/50 border border-fuchsia-500/40 text-fuchsia-100'
                  }`}
                >
                  <div className="text-[9px] uppercase font-bold opacity-60 mb-0.5 flex justify-between gap-3">
                    <span>{item.speaker === 'user' ? 'BOSS (YOU)' : 'JOEY AI'}</span>
                    <span>{item.timestamp}</span>
                  </div>
                  <div>{item.text}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Text Turn Input & Export to Chat */}
        <div className="p-3 bg-[#0b1021] border-t border-slate-800 flex items-center gap-2">
          <form onSubmit={handleSendLiveText} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={status !== 'connected'}
              placeholder={
                status === 'connected'
                  ? 'Or type a live turn message to Joey...'
                  : 'Connect Live Voice Link above to speak or message...'
              }
              className="flex-1 bg-black/60 border border-slate-700 focus:border-[#00ffff] rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status !== 'connected' || !textInput.trim()}
              className="p-2 rounded-lg bg-[#00ffff]/20 border border-[#00ffff]/50 text-[#00ffff] hover:bg-[#00ffff]/30 disabled:opacity-40 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {transcripts.length > 0 && onAddTranscriptToChat && (
            <button
              onClick={() => {
                const summary = transcripts
                  .map((t) => `**${t.speaker === 'user' ? 'Boss' : 'Joey'}:** ${t.text}`)
                  .join('\n\n');
                onAddTranscriptToChat('Live Voice Session', `**[GEMINI 3.8 LIVE VOICE TRANSCRIPT]**\n\n${summary}`);
                onClose();
              }}
              className="px-3 py-2 rounded-lg bg-fuchsia-950/60 border border-fuchsia-500/50 text-fuchsia-300 hover:border-fuchsia-400 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Save to Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
