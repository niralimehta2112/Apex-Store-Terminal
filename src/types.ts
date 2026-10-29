export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  category: 'Hardware' | 'Wearables' | 'Cloud & AI' | 'Accessories' | 'Audio';
  image: string;
  badge?: string;
  stock: number;
  tags: string[];
  specs: Record<string, string>;
  features: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface MarketDataPoint {
  id: number;
  timestamp: string; // ISO or formatted time
  timestampMs: number;
  open: number;
  high: number;
  low: number;
  close: number; // Primary price metric
  volume: number;
  
  // Computed Technical Indicators
  smaFast?: number | null; // e.g. 7-period
  smaSlow?: number | null; // e.g. 21-period
  ema?: number | null;     // e.g. 14-period
  rsi?: number | null;     // 14-period RSI (0 - 100)
  volatility?: number | null; // Rolling std dev annualized (%)
  bollingerUpper?: number | null;
  bollingerMiddle?: number | null;
  bollingerLower?: number | null;

  // Candlestick Pattern (Requirement #4)
  detectedPattern?: CandlestickPattern | null;

  // Custom Strategy Execution Signal (Requirement #1)
  strategySignal?: StrategySignal | null;
}

export type AssetClass = 'Stock' | 'Bond' | 'Crypto' | 'Commodity' | 'Index';

export interface MarketAsset {
  id: string;
  name: string;
  symbol: string;
  category: string;
  assetClass?: AssetClass;
  unit: string;
  basePrice: number;
  currentPrice: number;
  change24h: number;
  change24hPct: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  volatilityScore: number; // percentage
  rsiCurrent: number;
  drift: number;
  volatilityCoeff: number;
  description: string;
  color?: string;
}

export type MultiAssetChartType = 'line' | 'area' | 'bar' | 'candlestick';
export type MultiAssetMode = 'percent' | 'price';

export interface MultiAssetSeriesConfig {
  assetId: string;
  visible: boolean;
  chartType: MultiAssetChartType;
  color: string;
}

export interface IndicatorSettings {
  showSMAFast: boolean;
  showSMASlow: boolean;
  showEMA: boolean;
  showBollinger: boolean;
  showVolatility: boolean;
  showRSI: boolean;
  showVolume: boolean;
  showPatterns: boolean; // Requirement #4
  smaFastPeriod: number;
  smaSlowPeriod: number;
  emaPeriod: number;
  rsiPeriod: number;
  bollingerPeriod: number;
  bollingerStdDev: number;
}

export type TimeRange = '15M' | '1H' | '4H' | '24H' | '7D' | '30D';
export type ChartDisplayMode = 'candles' | 'line';

/* =========================================================================
   Candlestick Pattern Recognition Types (Requirement #4)
   ========================================================================= */

export type PatternType =
  | 'HAMMER'
  | 'INVERTED_HAMMER'
  | 'DOJI'
  | 'DRAGONFLY_DOJI'
  | 'GRAVESTONE_DOJI'
  | 'BULLISH_ENGULFING'
  | 'BEARISH_ENGULFING'
  | 'SHOOTING_STAR'
  | 'MORNING_STAR'
  | 'EVENING_STAR'
  | 'BULLISH_MARUBOZU'
  | 'BEARISH_MARUBOZU';

export interface CandlestickPattern {
  id: string;
  type: PatternType;
  name: string;
  bias: 'Bullish' | 'Bearish' | 'Neutral';
  shortCode: string;
  description: string;
  implication: string;
  candleIndex: number;
  timestamp: string;
  price: number;
  reliability: 'High' | 'Medium' | 'Moderate';
  color: string;
  iconName?: string;
}

export interface PatternFilterSettings {
  enabled: boolean;
  selectedBias: 'ALL' | 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  selectedTypes: string[]; // empty array means all types
}

/* =========================================================================
   Order Confirmation Types
   ========================================================================= */

export interface OrderConfirmation {
  orderId: string;
  date: string;
  items: CartItem[];
  total: number;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
}

/* =========================================================================
   Portfolio Simulation Types (Requirement #5)
   ========================================================================= */

export interface PortfolioHolding {
  assetId: string;
  symbol: string;
  name: string;
  shares: number;
  avgCostBasis: number;
  totalCost: number;
  realizedPnl: number;
}

export interface TradeRecord {
  id: string;
  timestamp: string;
  timestampMs: number;
  assetId: string;
  symbol: string;
  name: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  fee: number;
  total: number;
  realizedPnl?: number;
  returnPct?: number;
}

export interface PortfolioState {
  cashBalance: number;
  initialBalance: number;
  holdings: Record<string, PortfolioHolding>;
  trades: TradeRecord[];
  feePerTrade: number;
  slippagePct: number;
}

export interface AssetAllocationItem {
  id: string;
  name: string;
  symbol: string;
  value: number;
  percentage: number;
  color: string;
}

/* =========================================================================
   User Authentication & Cloud Persistence Types (Requirement #2)
   ========================================================================= */

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Quantitative Trader' | 'Hedge Fund Analyst' | 'Portfolio Manager' | 'Retail Investor';
  createdAt: string;
}

export interface UserDataDocument {
  profile: UserProfile;
  portfolio: PortfolioState;
  watchlist: string[];
  indicatorSettings: IndicatorSettings;
  patternFilters: PatternFilterSettings;
  multiAssetConfigs: Record<string, MultiAssetSeriesConfig>;
  multiAssetMode: MultiAssetMode;
  chartMode: ChartDisplayMode;
  cart: CartItem[];
  wishlistIds: string[];
  strategies?: StrategyRule[];
  lastSyncedAt: string;
}

/* =========================================================================
   Custom Strategy & Indicator Rule Types (Requirement #1)
   ========================================================================= */

export type StrategyIndicatorType = 'PRICE' | 'SMA' | 'EMA' | 'RSI' | 'BOLLINGER_UPPER' | 'BOLLINGER_LOWER';
export type StrategyOperator = 'CROSSES_ABOVE' | 'CROSSES_BELOW' | 'GREATER_THAN' | 'LESS_THAN';

export interface StrategyCondition {
  indicator: StrategyIndicatorType;
  period: number;
  operator: StrategyOperator;
  targetType: 'INDICATOR' | 'CONSTANT';
  targetIndicator?: StrategyIndicatorType;
  targetPeriod?: number;
  targetConstant?: number;
}

export interface StrategyRule {
  id: string;
  name: string;
  assetId: string;
  enabled: boolean;
  autoTrade: boolean; // Auto-executes into live paper portfolio
  buyCondition: StrategyCondition;
  sellCondition: StrategyCondition;
  shares: number;
  stopLossPct?: number;
  takeProfitPct?: number;
  description: string;
  createdAt: string;
}

export interface StrategySignal {
  id: string;
  timestamp: string;
  candleIndex: number;
  assetId: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  price: number;
  shares: number;
  ruleName: string;
  reason: string;
}

export interface BacktestResult {
  strategyId: string;
  strategyName: string;
  assetSymbol: string;
  initialCapital: number;
  endingCapital: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnl: number;
  totalPnlPct: number;
  maxDrawdownPct: number;
  profitFactor: number;
  signals: StrategySignal[];
  equityCurve: { timestamp: string; equity: number }[];
}

