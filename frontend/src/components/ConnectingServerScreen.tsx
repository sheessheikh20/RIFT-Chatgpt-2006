import React, { useEffect, useState, useRef } from 'react';

interface ConnectingProps {
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
  latencyMs: number;
}

export const ConnectingServerScreen: React.FC<ConnectingProps> = ({ 
  onNext, 
  onBack, 
  onCancel,
  latencyMs
}) => {
  const [progress, setProgress] = useState(0);
  const [activeUnits, setActiveUnits] = useState(0);
  const [logLines, setLogLines] = useState<string[]>([
    'Initializing handshake...',
    'Connecting to gateway 10.0.4.128...',
    'Reserving AI Runtime...',
    'Allocating Processing Units...',
    'Verifying Digital Signature...'
  ]);
  const [isReady, setIsReady] = useState(false);

  const logWindowRef = useRef<HTMLDivElement>(null);
  const maxBlocks = 45;

  const connectionLogs = [
    'Establishing secure tunnel...',
    'Key exchange successful (AES-256)',
    'Synchronizing temporal buffer...',
    'Loading neural weights...',
    'Handshake complete.',
    'Server Cluster AI-17 responding...',
    'Connection established.'
  ];

  useEffect(() => {
    let blockCount = 0;
    let unitCount = 0;
    const logQueue = [...connectionLogs];

    // Progress bar segment filling timer
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= maxBlocks - 1) {
          clearInterval(progressTimer);
          setIsReady(true);
          return maxBlocks;
        }

        const nextVal = prev + 1;
        blockCount = nextVal;

        // Dynamically increment active diagnostic processing units
        if (nextVal % 5 === 0) {
          unitCount += Math.floor(Math.random() * 8) + 4;
          setActiveUnits(unitCount);
        }

        // Periodically append connection log events to the console
        if (nextVal % 6 === 0 && logQueue.length > 0) {
          const nextLog = logQueue.shift();
          if (nextLog) {
            setLogLines(prevLogs => [...prevLogs, nextLog]);
          }
        }

        return nextVal;
      });
    }, 120);

    return () => clearInterval(progressTimer);
  }, []);

  // Scroll to bottom of terminal console
  useEffect(() => {
    if (logWindowRef.current) {
      logWindowRef.current.scrollTop = logWindowRef.current.scrollHeight;
    }
  }, [logLines]);

  return (
    <div className="flex-grow flex flex-col relative font-body-standard text-body-standard text-text-main select-none w-full h-full">
      
      {/* TopAppBar */}
      <header className="h-header-h w-full flex justify-between items-center px-margin-edge bg-gradient-to-b from-white to-header-blue-bottom border-b border-border-shadow flex-shrink-0">
        <div className="flex flex-col text-left">
          <h1 className="font-header-title text-header-title text-text-main">Connecting to OpenAI Server Cluster</h1>
          <p className="font-body-standard text-body-standard text-text-main mt-0.5">Authenticating session credentials...</p>
        </div>
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary !text-[32px]">dns</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-margin-edge flex gap-4 overflow-hidden">
        
        {/* Left Side: Connection Details */}
        <div className="flex-grow flex flex-col gap-3 overflow-hidden text-left w-2/3">
          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-text-main font-bold">Data Center:</span>
              <span className="text-text-main">New York (US-EAST-1)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-main font-bold">Server:</span>
              <span className="text-text-main">AI-17</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-main font-bold">Protocol:</span>
              <span className="text-text-main">KTP v2.4 (Latency: {latencyMs}ms)</span>
            </div>
          </div>

          {/* Progress Section */}
          <div className="mt-1 flex-shrink-0">
            <p className="mb-1 text-caption-small">Authentication progress:</p>
            <div className="inset-border h-4 w-full p-[2px] flex items-center overflow-hidden bg-white">
              <div className="flex gap-[2px] h-[10px] w-full">
                {Array.from({ length: progress }).map((_, idx) => (
                  <div key={idx} className="progress-block" />
                ))}
              </div>
            </div>
          </div>

          {/* Console Log */}
          <div className="flex-grow flex flex-col overflow-hidden">
            <p className="mb-1 text-caption-small">Status Log:</p>
            <div 
              ref={logWindowRef}
              className="inset-border flex-grow p-2 overflow-y-auto custom-scrollbar font-code-eula text-[11px] leading-tight bg-white font-mono"
            >
              {logLines.map((line, idx) => (
                <div key={idx} className={line.startsWith('Establishing') || line.startsWith('Key') || line.startsWith('Handshake') ? 'text-[#017e00]' : ''}>
                  {line}
                </div>
              ))}
              
              {!isReady ? (
                <div className="flex items-center">
                  Waiting for cluster response... 
                  <span className="ml-1 w-1.5 h-3 bg-black cursor-blink animate-pulse"></span>
                </div>
              ) : (
                <div className="text-[#017e00] font-bold">
                  Cluster Ready. Press Next to continue.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Diagnostics Panel */}
        <div className="w-32 flex flex-col gap-2 flex-shrink-0 text-left">
          <p className="font-bold text-[11px]">Diagnostics:</p>
          <div className="inset-border p-2 flex-grow bg-surface-container-highest">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <span className="text-[9px] text-text-disabled uppercase font-bold">Runtime</span>
                <span className="text-body-standard font-semibold">v1.0.2458</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-text-disabled uppercase font-bold">Buffer</span>
                <span className="text-body-standard font-semibold">128MB</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-text-disabled uppercase font-bold">Active Units</span>
                <span className="text-body-standard font-semibold">{activeUnits}</span>
              </div>
              <div className="mt-4 border-t border-border-shadow pt-2 flex items-center justify-center h-12 bg-white outset-border text-primary">
                <span className="material-symbols-outlined !text-[24px]">memory</span>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Etched Divider */}
      <div className="etched-divider mt-auto flex-shrink-0"></div>

      {/* Footer */}
      <footer className="h-footer-h w-full flex justify-end items-center gap-gutter-button px-margin-edge bg-dialog-face flex-shrink-0">
        <button 
          onClick={onBack}
          className="win32-button"
        >
          Back
        </button>
        <button 
          onClick={onNext}
          disabled={!isReady}
          className="win32-button font-bold border-2 border-black"
        >
          Next
        </button>
        <button 
          onClick={onCancel}
          className="win32-button ml-2"
        >
          Cancel
        </button>
      </footer>

    </div>
  );
};
