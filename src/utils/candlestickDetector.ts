import { MarketDataPoint, CandlestickPattern, PatternFilterSettings } from '../types';

export const PATTERN_DEFINITIONS: Record<string, {
  name: string;
  bias: 'Bullish' | 'Bearish' | 'Neutral';
  shortCode: string;
  description: string;
  implication: string;
  reliability: 'High' | 'Medium' | 'Moderate';
  color: string;
}> = {
  HAMMER: {
    name: 'Hammer',
    bias: 'Bullish',
    shortCode: 'HMR',
    description: 'Small real body near top of trading range with long lower shadow at least twice the body height.',
    implication: 'Sellers drove prices sharply lower during the session, but aggressive buyers stepped in to push price back up near the open. Suggests exhaustion of selling pressure and potential upward reversal.',
    reliability: 'High',
    color: '#10b981',
  },
  INVERTED_HAMMER: {
    name: 'Inverted Hammer',
    bias: 'Bullish',
    shortCode: 'I-HMR',
    description: 'Small real body near bottom of trading range with long upper shadow at least twice the body height.',
    implication: 'Buyers tested higher prices, creating a long upper shadow. While sellers pushed back, buying pressure is entering the market. Wait for bullish confirmation on the following candle.',
    reliability: 'Medium',
    color: '#10b981',
  },
  SHOOTING_STAR: {
    name: 'Shooting Star',
    bias: 'Bearish',
    shortCode: 'S-STAR',
    description: 'Small real body near the bottom with a long upper shadow at least twice the body length, formed after an advance.',
    implication: 'Buyers attempted an intraday rally to new highs, but aggressive profit taking and supply rejected the advance, closing near the open. Strong warning of an impending downward reversal.',
    reliability: 'High',
    color: '#f43f5e',
  },
  BULLISH_ENGULFING: {
    name: 'Bullish Engulfing',
    bias: 'Bullish',
    shortCode: 'B-ENG',
    description: 'A large green candle whose real body completely swallows/engulfs the previous small red candle body.',
    implication: 'Bulls took total control from the bears, opening lower but rallying strongly to close higher than previous open. A premier high-probability bullish reversal signal.',
    reliability: 'High',
    color: '#10b981',
  },
  BEARISH_ENGULFING: {
    name: 'Bearish Engulfing',
    bias: 'Bearish',
    shortCode: 'BR-ENG',
    description: 'A large red candle whose real body completely engulfs the prior green candle body.',
    implication: 'Sellers overpowered buyers following an uptrend, opening higher then collapsing below previous open. Signals strong institutional distribution.',
    reliability: 'High',
    color: '#f43f5e',
  },
  DOJI: {
    name: 'Standard Doji',
    bias: 'Neutral',
    shortCode: 'DOJI',
    description: 'Open and close are virtually identical, creating a cross-shaped body with upper and lower shadows.',
    implication: 'Represents equilibrium and tug-of-war indecision between bulls and bears. When appearing after an extended trend, it frequently foretells a pause or reversal.',
    reliability: 'Medium',
    color: '#f59e0b',
  },
  DRAGONFLY_DOJI: {
    name: 'Dragonfly Doji',
    bias: 'Bullish',
    shortCode: 'D-DOJI',
    description: 'Doji formed at high of the session with a long lower shadow and virtually no upper shadow.',
    implication: 'Strong buying rejection at lower support levels. Bears failed to hold gains, leaving a bullish footprint.',
    reliability: 'High',
    color: '#10b981',
  },
  GRAVESTONE_DOJI: {
    name: 'Gravestone Doji',
    bias: 'Bearish',
    shortCode: 'G-DOJI',
    description: 'Doji formed at low of the session with a long upper shadow and virtually no lower shadow.',
    implication: 'Bulls failed to hold higher ground; price collapsed back to the low of the session. Bearish exhaustion signal.',
    reliability: 'High',
    color: '#f43f5e',
  },
  MORNING_STAR: {
    name: 'Morning Star',
    bias: 'Bullish',
    shortCode: 'M-STAR',
    description: 'Three-candle pattern: long red candle, followed by small-bodied star below, followed by strong green candle closing deep into the first candle.',
    implication: 'Classic institutional accumulation pattern heralding the end of a downtrend and beginning of a sustained upward move.',
    reliability: 'High',
    color: '#10b981',
  },
  EVENING_STAR: {
    name: 'Evening Star',
    bias: 'Bearish',
    shortCode: 'E-STAR',
    description: 'Three-candle pattern: long green candle, followed by small-bodied star at top, followed by strong red candle closing into the first candle.',
    implication: 'Classic institutional distribution pattern signaling top exhaustion and a shift to downward momentum.',
    reliability: 'High',
    color: '#f43f5e',
  },
  BULLISH_MARUBOZU: {
    name: 'Bullish Marubozu',
    bias: 'Bullish',
    shortCode: 'MRBZ-UP',
    description: 'Long green candle with almost no upper or lower shadows (open = low, close = high).',
    implication: 'Extreme unidirectional bullish momentum. Buyers controlled the session from open to close with zero hesitation.',
    reliability: 'Medium',
    color: '#10b981',
  },
  BEARISH_MARUBOZU: {
    name: 'Bearish Marubozu',
    bias: 'Bearish',
    shortCode: 'MRBZ-DN',
    description: 'Long red candle with almost no upper or lower shadows (open = high, close = low).',
    implication: 'Extreme unidirectional bearish pressure. Sellers drove price down relentlessly without any buyer rebound.',
    reliability: 'Medium',
    color: '#f43f5e',
  }
};

/**
 * Scans a sequence of candles and detects candlestick patterns in real time
 */
export function detectCandlestickPatterns(
  points: MarketDataPoint[],
  filterSettings?: PatternFilterSettings
): MarketDataPoint[] {
  if (points.length < 2) return points;

  return points.map((curr, idx) => {
    // We inspect current candle and predecessors (idx - 1, idx - 2)
    const prev = idx > 0 ? points[idx - 1] : null;
    const prev2 = idx > 1 ? points[idx - 2] : null;

    let detected: CandlestickPattern | null = null;

    const body = Math.abs(curr.close - curr.open);
    const range = Math.max(0.01, curr.high - curr.low);
    const upperShadow = curr.high - Math.max(curr.open, curr.close);
    const lowerShadow = Math.min(curr.open, curr.close) - curr.low;
    const isBullish = curr.close >= curr.open;
    const bodyRatio = body / range;

    // 1. Check Three-Candle Patterns (Morning Star & Evening Star)
    if (prev && prev2) {
      const prevBody = Math.abs(prev.close - prev.open);
      const prevRange = Math.max(0.01, prev.high - prev.low);
      const prev2Body = Math.abs(prev2.close - prev2.open);

      // Morning Star: Prev2 is long red, Prev is small body, Curr is strong green
      if (
        prev2.close < prev2.open &&
        prev2Body > 0.005 * prev2.close &&
        prevBody / prevRange < 0.35 &&
        isBullish &&
        curr.close > (prev2.open + prev2.close) / 2
      ) {
        const def = PATTERN_DEFINITIONS.MORNING_STAR;
        detected = {
          id: `pat-${curr.id}-mstar`,
          type: 'MORNING_STAR',
          name: def.name,
          bias: def.bias,
          shortCode: def.shortCode,
          description: def.description,
          implication: def.implication,
          candleIndex: idx,
          timestamp: curr.timestamp,
          price: curr.close,
          reliability: def.reliability,
          color: def.color,
        };
      }
      // Evening Star: Prev2 is long green, Prev is small star, Curr is strong red
      else if (
        prev2.close > prev2.open &&
        prev2Body > 0.005 * prev2.close &&
        prevBody / prevRange < 0.35 &&
        !isBullish &&
        curr.close < (prev2.open + prev2.close) / 2
      ) {
        const def = PATTERN_DEFINITIONS.EVENING_STAR;
        detected = {
          id: `pat-${curr.id}-estar`,
          type: 'EVENING_STAR',
          name: def.name,
          bias: def.bias,
          shortCode: def.shortCode,
          description: def.description,
          implication: def.implication,
          candleIndex: idx,
          timestamp: curr.timestamp,
          price: curr.close,
          reliability: def.reliability,
          color: def.color,
        };
      }
    }

    // 2. Check Two-Candle Patterns (Engulfing)
    if (!detected && prev) {
      const prevBody = Math.abs(prev.close - prev.open);
      const prevIsBullish = prev.close >= prev.open;

      // Bullish Engulfing
      if (
        !prevIsBullish &&
        isBullish &&
        curr.open <= prev.close &&
        curr.close >= prev.open &&
        body > prevBody * 1.05
      ) {
        const def = PATTERN_DEFINITIONS.BULLISH_ENGULFING;
        detected = {
          id: `pat-${curr.id}-beng`,
          type: 'BULLISH_ENGULFING',
          name: def.name,
          bias: def.bias,
          shortCode: def.shortCode,
          description: def.description,
          implication: def.implication,
          candleIndex: idx,
          timestamp: curr.timestamp,
          price: curr.close,
          reliability: def.reliability,
          color: def.color,
        };
      }
      // Bearish Engulfing
      else if (
        prevIsBullish &&
        !isBullish &&
        curr.open >= prev.close &&
        curr.close <= prev.open &&
        body > prevBody * 1.05
      ) {
        const def = PATTERN_DEFINITIONS.BEARISH_ENGULFING;
        detected = {
          id: `pat-${curr.id}-breng`,
          type: 'BEARISH_ENGULFING',
          name: def.name,
          bias: def.bias,
          shortCode: def.shortCode,
          description: def.description,
          implication: def.implication,
          candleIndex: idx,
          timestamp: curr.timestamp,
          price: curr.close,
          reliability: def.reliability,
          color: def.color,
        };
      }
    }

    // 3. Check Single Candle Patterns
    if (!detected) {
      // Doji family (body <= 10% of total range)
      if (bodyRatio <= 0.12) {
        if (lowerShadow >= 2.5 * upperShadow && upperShadow <= 0.15 * range) {
          const def = PATTERN_DEFINITIONS.DRAGONFLY_DOJI;
          detected = {
            id: `pat-${curr.id}-ddoji`,
            type: 'DRAGONFLY_DOJI',
            name: def.name,
            bias: def.bias,
            shortCode: def.shortCode,
            description: def.description,
            implication: def.implication,
            candleIndex: idx,
            timestamp: curr.timestamp,
            price: curr.close,
            reliability: def.reliability,
            color: def.color,
          };
        } else if (upperShadow >= 2.5 * lowerShadow && lowerShadow <= 0.15 * range) {
          const def = PATTERN_DEFINITIONS.GRAVESTONE_DOJI;
          detected = {
            id: `pat-${curr.id}-gdoji`,
            type: 'GRAVESTONE_DOJI',
            name: def.name,
            bias: def.bias,
            shortCode: def.shortCode,
            description: def.description,
            implication: def.implication,
            candleIndex: idx,
            timestamp: curr.timestamp,
            price: curr.close,
            reliability: def.reliability,
            color: def.color,
          };
        } else {
          const def = PATTERN_DEFINITIONS.DOJI;
          detected = {
            id: `pat-${curr.id}-doji`,
            type: 'DOJI',
            name: def.name,
            bias: def.bias,
            shortCode: def.shortCode,
            description: def.description,
            implication: def.implication,
            candleIndex: idx,
            timestamp: curr.timestamp,
            price: curr.close,
            reliability: def.reliability,
            color: def.color,
          };
        }
      }
      // Hammer (long lower wick >= 2x body, tiny upper wick)
      else if (
        lowerShadow >= 2.0 * body &&
        upperShadow <= 0.3 * body &&
        bodyRatio > 0.12 &&
        bodyRatio < 0.45
      ) {
        const def = PATTERN_DEFINITIONS.HAMMER;
        detected = {
          id: `pat-${curr.id}-hammer`,
          type: 'HAMMER',
          name: def.name,
          bias: def.bias,
          shortCode: def.shortCode,
          description: def.description,
          implication: def.implication,
          candleIndex: idx,
          timestamp: curr.timestamp,
          price: curr.close,
          reliability: def.reliability,
          color: def.color,
        };
      }
      // Shooting Star (long upper wick >= 2x body, tiny lower wick)
      else if (
        upperShadow >= 2.0 * body &&
        lowerShadow <= 0.3 * body &&
        bodyRatio > 0.12 &&
        bodyRatio < 0.45
      ) {
        const def = PATTERN_DEFINITIONS.SHOOTING_STAR;
        detected = {
          id: `pat-${curr.id}-sstar`,
          type: 'SHOOTING_STAR',
          name: def.name,
          bias: def.bias,
          shortCode: def.shortCode,
          description: def.description,
          implication: def.implication,
          candleIndex: idx,
          timestamp: curr.timestamp,
          price: curr.close,
          reliability: def.reliability,
          color: def.color,
        };
      }
      // Marubozu (Body occupies > 88% of range)
      else if (bodyRatio >= 0.88 && range > 0.003 * curr.close) {
        if (isBullish) {
          const def = PATTERN_DEFINITIONS.BULLISH_MARUBOZU;
          detected = {
            id: `pat-${curr.id}-bmrbz`,
            type: 'BULLISH_MARUBOZU',
            name: def.name,
            bias: def.bias,
            shortCode: def.shortCode,
            description: def.description,
            implication: def.implication,
            candleIndex: idx,
            timestamp: curr.timestamp,
            price: curr.close,
            reliability: def.reliability,
            color: def.color,
          };
        } else {
          const def = PATTERN_DEFINITIONS.BEARISH_MARUBOZU;
          detected = {
            id: `pat-${curr.id}-brmrbz`,
            type: 'BEARISH_MARUBOZU',
            name: def.name,
            bias: def.bias,
            shortCode: def.shortCode,
            description: def.description,
            implication: def.implication,
            candleIndex: idx,
            timestamp: curr.timestamp,
            price: curr.close,
            reliability: def.reliability,
            color: def.color,
          };
        }
      }
    }

    // Apply user filters if active
    if (detected && filterSettings) {
      if (filterSettings.enabled === false) {
        detected = null;
      } else {
        if (
          filterSettings.selectedBias !== 'ALL' &&
          detected.bias.toUpperCase() !== filterSettings.selectedBias
        ) {
          detected = null;
        } else if (
          filterSettings.selectedTypes.length > 0 &&
          !filterSettings.selectedTypes.includes(detected.type)
        ) {
          detected = null;
        }
      }
    }

    return {
      ...curr,
      detectedPattern: detected,
    };
  });
}

