import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { signInWithEmailPassword, signUpWithEmailPassword, quickDemoSignIn } from '../../services/authService';
import { X, Lock, Mail, User, ShieldCheck, Zap, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  initialMode?: 'signin' | 'signup' | 'demo';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'signin',
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'demo'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('Quantitative Trader');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await signInWithEmailPassword(email, password);
    setIsLoading(false);

    if (res.success && res.user) {
      setSuccessMessage(`Welcome back, ${res.user.name}!`);
      setTimeout(() => {
        onAuthSuccess(res.user!);
        onClose();
      }, 700);
    } else {
      setErrorMessage(res.error || 'Authentication failed. Please check credentials.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await signUpWithEmailPassword(name, email, password, role);
    setIsLoading(false);

    if (res.success && res.user) {
      setSuccessMessage(`Account created successfully! Welcome, ${res.user.name}.`);
      setTimeout(() => {
        onAuthSuccess(res.user!);
        onClose();
      }, 700);
    } else {
      setErrorMessage(res.error || 'Registration failed.');
    }
  };

  const handleDemoLogin = async (profileId: 'alex' | 'elena') => {
    setIsLoading(true);
    const user = await quickDemoSignIn(profileId);
    setIsLoading(false);
    setSuccessMessage(`Switched to demo profile: ${user.name}`);
    setTimeout(() => {
      onAuthSuccess(user);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                Secure Identity Engine
              </span>
              <h3 className="text-base font-bold text-white">Apex Cloud Authentication</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="p-4 pb-0">
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                setTab('signin');
                setErrorMessage('');
              }}
              className={`py-2 rounded-xl font-bold transition-all ${
                tab === 'signin' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setTab('signup');
                setErrorMessage('');
              }}
              className={`py-2 rounded-xl font-bold transition-all ${
                tab === 'signup' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setTab('demo');
                setErrorMessage('');
              }}
              className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
                tab === 'demo' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 pt-4">
          {/* Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying Session...' : 'Log In to Cloud Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">
                  Quick test?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('demo')}
                    className="text-indigo-400 font-semibold hover:underline"
                  >
                    Use 1-Click Demo Profile
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* TAB 2: SIGN UP */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Satoshi Nakamoto"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Trader Role Profile</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Quantitative Trader">Quantitative Trader (AI &amp; Momentum)</option>
                  <option value="Hedge Fund Analyst">Hedge Fund Analyst (Macro &amp; Bonds)</option>
                  <option value="Portfolio Manager">Portfolio Manager (Multi-Asset)</option>
                  <option value="Retail Investor">Retail Investor (Long-term Wealth)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Choose Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Min 6 characters..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Creating Document...' : 'Create Account & Initialize Database'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: 1-CLICK DEMO PROFILES */}
          {tab === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                Test multi-user database persistence by switching between pre-configured trader personas. Each user maintains distinct watchlists, portfolios, and indicators:
              </p>

              {/* Profile 1: Alexander Wright */}
              <div
                onClick={() => handleDemoLogin('alex')}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="Alexander"
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <span className="font-bold text-white text-xs block">Alexander Wright</span>
                    <span className="text-[11px] text-indigo-400 font-mono block">alex@apextech.io</span>
                    <span className="text-[10px] text-slate-500 block">AI Silicon &amp; Crypto Focus • Candlestick Mode</span>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-indigo-600/30 group-hover:bg-indigo-600 text-indigo-300 group-hover:text-white text-xs font-bold transition-colors">
                  Load
                </button>
              </div>

              {/* Profile 2: Elena Rostova */}
              <div
                onClick={() => handleDemoLogin('elena')}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80"
                    alt="Elena"
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <span className="font-bold text-white text-xs block">Elena Rostova</span>
                    <span className="text-[11px] text-emerald-400 font-mono block">elena@apextech.io</span>
                    <span className="text-[10px] text-slate-500 block">Bonds, Gold &amp; Macro Index • Line Mode</span>
                  </div>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-emerald-600/30 group-hover:bg-emerald-600 text-emerald-300 group-hover:text-white text-xs font-bold transition-colors">
                  Load
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Database Status: <strong>Online &amp; Persisting</strong></span>
          </span>
          <span className="text-slate-400 font-mono">256-Bit SSL Auth</span>
        </div>
      </div>
    </div>
  );
};

