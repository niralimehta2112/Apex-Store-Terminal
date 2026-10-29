import React from 'react';
import { ShoppingBag, Heart, BarChart3, Store, Cpu, Briefcase, Sliders, Zap } from 'lucide-react';
import { UserProfile } from '../../types';
import { UserMenu } from '../auth/UserMenu';

export type NavTab = 'shop' | 'portfolio' | 'analytics' | 'strategy';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  portfolioValue?: number;
  currentUser: UserProfile | null;
  onOpenAuth: (mode?: 'signin' | 'signup' | 'demo') => void;
  onSignOut: () => void;
  watchlistCount?: number;
  activeStrategiesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  cartCount,
  cartTotal,
  onOpenCart,
  wishlistCount,
  onOpenWishlist,
  portfolioValue,
  currentUser,
  onOpenAuth,
  onSignOut,
  watchlistCount = 4,
  activeStrategiesCount = 2,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <div
              onClick={() => onSelectTab('shop')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-white block leading-none">
                  APEX<span className="text-indigo-400">STORE</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mt-0.5">
                  &amp; Institutional Terminal
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => onSelectTab('shop')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'shop'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Store Catalog</span>
              </button>

              <button
                onClick={() => onSelectTab('portfolio')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                  activeTab === 'portfolio'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Portfolio Simulation</span>
                {portfolioValue && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                    ${Math.round(portfolioValue / 1000)}k
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectTab('analytics')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Market Analytics</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              </button>

              <button
                onClick={() => onSelectTab('strategy')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                  activeTab === 'strategy'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>Strategy Studio</span>
                {activeStrategiesCount > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    <Zap className="w-2.5 h-2.5 text-amber-400" />
                    <span>{activeStrategiesCount} Live</span>
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Quick Real-Time Market Ticker in Header */}
          <div className="hidden xl:flex items-center gap-3 bg-slate-900/70 border border-slate-800/90 px-3.5 py-1.5 rounded-2xl text-xs font-mono">
            <span className="text-slate-400 text-[11px] font-semibold">TICKER:</span>
            <span className="text-white font-bold">NVST $625.30</span>
            <span className="text-emerald-400 font-semibold">+4.84%</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">BTC $67,450</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">GOLD $2,740.50</span>
          </div>

          {/* Right Action Icons (Wishlist, Cart, Mobile Tab Switcher, User Auth Menu) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Tab Toggles */}
            <div className="flex md:hidden items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => onSelectTab('shop')}
                className={`p-1.5 rounded-lg ${activeTab === 'shop' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                title="Store"
              >
                <Store className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSelectTab('portfolio')}
                className={`p-1.5 rounded-lg ${activeTab === 'portfolio' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                title="Portfolio"
              >
                <Briefcase className="w-4 h-4 text-emerald-400" />
              </button>
              <button
                onClick={() => onSelectTab('analytics')}
                className={`p-1.5 rounded-lg ${activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                title="Analytics"
              >
                <BarChart3 className="w-4 h-4 text-cyan-400" />
              </button>
              <button
                onClick={() => onSelectTab('strategy')}
                className={`p-1.5 rounded-lg ${activeTab === 'strategy' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
                title="Strategy Studio"
              >
                <Sliders className="w-4 h-4 text-purple-400" />
              </button>
            </div>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-all shadow-sm"
              title="Saved items"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold font-mono flex items-center justify-center shadow-md">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/25 text-xs font-semibold"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[17px] h-[17px] px-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold font-mono flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-mono font-bold">
                ${cartTotal.toFixed(2)}
              </span>
            </button>

            {/* User Auth & Database Menu */}
            <UserMenu
              user={currentUser}
              onOpenAuth={onOpenAuth}
              onSignOut={onSignOut}
              watchlistCount={watchlistCount}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
