import React, { useState, useRef, useMemo } from 'react';
import { MarketDataPoint, IndicatorSettings, CandlestickPattern, ChartDisplayMode, StrategySignal } from '../../types';
import { CandlestickChart, LineChart as LineChartIcon, Sparkles, X, Info, ChevronRight, Zap } from 'lucide-react';

interface ChartProps {
  data: MarketDataPoint[];
  settings: IndicatorSettings;
  unit?: string;
  chartMode?: ChartDisplayMode;
  onChangeChartMode?: (mode: ChartDisplayMode) => void;
  selectedPatternId?: string | null;
  onSelectPattern?: (pattern: CandlestickPattern | null) => void;
  strategySignals?: StrategySignal[];
}

export const InteractiveFinancialChart: React.FC<ChartProps> = ({
  data,
  settings,
  unit = '$',
  chartMode: controlledMode,
  onChangeChartMode,
  selectedPatternId,
  onSelectPattern,
  strategySignals,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalMode, setInternalMode] = useState<ChartDisplayMode>('candles');
  const chartMode = controlledMode || internalMode;

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [activePatternModal, setActivePatternModal] = useState<CandlestickPattern | null>(null);

  const setChartMode = (mode: ChartDisplayMode) => {
    if (onChangeChartMode) onChangeChartMode(mode);
    else setInternalMode(mode);
  };

  // Chart dimensions
  const width = 1000;
  const height = 470;
  const padding = { top: 35, right: 70, bottom: 45, left: 20 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Extract min and max values considering price and indicators
  const { minVal, maxVal, maxVolume } = useMemo(() => {
    if (data.length === 0) return { minVal: 0, maxVal: 100, maxVolume: 1000 };

    let min = Infinity;
    let max = -Infinity;
    let volMax = 0;

    data.forEach((d) => {
      if (d.low < min) min = d.low;
      if (d.high > max) max = d.high;
      if (d.volume > volMax) volMax = d.volume;

      if (settings.showBollinger) {
        if (d.bollingerUpper !== null && d.bollingerUpper !== undefined && d.bollingerUpper > max) {
          max = d.bollingerUpper;
        }
        if (d.bollingerLower !== null && d.bollingerLower !== undefined && d.bollingerLower < min) {
          min = d.bollingerLower;
        }
      }
      if (settings.showSMAFast && d.smaFast !== null && d.smaFast !== undefined) {
        if (d.smaFast > max) max = d.smaFast;
        if (d.smaFast < min) min = d.smaFast;
      }
      if (settings.showSMASlow && d.smaSlow !== null && d.smaSlow !== undefined) {
        if (d.smaSlow > max) max = d.smaSlow;
        if (d.smaSlow < min) min = d.smaSlow;
      }
      if (settings.showEMA && d.ema !== null && d.ema !== undefined) {
        if (d.ema > max) max = d.ema;
        if (d.ema < min) min = d.ema;
      }
    });

    const range = max - min || 1;
    // Add 10% padding to top and bottom to leave room for pattern badges
    const paddedMin = Math.max(0, min - range * 0.10);
    const paddedMax = max + range * 0.10;

    return { minVal: paddedMin, maxVal: paddedMax, maxVolume: volMax || 1000 };
  }, [data, settings]);

  // Coordinate conversion helpers
  const getX = (index: number) => {
    if (data.length <= 1) return padding.left;
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    return padding.top + chartHeight - ((val - minVal) / range) * chartHeight;
  };

  // Generate SVG paths for line/area mode
  const pricePath = useMemo(() => {
    if (data.length === 0) return '';
    return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.close).toFixed(1)}`).join(' ');
  }, [data, minVal, maxVal]);

  const priceAreaPath = useMemo(() => {
    if (data.length === 0) return '';
    const bottomY = padding.top + chartHeight;
    const linePart = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.close).toFixed(1)}`).join(' ');
    const closePart = ` L ${getX(data.length - 1).toFixed(1)} ${bottomY} L ${getX(0).toFixed(1)} ${bottomY} Z`;
    return linePart + closePart;
  }, [data, minVal, maxVal]);

  const smaFastPath = useMemo(() => {
    if (!settings.showSMAFast) return '';
    const validPoints = data.map((d, i) => ({ val: d.smaFast, idx: i })).filter((p) => p.val !== null && p.val !== undefined);
    if (validPoints.length === 0) return '';
    return validPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.idx).toFixed(1)} ${getY(p.val!).toFixed(1)}`).join(' ');
  }, [data, settings.showSMAFast, minVal, maxVal]);

  const smaSlowPath = useMemo(() => {
    if (!settings.showSMASlow) return '';
    const validPoints = data.map((d, i) => ({ val: d.smaSlow, idx: i })).filter((p) => p.val !== null && p.val !== undefined);
    if (validPoints.length === 0) return '';
    return validPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.idx).toFixed(1)} ${getY(p.val!).toFixed(1)}`).join(' ');
  }, [data, settings.showSMASlow, minVal, maxVal]);

  const emaPath = useMemo(() => {
    if (!settings.showEMA) return '';
    const validPoints = data.map((d, i) => ({ val: d.ema, idx: i })).filter((p) => p.val !== null && p.val !== undefined);
    if (validPoints.length === 0) return '';
    return validPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.idx).toFixed(1)} ${getY(p.val!).toFixed(1)}`).join(' ');
  }, [data, settings.showEMA, minVal, maxVal]);

  // Bollinger Bands paths
  const bollingerPaths = useMemo(() => {
    if (!settings.showBollinger) return { upper: '', middle: '', lower: '', area: '' };

    const validUpper = data.map((d, i) => ({ val: d.bollingerUpper, idx: i })).filter(p => p.val !== null && p.val !== undefined);
    const validMiddle = data.map((d, i) => ({ val: d.bollingerMiddle, idx: i })).filter(p => p.val !== null && p.val !== undefined);
    const validLower = data.map((d, i) => ({ val: d.bollingerLower, idx: i })).filter(p => p.val !== null && p.val !== undefined);

    const upperStr = validUpper.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.idx).toFixed(1)} ${getY(p.val!).toFixed(1)}`).join(' ');
    const middleStr = validMiddle.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.idx).toFixed(1)} ${getY(p.val!).toFixed(1)}`).join(' ');
    const lowerStr = validLower.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.idx).toFixed(1)} ${getY(p.val!).toFixed(1)}`).join(' ');

    let areaStr = '';
    if (validUpper.length > 0 && validLower.length > 0) {
      const topPart = validUpper.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.idx).toFixed(1)} ${getY(p.val!).toFixed(1)}`).join(' ');
      const bottomPart = [...validLower].reverse().map((p) => `L ${getX(p.idx).toFixed(1)} ${getY(p.val!).toFixed(1)}`).join(' ');
      areaStr = `${topPart} ${bottomPart} Z`;
    }

    return { upper: upperStr, middle: middleStr, lower: lowerStr, area: areaStr };
  }, [data, settings.showBollinger, minVal, maxVal]);

  // Mouse interaction
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || data.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * width;

    if (relativeX < padding.left || relativeX > width - padding.right) {
      setHoverIndex(null);
      return;
    }

    const ratio = (relativeX - padding.left) / chartWidth;
    const index = Math.round(ratio * (data.length - 1));
    const clampedIndex = Math.max(0, Math.min(data.length - 1, index));
    setHoverIndex(clampedIndex);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activePoint = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex] : data[data.length - 1];
  const activeX = hoverIndex !== null ? getX(hoverIndex) : null;
  const activeY = activePoint ? getY(activePoint.close) : null;

  // Grid lines
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

  // Time labels
  const timeLabels = useMemo(() => {
    if (data.length === 0) return [];
    const step = Math.max(1, Math.floor(data.length / 6));
    const labels = [];
    for (let i = 0; i < data.length; i += step) {
      labels.push({ x: getX(i), text: data[i].timestamp });
    }
    return labels;
  }, [data]);

  // All detected patterns currently in dataset
  const detectedPatterns = useMemo(() => {
    return data.map((d) => d.detectedPattern).filter((p): p is CandlestickPattern => !!p);
  }, [data]);

  const candleBarWidth = Math.max(4, Math.min(14, (chartWidth / Math.max(1, data.length)) * 0.75));

  const handlePatternClick = (pattern: CandlestickPattern, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePatternModal(pattern);
    if (onSelectPattern) onSelectPattern(pattern);
  };

  return (
    <div ref={containerRef} className="relative w-full rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-2xl select-none backdrop-blur-md">
      {/* Chart Top Bar HUD */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Spot Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white tracking-tight">
                {unit}{activePoint ? activePoint.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </span>
              {activePoint && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  activePoint.close >= activePoint.open ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {activePoint.close >= activePoint.open ? '+' : ''}
                  {((activePoint.close - activePoint.open) / (activePoint.open || 1) * 100).toFixed(2)}%
                </span>
              )}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-400 pl-4 border-l border-slate-800">
            <div>
              <span className="text-slate-500 block">O:</span>
              <span className="text-slate-200">{activePoint?.open.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">H:</span>
              <span className="text-slate-200">{activePoint?.high.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">L:</span>
              <span className="text-slate-200">{activePoint?.low.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Vol:</span>
              <span className="text-slate-200">{activePoint?.volume.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Time:</span>
              <span className="text-indigo-300">{activePoint?.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Display Mode Switcher & Pattern Badge Counter */}
        <div className="flex items-center gap-2">
          {/* Pattern Count Badge */}
          {settings.showPatterns && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-xs font-mono text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>{detectedPatterns.length} Patterns Spotted</span>
            </div>
          )}

          {/* Strategy Signals Badge */}
          {strategySignals && strategySignals.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-xs font-mono text-purple-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{strategySignals.length} Strategy Signals</span>
            </div>
          )}

          {/* Chart Display Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setChartMode('candles')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                chartMode === 'candles'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
              <span>Candles</span>
            </button>
            <button
              onClick={() => setChartMode('line')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all ${
                chartMode === 'line'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>Line</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main SVG Chart Canvas */}
      <div className="w-full relative aspect-[16/7.2] min-h-[360px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#6366f1" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
            </linearGradient>

            <linearGradient id="bollingerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.04" />
            </linearGradient>
          </defs>

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
                {unit}{g.val >= 1000 ? g.val.toFixed(1) : g.val.toFixed(2)}
              </text>
            </g>
          ))}

          {/* Time / X-axis labels */}
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

          {/* Volume Bars */}
          {settings.showVolume &&
            data.map((d, i) => {
              const barHeight = (d.volume / maxVolume) * (chartHeight * 0.18);
              const x = getX(i) - candleBarWidth / 2;
              const y = padding.top + chartHeight - barHeight;
              const isBullish = d.close >= d.open;

              return (
                <rect
                  key={`vol-${d.id}`}
                  x={x}
                  y={y}
                  width={candleBarWidth}
                  height={barHeight}
                  fill={isBullish ? '#10b981' : '#f43f5e'}
                  opacity={hoverIndex === i ? 0.65 : 0.25}
                  rx="1"
                />
              );
            })}

          {/* Bollinger Bands Shaded Envelope Area */}
          {settings.showBollinger && bollingerPaths.area && (
            <path
              d={bollingerPaths.area}
              fill="url(#bollingerGradient)"
              className="transition-all duration-300"
            />
          )}

          {/* Bollinger Bands Lines */}
          {settings.showBollinger && (
            <>
              {bollingerPaths.upper && (
                <path
                  d={bollingerPaths.upper}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
              )}
              {bollingerPaths.lower && (
                <path
                  d={bollingerPaths.lower}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
              )}
            </>
          )}

          {/* Candlesticks Mode (Japanese Candlesticks with Wicks and Bodies) */}
          {chartMode === 'candles' &&
            data.map((d, i) => {
              const x = getX(i);
              const isBullish = d.close >= d.open;
              const color = isBullish ? '#10b981' : '#f43f5e';
              const yHigh = getY(d.high);
              const yLow = getY(d.low);
              const yOpen = getY(d.open);
              const yClose = getY(d.close);
              const bodyTop = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
              const isHovered = hoverIndex === i;

              return (
                <g key={`candle-${d.id}`} className="transition-opacity duration-150">
                  {/* Central Wick Line (High to Low) */}
                  <line
                    x1={x}
                    y1={yHigh}
                    x2={x}
                    y2={yLow}
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity={isHovered ? 1 : 0.85}
                  />

                  {/* Rectangular Candle Body */}
                  <rect
                    x={x - candleBarWidth / 2}
                    y={bodyTop}
                    width={candleBarWidth}
                    height={bodyHeight}
                    fill={color}
                    stroke={color}
                    strokeWidth="1"
                    rx="1.5"
                    opacity={isHovered ? 1 : 0.9}
                    filter={isHovered ? 'drop-shadow(0 0 6px rgba(99,102,241,0.5))' : 'none'}
                  />
                </g>
              );
            })}

          {/* Line Chart Mode (Curve + Area) */}
          {chartMode === 'line' && (
            <>
              {priceAreaPath && <path d={priceAreaPath} fill="url(#priceGradient)" />}
              {pricePath && (
                <path
                  d={pricePath}
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </>
          )}

          {/* Technical Moving Average Overlays */}
          {settings.showSMASlow && smaSlowPath && (
            <path
              d={smaSlowPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />
          )}

          {settings.showSMAFast && smaFastPath && (
            <path
              d={smaFastPath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          )}

          {settings.showEMA && emaPath && (
            <path
              d={emaPath}
              fill="none"
              stroke="#c084fc"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Candlestick Pattern Visual Markers (Requirement #4) */}
          {settings.showPatterns &&
            data.map((d, i) => {
              if (!d.detectedPattern) return null;
              const pattern = d.detectedPattern;
              const x = getX(i);
              const isBullish = pattern.bias === 'Bullish';
              const isBearish = pattern.bias === 'Bearish';

              // Bullish patterns render below the candle wick; Bearish render above
              const markerY = isBearish
                ? getY(d.high) - 16
                : isBullish
                ? getY(d.low) + 16
                : getY(d.high) - 16;

              const isSelected = selectedPatternId === pattern.id || (activePoint && activePoint.id === d.id);

              return (
                <g
                  key={`pattern-marker-${pattern.id}`}
                  className="cursor-pointer group"
                  onClick={(e) => handlePatternClick(pattern, e)}
                >
                  {/* Directional Indicator Pointer */}
                  {isBullish && (
                    <polygon
                      points={`${x},${markerY - 5} ${x - 4},${markerY + 2} ${x + 4},${markerY + 2}`}
                      fill="#10b981"
                    />
                  )}
                  {isBearish && (
                    <polygon
                      points={`${x},${markerY + 5} ${x - 4},${markerY - 2} ${x + 4},${markerY - 2}`}
                      fill="#f43f5e"
                    />
                  )}

                  {/* Pattern Badge Pill */}
                  <rect
                    x={x - 22}
                    y={markerY - (isBearish ? 16 : -4)}
                    width="44"
                    height="16"
                    rx="4"
                    fill={isBullish ? '#064e3b' : isBearish ? '#4c0519' : '#451a03'}
                    stroke={pattern.color}
                    strokeWidth={isSelected ? '2' : '1'}
                    className="transition-all duration-200"
                  />
                  <text
                    x={x}
                    y={markerY - (isBearish ? 5 : -15)}
                    fill="#ffffff"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {pattern.shortCode}
                  </text>
                </g>
              );
            })}

          {/* Custom Strategy Signals Markers (Requirement #1) */}
          {strategySignals &&
            strategySignals.map((sig) => {
              const i = sig.candleIndex;
              if (i < 0 || i >= data.length) return null;
              const x = getX(i);
              const isBuy = sig.type === 'BUY';
              const markerY = isBuy ? getY(data[i].low) + 36 : getY(data[i].high) - 36;

              return (
                <g key={`sig-chart-${sig.id}`} className="cursor-pointer group">
                  <title>{`${sig.ruleName}: ${sig.type} ${sig.shares} shares @ $${sig.price.toFixed(2)} (${sig.reason})`}</title>
                  {/* Outer glow ring */}
                  <circle
                    cx={x}
                    cy={markerY}
                    r="12"
                    fill={isBuy ? '#059669' : '#dc2626'}
                    fillOpacity="0.3"
                    className="animate-pulse"
                  />
                  {/* Main Marker Badge */}
                  <circle
                    cx={x}
                    cy={markerY}
                    r="9.5"
                    fill={isBuy ? '#10b981' : '#f43f5e'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={x}
                    y={markerY + 3}
                    fill="#ffffff"
                    fontSize="7.5"
                    fontFamily="monospace"
                    fontWeight="extrabold"
                    textAnchor="middle"
                  >
                    {isBuy ? '▲' : '▼'}
                  </text>
                </g>
              );
            })}

          {/* Interactive Crosshair and Tracking Point */}
          {activeX !== null && activeY !== null && (
            <g className="pointer-events-none">
              <line
                x1={activeX}
                y1={padding.top}
                x2={activeX}
                y2={padding.top + chartHeight}
                stroke="#6366f1"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.75"
              />
              <line
                x1={padding.left}
                y1={activeY}
                x2={width - padding.right}
                y2={activeY}
                stroke="#6366f1"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.6"
              />

              <circle cx={activeX} cy={activeY} r="6" fill="#6366f1" fillOpacity="0.25" className="animate-ping" />
              <circle cx={activeX} cy={activeY} r="4" fill="#ffffff" stroke="#4f46e5" strokeWidth="2" />

              {/* Price badge on Right Y-Axis */}
              <g transform={`translate(${width - padding.right + 4}, ${activeY - 11})`}>
                <rect width="60" height="22" rx="4" fill="#4f46e5" />
                <text
                  x="30"
                  y="15"
                  fill="#ffffff"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {activePoint?.close.toFixed(2)}
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* Hover / Active Candlestick Pattern Detail HUD Banner */}
        {activePoint?.detectedPattern && (
          <div className="absolute top-3 left-4 max-w-sm bg-slate-950/95 border border-indigo-500/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md animate-fade-in z-20">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activePoint.detectedPattern.color }}
                />
                <span className="font-bold text-white text-xs">
                  {activePoint.detectedPattern.name}
                </span>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.2 rounded"
                  style={{
                    backgroundColor: `${activePoint.detectedPattern.color}25`,
                    color: activePoint.detectedPattern.color,
                  }}
                >
                  {activePoint.detectedPattern.bias} Reversal
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Reliability: {activePoint.detectedPattern.reliability}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
              {activePoint.detectedPattern.description}
            </p>

            <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-indigo-300 flex items-start gap-1">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-400" />
              <span><strong>Implication:</strong> {activePoint.detectedPattern.implication}</span>
            </div>
          </div>
        )}
      </div>

      {/* Pattern Modal Popover on Explicit Click */}
      {activePatternModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: activePatternModal.color }}
                />
                <h3 className="font-bold text-white text-base">{activePatternModal.name}</h3>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${activePatternModal.color}25`,
                    color: activePatternModal.color,
                  }}
                >
                  {activePatternModal.bias}
                </span>
              </div>
              <button
                onClick={() => setActivePatternModal(null)}
                className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1">Visual Anatomy</span>
                <p className="text-slate-200">{activePatternModal.description}</p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                <span className="text-indigo-300 font-semibold block mb-1">Trading Implication &amp; Tactics</span>
                <p className="text-slate-200 leading-relaxed">{activePatternModal.implication}</p>
              </div>

              <div className="flex justify-between items-center text-slate-400 pt-2 font-mono text-[11px]">
                <span>Pattern Trigger Price: <strong>${activePatternModal.price.toFixed(2)}</strong></span>
                <span>Signal Reliability: <strong className="text-emerald-400">{activePatternModal.reliability}</strong></span>
              </div>
            </div>

            <button
              onClick={() => setActivePatternModal(null)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close Pattern Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
