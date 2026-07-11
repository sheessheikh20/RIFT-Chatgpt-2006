import React, { useState } from 'react';

interface StepProps {
  onFinish: (options: { launch: boolean; guide: boolean; updates: boolean }) => void;
}

export const FinishStep: React.FC<StepProps> = ({ onFinish }) => {
  const [launch, setLaunch] = useState(true);
  const [guide, setGuide] = useState(false);
  const [updates, setUpdates] = useState(true);

  return (
    <div className="flex-grow flex w-full h-[313px] overflow-hidden select-none bg-dialog-face">
      {/* Left Panel (Sidebar) */}
      <div className="w-[164px] h-full relative overflow-hidden bg-primary flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-header-blue-top to-on-primary-fixed-variant opacity-90"></div>
        {/* Sidebar Bitmap Graphics */}
        <div className="absolute inset-0 flex flex-col items-center pt-8 pointer-events-none opacity-30">
          <span className="material-symbols-outlined text-[120px] text-white">developer_board</span>
        </div>
        <div 
          className="w-full h-full" 
          style={{ 
            background: 'linear-gradient(160deg, #003580 0%, #001040 40%, #002060 70%, #00103A 100%)'
          }}
        />
      </div>

      {/* Right Panel (Content) */}
      <div className="flex-grow p-margin-edge flex flex-col justify-start bg-window-inner text-text-main text-left pt-6">
        <h1 className="font-display-welcome text-display-welcome text-text-main mb-4 leading-tight">
          Completing the ChatGPT Professional Enterprise Suite Setup Wizard
        </h1>
        <p className="text-body-standard mb-6">
          Click Finish to exit Setup. Setup has finished installing ChatGPT Professional Enterprise Suite on your computer. The application may be launched by selecting the installed icons.
        </p>

        {/* Checkbox Options Area */}
        <div className="flex flex-col gap-4 mt-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={launch}
              onChange={() => setLaunch(!launch)}
              className="custom-checkbox appearance-none w-[13px] h-[13px] bg-white border border-border-shadow relative cursor-pointer"
              style={{ boxShadow: "inset 1px 1px 0px #808080, inset -1px -1px 0px #ffffff" }}
            />
            <span className="text-body-standard font-body-standard text-text-main">Launch ChatGPT Professional</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={guide}
              onChange={() => setGuide(!guide)}
              className="custom-checkbox appearance-none w-[13px] h-[13px] bg-white border border-border-shadow relative cursor-pointer"
              style={{ boxShadow: "inset 1px 1px 0px #808080, inset -1px -1px 0px #ffffff" }}
            />
            <span className="text-body-standard font-body-standard text-text-main">Open Getting Started Guide</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={updates}
              onChange={() => setUpdates(!updates)}
              className="custom-checkbox appearance-none w-[13px] h-[13px] bg-white border border-border-shadow relative cursor-pointer"
              style={{ boxShadow: "inset 1px 1px 0px #808080, inset -1px -1px 0px #ffffff" }}
            />
            <span className="text-body-standard font-body-standard text-text-main">Check for Knowledge Pack Updates</span>
          </label>
        </div>

        {/* Dynamic button wrapper trigger */}
        <button 
          id="finish-trigger" 
          onClick={() => onFinish({ launch, guide, updates })} 
          className="hidden" 
        />
      </div>
    </div>
  );
};
