import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface QuantumDecapsulatorProps {
  content: string;
  isCompleted?: boolean;
}

export default function QuantumDecapsulator({ content, isCompleted = true }: QuantumDecapsulatorProps) {
  const [displayText, setDisplayText] = useState('');
  const [isDecrypted, setIsDecrypted] = useState(isCompleted);
  const [iteration, setIteration] = useState(0);

  useEffect(() => {
    if (isCompleted) {
      setDisplayText(content);
      setIsDecrypted(true);
      return;
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const maxIterations = 40; // ~1.5 seconds of decryption
    let currentIteration = 0;

    const interval = setInterval(() => {
      currentIteration++;
      setIteration(currentIteration);
      
      let newStr = '';
      const progress = currentIteration / maxIterations;
      const revealLimit = Math.floor(progress * content.length);

      for (let i = 0; i < content.length; i++) {
        // Don't scramble markdown formatting characters or whitespace
        if (content[i] === ' ' || content[i] === '\n' || '*_#[]()!`>'.includes(content[i])) {
          newStr += content[i];
          continue;
        }
        
        if (i < revealLimit) {
          newStr += content[i];
        } else {
          newStr += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      
      setDisplayText(newStr);

      if (currentIteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(content);
        setIsDecrypted(true);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [content, isCompleted]);

  return (
    <div className={!isDecrypted ? 'font-mono opacity-80' : ''}>
      <ReactMarkdown>{displayText}</ReactMarkdown>
    </div>
  );
}
