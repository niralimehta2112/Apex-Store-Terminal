import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Product,
  CartItem,
  OrderConfirmation,
  MarketAsset,
  MarketDataPoint,
  PortfolioState,
  UserProfile,
  UserDataDocument,
  StrategyRule
} from './types';
import { INITIAL_PRODUCTS } from './data/mockProducts';
import { INITIAL_ASSETS } from './data/mockAssets';
import { Navbar, NavTab } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { WatchlistBar } from './components/common/WatchlistBar';
import { ProductCatalog } from './components/shop/ProductCatalog';
import { ProductDetailModal } from './components/shop/ProductDetailModal';
import { CartDrawer } from './components/shop/CartDrawer';
import { CheckoutModal } from './components/shop/CheckoutModal';
import { WishlistModal } from './components/shop/WishlistModal';
import { MarketDashboard } from './components/analytics/MarketDashboard';
import { PortfolioSimulator } from './components/portfolio/PortfolioSimulator';
import { StrategyManagerView } from './components/strategy/StrategyManagerView';
import { AuthModal } from './components/auth/AuthModal';
import { getCurrentUser, signOutUser } from './services/authService';
import { loadUserDataDocument, saveUserDataDocument } from './services/databaseService';
import { getInitialPortfolio, processBuyOrder, processSellOrder } from './utils/portfolioManager';
import { DEFAULT_STRATEGIES, evaluateCondition } from './utils/strategyEngine';
import { generateSynchronizedMultiAssetHistory, generateSynchronizedNextTick } from './utils/multiAssetCalculations';
import { Zap } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('portfolio');
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_ASSETS);

  // Authentication & Cloud Persistence State (Requirement #2)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'demo'>('signin');

  // User Document in Database
  const [userDoc, setUserDoc] = useState<UserDataDocument | null>(() => {
    const user = getCurrentUser();
    return user ? loadUserDataDocument(user) : null;
  });

  // User Watchlist (Array of stock/crypto asset IDs)
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    return userDoc ? userDoc.watchlist : ['nvst', 'btc', 'gold', 'arc'];
  });

  // Portfolio State (User specific)
  const [portfolio, setPortfolio] = useState<PortfolioState>(() => {
    return userDoc ? userDoc.portfolio : getInitialPortfolio();
  });

  // User Custom Trading Strategies (Requirement #1)
  const [strategies, setStrategies] = useState<StrategyRule[]>(() => {
    return userDoc?.strategies || DEFAULT_STRATEGIES;
  });

  // Synchronized historical datasets for backtesting & live simulation
  const [datasets, setDatasets] = useState<Record<string, MarketDataPoint[]>>(() => {
    return generateSynchronizedMultiAssetHistory(INITIAL_ASSETS, '24H', 65);
  });

  // Real-Time Algorithmic Execution Alert Banner
  const [algoAlert, setAlgoAlert] = useState<{ message: string; type: 'BUY' | 'SELL' } | null>(null);

  // Storefront Cart & Saved Items (User specific)
  const [cart, setCart] = useState<CartItem[]>(() => {
    return userDoc ? userDoc.cart : [{ product: INITIAL_PRODUCTS[1], quantity: 1 }];
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    return userDoc ? userDoc.wishlistIds : ['prod-1', 'prod-3'];
  });

  // Drawers & Modals
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Discount Coupons
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountPct, setDiscountPct] = useState<number>(0);

  // Completed Orders
  const [orders, setOrders] = useState<OrderConfirmation[]>([]);

  // Synchronized refs for background interval to avoid stale closures
  const portfolioRef = useRef(portfolio);
  portfolioRef.current = portfolio;

  const strategiesRef = useRef(strategies);
  strategiesRef.current = strategies;

  const assetsRef = useRef(assets);
  assetsRef.current = assets;

  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  // When user logs in or switches profile, load their database document
  const handleAuthSuccess = useCallback((user: UserProfile) => {
    setCurrentUser(user);
    const doc = loadUserDataDocument(user);
    setUserDoc(doc);
    setPortfolio(doc.portfolio);
    setWatchlist(doc.watchlist);
    setCart(doc.cart || []);
    setWishlistIds(doc.wishlistIds || []);
    setStrategies(doc.strategies || DEFAULT_STRATEGIES);
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    setUserDoc(null);
    // Open auth modal so they can easily log in or test another profile
    setAuthModalMode('signin');
    setIsAuthModalOpen(true);
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' | 'demo' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Auto-sync portfolio updates to the database
  const handleUpdatePortfolio = (newPortfolio: PortfolioState) => {
    setPortfolio(newPortfolio);
    portfolioRef.current = newPortfolio;
    if (currentUser) {
      saveUserDataDocument(currentUser.uid, { portfolio: newPortfolio });
    }
  };

  // Custom strategy save/update handler
  const handleUpdateStrategies = (newStrategies: StrategyRule[]) => {
    setStrategies(newStrategies);
    strategiesRef.current = newStrategies;
    if (currentUser) {
      saveUserDataDocument(currentUser.uid, { strategies: newStrategies });
    }
  };

  // Watchlist toggle handler
  const handleToggleWatchlistAsset = (assetId: string) => {
    setWatchlist((prev) => {
      const updated = prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId];

      if (currentUser) {
        saveUserDataDocument(currentUser.uid, { watchlist: updated });
      }
      return updated;
    });
  };

  // Real-time background price updates & Algorithmic Strategy Execution Engine
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Tick stochastic asset prices
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          const shock = (Math.random() - 0.495) * 2;
          const deltaPct = shock * asset.volatilityCoeff * 0.003 + (asset.drift * 0.0002);
          const newPrice = Math.max(0.1, asset.currentPrice * (1 + deltaPct));
          const change = newPrice - asset.basePrice;
          const changePct = (change / asset.basePrice) * 100;

          return {
            ...asset,
            currentPrice: parseFloat(newPrice.toFixed(2)),
            change24h: parseFloat(change.toFixed(2)),
            change24hPct: parseFloat(changePct.toFixed(2)),
            high24h: Math.max(asset.high24h, newPrice),
            low24h: Math.min(asset.low24h, newPrice),
          };
        })
      );

      // 2. Synchronize multi-asset tick historical series
      setDatasets((prevDatasets) => {
        const currentAssetList = assetsRef.current;
        const nextDatasets = generateSynchronizedNextTick(prevDatasets, currentAssetList);

        // 3. Automated Strategy Evaluation & Live Execution (Requirement #1)
        const currentStrategies = strategiesRef.current;
        const currentPort = portfolioRef.current;
        const activeUser = currentUserRef.current;

        currentStrategies.forEach((strat) => {
          if (!strat.enabled || !strat.autoTrade) return;

          const series = nextDatasets[strat.assetId];
          const assetObj = currentAssetList.find((a) => a.id === strat.assetId);
          if (!series || series.length < 5 || !assetObj) return;

          const closes = series.map((d) => d.close);
          const lastIdx = closes.length - 1;
          const currentPrice = assetObj.currentPrice;
          const holding = currentPort.holdings[strat.assetId];

          // Check BUY condition
          if (!holding || holding.shares < strat.shares * 2) {
            const cache: Record<string, (number | null)[]> = {};
            const buyEval = evaluateCondition(strat.buyCondition, lastIdx, closes, cache);

            if (buyEval.met) {
              const res = processBuyOrder(currentPort, assetObj, strat.shares, currentPrice);
              if (res.success) {
                setPortfolio(res.newState);
                portfolioRef.current = res.newState;
                if (activeUser) {
                  saveUserDataDocument(activeUser.uid, { portfolio: res.newState });
                }
                setAlgoAlert({
                  message: `[ALGO EXECUTE] ${strat.name}: Auto-BOUGHT ${strat.shares} ${assetObj.symbol} @ $${currentPrice.toFixed(2)} (${buyEval.reason})`,
                  type: 'BUY',
                });
                setTimeout(() => setAlgoAlert(null), 5000);
              }
            }
          }

          // Check SELL condition or risk limits if holding position
          if (holding && holding.shares > 0) {
            const cache: Record<string, (number | null)[]> = {};
            const sellEval = evaluateCondition(strat.sellCondition, lastIdx, closes, cache);
            const priceDeltaPct = ((currentPrice - holding.avgCostBasis) / holding.avgCostBasis) * 100;
            const isStopLoss = strat.stopLossPct && priceDeltaPct <= -strat.stopLossPct;
            const isTakeProfit = strat.takeProfitPct && priceDeltaPct >= strat.takeProfitPct;

            if (sellEval.met || isStopLoss || isTakeProfit) {
              const sellShares = Math.min(strat.shares, holding.shares);
              const res = processSellOrder(currentPort, assetObj, sellShares, currentPrice);
              if (res.success) {
                setPortfolio(res.newState);
                portfolioRef.current = res.newState;
                if (activeUser) {
                  saveUserDataDocument(activeUser.uid, { portfolio: res.newState });
                }
                const exitReason = isStopLoss
                  ? `Stop-Loss (-${Math.abs(priceDeltaPct).toFixed(1)}%)`
                  : isTakeProfit
                  ? `Take-Profit (+${priceDeltaPct.toFixed(1)}%)`
                  : sellEval.reason;

                setAlgoAlert({
                  message: `[ALGO EXECUTE] ${strat.name}: Auto-SOLD ${sellShares} ${assetObj.symbol} @ $${currentPrice.toFixed(2)} (${exitReason})`,
                  type: 'SELL',
                });
                setTimeout(() => setAlgoAlert(null), 5000);
              }
            }
          }
        });

        return nextDatasets;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  const handleTriggerPriceShock = () => {
    setAssets((prevAssets) =>
      prevAssets.map((asset) => {
        const shockDir = Math.random() > 0.4 ? 1 : -1;
        const shockPct = shockDir * (0.03 + Math.random() * 0.04);
        const newPrice = Math.max(0.1, asset.currentPrice * (1 + shockPct));
        const change = newPrice - asset.basePrice;
        const changePct = (change / asset.basePrice) * 100;

        return {
          ...asset,
          currentPrice: parseFloat(newPrice.toFixed(2)),
          change24h: parseFloat(change.toFixed(2)),
          change24hPct: parseFloat(changePct.toFixed(2)),
          high24h: Math.max(asset.high24h, newPrice),
          low24h: Math.min(asset.low24h, newPrice),
        };
      })
    );
  };

  // Storefront handlers
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const updated = existing
        ? prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...prev, { product, quantity }];

      if (currentUser) {
        saveUserDataDocument(currentUser.uid, { cart: updated });
      }
      return updated;
    });

    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1800);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) => {
      const updated = prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item));
      if (currentUser) {
        saveUserDataDocument(currentUser.uid, { cart: updated });
      }
      return updated;
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.product.id !== productId);
      if (currentUser) {
        saveUserDataDocument(currentUser.uid, { cart: updated });
      }
      return updated;
    });
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      const updated = prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id];

      if (currentUser) {
        saveUserDataDocument(currentUser.uid, { wishlistIds: updated });
      }
      return updated;
    });
  };

  const handleApplyDiscount = (code: string): boolean => {
    if (code === 'ALPHA10') {
      setDiscountCode('ALPHA10');
      setDiscountPct(10);
      return true;
    }
    if (code === 'WELCOME20') {
      setDiscountCode('WELCOME20');
      setDiscountPct(20);
      return true;
    }
    return false;
  };

  const handleOrderPlaced = (order: OrderConfirmation) => {
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    if (currentUser) {
      saveUserDataDocument(currentUser.uid, { cart: [] });
    }
  };

  // Calculations
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = (cartSubtotal * discountPct) / 100;
  const shipping = cartSubtotal >= 500 || cart.length === 0 ? 0 : 25;
  const taxes = (cartSubtotal - discountAmount) * 0.08;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shipping + taxes);
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  let totalStockVal = 0;
  Object.values(portfolio.holdings).forEach((h) => {
    if (h.shares > 0) {
      const asset = assets.find((a) => a.id === h.assetId);
      totalStockVal += h.shares * (asset ? asset.currentPrice : h.avgCostBasis);
    }
  });
  const currentTotalPortfolioVal = portfolio.cashBalance + totalStockVal;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top Banner with Active User Session Badge */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 py-2 px-4 text-center text-xs text-indigo-100 flex flex-wrap items-center justify-center gap-2 border-b border-indigo-700/50">
        {currentUser ? (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Logged in as <strong>{currentUser.name}</strong> ({currentUser.role}). All portfolio trades, watchlists &amp; charts are synced to your Cloud Database.
            </span>
            <button
              onClick={() => handleOpenAuth('demo')}
              className="underline font-bold text-cyan-300 hover:text-white ml-1"
            >
              Switch Persona →
            </button>
          </>
        ) : (
          <>
            <span>🚀 Log in to save custom watchlists, paper trading portfolios, and indicators to your cloud profile!</span>
            <button
              onClick={() => handleOpenAuth('signin')}
              className="underline font-bold text-cyan-300 hover:text-white ml-1"
            >
              Sign In or Try Demo →
            </button>
          </>
        )}
      </div>

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        portfolioValue={currentTotalPortfolioVal}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        watchlistCount={watchlist.length}
        activeStrategiesCount={strategies.filter((s) => s.enabled).length}
      />

      {/* User Custom Watchlist Ticker Bar (Requirement #2) */}
      <WatchlistBar
        allAssets={assets}
        watchlistIds={watchlist}
        onToggleWatchlistAsset={handleToggleWatchlistAsset}
        onSelectAsset={() => setActiveTab('analytics')}
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'shop' && (
          <ProductCatalog
            products={products}
            onAddToCart={handleAddToCart}
            onQuickView={(p) => setDetailProduct(p)}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            addedProductId={addedProductId}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioSimulator
            portfolio={portfolio}
            onUpdatePortfolio={handleUpdatePortfolio}
            assets={assets}
            onTriggerPriceShock={handleTriggerPriceShock}
          />
        )}

        {activeTab === 'analytics' && (
          <MarketDashboard
            strategies={strategies}
            onNavigateToStrategies={() => setActiveTab('strategy')}
          />
        )}

        {activeTab === 'strategy' && (
          <StrategyManagerView
            strategies={strategies}
            onUpdateStrategies={handleUpdateStrategies}
            assets={assets}
            datasets={datasets}
            portfolio={portfolio}
          />
        )}
      </main>

      {/* Real-Time Algorithmic Execution Floating Toast (Requirement #1) */}
      {algoAlert && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs sm:text-sm font-semibold backdrop-blur-xl ${
              algoAlert.type === 'BUY'
                ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-100 shadow-emerald-950/60'
                : 'bg-rose-950/95 border-rose-500/60 text-rose-100 shadow-rose-950/60'
            }`}
          >
            <span className="p-1 rounded-lg bg-white/10">
              <Zap className={`w-4 h-4 ${algoAlert.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'} animate-pulse`} />
            </span>
            <span>{algoAlert.message}</span>
            <button
              onClick={() => setActiveTab('portfolio')}
              className="ml-2 px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-mono font-bold transition-all text-white"
            >
              Check Portfolio →
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        discountCode={discountCode}
        onApplyDiscount={handleApplyDiscount}
        discountPct={discountPct}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        total={cartTotal}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={detailProduct ? wishlistIds.includes(detailProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
      />

      {/* Authentication Modal (Requirement #2) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
