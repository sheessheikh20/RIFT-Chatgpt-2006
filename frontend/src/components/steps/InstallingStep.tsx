import React, { useEffect, useState } from 'react';

interface StepProps {
  onComplete: () => void;
}

export const InstallingStep: React.FC<StepProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('C:\\Program Files\\ChatGPT Enterprise\\data\\grammar_module.dat');
  const [status, setStatus] = useState('Extracting Language Engines...');

  const maxSegments = 40; // fits the progress bar width

  const files = [
    'c:\\Users\\Win11\\Desktop\\RIFT\\ChatGPT Professional\\Config\\settings.json',
    'c:\\Users\\Win11\\Desktop\\RIFT\\ChatGPT Professional\\KnowledgePacks\\programming.pack',
    'c:\\Users\\Win11\\Desktop\\RIFT\\ChatGPT Professional\\KnowledgePacks\\mathematics.pack',
    'c:\\Users\\Win11\\Desktop\\RIFT\\ChatGPT Professional\\KnowledgePacks\\history.pack',
    'c:\\Users\\Win11\\Desktop\\RIFT\\ChatGPT Professional\\KnowledgePacks\\dictionary.pack',
    'c:\\Users\\Win11\\Desktop\\RIFT\\ChatGPT Professional\\KnowledgePacks\\grammar.pack',
    'c:\\Users\\Win11\\Desktop\\RIFT\\ChatGPT Professional\\Logs\\install.log',
    'c:\\Users\\Win11\\Desktop\\RIFT\\ChatGPT Professional\\Logs\\app.log',
    'c:\\Users\\Win11\\Desktop\\RIFT\\ChatGPT Professional\\Cache\\index.dat',
    'c:\\Users\\Win11\\Desktop\\RIFT\\ChatGPT Professional\\Exports\\README.txt'
  ];

  useEffect(() => {
    // Perform actual directory structure creation and write config/logs to local disk
    fetch('http://localhost:8080/api/localdata/initialize', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        console.log("Local system initialised:", data);
      })
      .catch(err => {
        console.error("Local initialisation failed:", err);
      });

    // Progress Increment
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= maxSegments) {
          clearInterval(progressTimer);
          return maxSegments;
        }
        return prev + 1;
      });
    }, 150);

    // File Name update
    const fileTimer = setInterval(() => {
      const randomFile = files[Math.floor(Math.random() * files.length)];
      setCurrentFile(randomFile);
    }, 400);

    // Status label updates
    const statusTimer = setInterval(() => {
      setProgress(p => {
        if (p > 30) {
          setStatus('Registering local AI Core database markers...');
        } else if (p > 15) {
          setStatus('Configuring settings.json default properties...');
        }
        return p;
      });
    }, 500);

    return () => {
      clearInterval(progressTimer);
      clearInterval(fileTimer);
      clearInterval(statusTimer);
    };
  }, []);

  useEffect(() => {
    if (progress >= maxSegments) {
      onComplete();
    }
  }, [progress, onComplete]);

  return (
    <div className="flex flex-col flex-grow select-none">
      {/* TopAppBar */}
      <header className="h-[58px] w-full border-b border-border-shadow flex justify-between items-center px-margin-edge bg-gradient-to-b from-white to-header-blue-bottom flex-shrink-0">
        <div className="flex flex-col text-text-main">
          <h1 className="font-header-title text-header-title">Installing</h1>
          <p className="font-body-standard text-body-standard mt-1">Please wait while Setup installs ChatGPT Professional Enterprise Suite.</p>
        </div>
        <div className="w-8 h-8 flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px] text-primary">install_desktop</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-margin-edge flex flex-col bg-dialog-face text-text-main gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-body-standard text-left">{status}</span>
          
          {/* Progress Bar Container (Inset) */}
          <div className="w-full h-4 bg-window-inner border-t border-l border-border-dark border-r border-b border-white flex items-center px-[2px] overflow-hidden">
            <div className="flex gap-[2px] h-[10px] w-full">
              {Array.from({ length: progress }).map((_, idx) => (
                <div key={idx} className="w-[6px] h-full bg-[#00D200] flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>

        {/* Current File Info */}
        <div className="mt-2 flex flex-col gap-1">
          <span className="font-body-standard text-left">Current file:</span>
          <span className="font-caption-small text-left text-text-main truncate bg-[#FFFFFF] border border-border-shadow px-2 py-1 select-all font-mono">
            {currentFile}
          </span>
        </div>

        {/* Technical Visualizer Card */}
        <div className="mt-auto h-[100px] w-full border border-border-shadow bg-surface-container-low flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 flex flex-col font-code-eula text-[8px] leading-tight select-none text-left pl-2 pt-1 font-mono">
            <span>INIT PACK_MNGR_v2.0.4...</span>
            <span>LINKING kernel32.dll...</span>
            <span>EXPANDING grammar_module.dat...</span>
            <span>MEM_ALLOC 0x442AF01...</span>
            <span>VERIFYING HASH SHA-256...</span>
            <span>THREAD_SPAWN ID=4022...</span>
            <span>STREAM_LOAD units/pack_14...</span>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="font-header-title text-[14px] text-primary tracking-widest uppercase">System Processing</span>
            <div className="flex gap-1 mt-2">
              <div className="w-2 h-4 bg-primary animate-pulse"></div>
              <div className="w-2 h-4 bg-primary-container animate-pulse delay-75"></div>
              <div className="w-2 h-4 bg-primary animate-pulse delay-150"></div>
              <div className="w-2 h-4 bg-primary-container animate-pulse delay-300"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
