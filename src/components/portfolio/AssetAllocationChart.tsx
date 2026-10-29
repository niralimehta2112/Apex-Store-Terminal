import React, { useState } from 'react';
import { AssetAllocationItem } from '../../types';
import { PieChart, DollarSign } from 'lucide-react';

interface AssetAllocationChartProps {
  allocations: AssetAllocationItem[];
  totalPortfolioValue: number;
}

export const AssetAllocationChart: React.FC<AssetAllocationChartProps> = ({
  allocations,
  totalPortfolioValue,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // SVG Donut parameters
  const size = 260;
  const strokeWidth = 36;
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 10;
  const circumference = 2 * Math.PI * radius;

  // Filter out zero or negative slices
  const validSlices = allocations.filter((a) => a.percentage > 0.01);

  // Calculate accumulated offsets for SVG stroke-dasharray & stroke-dashoffset
  let accumulatedPercent = 0;
  const slicesWithAngles = validSlices.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += item.percentage;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeItem = hoveredId ? allocations.find((a) => a.id === hoveredId) : null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Visual Asset Allocation</h3>
              <p className="text-xs text-slate-400">Capital distribution & diversification</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
            {allocations.length} Assets Tracked
          </span>
        </div>

        {/* Donut Chart & Center Info */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
          <div className="relative w-[240px] h-[240px] shrink-0 select-none">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full transform -rotate-90 overflow-visible"
            >
              {/* Background track circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke="#1e293b"
                strokeWidth={strokeWidth}
              />

              {/* Segmented Slices */}
              {slicesWithAngles.map((slice) => {
                const isHovered = hoveredId === slice.id;
                return (
                  <circle
                    key={slice.id}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredId(slice.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      opacity: hoveredId && !isHovered ? 0.45 : 1,
                      filter: isHovered ? `drop-shadow(0 0 10px ${slice.color})` : 'none',
                    }}
                  />
                );
              })}
            </svg>

            {/* Central Badge Information */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {activeItem ? activeItem.symbol : 'Total Portfolio'}
              </span>
              <span className="text-lg font-bold font-mono text-white tracking-tight mt-0.5">
                ${activeItem ? activeItem.value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : totalPortfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full mt-1 bg-slate-800 text-slate-200">
                {activeItem ? `${activeItem.percentage.toFixed(1)}%` : '100.0%'}
              </span>
            </div>
          </div>

          {/* Asset Allocation Legend & Progress Stack */}
          <div className="flex-1 w-full space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {allocations.map((item) => {
              const isHovered = hoveredId === item.id;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    isHovered
                      ? 'bg-slate-800/90 border-slate-700 shadow-md ring-1 ring-slate-600'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-bold text-white font-mono">{item.symbol}</span>
                      <span className="text-slate-400 text-[11px] truncate max-w-[110px] hidden sm:inline">
                        {item.name}
                      </span>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <span className="font-mono text-slate-200 font-semibold">
                        ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span
                        className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${item.color}25`, color: item.color }}
                      >
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Allocation Insight Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-slate-400">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          Unallocated Cash: <strong className="text-emerald-400 font-mono">${(allocations.find((a) => a.id === 'cash')?.value || 0).toLocaleString()}</strong>
        </span>
        <span className="text-slate-500">
          Equity Exposure: {(100 - (allocations.find((a) => a.id === 'cash')?.percentage || 0)).toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

