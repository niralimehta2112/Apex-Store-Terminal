import React, { useState } from 'react';
import { MarketAsset } from '../../types';
import { Star, Plus, X, TrendingUp, TrendingDown, Check } from 'lucide-react';

interface WatchlistBarProps {
  allAssets: MarketAsset[];
  watchlistIds: string[];
  onToggleWatchlistAsset: (assetId: string) => void;
  onSelectAsset?: (assetId: string) => void;
  selectedAssetId?: string;
}

export const WatchlistBar: React.FC<WatchlistBarProps> = ({
  allAssets,
  watchlistIds,
  onToggleWatchlistAsset,
  onSelectAsset,
  selectedAssetId,
}) => {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const watchedAssets = allAssets.filter((a) => watchlistIds.includes(a.id));
  const unselectedAssets = allAssets.filter((a) => !watchlistIds.includes(a.id));

  return (
    <div className="bg-slate-950/70 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Watchlist Title & Items */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 pr-2 border-r border-slate-800">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="hidden sm:inline">User Watchlist</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
              {watchedAssets.length}
            </span>
          </div>

          {/* Pinned Asset Chips */}
          {watchedAssets.map((asset) => {
            const isSelected = selectedAssetId === asset.id;
            const isPositive = asset.change24hPct >= 0;

            return (
              <div
                key={asset.id}
                onClick={() => onSelectAsset && onSelectAsset(asset.id)}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs font-mono transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500/60 text-white shadow-sm ring-1 ring-indigo-500/30'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: asset.color || '#6366f1' }}
                />
                <span className="font-bold">{asset.symbol}</span>
                <span className="text-slate-400 font-sans">${asset.currentPrice.toFixed(2)}</span>
                <span className={`text-[10px] font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? '+' : ''}{asset.change24hPct.toFixed(1)}%
                </span>

                {/* Remove from watchlist */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWatchlistAsset(asset.id);
                  }}
                  className="text-slate-500 hover:text-rose-400 p-0.5 ml-0.5 transition-colors"
                  title="Remove from custom watchlist"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Quick Add Asset Button */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Add</span>
            </button>

            {/* Dropdown to add unselected assets */}
            {isAddMenuOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 block">
                  Add Asset to Watchlist
                </span>
                {unselectedAssets.length === 0 ? (
                  <span className="text-xs text-slate-500 p-2 block">All assets already in watchlist.</span>
                ) : (
                  unselectedAssets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => {
                        onToggleWatchlistAsset(asset.id);
                        setIsAddMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs hover:bg-slate-800 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: asset.color || '#6366f1' }}
                        />
                        <span className="font-bold text-white font-mono">{asset.symbol}</span>
                        <span className="text-slate-400 text-[10px] truncate max-w-[80px]">{asset.name}</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-indigo-400" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cloud Sync Notice */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-slate-500 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Cloud DB Synced</span>
        </div>
      </div>
    </div>
  );
};

