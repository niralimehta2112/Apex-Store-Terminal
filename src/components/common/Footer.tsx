import React from 'react';
import { Cpu, ShieldCheck, Activity, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                APEX STORE &amp; QUANT ANALYTICS
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              Integrated e-commerce platform with real-time financial indicators, algorithmic moving averages, dynamic Bollinger Bands, and Relative Strength Index (RSI) telemetry.
            </p>
            <div className="flex items-center gap-3 text-[11px] font-mono text-emerald-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Live Tick Engine Active
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> SSL Secured
              </span>
            </div>
          </div>

          {/* Catalog Links */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">Hardware &amp; Cloud</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><span className="hover:text-indigo-400 cursor-pointer">Neural Workstations</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">Titanium Wearables</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">GPU Cloud Clusters</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">Custom Keyboards</span></li>
            </ul>
          </div>

          {/* Analytics Indicators Links */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-[11px]">Quantitative Analytics</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><span className="hover:text-indigo-400 cursor-pointer">Simple Moving Averages (SMA)</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">Exponential Moving Averages (EMA)</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">Relative Strength Index (RSI 14)</span></li>
              <li><span className="hover:text-indigo-400 cursor-pointer">Bollinger Bands Volatility</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Disclaimer */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} ApexStore Inc. Technical market metrics and live indicators derived from simulated stochastic Brownian motion.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">API Documentation</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-indigo-400 font-mono">
              <Terminal className="w-3 h-3" /> v1.0.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

