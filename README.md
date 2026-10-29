# ApexStore, Portfolio Simulator & Market Analytics Platform

A full-stack style React application combining an e-commerce tech storefront, an **Advanced Portfolio Simulation System (Paper Trading)**, an **Institutional Financial Analytics Terminal** with automated **Candlestick Pattern Recognition**, a **Multi-Asset Comparative Overlay Chart**, a **User Authentication & Cloud Database Persistence System**, and a **Custom Indicator & Algorithmic Strategy Automation Engine**.

---

## 🚀 Quick Start & How to Run

Follow these simple steps to run the application locally:

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start the local development server
npm run dev
```

- The server will boot up at **`http://localhost:3000`** and automatically open in your default web browser.
- Hot Module Replacement (HMR) is enabled — any changes will reflect instantly.

```bash
# 3. Build for production preview
npm run build
npm run preview
```

---

## 🌟 Key Platform Modules

### 1. Custom Indicators & Algorithmic Strategy Builder (Requirement #1)
Empowers users to build, backtest, and automate their own quantitative trading strategies on stochastic market data:
- **Visual Condition & Indicator Rule Builder**:
  - Define custom trigger rules:
    - *“Buy when price crosses above the 50-day moving average”*
    - *“Sell when RSI exceeds 70”*
    - *“Buy when price touches lower Bollinger Band”*
    - *“Exit when fast SMA(10) crosses below slow SMA(30)”*
  - Configure target operators: `CROSSES_ABOVE`, `CROSSES_BELOW`, `GREATER_THAN`, `LESS_THAN`.
  - Supports dynamic indicator comparisons (e.g. Price vs. SMA, Fast EMA vs. Slow SMA) or threshold constants (e.g. RSI vs. 30 or 70).
  - Risk parameters: Stop-Loss (%) and Take-Profit (%) automation.
- **Historical Backtesting Simulation Studio**:
  - Run one-click backtest simulations over historical datasets.
  - Interactive SVG **Equity Curve** charting balance progression over time.
  - Real-time quantitative performance KPIs: **Ending Capital**, **Total Net P&L (%)**, **Win Rate (%)**, **Profit Factor**, and **Max Drawdown (%)**.
  - Detailed signal logs listing every historical execution with timestamp, price, shares, and exact algorithmic rationale.
- **Real-Time Live Auto-Trade Execution**:
  - Toggle **Live Auto-Trade** to let the algorithmic engine monitor real-time stochastic market ticks.
  - Automatically executes paper trades into the user's simulated portfolio without manual intervention.
  - Generates instant toast notifications with trade details and updates cash balance, holdings, and P&L in real time.
- **Visual Signal Markers on Financial Charts**:
  - Algorithmic BUY (`▲`) and SELL (`▼`) markers plotted directly on Japanese candlestick charts.

---

### 2. User Authentication & Cloud Database Persistence (Requirement #2)
A secure authentication and data persistence architecture ensuring each user's unique profile, preferences, watchlists, portfolio, and charts persist across sessions:
- **Authentication Flows**:
  - **Sign In / Log In**: Secure authentication with email and password.
  - **Create Account (Sign Up)**: Registration supporting full name, email, password, and trader persona role selection (*Quantitative Trader*, *Hedge Fund Analyst*, *Portfolio Manager*, *Retail Investor*).
  - **1-Click Demo Profiles**: Instantly switch between pre-configured trader accounts to experience multi-user data isolation:
    - *Alexander Wright (`alex@apextech.io`)*: Quantitative AI & Crypto trader ($100k+ portfolio, NVST & BTC holdings, candlestick chart mode, custom tech watchlist).
    - *Elena Rostova (`elena@apextech.io`)*: Macro & Fixed-Income analyst (Bond ETF & Gold Bullion holdings, defensive volatility indicators, line chart mode).
- **User-Specific Cloud Persistence**:
  - Automatically loads and isolates each user's custom database document (`user_data_{uid}`).
  - **Watchlists**: Custom pinned assets bar across the platform; add or remove assets anytime with automatic cloud sync.
  - **Portfolio Trades & Holdings**: Every simulated BUY/SELL transaction, cost basis calculation, and cash balance is saved to the active user document.
  - **Custom Strategies & Indicator Rules**: Saved rules and auto-trade settings persist across logins.
  - **Indicator Settings & Chart Modes**: Preferences for SMA periods, Bollinger Bands, RSI, Candlestick patterns, and Multi-Asset overlays remain exactly as configured when logging back in.
  - **Storefront State**: User's cart items and bookmarked wishlist products are isolated per account.
- **Real-Time Cloud Sync Telemetry**:
  - Live indicator badge displaying connection status: `● Cloud Synced (Just now)`.
  - Profile menu in the top navbar showing the user's avatar, role badge, session document ID, and 1-click logout or switch profile.

---

### 3. Multi-Asset Comparative Overlay Chart (Requirement #3)
Cross-asset benchmarking across Stocks, Sovereign Bonds, Cryptocurrencies, and Commodities on a synchronized timeline:
- **Normalized % Relative Return Mode**: Normalizes every asset to a $0.0\%$ baseline to evaluate outperformance and drawdown without nominal price scale bias.
- **Per-Asset Chart Styles**: Customize representation independently for each asset (`Line`, `Area`, `Bar`, `Candlestick`).
- **Pairwise Pearson Correlation Matrix ($r \in [-1.0, +1.0]$)**: Real-time heatmapped matrix measuring co-movements and hedging relationships.
- **Relative Strength Leaderboard**: Dynamic ranking of top gainers and laggards.

---

### 4. Candlestick Pattern Recognition Engine (Requirement #4)
Automatically scans live market data and identifies classic Japanese candlestick formations:
- **Supported Formations**: Hammer (`HMR`), Inverted Hammer (`I-HMR`), Shooting Star (`S-STAR`), Bullish Engulfing (`B-ENG`), Bearish Engulfing (`BR-ENG`), Standard Doji (`DOJI`), Dragonfly Doji (`D-DOJI`), Gravestone Doji (`G-DOJI`), Morning Star (`M-STAR`), Evening Star (`E-STAR`), and Marubozu (`MRBZ`).
- **Interactive Annotations & Inspector**: Visual badges placed directly above or below candles with click/hover popovers explaining visual anatomy, market implications, and trading tactics.
- **Pattern Filter Toolbar & Live Feed**: Filter by bias (`BULLISH`, `BEARISH`, `NEUTRAL`) or specific pattern types with an embedded visual cheatsheet modal.

---

### 5. Advanced Portfolio Simulation System (Requirement #5)
A paper trading simulator allowing users to simulate buying and selling stocks without real money:
- **$100,000 Paper Trading Account**: Real-time evaluation of total portfolio equity, available cash balance, weighted average cost basis, unrealized P&L, and realized returns.
- **Interactive BUY & SELL Order Modal**: Share quantity inputs, 25%/50%/75%/MAX buttons, and pre-trade fee breakdown ($1.00 base broker fee + 0.05% exchange fee).
- **Visual Asset Allocation**: Interactive SVG Donut Chart with glowing hover segments and diversification progress bars.
- **Holdings Table & Trade History**: Active positions ledger with 1-click buy/sell actions and CSV trade log export.

---

### 6. Advanced Data Analytics Dashboard (Requirement #6)
Visualizes professional technical indicators derived from simulated market data:
- **Dual Display Modes**: Toggle between Japanese Candlesticks and Smooth Line views.
- **Moving Averages**: Fast SMA (7), Slow SMA (21), and EMA (14) with golden/death cross detection.
- **Price Volatility (HV)**: Rolling annualized standard deviation of returns with Value-at-Risk (VaR 95%) and risk categorization.
- **Relative Strength Index (RSI 14)**: Wilder’s smoothed oscillator with dedicated sub-chart, overbought ($>70$) and oversold ($<30$) highlighted thresholds.
- **Bollinger Bands ($\pm 2\sigma$)**: Volatility channel with translucent envelope and Bollinger Bandwidth squeeze detection.

---

### 7. E-Commerce Storefront ("Shop")
- **Product Catalog**: High-performance workstations, smart wearables, spatial audio, and cloud GPU compute credits.
- **Search, Category & Price Filters**: Instant search, category pills, price slider, and sorting.
- **Quick View Specs Modal**: Comprehensive specifications table, feature highlights, and stock counter.
- **Persistent Cart & Wishlist**: Slide-over cart drawer with promo codes (`ALPHA10`, `WELCOME20`), free shipping progress bar, and user-isolated database persistence.
- **Checkout Settlement**: Multi-step checkout with address inputs, payment selection (Credit Card, USDC/Crypto settlement, Store Credit), and order confirmation receipts.

---

## 🛠️ Tech Stack
- **React 18** + **TypeScript**
- **Vite 5** (Fast HMR & Optimized bundling)
- **Tailwind CSS** (Custom dark modern palette & typography)
- **Lucide Icons**
- **Custom High-Performance SVG Charting Engine** (Zero lag, 60fps real-time multi-asset & candlestick rendering)
- **Cloud Database Persistence Layer** (User session isolation, live synchronization, and cross-session persistence)
