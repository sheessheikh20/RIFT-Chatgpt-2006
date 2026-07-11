import React, { useEffect, useState } from 'react';

interface QueueProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const QueueScreen: React.FC<QueueProps> = ({ onComplete, onCancel }) => {
  const [seconds, setSeconds] = useState(14);
  const [position, setPosition] = useState(3);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsConnecting(true);
          // Transition to next screen after 2 seconds of "Connecting..."
          setTimeout(() => {
            onComplete();
          }, 2000);
          return 0;
        }
        
        // Adjust queue position based on remaining time
        const newSecs = prev - 1;
        if (newSecs <= 4) {
          setPosition(1);
        } else if (newSecs <= 9) {
          setPosition(2);
        }
        
        return newSecs;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex-grow flex flex-col relative font-body-standard text-body-standard text-text-main select-none w-full h-full">
      
      {/* TopAppBar */}
      <header className="h-header-h w-full flex justify-between items-center px-margin-edge bg-gradient-to-b from-white to-header-blue-bottom border-b border-border-shadow flex-shrink-0">
        <div className="flex flex-col text-left">
          <span className="font-header-title text-header-title text-text-main block">
            Waiting for Available AI Processing Unit...
          </span>
          <span className="text-caption-small text-text-main mt-0.5 block">
            Establishing secure session connection
          </span>
        </div>
        <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[#0055E5] !text-[32px]">
            settings_backup_restore
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-margin-edge flex flex-col gap-4 overflow-hidden text-left">
        <p className="text-text-main leading-normal">
          Processing units are currently under high demand. Your session will begin as soon as a Language Engine instance becomes available.
        </p>

        {/* Queue Status Box */}
        <div className="inset-border bg-window-inner p-4 flex flex-col items-center justify-center space-y-3 flex-shrink-0">
          <div className="flex flex-col items-center">
            <span className="font-bold text-[14px]">
              {isConnecting ? 'Queue Position: 0' : `Queue Position: ${position}`}
            </span>
            <span 
              className={`text-text-disabled mt-1 ${isConnecting ? 'text-primary font-bold animate-pulse' : ''}`}
            >
              {isConnecting ? 'Connecting...' : `Estimated Wait: 0:${seconds < 10 ? `0${seconds}` : seconds}`}
            </span>
          </div>

          {/* WinXP Style Progress Bar - fills as time decreases */}
          {(() => {
            const TOTAL = 14;
            const totalSegments = 10;
            const elapsed = TOTAL - seconds;
            const progress = isConnecting ? 1 : Math.min(elapsed / TOTAL, 1);
            const filledCount = isConnecting ? totalSegments : Math.max(1, Math.floor(progress * totalSegments));
            return (
              <div className="inset-border w-full h-4 p-[1px] flex gap-[2px] bg-white overflow-hidden">
                {[...Array(totalSegments)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-[10%] h-full flex-shrink-0 transition-colors duration-500 ${
                      i < filledCount
                        ? i === filledCount - 1 && !isConnecting
                          ? 'bg-[#00D200] led-blink'
                          : 'bg-[#00D200]'
                        : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            );
          })()}
        </div>

        {/* System Resources Status List */}
        <div className="flex flex-col gap-1 flex-grow overflow-hidden">
          <span className="font-bold text-text-main mb-1">System Resources:</span>
          <div className="inset-border bg-window-inner h-[80px] overflow-y-auto p-2">
            
            <div className="flex items-center justify-between py-0.5 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00D200] shadow-[0_0_2px_#00D200] flex-shrink-0"></div>
                <span>Language Engine v4.0 (Instance 08)</span>
              </div>
              <span className="text-text-disabled italic">Ready</span>
            </div>
            
            <div className="flex items-center justify-between py-0.5 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FFD200] shadow-[0_0_2px_#FFD200] led-blink flex-shrink-0"></div>
                <span>AI Processing Unit cluster-east-2</span>
              </div>
              <span className="text-text-disabled italic">High Load</span>
            </div>
            
            <div className="flex items-center justify-between py-0.5 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00D200] shadow-[0_0_2px_#00D200] flex-shrink-0"></div>
                <span>Secure Token Validator</span>
              </div>
              <span className="text-text-disabled italic">Active</span>
            </div>
            
            <div className="flex items-center justify-between py-0.5 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FFD200] shadow-[0_0_2px_#FFD200] flex-shrink-0"></div>
                <span>Semantic Buffer Allocation</span>
              </div>
              <span className="text-text-disabled italic">Queued</span>
            </div>

          </div>
        </div>
      </main>

      {/* Etched Divider */}
      <div className="px-margin-edge flex-shrink-0">
        <div className="etched-line"></div>
      </div>

      {/* Footer action bar */}
      <footer className="h-footer-h w-full flex justify-end items-center gap-gutter-button px-margin-edge bg-dialog-face flex-shrink-0">
        <button disabled className="win32-button">
          &lt; Back
        </button>
        <button disabled className="win32-button">
          Next &gt;
        </button>
        <button onClick={onCancel} className="win32-button ml-2">
          Cancel
        </button>
      </footer>

    </div>
  );
};
