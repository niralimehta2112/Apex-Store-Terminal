import React, { useState } from 'react';
import { PortfolioHolding, MarketAsset } from '../../types';
import { TrendingUp, TrendingDown, Plus, Minus, Search, Layers, ArrowUpRight } from 'lucide-react';

interface HoldingsTableProps {
  holdings: Record<string, PortfolioHolding>;
  assets: MarketAsset[];
  totalPortfolioValue: number;
  onTradeAction: (assetId: string, type: 'BUY' | 'SELL') => void;
  onOpenTradeModal: () => void;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings,
  assets,
  totalPortfolioValue,
  onTradeAction,
  onOpenTradeModal,
}) => {
  const [search, setSearch] = useState('');

  const activeHoldings = Object.values(holdings).filter((h) => h.shares > 0);

  const filteredHoldings = activeHoldings.filter((h) => {
    return (
      h.symbol.toLowerCase().includes(search.toLowerCase()) ||
      h.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Active Equity Holdings &amp; Cost Basis</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time mark-to-market valuations and individual stock performance
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search active positions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={onOpenTradeModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap shadow-md shadow-indigo-600/25"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Add Position</span>
          </button>
        </div>
      </div>

      {/* Table */}
      {filteredHoldings.length === 0 ? (
        <div className="text-center py-12 bg-slate-950/40 rounded-2xl border border-slate-800/80 space-y-3">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No active stock positions found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You currently hold all your capital in cash. Execute a simulated buy order to start building your portfolio.
          </p>
          <button
            onClick={onOpenTradeModal}
            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30"
          >
            Execute First Buy Order
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="pb-3 pl-2">Asset / Symbol</th>
                <th className="pb-3 text-right">Shares</th>
                <th className="pb-3 text-right">Avg Cost Basis</th>
                <th className="pb-3 text-right">Market Price</th>
                <th className="pb-3 text-right">Position Value</th>
                <th className="pb-3 text-right">Unrealized P&amp;L</th>
                <th className="pb-3 text-right">Allocation</th>
                <th className="pb-3 text-right pr-2">Quick Trade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredHoldings.map((holding) => {
                const asset = assets.find((a) => a.id === holding.assetId);
                const currentPrice = asset ? asset.currentPrice : holding.avgCostBasis;
                const positionValue = holding.shares * currentPrice;
                const totalCost = holding.shares * holding.avgCostBasis;
                const unrealizedPnl = positionValue - totalCost;
                const unrealizedPnlPct = totalCost > 0 ? (unrealizedPnl / totalCost) * 100 : 0;
                const isProfitable = unrealizedPnl >= 0;
                const allocationPct = totalPortfolioValue > 0 ? (positionValue / totalPortfolioValue) * 100 : 0;

                return (
                  <tr
                    key={holding.assetId}
                    className="hover:bg-slate-850/60 transition-colors group"
                  >
                    {/* Symbol & Name */}
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: asset?.color || '#6366f1' }}
                        />
                        <div>
                          <span className="font-bold text-white block text-sm">{holding.symbol}</span>
                          <span className="text-[11px] text-slate-400 font-sans block truncate max-w-[140px]">
                            {holding.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Shares */}
                    <td className="py-3.5 text-right font-bold text-slate-100">
                      {holding.shares.toLocaleString()}
                    </td>

                    {/* Avg Cost Basis */}
                    <td className="py-3.5 text-right text-slate-300">
                      ${holding.avgCostBasis.toFixed(2)}
                    </td>

                    {/* Current Live Price */}
                    <td className="py-3.5 text-right">
                      <span className="text-white font-bold block">${currentPrice.toFixed(2)}</span>
                      {asset && (
                        <span className={`text-[10px] block ${asset.change24hPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {asset.change24hPct >= 0 ? '+' : ''}{asset.change24hPct.toFixed(2)}%
                        </span>
                      )}
                    </td>

                    {/* Position Value */}
                    <td className="py-3.5 text-right font-bold text-white text-sm">
                      ${positionValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Unrealized P&L */}
                    <td className="py-3.5 text-right">
                      <div className={`font-bold flex items-center justify-end gap-1 ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfitable ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        <span>{isProfitable ? '+' : ''}${unrealizedPnl.toFixed(2)}</span>
                      </div>
                      <span className={`text-[10px] font-semibold block ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfitable ? '+' : ''}{unrealizedPnlPct.toFixed(2)}%
                      </span>
                    </td>

                    {/* Weight % */}
                    <td className="py-3.5 text-right">
                      <span className="text-slate-300 font-bold">{allocationPct.toFixed(1)}%</span>
                      <div className="w-16 h-1 bg-slate-800 rounded-full ml-auto mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, allocationPct)}%`,
                            backgroundColor: asset?.color || '#6366f1'
                          }}
                        />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 text-right pr-2">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onTradeAction(holding.assetId, 'BUY')}
                          className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors"
                          title={`Buy more ${holding.symbol}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onTradeAction(holding.assetId, 'SELL')}
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-colors"
                          title={`Sell ${holding.symbol}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

