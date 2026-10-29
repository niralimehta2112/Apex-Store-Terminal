import React, { useState } from 'react';
import { CandlestickPattern, PatternFilterSettings } from '../../types';
import { PATTERN_DEFINITIONS } from '../../utils/candlestickDetector';
import { Sparkles, Filter, BookOpen, ChevronRight, X, Eye, EyeOff, Check } from 'lucide-react';

interface PatternScannerPanelProps {
  patterns: CandlestickPattern[];
  filterSettings: PatternFilterSettings;
  onUpdateFilters: (newFilters: Partial<PatternFilterSettings>) => void;
  onSelectPattern: (pattern: CandlestickPattern) => void;
}

export const PatternScannerPanel: React.FC<PatternScannerPanelProps> = ({
  patterns,
  filterSettings,
  onUpdateFilters,
  onSelectPattern,
}) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const availablePatternTypes = Object.entries(PATTERN_DEFINITIONS);

  const handleToggleType = (typeKey: string) => {
    const currentTypes = filterSettings.selectedTypes;
    if (currentTypes.includes(typeKey)) {
      onUpdateFilters({ selectedTypes: currentTypes.filter((t) => t !== typeKey) });
    } else {
      onUpdateFilters({ selectedTypes: [...currentTypes, typeKey] });
    }
  };

  const handleClearTypeFilters = () => {
    onUpdateFilters({ selectedTypes: [] });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Panel Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Candlestick Pattern Recognition Engine</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300">
                Live Scanner
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Automated detection of reversals, continuations, and indecision patterns
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Recognition ON/OFF */}
          <button
            onClick={() => onUpdateFilters({ enabled: !filterSettings.enabled })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterSettings.enabled
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-950/60 border-slate-800 text-slate-500'
            }`}
          >
            {filterSettings.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{filterSettings.enabled ? 'Detection Active' : 'Detection Muted'}</span>
          </button>

          {/* Educational Guide Modal Trigger */}
          <button
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Pattern Cheatsheet</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Bias Pills & Specific Types */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Bias Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
            {(['ALL', 'BULLISH', 'BEARISH', 'NEUTRAL'] as const).map((bias) => (
              <button
                key={bias}
                onClick={() => onUpdateFilters({ selectedBias: bias })}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filterSettings.selectedBias === bias
                    ? bias === 'BULLISH'
                      ? 'bg-emerald-600 text-white'
                      : bias === 'BEARISH'
                      ? 'bg-rose-600 text-white'
                      : bias === 'NEUTRAL'
                      ? 'bg-amber-600 text-white'
                      : 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {bias}
              </button>
            ))}
          </div>

          {filterSettings.selectedTypes.length > 0 && (
            <button
              onClick={handleClearTypeFilters}
              className="text-[11px] text-indigo-400 hover:underline"
            >
              Reset type filters ({filterSettings.selectedTypes.length} active)
            </button>
          )}
        </div>

        {/* Pattern Quick-Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {availablePatternTypes.map(([key, def]) => {
            const isSelected = filterSettings.selectedTypes.includes(key);
            return (
              <button
                key={key}
                onClick={() => handleToggleType(key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{def.name}</span>
                {isSelected && <Check className="w-3 h-3 inline ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Detected Patterns Feed (Horizontal Carousel or Grid) */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            Spotted Patterns in View ({patterns.length})
          </span>
          <span className="text-[11px] text-slate-500">
            Click any pattern to inspect anatomy and trading tactics
          </span>
        </div>

        {patterns.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800">
            No candlestick patterns match current filter criteria. Try selecting "ALL" bias or resetting type filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 max-h-[190px] overflow-y-auto pr-1">
            {patterns.slice(-8).reverse().map((pattern) => {
              const isBull = pattern.bias === 'Bullish';
              const isBear = pattern.bias === 'Bearish';

              return (
                <div
                  key={pattern.id}
                  onClick={() => onSelectPattern(pattern)}
                  className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-850 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: pattern.color }}
                      />
                      <span className="font-bold text-white text-xs font-mono">{pattern.shortCode}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        isBull
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : isBear
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {pattern.bias}
                      </span>
                    </div>
                    <span className="text-xs text-slate-200 block font-medium truncate max-w-[140px]">
                      {pattern.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      ${pattern.price.toFixed(2)} • {pattern.timestamp}
                    </span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Educational Cheatsheet Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl my-8 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-white text-base">Japanese Candlestick Pattern Cheatsheet</h3>
                  <p className="text-xs text-slate-400">Professional visual guide to price action formations</p>
                </div>
              </div>
              <button
                onClick={() => setIsGuideOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-3 flex-1 pr-1">
              {availablePatternTypes.map(([key, def]) => (
                <div
                  key={key}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: def.color }}
                      />
                      <h4 className="font-bold text-white text-sm">{def.name}</h4>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {def.shortCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${def.color}25`, color: def.color }}
                      >
                        {def.bias} Reversal
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        Reliability: {def.reliability}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Anatomy:</strong> {def.description}
                  </p>

                  <p className="text-xs text-indigo-300 bg-indigo-950/30 p-2.5 rounded-xl border border-indigo-500/20 leading-relaxed">
                    <strong>Market Implications:</strong> {def.implication}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsGuideOpen(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Back to Trading Chart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

