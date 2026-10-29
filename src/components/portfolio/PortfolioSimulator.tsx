import React, { useState } from 'react';
import { MarketAsset, PortfolioState, AssetAllocationItem } from '../../types';
import { PortfolioSummary } from './PortfolioSummary';
import { AssetAllocationChart } from './AssetAllocationChart';
import { HoldingsTable } from './HoldingsTable';
import { TradeHistoryTable } from './TradeHistoryTable';
import { TradeOrderModal } from './TradeOrderModal';
import { EducationalTradingGuide } from './EducationalTradingGuide';
import { processBuyOrder, processSellOrder, resetPortfolioState } from '../../utils/portfolioManager';
import { TrendingUp, TrendingDown, ArrowUpRight, Zap, RefreshCw } from 'lucide-react';

interface PortfolioSimulatorProps {
  portfolio: PortfolioState;
  onUpdatePortfolio: (newState: PortfolioState) => void;
  assets: MarketAsset[];
  onTriggerPriceShock?: () => void;
}

export const PortfolioSimulator: React.FC<PortfolioSimulatorProps> = ({
  portfolio,
  onUpdatePortfolio,
  assets,
  onTriggerPriceShock,
}) => {
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeModalAssetId, setTradeModalAssetId] = useState<string | undefined>(undefined);
  const [tradeModalType, setTradeModalType] = useState<'BUY' | 'SELL'>('BUY');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Open trade modal with pre-selected asset & type
  const handleOpenTrade = (assetId?: string, type: 'BUY' | 'SELL' = 'BUY') => {
    setTradeModalAssetId(assetId);
    setTradeModalType(type);
    setIsTradeModalOpen(true);
  };

  // Buy handler
  const handleExecuteBuy = (asset: MarketAsset, shares: number, marketPrice: number) => {
    const result = processBuyOrder(portfolio, asset, shares, marketPrice);
    if (result.success) {
      onUpdatePortfolio(result.newState);
      showNotification(result.message, 'success');
    } else {
      showNotification(result.message, 'error');
    }
    return result;
  };

  // Sell handler
  const handleExecuteSell = (asset: MarketAsset, shares: number, marketPrice: number) => {
    const result = processSellOrder(portfolio, asset, shares, marketPrice);
    if (result.success) {
      onUpdatePortfolio(result.newState);
      showNotification(result.message, 'success');
    } else {
      showNotification(result.message, 'error');
    }
    return result;
  };

  // Reset portfolio handler
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your paper portfolio to $100,000 cash balance? This will clear all open positions and trade logs.')) {
      const fresh = resetPortfolioState();
      onUpdatePortfolio(fresh);
      showNotification('Portfolio reset back to $100,000.00 cash balance.', 'success');
    }
  };

  // Mock cash deposit
  const handleDepositCash = (amount: number) => {
    const newState: PortfolioState = {
      ...portfolio,
      cashBalance: parseFloat((portfolio.cashBalance + amount).toFixed(2)),
      initialBalance: parseFloat((portfolio.initialBalance + amount).toFixed(2)),
    };
    onUpdatePortfolio(newState);
    showNotification(`Deposited $${amount.toLocaleString()} into your paper trading account!`, 'success');
  };

  // Calculate live portfolio total value & allocation breakdown
  let totalStockValue = 0;
  const allocationItems: AssetAllocationItem[] = [];

  Object.values(portfolio.holdings).forEach((h) => {
    if (h.shares > 0) {
      const asset = assets.find((a) => a.id === h.assetId);
      const price = asset ? asset.currentPrice : h.avgCostBasis;
      const val = h.shares * price;
      totalStockValue += val;

      allocationItems.push({
        id: h.assetId,
        name: h.name,
        symbol: h.symbol,
        value: val,
        percentage: 0, // will compute below
        color: asset?.color || '#6366f1',
      });
    }
  });

  const totalPortfolioValue = portfolio.cashBalance + totalStockValue;

  // Add cash slice
  allocationItems.push({
    id: 'cash',
    name: 'Unallocated Cash',
    symbol: 'USD CASH',
    value: portfolio.cashBalance,
    percentage: totalPortfolioValue > 0 ? (portfolio.cashBalance / totalPortfolioValue) * 100 : 100,
    color: '#10b981', // Emerald for cash
  });

  // Calculate actual percentages for stocks
  allocationItems.forEach((item) => {
    if (item.id !== 'cash') {
      item.percentage = totalPortfolioValue > 0 ? (item.value / totalPortfolioValue) * 100 : 0;
    }
  });

  // Sort descending by value
  allocationItems.sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border text-xs font-semibold backdrop-blur-md flex items-center gap-3 animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-ping" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Portfolio Summary KPIs */}
      <PortfolioSummary
        portfolio={portfolio}
        assets={assets}
        onOpenTradeModal={() => handleOpenTrade()}
        onResetPortfolio={handleReset}
        onDepositCash={handleDepositCash}
      />

      {/* Two-Column: Asset Allocation Chart & Quick Tradable Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Visual Asset Allocation (7 cols) */}
        <div className="lg:col-span-7">
          <AssetAllocationChart
            allocations={allocationItems}
            totalPortfolioValue={totalPortfolioValue}
          />
        </div>

        {/* Right: Quick Market Watchlist & Instant Trade Launcher (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
              <div>
                <h3 className="text-sm font-bold text-white">Market Watchlist</h3>
                <p className="text-xs text-slate-400">Live prices &amp; 1-click order launcher</p>
              </div>
              {onTriggerPriceShock && (
                <button
                  onClick={onTriggerPriceShock}
                  title="Simulate market price shock"
                  className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs flex items-center gap-1 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Price Shock</span>
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {assets.map((asset) => {
                const holding = portfolio.holdings[asset.id];
                const shares = holding ? holding.shares : 0;
                return (
                  <div
                    key={asset.id}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: asset.color || '#6366f1' }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs font-mono">{asset.symbol}</span>
                          {shares > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                              {shares} sh
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 truncate max-w-[130px] block">
                          {asset.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-bold font-mono text-white text-xs block">
                          ${asset.currentPrice.toFixed(2)}
                        </span>
                        <span className={`text-[10px] font-mono flex items-center justify-end ${
                          asset.change24hPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {asset.change24hPct >= 0 ? '+' : ''}{asset.change24hPct.toFixed(2)}%
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenTrade(asset.id, 'BUY')}
                        className="p-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 transition-colors text-xs font-semibold flex items-center gap-1"
                        title={`Trade ${asset.symbol}`}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Trade</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Trading Engine: <strong>Paper Zero-Risk</strong></span>
            <span>Broker Fee: <strong>${portfolio.feePerTrade.toFixed(2)}</strong></span>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <HoldingsTable
        holdings={portfolio.holdings}
        assets={assets}
        totalPortfolioValue={totalPortfolioValue}
        onTradeAction={handleOpenTrade}
        onOpenTradeModal={() => handleOpenTrade()}
      />

      {/* Trade History Ledger */}
      <TradeHistoryTable trades={portfolio.trades} />

      {/* Educational Primer & Simulation Mechanics */}
      <EducationalTradingGuide />

      {/* Trade Order Modal */}
      <TradeOrderModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        assets={assets}
        initialAssetId={tradeModalAssetId}
        initialType={tradeModalType}
        portfolio={portfolio}
        onExecuteBuy={handleExecuteBuy}
        onExecuteSell={handleExecuteSell}
      />
    </div>
  );
};

