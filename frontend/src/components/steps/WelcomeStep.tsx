import React from 'react';

interface StepProps {
  onNext: () => void;
  onCancel: () => void;
}

export const WelcomeStep: React.FC<StepProps> = ({ onNext, onCancel }) => {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Sidebar Graphic (164px) */}
      <div className="w-sidebar-w relative flex-shrink-0 overflow-hidden border-r border-border-shadow"
        style={{
          background: 'linear-gradient(160deg, #003580 0%, #001040 40%, #002060 70%, #00103A 100%)'
        }}
      >
        {/* Circuit-board dot-matrix overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle, #4488ff 1px, transparent 1px)',
          backgroundSize: '12px 12px'
        }} />
        {/* Server Icon */}
        <div className="absolute bottom-4 left-4 text-white/30">
          <span className="material-symbols-outlined !text-[120px] rotate-12">dns</span>
        </div>
      </div>
      
      {/* Right Welcome Content (333px) */}
      <div className="flex-1 bg-window-inner p-margin-edge flex flex-col pt-8 text-text-main select-none">
        <h1 className="font-display-welcome text-display-welcome mb-6 leading-tight">
          Welcome to the ChatGPT Professional Enterprise Suite Setup Wizard
        </h1>
        <p className="mb-4 leading-normal">
          This wizard will guide you through the installation of ChatGPT Professional v1.0.2406.
        </p>
        <p className="mb-4 leading-normal">
          It is recommended that you close all other applications before starting Setup. This will make it possible to update relevant system files without having to reboot your computer.
        </p>
        <p className="mt-auto">
          Click Next to continue.
        </p>
      </div>
    </div>
  );
};
