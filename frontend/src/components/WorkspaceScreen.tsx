import React, { useState, useEffect, useRef } from 'react';
import type { Conversation, Message, MessageSendRequest, AssistantProfile } from '../types';
import { fetchConversations, fetchMessages, sendMessage, fetchAssistantProfiles } from '../api';
import { ArchiveScreen } from './ArchiveScreen';
import { useDialogStore } from '../store/dialogStore';

interface WorkspaceProps {
  onLogout: () => void;
  latencyMs: number;
}

export const WorkspaceScreen: React.FC<WorkspaceProps> = ({ onLogout, latencyMs }) => {
  const [activeTab, setActiveTab] = useState<'thread' | 'archive' | 'library' | 'control' | 'help'>('thread');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeProfile, setActiveProfile] = useState<string>('programmer');
  const [profiles, setProfiles] = useState<AssistantProfile[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [uptime, setUptime] = useState(0);

  // Log entries for the terminal execution log
  const [logEntries, setLogEntries] = useState<{ time: string; text: string; color?: string }[]>([
    { time: formatTime(new Date()), text: 'System Idle. Ready for instruction...' },
    { time: '', text: 'SYSTEM: No active session loaded.', color: 'text-cyan-300' },
  ]);

  const { showDialog } = useDialogStore();

  function formatTime(d: Date) {
    return `[${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}]`;
  }

  const addLog = (text: string, color?: string) => {
    setLogEntries(prev => [...prev, { time: formatTime(new Date()), text, color }]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    fetchAssistantProfiles().then(setProfiles).catch(console.error);
    fetchConversations().then(data => {
      setConversations(data);
      if (data.length > 0) {
        setCurrentConvId(data[0].id);
        fetchMessages(data[0].id).then(msgs => {
          setMessages(msgs);
          if (msgs.length > 0) addLog('Session restored from archive.');
        }).catch(console.error);
      }
    }).catch(console.error);
  }, []);

  // Uptime counter
  useEffect(() => {
    const t = setInterval(() => setUptime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatUptime = (s: number) => {
    const hh = String(Math.floor(s / 3600)).padStart(2, '0');
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const handleExecute = async () => {
    if (!inputText.trim()) return;
    if (!currentConvId) {
      showDialog('Warning', { message: 'No active conversation thread.' });
      return;
    }

    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      assistantProfile: null,
      createdAt: new Date().toISOString()
    }]);

    setIsProcessing(true);
    addLog('Parsing Request... OK');
    addLog('Searching Installed Knowledge Packs... OK (8 found)');
    addLog('Running Language Engine... ACTIVE', 'text-green-300');

    try {
      const startTime = Date.now();
      const request: MessageSendRequest = {
        content: userMessage,
        assistantProfile: activeProfile,
        connectionType: latencyMs < 50 ? 'lan' : latencyMs < 200 ? 'broadband' : latencyMs < 500 ? 'dsl' : 'dialup'
      };

      const response = await sendMessage(currentConvId, request);

      const elapsed = Date.now() - startTime;
      if (elapsed < 2000) {
        await new Promise(r => setTimeout(r, 2000 - elapsed));
      }

      setMessages(prev => [...prev, {
        id: response.id,
        role: 'assistant',
        content: response.content,
        assistantProfile: activeProfile,
        createdAt: response.createdAt
      }]);
      addLog(`Response generated in ${response.latencyMs}ms. Queries remaining: ${response.queriesRemaining}`, 'text-cyan-300');

    } catch (err: any) {
      if (err.status === 428) {
        showDialog('KnowledgePackRequired', {
          message: err.message,
          requiredPack: err.packName,
          dependencies: ['Core Language Engine', 'Local Storage Module']
        });
      } else {
        showDialog('Error', { message: err.message || 'An error occurred processing the request.' });
      }
      addLog('ERROR: Task failed. See error dialog.', 'text-red-400');
    } finally {
      setIsProcessing(false);
    }
  };

  const activeProfileData = profiles.find(p => p.id === activeProfile);

  return (
    <div className="w-full h-full bg-dialog-face flex flex-col shadow-2xl relative select-none text-text-main font-body-standard overflow-hidden"
         style={{ boxShadow: '2px 2px 0px #000000' }}>

      {/* === TopAppBar (Title Bar + Menu Bar + Toolbar) === */}
      <header className="flex flex-col w-full h-auto px-1 bg-header-blue-bottom border-b border-border-shadow"
              style={{ boxShadow: 'inset 1px 1px 0px #FFFFFF' }}>

        {/* Title Bar */}
        <div className="flex justify-between items-center h-[26px] px-2 text-white font-bold"
             style={{ background: 'linear-gradient(to right, #0055E5, #2d6af9)' }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">terminal</span>
            <span className="font-header-title text-header-title text-white">Enterprise AI Workstation 2006</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-[21px] h-[21px] flex items-center justify-center bg-dialog-face text-black p-0 outset-border"
                    title="Minimize">
              <span className="material-symbols-outlined text-[14px]">minimize</span>
            </button>
            <button className="w-[21px] h-[21px] flex items-center justify-center bg-dialog-face text-black p-0 outset-border"
                    title="Maximize">
              <span className="material-symbols-outlined text-[14px]">check_box_outline_blank</span>
            </button>
            <button className="w-[21px] h-[21px] flex items-center justify-center text-white p-0 outset-border"
                    style={{ background: '#CC3300' }}
                    onClick={onLogout}
                    title="Close">
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        </div>

        {/* Menu Bar */}
        <nav className="flex items-center h-[22px] px-1 gap-4 text-on-surface text-body-standard">
          <span className="hover:bg-primary-container hover:text-white px-1 cursor-default">File</span>
          <span className="hover:bg-primary-container hover:text-white px-1 cursor-default">Edit</span>
          <span className="hover:bg-primary-container hover:text-white px-1 cursor-default">View</span>
          <span className={`px-1 cursor-default font-bold ${activeTab === 'library'
            ? 'text-on-primary-fixed bg-primary-fixed-dim border border-on-primary-fixed-variant'
            : 'hover:bg-primary-container hover:text-white'}`}
            onClick={() => setActiveTab('library')}>Knowledge</span>
          <span className="hover:bg-primary-container hover:text-white px-1 cursor-default"
                onClick={() => setActiveTab('control')}>Tools</span>
          <span className="hover:bg-primary-container hover:text-white px-1 cursor-default">Window</span>
          <span className="hover:bg-primary-container hover:text-white px-1 cursor-default"
                onClick={() => setActiveTab('help')}>Help</span>
        </nav>

        {/* Toolbar */}
        <div className="flex items-center gap-1 p-1 bg-dialog-face border-t border-white border-b border-border-shadow">
          {/* File group */}
          <div className="flex items-center gap-0 pr-2 border-r border-border-shadow">
            <button
              onClick={async () => {
                setIsProcessing(true);
                try {
                  const res = await fetch('http://localhost:8080/api/conversations', { method: 'POST' });
                  const data = await res.json();
                  setConversations(prev => [...prev, data]);
                  setCurrentConvId(data.id);
                  setMessages([]);
                  setActiveTab('thread');
                  addLog('New session initialized.');
                } catch (e: any) {
                  showDialog('Error', { message: e.message || 'Failed to start conversation.' });
                } finally {
                  setIsProcessing(false);
                }
              }}
              className="flex flex-col items-center justify-center w-12 hover:bg-surface-bright p-1 active:translate-y-[1px]">
              <span className="material-symbols-outlined text-secondary">add_circle</span>
              <span className="text-[9px]">New</span>
            </button>
            <button className="flex flex-col items-center justify-center w-12 hover:bg-surface-bright p-1 active:translate-y-[1px]">
              <span className="material-symbols-outlined text-secondary">folder_open</span>
              <span className="text-[9px]">Open</span>
            </button>
            <button className="flex flex-col items-center justify-center w-12 hover:bg-surface-bright p-1 active:translate-y-[1px]">
              <span className="material-symbols-outlined text-secondary">save</span>
              <span className="text-[9px]">Save</span>
            </button>
          </div>
          {/* Profile Switcher */}
          <div className="flex items-center gap-2 px-2 border-r border-border-shadow">
            <div className="flex flex-col">
              <label className="text-[9px] mb-[1px]">Active Profile:</label>
              <div className="inset-border bg-white flex items-center h-[18px]">
                <select
                  value={activeProfile}
                  onChange={e => setActiveProfile(e.target.value)}
                  className="bg-transparent text-[10px] border-none focus:ring-0 h-full py-0 pl-1 pr-5 font-body-standard outline-none min-w-[100px]"
                  style={{
                    appearance: 'none',
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3E%3Cpath d='M0 2l4 4 4-4z'/%3E%3C/svg%3E\")",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 4px center',
                    paddingRight: '20px'
                  }}>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.displayName}</option>
                  ))}
                  {profiles.length === 0 && <option value="programmer">Programmer</option>}
                </select>
              </div>
            </div>
          </div>
          {/* Search / Packs group */}
          <div className="flex items-center gap-0 px-2 border-r border-border-shadow">
            <button className="flex flex-col items-center justify-center w-12 hover:bg-surface-bright p-1 active:translate-y-[1px]">
              <span className="material-symbols-outlined text-secondary">search</span>
              <span className="text-[9px]">Search</span>
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className="flex flex-col items-center justify-center w-12 hover:bg-surface-bright p-1 active:translate-y-[1px]">
              <span className="material-symbols-outlined text-secondary">inventory_2</span>
              <span className="text-[9px]">Packs</span>
            </button>
            <button className="flex flex-col items-center justify-center w-12 hover:bg-surface-bright p-1 active:translate-y-[1px]">
              <span className="material-symbols-outlined text-secondary">assignment_ind</span>
              <span className="text-[9px]">Profiles</span>
            </button>
          </div>
          {/* Diag / Settings group */}
          <div className="flex items-center gap-0 px-2">
            <button
              onClick={() => setActiveTab('help')}
              className="flex flex-col items-center justify-center w-12 hover:bg-surface-bright p-1 active:translate-y-[1px]">
              <span className="material-symbols-outlined text-secondary">analytics</span>
              <span className="text-[9px]">Diag</span>
            </button>
            <button
              onClick={() => setActiveTab('control')}
              className="flex flex-col items-center justify-center w-12 hover:bg-surface-bright p-1 active:translate-y-[1px]">
              <span className="material-symbols-outlined text-secondary">settings</span>
              <span className="text-[9px]">Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* === Main Body === */}
      <main className="flex flex-1 overflow-hidden">

        {/* === Left Sidebar: Project Explorer === */}
        <aside className="flex flex-col w-[184px] h-full border-r border-border-shadow bg-window-inner shrink-0"
               style={{ boxShadow: 'inset -1px 0px 0px #FFFFFF' }}>
          <div className="p-2 bg-dialog-face border-b border-border-shadow">
            <span className="font-header-title text-header-title text-secondary">Project Explorer</span>
            <div className="text-[9px] text-text-disabled">AI-Agent-v1.0.42</div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-0.5">
              {/* Active Session */}
              <div
                onClick={() => setActiveTab('thread')}
                className={`flex items-center gap-1 py-1 px-1 cursor-pointer font-bold ${
                  activeTab === 'thread'
                    ? 'bg-primary-container text-white'
                    : 'hover:bg-surface-container-high'
                }`}>
                <span className="material-symbols-outlined scale-75">
                  {activeTab === 'thread' ? 'arrow_drop_down' : 'arrow_right'}
                </span>
                <span className={`material-symbols-outlined ${activeTab === 'thread' ? 'text-white' : 'text-yellow-600'}`}>
                  chat_bubble
                </span>
                <span>Active Session</span>
              </div>
              {activeTab === 'thread' && currentConvId && (
                <div className="flex items-center gap-1 py-1 px-2 ml-4 cursor-pointer hover:bg-surface-container-high text-on-surface">
                  <span className="material-symbols-outlined scale-75">description</span>
                  <span className="truncate max-w-[100px]">Session_{currentConvId.slice(-3)}</span>
                </div>
              )}

              {/* Conversation Archive */}
              <div
                onClick={() => setActiveTab('archive')}
                className={`flex items-center gap-1 py-1 px-1 cursor-pointer ${
                  activeTab === 'archive'
                    ? 'bg-primary-container text-white font-bold'
                    : 'hover:bg-surface-container-high'
                }`}>
                <span className="material-symbols-outlined scale-75">arrow_right</span>
                <span className={`material-symbols-outlined ${activeTab === 'archive' ? 'text-white' : 'text-yellow-600'}`}>
                  folder
                </span>
                <span>Conversation Archive</span>
              </div>

              {/* Favorites */}
              <div className="flex items-center gap-1 py-1 px-1 cursor-pointer hover:bg-surface-container-high">
                <span className="material-symbols-outlined scale-75 text-text-disabled">star</span>
                <span>Favorites</span>
              </div>

              {/* Knowledge Packs */}
              <div
                onClick={() => setActiveTab('library')}
                className={`flex items-center gap-1 py-1 px-1 cursor-pointer ${
                  activeTab === 'library'
                    ? 'bg-primary-container text-white font-bold'
                    : 'hover:bg-surface-container-high'
                }`}>
                <span className="material-symbols-outlined scale-75">arrow_right</span>
                <span className={`material-symbols-outlined ${activeTab === 'library' ? 'text-white' : 'text-secondary'}`}>
                  inventory_2
                </span>
                <span>Knowledge Packs</span>
              </div>

              {/* Assistant Profiles */}
              <div
                onClick={() => setActiveTab('control')}
                className={`flex items-center gap-1 py-1 px-1 cursor-pointer ${
                  activeTab === 'control'
                    ? 'bg-primary-container text-white font-bold'
                    : 'hover:bg-surface-container-high'
                }`}>
                <span className="material-symbols-outlined scale-75">arrow_right</span>
                <span className={`material-symbols-outlined ${activeTab === 'control' ? 'text-white' : 'text-secondary'}`}>
                  person_search
                </span>
                <span>Assistant Profiles</span>
              </div>
            </div>
          </div>
        </aside>

        {/* === Workspace: Center + Right Pane === */}
        {activeTab === 'thread' && (
          <>
            {/* Center pane */}
            <section className="flex-1 flex flex-col p-3 gap-3 overflow-hidden bg-surface-variant">

              {/* Terminal Execution Log */}
              <div className="inset-border bg-black p-2 font-mono text-white text-[10px] h-[80px] overflow-y-auto shrink-0 flex-shrink-0">
                {logEntries.map((entry, i) => (
                  <div key={i} className="flex gap-4">
                    {entry.time && <span className="text-green-400 shrink-0">{entry.time}</span>}
                    <span className={entry.color || ''}>{entry.text}</span>
                  </div>
                ))}
              </div>

              {/* Conversation Area */}
              <div className="flex-1 inset-border bg-white overflow-y-auto flex flex-col p-4 select-text">
                {messages.length === 0 ? (
                  /* Empty State */
                  <div className="m-auto flex flex-col items-center justify-center text-center max-w-md w-full p-8">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 bg-dialog-face outset-border flex items-center justify-center">
                        <span className="material-symbols-outlined text-[48px] text-secondary">hub</span>
                      </div>
                    </div>
                    <h2 className="font-display-welcome text-display-welcome text-primary mb-2">Welcome to Enterprise AI</h2>
                    <p className="mb-8 text-on-surface-variant">Your workstation is initialized and ready. Select an action below to begin your professional AI session.</p>
                    <div className="grid grid-cols-1 gap-3 w-full">
                      <button
                        onClick={async () => {
                          setIsProcessing(true);
                          try {
                            const res = await fetch('http://localhost:8080/api/conversations', { method: 'POST' });
                            const data = await res.json();
                            setConversations(prev => [...prev, data]);
                            setCurrentConvId(data.id);
                            setMessages([]);
                            addLog('New session initialized.');
                          } catch (e: any) {
                            showDialog('Error', { message: e.message || 'Failed to start conversation.' });
                          } finally {
                            setIsProcessing(false);
                          }
                        }}
                        className="flex items-center gap-3 p-3 bg-dialog-face outset-border hover:bg-surface-container-high active:translate-y-[1px]">
                        <span className="material-symbols-outlined text-secondary">add_comment</span>
                        <div className="text-left">
                          <div className="font-bold">Start New Conversation</div>
                          <div className="text-[9px] text-text-disabled">Initialize a fresh context with the current profile.</div>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('library')}
                        className="flex items-center gap-3 p-3 bg-dialog-face outset-border hover:bg-surface-container-high active:translate-y-[1px]">
                        <span className="material-symbols-outlined text-secondary">download_for_offline</span>
                        <div className="text-left">
                          <div className="font-bold">Install Additional Knowledge Packs</div>
                          <div className="text-[9px] text-text-disabled">Extend the intelligence of your AI with domain-specific data.</div>
                        </div>
                      </button>

                      <button
                        onClick={() => showDialog('Info', { message: 'Simulated Configuration Import. Custom .aicfg parser active.' })}
                        className="flex items-center gap-3 p-3 bg-dialog-face outset-border hover:bg-surface-container-high active:translate-y-[1px]">
                        <span className="material-symbols-outlined text-secondary">upload_file</span>
                        <div className="text-left">
                          <div className="font-bold">Import Conversation</div>
                          <div className="text-[9px] text-text-disabled">Load an existing .aicfg or .xml session log from disk.</div>
                        </div>
                      </button>
                    </div>
                    <div className="mt-8 text-[10px] text-text-disabled flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      Tip: You can change the AI personality using the Profile Switcher in the toolbar.
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const msgTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    return (
                      <div key={index} className="mb-6 last:mb-2 text-left">
                        {msg.role === 'user' ? (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-secondary">User:</span>
                              <span className="text-[9px] text-text-disabled">{msgTime}</span>
                            </div>
                            <div className="pl-4 border-l-2 border-secondary py-1 italic leading-relaxed">
                              "{msg.content}"
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-primary">Assistant:</span>
                              <span className="text-[9px] text-text-disabled">{msgTime}</span>
                            </div>
                            <div className="pl-4 py-1 leading-relaxed space-y-2">
                              <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
                {isProcessing && (
                  <div className="flex items-center gap-2 text-text-disabled italic animate-pulse text-[10px]">
                    <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                    Language Engine processing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="h-[60px] flex gap-2 shrink-0">
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleExecute();
                    }
                  }}
                  className="flex-1 inset-border p-2 resize-none outline-none font-body-standard text-body-standard bg-white"
                  placeholder={currentConvId ? "Type your instruction..." : "Select 'New Conversation' to enable input..."}
                  disabled={isProcessing || !currentConvId}
                />
                <button
                  onClick={handleExecute}
                  disabled={isProcessing || !currentConvId}
                  className="w-[75px] h-full bg-dialog-face outset-border flex flex-col items-center justify-center hover:bg-surface-bright active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="material-symbols-outlined text-secondary">send</span>
                  <span className="text-[10px] font-bold">{isProcessing ? 'WAIT' : 'SEND'}</span>
                </button>
              </div>
            </section>

            {/* Right Inspector Pane */}
            <aside className="w-[200px] h-full border-l border-border-shadow bg-dialog-face flex flex-col shrink-0">
              <div className="p-2 text-white font-bold text-[11px] flex items-center justify-between"
                   style={{ background: '#0055E5' }}>
                <span>Properties</span>
                <span className="material-symbols-outlined text-[14px]">push_pin</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {/* Property Grid */}
                <div className="border-b border-border-shadow">
                  <div className="bg-surface-container-high px-2 py-1 font-bold border-b border-border-shadow">Contextual Info</div>
                  <table className="w-full text-[10px]">
                    <tbody>
                      {messages.length === 0 ? (
                        <>
                          <tr className="border-b border-surface-variant">
                            <td className="w-1/2 p-1 border-r border-surface-variant text-text-disabled italic">Current Session</td>
                            <td className="w-1/2 p-1 text-text-disabled">None</td>
                          </tr>
                          <tr className="border-b border-surface-variant">
                            <td className="w-1/2 p-1 border-r border-surface-variant text-text-disabled">Profile</td>
                            <td className="w-1/2 p-1 text-secondary">{activeProfileData?.displayName || 'Programmer'}</td>
                          </tr>
                          <tr className="border-b border-surface-variant">
                            <td className="w-1/2 p-1 border-r border-surface-variant text-text-disabled">Engine Status</td>
                            <td className="w-1/2 p-1">Standby</td>
                          </tr>
                          <tr className="border-b border-surface-variant">
                            <td className="w-1/2 p-1 border-r border-surface-variant text-text-disabled">Token Count</td>
                            <td className="w-1/2 p-1">0</td>
                          </tr>
                          <tr className="border-b border-surface-variant">
                            <td className="w-1/2 p-1 border-r border-surface-variant text-text-disabled">Uptime</td>
                            <td className="w-1/2 p-1">{formatUptime(uptime)}</td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr className="border-b border-surface-variant">
                            <td className="w-1/2 p-1 border-r border-surface-variant text-text-disabled">Profile</td>
                            <td className="w-1/2 p-1 text-secondary">{activeProfileData?.displayName || 'Programmer'}</td>
                          </tr>
                          <tr className="border-b border-surface-variant">
                            <td className="w-1/2 p-1 border-r border-surface-variant text-text-disabled">Engine</td>
                            <td className="w-1/2 p-1">v1.2 (Beta)</td>
                          </tr>
                          <tr className="border-b border-surface-variant">
                            <td className="w-1/2 p-1 border-r border-surface-variant text-text-disabled">Msgs</td>
                            <td className="w-1/2 p-1">{messages.length}</td>
                          </tr>
                          <tr className="border-b border-surface-variant">
                            <td className="w-1/2 p-1 border-r border-surface-variant text-text-disabled">Connection</td>
                            <td className="w-1/2 p-1">{latencyMs < 50 ? 'LAN' : latencyMs < 200 ? 'Broadband' : 'DSL'}</td>
                          </tr>
                          <tr className="border-b border-surface-variant">
                            <td className="w-1/2 p-1 border-r border-surface-variant text-text-disabled">Latency</td>
                            <td className="w-1/2 p-1">{latencyMs}ms</td>
                          </tr>
                          <tr className="border-b border-surface-variant">
                            <td className="w-1/2 p-1 border-r border-surface-variant text-text-disabled">Status</td>
                            <td className="w-1/2 p-1 text-green-700 font-bold">{isProcessing ? 'BUSY' : 'Ready'}</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-2">
                  <div className="text-[9px] font-bold text-on-surface-variant uppercase mb-1">
                    {messages.length === 0 ? 'Knowledge Verification' : 'Source Verification'}
                  </div>
                  <div className="inset-border bg-white p-2 text-[10px] h-[120px] overflow-y-auto flex items-center justify-center text-center text-text-disabled">
                    {messages.length === 0 ? (
                      <span className="italic">Waiting for<br/>active session...</span>
                    ) : (
                      <div className="text-left w-full">
                        Programming Pack v2.1<br/>
                        - MSDN Library 2005<br/>
                        - W3C Standards v1.1<br/>
                        - JavaScript Anthology<br/>
                        - Enterprise Dev Tools
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Archive tab */}
        {activeTab === 'archive' && (
          <div className="flex-1 flex overflow-hidden">
            <ArchiveScreen />
          </div>
        )}

        {/* Knowledge Packs / Library tab */}
        {activeTab === 'library' && (
          <div className="flex-1 bg-dialog-face flex overflow-hidden">
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="utf-8">
                  <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
                  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
                  <style>
                    body { font-family: 'Tahoma', sans-serif; font-size: 11px; background-color: #ECE9D8; margin: 0; padding: 8px; user-select: none; -webkit-font-smoothing: none; }
                    .outset-border { border-top: 1px solid #FFFFFF; border-left: 1px solid #FFFFFF; border-right: 1px solid #716F64; border-bottom: 1px solid #716F64; }
                    .inset-border { border-top: 1px solid #808080; border-left: 1px solid #808080; border-right: 1px solid #FFFFFF; border-bottom: 1px solid #FFFFFF; }
                    .active-row { background-color: #316AC5; color: #FFFFFF; }
                    .material-symbols-outlined { font-size: 16px; vertical-align: middle; }
                    ::-webkit-scrollbar { width: 16px; } ::-webkit-scrollbar-track { background: #ECE9D8; } ::-webkit-scrollbar-thumb { background: #D4D0C8; border: 1px solid #FFFFFF; box-shadow: inset -1px -1px 0px #716F64; }
                  </style>
                </head>
                <body class="flex flex-col h-[calc(100vh-0px)]" style="padding:0">
                  <div class="h-[44px] border-b border-gray-400 flex items-center px-2 gap-0.5" style="background:linear-gradient(to bottom,#F0F0F0,#D4D0C8)">
                    <button class="flex flex-col items-center justify-center h-[36px] px-2 hover:bg-white/40 border border-transparent"><span class="material-symbols-outlined text-blue-700" style="font-variation-settings:'FILL' 1">download</span><span style="font-size:9px">Install</span></button>
                    <button class="flex flex-col items-center justify-center h-[36px] px-2 hover:bg-white/40 border border-transparent"><span class="material-symbols-outlined text-red-600">delete_forever</span><span style="font-size:9px">Remove</span></button>
                    <div class="w-px h-6 bg-gray-400 mx-1"></div>
                    <button class="flex flex-col items-center justify-center h-[36px] px-2 hover:bg-white/40 border border-transparent"><span class="material-symbols-outlined text-green-700">update</span><span style="font-size:9px">Update</span></button>
                    <button class="flex flex-col items-center justify-center h-[36px] px-2 hover:bg-white/40 border border-transparent"><span class="material-symbols-outlined text-gray-700">assignment</span><span style="font-size:9px">Properties</span></button>
                  </div>
                  <div class="flex-grow flex gap-2 overflow-hidden p-2">
                    <aside class="w-[160px] bg-white inset-border flex flex-col overflow-y-auto p-1 text-left shrink-0">
                      <div class="flex items-center gap-1 py-0.5"><span class="material-symbols-outlined" style="font-size:12px">expand_more</span><span class="material-symbols-outlined text-yellow-600" style="font-size:14px">folder</span><span>Knowledge Library</span></div>
                      <div class="pl-3">
                        <div class="flex items-center gap-1 py-0.5 active-row px-1"><span class="material-symbols-outlined" style="font-size:12px">expand_more</span><span class="material-symbols-outlined" style="font-size:14px">folder_open</span><span>Installed Packs</span></div>
                        <div class="pl-3 text-gray-700"><div class="py-0.5 hover:bg-blue-50">Programming</div><div class="py-0.5 hover:bg-blue-50">Science</div><div class="py-0.5 hover:bg-blue-50">Business</div><div class="py-0.5 hover:bg-blue-50">Reference</div></div>
                      </div>
                    </aside>
                    <section class="flex-grow bg-white inset-border flex flex-col overflow-hidden">
                      <div class="flex border-b border-gray-300 bg-gray-100 h-[20px] shrink-0 text-left font-bold text-gray-700">
                        <div class="w-1/3 border-r border-gray-300 px-2">Name</div><div class="w-1/6 border-r border-gray-300 px-2">Version</div><div class="w-1/6 border-r border-gray-300 px-2">Size</div><div class="w-1/6 border-r border-gray-300 px-2">Status</div><div class="w-1/6 px-2">License</div>
                      </div>
                      <div class="flex-grow overflow-y-auto text-left">
                        <div class="flex h-[20px] active-row items-center"><div class="w-1/3 px-2 flex items-center gap-1"><span class="material-symbols-outlined" style="font-size:14px">description</span>Programming Pack v2.1</div><div class="w-1/6 px-2">2.1.04</div><div class="w-1/6 px-2">1.2 GB</div><div class="w-1/6 px-2 text-green-200">Installed</div><div class="w-1/6 px-2">Professional</div></div>
                        <div class="flex h-[20px] hover:bg-blue-50 items-center"><div class="w-1/3 px-2 flex items-center gap-1"><span class="material-symbols-outlined" style="font-size:14px">description</span>Astronomy Professional</div><div class="w-1/6 px-2">1.0.00</div><div class="w-1/6 px-2">4.5 GB</div><div class="w-1/6 px-2 text-blue-600">Update Avail.</div><div class="w-1/6 px-2">Enterprise</div></div>
                        <div class="flex h-[20px] hover:bg-blue-50 items-center"><div class="w-1/3 px-2 flex items-center gap-1"><span class="material-symbols-outlined" style="font-size:14px">description</span>Human Anatomy Core</div><div class="w-1/6 px-2">3.2.11</div><div class="w-1/6 px-2">850 MB</div><div class="w-1/6 px-2 text-green-600">Installed</div><div class="w-1/6 px-2">Professional</div></div>
                        <div class="flex h-[20px] hover:bg-blue-50 text-red-600 items-center"><div class="w-1/3 px-2 flex items-center gap-1"><span class="material-symbols-outlined" style="font-size:14px">warning</span>Quantum Mechanics (Trial)</div><div class="w-1/6 px-2">0.9.beta</div><div class="w-1/6 px-2">2.1 GB</div><div class="w-1/6 px-2 font-bold">EXPIRED</div><div class="w-1/6 px-2 italic">Trial</div></div>
                      </div>
                    </section>
                    <aside class="w-[180px] bg-white inset-border p-2 text-left flex flex-col gap-2 shrink-0">
                      <div class="font-bold border-b border-gray-300 pb-1" style="color:#0451ab">Knowledge Inspector</div>
                      <div><div class="font-bold" style="color:#0050d8">Programming Pack</div><div>Provider: OpenAI Corp.</div><div>Release: Nov 2006</div></div>
                      <div class="border-t border-gray-200 pt-1"><div class="font-bold">Dependencies:</div><div style="font-size:10px;color:#555"><div>✔ Logic Core v2.0</div><div>✔ Mathematics Pack</div></div></div>
                      <div class="mt-auto border-t border-gray-200 pt-1"><div class="font-bold">Disk Footprint</div><div class="w-full h-3 bg-gray-200 border border-gray-400 mt-1 relative overflow-hidden"><div class="absolute inset-y-0 left-0 bg-blue-600" style="width:45%"></div></div><div style="font-size:9px;text-align:center;margin-top:2px;color:#666">45% Capacity Used</div></div>
                    </aside>
                  </div>
                </body>
                </html>
              `}
              className="w-full h-full border-none"
              title="Knowledge Packs Manager"
            />
          </div>
        )}

        {/* Control Center tab */}
        {activeTab === 'control' && (
          <div className="flex-1 bg-dialog-face flex overflow-hidden">
            <iframe
              srcDoc={`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="utf-8">
                  <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
                  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
                  <style>
                    body { font-family: 'Tahoma', sans-serif; font-size: 11px; background-color: #ECE9D8; margin: 0; padding: 8px; user-select: none; }
                    .outset-border { border-top: 1px solid #FFFFFF; border-left: 1px solid #FFFFFF; border-right: 1px solid #716F64; border-bottom: 1px solid #716F64; }
                    .inset-border { border-top: 1px solid #808080; border-left: 1px solid #808080; border-right: 1px solid #FFFFFF; border-bottom: 1px solid #FFFFFF; }
                    .material-symbols-outlined { font-size: 16px; vertical-align: middle; }
                  </style>
                </head>
                <body class="flex gap-2 h-[calc(100vh-0px)]" style="padding:0;padding:8px">
                  <aside class="w-[150px] bg-white inset-border p-1 text-left shrink-0">
                    <div class="flex items-center gap-1 font-bold"><span class="material-symbols-outlined" style="font-size:14px">dns</span><span>Local System</span></div>
                    <div class="pl-3 mt-1 space-y-1">
                      <div class="hover:bg-blue-50 py-0.5 cursor-default">Language Engine</div>
                      <div class="hover:bg-blue-50 py-0.5 cursor-default">Knowledge Packs</div>
                      <div class="py-0.5 cursor-default px-1 font-semibold" style="background:#316AC5;color:#fff">Security Config</div>
                      <div class="hover:bg-blue-50 py-0.5 cursor-default">Network Stats</div>
                    </div>
                  </aside>
                  <main class="flex-grow flex flex-col gap-2 overflow-y-auto">
                    <div class="grid grid-cols-2 gap-2">
                      <div class="outset-border bg-gray-100 p-2 text-left"><div class="font-bold border-b border-gray-300 pb-1 mb-1" style="color:#0050d8">Language Engine Status</div><div>Core Version: v1.0.248</div><div>Mode: Neural Optimized</div><div>Active Tokens: 12.4k / sec</div></div>
                      <div class="outset-border bg-gray-100 p-2 text-left"><div class="font-bold border-b border-gray-300 pb-1 mb-1" style="color:#0050d8">Memory Allocation</div><div>Max Memory: 384 MB</div><div>Cache Size: 42 MB</div><div>Uptime: 42d 04h 12m</div></div>
                    </div>
                    <div class="outset-border bg-gray-100 p-2 text-left"><div class="font-bold border-b border-gray-300 pb-1 mb-1" style="color:#0050d8">Maintenance & Repair</div><p class="mb-2">Optimize the workstation knowledge parameters:</p><div class="flex gap-2"><button class="outset-border bg-gray-200 px-3 py-1 font-bold">Optimize Cache</button><button class="outset-border bg-gray-200 px-3 py-1 font-bold">Rebuild Search Index</button></div></div>
                  </main>
                </body>
                </html>
              `}
              className="w-full h-full border-none"
              title="Control Center"
            />
          </div>
        )}

        {/* Help / Diagnostics tab */}
        {activeTab === 'help' && (
          <div className="flex-1 bg-dialog-face flex flex-col p-4 text-left overflow-hidden">
            <h2 className="font-display-welcome text-[18px] text-primary mb-2">Diagnostics and Support</h2>
            <div className="inset-border bg-black p-3 flex-grow overflow-y-auto mb-4 font-mono text-[11px] leading-relaxed text-white">
              <div className="text-green-400">[08:42:01] System boot complete. Host: AI-WORKSTATION-XP</div>
              <div className="text-green-400">[08:42:02] Loading primary SQLite data catalog from APP_DATA_BASE_PATH...</div>
              <div className="text-green-400">[08:42:02] Establishing secure tunnel through Corporate Broadband...</div>
              <div className="text-green-400">[08:42:03] Latency handshake: {latencyMs}ms - Status: {latencyMs < 200 ? 'EXCELLENT' : 'ACCEPTABLE'}</div>
              <div className="text-green-400">[08:42:03] Encryption layer validated: AES-256-GCM. Session key signed.</div>
              <div className="text-green-300 font-bold">[08:42:04] ALL HARDWARE AND SOFTWARE MODULES RUNNING CORRECTLY</div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => showDialog('Info', { message: 'Verification logs exported to system log directory.' })}
                className="outset-border bg-dialog-face px-4 py-1 font-label-button text-label-button hover:brightness-105 active:translate-x-[1px] active:translate-y-[1px]">
                Export Diagnostics Log
              </button>
            </div>
          </div>
        )}

      </main>

      {/* === Footer Status Bar === */}
      <footer className="flex justify-between items-center px-4 h-[28px] bg-dialog-face shrink-0 border-t-2 border-border-shadow"
              style={{ boxShadow: 'inset 1px 1px 0px #FFFFFF' }}>
        <div className="flex items-center gap-4 text-on-surface text-[10px]">
          <div className="flex items-center gap-1 border-r border-border-shadow pr-4">
            <span className="material-symbols-outlined text-[14px] text-green-600">lan</span>
            <span>Connected to AI-17</span>
          </div>
          <div className="flex items-center gap-1 border-r border-border-shadow pr-4">
            <span className="material-symbols-outlined text-[14px]">speed</span>
            <span>Latency: {latencyMs}ms</span>
          </div>
          <div className="flex items-center gap-1 border-r border-border-shadow pr-4">
            <span className="material-symbols-outlined text-[14px]">memory</span>
            <span>Memory: 382MB</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">person</span>
            <span className="font-bold text-secondary">Profile: {activeProfileData?.displayName || 'Programmer'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 font-bold italic text-[10px] ${isProcessing ? 'text-yellow-700' : 'text-green-700'}`}>
            <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
            Status: {isProcessing ? 'Processing' : messages.length === 0 ? 'Standby' : 'Ready'}
          </div>
          <div className="flex items-center inset-border h-[18px] px-2 bg-window-inner text-[10px] w-28">
            <div className="w-full h-2 flex gap-[2px]">
              {[...Array(isProcessing ? 4 : messages.length > 0 ? 4 : 0)].map((_, i) => (
                <div key={i} className="h-full w-2 bg-[#00D200]"></div>
              ))}
              {[...Array(4 - (isProcessing ? 4 : messages.length > 0 ? 4 : 0))].map((_, i) => (
                <div key={i} className="h-full w-2 bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
