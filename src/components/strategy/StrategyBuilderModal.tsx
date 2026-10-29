import React, { useState } from 'react';
import {
  StrategyRule,
  StrategyCondition,
  MarketAsset,
  StrategyIndicatorType,
  StrategyOperator
} from '../../types';
import { X, Sparkles, Sliders, Check, Zap, HelpCircle, ArrowRight } from 'lucide-react';

interface StrategyBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: MarketAsset[];
  onSaveStrategy: (strategy: StrategyRule) => void;
  initialStrategy?: StrategyRule | null;
}

export const StrategyBuilderModal: React.FC<StrategyBuilderModalProps> = ({
  isOpen,
  onClose,
  assets,
  onSaveStrategy,
  initialStrategy,
}) => {
  const [name, setName] = useState(initialStrategy?.name || 'My Custom Algorithmic Strategy');
  const [assetId, setAssetId] = useState(initialStrategy?.assetId || assets[0]?.id || 'nvst');
  const [shares, setShares] = useState(initialStrategy?.shares || 20);
  const [autoTrade, setAutoTrade] = useState(initialStrategy?.autoTrade !== false);
  const [stopLossPct, setStopLossPct] = useState(initialStrategy?.stopLossPct || 3.0);
  const [takeProfitPct, setTakeProfitPct] = useState(initialStrategy?.takeProfitPct || 8.0);

  // Buy Condition State
  const [buyIndicator, setBuyIndicator] = useState<StrategyIndicatorType>(initialStrategy?.buyCondition.indicator || 'PRICE');
  const [buyPeriod, setBuyPeriod] = useState<number>(initialStrategy?.buyCondition.period || 1);
  const [buyOperator, setBuyOperator] = useState<StrategyOperator>(initialStrategy?.buyCondition.operator || 'CROSSES_ABOVE');
  const [buyTargetType, setBuyTargetType] = useState<'INDICATOR' | 'CONSTANT'>(initialStrategy?.buyCondition.targetType || 'INDICATOR');
  const [buyTargetIndicator, setBuyTargetIndicator] = useState<StrategyIndicatorType>(initialStrategy?.buyCondition.targetIndicator || 'SMA');
  const [buyTargetPeriod, setBuyTargetPeriod] = useState<number>(initialStrategy?.buyCondition.targetPeriod || 50);
  const [buyTargetConstant, setBuyTargetConstant] = useState<number>(initialStrategy?.buyCondition.targetConstant || 30);

  // Sell Condition State
  const [sellIndicator, setSellIndicator] = useState<StrategyIndicatorType>(initialStrategy?.sellCondition.indicator || 'PRICE');
  const [sellPeriod, setSellPeriod] = useState<number>(initialStrategy?.sellCondition.period || 1);
  const [sellOperator, setSellOperator] = useState<StrategyOperator>(initialStrategy?.sellCondition.operator || 'CROSSES_BELOW');
  const [sellTargetType, setSellTargetType] = useState<'INDICATOR' | 'CONSTANT'>(initialStrategy?.sellCondition.targetType || 'INDICATOR');
  const [sellTargetIndicator, setSellTargetIndicator] = useState<StrategyIndicatorType>(initialStrategy?.sellCondition.targetIndicator || 'SMA');
  const [sellTargetPeriod, setSellTargetPeriod] = useState<number>(initialStrategy?.sellCondition.targetPeriod || 50);
  const [sellTargetConstant, setSellTargetConstant] = useState<number>(initialStrategy?.sellCondition.targetConstant || 70);

  if (!isOpen) return null;

  // Quick Template Loaders
  const loadTemplate = (type: 'rsi' | 'sma50' | 'goldenCross' | 'bollinger') => {
    if (type === 'rsi') {
      setName('RSI 30/70 Mean Reversion');
      setBuyIndicator('RSI');
      setBuyPeriod(14);
      setBuyOperator('CROSSES_BELOW');
      setBuyTargetType('CONSTANT');
      setBuyTargetConstant(30);

      setSellIndicator('RSI');
      setSellPeriod(14);
      setSellOperator('CROSSES_ABOVE');
      setSellTargetType('CONSTANT');
      setSellTargetConstant(70);
    } else if (type === 'sma50') {
      setName('50-Day Moving Average Breakout');
      setBuyIndicator('PRICE');
      setBuyPeriod(1);
      setBuyOperator('CROSSES_ABOVE');
      setBuyTargetType('INDICATOR');
      setBuyTargetIndicator('SMA');
      setBuyTargetPeriod(50);

      setSellIndicator('PRICE');
      setSellPeriod(1);
      setSellOperator('CROSSES_BELOW');
      setSellTargetType('INDICATOR');
      setSellTargetIndicator('SMA');
      setSellTargetPeriod(50);
    } else if (type === 'goldenCross') {
      setName('SMA 10/30 Golden Cross Momentum');
      setBuyIndicator('SMA');
      setBuyPeriod(10);
      setBuyOperator('CROSSES_ABOVE');
      setBuyTargetType('INDICATOR');
      setBuyTargetIndicator('SMA');
      setBuyTargetPeriod(30);

      setSellIndicator('SMA');
      setSellPeriod(10);
      setSellOperator('CROSSES_BELOW');
      setSellTargetType('INDICATOR');
      setSellTargetIndicator('SMA');
      setSellTargetPeriod(30);
    } else if (type === 'bollinger') {
      setName('Bollinger Band Lower Rebound');
      setBuyIndicator('PRICE');
      setBuyPeriod(1);
      setBuyOperator('CROSSES_BELOW');
      setBuyTargetType('INDICATOR');
      setBuyTargetIndicator('BOLLINGER_LOWER');
      setBuyTargetPeriod(20);

      setSellIndicator('PRICE');
      setSellPeriod(1);
      setSellOperator('CROSSES_ABOVE');
      setSellTargetType('INDICATOR');
      setSellTargetIndicator('BOLLINGER_UPPER');
      setSellTargetPeriod(20);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const buyCondition: StrategyCondition = {
      indicator: buyIndicator,
      period: buyPeriod,
      operator: buyOperator,
      targetType: buyTargetType,
      targetIndicator: buyTargetType === 'INDICATOR' ? buyTargetIndicator : undefined,
      targetPeriod: buyTargetType === 'INDICATOR' ? buyTargetPeriod : undefined,
      targetConstant: buyTargetType === 'CONSTANT' ? buyTargetConstant : undefined,
    };

    const sellCondition: StrategyCondition = {
      indicator: sellIndicator,
      period: sellPeriod,
      operator: sellOperator,
      targetType: sellTargetType,
      targetIndicator: sellTargetType === 'INDICATOR' ? sellTargetIndicator : undefined,
      targetPeriod: sellTargetType === 'INDICATOR' ? sellTargetPeriod : undefined,
      targetConstant: sellTargetType === 'CONSTANT' ? sellTargetConstant : undefined,
    };

    const rule: StrategyRule = {
      id: initialStrategy?.id || `strat-${Date.now().toString().slice(-6)}`,
      name,
      assetId,
      enabled: true,
      autoTrade,
      buyCondition,
      sellCondition,
      shares,
      stopLossPct: Number(stopLossPct) || undefined,
      takeProfitPct: Number(takeProfitPct) || undefined,
      description: `Rule: BUY when ${buyIndicator}${buyIndicator !== 'PRICE' ? `(${buyPeriod})` : ''} ${buyOperator} ${buyTargetType === 'CONSTANT' ? buyTargetConstant : `${buyTargetIndicator}(${buyTargetPeriod})`}; SELL when ${sellIndicator}${sellIndicator !== 'PRICE' ? `(${sellPeriod})` : ''} ${sellOperator} ${sellTargetType === 'CONSTANT' ? sellTargetConstant : `${sellTargetIndicator}(${sellTargetPeriod})`}.`,
      createdAt: initialStrategy?.createdAt || new Date().toISOString(),
    };

    onSaveStrategy(rule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                Rule &amp; Strategy Builder
              </span>
              <h3 className="text-base font-bold text-white">Design Custom Indicator Strategy</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-5 flex-1 pr-4">
          {/* 1-Click Templates */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              ⚡ Quick Template Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => loadTemplate('sma50')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-xs font-mono text-left transition-colors"
              >
                <span className="font-bold text-white block">50-SMA Breakout</span>
                <span className="text-[10px] text-slate-500">Crosses 50 MA</span>
              </button>

              <button
                type="button"
                onClick={() => loadTemplate('rsi')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-xs font-mono text-left transition-colors"
              >
                <span className="font-bold text-white block">RSI 30/70</span>
                <span className="text-[10px] text-slate-500">Oversold &lt; 30</span>
              </button>

              <button
                type="button"
                onClick={() => loadTemplate('goldenCross')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-xs font-mono text-left transition-colors"
              >
                <span className="font-bold text-white block">Golden Cross</span>
                <span className="text-[10px] text-slate-500">SMA 10 over 30</span>
              </button>

              <button
                type="button"
                onClick={() => loadTemplate('bollinger')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-xs font-mono text-left transition-colors"
              >
                <span className="font-bold text-white block">Bollinger Squeeze</span>
                <span className="text-[10px] text-slate-500">Lower / Upper</span>
              </button>
            </div>
          </div>

          {/* Strategy Name & Asset Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Strategy Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Asset</label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.symbol} — {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION 1: BUY ENTRY RULE */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                1. Buy (Long Entry) Condition Rule
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Trigger Indicator */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">When Indicator</label>
                <select
                  value={buyIndicator}
                  onChange={(e) => setBuyIndicator(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                >
                  <option value="PRICE">Market Price</option>
                  <option value="SMA">Simple MA (SMA)</option>
                  <option value="EMA">Exponential MA (EMA)</option>
                  <option value="RSI">RSI Oscillator</option>
                </select>
              </div>

              {/* Operator */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Condition Operator</label>
                <select
                  value={buyOperator}
                  onChange={(e) => setBuyOperator(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono"
                >
                  <option value="CROSSES_ABOVE">Crosses Above (↑)</option>
                  <option value="CROSSES_BELOW">Crosses Below (↓)</option>
                  <option value="GREATER_THAN">Is Greater Than (&gt;)</option>
                  <option value="LESS_THAN">Is Less Than (&lt;)</option>
                </select>
              </div>

              {/* Target */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Target Threshold</label>
                {buyTargetType === 'CONSTANT' ? (
                  <input
                    type="number"
                    value={buyTargetConstant}
                    onChange={(e) => setBuyTargetConstant(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono"
                  />
                ) : (
                  <div className="flex gap-1">
                    <select
                      value={buyTargetIndicator}
                      onChange={(e) => setBuyTargetIndicator(e.target.value as any)}
                      className="w-2/3 bg-slate-900 border border-slate-800 rounded-xl p-2 text-white text-[11px]"
                    >
                      <option value="SMA">SMA</option>
                      <option value="EMA">EMA</option>
                      <option value="BOLLINGER_LOWER">BB Lower</option>
                      <option value="BOLLINGER_UPPER">BB Upper</option>
                    </select>
                    <input
                      type="number"
                      value={buyTargetPeriod}
                      onChange={(e) => setBuyTargetPeriod(Number(e.target.value))}
                      className="w-1/3 bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono text-center"
                      title="Period length"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Target Type:</span>
              <button
                type="button"
                onClick={() => setBuyTargetType(buyTargetType === 'INDICATOR' ? 'CONSTANT' : 'INDICATOR')}
                className="text-indigo-400 underline font-semibold"
              >
                Switch to {buyTargetType === 'INDICATOR' ? 'Numeric Value (e.g. 30)' : 'Indicator (e.g. SMA 50)'}
              </button>
            </div>
          </div>

          {/* SECTION 2: SELL EXIT RULE */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-rose-500/30 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                2. Sell (Exit Position) Condition Rule
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Trigger Indicator */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">When Indicator</label>
                <select
                  value={sellIndicator}
                  onChange={(e) => setSellIndicator(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                >
                  <option value="PRICE">Market Price</option>
                  <option value="SMA">Simple MA (SMA)</option>
                  <option value="EMA">Exponential MA (EMA)</option>
                  <option value="RSI">RSI Oscillator</option>
                </select>
              </div>

              {/* Operator */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Condition Operator</label>
                <select
                  value={sellOperator}
                  onChange={(e) => setSellOperator(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono"
                >
                  <option value="CROSSES_BELOW">Crosses Below (↓)</option>
                  <option value="CROSSES_ABOVE">Crosses Above (↑)</option>
                  <option value="GREATER_THAN">Is Greater Than (&gt;)</option>
                  <option value="LESS_THAN">Is Less Than (&lt;)</option>
                </select>
              </div>

              {/* Target */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Target Threshold</label>
                {sellTargetType === 'CONSTANT' ? (
                  <input
                    type="number"
                    value={sellTargetConstant}
                    onChange={(e) => setSellTargetConstant(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono"
                  />
                ) : (
                  <div className="flex gap-1">
                    <select
                      value={sellTargetIndicator}
                      onChange={(e) => setSellTargetIndicator(e.target.value as any)}
                      className="w-2/3 bg-slate-900 border border-slate-800 rounded-xl p-2 text-white text-[11px]"
                    >
                      <option value="SMA">SMA</option>
                      <option value="EMA">EMA</option>
                      <option value="BOLLINGER_UPPER">BB Upper</option>
                      <option value="BOLLINGER_LOWER">BB Lower</option>
                    </select>
                    <input
                      type="number"
                      value={sellTargetPeriod}
                      onChange={(e) => setSellTargetPeriod(Number(e.target.value))}
                      className="w-1/3 bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono text-center"
                      title="Period length"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Target Type:</span>
              <button
                type="button"
                onClick={() => setSellTargetType(sellTargetType === 'INDICATOR' ? 'CONSTANT' : 'INDICATOR')}
                className="text-indigo-400 underline font-semibold"
              >
                Switch to {sellTargetType === 'INDICATOR' ? 'Numeric Value (e.g. 70)' : 'Indicator (e.g. SMA 50)'}
              </button>
            </div>
          </div>

          {/* Sizing & Risk Controls */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Shares Per Trade</label>
              <input
                type="number"
                min="1"
                value={shares}
                onChange={(e) => setShares(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Stop-Loss (%)</label>
              <input
                type="number"
                step="0.5"
                value={stopLossPct}
                onChange={(e) => setStopLossPct(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono text-rose-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Take-Profit (%)</label>
              <input
                type="number"
                step="0.5"
                value={takeProfitPct}
                onChange={(e) => setTakeProfitPct(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono text-emerald-400"
              />
            </div>
          </div>

          {/* Auto Trade Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs">
            <div>
              <span className="font-bold text-white block">Auto-Execute into Paper Portfolio</span>
              <span className="text-slate-400 text-[11px] block">
                Automatically execute simulated BUY/SELL market orders into your $100k account when signals trigger.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAutoTrade(!autoTrade)}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                autoTrade ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  autoTrade ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Submit */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Activate Strategy</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

