import React, { useState, useEffect, useRef } from 'react';

interface DecapsulationTextProps {
  children: string;
  className?: string;
}

export default function DecapsulationText({ children, className = '' }: DecapsulationTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [isDecrypted, setIsDecrypted] = useState(false);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:"<>?~`-=[]\;,./';
  
  useEffect(() => {
    let iteration = 0;
    const maxIterations = 30; // Number of scrambling frames
    const interval = setInterval(() => {
      setDisplayText(prev => {
        let newStr = '';
        for (let i = 0; i < children.length; i++) {
          // If this character has been "decrypted" (based on progress), show actual char
          if (i < (iteration / maxIterations) * children.length) {
            newStr += children[i];
          } else {
            // Otherwise show random char
            newStr += chars[Math.floor(Math.random() * chars.length)];
          }
        }
        return newStr;
      });
      
      iteration++;
      if (iteration > maxIterations) {
        clearInterval(interval);
        setDisplayText(children);
        setIsDecrypted(true);
      }
    }, 40);
    
    return () => clearInterval(interval);
  }, [children]);

  return (
    <span className={className}>
      {displayText}
    </span>
  );
}
