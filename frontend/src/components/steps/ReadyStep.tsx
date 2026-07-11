import React from 'react';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  installPath: string;
  selectedComponents: string[];
}

export const ReadyStep: React.FC<StepProps> = ({ 
  onNext, 
  onBack, 
  installPath,
  selectedComponents
}) => {
  const getComponentName = (id: string) => {
    switch (id) {
      case 'core': return 'Core Language Engine';
      case 'manager': return 'Knowledge Pack Manager';
      case 'programming': return 'Programming Knowledge Pack';
      case 'math': return 'Mathematics Knowledge Pack';
      default: return id;
    }
  };

  return (
    <div className="flex flex-col flex-grow select-none">
      {/* TopAppBar */}
      <header className="h-[58px] w-full flex justify-between items-center px-margin-edge bg-gradient-to-b from-white to-header-blue-bottom border-b border-border-shadow flex-shrink-0">
        <div className="flex flex-col text-text-main">
          <h1 className="font-header-title text-header-title">Ready to Install</h1>
          <p className="font-body-standard text-[10px] text-text-main">Setup is now ready to begin installing on your computer.</p>
        </div>
        <div className="w-8 h-8 flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px] text-primary">settings</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-margin-edge flex flex-col bg-dialog-face text-text-main gap-3">
        <p className="font-body-standard text-body-standard">
          Click Install to continue with the installation, or click Back if you want to review or change any settings.
        </p>

        {/* Settings Summary Inset Box */}
        <div className="flex-grow border-inset p-[3px]">
          <div className="w-full h-full custom-scrollbar overflow-y-auto bg-white p-2 flex flex-col gap-4">
            <div>
              <span className="font-bold block text-body-standard text-left">Destination:</span>
              <span className="text-body-standard ml-2 block text-left">{installPath}</span>
            </div>
            
            <div>
              <span className="font-bold block text-body-standard text-left">Setup Type:</span>
              <span className="text-body-standard ml-2 block text-left">Custom</span>
            </div>
            
            <div>
              <span className="font-bold block text-body-standard text-left">Selected Components:</span>
              <ul className="list-none ml-4 text-body-standard text-left">
                {selectedComponents.map(id => (
                  <li key={id} className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">check_small</span>
                    {getComponentName(id)}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <span className="font-bold block text-body-standard text-left">Start Menu Folder:</span>
              <span className="text-body-standard ml-2 block text-left">OpenAI\ChatGPT Professional</span>
            </div>
          </div>
        </div>

        <p className="font-body-standard text-body-standard mt-1">
          Click Install to continue.
        </p>
      </main>
    </div>
  );
};
