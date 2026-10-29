import { MarketAsset, MarketDataPoint, TimeRange } from '../types';
import { generateNextTick } from './financialCalculations';

/**
 * Normalizes an asset's price series into percentage change relative to the initial point (baseline = 0%)
 */
export function calculateNormalizedSeries(data: MarketDataPoint[]): {
  point: MarketDataPoint;
  pctReturn: number;
}[] {
  if (data.length === 0) return [];
  const basePrice = data[0].close || 1;

  return data.map((point) => {
    const pctReturn = parseFloat((((point.close - basePrice) / basePrice) * 100).toFixed(2));
    return {
      point,
      pctReturn,
    };
  });
}

/**
 * Calculates Pearson Correlation Coefficient (r) between two numeric series
 */
export function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;

  const sliceX = x.slice(0, n);
  const sliceY = y.slice(0, n);

  const meanX = sliceX.reduce((a, b) => a + b, 0) / n;
  const meanY = sliceY.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = sliceX[i] - meanX;
    const diffY = sliceY[i] - meanY;
    num += diffX * diffY;
    denX += diffX * diffX;
    denY += diffY * diffY;
  }

  const den = Math.sqrt(denX * denY);
  if (den === 0) return 0;

  return parseFloat((num / den).toFixed(2));
}

/**
 * Computes full pairwise correlation matrix for all active assets
 */
export function calculateCorrelationMatrix(
  datasets: Record<string, MarketDataPoint[]>,
  assetIds: string[]
): Record<string, Record<string, number>> {
  const matrix: Record<string, Record<string, number>> = {};

  assetIds.forEach((idA) => {
    matrix[idA] = {};
    const seriesA = datasets[idA]?.map((p) => p.close) || [];

    assetIds.forEach((idB) => {
      if (idA === idB) {
        matrix[idA][idB] = 1.0;
      } else {
        const seriesB = datasets[idB]?.map((p) => p.close) || [];
        matrix[idA][idB] = calculatePearsonCorrelation(seriesA, seriesB);
      }
    });
  });

  return matrix;
}

/**
 * Generates synchronized time-aligned historical series for multiple assets simultaneously
 */
export function generateSynchronizedMultiAssetHistory(
  assets: MarketAsset[],
  timeRange: TimeRange,
  count = 65
): Record<string, MarketDataPoint[]> {
  const now = Date.now();
  let intervalMs = 60 * 1000;
  if (timeRange === '15M') intervalMs = 15 * 1000;
  else if (timeRange === '1H') intervalMs = 60 * 1000;
  else if (timeRange === '4H') intervalMs = 4 * 60 * 1000;
  else if (timeRange === '24H') intervalMs = 20 * 60 * 1000;
  else if (timeRange === '7D') intervalMs = 2.4 * 3600 * 1000;
  else if (timeRange === '30D') intervalMs = 10 * 3600 * 1000;

  const startTime = now - count * intervalMs;
  const result: Record<string, MarketDataPoint[]> = {};

  // Macro market factor that creates cross-asset macro correlation
  const macroFactor: number[] = [];
  let currentMacro = 0;
  for (let i = 0; i < count; i++) {
    currentMacro += (Math.random() - 0.49) * 0.008;
    macroFactor.push(currentMacro);
  }

  assets.forEach((asset) => {
    const points: MarketDataPoint[] = [];
    let price = asset.basePrice * (0.95 + Math.random() * 0.1);

    // Beta to macro factor depending on asset class:
    // Crypto has high beta, Stocks moderate beta, Bonds negative or low beta, Gold inverse/safe haven
    let beta = 1.0;
    if (asset.assetClass === 'Crypto') beta = 2.2;
    else if (asset.assetClass === 'Stock') beta = 1.2;
    else if (asset.assetClass === 'Bond') beta = -0.4;
    else if (asset.assetClass === 'Commodity') beta = -0.2;

    for (let i = 0; i < count; i++) {
      const timestampMs = startTime + i * intervalMs;
      const dateObj = new Date(timestampMs);
      const timeStr = timeRange === '7D' || timeRange === '30D'
        ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })
        : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const idiosyncraticShock = (Math.random() - 0.49) * 2;
      const combinedShock = macroFactor[i] * beta + idiosyncraticShock * asset.volatilityCoeff * 0.012;
      const delta = price * (combinedShock + asset.drift * 0.001);

      const open = price;
      const close = Math.max(0.1, price + delta);
      const wick = Math.abs(close - open) * 0.6;
      const high = Math.max(open, close) + wick + Math.random() * (open * 0.002);
      const low = Math.max(0.05, Math.min(open, close) - wick - Math.random() * (open * 0.002));
      const volume = Math.round(1500 + Math.random() * 5000);

      price = close;

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

    result[asset.id] = points;
  });

  return result;
}

/**
 * Updates synchronized live tick for all active assets
 */
export function generateSynchronizedNextTick(
  prevMap: Record<string, MarketDataPoint[]>,
  assets: MarketAsset[]
): Record<string, MarketDataPoint[]> {
  const result: Record<string, MarketDataPoint[]> = {};
  const macroShock = (Math.random() - 0.495) * 0.006;

  assets.forEach((asset) => {
    const list = prevMap[asset.id];
    if (!list || list.length === 0) return;
    const last = list[list.length - 1];

    let beta = 1.0;
    if (asset.assetClass === 'Crypto') beta = 2.2;
    else if (asset.assetClass === 'Bond') beta = -0.5;
    else if (asset.assetClass === 'Commodity') beta = -0.3;

    const baseNext = generateNextTick(last, asset);
    const adjustedClose = Math.max(0.1, baseNext.close * (1 + macroShock * beta));

    const adjustedPoint: MarketDataPoint = {
      ...baseNext,
      close: parseFloat(adjustedClose.toFixed(2)),
      high: Math.max(baseNext.high, adjustedClose),
      low: Math.min(baseNext.low, adjustedClose),
    };

    result[asset.id] = [...list.slice(list.length >= 70 ? 1 : 0), adjustedPoint];
  });

  return result;
}

