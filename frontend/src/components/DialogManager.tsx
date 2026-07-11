import React from 'react';
import { useDialogStore } from '../store/dialogStore';

export const DialogManager: React.FC = () => {
  const { isOpen, type, options, hideDialog } = useDialogStore();

  if (!isOpen || !type) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20">
      {/* Reusable XP Window Frame for Modals */}
      <div className="bg-dialog-face outset-border-heavy shadow-2xl flex flex-col pointer-events-auto min-w-[300px] max-w-[500px]">
        
        {/* Title Bar */}
        <div className="h-6 bg-gradient-to-r from-[#0A246A] to-[#A6CAF0] flex items-center justify-between px-1 border-b border-white select-none">
          <div className="flex items-center gap-1">
            <span className="text-white font-bold text-[11px]">
              {options.title || 'ChatGPT Professional Enterprise Suite'}
            </span>
          </div>
          <button 
            onClick={hideDialog}
            className="w-[21px] h-[21px] bg-[#D4D0C8] border-outset flex items-center justify-center hover:bg-[#E0DFE3] active:border-inset active:p-[1px_0_0_1px]"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>

        {/* Dialog Content Area */}
        <div className="p-3 text-body-standard text-text-main flex flex-col gap-3">
          
          {/* Default Layout for Information, Warning, Error */}
          {['Information', 'Warning', 'Error', 'Confirmation', 'DeleteConfirmation'].includes(type) && (
            <div className="flex gap-3 items-start">
              <div className="mt-1 shrink-0">
                {type === 'Information' && <span className="material-symbols-outlined text-blue-600 text-[32px] font-fill-1">info</span>}
                {type === 'Warning' && <span className="material-symbols-outlined text-yellow-500 text-[32px] font-fill-1">warning</span>}
                {type === 'Error' && <span className="material-symbols-outlined text-red-600 text-[32px] font-fill-1">error</span>}
                {type === 'Confirmation' && <span className="material-symbols-outlined text-blue-600 text-[32px] font-fill-1">help</span>}
                {type === 'DeleteConfirmation' && <span className="material-symbols-outlined text-red-600 text-[32px] font-fill-1">delete_forever</span>}
              </div>
              <div className="flex-grow pt-1">
                {options.message}
              </div>
            </div>
          )}

          {/* Placeholder for specific workflows like KnowledgePackRequired */}
          {type === 'KnowledgePackRequired' && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 items-start">
                <span className="material-symbols-outlined text-[#93000a] text-[32px]">extension_off</span>
                <div>
                  <h3 className="font-bold">Required Knowledge Pack Missing</h3>
                  <p className="mt-1">{options.message}</p>
                </div>
              </div>
              
              <div className="bg-white inset-border p-2">
                <div className="font-bold">{options.requiredPack}</div>
                <div className="text-text-disabled mt-1">Dependencies:</div>
                <ul className="list-disc pl-4 mt-1">
                  {options.dependencies?.map((dep, i) => <li key={i}>{dep}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Actions Footer */}
          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-border-shadow">
            {(type === 'Confirmation' || type === 'DeleteConfirmation' || type === 'KnowledgePackRequired') && (
              <button 
                onClick={() => {
                  if (options.onConfirm) options.onConfirm();
                  else hideDialog();
                }}
                className="btn-outset w-button-w h-button-h"
              >
                Yes
              </button>
            )}
            {(type === 'Confirmation' || type === 'DeleteConfirmation' || type === 'KnowledgePackRequired') && (
              <button 
                onClick={() => {
                  if (options.onCancel) options.onCancel();
                  hideDialog();
                }}
                className="btn-outset w-button-w h-button-h"
              >
                No
              </button>
            )}
            
            {['Information', 'Warning', 'Error', 'ExportComplete'].includes(type) && (
              <button 
                onClick={() => {
                  if (options.onComplete) options.onComplete();
                  hideDialog();
                }}
                className="btn-outset w-button-w h-button-h"
              >
                OK
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
