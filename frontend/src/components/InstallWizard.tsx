import React, { useState } from 'react';
import { WelcomeStep } from './steps/WelcomeStep';
import { RequirementsStep } from './steps/RequirementsStep';
import { LicenseStep } from './steps/LicenseStep';
import { LocationStep } from './steps/LocationStep';
import { ComponentsStep } from './steps/ComponentsStep';
import { DiskSpaceStep } from './steps/DiskSpaceStep';
import { ReadyStep } from './steps/ReadyStep';
import { InstallingStep } from './steps/InstallingStep';
import { FinalizingStep } from './steps/FinalizingStep';
import { FinishStep } from './steps/FinishStep';

interface InstallWizardProps {
  onFinish: () => void;
}

export const InstallWizard: React.FC<InstallWizardProps> = ({ onFinish }) => {
  const [step, setStep] = useState(0);

  // Installer States
  const [licenseAccepted, setLicenseAccepted] = useState(false);
  const [installPath, setInstallPath] = useState('C:\\Program Files\\OpenAI\\ChatGPT Professional\\');
  const [selectedComponents, setSelectedComponents] = useState<string[]>(['core', 'manager']);
  const [spaceRequired, setSpaceRequired] = useState(1250); // Starts with core + manager

  const totalSteps = 10;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel ChatGPT Professional Setup?")) {
      window.close();
    }
  };

  const handleFinishWizard = (options: { launch: boolean; guide: boolean; updates: boolean }) => {
    onFinish();
  };

  // Determine button availability
  const isBackDisabled = step === 0 || step === 7 || step === 8 || step === 9;
  
  let isNextDisabled = false;
  if (step === 2 && !licenseAccepted) {
    isNextDisabled = true;
  }
  if (step === 7 || step === 8) {
    isNextDisabled = true;
  }

  // Determine button text
  let nextText = "Next >";
  if (step === 6) {
    nextText = "Install";
  } else if (step === 9) {
    nextText = "Finish";
  }

  return (
    <div className="flex-grow flex flex-col relative overflow-hidden select-none w-full h-full">
      
      {/* Active Step Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {step === 0 && <WelcomeStep onNext={handleNext} onCancel={handleCancel} />}
        {step === 1 && <RequirementsStep onNext={handleNext} onBack={handleBack} />}
        {step === 2 && (
          <LicenseStep 
            onNext={handleNext} 
            onBack={handleBack} 
            accepted={licenseAccepted}
            setAccepted={setLicenseAccepted}
          />
        )}
        {step === 3 && (
          <LocationStep 
            onNext={handleNext} 
            onBack={handleBack} 
            installPath={installPath}
            setInstallPath={setInstallPath}
            spaceRequired={spaceRequired}
          />
        )}
        {step === 4 && (
          <ComponentsStep 
            onNext={handleNext} 
            onBack={handleBack} 
            selectedComponents={selectedComponents}
            setSelectedComponents={setSelectedComponents}
            setSpaceRequired={setSpaceRequired}
          />
        )}
        {step === 5 && (
          <DiskSpaceStep 
            onNext={handleNext} 
            onBack={handleBack} 
            spaceRequired={spaceRequired}
          />
        )}
        {step === 6 && (
          <ReadyStep 
            onNext={handleNext} 
            onBack={handleBack} 
            installPath={installPath}
            selectedComponents={selectedComponents}
          />
        )}
        {step === 7 && <InstallingStep onComplete={handleNext} />}
        {step === 8 && <FinalizingStep onComplete={handleNext} />}
        {step === 9 && <FinishStep onFinish={handleFinishWizard} />}
      </div>

      {/* Etched Divider Line */}
      <div className="px-3 flex-shrink-0">
        <div className="etched-line"></div>
      </div>

      {/* Standard Bottom Action Bar */}
      <footer className="h-footer-h w-full flex justify-between items-center px-margin-edge bg-dialog-face flex-shrink-0">
        <div className="text-[10px] text-text-main opacity-70">
          {step === 9 ? "Build 1.0.2406" : "Copyright (c) 2006 OpenAI Research Labs"}
        </div>
        <div className="flex items-center gap-gutter-button h-full">
          <button 
            onClick={handleBack} 
            disabled={isBackDisabled}
            className="win32-button"
          >
            &lt; Back
          </button>
          
          <button 
            onClick={step === 9 ? () => {
              // Trigger hidden button in FinishStep to handle values
              const btn = document.getElementById('finish-trigger');
              if (btn) btn.click();
            } : handleNext} 
            disabled={isNextDisabled}
            className={`win32-button ${step === 6 || step === 9 ? 'font-bold border-2 border-black' : ''}`}
          >
            {nextText}
          </button>
          
          <div className="w-[7px]" />
          
          <button 
            onClick={handleCancel}
            className="win32-button"
          >
            Cancel
          </button>
        </div>
      </footer>
    </div>
  );
};
