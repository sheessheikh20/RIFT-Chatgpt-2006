import React from 'react';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  accepted: boolean;
  setAccepted: (accepted: boolean) => void;
}

export const LicenseStep: React.FC<StepProps> = ({ onNext, onBack, accepted, setAccepted }) => {
  return (
    <div className="flex flex-col flex-grow select-none">
      {/* TopAppBar */}
      <header className="h-header-h w-full flex justify-between items-center px-margin-edge bg-gradient-to-b from-white to-header-blue-bottom border-b border-border-shadow flex-shrink-0">
        <div className="flex flex-col text-text-main">
          <h1 className="font-header-title text-header-title">License Agreement</h1>
          <p className="font-body-standard text-text-main mt-1">Please read the following important information.</p>
        </div>
        <div className="w-[32px] h-[32px] flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px] text-primary">description</span>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-grow px-margin-edge py-3 flex flex-col bg-dialog-face text-text-main">
        <p className="mb-2">Please read the following License Agreement. You must accept the terms of this agreement before continuing with the installation.</p>
        
        {/* EULA Inset Textbox */}
        <div className="flex-grow bg-window-inner inset-border p-1 overflow-hidden flex flex-col">
          <div className="eula-scroll overflow-y-scroll h-full pr-1 font-code-eula text-code-eula text-text-main whitespace-pre-wrap leading-tight">
            ChatGPT Professional Enterprise Suite
            End User License Agreement (EULA)

            IMPORTANT: PLEASE READ THIS LICENSE AGREEMENT CAREFULLY.

            1. GRANT OF LICENSE. OpenAI Research Labs ("Licensor") hereby grants you a non-exclusive, non-transferable license to use the ChatGPT Professional Enterprise Suite software.

            2. RESTRICTIONS. You may not reverse engineer, decompile, or disassemble the software, except and only to the extent that such activity is expressly permitted by applicable law.

            3. INTELLECTUAL PROPERTY. All title and copyrights in and to the software are owned by Licensor or its suppliers.

            4. TERMINATION. Without prejudice to any other rights, Licensor may terminate this EULA if you fail to comply with the terms and conditions.

            5. LIMITED WARRANTY. Licensor warrants that the software will perform substantially in accordance with the accompanying written materials for a period of ninety (90) days from the date of receipt.

            6. LIMITATION OF LIABILITY. In no event shall Licensor be liable for any special, incidental, indirect, or consequential damages whatsoever.

            © 2006 OpenAI Research Labs. All rights reserved.
          </div>
        </div>

        {/* Radio Buttons */}
        <div className="mt-3 flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-default group">
            <input 
              type="radio" 
              name="license" 
              id="accept" 
              checked={accepted}
              onChange={() => setAccepted(true)}
              className="w-3 h-3 border-inset bg-white appearance-none border border-border-dark checked:bg-black rounded-full" 
              style={{ boxShadow: "inset 1px 1px 1px #808080" }}
            />
            <span className="font-body-standard text-text-main">I accept the agreement</span>
          </label>
          <label className="flex items-center gap-2 cursor-default group">
            <input 
              type="radio" 
              name="license" 
              id="decline" 
              checked={!accepted}
              onChange={() => setAccepted(false)}
              className="w-3 h-3 border-inset bg-white appearance-none border border-border-dark checked:bg-black rounded-full" 
              style={{ boxShadow: "inset 1px 1px 1px #808080" }}
            />
            <span className="font-body-standard text-text-main">I do not accept the agreement</span>
          </label>
        </div>
      </main>
    </div>
  );
};
