import React, { useMemo } from 'react';
import { MarketDataPoint } from '../../types';

interface RsiChartProps {
  data: MarketDataPoint[];
  period?: number;
}

export const RsiOscillatorChart: React.FC<RsiChartProps> = ({ data, period = 14 }) => {
  const width = 1000;
  const height = 150;
  const padding = { top: 15, right: 70, bottom: 25, left: 20 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const validPoints = useMemo(() => {
    return data
      .map((d, idx) => ({ rsi: d.rsi, timestamp: d.timestamp, idx }))
      .filter((p) => p.rsi !== null && p.rsi !== undefined);
  }, [data]);

  const latestRsi = data.length > 0 ? data[data.length - 1].rsi : null;

  const getX = (index: number) => {
    if (data.length <= 1) return padding.left;
    return padding.left + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (rsiVal: number) => {
    // RSI is bounded 0 to 100
    return padding.top + chartHeight - (rsiVal / 100) * chartHeight;
  };

  const rsiPath = useMemo(() => {
    if (validPoints.length === 0) return '';
    return validPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.idx).toFixed(1)} ${getY(p.rsi!).toFixed(1)}`)
      .join(' ');
  }, [validPoints, data.length]);

  const y70 = getY(70);
  const y30 = getY(30);
  const y50 = getY(50);

  let statusBadge = { label: 'Neutral', bg: 'bg-slate-700/60', text: 'text-slate-300' };
  if (latestRsi !== null && latestRsi !== undefined) {
    if (latestRsi >= 70) {
      statusBadge = { label: 'Overbought (>70)', bg: 'bg-rose-500/20 border-rose-500/40', text: 'text-rose-400' };
    } else if (latestRsi <= 30) {
      statusBadge = { label: 'Oversold (<30)', bg: 'bg-emerald-500/20 border-emerald-500/40', text: 'text-emerald-400' };
    } else if (latestRsi > 55) {
      statusBadge = { label: 'Bullish Momentum', bg: 'bg-cyan-500/20 border-cyan-500/40', text: 'text-cyan-400' };
    } else if (latestRsi < 45) {
      statusBadge = { label: 'Bearish Momentum', bg: 'bg-amber-500/20 border-amber-500/40', text: 'text-amber-400' };
    }
  }

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl select-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Relative Strength Index (RSI {period})
          </span>
          <span className="text-sm font-mono font-bold text-white">
            {latestRsi !== null && latestRsi !== undefined ? latestRsi.toFixed(1) : 'Calculating...'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${statusBadge.bg} ${statusBadge.text}`}>
            {statusBadge.label}
          </span>
        </div>
      </div>

      <div className="w-full relative aspect-[16/2.8] min-h-[120px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Overbought shaded zone (70 - 100) */}
          <rect
            x={padding.left}
            y={padding.top}
            width={chartWidth}
            height={y70 - padding.top}
            fill="#f43f5e"
            fillOpacity="0.08"
          />

          {/* Oversold shaded zone (0 - 30) */}
          <rect
            x={padding.left}
            y={y30}
            width={chartWidth}
            height={padding.top + chartHeight - y30}
            fill="#10b981"
            fillOpacity="0.08"
          />

          {/* 70 Level line */}
          <line
            x1={padding.left}
            y1={y70}
            x2={width - padding.right}
            y2={y70}
            stroke="#f43f5e"
            strokeDasharray="4 4"
            strokeWidth="1"
            opacity="0.6"
          />
          <text
            x={width - padding.right + 8}
            y={y70 + 4}
            fill="#f43f5e"
            fontSize="10"
            fontFamily="monospace"
          >
            70 OB
          </text>

          {/* 50 Centerline */}
          <line
            x1={padding.left}
            y1={y50}
            x2={width - padding.right}
            y2={y50}
            stroke="#475569"
            strokeDasharray="2 4"
            strokeWidth="1"
            opacity="0.5"
          />
          <text
            x={width - padding.right + 8}
            y={y50 + 4}
            fill="#64748b"
            fontSize="10"
            fontFamily="monospace"
          >
            50
          </text>

          {/* 30 Level line */}
          <line
            x1={padding.left}
            y1={y30}
            x2={width - padding.right}
            y2={y30}
            stroke="#10b981"
            strokeDasharray="4 4"
            strokeWidth="1"
            opacity="0.6"
          />
          <text
            x={width - padding.right + 8}
            y={y30 + 4}
            fill="#10b981"
            fontSize="10"
            fontFamily="monospace"
          >
            30 OS
          </text>

          {/* RSI Curve Line */}
          {rsiPath && (
            <path
              d={rsiPath}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Current RSI Endpoint Indicator */}
          {validPoints.length > 0 && (
            <circle
              cx={getX(validPoints[validPoints.length - 1].idx)}
              cy={getY(validPoints[validPoints.length - 1].rsi!)}
              r="4"
              fill="#ffffff"
              stroke="#9333ea"
              strokeWidth="2"
            />
          )}
        </svg>
      </div>
    </div>
  );
};

