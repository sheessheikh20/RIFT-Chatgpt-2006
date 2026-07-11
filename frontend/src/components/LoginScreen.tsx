import React, { useState } from 'react';
import type { AuthResponse } from '../types';
import * as api from '../api';
import { useDialogStore } from '../store/dialogStore';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onContinueAsGuest: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onContinueAsGuest }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [registeredTo, setRegisteredTo] = useState('');
  const [licenseType, setLicenseType] = useState('Professional');
  const [isLoading, setIsLoading] = useState(false);
  const { showDialog } = useDialogStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showDialog('Warning', { message: 'Please enter both username and password.' });
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.login({ username: username.trim(), password: password.trim() });
      api.setToken(data.token);
      onLoginSuccess();
    } catch (err: any) {
      showDialog('Error', { 
        message: err.message?.includes('401') || err.status === 401
          ? 'Invalid username or password. Please try again.'
          : (err.message || 'Login failed. Check that the server is running.')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !registeredTo.trim()) {
      showDialog('Warning', { message: 'All fields are required.' });
      return;
    }
    if (password.trim().length < 4) {
      showDialog('Warning', { message: 'Password must be at least 4 characters.' });
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.register({
        username: username.trim(),
        password: password.trim(),
        registeredTo: registeredTo.trim(),
        licenseType: licenseType,
      });
      api.setToken(data.token);
      showDialog('Information', { 
        message: `Registration complete! License Serial: ${data.serialNumber}. Please save this key for future activations.`,
        onConfirm: () => onLoginSuccess()
      });
    } catch (err: any) {
      // 409 means username already exists
      if (err.status === 409 || err.message?.includes('already exists') || err.message?.includes('Conflict')) {
        showDialog('Error', { message: `The username "${username.trim()}" is already taken. Please choose a different one.` });
      } else {
        showDialog('Error', { 
          message: `Registration failed: ${err.message || 'Unknown error. Ensure the server is running on port 8080.'}`
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setTimeout(async () => {
      try {
        // Try to log in as a fixed google guest account, register if it doesn't exist
        const gUser = 'google_account_user';
        let data: AuthResponse;
        try {
          data = await api.login({ username: gUser, password: 'google_oauth_2006' });
        } catch {
          data = await api.register({
            username: gUser,
            password: 'google_oauth_2006',
            registeredTo: 'Google Account User',
            licenseType: 'Professional',
          });
        }
        api.setToken(data.token);
        showDialog('Information', { message: 'Successfully authenticated via Google Accounts.', onConfirm: () => onLoginSuccess() });
      } catch (err: any) {
        showDialog('Error', { message: 'Google authentication service unavailable. Please use username/password.' });
      } finally {
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col select-none bg-dialog-face h-full w-full overflow-hidden">
      {/* Top Banner */}
      <header className="h-[58px] w-full flex justify-between items-center px-margin-edge bg-gradient-to-b from-white to-header-blue-bottom border-b border-border-shadow flex-shrink-0">
        <div className="flex flex-col text-text-main text-left">
          <h1 className="font-header-title text-header-title">
            {isRegisterMode ? 'Create Workstation Account' : 'Workstation Authentication'}
          </h1>
          <p className="font-body-standard mt-0.5 text-caption-small">
            {isRegisterMode 
              ? 'Register a new administrator profile on this machine.' 
              : 'Enter your credentials to access the Enterprise AI Workstation.'}
          </p>
        </div>
        <div className="w-[32px] h-[32px] flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[32px] text-primary">lock</span>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="flex-grow p-4 flex flex-col gap-3 overflow-hidden">
        <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="flex flex-col gap-3">
          <div className="flex flex-col text-left">
            <label className="font-body-standard mb-1 text-text-main font-bold text-[11px]">Username:</label>
            <input
              type="text"
              value={username}
              disabled={isLoading}
              onChange={(e) => setUsername(e.target.value)}
              className="h-[21px] bg-window-inner win32-inset px-2 font-body-standard outline-none border-none text-text-main text-[11px]"
            />
          </div>

          <div className="flex flex-col text-left">
            <label className="font-body-standard mb-1 text-text-main font-bold text-[11px]">Password:</label>
            <input
              type="password"
              value={password}
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[21px] bg-window-inner win32-inset px-2 font-body-standard outline-none border-none text-text-main text-[11px]"
            />
          </div>

          {isRegisterMode && (
            <>
              <div className="flex flex-col text-left">
                <label className="font-body-standard mb-1 text-text-main font-bold text-[11px]">Registered Owner Name:</label>
                <input
                  type="text"
                  value={registeredTo}
                  disabled={isLoading}
                  onChange={(e) => setRegisteredTo(e.target.value)}
                  className="h-[21px] bg-window-inner win32-inset px-2 font-body-standard outline-none border-none text-text-main text-[11px]"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="flex flex-col text-left">
                <label className="font-body-standard mb-1 text-text-main font-bold text-[11px]">License Type:</label>
                <select
                  value={licenseType}
                  disabled={isLoading}
                  onChange={(e) => setLicenseType(e.target.value)}
                  className="h-[21px] bg-window-inner win32-inset px-1 font-body-standard outline-none border-none text-text-main text-[11px]"
                >
                  <option value="Professional">Professional Edition</option>
                  <option value="Enterprise">Enterprise Workstation</option>
                </select>
              </div>
            </>
          )}

          {/* Primary Actions */}
          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setUsername('');
                setPassword('');
                setRegisteredTo('');
              }}
              className="win32-button"
            >
              {isRegisterMode ? '< Back to Login' : 'Register...'}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="win32-button font-bold"
            >
              {isLoading ? 'Please wait...' : isRegisterMode ? 'Create Account' : 'Log In'}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="etched-line mt-1"></div>

        {/* SSO and Guest Options */}
        <div className="flex flex-col gap-2">
          <div className="text-text-disabled text-[10px] text-left">Other sign-in options:</div>
          
          {/* Google SSO */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="win32-button flex items-center justify-center gap-1 w-full"
          >
            <span className="font-bold text-blue-700">G</span>
            <span className="text-red-600">o</span>
            <span className="text-yellow-600">o</span>
            <span className="text-blue-600">g</span>
            <span className="text-green-600">l</span>
            <span className="text-red-600">e</span>
            <span className="ml-1 text-[11px]">Continue with Google Account</span>
          </button>

          {/* Continue as Guest */}
          <button
            type="button"
            disabled={isLoading}
            onClick={onContinueAsGuest}
            className="win32-button flex items-center justify-center gap-2 w-full text-text-disabled"
          >
            <span className="material-symbols-outlined text-[14px]">person_off</span>
            <span className="text-[11px]">Continue as Guest (5 message limit)</span>
          </button>
        </div>
      </main>
    </div>
  );
};
