import React, { useEffect, useState, useRef } from 'react';

interface SplashProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashProps> = ({ onComplete }) => {
  const [logLines, setLogLines] = useState<string[]>([]);
  const [currentStatus, setCurrentStatus] = useState('Initializing System...');
  const [progressSegments, setProgressSegments] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const logContainerRef = useRef<HTMLDivElement>(null);

  const logEntries = [
    'Loading Language Engine v1.0.24...',
    'Mapping neural weights to local registry...',
    'Verifying Knowledge Pack signatures...',
    'Optimizing memory buffer for broadband connection...',
    'Connecting to OpenAI Server Cluster (NY Data Center)...',
    'Establishing Secure Socket Layer (SSL) 3.0...',
    'Indexing local vector database cache...',
    'Ready.'
  ];

  const maxSegments = 62; // Fit width for ~600px
  const duration = 5000;  // 5 seconds loading

  useEffect(() => {
    const segmentInterval = duration / maxSegments;
    const logInterval = duration / logEntries.length;

    // Progress bar segment animations
    const progressTimer = setInterval(() => {
      setProgressSegments(prev => {
        if (prev >= maxSegments) {
          clearInterval(progressTimer);
          return maxSegments;
        }
        return prev + 1;
      });
    }, segmentInterval);

    // Console logs loading list
    let currentLogIndex = 0;
    const logTimer = setInterval(() => {
      if (currentLogIndex < logEntries.length) {
        const text = logEntries[currentLogIndex];
        setCurrentStatus(text);
        
        if (currentLogIndex > 0) {
          setLogLines(prev => [...prev, logEntries[currentLogIndex - 1]]);
        }
        currentLogIndex++;
      } else {
        clearInterval(logTimer);
        setIsDone(true);
        setCurrentStatus('Initialization Complete.');
        setLogLines(prev => [...prev, logEntries[logEntries.length - 1]]);
      }
    }, logInterval);

    return () => {
      clearInterval(progressTimer);
      clearInterval(logTimer);
    };
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logLines, currentStatus]);

  const handleNext = () => {
    setIsFading(true);
    setTimeout(() => {
      onComplete();
    }, 1000); // match transition duration
  };

  return (
    <div className={`flex flex-col relative select-none w-full h-full bg-dialog-face transition-opacity duration-1000 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Top Branding Section */}
      <div className="h-[85px] bg-gradient-to-b from-white to-header-blue-bottom flex items-center px-6 border-b border-border-shadow flex-shrink-0">
        <div className="flex-grow text-left">
          <h1 className="font-display-welcome text-[20px] text-primary leading-tight tracking-tight">
            ChatGPT Professional Enterprise Suite
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-header-title text-header-title text-text-main opacity-80">Version 1.0</span>
            <span className="w-[1px] h-3 bg-border-shadow"></span>
            <span className="font-header-title text-header-title text-primary uppercase tracking-wider">Enterprise Edition</span>
          </div>
        </div>
        <div className="w-12 h-12 flex items-center justify-center bg-white outset-border shadow-sm flex-shrink-0">
          <span className="material-symbols-outlined !text-[32px] text-primary">terminal</span>
        </div>
      </div>

      {/* Central Branding Area / Technical Illustration */}
      <div className="flex-grow relative overflow-hidden bg-window-inner m-3 inset-border">
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #0c439b 0%, #051a44 100%)',
            }}
          >
            {/* Graphic network grids */}
            <div className="absolute inset-0 opacity-15" style={{
              backgroundImage: 'radial-gradient(circle, #5b9ff9 1px, transparent 1px)',
              backgroundSize: '16px 16px'
            }} />
            {/* Central glowing globe/server abstraction */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <span className="material-symbols-outlined !text-[180px] text-white animate-pulse">language</span>
            </div>
          </div>
        </div>
        
        {/* Corner Technical Diagnostics */}
        <div className="absolute top-2 left-2 font-caption-small text-caption-small text-text-main bg-white/70 px-1 border border-border-shadow/30">
          Memory Allocated: 384 MB
        </div>
        <div className="absolute top-2 right-2 font-caption-small text-caption-small text-text-main bg-white/70 px-1 border border-border-shadow/30">
          Build: 2458
        </div>
      </div>

      {/* Initialization Console */}
      <div className="px-3 pb-2 flex-shrink-0">
        <div 
          ref={logContainerRef}
          className="bg-window-inner inset-border p-2 h-[80px] overflow-y-auto flex flex-col text-left"
        >
          <div className="font-code-eula text-code-eula text-text-main flex flex-col gap-0.5 font-mono">
            {logLines.map((line, idx) => (
              <div key={idx} className="flex items-center gap-1 opacity-70">
                <span className="text-primary">&gt;</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-1 mt-auto font-mono">
            <span className="text-primary font-bold">&gt;</span>
            <span className="font-code-eula text-code-eula">{currentStatus}</span>
            {!isDone && <span className="cursor-blink"></span>}
          </div>
        </div>
      </div>

      {/* Progress Bar & Bottom Metadata */}
      <div className="px-3 pb-3 flex flex-col gap-2 flex-shrink-0 text-text-main">
        {/* Outset progress container */}
        <div className="h-4 w-full bg-window-inner inset-border p-[1px] flex items-center overflow-hidden">
          <div className="flex">
            {Array.from({ length: progressSegments }).map((_, idx) => (
              <div key={idx} className="progress-segment" />
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-end">
          <div className="flex flex-col text-left">
            <div className="font-caption-small text-caption-small font-bold">
              Knowledge Packs Installed: 5
            </div>
            <div className="font-caption-small text-caption-small text-text-disabled mt-0.5">
              Copyright © 2006 OpenAI Research Labs. All rights reserved.
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 outset-border px-2 py-1 bg-dialog-face h-fit">
              <span className="material-symbols-outlined text-text-main font-fill-1">volume_up</span>
              <span className="font-caption-small text-caption-small">Startup Sound Enabled</span>
            </div>
            
            {isDone && (
              <button 
                onClick={handleNext}
                className="outset-border bg-dialog-face px-6 py-1 font-label-button text-label-button hover:bg-surface-container active:translate-y-[1px] active:translate-x-[1px] shadow-sm font-bold border border-t-white border-l-white border-b-border-dark border-r-border-dark"
              >
                Next &gt;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
