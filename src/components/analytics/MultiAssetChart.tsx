import React, { useState, useRef, useMemo } from 'react';
import {
  MarketAsset,
  MarketDataPoint,
  MultiAssetSeriesConfig,
  MultiAssetMode,
  MultiAssetChartType
} from '../../types';
import { calculateNormalizedSeries } from '../../utils/multiAssetCalculations';
import { Eye, EyeOff, SlidersHorizontal, Percent, DollarSign, Layers } from 'lucide-react';

interface MultiAssetChartProps {
  assets: MarketAsset[];
  datasets: Record<string, MarketDataPoint[]>;
  seriesConfigs: Record<string, MultiAssetSeriesConfig>;
  onUpdateConfig: (assetId: string, updates: Partial<MultiAssetSeriesConfig>) => void;
  mode: MultiAssetMode;
  onChangeMode: (mode: MultiAssetMode) => void;
}

export const MultiAssetChart: React.FC<MultiAssetChartProps> = ({
  assets,
  datasets,
  seriesConfigs,
  onUpdateConfig,
  mode,
  onChangeMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // SVG dimensions
  const width = 1000;
  const height = 480;
  const padding = { top: 35, right: 75, bottom: 45, left: 25 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Active visible assets
  const visibleAssets = useMemo(() => {
    return assets.filter((a) => seriesConfigs[a.id]?.visible !== false);
  }, [assets, seriesConfigs]);

  // Normalized data cache
  const normalizedDataMap = useMemo(() => {
    const map: Record<string, { point: MarketDataPoint; pctReturn: number }[]> = {};
    assets.forEach((asset) => {
      const data = datasets[asset.id] || [];
      map[asset.id] = calculateNormalizedSeries(data);
    });
    return map;
  }, [assets, datasets]);

  // Reference points count
  const firstVisibleAsset = visibleAssets[0] || assets[0];
  const referenceData = datasets[firstVisibleAsset?.id] || [];
  const pointsCount = referenceData.length;

  // Compute Bounds (Min and Max)
  const { minVal, maxVal } = useMemo(() => {
    if (visibleAssets.length === 0 || pointsCount === 0) {
      return { minVal: -5, maxVal: 5 };
    }

    let min = Infinity;
    let max = -Infinity;

    if (mode === 'percent') {
      visibleAssets.forEach((asset) => {
        const series = normalizedDataMap[asset.id] || [];
        series.forEach((s) => {
          if (s.pctReturn < min) min = s.pctReturn;
          if (s.pctReturn > max) max = s.pctReturn;
        });
      });

      // Always include 0% in range
      if (min > 0) min = 0;
      if (max < 0) max = 0;

      const spread = max - min || 1;
      const paddedMin = min - spread * 0.12;
      const paddedMax = max + spread * 0.12;
      return { minVal: paddedMin, maxVal: paddedMax };
    } else {
      // In absolute price mode, scale normalized to 0-100 index for overlay
      return { minVal: 0, maxVal: 100 };
    }
  }, [visibleAssets, pointsCount, mode, normalizedDataMap]);

  // Coordinate Conversion Helpers
  const getX = (index: number) => {
    if (pointsCount <= 1) return padding.left;
    return padding.left + (index / (pointsCount - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    return padding.top + chartHeight - ((val - minVal) / range) * chartHeight;
  };

  const yZero = getY(0);

  // Mouse tracking
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || pointsCount === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * width;

    if (relativeX < padding.left || relativeX > width - padding.right) {
      setHoverIndex(null);
      return;
    }

    const ratio = (relativeX - padding.left) / chartWidth;
    const index = Math.round(ratio * (pointsCount - 1));
    const clamped = Math.max(0, Math.min(pointsCount - 1, index));
    setHoverIndex(clamped);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Y-axis grid levels (5 intervals)
  const gridLevels = useMemo(() => {
    const levels = [];
    const count = 5;
    for (let i = 0; i <= count; i++) {
      const val = minVal + (i / count) * (maxVal - minVal);
      const y = getY(val);
      levels.push({ val, y });
    }
    return levels;
  }, [minVal, maxVal]);

  // X-axis time labels
  const timeLabels = useMemo(() => {
    if (referenceData.length === 0) return [];
    const step = Math.max(1, Math.floor(referenceData.length / 6));
    const labels = [];
    for (let i = 0; i < referenceData.length; i += step) {
      labels.push({ x: getX(i), text: referenceData[i].timestamp });
    }
    return labels;
  }, [referenceData]);

  const activeIndex = hoverIndex !== null ? hoverIndex : pointsCount - 1;
  const activeX = hoverIndex !== null ? getX(hoverIndex) : null;

  return (
    <div ref={containerRef} className="relative w-full rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-2xl backdrop-blur-md select-none space-y-4">
      {/* Multi-Asset Control Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Comparative Analysis
            </span>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Synchronized Multi-Stream
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Multi-Asset Cross-Class Overlay Chart
          </h2>
          <p className="text-xs text-slate-400">
            Compare relative performance across Stocks, Sovereign Bonds, Cryptocurrencies, and Commodities on a normalized timeline.
          </p>
        </div>

        {/* Mode Selector (% Return vs Absolute Price) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => onChangeMode('percent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                mode === 'percent'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>% Relative Return</span>
            </button>
            <button
              onClick={() => onChangeMode('price')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                mode === 'price'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Indexed Prices</span>
            </button>
          </div>
        </div>
      </div>

      {/* Asset Series Visibility & Chart Type Customizer Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Customize Visible Assets &amp; Chart Styles</span>
          </span>
          <span className="text-slate-500 text-[11px]">
            {visibleAssets.length} of {assets.length} assets active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {assets.map((asset) => {
            const config = seriesConfigs[asset.id] || {
              assetId: asset.id,
              visible: true,
              chartType: 'line',
              color: asset.color || '#6366f1',
            };
            const isVisible = config.visible !== false;

            return (
              <div
                key={asset.id}
                className={`p-2.5 rounded-2xl border text-xs transition-all ${
                  isVisible
                    ? 'bg-slate-950/70 border-slate-800 shadow-sm'
                    : 'bg-slate-950/30 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  {/* Asset info & Toggle Visibility */}
                  <div
                    onClick={() => onUpdateConfig(asset.id, { visible: !isVisible })}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm transition-transform hover:scale-125"
                      style={{ backgroundColor: config.color }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white font-mono">{asset.symbol}</span>
                        {asset.assetClass && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-sans">
                            {asset.assetClass}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px] block">
                        {asset.name}
                      </span>
                    </div>
                  </div>

                  {/* Eye toggle button */}
                  <button
                    onClick={() => onUpdateConfig(asset.id, { visible: !isVisible })}
                    className={`p-1 rounded-lg border transition-colors ${
                      isVisible
                        ? 'bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-slate-900 text-slate-600 border-slate-800'
                    }`}
                    title={isVisible ? 'Hide asset' : 'Show asset'}
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Per-Asset Chart Type Selector (Line, Area, Bar, Candle) */}
                {isVisible && (
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-mono">Style:</span>
                    <div className="flex items-center gap-1">
                      {(['line', 'area', 'bar', 'candlestick'] as MultiAssetChartType[]).map((type) => (
                        <button
                          key={type}
                          onClick={() => onUpdateConfig(asset.id, { chartType: type })}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono capitalize transition-colors ${
                            config.chartType === type
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'text-slate-400 hover:text-white bg-slate-900'
                          }`}
                        >
                          {type === 'candlestick' ? 'candle' : type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Asset SVG Canvas */}
      <div className="w-full relative aspect-[16/7.5] min-h-[360px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Grid lines */}
          {gridLevels.map((g, idx) => (
            <g key={idx}>
              <line
                x1={padding.left}
                y1={g.y}
                x2={width - padding.right}
                y2={g.y}
                stroke="#1e293b"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={width - padding.right + 8}
                y={g.y + 4}
                fill="#64748b"
                fontSize="11"
                fontFamily="monospace"
                textAnchor="start"
              >
                {mode === 'percent'
                  ? `${g.val >= 0 ? '+' : ''}${g.val.toFixed(1)}%`
                  : g.val.toFixed(0)}
              </text>
            </g>
          ))}

          {/* 0% Baseline Guideline */}
          {mode === 'percent' && yZero >= padding.top && yZero <= padding.top + chartHeight && (
            <g>
              <line
                x1={padding.left}
                y1={yZero}
                x2={width - padding.right}
                y2={yZero}
                stroke="#475569"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <text
                x={width - padding.right + 8}
                y={yZero + 4}
                fill="#94a3b8"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
              >
                0.0%
              </text>
            </g>
          )}

          {/* Time Labels */}
          {timeLabels.map((lbl, idx) => (
            <text
              key={idx}
              x={lbl.x}
              y={height - padding.bottom + 22}
              fill="#64748b"
              fontSize="11"
              fontFamily="sans-serif"
              textAnchor="middle"
            >
              {lbl.text}
            </text>
          ))}

          {/* Render Each Visible Asset Series */}
          {visibleAssets.map((asset) => {
            const config = seriesConfigs[asset.id] || {
              assetId: asset.id,
              visible: true,
              chartType: 'line',
              color: asset.color || '#6366f1',
            };
            const series = normalizedDataMap[asset.id] || [];
            if (series.length === 0) return null;

            const chartType = config.chartType;

            // Compute Coordinates
            const pointsCoords = series.map((s, idx) => {
              const x = getX(idx);
              let y = yZero;

              if (mode === 'percent') {
                y = getY(s.pctReturn);
              } else {
                // Absolute normalized index
                const rawCloses = series.map((p) => p.point.close);
                const assetMin = Math.min(...rawCloses);
                const assetMax = Math.max(...rawCloses);
                const normalizedVal = ((s.point.close - assetMin) / (assetMax - assetMin || 1)) * 100;
                y = getY(normalizedVal);
              }
              return { x, y, raw: s };
            });

            const pathD = pointsCoords
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
              .join(' ');

            return (
              <g key={`asset-series-${asset.id}`}>
                {/* 1. Area Style */}
                {chartType === 'area' && (
                  <path
                    d={`${pathD} L ${getX(pointsCoords.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`}
                    fill={config.color}
                    fillOpacity="0.12"
                  />
                )}

                {/* 2. Bar Style */}
                {chartType === 'bar' &&
                  pointsCoords.map((p, idx) => {
                    const barWidth = Math.max(2, (chartWidth / pointsCount) * 0.45);
                    const barTop = Math.min(yZero, p.y);
                    const barHeight = Math.max(2, Math.abs(p.y - yZero));
                    return (
                      <rect
                        key={`bar-${idx}`}
                        x={p.x - barWidth / 2}
                        y={barTop}
                        width={barWidth}
                        height={barHeight}
                        fill={config.color}
                        opacity="0.75"
                        rx="1"
                      />
                    );
                  })}

                {/* 3. Candlestick Style */}
                {chartType === 'candlestick' &&
                  series.map((s, idx) => {
                    const x = getX(idx);
                    const basePrice = series[0].point.close || 1;
                    const openPct = ((s.point.open - basePrice) / basePrice) * 100;
                    const closePct = ((s.point.close - basePrice) / basePrice) * 100;
                    const highPct = ((s.point.high - basePrice) / basePrice) * 100;
                    const lowPct = ((s.point.low - basePrice) / basePrice) * 100;

                    const yH = getY(highPct);
                    const yL = getY(lowPct);
                    const yO = getY(openPct);
                    const yC = getY(closePct);

                    const top = Math.min(yO, yC);
                    const h = Math.max(2, Math.abs(yC - yO));
                    const isGreen = s.point.close >= s.point.open;

                    return (
                      <g key={`candle-${idx}`}>
                        <line x1={x} y1={yH} x2={x} y2={yL} stroke={config.color} strokeWidth="1" />
                        <rect
                          x={x - 2.5}
                          y={top}
                          width="5"
                          height={h}
                          fill={isGreen ? config.color : '#0f172a'}
                          stroke={config.color}
                          strokeWidth="1"
                          rx="0.5"
                        />
                      </g>
                    );
                  })}

                {/* Line Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={config.color}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.95"
                />

                {/* Latest Price / Percent Marker Pill at End of Line */}
                {pointsCoords.length > 0 && (
                  <g transform={`translate(${width - padding.right + 4}, ${pointsCoords[pointsCoords.length - 1].y - 9})`}>
                    <rect
                      width="66"
                      height="18"
                      rx="4"
                      fill={config.color}
                      className="shadow-md"
                    />
                    <text
                      x="33"
                      y="13"
                      fill="#ffffff"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {mode === 'percent'
                        ? `${series[series.length - 1].pctReturn >= 0 ? '+' : ''}${series[series.length - 1].pctReturn.toFixed(1)}%`
                        : `$${series[series.length - 1].point.close.toFixed(1)}`}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Synchronized Crosshair Tracking Line */}
          {activeX !== null && (
            <g className="pointer-events-none">
              <line
                x1={activeX}
                y1={padding.top}
                x2={activeX}
                y2={padding.top + chartHeight}
                stroke="#6366f1"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.8"
              />

              {/* Dots on each visible asset at cursor */}
              {visibleAssets.map((asset) => {
                const config = seriesConfigs[asset.id] || { color: asset.color || '#6366f1' };
                const series = normalizedDataMap[asset.id] || [];
                if (!series[activeIndex]) return null;
                const ret = series[activeIndex].pctReturn;
                const y = getY(ret);

                return (
                  <circle
                    key={`dot-${asset.id}`}
                    cx={activeX}
                    cy={y}
                    r="4"
                    fill="#ffffff"
                    stroke={config.color}
                    strokeWidth="2"
                  />
                );
              })}
            </g>
          )}
        </svg>

        {/* Synchronized Multi-Asset Hover HUD Card */}
        <div className="absolute top-3 left-4 max-w-md bg-slate-950/95 border border-slate-800 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md z-20 space-y-2 pointer-events-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs">
            <span className="font-semibold text-slate-300">
              Comparative Telemetry ({referenceData[activeIndex]?.timestamp})
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Normalized Baseline = 0%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {visibleAssets.map((asset) => {
              const config = seriesConfigs[asset.id] || { color: asset.color || '#6366f1' };
              const series = normalizedDataMap[asset.id] || [];
              const dataPoint = series[activeIndex];
              if (!dataPoint) return null;

              const isPositive = dataPoint.pctReturn >= 0;

              return (
                <div
                  key={`hud-${asset.id}`}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800/80"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                    <span className="font-bold text-white text-[11px]">{asset.symbol}</span>
                  </div>

                  <div className="text-right">
                    <span className={`text-[11px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}{dataPoint.pctReturn.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      ${dataPoint.point.close.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

