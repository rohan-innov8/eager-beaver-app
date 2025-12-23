import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, AlertCircle, CheckCircle, Mail, Lock, ArrowRight, Info, Users } from 'lucide-react';
import { AUTHORIZED_USERS } from '../constants';

const Login: React.FC = () => {
  const { login, loginAsGuest, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError('Incorrect email or password. Note: Users must be created in the Firebase Console first.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'Failed to log in. Please check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await resetPassword(email);
      setMessage('Password reset email sent! Check your inbox.');
      setIsForgotPassword(false);
    } catch (err: any) {
      console.error(err);
      setError('Failed to send reset email. Verify the address is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
        <div className="bg-orange-600 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="text-6xl mb-4">🦫</div>
            <h1 className="text-3xl font-bold text-white">Eager Beaver</h1>
            <p className="text-orange-100 mt-2">Job Card & Production System</p>
          </div>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> 
              <span>{error}</span>
            </div>
          )}
          
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle size={16} /> {message}
            </div>
          )}

          {!isForgotPassword ? (
            <div className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-slate-900"
                      placeholder="name@eagerbeaver.co.za"
                    />
                    <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-slate-900"
                      placeholder="••••••••"
                    />
                    <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  </div>
                  <div className="flex justify-end mt-1">
                    <button 
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-orange-600 hover:text-orange-800 font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : (
                    <>
                      <LogIn size={18} /> Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase font-bold tracking-widest">or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                onClick={handleGuestLogin}
                className="w-full py-3 px-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-sm font-bold hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
              >
                Sign in as Guest (Instant Preview)
              </button>

              <div className="pt-2">
                <button 
                  onClick={() => setShowHints(!showHints)}
                  className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
                >
                  <Users size={14} /> {showHints ? 'Hide authorized users' : 'Show authorized users'}
                </button>
                
                {showHints && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 animate-in fade-in duration-300">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">Authorized Personnel</p>
                    <div className="grid grid-cols-1 gap-1">
                      {AUTHORIZED_USERS.slice(0, 5).map(u => (
                        <div key={u.email} className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-700 font-medium">{u.name}</span>
                          <span className="text-slate-400 italic">{u.email}</span>
                        </div>
                      ))}
                      <p className="text-[10px] text-slate-400 mt-2 text-center">...plus others in constants.ts</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
               <div className="text-center mb-6">
                 <h3 className="text-lg font-bold text-slate-800">Reset Password</h3>
                 <p className="text-sm text-slate-500">Enter your email and we'll send you a link to reset your password.</p>
               </div>

               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-slate-900"
                    placeholder="name@eagerbeaver.co.za"
                  />
                  <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : (
                  <>
                    Send Reset Link <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="w-full py-2 text-sm text-slate-500 hover:text-slate-800"
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center">
             <p className="text-xs text-slate-400">
               Authorized personnel only. Contact Admin for access.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;