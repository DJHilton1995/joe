import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, ScanFace } from 'lucide-react';

interface CameraScannerProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export default function CameraScanner({ onCapture, onClose }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let activeStream: MediaStream;
    async function setupCamera() {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' } 
        });
        setStream(activeStream);
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
        }
      } catch (err) {
        setError('Camera access denied or unavailable.');
      }
    }
    setupCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg');
      onCapture(base64);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0c101c] border border-[#00ffff] rounded-2xl overflow-hidden max-w-lg w-full shadow-[0_0_30px_rgba(0,255,255,0.2)]">
        <div className="p-3 border-b border-[#00ffff]/30 flex justify-between items-center bg-[#07090e]">
          <div className="flex items-center gap-2 text-[#00ffff] font-mono text-sm tracking-widest">
            <ScanFace className="w-4 h-4 animate-pulse" />
            <span>FACIAL SCANNER ONLINE</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#1e293b] rounded text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 relative flex flex-col items-center">
          {error ? (
            <div className="text-red-500 font-mono text-sm p-8 text-center">{error}</div>
          ) : (
            <>
              <div className="relative rounded-lg overflow-hidden border border-[#00ffff]/30 bg-black aspect-video w-full flex items-center justify-center">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-[#00ffff]/20 m-4 rounded pointer-events-none">
                  {/* Scanner UI crosshairs */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00ffff]" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00ffff]" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00ffff]" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00ffff]" />
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#00ffff]/30 animate-[ping_2s_ease-in-out_infinite]" />
                </div>
              </div>
              <button 
                onClick={takePhoto}
                className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#00ffff]/10 border border-[#00ffff] text-[#00ffff] font-mono hover:bg-[#00ffff]/20 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all rounded-lg"
              >
                <Camera className="w-5 h-5" />
                INITIATE SCAN
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
