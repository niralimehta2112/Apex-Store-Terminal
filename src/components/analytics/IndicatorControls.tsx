import React from 'react';
import { IndicatorSettings, TimeRange } from '../../types';
import { Play, Pause, Zap, RefreshCw, SlidersHorizontal, Eye, Clock } from 'lucide-react';

interface IndicatorControlsProps {
  settings: IndicatorSettings;
  onUpdateSettings: (newSettings: Partial<IndicatorSettings>) => void;
  timeRange: TimeRange;
  onChangeTimeRange: (range: TimeRange) => void;
  isLive: boolean;
  onToggleLive: () => void;
  onResetData: () => void;
  onTriggerShock: () => void;
  tickIntervalMs: number;
  onChangeInterval: (ms: number) => void;
}

export const IndicatorControls: React.FC<IndicatorControlsProps> = ({
  settings,
  onUpdateSettings,
  timeRange,
  onChangeTimeRange,
  isLive,
  onToggleLive,
  onResetData,
  onTriggerShock,
  tickIntervalMs,
  onChangeInterval,
}) => {
  const timeRanges: TimeRange[] = ['15M', '1H', '4H', '24H', '7D', '30D'];

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Top Bar: Time Ranges & Live Simulation Control */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Time Range Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
          {timeRanges.map((tr) => (
            <button
              key={tr}
              onClick={() => onChangeTimeRange(tr)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeRange === tr
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tr}
            </button>
          ))}
        </div>

        {/* Live Simulation Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Play/Pause */}
          <button
            onClick={onToggleLive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              isLive
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
            }`}
          >
            {isLive ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isLive ? 'Live Streaming' : 'Paused'}</span>
            {isLive && (
              <span className="relative flex h-2 w-2 ml-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </button>

          {/* Tick Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-500 text-[11px]">Tick:</span>
            {[
              { label: '0.8s', val: 800 },
              { label: '1.5s', val: 1500 },
              { label: '3s', val: 3000 }
            ].map((speed) => (
              <button
                key={speed.val}
                onClick={() => onChangeInterval(speed.val)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  tickIntervalMs === speed.val
                    ? 'bg-indigo-500/30 text-indigo-300 font-bold'
                    : 'hover:text-white'
                }`}
              >
                {speed.label}
              </button>
            ))}
          </div>

          {/* Market Shock Simulator */}
          <button
            onClick={onTriggerShock}
            title="Inject stochastic price shock to test indicators"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span className="hidden sm:inline">Inject Shock</span>
          </button>

          {/* Reset */}
          <button
            onClick={onResetData}
            title="Regenerate synthetic market history"
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Indicator Selection & Toggle Grid */}
      <div className="border-t border-slate-800/80 pt-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Indicator Overlays & Sub-Panels</span>
          </div>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Eye className="w-3 h-3" /> Click any indicator to toggle
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {/* SMA Fast */}
          <button
            type="button"
            onClick={() => onUpdateSettings({ showSMAFast: !settings.showSMAFast })}
            className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
              settings.showSMAFast
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-950'
                : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${settings.showSMAFast ? 'bg-cyan-400 ring-2 ring-cyan-500/30' : 'bg-slate-600'}`} />
              <div className="text-left">
                <span className="font-semibold block">SMA Fast</span>
                <span className="text-[10px] text-slate-400">Period {settings.smaFastPeriod}</span>
              </div>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${settings.showSMAFast ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'}`}>
              {settings.showSMAFast ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* SMA Slow */}
          <button
            type="button"
            onClick={() => onUpdateSettings({ showSMASlow: !settings.showSMASlow })}
            className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
              settings.showSMASlow
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-950'
                : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${settings.showSMASlow ? 'bg-amber-400 ring-2 ring-amber-500/30' : 'bg-slate-600'}`} />
              <div className="text-left">
                <span className="font-semibold block">SMA Slow</span>
                <span className="text-[10px] text-slate-400">Period {settings.smaSlowPeriod}</span>
              </div>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${settings.showSMASlow ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'}`}>
              {settings.showSMASlow ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* EMA */}
          <button
            type="button"
            onClick={() => onUpdateSettings({ showEMA: !settings.showEMA })}
            className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
              settings.showEMA
                ? 'bg-purple-950/40 border-purple-500/40 text-purple-300 shadow-sm shadow-purple-950'
                : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${settings.showEMA ? 'bg-purple-400 ring-2 ring-purple-500/30' : 'bg-slate-600'}`} />
              <div className="text-left">
                <span className="font-semibold block">EMA Trend</span>
                <span className="text-[10px] text-slate-400">Period {settings.emaPeriod}</span>
              </div>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${settings.showEMA ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-500'}`}>
              {settings.showEMA ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Bollinger Bands */}
          <button
            type="button"
            onClick={() => onUpdateSettings({ showBollinger: !settings.showBollinger })}
            className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
              settings.showBollinger
                ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300 shadow-sm shadow-indigo-950'
                : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${settings.showBollinger ? 'bg-indigo-400 ring-2 ring-indigo-500/30' : 'bg-slate-600'}`} />
              <div className="text-left">
                <span className="font-semibold block">Bollinger</span>
                <span className="text-[10px] text-slate-400">20, 2σ Envelope</span>
              </div>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${settings.showBollinger ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
              {settings.showBollinger ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* RSI Sub-Panel */}
          <button
            type="button"
            onClick={() => onUpdateSettings({ showRSI: !settings.showRSI })}
            className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
              settings.showRSI
                ? 'bg-violet-950/40 border-violet-500/40 text-violet-300 shadow-sm shadow-violet-950'
                : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${settings.showRSI ? 'bg-violet-400 ring-2 ring-violet-500/30' : 'bg-slate-600'}`} />
              <div className="text-left">
                <span className="font-semibold block">RSI Panel</span>
                <span className="text-[10px] text-slate-400">14-Period Osc</span>
              </div>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${settings.showRSI ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-800 text-slate-500'}`}>
              {settings.showRSI ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Volume Bars */}
          <button
            type="button"
            onClick={() => onUpdateSettings({ showVolume: !settings.showVolume })}
            className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
              settings.showVolume
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-950'
                : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${settings.showVolume ? 'bg-emerald-400 ring-2 ring-emerald-500/30' : 'bg-slate-600'}`} />
              <div className="text-left">
                <span className="font-semibold block">Volume Bars</span>
                <span className="text-[10px] text-slate-400">Buy / Sell Flow</span>
              </div>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${settings.showVolume ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
              {settings.showVolume ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Candlestick Patterns Recognition Toggle (Requirement #4) */}
          <button
            type="button"
            onClick={() => onUpdateSettings({ showPatterns: !settings.showPatterns })}
            className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
              settings.showPatterns
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 shadow-sm shadow-rose-950'
                : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${settings.showPatterns ? 'bg-rose-400 ring-2 ring-rose-500/30' : 'bg-slate-600'}`} />
              <div className="text-left">
                <span className="font-semibold block">Patterns</span>
                <span className="text-[10px] text-slate-400">Hmr, Doji, Engulf</span>
              </div>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${settings.showPatterns ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-500'}`}>
              {settings.showPatterns ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

