import {
  StrategyRule,
  StrategyCondition,
  StrategySignal,
  BacktestResult,
  MarketDataPoint,
  MarketAsset
} from '../types';
import { calculateSMA, calculateEMA, calculateRSI, calculateBollingerBands } from './financialCalculations';

export const DEFAULT_STRATEGIES: StrategyRule[] = [
  {
    id: 'strat-rsi-mean-reversion',
    name: 'RSI 30/70 Mean-Reversion',
    assetId: 'nvst',
    enabled: true,
    autoTrade: true,
    buyCondition: {
      indicator: 'RSI',
      period: 14,
      operator: 'CROSSES_BELOW',
      targetType: 'CONSTANT',
      targetConstant: 30,
    },
    sellCondition: {
      indicator: 'RSI',
      period: 14,
      operator: 'CROSSES_ABOVE',
      targetType: 'CONSTANT',
      targetConstant: 70,
    },
    shares: 20,
    stopLossPct: 3.5,
    takeProfitPct: 8.0,
    description: 'Systematically buys when the market becomes statistically oversold (RSI < 30) and sells into overextended momentum rallies (RSI > 70).',
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'strat-50-sma-trend',
    name: '50-SMA Trend-Following Engine',
    assetId: 'btc',
    enabled: true,
    autoTrade: false,
    buyCondition: {
      indicator: 'PRICE',
      period: 1,
      operator: 'CROSSES_ABOVE',
      targetType: 'INDICATOR',
      targetIndicator: 'SMA',
      targetPeriod: 50,
    },
    sellCondition: {
      indicator: 'PRICE',
      period: 1,
      operator: 'CROSSES_BELOW',
      targetType: 'INDICATOR',
      targetIndicator: 'SMA',
      targetPeriod: 50,
    },
    shares: 0.25,
    stopLossPct: 4.0,
    takeProfitPct: 12.0,
    description: 'Buys when price breaks above the 50-period moving average to capture sustained institutional trends, and exits when price closes below.',
    createdAt: '2026-02-15T14:30:00Z',
  },
  {
    id: 'strat-golden-cross',
    name: 'Golden Cross Momentum (SMA 10/30)',
    assetId: 'arc',
    enabled: false,
    autoTrade: false,
    buyCondition: {
      indicator: 'SMA',
      period: 10,
      operator: 'CROSSES_ABOVE',
      targetType: 'INDICATOR',
      targetIndicator: 'SMA',
      targetPeriod: 30,
    },
    sellCondition: {
      indicator: 'SMA',
      period: 10,
      operator: 'CROSSES_BELOW',
      targetType: 'INDICATOR',
      targetIndicator: 'SMA',
      targetPeriod: 30,
    },
    shares: 15,
    stopLossPct: 2.5,
    takeProfitPct: 6.0,
    description: 'Trades intermediate trend continuation when fast moving average (SMA 10) surges above slow moving average (SMA 30).',
    createdAt: '2026-03-01T11:15:00Z',
  },
  {
    id: 'strat-bollinger-rebound',
    name: 'Bollinger Band Channel Rebound',
    assetId: 'gold',
    enabled: false,
    autoTrade: false,
    buyCondition: {
      indicator: 'PRICE',
      period: 1,
      operator: 'CROSSES_BELOW',
      targetType: 'INDICATOR',
      targetIndicator: 'BOLLINGER_LOWER',
      targetPeriod: 20,
    },
    sellCondition: {
      indicator: 'PRICE',
      period: 1,
      operator: 'CROSSES_ABOVE',
      targetType: 'INDICATOR',
      targetIndicator: 'BOLLINGER_UPPER',
      targetPeriod: 20,
    },
    shares: 10,
    stopLossPct: 2.0,
    takeProfitPct: 5.0,
    description: 'Exploits volatility envelope mean-reversion by buying oversold touches of the lower band and taking profits at the upper band.',
    createdAt: '2026-03-10T16:00:00Z',
  }
];

/**
 * Computes custom indicator series on demand
 */
export function getCustomIndicatorSeries(
  type: string,
  period: number,
  closes: number[]
): (number | null)[] {
  if (type === 'PRICE') return closes;
  if (type === 'SMA') return calculateSMA(closes, Math.max(2, period));
  if (type === 'EMA') return calculateEMA(closes, Math.max(2, period));
  if (type === 'RSI') return calculateRSI(closes, Math.max(2, period));
  if (type === 'BOLLINGER_UPPER') {
    const bb = calculateBollingerBands(closes, Math.max(5, period), 2);
    return bb.upper;
  }
  if (type === 'BOLLINGER_LOWER') {
    const bb = calculateBollingerBands(closes, Math.max(5, period), 2);
    return bb.lower;
  }
  return closes;
}

/**
 * Evaluates whether a strategy condition is met at candle index i
 */
export function evaluateCondition(
  condition: StrategyCondition,
  i: number,
  closes: number[],
  indicatorCache: Record<string, (number | null)[]>
): { met: boolean; reason: string } {
  if (i < 1) return { met: false, reason: '' };

  const mainKey = `${condition.indicator}_${condition.period}`;
  if (!indicatorCache[mainKey]) {
    indicatorCache[mainKey] = getCustomIndicatorSeries(condition.indicator, condition.period, closes);
  }
  const mainSeries = indicatorCache[mainKey];

  let targetSeries: (number | null)[];
  if (condition.targetType === 'CONSTANT') {
    targetSeries = closes.map(() => condition.targetConstant ?? 0);
  } else {
    const targetKey = `${condition.targetIndicator || 'SMA'}_${condition.targetPeriod || 20}`;
    if (!indicatorCache[targetKey]) {
      indicatorCache[targetKey] = getCustomIndicatorSeries(
        condition.targetIndicator || 'SMA',
        condition.targetPeriod || 20,
        closes
      );
    }
    targetSeries = indicatorCache[targetKey];
  }

  const currVal = mainSeries[i];
  const prevVal = mainSeries[i - 1];
  const currTarget = targetSeries[i];
  const prevTarget = targetSeries[i - 1];

  if (currVal === null || prevVal === null || currTarget === null || prevTarget === null) {
    return { met: false, reason: '' };
  }

  let met = false;
  let reason = '';

  switch (condition.operator) {
    case 'CROSSES_ABOVE':
      met = prevVal <= prevTarget && currVal > currTarget;
      reason = `${condition.indicator}(${currVal.toFixed(1)}) crossed ABOVE target(${currTarget.toFixed(1)})`;
      break;
    case 'CROSSES_BELOW':
      met = prevVal >= prevTarget && currVal < currTarget;
      reason = `${condition.indicator}(${currVal.toFixed(1)}) crossed BELOW target(${currTarget.toFixed(1)})`;
      break;
    case 'GREATER_THAN':
      met = currVal > currTarget;
      reason = `${condition.indicator}(${currVal.toFixed(1)}) > target(${currTarget.toFixed(1)})`;
      break;
    case 'LESS_THAN':
      met = currVal < currTarget;
      reason = `${condition.indicator}(${currVal.toFixed(1)}) < target(${currTarget.toFixed(1)})`;
      break;
  }

  return { met, reason };
}

/**
 * Runs historical backtest simulation for a strategy across given data points
 */
export function runBacktestSimulation(
  strategy: StrategyRule,
  data: MarketDataPoint[],
  asset: MarketAsset,
  initialCapital = 50000
): BacktestResult {
  if (data.length < 10) {
    return {
      strategyId: strategy.id,
      strategyName: strategy.name,
      assetSymbol: asset.symbol,
      initialCapital,
      endingCapital: initialCapital,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalPnl: 0,
      totalPnlPct: 0,
      maxDrawdownPct: 0,
      profitFactor: 0,
      signals: [],
      equityCurve: [{ timestamp: 'Start', equity: initialCapital }],
    };
  }

  const closes = data.map((d) => d.close);
  const indicatorCache: Record<string, (number | null)[]> = {};

  let capital = initialCapital;
  let currentShares = 0;
  let entryPrice = 0;
  let peakEquity = initialCapital;
  let maxDrawdown = 0;

  let winningTrades = 0;
  let losingTrades = 0;
  let grossProfits = 0;
  let grossLosses = 0;

  const signals: StrategySignal[] = [];
  const equityCurve: { timestamp: string; equity: number }[] = [];

  for (let i = 2; i < data.length; i++) {
    const point = data[i];
    const price = point.close;

    // Check Buy Condition if currently in cash / flat
    if (currentShares === 0) {
      const buyEval = evaluateCondition(strategy.buyCondition, i, closes, indicatorCache);
      if (buyEval.met) {
        const affordableShares = Math.min(strategy.shares, Math.floor((capital * 0.95) / price));
        if (affordableShares > 0) {
          currentShares = affordableShares;
          entryPrice = price;
          capital -= currentShares * price;

          signals.push({
            id: `sig-${strategy.id}-${point.id}-buy`,
            timestamp: point.timestamp,
            candleIndex: i,
            assetId: asset.id,
            symbol: asset.symbol,
            type: 'BUY',
            price,
            shares: currentShares,
            ruleName: strategy.name,
            reason: buyEval.reason,
          });
        }
      }
    }
    // Check Sell Condition or Risk Limits if holding position
    else {
      const sellEval = evaluateCondition(strategy.sellCondition, i, closes, indicatorCache);
      const priceDeltaPct = ((price - entryPrice) / entryPrice) * 100;
      const isStopLoss = strategy.stopLossPct && priceDeltaPct <= -strategy.stopLossPct;
      const isTakeProfit = strategy.takeProfitPct && priceDeltaPct >= strategy.takeProfitPct;

      if (sellEval.met || isStopLoss || isTakeProfit) {
        const proceeds = currentShares * price;
        const pnl = proceeds - currentShares * entryPrice;
        capital += proceeds;

        if (pnl > 0) {
          winningTrades++;
          grossProfits += pnl;
        } else {
          losingTrades++;
          grossLosses += Math.abs(pnl);
        }

        const exitReason = isStopLoss
          ? `Stop-Loss triggered (-${Math.abs(priceDeltaPct).toFixed(1)}%)`
          : isTakeProfit
          ? `Take-Profit reached (+${priceDeltaPct.toFixed(1)}%)`
          : sellEval.reason;

        signals.push({
          id: `sig-${strategy.id}-${point.id}-sell`,
          timestamp: point.timestamp,
          candleIndex: i,
          assetId: asset.id,
          symbol: asset.symbol,
          type: 'SELL',
          price,
          shares: currentShares,
          ruleName: strategy.name,
          reason: exitReason,
        });

        currentShares = 0;
        entryPrice = 0;
      }
    }

    const currentTotalEquity = capital + currentShares * price;
    if (currentTotalEquity > peakEquity) peakEquity = currentTotalEquity;
    const currentDrawdownPct = ((peakEquity - currentTotalEquity) / peakEquity) * 100;
    if (currentDrawdownPct > maxDrawdown) maxDrawdown = currentDrawdownPct;

    equityCurve.push({
      timestamp: point.timestamp,
      equity: parseFloat(currentTotalEquity.toFixed(2)),
    });
  }

  // Liquidate open position at end of backtest period for accurate accounting
  if (currentShares > 0) {
    const finalPrice = data[data.length - 1].close;
    const finalProceeds = currentShares * finalPrice;
    const finalPnl = finalProceeds - currentShares * entryPrice;
    capital += finalProceeds;
    if (finalPnl > 0) winningTrades++;
    else losingTrades++;
  }

  const totalTrades = winningTrades + losingTrades;
  const totalPnl = capital - initialCapital;
  const totalPnlPct = (totalPnl / initialCapital) * 100;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const profitFactor = grossLosses > 0 ? grossProfits / grossLosses : grossProfits > 0 ? 9.99 : 1.0;

  return {
    strategyId: strategy.id,
    strategyName: strategy.name,
    assetSymbol: asset.symbol,
    initialCapital,
    endingCapital: parseFloat(capital.toFixed(2)),
    totalTrades,
    winningTrades,
    losingTrades,
    winRate: parseFloat(winRate.toFixed(1)),
    totalPnl: parseFloat(totalPnl.toFixed(2)),
    totalPnlPct: parseFloat(totalPnlPct.toFixed(2)),
    maxDrawdownPct: parseFloat(maxDrawdown.toFixed(2)),
    profitFactor: parseFloat(profitFactor.toFixed(2)),
    signals,
    equityCurve,
  };
}

