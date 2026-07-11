import React, { useState, useEffect } from 'react';
import { WindowFrame } from './components/WindowFrame';
import { InstallWizard } from './components/InstallWizard';
import { SplashScreen } from './components/SplashScreen';
import { ActivationScreen } from './components/ActivationScreen';
import { ConnectionManagerScreen } from './components/ConnectionManagerScreen';
import { ConnectingServerScreen } from './components/ConnectingServerScreen';
import { QueueScreen } from './components/QueueScreen';
import { WorkspaceScreen } from './components/WorkspaceScreen';
import { LoginScreen } from './components/LoginScreen';
import { DialogManager } from './components/DialogManager';
import { getToken, getCurrentUser, setToken } from './api';

interface WindowSize {
  width: number;
  height: number;
  title: string;
  showChrome: boolean;
}

const WINDOWS_CONFIG: Record<string, WindowSize> = {
  installer: {
    width: 497,
    height: 387,
    title: 'Setup - ChatGPT Professional Enterprise Suite',
    showChrome: true,
  },
  splash: {
    width: 600,
    height: 420,
    title: 'ChatGPT Professional',
    showChrome: false,
  },
  activation: {
    width: 497,
    height: 390,
    title: 'ChatGPT Product Activation',
    showChrome: true,
  },
  connection: {
    width: 497,
    height: 360,
    title: 'Connection Manager',
    showChrome: true,
  },
  connecting: {
    width: 497,
    height: 360,
    title: 'Connecting to OpenAI Server Cluster',
    showChrome: true,
  },
  queue: {
    width: 497,
    height: 360,
    title: 'Server Queue',
    showChrome: true,
  },
  login: {
    width: 497,
    height: 390,
    title: 'ChatGPT Workstation Login',
    showChrome: true,
  },
  workspace: {
    width: 1024,
    height: 768,
    title: 'ChatGPT Professional Enterprise Suite',
    showChrome: true,
  },
};

export default function App() {
  const [latencyMs, setLatencyMs] = useState(150);
  const [isGuestMode, setIsGuestMode] = useState(false);

  const [activeWindowId, setActiveWindowId] = useState<string>(() => {
    const installed = localStorage.getItem('isInstalled') === 'true';
    return installed ? 'splash' : 'installer';
  });

  // If we have a valid token already, skip queue/login and go straight to workspace
  useEffect(() => {
    if (activeWindowId === 'login') {
      const token = getToken();
      if (token) {
        getCurrentUser().then(() => {
          setActiveWindowId('workspace');
        }).catch(() => {
          // Token expired or invalid — stay on login
        });
      }
    }
  }, [activeWindowId]);

  // Call the Electron resize API on mount and whenever the active window transitions
  useEffect(() => {
    if (!activeWindowId) return;
    const config = WINDOWS_CONFIG[activeWindowId];
    if (config && window.electronAPI?.resizeWindow) {
      window.electronAPI.resizeWindow(config.width, config.height).catch(console.error);
    }
  }, [activeWindowId]);

  // Flow handlers
  const handleInstallWizardFinish = () => {
    localStorage.setItem('isInstalled', 'true');
    setActiveWindowId('splash');
  };

  const handleSplashFinished = () => {
    const token = getToken();
    if (token) {
      getCurrentUser().then(() => {
        setActiveWindowId('workspace');
      }).catch(() => {
        setActiveWindowId('activation');
      });
    } else {
      setActiveWindowId('activation');
    }
  };

  const handleActivationFinished = () => {
    setActiveWindowId('connection');
  };

  const handleConnectionSelected = (latency: number) => {
    setLatencyMs(latency);
    setActiveWindowId('connecting');
  };

  const handleConnectingFinished = () => {
    setActiveWindowId('queue');
  };

  const handleQueueFinished = () => {
    setActiveWindowId('login');
  };

  const handleLoginSuccess = () => {
    setIsGuestMode(false);
    setActiveWindowId('workspace');
  };

  const handleContinueAsGuest = () => {
    setIsGuestMode(true);
    setActiveWindowId('workspace');
  };

  const handleLogout = () => {
    setToken(null);
    setIsGuestMode(false);
    setActiveWindowId('login');
  };

  const handleWorkspaceClose = () => {
    if (window.electronAPI?.closeWindow) {
      window.electronAPI.closeWindow();
    } else {
      window.close();
    }
  };

  const currentConfig = WINDOWS_CONFIG[activeWindowId];

  if (!currentConfig) {
    return <div className="w-full h-full bg-[#ECE9D8]" />;
  }

  return (
    <div className="w-screen h-screen overflow-hidden select-none bg-[#ECE9D8] flex flex-col m-0 p-0">
      <WindowFrame
        id={activeWindowId}
        title={currentConfig.title}
        width={currentConfig.width}
        height={currentConfig.height}
        x={0}
        y={0}
        zIndex={1}
        isMaximized={false}
        showChrome={currentConfig.showChrome}
        active={true}
        onClose={handleWorkspaceClose}
      >
        {activeWindowId === 'installer' && (
          <InstallWizard onFinish={handleInstallWizardFinish} />
        )}
        {activeWindowId === 'splash' && (
          <SplashScreen onComplete={handleSplashFinished} />
        )}
        {activeWindowId === 'activation' && (
          <ActivationScreen 
            onNext={handleActivationFinished} 
            onCancel={handleWorkspaceClose} 
          />
        )}
        {activeWindowId === 'connection' && (
          <ConnectionManagerScreen
            onNext={handleConnectionSelected}
            onBack={() => setActiveWindowId('activation')}
            onCancel={handleWorkspaceClose}
          />
        )}
        {activeWindowId === 'connecting' && (
          <ConnectingServerScreen
            onNext={handleConnectingFinished}
            onBack={() => setActiveWindowId('connection')}
            onCancel={handleWorkspaceClose}
            latencyMs={latencyMs}
          />
        )}
        {activeWindowId === 'queue' && (
          <QueueScreen
            onComplete={handleQueueFinished}
            onCancel={handleWorkspaceClose}
          />
        )}
        {activeWindowId === 'login' && (
          <LoginScreen 
            onLoginSuccess={handleLoginSuccess} 
            onContinueAsGuest={handleContinueAsGuest}
          />
        )}
        {activeWindowId === 'workspace' && (
          <WorkspaceScreen
            onLogout={handleLogout}
            onClose={handleWorkspaceClose}
            latencyMs={latencyMs}
            isGuest={isGuestMode}
          />
        )}
      </WindowFrame>
      <DialogManager />
    </div>
  );
}
