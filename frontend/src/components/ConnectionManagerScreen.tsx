import React, { useState } from 'react';

interface ConnectionProps {
  onNext: (latency: number) => void;
  onBack: () => void;
  onCancel: () => void;
}

interface ConnectionType {
  id: string;
  name: string;
  latencyMs: number;
  qualityBlocks: number;
  qualityLabel: 'POOR' | 'STABLE' | 'OPTIMAL';
  qualityColorClass: string;
}

export const ConnectionManagerScreen: React.FC<ConnectionProps> = ({ onNext, onBack, onCancel }) => {
  const [selectedId, setSelectedId] = useState('broadband');

  const connectionTypes: ConnectionType[] = [
    {
      id: 'dialup',
      name: 'Dial-Up (56 kbps)',
      latencyMs: 2500,
      qualityBlocks: 3,
      qualityLabel: 'POOR',
      qualityColorClass: 'text-error'
    },
    {
      id: 'dsl',
      name: 'DSL',
      latencyMs: 450,
      qualityBlocks: 6,
      qualityLabel: 'STABLE',
      qualityColorClass: 'text-secondary'
    },
    {
      id: 'broadband',
      name: 'Broadband',
      latencyMs: 150,
      qualityBlocks: 9,
      qualityLabel: 'STABLE',
      qualityColorClass: 'text-[#016200]' // Matches stable/tertiary tone
    },
    {
      id: 'lan',
      name: 'Corporate LAN',
      latencyMs: 30, // < 50ms
      qualityBlocks: 12,
      qualityLabel: 'OPTIMAL',
      qualityColorClass: 'text-tertiary'
    }
  ];

  const activeConn = connectionTypes.find(c => c.id === selectedId) || connectionTypes[2];

  const handleRowClick = (id: string) => {
    setSelectedId(id);
  };

  const handleConnect = () => {
    onNext(activeConn.latencyMs);
  };

  return (
    <div className="flex-grow flex flex-col overflow-hidden relative font-body-standard text-body-standard text-text-main select-none w-full h-full">
      
      {/* Header: TopAppBar */}
      <header className="h-header-h w-full flex justify-between items-center px-margin-edge bg-gradient-to-b from-white to-header-blue-bottom border-b border-border-shadow flex-shrink-0">
        <div className="flex flex-col text-left">
          <span className="font-header-title text-header-title text-text-main block">Connection Manager</span>
          <span className="text-[10px] text-text-main mt-0.5 block">Knowledge Transfer Protocol Optimization</span>
        </div>
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary !text-[32px]">settings</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow p-margin-edge flex flex-col overflow-hidden text-left">
        <p className="mb-4">Select your connection type to optimize the Knowledge Transfer Protocol.</p>
        
        {/* Selection List (Inset Container) */}
        <div className="inset-border flex-grow p-1 overflow-y-auto mb-4 bg-window-inner">
          <table className="w-full text-left border-collapse">
            <thead className="bg-dialog-face sticky top-0 border-b border-border-shadow">
              <tr className="text-[11px]">
                <th className="p-1 font-normal border-r border-border-shadow w-2/3">Type</th>
                <th className="p-1 font-normal">Latency</th>
              </tr>
            </thead>
            <tbody>
              {connectionTypes.map(c => {
                const isSelected = c.id === selectedId;
                return (
                  <tr 
                    key={c.id}
                    onClick={() => handleRowClick(c.id)}
                    className={`cursor-default ${
                      isSelected 
                        ? 'bg-primary text-white' 
                        : 'hover:bg-primary hover:text-white'
                    }`}
                  >
                    <td className="p-1 flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="conn" 
                        id={c.id} 
                        checked={isSelected}
                        onChange={() => setSelectedId(c.id)}
                        className="pointer-events-none"
                      />
                      <label className="w-full pointer-events-none">{c.name}</label>
                    </td>
                    <td className="p-1">
                      {c.latencyMs === 30 ? '<50ms' : `${c.latencyMs}ms`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Network Quality Meter */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-caption-small font-caption-small">Network Quality:</span>
          <div className="inset-border flex items-center p-0.5 bg-white h-[16px] w-32">
            {Array.from({ length: 12 }).map((_, idx) => {
              const isActive = idx < activeConn.qualityBlocks;
              return (
                <div 
                  key={idx} 
                  className={`w-[6px] h-full mr-[2px] flex-shrink-0 ${
                    isActive ? 'bg-[#00D200]' : 'bg-[#004400]'
                  }`} 
                />
              );
            })}
          </div>
          <span className={`text-caption-small font-caption-small font-bold ${activeConn.qualityColorClass}`}>
            {activeConn.qualityLabel}
          </span>
        </div>
      </div>

      {/* Etched Divider */}
      <div className="etched-divider mx-margin-edge w-[calc(100%-24px)] flex-shrink-0"></div>

      {/* Footer: Action Bar */}
      <footer className="h-footer-h w-full flex justify-end items-center gap-gutter-button px-margin-edge bg-dialog-face flex-shrink-0">
        <button 
          onClick={onBack}
          className="win32-button"
        >
          &lt; Back
        </button>
        <button 
          onClick={handleConnect}
          className="win32-button font-bold border-2 border-black"
        >
          Connect &gt;
        </button>
        <div className="w-2" />
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
