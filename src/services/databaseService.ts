import {
  UserDataDocument,
  UserProfile,
  PortfolioState,
  IndicatorSettings,
  PatternFilterSettings,
  MultiAssetSeriesConfig,
  MultiAssetMode,
  ChartDisplayMode
} from '../types';
import { INITIAL_ASSETS } from '../data/mockAssets';
import { INITIAL_PRODUCTS } from '../data/mockProducts';
import { DEFAULT_STRATEGIES } from '../utils/strategyEngine';

const DB_PREFIX = 'apex_cloud_db_doc_';

// Initial default data for Alexander Wright (Tech & Crypto Focus)
const DEFAULT_ALEX_DATA: Omit<UserDataDocument, 'profile'> = {
  portfolio: {
    cashBalance: 42350.00,
    initialBalance: 100000.00,
    holdings: {
      nvst: {
        assetId: 'nvst',
        symbol: 'NVST',
        name: 'Neural Vector Silicon Corp',
        shares: 45,
        avgCostBasis: 580.00,
        totalCost: 45 * 580.00,
        realizedPnl: 0,
      },
      btc: {
        assetId: 'btc',
        symbol: 'BTC/USD',
        name: 'Apex Bitcoin Spot Index',
        shares: 0.35,
        avgCostBasis: 63200.00,
        totalCost: 0.35 * 63200.00,
        realizedPnl: 0,
      },
      crno: {
        assetId: 'crno',
        symbol: 'CRNO',
        name: 'ChronoPulse BioTelemetry',
        shares: 50,
        avgCostBasis: 175.00,
        totalCost: 50 * 175.00,
        realizedPnl: 0,
      }
    },
    trades: [
      {
        id: 'TRD-ALEX-01',
        timestamp: 'Oct 26, 09:30:15 AM',
        timestampMs: Date.now() - 3600 * 24 * 1000 * 3,
        assetId: 'nvst',
        symbol: 'NVST',
        name: 'Neural Vector Silicon Corp',
        type: 'BUY',
        shares: 45,
        price: 580.00,
        fee: 14.05,
        total: 45 * 580.00 + 14.05,
      },
      {
        id: 'TRD-ALEX-02',
        timestamp: 'Oct 27, 02:15:42 PM',
        timestampMs: Date.now() - 3600 * 24 * 1000 * 2,
        assetId: 'btc',
        symbol: 'BTC/USD',
        name: 'Apex Bitcoin Spot Index',
        type: 'BUY',
        shares: 0.35,
        price: 63200.00,
        fee: 12.06,
        total: 0.35 * 63200.00 + 12.06,
      }
    ],
    feePerTrade: 1.00,
    slippagePct: 0.05,
  },
  watchlist: ['nvst', 'btc', 'crno', 'acx', 'arc'],
  indicatorSettings: {
    showSMAFast: true,
    showSMASlow: true,
    showEMA: true,
    showBollinger: true,
    showVolatility: true,
    showRSI: true,
    showVolume: true,
    showPatterns: true,
    smaFastPeriod: 7,
    smaSlowPeriod: 21,
    emaPeriod: 14,
    rsiPeriod: 14,
    bollingerPeriod: 20,
    bollingerStdDev: 2,
  },
  patternFilters: {
    enabled: true,
    selectedBias: 'ALL',
    selectedTypes: [],
  },
  multiAssetConfigs: {
    nvst: { assetId: 'nvst', visible: true, chartType: 'candlestick', color: '#06b6d4' },
    btc: { assetId: 'btc', visible: true, chartType: 'line', color: '#f59e0b' },
    acx: { assetId: 'acx', visible: true, chartType: 'area', color: '#a855f7' },
    arc: { assetId: 'arc', visible: true, chartType: 'line', color: '#6366f1' },
    usb10y: { assetId: 'usb10y', visible: false, chartType: 'line', color: '#3b82f6' },
    corpb: { assetId: 'corpb', visible: false, chartType: 'line', color: '#60a5fa' },
    gold: { assetId: 'gold', visible: false, chartType: 'line', color: '#eab308' },
  },
  multiAssetMode: 'percent',
  chartMode: 'candles',
  cart: [{ product: INITIAL_PRODUCTS[0], quantity: 1 }],
  wishlistIds: ['prod-1', 'prod-3'],
  strategies: DEFAULT_STRATEGIES,
  lastSyncedAt: new Date().toISOString(),
};

// Initial default data for Elena Rostova (Bonds & Commodities Defensive Focus)
const DEFAULT_ELENA_DATA: Omit<UserDataDocument, 'profile'> = {
  portfolio: {
    cashBalance: 24800.00,
    initialBalance: 100000.00,
    holdings: {
      gold: {
        assetId: 'gold',
        symbol: 'GOLD',
        name: 'Apex Physical Gold Bullion Futures',
        shares: 18,
        avgCostBasis: 2710.00,
        totalCost: 18 * 2710.00,
        realizedPnl: 0,
      },
      corpb: {
        assetId: 'corpb',
        symbol: 'CORPB',
        name: 'Apex AAA Corporate Bond ETF',
        shares: 250,
        avgCostBasis: 104.20,
        totalCost: 250 * 104.20,
        realizedPnl: 0,
      }
    },
    trades: [
      {
        id: 'TRD-ELENA-01',
        timestamp: 'Oct 25, 10:45:00 AM',
        timestampMs: Date.now() - 3600 * 24 * 1000 * 4,
        assetId: 'gold',
        symbol: 'GOLD',
        name: 'Apex Physical Gold Bullion Futures',
        type: 'BUY',
        shares: 18,
        price: 2710.00,
        fee: 25.39,
        total: 18 * 2710.00 + 25.39,
      },
      {
        id: 'TRD-ELENA-02',
        timestamp: 'Oct 26, 03:20:10 PM',
        timestampMs: Date.now() - 3600 * 24 * 1000 * 3,
        assetId: 'corpb',
        symbol: 'CORPB',
        name: 'Apex AAA Corporate Bond ETF',
        type: 'BUY',
        shares: 250,
        price: 104.20,
        fee: 14.02,
        total: 250 * 104.20 + 14.02,
      }
    ],
    feePerTrade: 1.00,
    slippagePct: 0.05,
  },
  watchlist: ['gold', 'corpb', 'usb10y', 'arc'],
  indicatorSettings: {
    showSMAFast: false,
    showSMASlow: false,
    showEMA: true,
    showBollinger: true,
    showVolatility: true,
    showRSI: true,
    showVolume: true,
    showPatterns: false,
    smaFastPeriod: 7,
    smaSlowPeriod: 21,
    emaPeriod: 14,
    rsiPeriod: 14,
    bollingerPeriod: 20,
    bollingerStdDev: 2,
  },
  patternFilters: {
    enabled: false,
    selectedBias: 'ALL',
    selectedTypes: [],
  },
  multiAssetConfigs: {
    gold: { assetId: 'gold', visible: true, chartType: 'area', color: '#eab308' },
    corpb: { assetId: 'corpb', visible: true, chartType: 'line', color: '#60a5fa' },
    usb10y: { assetId: 'usb10y', visible: true, chartType: 'line', color: '#3b82f6' },
    arc: { assetId: 'arc', visible: true, chartType: 'line', color: '#6366f1' },
    nvst: { assetId: 'nvst', visible: false, chartType: 'line', color: '#06b6d4' },
    btc: { assetId: 'btc', visible: false, chartType: 'line', color: '#f59e0b' },
    acx: { assetId: 'acx', visible: false, chartType: 'line', color: '#a855f7' },
  },
  multiAssetMode: 'percent',
  chartMode: 'line',
  cart: [{ product: INITIAL_PRODUCTS[1], quantity: 1 }],
  wishlistIds: ['prod-2'],
  strategies: DEFAULT_STRATEGIES,
  lastSyncedAt: new Date().toISOString(),
};

/**
 * Loads a user's persistent cloud database document
 */
export function loadUserDataDocument(user: UserProfile): UserDataDocument {
  const key = `${DB_PREFIX}${user.uid}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        profile: user,
      };
    }
  } catch (e) {
    console.error('Failed to load user document from database', e);
  }

  // Pre-seed template if new or first time login
  let templateData: Omit<UserDataDocument, 'profile'>;
  if (user.uid === 'usr-alex-001') {
    templateData = DEFAULT_ALEX_DATA;
  } else if (user.uid === 'usr-elena-002') {
    templateData = DEFAULT_ELENA_DATA;
  } else {
    // Fresh template for newly registered custom user
    templateData = {
      portfolio: {
        cashBalance: 100000.00,
        initialBalance: 100000.00,
        holdings: {},
        trades: [],
        feePerTrade: 1.00,
        slippagePct: 0.05,
      },
      watchlist: ['nvst', 'btc', 'gold', 'arc'],
      indicatorSettings: {
        showSMAFast: true,
        showSMASlow: true,
        showEMA: true,
        showBollinger: true,
        showVolatility: true,
        showRSI: true,
        showVolume: true,
        showPatterns: true,
        smaFastPeriod: 7,
        smaSlowPeriod: 21,
        emaPeriod: 14,
        rsiPeriod: 14,
        bollingerPeriod: 20,
        bollingerStdDev: 2,
      },
      patternFilters: {
        enabled: true,
        selectedBias: 'ALL',
        selectedTypes: [],
      },
      multiAssetConfigs: {
        nvst: { assetId: 'nvst', visible: true, chartType: 'candlestick', color: '#06b6d4' },
        btc: { assetId: 'btc', visible: true, chartType: 'line', color: '#f59e0b' },
        gold: { assetId: 'gold', visible: true, chartType: 'area', color: '#eab308' },
        arc: { assetId: 'arc', visible: true, chartType: 'line', color: '#6366f1' },
      },
      multiAssetMode: 'percent',
      chartMode: 'candles',
      cart: [],
      wishlistIds: [],
      strategies: DEFAULT_STRATEGIES,
      lastSyncedAt: new Date().toISOString(),
    };
  }

  const completeDoc: UserDataDocument = {
    ...templateData,
    profile: user,
  };

  saveUserDataDocument(user.uid, completeDoc);
  return completeDoc;
}

/**
 * Saves and syncs changes to the user's database document
 */
export function saveUserDataDocument(
  uid: string,
  doc: Partial<UserDataDocument>
): void {
  const key = `${DB_PREFIX}${uid}`;
  try {
    const existingRaw = localStorage.getItem(key);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    const updated = {
      ...existing,
      ...doc,
      lastSyncedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to write to cloud database', e);
  }
}

