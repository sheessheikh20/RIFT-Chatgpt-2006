import React, { useState, useEffect } from 'react';
import type { Conversation, ConversationFolder, Message } from '../types';
import { fetchConversations, fetchMessages, updateConversation, deleteConversation, exportConversation } from '../api';
import { useDialogStore } from '../store/dialogStore';

export const ArchiveScreen: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<ConversationFolder>('Archive');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [previewMessages, setPreviewMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showDialog } = useDialogStore();

  // Load conversations when folder changes
  useEffect(() => {
    const loadConversations = async () => {
      setIsLoading(true);
      try {
        const data = await fetchConversations(selectedFolder);
        setConversations(data);
        setSelectedConversation(null);
        setPreviewMessages([]);
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadConversations();
  }, [selectedFolder]);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) {
      setPreviewMessages([]);
      return;
    }
    
    const loadMessages = async () => {
      try {
        const msgs = await fetchMessages(selectedConversation.id);
        setPreviewMessages(msgs);
      } catch (err) {
        console.error('Failed to fetch messages for preview:', err);
      }
    };
    loadMessages();
  }, [selectedConversation]);

  const handleRestore = async () => {
    if (!selectedConversation) return;
    try {
      await updateConversation(selectedConversation.id, { folder: 'Inbox' });
      setConversations(prev => prev.filter(c => c.id !== selectedConversation.id));
      setSelectedConversation(null);
      setPreviewMessages([]);
    } catch (err) {
      console.error('Failed to restore conversation:', err);
    }
  };

  const handleDelete = () => {
    if (!selectedConversation) return;
    showDialog('DeleteConfirmation', {
      message: `Permanently delete "${selectedConversation.title}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteConversation(selectedConversation.id);
          setConversations(prev => prev.filter(c => c.id !== selectedConversation.id));
          setSelectedConversation(null);
          setPreviewMessages([]);
        } catch (err) {
          console.error('Failed to delete conversation:', err);
        }
      },
    });
  };

  const handleExport = async () => {
    if (!selectedConversation) return;
    try {
      const blob = await exportConversation(selectedConversation.id, 'txt');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedConversation.title.replace(/\s+/g, '_')}_export.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export conversation:', err);
    }
  };

  const folders: { id: ConversationFolder; label: string; icon: string }[] = [
    { id: 'Inbox', label: 'Inbox', icon: 'inbox' },
    { id: 'Archive', label: 'Archive', icon: 'archive' },
    { id: 'Programming', label: 'Programming', icon: 'code' },
    { id: 'Personal', label: 'Personal', icon: 'person' },
    { id: 'Work', label: 'Work', icon: 'work' },
    { id: 'Favorites', label: 'Favorites', icon: 'star' },
    { id: 'Deleted', label: 'Deleted Items', icon: 'delete' },
  ];

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="flex-1 flex overflow-hidden p-1 gap-1 bg-[#D4D0C8] font-body-standard text-body-standard">
      {/* Left Navigation (Folders) */}
      <div className="w-[180px] bg-window-inner inset-border flex flex-col flex-shrink-0">
        <div className="p-1 bg-gradient-to-r from-[#0A246A] to-[#A6CAF0] text-white text-[11px] font-bold flex items-center gap-1 mb-1">
          <span className="material-symbols-outlined text-[14px]">folder_open</span>
          Archive Folders
        </div>
        <div className="p-1 space-y-1 flex-grow overflow-y-auto">
          {folders.map(folder => (
            <div 
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`flex items-center gap-1 px-1 py-0.5 cursor-default ${
                selectedFolder === folder.id ? 'tree-node-selected' : 'hover:bg-[#E0E0E0]'
              }`}
            >
              <span className={`material-symbols-outlined text-[16px] ${
                selectedFolder === folder.id ? 'text-white' : 'text-blue-600'
              }`}>{folder.icon}</span>
              <span>{folder.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Center List View */}
      <div className="flex-grow bg-window-inner inset-border flex flex-col overflow-hidden">
        {/* Table Header */}
        <div className="flex list-header sticky top-0 z-10 shrink-0">
          <div className="w-1/2 border-r border-border-shadow px-1">Subject / Title</div>
          <div className="w-1/4 border-r border-border-shadow px-1">Date</div>
          <div className="w-1/4 px-1">Size / Msgs</div>
        </div>
        
        {/* Table Body */}
        <div className="flex-grow overflow-y-auto divide-y divide-gray-100 bg-white">
          {isLoading ? (
            <div className="p-4 text-center text-text-disabled">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-text-disabled">No conversations found in {selectedFolder}.</div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`flex items-center p-1 cursor-default ${
                  selectedConversation?.id === conv.id 
                    ? 'bg-secondary text-on-secondary' 
                    : 'hover:bg-blue-50 text-text-main'
                }`}
              >
                <div className="w-1/2 truncate font-bold px-1">{conv.title}</div>
                <div className="w-1/4 px-1">{formatDate(conv.updatedAt)}</div>
                <div className="w-1/4 px-1 text-text-disabled">--</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Preview Panel */}
      <div className="w-[300px] bg-dialog-face outset-border flex flex-col flex-shrink-0">
        <div className="p-1 bg-gradient-to-r from-[#0A246A] to-[#A6CAF0] text-white text-[11px] font-bold flex items-center gap-1 shrink-0">
          <span className="material-symbols-outlined text-[14px]">preview</span>
          Preview
        </div>
        <div className="p-2 flex-grow overflow-y-auto bg-window-inner inset-border m-1 text-left">
          {!selectedConversation ? (
            <div className="text-text-disabled text-center mt-10">Select a conversation to preview.</div>
          ) : previewMessages.length === 0 ? (
            <div className="text-text-disabled text-center mt-10">Loading messages...</div>
          ) : (
            <div className="space-y-3">
              {previewMessages.map((msg, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-2">
                  <div className={`font-bold text-[9px] uppercase ${
                    msg.role === 'user' ? 'text-blue-800' : 'text-primary-container'
                  }`}>
                    {msg.role === 'user' ? 'Administrator' : 'ChatGPT Engine'}
                  </div>
                  <div className="mt-1 whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-2 shrink-0 flex gap-2 justify-end bg-dialog-face border-t border-border-shadow">
          <button 
            onClick={handleRestore}
            className="win32-button" 
            disabled={!selectedConversation}
          >
            Restore
          </button>
          <button 
            onClick={handleExport}
            className="win32-button" 
            disabled={!selectedConversation}
          >
            Export
          </button>
          <button 
            onClick={handleDelete}
            className="win32-button animate-pulse" 
            disabled={!selectedConversation}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
