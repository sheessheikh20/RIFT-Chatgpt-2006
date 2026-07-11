import React, { useState } from 'react';

interface ComponentItem {
  id: string;
  name: string;
  sizeMb: number;
  required: boolean;
  checked: boolean;
  description: string;
}

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  selectedComponents: string[];
  setSelectedComponents: (components: string[]) => void;
  setSpaceRequired: (space: number) => void;
}

export const ComponentsStep: React.FC<StepProps> = ({ 
  onNext, 
  onBack, 
  selectedComponents,
  setSelectedComponents,
  setSpaceRequired
}) => {
  const [componentsList, setComponentsList] = useState<ComponentItem[]>([
    {
      id: 'core',
      name: 'Core Language Engine (Required) - 1.2 GB',
      sizeMb: 1200,
      required: true,
      checked: true,
      description: 'Installs the primary neural processing libraries.'
    },
    {
      id: 'manager',
      name: 'Knowledge Pack Manager - 50 MB',
      sizeMb: 50,
      required: false,
      checked: selectedComponents.includes('manager'),
      description: 'Manages knowledge packs and ensures version compatibility.'
    },
    {
      id: 'programming',
      name: 'Programming Knowledge Pack - 800 MB',
      sizeMb: 800,
      required: false,
      checked: selectedComponents.includes('programming'),
      description: 'Advanced technical dataset for software development and coding logic.'
    },
    {
      id: 'math',
      name: 'Mathematics Knowledge Pack - 450 MB',
      sizeMb: 450,
      required: false,
      checked: selectedComponents.includes('math'),
      description: 'Formula libraries and complex computational reasoning modules.'
    }
  ]);

  const [activeDescription, setActiveDescription] = useState<string>(
    'Installs the primary neural processing libraries.'
  );
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    setActiveDescription(componentsList[index].description);
  };

  const handleToggle = (index: number) => {
    const comp = componentsList[index];
    if (comp.required) return; // cannot toggle core

    const updated = [...componentsList];
    updated[index].checked = !updated[index].checked;
    setComponentsList(updated);

    // Sync selected items list
    const activeIds = updated.filter(c => c.checked).map(c => c.id);
    setSelectedComponents(activeIds);

    // Calculate new total size
    const totalSize = updated.filter(c => c.checked).reduce((sum, c) => sum + c.sizeMb, 0);
    setSpaceRequired(totalSize);
  };

  return (
    <div className="flex flex-col flex-grow select-none bg-dialog-face">
      {/* TopAppBar */}
      <header className="h-[58px] w-full flex justify-between items-center px-margin-edge bg-gradient-to-b from-white to-header-blue-bottom border-b border-border-shadow flex-shrink-0">
        <div className="flex flex-col text-text-main text-left">
          <h1 className="font-header-title text-header-title">Select Components</h1>
          <p className="text-caption-small font-caption-small mt-1 text-on-surface-variant">Which features should be installed?</p>
        </div>
        <div className="flex items-center">
          <span className="material-symbols-outlined text-primary !text-[32px]">settings</span>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 p-margin-edge flex gap-[12px] bg-dialog-face text-text-main">
        {/* Component Selection Tree */}
        <div className="flex-grow flex flex-col gap-2 text-left">
          <p className="text-body-standard">Select the components you want to install:</p>
          <div className="inset-border h-[160px] overflow-y-auto bg-window-inner p-1">
            {componentsList.map((comp, idx) => (
              <div 
                key={comp.id}
                onClick={() => handleSelect(idx)}
                className={`flex items-center gap-2 px-1 py-0.5 cursor-default ${
                  selectedIndex === idx ? 'bg-primary text-white' : 'hover:bg-blue-50'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={comp.checked}
                  disabled={comp.required}
                  onChange={() => handleToggle(idx)}
                  className="win32-checkbox cursor-pointer"
                />
                <span className="font-body-standard">{comp.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-caption-small flex flex-col gap-0.5 text-text-disabled">
            <p>Space required: {(componentsList.filter(c => c.checked).reduce((sum, c) => sum + c.sizeMb, 0) / 1000).toFixed(2)} GB</p>
            <p>Space available: 45.8 GB</p>
          </div>
        </div>

        {/* Description Sidebar */}
        <div className="w-[140px] flex flex-col gap-2 text-left">
          <p className="text-body-standard">Description:</p>
          <div className="inset-border flex-grow text-caption-small bg-dialog-face p-2 overflow-y-auto leading-tight" id="description-box">
            {activeDescription}
          </div>
        </div>
      </main>
    </div>
  );
};
