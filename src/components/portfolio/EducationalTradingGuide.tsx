import React from 'react';
import { BookOpen, HelpCircle, Layers, TrendingUp, ShieldAlert, Cpu } from 'lucide-react';

export const EducationalTradingGuide: React.FC = () => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Educational Trading Primer &amp; Simulation Mechanics</h3>
          <p className="text-xs text-slate-400">Essential financial principles modelled in this simulator</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Concept 1: Average Cost Basis */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400">
            <Layers className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Average Cost Basis</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            When you purchase additional shares over time, your cost basis is recalculated using the weighted average price of all acquired lots:
          </p>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-indigo-300">
            Cost = (Q1 × P1 + Q2 × P2) ÷ (Q1 + Q2)
          </div>
        </div>

        {/* Concept 2: Unrealized vs Realized Returns */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Unrealized vs Realized P&amp;L</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>Unrealized P&amp;L</strong> (paper return) fluctuates with live market prices. <strong>Realized P&amp;L</strong> is only locked in upon execution of a sell order minus transaction fees.
          </p>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300">
            Realized P&amp;L = (Sell - Cost) × Q - Fees
          </div>
        </div>

        {/* Concept 3: Friction & Transaction Fees */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldAlert className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Friction &amp; Slippage</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Real markets incorporate ticket charges ($1.00 base) plus exchange liquidity fees and execution slippage (0.05%). High-frequency trades can erode returns if friction is neglected.
          </p>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-amber-300">
            Fee = $1.00 + (Trade Value × 0.05%)
          </div>
        </div>

        {/* Concept 4: Modern Portfolio Allocation */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Asset Allocation</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Maintaining a disciplined cash buffer alongside uncorrelated equities protects against sudden market drawdowns. Inspect your donut chart to ensure no single asset exceeds 35-40% exposure.
          </p>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300">
            Cash + Stocks = 100% Portfolio
          </div>
        </div>
      </div>
    </div>
  );
};

