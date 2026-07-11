import React, { useState } from 'react';
import * as api from '../api';
import { useDialogStore } from '../store/dialogStore';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
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
      showDialog('Information', { message: `Login successful. Welcome back, ${data.registeredTo}!` });
      onLoginSuccess();
    } catch (err: any) {
      showDialog('Error', { message: err.message || 'Invalid username or password.' });
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

    setIsLoading(true);
    try {
      const data = await api.register({
        username: username.trim(),
        password: password.trim(),
        registeredTo: registeredTo.trim(),
        licenseType: licenseType,
      });
      api.setToken(data.token);
      showDialog('Information', { message: `Registration successful! Serial key generated:\n\n${data.serialNumber}` });
      onLoginSuccess();
    } catch (err: any) {
      showDialog('Error', { message: err.message || 'Failed to create account.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // Simulate Continue with Google handshake
    setTimeout(async () => {
      try {
        // Authenticate with a preconfigured default Google-auth user
        const gUser = 'google_user_' + Math.floor(Math.random() * 1000);
        const data = await api.register({
          username: gUser,
          password: 'google_password_2006',
          registeredTo: 'Google User',
          licenseType: 'Professional Enterprise',
        }).catch(async () => {
          // If already registered, log in
          return await api.login({ username: gUser, password: 'google_password_2006' });
        });

        api.setToken(data.token);
        showDialog('Information', { message: 'Successfully authenticated via Google accounts.' });
        onLoginSuccess();
      } catch (err: any) {
        showDialog('Error', { message: 'Google authentication service timeout.' });
      } finally {
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col flex-grow select-none bg-dialog-face h-full w-full">
      {/* Top Banner */}
      <header className="h-[58px] w-full flex justify-between items-center px-margin-edge bg-gradient-to-b from-white to-header-blue-bottom border-b border-border-shadow flex-shrink-0">
        <div className="flex flex-col text-text-main text-left">
          <h1 className="font-header-title text-header-title">
            {isRegisterMode ? 'Create Workstation Account' : 'Workstation Authentication'}
          </h1>
          <p className="font-body-standard mt-0.5">
            {isRegisterMode 
              ? 'Register a new administrator profile on this machine.' 
              : 'Enter your credentials to access the AI Workstation.'}
          </p>
        </div>
        <div className="w-[32px] h-[32px] flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px] text-primary">lock</span>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="flex-grow p-4 flex flex-col justify-between">
        <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="flex flex-col gap-3">
          <div className="flex flex-col text-left">
            <label className="font-body-standard mb-1 text-text-main font-bold">Username / Email:</label>
            <input
              type="text"
              value={username}
              disabled={isLoading}
              onChange={(e) => setUsername(e.target.value)}
              className="h-[21px] bg-window-inner win32-inset px-2 font-body-standard outline-none border-none text-text-main"
            />
          </div>

          <div className="flex flex-col text-left">
            <label className="font-body-standard mb-1 text-text-main font-bold">Password:</label>
            <input
              type="password"
              value={password}
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[21px] bg-window-inner win32-inset px-2 font-body-standard outline-none border-none text-text-main"
            />
          </div>

          {isRegisterMode && (
            <>
              <div className="flex flex-col text-left">
                <label className="font-body-standard mb-1 text-text-main font-bold">Registered Owner Name:</label>
                <input
                  type="text"
                  value={registeredTo}
                  disabled={isLoading}
                  onChange={(e) => setRegisteredTo(e.target.value)}
                  className="h-[21px] bg-window-inner win32-inset px-2 font-body-standard outline-none border-none text-text-main"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="flex flex-col text-left">
                <label className="font-body-standard mb-1 text-text-main font-bold">License Type:</label>
                <select
                  value={licenseType}
                  disabled={isLoading}
                  onChange={(e) => setLicenseType(e.target.value)}
                  className="h-[21px] bg-window-inner win32-inset px-1 font-body-standard outline-none border-none text-text-main"
                >
                  <option value="Professional">Professional Edition</option>
                  <option value="Enterprise">Enterprise Workstation</option>
                </select>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setUsername('');
                setPassword('');
              }}
              className="btn-outset px-3 text-body-standard"
            >
              {isRegisterMode ? 'Back to Login' : 'Register Account...'}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-outset w-button-w font-bold text-body-standard"
            >
              {isLoading ? 'Wait...' : isRegisterMode ? 'Register' : 'Log In'}
            </button>
          </div>
        </form>

        {/* OAuth Continue with Google Option */}
        <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-border-shadow">
          <div className="text-text-disabled text-[10px] text-center">Or connect using single sign-on:</div>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="btn-outset flex items-center justify-center gap-2 py-1 hover:brightness-105 active:shadow-inner cursor-default"
          >
            <span className="font-bold font-sans text-blue-700">G</span>
            <span className="font-sans text-red-600">o</span>
            <span className="font-sans text-yellow-600">o</span>
            <span className="font-sans text-blue-600">g</span>
            <span className="font-sans text-green-600">l</span>
            <span className="font-sans text-red-600">e</span>
            <span className="text-body-standard font-sans text-[11px] ml-1">Continue with Google Account</span>
          </button>
        </div>
      </main>
    </div>
  );
};
