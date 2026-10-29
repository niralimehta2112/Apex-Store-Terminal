import React, { useState, useMemo } from 'react';
import {
  StrategyRule,
  MarketAsset,
  MarketDataPoint,
  PortfolioState,
  BacktestResult
} from '../../types';
import { runBacktestSimulation } from '../../utils/strategyEngine';
import { StrategyBuilderModal } from './StrategyBuilderModal';
import {
  Sliders,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit3,
  TrendingUp,
  TrendingDown,
  Award,
  BarChart2,
  Shield,
  Activity,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface StrategyManagerViewProps {
  strategies: StrategyRule[];
  onUpdateStrategies: (newStrategies: StrategyRule[]) => void;
  assets: MarketAsset[];
  datasets: Record<string, MarketDataPoint[]>;
  portfolio: PortfolioState;
  onAutoExecuteTrade?: (asset: MarketAsset, type: 'BUY' | 'SELL', shares: number, price: number) => void;
}

export const StrategyManagerView: React.FC<StrategyManagerViewProps> = ({
  strategies,
  onUpdateStrategies,
  assets,
  datasets,
  portfolio,
}) => {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<StrategyRule | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(strategies[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'backtest' | 'signals'>('overview');

  const selectedStrategy = strategies.find((s) => s.id === selectedStrategyId) || strategies[0];
  const targetAsset = assets.find((a) => a.id === selectedStrategy?.assetId) || assets[0];
  const targetData = datasets[targetAsset?.id] || [];

  // Run backtest on the currently selected strategy
  const backtestResult: BacktestResult = useMemo(() => {
    if (!selectedStrategy || !targetAsset) {
      return {
        strategyId: '',
        strategyName: '',
        assetSymbol: '',
        initialCapital: 50000,
        endingCapital: 50000,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnl: 0,
        totalPnlPct: 0,
        maxDrawdownPct: 0,
        profitFactor: 0,
        signals: [],
        equityCurve: [],
      };
    }
    return runBacktestSimulation(selectedStrategy, targetData, targetAsset, 50000);
  }, [selectedStrategy, targetData, targetAsset]);

  // Handle Strategy Save / Edit
  const handleSaveStrategy = (newRule: StrategyRule) => {
    const existingIndex = strategies.findIndex((s) => s.id === newRule.id);
    let updated: StrategyRule[];
    if (existingIndex >= 0) {
      updated = [...strategies];
      updated[existingIndex] = newRule;
    } else {
      updated = [newRule, ...strategies];
    }
    onUpdateStrategies(updated);
    setSelectedStrategyId(newRule.id);
  };

  const handleToggleStrategy = (id: string) => {
    const updated = strategies.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
    onUpdateStrategies(updated);
  };

  const handleDeleteStrategy = (id: string) => {
    if (window.confirm('Delete this automated strategy rule?')) {
      const updated = strategies.filter((s) => s.id !== id);
      onUpdateStrategies(updated);
      if (selectedStrategyId === id) {
        setSelectedStrategyId(updated[0]?.id || '');
      }
    }
  };

  // Equity Curve SVG calculation
  const curveWidth = 700;
  const curveHeight = 160;
  const curvePadding = { top: 15, right: 20, bottom: 25, left: 20 };
  const plotWidth = curveWidth - curvePadding.left - curvePadding.right;
  const plotHeight = curveHeight - curvePadding.top - curvePadding.bottom;

  const { minEq, maxEq, equitySvgPath } = useMemo(() => {
    const curve = backtestResult.equityCurve;
    if (curve.length === 0) return { minEq: 0, maxEq: 100, equitySvgPath: '' };

    let min = Infinity;
    let max = -Infinity;
    curve.forEach((c) => {
      if (c.equity < min) min = c.equity;
      if (c.equity > max) max = c.equity;
    });

    const spread = max - min || 1;
    const paddedMin = min - spread * 0.08;
    const paddedMax = max + spread * 0.08;

    const path = curve
      .map((c, i) => {
        const x = curvePadding.left + (i / Math.max(1, curve.length - 1)) * plotWidth;
        const y = curvePadding.top + plotHeight - ((c.equity - paddedMin) / (paddedMax - paddedMin || 1)) * plotHeight;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    return { minEq: paddedMin, maxEq: paddedMax, equitySvgPath: path };
  }, [backtestResult.equityCurve]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Rule-Based Algorithmic Trading
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Strategy Engine Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Sliders className="w-8 h-8 text-indigo-400" />
              Custom Indicators &amp; Strategy Automation Studio
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Design rules like &ldquo;Buy when price breaks 50-SMA&rdquo; or &ldquo;Sell when RSI &gt; 70&rdquo;. Backtest historical performance, inspect equity curves, and auto-execute signals into your simulated portfolio.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingStrategy(null);
                setIsBuilderOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Strategy Rule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Strategies List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Active Automated Rules ({strategies.length})
            </span>
            <span className="text-slate-500 text-[11px]">Click to inspect backtest</span>
          </div>

          <div className="space-y-3">
            {strategies.map((strat) => {
              const isSelected = selectedStrategy?.id === strat.id;
              const asset = assets.find((a) => a.id === strat.assetId);

              return (
                <div
                  key={strat.id}
                  onClick={() => setSelectedStrategyId(strat.id)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg ring-1 ring-indigo-500/40'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: asset?.color || '#6366f1' }}
                      />
                      <h3 className="font-bold text-white text-sm">{strat.name}</h3>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleStrategy(strat.id)}
                        className={`p-1.5 rounded-xl border transition-colors ${
                          strat.enabled
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-950 text-slate-600 border-slate-800'
                        }`}
                        title={strat.enabled ? 'Pause Strategy' : 'Activate Strategy'}
                      >
                        {strat.enabled ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => {
                          setEditingStrategy(strat);
                          setIsBuilderOpen(true);
                        }}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        title="Edit Strategy"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteStrategy(strat.id)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {strat.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">
                      Target: <strong className="text-white">{asset?.symbol || strat.assetId}</strong>
                    </span>
                    <span className="text-slate-400">
                      Sizing: <strong className="text-indigo-300">{strat.shares} shares</strong>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full ${
                      strat.autoTrade ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {strat.autoTrade ? 'Auto-Trading' : 'Manual'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Backtest & Performance Simulation Studio (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-5">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                  Simulated Backtest Results
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{selectedStrategy?.name}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {targetAsset?.symbol}
                  </span>
                </h3>
              </div>

              {/* Sub-Tabs */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Equity Curve
                </button>
                <button
                  onClick={() => setActiveTab('signals')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    activeTab === 'signals' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Execution Signals ({backtestResult.signals.length})
                </button>
              </div>
            </div>

            {/* Performance KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Strategy P&amp;L</span>
                <span className={`text-base font-mono font-bold mt-0.5 block ${
                  backtestResult.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {backtestResult.totalPnl >= 0 ? '+' : ''}${backtestResult.totalPnl.toLocaleString()}
                </span>
                <span className={`text-[10px] font-mono ${
                  backtestResult.totalPnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {backtestResult.totalPnlPct >= 0 ? '+' : ''}{backtestResult.totalPnlPct}%
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Win Rate</span>
                <span className="text-base font-mono font-bold text-white mt-0.5 block">
                  {backtestResult.winRate}%
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {backtestResult.winningTrades}W / {backtestResult.losingTrades}L
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Profit Factor</span>
                <span className="text-base font-mono font-bold text-amber-400 mt-0.5 block">
                  {backtestResult.profitFactor}x
                </span>
                <span className="text-[10px] text-slate-500 block">Gross Win / Loss</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Max Drawdown</span>
                <span className="text-base font-mono font-bold text-rose-400 mt-0.5 block">
                  -{backtestResult.maxDrawdownPct}%
                </span>
                <span className="text-[10px] text-slate-500 block">Peak to Valley</span>
              </div>
            </div>

            {/* TAB 1: Equity Curve SVG */}
            {activeTab === 'overview' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Simulated Strategy Equity Curve ($50,000 Starting Capital)</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    ${backtestResult.endingCapital.toLocaleString()} Final Equity
                  </span>
                </div>

                <div className="w-full bg-slate-950 rounded-2xl p-3 border border-slate-800 relative">
                  <svg viewBox={`0 0 ${curveWidth} ${curveHeight}`} className="w-full h-auto overflow-visible">
                    <line
                      x1={curvePadding.left}
                      y1={curvePadding.top + plotHeight}
                      x2={curveWidth - curvePadding.right}
                      y2={curvePadding.top + plotHeight}
                      stroke="#1e293b"
                      strokeWidth="1"
                    />

                    {equitySvgPath && (
                      <path
                        d={equitySvgPath}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>
                </div>
              </div>
            )}

            {/* TAB 2: Execution Signals List */}
            {activeTab === 'signals' && (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {backtestResult.signals.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">
                    No trigger signals fired during this historical period.
                  </div>
                ) : (
                  backtestResult.signals.map((sig) => (
                    <div
                      key={sig.id}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-bold font-mono text-[10px] ${
                          sig.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {sig.type}
                        </span>
                        <div>
                          <span className="text-slate-200 font-semibold block">{sig.reason}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{sig.timestamp}</span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="font-bold text-white block">${sig.price.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400">{sig.shares} sh</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Execution Model: <strong>Automated Simulated Tick Execution</strong></span>
            <span className="text-emerald-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" /> Signals Synced to Paper Portfolio
            </span>
          </div>
        </div>
      </div>

      {/* Strategy Builder / Custom Rule Editor Modal */}
      <StrategyBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        assets={assets}
        onSaveStrategy={handleSaveStrategy}
        initialStrategy={editingStrategy}
      />
    </div>
  );
};

