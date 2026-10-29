import { PortfolioState, TradeRecord, MarketAsset, PortfolioHolding } from '../types';

const STORAGE_KEY = 'apex_portfolio_sim_v1';

export const DEFAULT_INITIAL_BALANCE = 100000; // $100,000 Paper Trading Cash

export function getInitialPortfolio(): PortfolioState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse portfolio from localStorage', e);
  }

  // Pre-seed an exciting initial portfolio so the user gets instant feedback
  const initialTrades: TradeRecord[] = [
    {
      id: 'TRD-INIT-01',
      timestamp: new Date(Date.now() - 3600 * 24 * 1000 * 3).toLocaleString(),
      timestampMs: Date.now() - 3600 * 24 * 1000 * 3,
      assetId: 'nvst',
      symbol: 'NVST',
      name: 'Neural Vector Silicon Corp',
      type: 'BUY',
      shares: 35,
      price: 585.00,
      fee: 11.24,
      total: 35 * 585.00 + 11.24,
    },
    {
      id: 'TRD-INIT-02',
      timestamp: new Date(Date.now() - 3600 * 24 * 1000 * 2).toLocaleString(),
      timestampMs: Date.now() - 3600 * 24 * 1000 * 2,
      assetId: 'arc',
      symbol: 'ARC',
      name: 'Apex Retail Composite',
      type: 'BUY',
      shares: 12,
      price: 1390.00,
      fee: 9.34,
      total: 12 * 1390.00 + 9.34,
    },
    {
      id: 'TRD-INIT-03',
      timestamp: new Date(Date.now() - 3600 * 24 * 1000 * 1).toLocaleString(),
      timestampMs: Date.now() - 3600 * 24 * 1000 * 1,
      assetId: 'crno',
      symbol: 'CRNO',
      name: 'ChronoPulse BioTelemetry',
      type: 'BUY',
      shares: 40,
      price: 172.50,
      fee: 4.45,
      total: 40 * 172.50 + 4.45,
    }
  ];

  const totalSpent = initialTrades.reduce((acc, t) => acc + t.total, 0);

  const initialHoldings: Record<string, PortfolioHolding> = {
    nvst: {
      assetId: 'nvst',
      symbol: 'NVST',
      name: 'Neural Vector Silicon Corp',
      shares: 35,
      avgCostBasis: 585.00,
      totalCost: 35 * 585.00,
      realizedPnl: 0,
    },
    arc: {
      assetId: 'arc',
      symbol: 'ARC',
      name: 'Apex Retail Composite',
      shares: 12,
      avgCostBasis: 1390.00,
      totalCost: 12 * 1390.00,
      realizedPnl: 0,
    },
    crno: {
      assetId: 'crno',
      symbol: 'CRNO',
      name: 'ChronoPulse BioTelemetry',
      shares: 40,
      avgCostBasis: 172.50,
      totalCost: 40 * 172.50,
      realizedPnl: 0,
    }
  };

  return {
    cashBalance: parseFloat((DEFAULT_INITIAL_BALANCE - totalSpent).toFixed(2)),
    initialBalance: DEFAULT_INITIAL_BALANCE,
    holdings: initialHoldings,
    trades: initialTrades,
    feePerTrade: 1.00, // $1.00 base broker ticket charge
    slippagePct: 0.05, // 0.05% execution slippage / exchange fee
  };
}

export function savePortfolioToStorage(state: PortfolioState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save portfolio', e);
  }
}

/**
 * Calculates transaction fee including broker commission + exchange liquidity fee
 */
export function calculateTransactionFee(
  tradeAmount: number,
  baseFee = 1.00,
  slippagePct = 0.05
): number {
  const fee = baseFee + (tradeAmount * (slippagePct / 100));
  return parseFloat(fee.toFixed(2));
}

/**
 * Executes a simulated BUY order
 */
export function processBuyOrder(
  state: PortfolioState,
  asset: MarketAsset,
  shares: number,
  marketPrice: number
): { success: boolean; newState: PortfolioState; message: string; trade?: TradeRecord } {
  if (shares <= 0 || isNaN(shares)) {
    return { success: false, newState: state, message: 'Shares must be greater than zero.' };
  }

  // Realistic execution price with slight micro-slippage
  const slippageMultiplier = 1 + (Math.random() * 0.0006 - 0.0002);
  const executedPrice = parseFloat((marketPrice * slippageMultiplier).toFixed(2));
  const principal = shares * executedPrice;
  const fee = calculateTransactionFee(principal, state.feePerTrade, state.slippagePct);
  const totalCost = parseFloat((principal + fee).toFixed(2));

  if (state.cashBalance < totalCost) {
    return {
      success: false,
      newState: state,
      message: `Insufficient cash. Total required is $${totalCost.toLocaleString()} (incl. $${fee.toFixed(2)} fees), but you only have $${state.cashBalance.toLocaleString()}.`
    };
  }

  const existingHolding = state.holdings[asset.id];
  let updatedHolding: PortfolioHolding;

  if (existingHolding && existingHolding.shares > 0) {
    const combinedShares = existingHolding.shares + shares;
    const combinedCost = (existingHolding.shares * existingHolding.avgCostBasis) + principal;
    const newAvgCost = parseFloat((combinedCost / combinedShares).toFixed(2));

    updatedHolding = {
      ...existingHolding,
      shares: combinedShares,
      avgCostBasis: newAvgCost,
      totalCost: combinedCost,
    };
  } else {
    updatedHolding = {
      assetId: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      shares,
      avgCostBasis: executedPrice,
      totalCost: principal,
      realizedPnl: existingHolding ? existingHolding.realizedPnl : 0,
    };
  }

  const trade: TradeRecord = {
    id: `TRD-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    timestampMs: Date.now(),
    assetId: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    type: 'BUY',
    shares,
    price: executedPrice,
    fee,
    total: totalCost,
  };

  const newState: PortfolioState = {
    ...state,
    cashBalance: parseFloat((state.cashBalance - totalCost).toFixed(2)),
    holdings: {
      ...state.holdings,
      [asset.id]: updatedHolding,
    },
    trades: [trade, ...state.trades],
  };

  savePortfolioToStorage(newState);

  return {
    success: true,
    newState,
    message: `Successfully bought ${shares} shares of ${asset.symbol} at $${executedPrice.toFixed(2)} (Fee: $${fee.toFixed(2)})`,
    trade
  };
}

/**
 * Executes a simulated SELL order
 */
export function processSellOrder(
  state: PortfolioState,
  asset: MarketAsset,
  shares: number,
  marketPrice: number
): { success: boolean; newState: PortfolioState; message: string; trade?: TradeRecord } {
  if (shares <= 0 || isNaN(shares)) {
    return { success: false, newState: state, message: 'Shares must be greater than zero.' };
  }

  const existingHolding = state.holdings[asset.id];
  if (!existingHolding || existingHolding.shares < shares) {
    const available = existingHolding ? existingHolding.shares : 0;
    return {
      success: false,
      newState: state,
      message: `Cannot sell ${shares} shares. You only own ${available} shares of ${asset.symbol}.`
    };
  }

  // Realistic execution price
  const slippageMultiplier = 1 - (Math.random() * 0.0006 - 0.0002);
  const executedPrice = parseFloat((marketPrice * slippageMultiplier).toFixed(2));
  const grossProceeds = shares * executedPrice;
  const fee = calculateTransactionFee(grossProceeds, state.feePerTrade, state.slippagePct);
  const netProceeds = parseFloat((grossProceeds - fee).toFixed(2));

  // Realized P&L = (ExecutedPrice - CostBasis) * Shares - Fee
  const costOfSharesSold = shares * existingHolding.avgCostBasis;
  const tradeRealizedPnl = parseFloat((grossProceeds - costOfSharesSold - fee).toFixed(2));
  const returnPct = parseFloat(((tradeRealizedPnl / costOfSharesSold) * 100).toFixed(2));

  const remainingShares = existingHolding.shares - shares;
  const updatedHolding: PortfolioHolding = {
    ...existingHolding,
    shares: remainingShares,
    totalCost: remainingShares * existingHolding.avgCostBasis,
    realizedPnl: parseFloat((existingHolding.realizedPnl + tradeRealizedPnl).toFixed(2)),
  };

  const trade: TradeRecord = {
    id: `TRD-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    timestampMs: Date.now(),
    assetId: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    type: 'SELL',
    shares,
    price: executedPrice,
    fee,
    total: netProceeds,
    realizedPnl: tradeRealizedPnl,
    returnPct,
  };

  const updatedHoldings = { ...state.holdings };
  if (remainingShares === 0) {
    // Keep holding record for realized P&L historical stats
    updatedHoldings[asset.id] = updatedHolding;
  } else {
    updatedHoldings[asset.id] = updatedHolding;
  }

  const newState: PortfolioState = {
    ...state,
    cashBalance: parseFloat((state.cashBalance + netProceeds).toFixed(2)),
    holdings: updatedHoldings,
    trades: [trade, ...state.trades],
  };

  savePortfolioToStorage(newState);

  return {
    success: true,
    newState,
    message: `Successfully sold ${shares} shares of ${asset.symbol} at $${executedPrice.toFixed(2)} (Net P&L: ${tradeRealizedPnl >= 0 ? '+' : ''}$${tradeRealizedPnl.toFixed(2)})`,
    trade
  };
}

/**
 * Resets portfolio back to pristine starting cash
 */
export function resetPortfolioState(initialCash = DEFAULT_INITIAL_BALANCE): PortfolioState {
  const fresh: PortfolioState = {
    cashBalance: initialCash,
    initialBalance: initialCash,
    holdings: {},
    trades: [],
    feePerTrade: 1.00,
    slippagePct: 0.05,
  };
  savePortfolioToStorage(fresh);
  return fresh;
}

