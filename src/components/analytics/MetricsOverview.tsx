import React from 'react';
import { MarketAsset, MarketDataPoint } from '../../types';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, ShieldCheck, BarChart3, Gauge } from 'lucide-react';

interface MetricsOverviewProps {
  asset: MarketAsset;
  data: MarketDataPoint[];
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ asset, data }) => {
  const latest = data.length > 0 ? data[data.length - 1] : null;
  const previous = data.length > 1 ? data[data.length - 2] : null;

  const currentPrice = latest ? latest.close : asset.currentPrice;
  const priceDelta = previous ? currentPrice - previous.close : asset.change24h;
  const priceDeltaPct = previous && previous.close ? (priceDelta / previous.close) * 100 : asset.change24hPct;
  const isPositive = priceDelta >= 0;

  const currentRsi = latest?.rsi ?? asset.rsiCurrent;
  const currentVol = latest?.volatility ?? asset.volatilityScore;

  // Moving Average alignment
  let maStatus = { text: 'Analyzing MAs...', color: 'text-slate-400', badge: 'Neutral' };
  if (latest?.smaFast && latest?.smaSlow) {
    if (latest.smaFast > latest.smaSlow) {
      maStatus = {
        text: `SMA Fast (${latest.smaFast.toFixed(1)}) > Slow (${latest.smaSlow.toFixed(1)})`,
        color: 'text-emerald-400',
        badge: 'Bullish Cross'
      };
    } else {
      maStatus = {
        text: `SMA Fast (${latest.smaFast.toFixed(1)}) < Slow (${latest.smaSlow.toFixed(1)})`,
        color: 'text-amber-400',
        badge: 'Bearish Cross'
      };
    }
  }

  // Volatility Risk categorization
  let riskBadge = { label: 'Low Risk', bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400', icon: ShieldCheck };
  if (currentVol > 60) {
    riskBadge = { label: 'Extreme Volatility', bg: 'bg-rose-500/15 border-rose-500/30 text-rose-400', icon: AlertTriangle };
  } else if (currentVol > 35) {
    riskBadge = { label: 'High Volatility', bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400', icon: Gauge };
  } else if (currentVol > 20) {
    riskBadge = { label: 'Moderate Volatility', bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400', icon: Activity };
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Real-time Asset Price */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-semibold uppercase tracking-wider">Spot Price</span>
          <span className="text-[11px] font-mono text-slate-500">Live Tick</span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <div className={`flex items-center text-xs font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
            <span>{isPositive ? '+' : ''}{priceDeltaPct.toFixed(2)}%</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex justify-between font-mono border-t border-slate-800/80 pt-2">
          <span>24h Range:</span>
          <span>${asset.low24h.toFixed(1)} - ${asset.high24h.toFixed(1)}</span>
        </div>
      </div>

      {/* 2. Price Volatility Indicator */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-semibold uppercase tracking-wider">Price Volatility (HV)</span>
          <riskBadge.icon className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            {currentVol.toFixed(1)}%
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${riskBadge.bg}`}>
            {riskBadge.label}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex justify-between font-mono border-t border-slate-800/80 pt-2">
          <span>Annualized σ:</span>
          <span className="text-slate-300">{(currentVol * 0.01).toFixed(3)} pts</span>
        </div>
      </div>

      {/* 3. Relative Strength Index (RSI) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-semibold uppercase tracking-wider">RSI Momentum (14)</span>
          <Activity className="w-4 h-4 text-violet-400" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold font-mono text-white tracking-tight">
            {currentRsi.toFixed(1)}
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
            currentRsi >= 70
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
              : currentRsi <= 30
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
          }`}>
            {currentRsi >= 70 ? 'Overbought' : currentRsi <= 30 ? 'Oversold' : 'Neutral Range'}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex justify-between font-mono border-t border-slate-800/80 pt-2">
          <span>Thresholds:</span>
          <span className="text-slate-300">&lt;30 Bull / &gt;70 Bear</span>
        </div>
      </div>

      {/* 4. Moving Average Trend Signal */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-semibold uppercase tracking-wider">MA Signal & Volume</span>
          <BarChart3 className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-lg font-bold font-mono text-white tracking-tight">
            {maStatus.badge}
          </span>
          <span className={`text-[11px] font-mono ${maStatus.color}`}>
            {latest?.smaFast ? 'Active' : 'Calculating'}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex justify-between font-mono border-t border-slate-800/80 pt-2">
          <span>Est. 24h Vol:</span>
          <span className="text-slate-300">${(asset.volume24h / 1000000).toFixed(2)}M</span>
        </div>
      </div>
    </div>
  );
};

