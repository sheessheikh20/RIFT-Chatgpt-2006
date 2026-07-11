import React, { useEffect, useState } from 'react';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export const RequirementsStep: React.FC<StepProps> = ({ onNext, onBack }) => {
  const [checks, setChecks] = useState<{[key: string]: 'pending' | 'ok'}>({
    cpu: 'pending',
    ram: 'pending',
    os: 'pending',
    net: 'pending'
  });

  useEffect(() => {
    const timers = [
      setTimeout(() => setChecks(prev => ({ ...prev, cpu: 'ok' })), 400),
      setTimeout(() => setChecks(prev => ({ ...prev, ram: 'ok' })), 800),
      setTimeout(() => setChecks(prev => ({ ...prev, os: 'ok' })), 1200),
      setTimeout(() => setChecks(prev => ({ ...prev, net: 'ok' })), 1600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const allMet = Object.values(checks).every(status => status === 'ok');

  return (
    <div className="flex flex-col flex-grow select-none">
      {/* Header Banner */}
      <header className="flex justify-between items-center px-margin-edge bg-gradient-to-b from-white to-header-blue-bottom h-[58px] w-full border-b border-border-shadow flex-shrink-0">
        <div className="flex flex-col text-text-main">
          <h1 className="font-header-title text-header-title">System Requirements</h1>
          <p className="font-body-standard text-[10px] leading-tight">Verifying hardware and software compatibility.</p>
        </div>
        <div className="w-[32px] h-[32px] flex items-center justify-center">
          <span className="material-symbols-outlined !text-[32px] text-primary">desktop_windows</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-margin-edge flex flex-col bg-dialog-face text-text-main">
        <p className="mb-3">The wizard has checked your system for the minimum requirements to install ChatGPT Professional Enterprise Suite.</p>
        
        {/* Inset List Box */}
        <div className="inset-border flex-grow p-1 overflow-y-auto mb-3 bg-window-inner">
          <div className="flex items-center gap-2 p-1 border-b border-gray-100 hover:bg-primary-container hover:text-white group">
            {checks.cpu === 'ok' ? (
              <span className="material-symbols-outlined text-tertiary group-hover:text-white !text-[16px] font-fill-1">check_circle</span>
            ) : (
              <span className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full ml-0.5"></span>
            )}
            <span className="font-body-standard">{checks.cpu === 'ok' ? '[OK] ' : 'Checking... '}Pentium 4 2.4GHz+</span>
          </div>
          
          <div className="flex items-center gap-2 p-1 border-b border-gray-100 hover:bg-primary-container hover:text-white group">
            {checks.ram === 'ok' ? (
              <span className="material-symbols-outlined text-tertiary group-hover:text-white !text-[16px] font-fill-1">check_circle</span>
            ) : (
              <span className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full ml-0.5"></span>
            )}
            <span className="font-body-standard">{checks.ram === 'ok' ? '[OK] ' : 'Checking... '}512MB RAM</span>
          </div>
          
          <div className="flex items-center gap-2 p-1 border-b border-gray-100 hover:bg-primary-container hover:text-white group">
            {checks.os === 'ok' ? (
              <span className="material-symbols-outlined text-tertiary group-hover:text-white !text-[16px] font-fill-1">check_circle</span>
            ) : (
              <span className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full ml-0.5"></span>
            )}
            <span className="font-body-standard">{checks.os === 'ok' ? '[OK] ' : 'Checking... '}Windows XP/2003</span>
          </div>
          
          <div className="flex items-center gap-2 p-1 border-b border-gray-100 hover:bg-primary-container hover:text-white group">
            {checks.net === 'ok' ? (
              <span className="material-symbols-outlined text-tertiary group-hover:text-white !text-[16px] font-fill-1">check_circle</span>
            ) : (
              <span className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full ml-0.5"></span>
            )}
            <span className="font-body-standard">{checks.net === 'ok' ? '[OK] ' : 'Checking... '}Broadband Connection</span>
          </div>
        </div>

        <div className="flex justify-end items-center gap-1">
          <span className="font-body-standard italic text-text-main">
            {allMet ? 'Status: Requirements Met' : 'Status: Analyzing Hardware...'}
          </span>
          {allMet && <span className="material-symbols-outlined text-tertiary !text-[14px]">task_alt</span>}
        </div>
      </main>
    </div>
  );
};
