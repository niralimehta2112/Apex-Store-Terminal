import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MarketAsset,
  MarketDataPoint,
  IndicatorSettings,
  TimeRange,
  PatternFilterSettings,
  CandlestickPattern,
  ChartDisplayMode,
  MultiAssetSeriesConfig,
  MultiAssetMode,
  StrategyRule,
  StrategySignal
} from '../../types';
import { INITIAL_ASSETS } from '../../data/mockAssets';
import {
  generateInitialMarketData,
  generateNextTick,
  recalculateDataset
} from '../../utils/financialCalculations';
import {
  generateSynchronizedMultiAssetHistory,
  generateSynchronizedNextTick
} from '../../utils/multiAssetCalculations';
import { runBacktestSimulation } from '../../utils/strategyEngine';
import { MetricsOverview } from './MetricsOverview';
import { IndicatorControls } from './IndicatorControls';
import { InteractiveFinancialChart } from './InteractiveFinancialChart';
import { RsiOscillatorChart } from './RsiOscillatorChart';
import { VolatilityTrendAnalysis } from './VolatilityTrendAnalysis';
import { PatternScannerPanel } from './PatternScannerPanel';
import { MultiAssetChart } from './MultiAssetChart';
import { CorrelationMatrixPanel } from './CorrelationMatrixPanel';
import { LineChart, Layers, Download, Check, GitCompare, Activity, Sliders, Zap } from 'lucide-react';

interface MarketDashboardProps {
  strategies?: StrategyRule[];
  onNavigateToStrategies?: () => void;
}

export const MarketDashboard: React.FC<MarketDashboardProps> = ({
  strategies,
  onNavigateToStrategies,
}) => {
  const [assets] = useState<MarketAsset[]>(INITIAL_ASSETS);
  const [analyticsViewMode, setAnalyticsViewMode] = useState<'single' | 'multi'>('multi');

  // Single Asset State
  const [selectedAssetId, setSelectedAssetId] = useState<string>('nvst');
  const [timeRange, setTimeRange] = useState<TimeRange>('24H');
  const [chartMode, setChartMode] = useState<ChartDisplayMode>('candles');
  const [isLive, setIsLive] = useState<boolean>(true);
  const [tickIntervalMs, setTickIntervalMs] = useState<number>(1500);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Technical Indicator Settings (Requirement #6 & #4)
  const [indicatorSettings, setIndicatorSettings] = useState<IndicatorSettings>({
    showSMAFast: true,
    showSMASlow: true,
    showEMA: true,
    showBollinger: true,
    showVolatility: true,
    showRSI: true,
    showVolume: true,
    showPatterns: true,
    smaFastPeriod: 7,
    smaSlowPeriod: 21,
    emaPeriod: 14,
    rsiPeriod: 14,
    bollingerPeriod: 20,
    bollingerStdDev: 2,
  });

  // Candlestick Pattern Filter Settings (Requirement #4)
  const [patternFilters, setPatternFilters] = useState<PatternFilterSettings>({
    enabled: true,
    selectedBias: 'ALL',
    selectedTypes: [],
  });

  const [selectedPattern, setSelectedPattern] = useState<CandlestickPattern | null>(null);

  // Multi-Asset State (Requirement #3)
  const [multiAssetMode, setMultiAssetMode] = useState<MultiAssetMode>('percent');
  const [seriesConfigs, setSeriesConfigs] = useState<Record<string, MultiAssetSeriesConfig>>(() => {
    const configs: Record<string, MultiAssetSeriesConfig> = {};
    INITIAL_ASSETS.forEach((a, idx) => {
      configs[a.id] = {
        assetId: a.id,
        visible: idx < 5, // Show first 5 by default
        chartType: idx === 0 ? 'candlestick' : idx === 1 ? 'area' : 'line',
        color: a.color || '#6366f1',
      };
    });
    return configs;
  });

  // Synchronized multi-asset datasets
  const [multiAssetDatasets, setMultiAssetDatasets] = useState<Record<string, MarketDataPoint[]>>(() => {
    return generateSynchronizedMultiAssetHistory(INITIAL_ASSETS, timeRange, 65);
  });

  const currentAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];

  // Raw ticks data for single asset
  const [rawData, setRawData] = useState<MarketDataPoint[]>(() => {
    return generateInitialMarketData(currentAsset, timeRange, 60);
  });

  // Re-generate historical baseline when single asset or timeRange changes
  useEffect(() => {
    const fresh = generateInitialMarketData(currentAsset, timeRange, 65);
    setRawData(fresh);
    setSelectedPattern(null);

    // Also update multi-asset synchronized history
    const multiFresh = generateSynchronizedMultiAssetHistory(assets, timeRange, 65);
    setMultiAssetDatasets(multiFresh);
  }, [selectedAssetId, timeRange]);

  // Real-time dynamic tick streaming for single asset and multi-assets simultaneously
  useEffect(() => {
    if (!isLive) return;

    const timer = setInterval(() => {
      // 1. Update single asset
      setRawData((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const nextPoint = generateNextTick(last, currentAsset);
        const windowSize = 70;
        return [...prev.slice(prev.length >= windowSize ? 1 : 0), nextPoint];
      });

      // 2. Update synchronized multi-asset datasets
      setMultiAssetDatasets((prevMap) => {
        return generateSynchronizedNextTick(prevMap, assets);
      });
    }, tickIntervalMs);

    return () => clearInterval(timer);
  }, [isLive, tickIntervalMs, currentAsset, assets]);

  // Injects stochastic price shock to observe indicator & pattern reaction
  const handleTriggerShock = useCallback(() => {
    setRawData((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const direction = Math.random() > 0.5 ? 1 : -1;
      const shockPct = direction * (0.045 + Math.random() * 0.035);
      const shockedClose = Math.max(1, last.close * (1 + shockPct));
      const shockedPoint: MarketDataPoint = {
        ...last,
        id: last.id + 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timestampMs: Date.now(),
        open: last.close,
        close: parseFloat(shockedClose.toFixed(2)),
        high: Math.max(last.close, shockedClose) * 1.015,
        low: Math.min(last.close, shockedClose) * 0.985,
        volume: Math.round(last.volume * 3.5),
      };
      return [...prev.slice(1), shockedPoint];
    });

    // Also shock multi-asset datasets
    setMultiAssetDatasets((prev) => {
      const shockedMap: Record<string, MarketDataPoint[]> = {};
      Object.entries(prev).forEach(([key, list]) => {
        if (list.length === 0) return;
        const last = list[list.length - 1];
        const dir = Math.random() > 0.5 ? 1 : -1;
        const shock = dir * (0.03 + Math.random() * 0.04);
        const newClose = Math.max(0.1, last.close * (1 + shock));
        const newPoint = { ...last, close: parseFloat(newClose.toFixed(2)) };
        shockedMap[key] = [...list.slice(1), newPoint];
      });
      return shockedMap;
    });
  }, []);

  const handleResetData = () => {
    const fresh = generateInitialMarketData(currentAsset, timeRange, 65);
    setRawData(fresh);
    setSelectedPattern(null);
    setMultiAssetDatasets(generateSynchronizedMultiAssetHistory(assets, timeRange, 65));
  };

  const handleUpdateSettings = (newSettings: Partial<IndicatorSettings>) => {
    setIndicatorSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleUpdatePatternFilters = (newFilters: Partial<PatternFilterSettings>) => {
    setPatternFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleUpdateSeriesConfig = (assetId: string, updates: Partial<MultiAssetSeriesConfig>) => {
    setSeriesConfigs((prev) => ({
      ...prev,
      [assetId]: { ...prev[assetId], ...updates },
    }));
  };

  // Recalculate indicators & detected candlestick patterns
  const computedData = recalculateDataset(rawData, indicatorSettings, patternFilters);

  // Custom Strategy Signals for the currently active asset (Requirement #1)
  const activeAssetSignals = useMemo<StrategySignal[]>(() => {
    if (!strategies || strategies.length === 0) return [];
    const matching = strategies.filter((s) => s.enabled && s.assetId === currentAsset.id);
    const allSigs: StrategySignal[] = [];
    matching.forEach((strat) => {
      const res = runBacktestSimulation(strat, computedData, currentAsset);
      allSigs.push(...res.signals);
    });
    return allSigs;
  }, [strategies, currentAsset, computedData]);

  // Collect all currently identified patterns in dataset
  const allDetectedPatterns = computedData
    .map((d) => d.detectedPattern)
    .filter((p): p is CandlestickPattern => !!p);

  const handleExportData = () => {
    const exportPayload = analyticsViewMode === 'multi-asset' ? multiAssetDatasets : computedData;
    const jsonStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apex_${analyticsViewMode}_data_${Date.now()}.json`;
    link.click();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const visibleMultiAssetIds = assets.filter((a) => seriesConfigs[a.id]?.visible !== false).map((a) => a.id);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Institutional Market Terminal
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Dynamic Live Data Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <LineChart className="w-8 h-8 text-indigo-400" />
              Advanced Financial Analytics &amp; Comparative Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Real-time multi-asset overlays (Stocks, Sovereign Bonds, Cryptocurrencies, Commodities), automated Candlestick Pattern Recognition, and statistical indicator telemetry.
            </p>
          </div>

          {/* Sub-view switcher & Export */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
              <button
                onClick={() => setAnalyticsViewMode('multi')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
                  analyticsViewMode === 'multi'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GitCompare className="w-4 h-4 text-cyan-400" />
                <span>Multi-Asset Overlay</span>
              </button>

              <button
                onClick={() => setAnalyticsViewMode('single')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
                  analyticsViewMode === 'single'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4 text-indigo-400" />
                <span>Single Asset Deep Dive</span>
              </button>
            </div>

            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-md"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-slate-300" />}
              <span>{isCopied ? 'Exported' : 'Export Data'}</span>
            </button>
          </div>
        </div>

        {/* Dataset Switcher Pills (When Single Asset is Active) */}
        {analyticsViewMode === 'single' && (
          <div className="mt-6 border-t border-slate-800/80 pt-5 animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Select Active Focus Asset:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {assets.map((asset) => {
                const isSelected = asset.id === selectedAssetId;
                return (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={`text-left p-2.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500/70 shadow-md ring-1 ring-indigo-500/40'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white">{asset.symbol}</span>
                      <span className={`text-[10px] font-mono ${asset.change24hPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {asset.change24hPct >= 0 ? '+' : ''}{asset.change24hPct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{asset.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          VIEW 1: MULTI-ASSET COMPARATIVE CHART & CORRELATION MATRIX (Requirement #3)
         ========================================================================= */}
      {analyticsViewMode === 'multi' && (
        <div className="space-y-6 animate-fade-in">
          {/* Multi-Asset Comparison Chart Component */}
          <MultiAssetChart
            assets={assets}
            datasets={multiAssetDatasets}
            seriesConfigs={seriesConfigs}
            onUpdateConfig={handleUpdateSeriesConfig}
            mode={multiAssetMode}
            onChangeMode={setMultiAssetMode}
          />

          {/* Real-Time Pairwise Correlation Matrix & Relative Strength Leaderboard */}
          <CorrelationMatrixPanel
            assets={assets}
            datasets={multiAssetDatasets}
            visibleAssetIds={visibleMultiAssetIds}
          />
        </div>
      )}

      {/* =========================================================================
          VIEW 2: SINGLE ASSET TECHNICAL INDICATORS & PATTERNS (Requirements #4 & #6)
         ========================================================================= */}
      {analyticsViewMode === 'single' && (
        <div className="space-y-6 animate-fade-in">
          {/* Metrics Overview KPIs */}
          <MetricsOverview asset={currentAsset} data={computedData} />

          {/* Indicator Controls & Customization */}
          <IndicatorControls
            settings={indicatorSettings}
            onUpdateSettings={handleUpdateSettings}
            timeRange={timeRange}
            onChangeTimeRange={setTimeRange}
            isLive={isLive}
            onToggleLive={() => setIsLive(!isLive)}
            onResetData={handleResetData}
            onTriggerShock={handleTriggerShock}
            tickIntervalMs={tickIntervalMs}
            onChangeInterval={setTickIntervalMs}
          />

          {/* Candlestick Pattern Recognition & Scanner Panel (Requirement #4) */}
          <PatternScannerPanel
            patterns={allDetectedPatterns}
            filterSettings={patternFilters}
            onUpdateFilters={handleUpdatePatternFilters}
            onSelectPattern={(pat) => setSelectedPattern(pat)}
          />

          {/* Active Algorithmic Rule Notification (Requirement #1) */}
          {strategies && strategies.some((s) => s.assetId === currentAsset.id && s.enabled) && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-slate-900 border border-purple-500/30 text-xs">
              <div className="flex items-center gap-2.5 text-purple-200">
                <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300">
                  <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                </span>
                <span>
                  Algorithmic Strategy Active: <strong>{strategies.find((s) => s.assetId === currentAsset.id && s.enabled)?.name}</strong> — {activeAssetSignals.length} signals generated on this series.
                </span>
              </div>
              {onNavigateToStrategies && (
                <button
                  onClick={onNavigateToStrategies}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 transition-all font-semibold"
                >
                  <Sliders className="w-3.5 h-3.5 text-purple-300" />
                  <span>Configure in Strategy Studio</span>
                  <span>→</span>
                </button>
              )}
            </div>
          )}

          {/* Main Interactive Chart (Japanese Candlesticks + Pattern Markers + Overlays + Strategy Signals) */}
          <InteractiveFinancialChart
            data={computedData}
            settings={indicatorSettings}
            unit={currentAsset.unit}
            chartMode={chartMode}
            onChangeChartMode={setChartMode}
            selectedPatternId={selectedPattern?.id}
            onSelectPattern={setSelectedPattern}
            strategySignals={activeAssetSignals}
          />

          {/* RSI Oscillator Sub-Chart */}
          {indicatorSettings.showRSI && (
            <RsiOscillatorChart
              data={computedData}
              period={indicatorSettings.rsiPeriod}
            />
          )}

          {/* Volatility & Quantitative Trend Analysis */}
          <VolatilityTrendAnalysis
            data={computedData}
            assetName={currentAsset.name}
          />
        </div>
      )}
    </div>
  );
};
