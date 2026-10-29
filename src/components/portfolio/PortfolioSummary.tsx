import React from 'react';
import { PortfolioState, MarketAsset } from '../../types';
import { DollarSign, Wallet, TrendingUp, TrendingDown, RefreshCcw, PlusCircle, ArrowUpRight, Award } from 'lucide-react';

interface PortfolioSummaryProps {
  portfolio: PortfolioState;
  assets: MarketAsset[];
  onOpenTradeModal: () => void;
  onResetPortfolio: () => void;
  onDepositCash: (amount: number) => void;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  portfolio,
  assets,
  onOpenTradeModal,
  onResetPortfolio,
  onDepositCash,
}) => {
  // Calculate total equity value from live asset prices
  let totalHoldingsValue = 0;
  let totalCostBasis = 0;

  Object.values(portfolio.holdings).forEach((holding) => {
    if (holding.shares > 0) {
      const asset = assets.find((a) => a.id === holding.assetId);
      const currentPrice = asset ? asset.currentPrice : holding.avgCostBasis;
      totalHoldingsValue += holding.shares * currentPrice;
      totalCostBasis += holding.shares * holding.avgCostBasis;
    }
  });

  const totalPortfolioValue = portfolio.cashBalance + totalHoldingsValue;
  const unrealizedPnl = totalHoldingsValue - totalCostBasis;
  const unrealizedPnlPct = totalCostBasis > 0 ? (unrealizedPnl / totalCostBasis) * 100 : 0;

  // Realized P&L from trades
  const totalRealizedPnl = portfolio.trades.reduce((acc, t) => acc + (t.realizedPnl || 0), 0);

  // Overall performance vs initial deposit
  const totalReturn = totalPortfolioValue - portfolio.initialBalance;
  const totalReturnPct = portfolio.initialBalance > 0 ? (totalReturn / portfolio.initialBalance) * 100 : 0;
  const isPositiveReturn = totalReturn >= 0;

  return (
    <div className="space-y-4">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Paper Trading Simulator
            </span>
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Price Synced
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Advanced Portfolio Management &amp; Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time equity valuations, average cost basis, realized &amp; unrealized returns, and transaction execution.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onDepositCash(10000)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
            title="Deposit mock paper funds"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>+$10k Cash</span>
          </button>

          <button
            onClick={onResetPortfolio}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors"
            title="Reset portfolio back to default $100k"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={onOpenTradeModal}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Execute Trade</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Portfolio Value */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Total Portfolio Value</span>
            <Wallet className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between border-t border-slate-800/80 pt-2 font-mono">
            <span className="text-slate-500">Total Return:</span>
            <span className={`font-semibold flex items-center gap-1 ${isPositiveReturn ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositiveReturn ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isPositiveReturn ? '+' : ''}${totalReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isPositiveReturn ? '+' : ''}{totalReturnPct.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* 2. Unallocated Cash Balance */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Available Cash</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              ${portfolio.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between border-t border-slate-800/80 pt-2 font-mono">
            <span className="text-slate-500">Buying Power:</span>
            <span className="text-slate-300 font-semibold">
              {((portfolio.cashBalance / totalPortfolioValue) * 100).toFixed(1)}% of Portfolio
            </span>
          </div>
        </div>

        {/* 3. Unrealized Gain / Loss */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Unrealized P&amp;L</span>
            <span className="text-[11px] font-mono text-slate-500">Open Positions</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-bold font-mono tracking-tight ${unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {unrealizedPnl >= 0 ? '+' : ''}${unrealizedPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
              unrealizedPnl >= 0 ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
            }`}>
              {unrealizedPnl >= 0 ? '+' : ''}{unrealizedPnlPct.toFixed(2)}%
            </span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between border-t border-slate-800/80 pt-2 font-mono">
            <span className="text-slate-500">Invested Capital:</span>
            <span className="text-slate-300 font-semibold">${totalCostBasis.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* 4. Realized Returns from Closed Trades */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Realized P&amp;L</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-bold font-mono tracking-tight ${totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalRealizedPnl >= 0 ? '+' : ''}${totalRealizedPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs flex items-center justify-between border-t border-slate-800/80 pt-2 font-mono">
            <span className="text-slate-500">Executed Trades:</span>
            <span className="text-slate-300 font-semibold">{portfolio.trades.length} completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

