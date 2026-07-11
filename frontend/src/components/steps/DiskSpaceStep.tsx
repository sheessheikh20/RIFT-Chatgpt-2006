import React, { useEffect, useState } from 'react';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  spaceRequired: number;
}

export const DiskSpaceStep: React.FC<StepProps> = ({ onNext, onBack, spaceRequired }) => {
  const [flicker, setFlicker] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlicker(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col flex-grow select-none">
      {/* TopAppBar */}
      <header className="h-header-h w-full bg-gradient-to-b from-white to-header-blue-bottom px-margin-edge flex justify-between items-center border-b border-border-shadow flex-shrink-0">
        <div className="flex flex-col text-text-main">
          <h1 className="font-header-title text-header-title">Disk Space Requirements</h1>
          <p className="text-caption-small font-caption-small">The installer is analyzing your system for available resources.</p>
        </div>
        <div className="w-8 h-8 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary !text-[32px]">hard_drive</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-margin-edge flex flex-col bg-dialog-face text-text-main gap-3">
        <p className="font-body-standard text-body-standard">
          Please review the disk space analysis for the selected installation path. Ensure there is sufficient space to continue.
        </p>

        {/* Detailed Breakdown Inset Box */}
        <div className="inset-border bg-window-inner flex-grow flex flex-col p-3 font-body-standard overflow-y-auto">
          <div className="flex flex-col gap-4">
            {/* Path Section */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-text-disabled !text-[16px]">folder_open</span>
              <div className="flex justify-between w-full">
                <span className="font-bold">Installation Drive:</span>
                <span className="font-code-eula">C:\</span>
              </div>
            </div>
            
            <div className="h-[1px] bg-border-shadow opacity-30"></div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-y-3">
              <div className="flex flex-col">
                <span className="text-text-disabled text-caption-small uppercase tracking-wider">Storage Capacity</span>
                <span className="font-bold">Free Space:</span>
              </div>
              <div className="flex items-end justify-end">
                <span className="text-primary font-bold">12,240 MB</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-text-disabled text-caption-small uppercase tracking-wider">Installation Load</span>
                <span className="font-bold">Required Space:</span>
              </div>
              <div className="flex items-end justify-end">
                <span className="text-text-main font-bold">{spaceRequired.toLocaleString()} MB</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-text-disabled text-caption-small uppercase tracking-wider">Performance</span>
                <span className="font-bold">Estimated Install Time:</span>
              </div>
              <div className="flex items-end justify-end">
                <span className="text-text-main">4 minutes</span>
              </div>
            </div>

            <div className="mt-2">
              <span className="text-caption-small">Disk utilization visualization:</span>
              <div className="inset-border h-6 w-full mt-1 bg-surface-container-low flex items-center px-1">
                {/* Simulated Progress Blocks */}
                <div className="progress-block"></div>
                <div className="progress-block"></div>
                <div className={`progress-block ${flicker ? 'opacity-80' : 'opacity-50'}`}></div>
                <div className={`progress-block ${flicker ? 'opacity-40' : 'opacity-20'}`}></div>
                <div className="progress-block opacity-10"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#00D200] !text-[14px] font-fill-1">check_circle</span>
          <span className="font-bold text-text-main">Ready to proceed.</span>
        </div>
      </main>
    </div>
  );
};
