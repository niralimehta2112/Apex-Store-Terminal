import React, { useState, useEffect } from 'react';
import { MarketAsset, PortfolioState } from '../../types';
import { X, TrendingUp, TrendingDown, ArrowRight, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { calculateTransactionFee } from '../../utils/portfolioManager';

interface TradeOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: MarketAsset[];
  initialAssetId?: string;
  initialType?: 'BUY' | 'SELL';
  portfolio: PortfolioState;
  onExecuteBuy: (asset: MarketAsset, shares: number, marketPrice: number) => { success: boolean; message: string };
  onExecuteSell: (asset: MarketAsset, shares: number, marketPrice: number) => { success: boolean; message: string };
}

export const TradeOrderModal: React.FC<TradeOrderModalProps> = ({
  isOpen,
  onClose,
  assets,
  initialAssetId,
  initialType = 'BUY',
  portfolio,
  onExecuteBuy,
  onExecuteSell,
}) => {
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>(initialType);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(initialAssetId || assets[0]?.id || 'nvst');
  const [sharesInput, setSharesInput] = useState<string>('10');
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    if (initialAssetId) setSelectedAssetId(initialAssetId);
    if (initialType) setTradeType(initialType);
    setFeedback(null);
  }, [initialAssetId, initialType, isOpen]);

  if (!isOpen) return null;

  const currentAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];
  const holding = portfolio.holdings[currentAsset.id];
  const sharesOwned = holding ? holding.shares : 0;
  const currentPrice = currentAsset.currentPrice;

  const parsedShares = parseInt(sharesInput, 10) || 0;
  const principal = parsedShares * currentPrice;
  const fee = calculateTransactionFee(principal, portfolio.feePerTrade, portfolio.slippagePct);

  // Buy requires principal + fee; Sell yields principal - fee
  const totalCost = principal + fee;
  const netProceeds = Math.max(0, principal - fee);

  // Realized gain estimate for SELL
  const estimatedSellPnl = tradeType === 'SELL' && holding
    ? (parsedShares * currentPrice) - (parsedShares * holding.avgCostBasis) - fee
    : 0;

  // Max calculations
  const maxBuyShares = currentPrice > 0
    ? Math.max(0, Math.floor((portfolio.cashBalance - portfolio.feePerTrade) / (currentPrice * (1 + portfolio.slippagePct / 100))))
    : 0;
  const maxSellShares = sharesOwned;

  const handleSetPercent = (pct: number) => {
    setFeedback(null);
    if (tradeType === 'BUY') {
      const targetShares = Math.floor(maxBuyShares * (pct / 100));
      setSharesInput(Math.max(1, targetShares).toString());
    } else {
      const targetShares = Math.floor(maxSellShares * (pct / 100));
      setSharesInput(Math.max(1, targetShares).toString());
    }
  };

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (parsedShares <= 0) {
      setFeedback({ success: false, message: 'Please enter a valid share quantity greater than 0.' });
      return;
    }

    if (tradeType === 'BUY') {
      const res = onExecuteBuy(currentAsset, parsedShares, currentPrice);
      setFeedback(res);
      if (res.success) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } else {
      const res = onExecuteSell(currentAsset, parsedShares, currentPrice);
      setFeedback(res);
      if (res.success) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              Interactive Trading Simulator
            </span>
            <h3 className="text-base font-bold text-white">Execute Simulated Market Order</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleExecute} className="p-6 space-y-5">
          {/* Buy / Sell Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setTradeType('BUY');
                setFeedback(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                tradeType === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>BUY (Long Asset)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTradeType('SELL');
                setFeedback(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                tradeType === 'SELL'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>SELL (Liquidate)</span>
            </button>
          </div>

          {/* Asset Selection Dropdown & Live Price */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Select Tradable Stock / Asset
            </label>
            <div className="relative">
              <select
                value={selectedAssetId}
                onChange={(e) => {
                  setSelectedAssetId(e.target.value);
                  setFeedback(null);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-white font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id} className="bg-slate-900 text-white">
                    {asset.symbol} — {asset.name} (${asset.currentPrice.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Live Asset Badge */}
            <div className="flex items-center justify-between text-xs mt-2 px-1">
              <span className="text-slate-500">
                Market Price: <strong className="text-white font-mono">${currentPrice.toFixed(2)}</strong>
                <span className={`ml-1.5 font-mono ${currentAsset.change24hPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currentAsset.change24hPct >= 0 ? '+' : ''}{currentAsset.change24hPct.toFixed(2)}%
                </span>
              </span>
              <span className="text-slate-400 font-mono">
                Currently Holding: <strong className="text-indigo-300 font-bold">{sharesOwned} shares</strong>
              </span>
            </div>
          </div>

          {/* Shares Input & Quick Percentages */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <label className="font-medium text-slate-400">Number of Shares to {tradeType}</label>
              <span className="text-slate-500 font-mono text-[11px]">
                {tradeType === 'BUY'
                  ? `Max Afford: ${maxBuyShares} shares`
                  : `Max Available: ${sharesOwned} shares`}
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={sharesInput}
                onChange={(e) => {
                  setSharesInput(e.target.value);
                  setFeedback(null);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-base text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                placeholder="Enter quantity..."
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                SHARES
              </span>
            </div>

            {/* Quick % buttons */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleSetPercent(pct)}
                  className="py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-mono border border-slate-800 transition-colors"
                >
                  {pct === 100 ? 'MAX' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Order Financial Breakdown / Transaction Costs */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Gross Trade Value:</span>
              <span className="font-mono text-slate-200">${principal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span className="flex items-center gap-1">
                Transaction Fee &amp; Slippage:
                <Info className="w-3 h-3 text-slate-500" title="Includes $1.00 base broker fee + 0.05% liquidity commission" />
              </span>
              <span className="font-mono text-amber-400">${fee.toFixed(2)}</span>
            </div>

            {tradeType === 'BUY' ? (
              <>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>Available Cash Balance:</span>
                  <span className="font-mono text-emerald-400">${portfolio.cashBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800 text-sm">
                  <span>Total Capital Required:</span>
                  <span className="font-mono text-indigo-400">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>Est. Realized P&amp;L on Sale:</span>
                  <span className={`font-mono font-bold ${estimatedSellPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {estimatedSellPnl >= 0 ? '+' : ''}${estimatedSellPnl.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800 text-sm">
                  <span>Net Cash Proceeds:</span>
                  <span className="font-mono text-emerald-400">${netProceeds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </>
            )}
          </div>

          {/* Feedback messages */}
          {feedback && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              feedback.success
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            }`}>
              {feedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-2xl text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={tradeType === 'BUY' ? portfolio.cashBalance < totalCost : sharesOwned < parsedShares}
              className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all shadow-xl flex items-center justify-center gap-2 ${
                tradeType === 'BUY'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 disabled:bg-slate-800 disabled:text-slate-500'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25 disabled:bg-slate-800 disabled:text-slate-500'
              }`}
            >
              <span>Confirm {tradeType} Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

