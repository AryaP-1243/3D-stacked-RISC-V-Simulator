
import React, { useState, useEffect } from 'react';
import { CpuChipIcon } from './icons';

interface LoginProps {
  onLoginSuccess: (username: string, rememberMe: boolean) => void;
}

type Mode = 'login' | 'register' | 'otp';
type OtpStep = 'enterEmail' | 'enterCode';

// A detailed, user-friendly error message component for network failures.
const NetworkErrorMessage = () => (
    <div>
        <p className="font-bold mb-2">Network Connection Failed</p>
        <p>Could not connect to the backend server at <code>http://localhost:3001</code>.</p>
        <p className="mt-2">To use this feature, please open a terminal, navigate to the project folder, and run:</p>
        <pre className="mt-2 text-left bg-red-100 dark:bg-slate-700 p-2 rounded-md text-xs text-red-800 dark:text-red-200">
            <code>
                npm install<br/>
                npm start
            </code>
        </pre>
    </div>
);

// A specific error component for failed OTP verification.
const InvalidOtpErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div>
        <p className="font-bold mb-2">Verification Failed</p>
        <p>{message}</p>
        <p className="mt-2 text-xs">Please double-check the code. If it has expired, you can request a new one.</p>
    </div>
);


const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // OTP State
  const [otpStep, setOtpStep] = useState<OtpStep>('enterEmail');
  const [otpEmail, setOtpEmail] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null); // Proactive server check

  useEffect(() => {
    // Proactively check for the OTP server when the user switches to the OTP tab.
    if (mode === 'otp') {
      setIsServerOnline(null); // Reset on tab switch to re-check
      setError(null);
      setLoading(true);

      const checkServerStatus = async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second timeout

          const response = await fetch('http://localhost:3001/', { signal: controller.signal });
          clearTimeout(timeoutId);

          if (response.ok) {
            setIsServerOnline(true);
          } else {
            setIsServerOnline(false);
          }
        } catch (err) {
          setIsServerOnline(false);
        } finally {
          setLoading(false);
        }
      };

      checkServerStatus();
    }
  }, [mode]);

  const getUsers = () => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : {};
  };

  const saveUsers = (users: any) => {
    localStorage.setItem('users', JSON.stringify(users));
  };
  
  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setOtpEmail('');
    setUserOtp('');
    setOtpMessage('');
    setOtpStep('enterEmail');
    setLoading(false);
    setRememberMe(false);
  };

  const handleBackToEmail = () => {
    setError(null);
    setOtpMessage('');
    setUserOtp('');
    setOtpStep('enterEmail');
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOtpMessage('');
    if (!otpEmail) {
        setError('Please enter a valid email address.');
        return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
      });
      setIsServerOnline(true); // If fetch succeeds, server is online
      const data = await response.json();
      if (response.ok) {
        setOtpMessage(data.message);
        setOtpStep('enterCode');
      } else {
        setError(data.message || 'Failed to send code.');
      }
    } catch (err) {
      // A catch here means a network error, so the server is offline.
      setIsServerOnline(false);
      console.error('OTP Send Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp: userOtp }),
      });
      setIsServerOnline(true); // If fetch succeeds, server is online
      const data = await response.json();

      if (response.ok) {
        const users = getUsers();
        // If user doesn't exist, create an account for them
        if (!users[otpEmail]) {
            const newUsers = { ...users, [otpEmail]: `otp-user-pass-${Date.now()}` };
            saveUsers(newUsers);
        }
        // OTP login is not "remembered" for security
        onLoginSuccess(otpEmail, false);
      } else {
        setError(<InvalidOtpErrorMessage message={data.message || 'OTP verification failed.'} />);
      }
    } catch (err) {
      // A catch here means a network error, so the server is offline.
      setIsServerOnline(false);
      console.error('OTP Verify Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username || !password) {
      setError('Username and password are required.');
      setLoading(false);
      return;
    }

    const users = getUsers();

    if (mode === 'register') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      if (users[username]) {
        setError('Username already exists. Please choose another.');
      } else {
        const newUsers = { ...users, [username]: password };
        saveUsers(newUsers);
        onLoginSuccess(username, rememberMe);
      }
    } else { // mode === 'login'
      if (users[username] && users[username] === password) {
        onLoginSuccess(username, rememberMe);
      } else {
        setError('Invalid username or password.');
      }
    }
    setLoading(false);
  };
  
  const renderError = () => {
    if (!error) return null;
    return (
        <div className="text-sm text-red-700 dark:text-red-300 text-center bg-red-50 dark:bg-red-900/50 p-4 rounded-lg border border-red-200 dark:border-red-700">
            {error}
        </div>
    );
  };

  const renderFormContent = () => {
    const buttonClasses = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-cyan-500 disabled:bg-slate-400 dark:disabled:bg-slate-600";
    
    if (mode === 'otp') {
        if (loading && isServerOnline === null) {
            return <div className="text-center p-4 text-slate-500 dark:text-slate-400">Pinging OTP server...</div>;
        }

        if (isServerOnline === false) {
            return (
                <div className="text-sm text-red-700 dark:text-red-300 text-center bg-red-50 dark:bg-red-900/50 p-4 rounded-lg border border-red-200 dark:border-red-700">
                    <NetworkErrorMessage />
                </div>
            );
        }

        if (isServerOnline === true) {
            if (otpStep === 'enterEmail') {
                return (
                     <form className="space-y-6" onSubmit={handleSendCode}>
                        <div>
                            <label htmlFor="email-otp" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Email Address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email-otp" name="email" type="email" autoComplete="email" required
                                    value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)}
                                    className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>
                         {renderError()}
                        <div>
                            <button type="submit" className={buttonClasses} disabled={loading}>
                                {loading ? 'Sending...' : 'Send Code'}
                            </button>
                        </div>
                    </form>
                );
            } else { // otpStep === 'enterCode'
                return (
                    <form className="space-y-4" onSubmit={handleOtpLogin}>
                        <div>
                            <label htmlFor="otp-code" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                One-Time Code
                            </label>
                            <div className="mt-1">
                                <input
                                    id="otp-code" name="otp-code" type="text" maxLength={6} required
                                    value={userOtp} onChange={(e) => setUserOtp(e.target.value)}
                                    className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-slate-900 dark:text-white"
                                />
                            </div>
                             <p className="mt-2 text-xs text-center text-slate-600 dark:text-slate-300">
                                For this demo, check the running server's console for the OTP code.
                            </p>
                        </div>
                         {otpMessage && <p className="text-sm text-cyan-600 dark:text-cyan-400 text-center bg-cyan-50 dark:bg-cyan-900/50 p-2 rounded-md">{otpMessage}</p>}
                         {renderError()}
                        <div>
                            <button type="submit" className={buttonClasses} disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify & Log In'}
                            </button>
                        </div>
                         <div className="text-center text-sm">
                            <button 
                                type="button" 
                                onClick={handleBackToEmail} 
                                className="font-medium text-cyan-600 dark:text-cyan-400 hover:underline"
                            >
                                Request a new code
                            </button>
                        </div>
                    </form>
                );
            }
        }
        return null; // Should not be reached while checking or if check failed
    }

    // Default to password/register form
    return (
        <form className="space-y-6" onSubmit={handlePasswordSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Username
            </label>
            <div className="mt-1">
              <input
                id="username" name="username" type="text" autoComplete="username" required
                value={username} onChange={(e) => setUsername(e.target.value)}
                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password" name="password" type="password" autoComplete={mode === 'register' ? "new-password" : "current-password"} required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>
          {mode === 'register' && (
             <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirm Password
                </label>
                <div className="mt-1">
                <input
                    id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-slate-900 dark:text-white"
                />
                </div>
            </div>
          )}
          
          {(mode === 'login' || mode === 'register') && (
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                        Remember me
                    </label>
                </div>
            </div>
          )}

          {renderError()}
          <div>
            <button
              type="submit"
              className={buttonClasses} disabled={loading}
            >
              {loading ? 'Processing...' : (mode === 'register' ? 'Register' : 'Log in')}
            </button>
          </div>
        </form>
    );
  };

  const getTabClass = (tabMode: Mode) => {
    return `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        mode === tabMode 
        ? 'bg-cyan-600 text-white' 
        : 'text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
    }`;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-cyan-500/10 p-3 rounded-lg inline-block">
              <CpuChipIcon className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            3D Stacked RISC-V Simulator
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {mode === 'register' && 'Create a new account'}
            {mode === 'login' && 'Please log in to continue'}
            {mode === 'otp' && 'Log in with a one-time code'}
          </p>
        </div>
        
        <div className="flex justify-center p-1 space-x-1 bg-slate-200 dark:bg-slate-900/50 rounded-lg">
            <button onClick={() => { setMode('login'); resetForm(); }} className={getTabClass('login')}>Password</button>
            <button onClick={() => { setMode('register'); resetForm(); }} className={getTabClass('register')}>Register</button>
            <button onClick={() => { setMode('otp'); resetForm(); }} className={getTabClass('otp')}>One-Time Code</button>
        </div>

        {renderFormContent()}

      </div>
    </div>
  );
};

export default Login;