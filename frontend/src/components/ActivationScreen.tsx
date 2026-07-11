import React from 'react';

interface ActivationProps {
  onNext: () => void;
  onCancel: () => void;
}

export const ActivationScreen: React.FC<ActivationProps> = ({ onNext, onCancel }) => {
  return (
    <div className="flex-grow flex flex-col overflow-hidden relative font-body-standard text-body-standard text-text-main select-none w-full h-full">
      
      {/* Header Block */}
      <header className="bg-gradient-to-b from-white to-header-blue-bottom h-header-h w-full flex justify-between items-center px-margin-edge border-b border-border-shadow flex-shrink-0 text-left">
        <div className="flex flex-col">
          <h1 className="font-header-title text-header-title text-text-main">Product Activation</h1>
          <p className="text-body-standard text-text-main mt-0.5">Verify your license credentials and activation status.</p>
        </div>
        <div className="w-[32px] h-[32px] bg-white inset-border flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[24px] font-fill-1">terminal</span>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-grow p-margin-edge flex flex-col gap-4 text-left overflow-y-auto">
        <p className="text-body-standard leading-normal">
          The installation wizard has successfully verified your product credentials. Your copy of ChatGPT Professional Enterprise Suite is now activated and ready for use.
        </p>

        {/* Activation Credentials Card */}
        <div className="inset-border bg-white p-4 flex flex-col gap-2">
          <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1 text-body-standard">
            <span className="text-text-disabled font-bold">Registered To:</span>
            <span className="text-text-main">Mohammad Shees</span>
            
            <span className="text-text-disabled font-bold">Organization:</span>
            <span className="text-text-main">TCET Research Lab</span>
            
            <span className="text-text-disabled font-bold">Edition:</span>
            <span className="text-text-main">Professional Enterprise</span>
            
            <span className="text-text-disabled font-bold">License:</span>
            <span className="text-text-main">Perpetual</span>
            
            <span className="text-text-disabled font-bold">Product Key:</span>
            <span className="text-text-main tracking-widest font-mono font-bold">****-****-****-2006</span>
          </div>

          {/* Verified Status Row */}
          <div className="mt-4 pt-3 border-t border-dotted border-border-shadow flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00D200]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#016200] text-[32px] font-fill-1">check_circle</span>
            </div>
            <div>
              <div className="text-[14px] font-bold text-text-main">Activation: Verified</div>
              <div className="text-caption-small text-text-disabled">Status: Authentic Microsoft Certified Partner Environment</div>
            </div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="flex gap-2 items-start mt-auto">
          <span className="material-symbols-outlined text-[#EDC010] text-[16px] font-fill-1">info</span>
          <p className="text-caption-small italic text-text-disabled leading-tight">
            This license is granted under the Professional Enterprise Agreement. Redistribution or unauthorized copying is strictly prohibited under international copyright laws.
          </p>
        </div>
      </main>

      {/* Etched Line */}
      <div className="px-3 flex-shrink-0">
        <div className="etched-line"></div>
      </div>

      {/* Footer Action Bar */}
      <footer className="bg-dialog-face h-footer-h flex justify-end items-center gap-gutter-button px-margin-edge w-full flex-shrink-0">
        <button 
          disabled 
          className="win32-button"
        >
          &lt; Back
        </button>
        <button 
          onClick={onNext}
          className="win32-button font-bold border-2 border-black"
        >
          Next &gt;
        </button>
        <div className="w-[10px]" />
        <button 
          onClick={onCancel}
          className="win32-button"
        >
          Cancel
        </button>
      </footer>

    </div>
  );
};
