import React from 'react';
import { MarketDataPoint } from '../../types';
import { evaluateMarketInsights } from '../../utils/financialCalculations';
import { Sparkles, Compass, ShieldAlert, Cpu, BarChart2 } from 'lucide-react';

interface VolatilityTrendAnalysisProps {
  data: MarketDataPoint[];
  assetName: string;
}

export const VolatilityTrendAnalysis: React.FC<VolatilityTrendAnalysisProps> = ({
  data,
  assetName
}) => {
  const insights = evaluateMarketInsights(data);
  const latest = data.length > 0 ? data[data.length - 1] : null;

  // Calculate Bollinger Bandwidth (Measure of Volatility Squeeze vs Expansion)
  const bandwidth = (latest?.bollingerUpper && latest?.bollingerLower && latest?.bollingerMiddle)
    ? ((latest.bollingerUpper - latest.bollingerLower) / latest.bollingerMiddle) * 100
    : 4.5;

  const isSqueeze = bandwidth < 3.5;

  // Simple Value-at-Risk (VaR 95%) estimate based on recent standard deviation
  const var95 = latest?.volatility ? (latest.volatility * 0.05).toFixed(2) : '1.85';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Algorithmic Market Signal & AI Synthesis */}
      <div className="lg:col-span-2 bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-slate-900/90 border border-indigo-500/20 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Quantitative Indicator Insights</h3>
              <p className="text-xs text-slate-400">Multi-factor trend & momentum synthesis for {assetName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">Algorithmic Stance:</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
              {insights.signal}
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed font-sans mt-2 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
          {insights.summary}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Trend Structure</span>
            <span className="text-xs font-mono font-bold text-slate-200 mt-0.5 block">{insights.trend}</span>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">RSI Pressure</span>
            <span className="text-xs font-mono font-bold text-violet-300 mt-0.5 block">{insights.rsiStatus}</span>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Volatility Regimen</span>
            <span className="text-xs font-mono font-bold text-amber-300 mt-0.5 block">{insights.riskLevel}</span>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">BB Squeeze/Expansion</span>
            <span className={`text-xs font-mono font-bold mt-0.5 block ${isSqueeze ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isSqueeze ? 'Vol Squeeze (<3.5%)' : `Normal (${bandwidth.toFixed(1)}%)`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Risk & Volatility Breakdown Panel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Risk & Volatility Parameters</h3>
              <p className="text-xs text-slate-400">Statistical risk boundaries</p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Vol Risk Meter</span>
                <span className="font-mono text-slate-200 font-bold">{latest?.volatility?.toFixed(1) ?? '28.0'}%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(10, latest?.volatility ?? 28))}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800 font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400" /> Value at Risk (1D, 95%):
              </span>
              <span className="text-slate-200 font-bold">±{var95}%</span>
            </div>

            <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800 font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-cyan-400" /> Bollinger Spread:
              </span>
              <span className="text-slate-200 font-bold">
                {latest?.bollingerUpper && latest?.bollingerLower
                  ? `$${(latest.bollingerUpper - latest.bollingerLower).toFixed(2)}`
                  : 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1.5 font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" /> Sampling Engine:
              </span>
              <span className="text-emerald-400 font-bold">Real-time Tick Synced</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-800/80">
          Metrics update dynamically on every synthetic market tick. Use the controls above to toggle overlays and test volatility responses.
        </div>
      </div>
    </div>
  );
};

