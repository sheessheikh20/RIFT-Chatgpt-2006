import React, { useRef } from 'react';

interface WindowFrameProps {
  id: string;
  title: string;
  width: number;
  height: number;
  x: number;
  y: number;
  zIndex: number;
  isMaximized?: boolean;
  active?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: () => void;
  onDrag?: (id: string, x: number, y: number) => void;
  showChrome?: boolean; // If false, renders without title bar (e.g. Splash Screen)
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  id,
  title,
  width,
  height,
  x,
  y,
  zIndex,
  isMaximized = false,
  active = false,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onDrag,
  showChrome = true,
  children,
}) => {
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
    if (onClose) onClose();
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow();
    }
    if (onMinimize) onMinimize();
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow();
    }
    if (onMaximize) onMaximize();
  };

  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div
      onClick={onFocus}
      style={style}
      className={`bg-dialog-face outset-border flex flex-col overflow-hidden select-none border-t-white border-l-white border-b-border-dark border-r-border-dark`}
    >
      {/* Title Bar */}
      {showChrome && (
        <div
          className={`h-[25px] flex items-center justify-between px-2 mb-[1px] select-none ${
            active 
              ? 'bg-gradient-to-r from-[#0058EE] to-[#3784F5]' 
              : 'bg-gradient-to-r from-[#7B9CC5] to-[#99B2D2]'
          }`}
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
          <div className="flex items-center gap-1.5 text-white pointer-events-none">
            <span className="material-symbols-outlined !text-[14px] text-white">terminal</span>
            <span className="font-bold text-[11px] drop-shadow-[1px_1px_rgba(0,0,0,0.5)] font-sans">
              {title}
            </span>
          </div>
          <div className="flex gap-[2px]" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            {(onMinimize || window.electronAPI) && (
              <button
                onClick={handleMinimize}
                className="w-[21px] h-[21px] bg-dialog-face outset-border flex items-center justify-center font-bold text-black text-[9px] hover:brightness-105 active:scale-95"
              >
                _
              </button>
            )}
            {(onMaximize || window.electronAPI) && (
              <button
                onClick={handleMaximize}
                className="w-[21px] h-[21px] bg-dialog-face outset-border flex items-center justify-center font-bold text-black text-[9px] hover:brightness-105 active:scale-95"
              >
                🗖
              </button>
            )}
            {(onClose || window.electronAPI) && (
              <button
                onClick={handleClose}
                className="w-[21px] h-[21px] bg-[#E81123] border border-white/40 flex items-center justify-center text-white text-[10px] font-bold hover:brightness-110 active:scale-95"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Window Body Container */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-dialog-face relative">
        {children}
      </div>
    </div>
  );
};
