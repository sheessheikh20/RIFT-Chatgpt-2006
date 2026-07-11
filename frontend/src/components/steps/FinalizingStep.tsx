import React, { useEffect } from 'react';

interface StepProps {
  onComplete: () => void;
}

export const FinalizingStep: React.FC<StepProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const maxSegments = 45; // fits the progress bar width
  const currentProgress = 0.95;
  const segmentsToShow = Math.floor(maxSegments * currentProgress);

  return (
    <div className="flex flex-col flex-grow select-none">
      {/* TopAppBar */}
      <header className="h-[58px] w-full flex justify-between items-center px-margin-edge bg-gradient-to-b from-white to-header-blue-bottom border-b border-border-shadow flex-shrink-0">
        <div className="flex flex-col text-text-main">
          <span className="font-header-title text-header-title text-left block">Finalizing</span>
          <span className="text-caption-small font-caption-small text-left block mt-1">ChatGPT Professional Enterprise Suite is completing the installation.</span>
        </div>
        <div className="flex items-center justify-center">
          <span className="material-symbols-outlined text-primary !text-[32px]">settings</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-margin-edge flex flex-col bg-dialog-face text-text-main">
        <div className="mt-4 mb-2">
          <p className="font-body-standard mb-1 text-left">Status: Writing Registry Entries...</p>
          {/* Progress Bar Container */}
          <div className="inset-border w-full h-[18px] p-[2px] flex items-center overflow-hidden bg-window-inner">
            <div className="flex gap-[2px] h-[10px] w-full">
              {Array.from({ length: segmentsToShow }).map((_, idx) => (
                <div key={idx} className="progress-segment" />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 text-left">
          <p className="font-body-standard">Current task:</p>
          <p className="font-body-standard font-bold mt-1 animate-pulse">Registering AI_Runtime_v1.dll</p>
        </div>

        {/* Technical Details Area */}
        <div className="mt-auto flex justify-between items-end">
          <div className="text-caption-small font-caption-small text-text-disabled">
            Registry Revision: 4.2
          </div>
          {/* Decorative artwork logo overlay */}
          <div className="w-24 h-24 flex items-center justify-center border border-border-shadow bg-[#ECE9D8] text-primary">
            <span className="material-symbols-outlined !text-[48px]">terminal</span>
          </div>
        </div>
      </main>
    </div>
  );
};
