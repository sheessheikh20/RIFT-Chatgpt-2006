import React from 'react';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  installPath: string;
  setInstallPath: (path: string) => void;
  spaceRequired: number;
}

export const LocationStep: React.FC<StepProps> = ({ 
  onNext, 
  onBack, 
  installPath, 
  setInstallPath,
  spaceRequired
}) => {
  return (
    <div className="flex flex-col flex-grow select-none">
      {/* TopAppBar */}
      <header className="h-[58px] w-full flex justify-between items-center px-margin-edge bg-gradient-to-b from-white to-header-blue-bottom border-b border-border-shadow flex-shrink-0">
        <div className="flex flex-col text-text-main">
          <h1 className="font-header-title text-header-title">Choose Install Location</h1>
          <p className="font-body-standard text-body-standard mt-1">Select the folder where Setup will install ChatGPT Professional.</p>
        </div>
        <div className="w-8 h-8 flex items-center justify-center">
          <span className="material-symbols-outlined !text-[28px] text-primary font-fill-1">storage</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-margin-edge flex flex-col bg-dialog-face text-text-main">
        <div className="flex items-start gap-3 mt-2">
          <span className="material-symbols-outlined text-primary text-[32px]">folder_open</span>
          <p className="font-body-standard text-body-standard leading-tight">
            Setup will install ChatGPT Professional Enterprise Suite into the following folder.<br/><br/>
            To install to this folder, click Next. To install to a different folder, click Browse and select another folder.
          </p>
        </div>

        {/* Path Selection Block */}
        <div className="mt-6">
          <label className="font-body-standard block mb-2">Destination Folder</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={installPath}
              onChange={(e) => setInstallPath(e.target.value)}
              className="flex-grow h-[21px] bg-window-inner win32-inset flex items-center px-2 font-body-standard text-body-standard outline-none border-none"
            />
            <button 
              className="w-[75px] h-[23px] bg-dialog-face win32-outset font-label-button text-label-button flex items-center justify-center hover:brightness-105 active:shadow-[inset_1px_1px_1px_#716F64] cursor-default"
              onClick={() => alert("Simulated folder browser. Custom install path editable directly in path input box.")}
            >
              Browse...
            </button>
          </div>
        </div>

        {/* Space Requirements */}
        <div className="mt-auto mb-4 space-y-1">
          <div className="flex justify-between w-full max-w-[280px]">
            <span className="font-body-standard">Space required:</span>
            <span className="font-body-standard font-bold">{spaceRequired.toLocaleString()} MB</span>
          </div>
          <div className="flex justify-between w-full max-w-[280px]">
            <span className="font-body-standard">Space available:</span>
            <span className="font-body-standard">12,240 MB</span>
          </div>
        </div>
      </main>
    </div>
  );
};
