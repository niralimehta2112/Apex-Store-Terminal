import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../../types';
import { User, LogOut, RefreshCw, Shield, ChevronDown, CheckCircle, Database } from 'lucide-react';

interface UserMenuProps {
  user: UserProfile | null;
  onOpenAuth: (mode?: 'signin' | 'signup' | 'demo') => void;
  onSignOut: () => void;
  lastSyncedAt?: string;
  watchlistCount?: number;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onOpenAuth,
  onSignOut,
  lastSyncedAt,
  watchlistCount = 4,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onOpenAuth('signin')}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all shadow-sm"
        >
          Log In
        </button>
        <button
          onClick={() => onOpenAuth('signup')}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25"
        >
          Sign Up
        </button>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative select-none">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 transition-all text-xs"
      >
        <img
          src={user.avatar}
          alt={user.name}
          className="w-7 h-7 rounded-xl object-cover border border-slate-700"
        />
        <div className="text-left hidden sm:block">
          <span className="font-bold text-white block text-xs leading-none">{user.name.split(' ')[0]}</span>
          <span className="text-[10px] text-indigo-400 font-mono block mt-0.5">
            {user.role === 'Quantitative Trader' ? 'Quant Pro' : 'Analyst'}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-4 z-50 animate-fade-in space-y-3">
          {/* User Info Card */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-11 h-11 rounded-2xl object-cover border border-slate-700"
            />
            <div className="min-w-0 flex-1">
              <span className="font-bold text-white text-sm block truncate">{user.name}</span>
              <span className="text-[11px] text-slate-400 font-mono block truncate">{user.email}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold inline-block mt-1">
                {user.role}
              </span>
            </div>
          </div>

          {/* Cloud Database Sync Status */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" /> Cloud Sync:
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                <CheckCircle className="w-3 h-3" /> Live Synced
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Watchlist Assets:</span>
              <span className="text-slate-300 font-bold">{watchlistCount} items</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Database Document ID:</span>
              <span className="text-indigo-400 truncate max-w-[120px]">{user.uid}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-1 text-xs">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAuth('demo');
              }}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>Switch User / Demo Profile</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenAuth('signup');
              }}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Create New Account</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors pt-2 border-t border-slate-800/80"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

