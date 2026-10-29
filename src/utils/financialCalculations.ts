import { MarketDataPoint, IndicatorSettings, MarketAsset, TimeRange, PatternFilterSettings } from '../types';
import { detectCandlestickPatterns } from './candlestickDetector';

/**
 * Calculates Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      result.push(parseFloat((sum / period).toFixed(2)));
    }
  }
  return result;
}

/**
 * Calculates Exponential Moving Average (EMA)
 */
export function calculateEMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);
  let previousEMA: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      // First EMA is simple SMA
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[j];
      }
      previousEMA = sum / period;
      result.push(parseFloat(previousEMA.toFixed(2)));
    } else {
      // EMA formula: (Close - PrevEMA) * Multiplier + PrevEMA
      const currentVal = data[i];
      if (previousEMA !== null) {
        previousEMA = (currentVal - previousEMA) * multiplier + previousEMA;
        result.push(parseFloat(previousEMA.toFixed(2)));
      } else {
        result.push(null);
      }
    }
  }
  return result;
}

/**
 * Calculates Relative Strength Index (RSI) using Wilder's Smoothed Moving Average
 */
export function calculateRSI(data: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = [];
  if (data.length <= period) {
    return data.map(() => null);
  }

  const changes: number[] = [0];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1]);
  }

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(null);
      if (i > 0) {
        const change = changes[i];
        if (change > 0) avgGain += change;
        else avgLoss += Math.abs(change);
      }
      if (i === period - 1) {
        avgGain = avgGain / period;
        avgLoss = avgLoss / period;
        if (avgLoss === 0) {
          result.push(100);
        } else {
          const rs = avgGain / avgLoss;
          const rsiVal = 100 - (100 / (1 + rs));
          result.push(parseFloat(rsiVal.toFixed(2)));
        }
      }
    } else {
      const change = changes[i];
      const currentGain = change > 0 ? change : 0;
      const currentLoss = change < 0 ? Math.abs(change) : 0;

      // Wilder's smoothing
      avgGain = (avgGain * (period - 1) + currentGain) / period;
      avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        const rsiVal = 100 - (100 / (1 + rs));
        result.push(parseFloat(rsiVal.toFixed(2)));
      }
    }
  }
  return result;
}

/**
 * Calculates Price Volatility (rolling annualized percentage volatility)
 */
export function calculateVolatility(data: number[], period = 20): (number | null)[] {
  const result: (number | null)[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(null);
    } else {
      // Calculate returns over period
      const returns: number[] = [];
      for (let j = i - period + 1; j <= i; j++) {
        if (j > 0) {
          returns.push(Math.log(data[j] / data[j - 1]));
        }
      }

      if (returns.length < 2) {
        result.push(null);
        continue;
      }

      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (returns.length - 1);
      const stdDev = Math.sqrt(variance);
      // Annualize volatility based on frequency (approximated for display)
      const annualizedVol = stdDev * Math.sqrt(365 * 24) * 100;
      result.push(parseFloat(Math.max(1, Math.min(200, annualizedVol)).toFixed(2)));
    }
  }
  return result;
}

/**
 * Calculates Bollinger Bands (Upper, Middle/SMA, Lower)
 */
export function calculateBollingerBands(
  data: number[],
  period = 20,
  multiplier = 2
): {
  upper: (number | null)[];
  middle: (number | null)[];
  lower: (number | null)[];
} {
  const middle = calculateSMA(data, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < data.length; i++) {
    const mid = middle[i];
    if (mid === null || i < period - 1) {
      upper.push(null);
      lower.push(null);
    } else {
      // Calculate variance of price relative to the middle SMA
      let sumSq = 0;
      for (let j = 0; j < period; j++) {
        sumSq += Math.pow(data[i - j] - mid, 2);
      }
      const stdDev = Math.sqrt(sumSq / period);
      upper.push(parseFloat((mid + multiplier * stdDev).toFixed(2)));
      lower.push(parseFloat((mid - multiplier * stdDev).toFixed(2)));
    }
  }

  return { upper, middle, lower };
}

/**
 * Recalculates all technical indicators and detects candlestick patterns across a dataset
 */
export function recalculateDataset(
  points: MarketDataPoint[],
  settings: IndicatorSettings,
  patternFilter?: PatternFilterSettings
): MarketDataPoint[] {
  if (points.length === 0) return [];
  const closes = points.map(p => p.close);

  const smaFastList = settings.showSMAFast ? calculateSMA(closes, settings.smaFastPeriod) : [];
  const smaSlowList = settings.showSMASlow ? calculateSMA(closes, settings.smaSlowPeriod) : [];
  const emaList = settings.showEMA ? calculateEMA(closes, settings.emaPeriod) : [];
  const rsiList = settings.showRSI ? calculateRSI(closes, settings.rsiPeriod) : [];
  const volList = settings.showVolatility ? calculateVolatility(closes, 14) : [];
  const bb = settings.showBollinger
    ? calculateBollingerBands(closes, settings.bollingerPeriod, settings.bollingerStdDev)
    : { upper: [], middle: [], lower: [] };

  const enrichedPoints = points.map((p, idx) => ({
    ...p,
    smaFast: settings.showSMAFast ? smaFastList[idx] : null,
    smaSlow: settings.showSMASlow ? smaSlowList[idx] : null,
    ema: settings.showEMA ? emaList[idx] : null,
    rsi: settings.showRSI ? rsiList[idx] : null,
    volatility: settings.showVolatility ? volList[idx] : null,
    bollingerUpper: settings.showBollinger ? bb.upper[idx] : null,
    bollingerMiddle: settings.showBollinger ? bb.middle[idx] : null,
    bollingerLower: settings.showBollinger ? bb.lower[idx] : null,
  }));

  // Detect candlestick patterns if enabled
  if (settings.showPatterns !== false) {
    return detectCandlestickPatterns(enrichedPoints, patternFilter);
  }

  return enrichedPoints;
}

/**
 * Generates initial synthetic market dataset reflecting realistic price action
 */
export function generateInitialMarketData(
  asset: MarketAsset,
  timeRange: TimeRange,
  count = 70
): MarketDataPoint[] {
  const points: MarketDataPoint[] = [];
  const now = Date.now();

  let intervalMs = 60 * 1000; // 1m for 1H
  if (timeRange === '15M') intervalMs = 15 * 1000;
  else if (timeRange === '1H') intervalMs = 60 * 1000;
  else if (timeRange === '4H') intervalMs = 4 * 60 * 1000;
  else if (timeRange === '24H') intervalMs = 20 * 60 * 1000;
  else if (timeRange === '7D') intervalMs = 2.4 * 3600 * 1000;
  else if (timeRange === '30D') intervalMs = 10 * 3600 * 1000;

  let currentPrice = asset.basePrice * (0.92 + Math.random() * 0.16);
  const startTime = now - count * intervalMs;

  for (let i = 0; i < count; i++) {
    const timestampMs = startTime + i * intervalMs;
    const dateObj = new Date(timestampMs);
    const timeStr = timeRange === '7D' || timeRange === '30D'
      ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })
      : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Geometric Brownian motion step with morphology variance for rich candlestick patterns
    const shock = (Math.random() - 0.49) * 2;
    const volatilityPct = asset.volatilityCoeff * 0.015;
    let priceChange = currentPrice * (volatilityPct * shock + asset.drift * 0.001);

    const open = currentPrice;
    let close = Math.max(1, currentPrice + priceChange);
    let high = Math.max(open, close);
    let low = Math.min(open, close);

    // Intentionally inject candlestick patterns periodically for educational pattern analysis
    const patternSelector = i % 8;
    const candleVol = currentPrice * volatilityPct;

    if (patternSelector === 2) {
      // Form Hammer (small body at top, long lower wick)
      close = open + (Math.random() * 0.2 - 0.08) * candleVol;
      high = Math.max(open, close) + Math.random() * 0.1 * candleVol;
      low = Math.min(open, close) - (2.2 + Math.random() * 0.8) * Math.max(0.2 * candleVol, Math.abs(close - open));
    } else if (patternSelector === 4) {
      // Form Doji (open approx equal to close)
      close = open + (Math.random() * 0.06 - 0.03) * candleVol;
      high = Math.max(open, close) + (0.8 + Math.random() * 0.6) * candleVol;
      low = Math.min(open, close) - (0.8 + Math.random() * 0.6) * candleVol;
    } else if (patternSelector === 6) {
      // Form Shooting Star (small body at bottom, long upper wick)
      close = open + (Math.random() * 0.2 - 0.12) * candleVol;
      high = Math.max(open, close) + (2.2 + Math.random() * 0.8) * Math.max(0.2 * candleVol, Math.abs(close - open));
      low = Math.min(open, close) - Math.random() * 0.1 * candleVol;
    } else {
      // Standard realistic candle with wicks
      const upperWick = Math.random() * candleVol * 0.7;
      const lowerWick = Math.random() * candleVol * 0.7;
      high = Math.max(open, close) + upperWick;
      low = Math.min(open, close) - lowerWick;
    }

    const volume = Math.round(1000 + Math.random() * 4500 + (Math.abs(shock) > 0.8 ? 5000 : 0));
    currentPrice = close;

    points.push({
      id: i + 1,
      timestamp: timeStr,
      timestampMs,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume,
    });
  }

  return points;
}

/**
 * Generates the next dynamic tick in real time
 */
export function generateNextTick(
  lastPoint: MarketDataPoint,
  asset: MarketAsset
): MarketDataPoint {
  const nextTimestampMs = lastPoint.timestampMs + 3000; // 3 sec tick
  const dateObj = new Date(nextTimestampMs);
  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Stochastic jump diffusion
  const rand = Math.random();
  let jump = 0;
  if (rand > 0.94) jump = (Math.random() - 0.48) * 0.035; // occasional breakout or dip

  const standardShock = (Math.random() - 0.495) * 2;
  const volFactor = asset.volatilityCoeff * 0.008;
  const percentChange = (standardShock * volFactor) + jump + (asset.drift * 0.0005);

  const open = lastPoint.close;
  let close = Math.max(1, open * (1 + percentChange));
  const tickVol = open * volFactor;
  let high = Math.max(open, close) + Math.random() * tickVol * 0.8;
  let low = Math.min(open, close) - Math.random() * tickVol * 0.8;

  // Occasional live candle pattern formation
  if (rand > 0.82 && rand <= 0.88) {
    // Live Hammer
    low = Math.min(open, close) - (2.1 * Math.max(0.15 * tickVol, Math.abs(close - open)));
    high = Math.max(open, close) + Math.random() * 0.1 * tickVol;
  } else if (rand > 0.88 && rand <= 0.94) {
    // Live Doji
    close = open + (Math.random() * 0.05 - 0.025) * tickVol;
    high = Math.max(open, close) + tickVol * 0.9;
    low = Math.min(open, close) - tickVol * 0.9;
  }

  const volume = Math.round(500 + Math.random() * 3000 + (Math.abs(jump) > 0 ? 4000 : 0));

  return {
    id: lastPoint.id + 1,
    timestamp: timeStr,
    timestampMs: nextTimestampMs,
    open: parseFloat(open.toFixed(2)),
    high: parseFloat(high.toFixed(2)),
    low: parseFloat(low.toFixed(2)),
    close: parseFloat(close.toFixed(2)),
    volume,
  };
}

/**
 * Evaluates momentum, trend, and risk from current indicators
 */
export function evaluateMarketInsights(points: MarketDataPoint[]) {
  if (points.length < 5) {
    return {
      trend: 'Neutral',
      rsiStatus: 'Neutral',
      riskLevel: 'Moderate',
      signal: 'Hold',
      summary: 'Accumulating market tick samples...',
    };
  }

  const latest = points[points.length - 1];
  const prev = points[points.length - 2];
  const rsi = latest.rsi ?? 50;
  const vol = latest.volatility ?? 25;

  let rsiStatus = 'Neutral';
  if (rsi >= 70) rsiStatus = 'Overbought';
  else if (rsi <= 30) rsiStatus = 'Oversold';
  else if (rsi > 55) rsiStatus = 'Bullish Momentum';
  else if (rsi < 45) rsiStatus = 'Bearish Pressure';

  let trend = 'Consolidating';
  if (latest.smaFast && latest.smaSlow) {
    if (latest.smaFast > latest.smaSlow && latest.close > latest.smaFast) {
      trend = 'Strong Uptrend';
    } else if (latest.smaFast > latest.smaSlow) {
      trend = 'Mild Uptrend';
    } else if (latest.smaFast < latest.smaSlow && latest.close < latest.smaFast) {
      trend = 'Strong Downtrend';
    } else {
      trend = 'Mild Downtrend';
    }
  }

  let riskLevel = 'Moderate';
  if (vol > 65) riskLevel = 'Extreme';
  else if (vol > 40) riskLevel = 'High';
  else if (vol < 20) riskLevel = 'Low';

  let signal = 'Hold / Monitor';
  if (rsi < 32 && trend.includes('Uptrend')) {
    signal = 'Strong Buy (Pullback Entry)';
  } else if (rsi < 30) {
    signal = 'Buy (Oversold Bounce)';
  } else if (rsi > 72 && trend.includes('Downtrend')) {
    signal = 'Strong Sell (Exhaustion)';
  } else if (rsi > 75) {
    signal = 'Take Profit / Overextended';
  } else if (trend === 'Strong Uptrend' && rsi < 65) {
    signal = 'Accumulate';
  }

  const priceDelta = latest.close - prev.close;
  const priceDeltaPct = (priceDelta / prev.close) * 100;

  const summary = `Asset trading at $${latest.close.toLocaleString()} (${priceDeltaPct >= 0 ? '+' : ''}${priceDeltaPct.toFixed(2)}%). RSI is ${rsi.toFixed(1)} (${rsiStatus}), indicating ${rsiStatus === 'Oversold' ? 'potential mean-reversion recovery' : rsiStatus === 'Overbought' ? 'stretched valuations prone to consolidation' : 'balanced supply and demand'}. Volatility stands at ${vol.toFixed(1)}% (${riskLevel} risk environment).`;

  return {
    trend,
    rsiStatus,
    riskLevel,
    signal,
    summary,
  };
}

