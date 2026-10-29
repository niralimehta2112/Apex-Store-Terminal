import React, { useMemo } from 'react';
import { MarketAsset, MarketDataPoint } from '../../types';
import { calculateCorrelationMatrix } from '../../utils/multiAssetCalculations';
import { GitCompare, Trophy, Shield, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CorrelationMatrixPanelProps {
  assets: MarketAsset[];
  datasets: Record<string, MarketDataPoint[]>;
  visibleAssetIds: string[];
}

export const CorrelationMatrixPanel: React.FC<CorrelationMatrixPanelProps> = ({
  assets,
  datasets,
  visibleAssetIds,
}) => {
  const activeAssets = useMemo(() => {
    return assets.filter((a) => visibleAssetIds.includes(a.id));
  }, [assets, visibleAssetIds]);

  const activeIds = useMemo(() => activeAssets.map((a) => a.id), [activeAssets]);

  // Compute correlation matrix in real time
  const matrix = useMemo(() => {
    return calculateCorrelationMatrix(datasets, activeIds);
  }, [datasets, activeIds]);

  // Compute total return for leaderboard
  const performanceLeaderboard = useMemo(() => {
    return activeAssets
      .map((asset) => {
        const data = datasets[asset.id] || [];
        if (data.length < 2) return { asset, returnPct: 0, currentPrice: asset.currentPrice };
        const start = data[0].close || 1;
        const latest = data[data.length - 1].close;
        const returnPct = ((latest - start) / start) * 100;
        return { asset, returnPct, currentPrice: latest };
      })
      .sort((a, b) => b.returnPct - a.returnPct);
  }, [activeAssets, datasets]);

  // Average correlation across non-identical pairs
  const avgCorrelation = useMemo(() => {
    let sum = 0;
    let count = 0;
    activeIds.forEach((idA) => {
      activeIds.forEach((idB) => {
        if (idA !== idB && matrix[idA] && matrix[idA][idB] !== undefined) {
          sum += matrix[idA][idB];
          count++;
        }
      });
    });
    return count > 0 ? sum / count : 0.35;
  }, [matrix, activeIds]);

  // Diversification Rating
  let diversificationRating = { label: 'High Diversification', color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' };
  if (avgCorrelation > 0.65) {
    diversificationRating = { label: 'Concentrated / High Correlation', color: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300' };
  } else if (avgCorrelation > 0.35) {
    diversificationRating = { label: 'Moderate Diversification', color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' };
  }

  const getCorrelationColor = (r: number) => {
    if (r >= 0.7) return 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300';
    if (r >= 0.3) return 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300';
    if (r > -0.3) return 'bg-slate-900 border-slate-800 text-slate-300';
    if (r > -0.7) return 'bg-amber-950/70 border-amber-500/40 text-amber-300';
    return 'bg-rose-950/70 border-rose-500/50 text-rose-300';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Pairwise Correlation Matrix (7 cols) */}
      <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <GitCompare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Pairwise Pearson Correlation Matrix (r)</h3>
                <p className="text-xs text-slate-400">Statistical co-movement &amp; hedging relationships</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="text-slate-500">Avg r:</span>
              <span className={`font-bold ${diversificationRating.color}`}>
                {avgCorrelation.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Matrix Grid */}
          {activeAssets.length < 2 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              Select at least 2 active assets above to calculate pairwise correlation.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-mono">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-slate-500 text-[11px]">Asset</th>
                    {activeAssets.map((asset) => (
                      <th key={asset.id} className="p-2 text-slate-300 text-[11px]">
                        <span className="font-bold block">{asset.symbol}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activeAssets.map((rowAsset) => (
                    <tr key={rowAsset.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="p-2 text-left font-bold text-slate-200 text-xs flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: rowAsset.color || '#6366f1' }}
                        />
                        <span>{rowAsset.symbol}</span>
                      </td>

                      {activeAssets.map((colAsset) => {
                        const r = matrix[rowAsset.id]?.[colAsset.id] ?? 0;
                        const isSelf = rowAsset.id === colAsset.id;

                        return (
                          <td key={colAsset.id} className="p-1.5">
                            <div
                              className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold ${
                                isSelf
                                  ? 'bg-slate-800/50 border-slate-700/50 text-slate-400'
                                  : getCorrelationColor(r)
                              }`}
                              title={`${rowAsset.symbol} vs ${colAsset.symbol}: r = ${r.toFixed(2)}`}
                            >
                              {r.toFixed(2)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Matrix Legend Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Positive (&gt;0.5)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" /> Uncorrelated (~0.0)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Inverse / Hedge (&lt;-0.3)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Diversification Status: <strong className={diversificationRating.color}>{diversificationRating.label}</strong></span>
          </div>
        </div>
      </div>

      {/* Relative Performance Leaderboard (5 cols) */}
      <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Relative Strength Leaderboard</h3>
                <p className="text-xs text-slate-400">Ranked by performance return from baseline</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Live Period</span>
          </div>

          {/* Leaderboard list */}
          <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
            {performanceLeaderboard.map((item, index) => {
              const isFirst = index === 0;
              const isPositive = item.returnPct >= 0;

              return (
                <div
                  key={item.asset.id}
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                    isFirst
                      ? 'bg-gradient-to-r from-amber-950/30 to-slate-950/70 border-amber-500/40 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono font-bold text-[11px] ${
                      isFirst
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      #{index + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white font-mono">{item.asset.symbol}</span>
                        {item.asset.assetClass && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-sans">
                            {item.asset.assetClass}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px] block">
                        {item.asset.name}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-mono font-bold text-sm flex items-center justify-end gap-0.5 ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      <span>{isPositive ? '+' : ''}{item.returnPct.toFixed(2)}%</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      ${item.currentPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-400" />
          <span>Assets with low or negative correlation offer defensive balance, reducing total portfolio drawdown during volatility shocks.</span>
        </div>
      </div>
    </div>
  );
};

