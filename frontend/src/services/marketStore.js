// Centralized Simulation Market Store
// Single Source Of Truth for all market data
// Future-ready to be replaced with WebSocket or real API

const SYMBOL_CONFIG = {
  NIFTY: { volatility: 30, wickSize: 10, trendStrength: 1.0, breakoutStrength: 1.5, basePrice: 23500, minPrice: 23000, maxPrice: 24000 },
  BANKNIFTY: { volatility: 80, wickSize: 25, trendStrength: 1.4, breakoutStrength: 2.5, basePrice: 50000, minPrice: 48000, maxPrice: 52000 },
  SENSEX: { volatility: 45, wickSize: 15, trendStrength: 1.1, breakoutStrength: 1.8, basePrice: 74500, minPrice: 74000, maxPrice: 75000 },
  RELIANCE: { volatility: 8, wickSize: 3, trendStrength: 0.8, breakoutStrength: 1.2, basePrice: 2850, minPrice: 2700, maxPrice: 3000 },
  INFY: { volatility: 5, wickSize: 2, trendStrength: 0.7, breakoutStrength: 1.1, basePrice: 1850, minPrice: 1700, maxPrice: 2000 },
  TCS: { volatility: 6, wickSize: 2, trendStrength: 0.7, breakoutStrength: 1.1, basePrice: 4250, minPrice: 4100, maxPrice: 4400 },
};

const ADDITIONAL_SYMBOLS = [
  { symbol: 'HDFCBANK', basePrice: 1750 },
  { symbol: 'ICICIBANK', basePrice: 1150 },
  { symbol: 'SBIN', basePrice: 820 },
  { symbol: 'HINDUNILVR', basePrice: 2650 },
  { symbol: 'ITC', basePrice: 490 },
  { symbol: 'TATAMOTORS', basePrice: 980 },
  { symbol: 'MARUTI', basePrice: 10800 },
  { symbol: 'ASIANPAINT', basePrice: 3200 },
  { symbol: 'WIPRO', basePrice: 510 },
  { symbol: 'BHARTIARTL', basePrice: 1420 },
  { symbol: 'AXISBANK', basePrice: 1180 },
  { symbol: 'KOTAKBANK', basePrice: 1820 },
  { symbol: 'BAJFINANCE', basePrice: 7200 },
  { symbol: 'BAJAJFINSV', basePrice: 1650 },
  { symbol: 'HCLTECH', basePrice: 1580 },
];

class MarketStore {
  constructor() {
    this.subscribers = new Set();
    this.symbolsData = {};
    this.intervalId = null;
    this.tickInterval = 1000; // 1 second updates
    
    // Initialize default symbols with base prices
    this.initializeSymbols();
  }

  // Initialize all default symbols
  initializeSymbols() {
    // Initialize symbols from SYMBOL_CONFIG first
    Object.keys(SYMBOL_CONFIG).forEach((symbol) => {
      const config = SYMBOL_CONFIG[symbol];
      const previousClose = config.basePrice + (Math.random() - 0.5) * (config.volatility);
      this.symbolsData[symbol] = {
        symbol,
        currentPrice: config.basePrice,
        previousClose,
        change: 0,
        changePercent: 0,
        trend: 'range', // 'up', 'down', 'range'
        ema200: config.basePrice * 0.99,
        support: config.basePrice * 0.97,
        resistance: config.basePrice * 1.03,
        volatilityIndex: 1,
        volatilityLabel: 'Slow',
        volatilityColor: '#32CD32',
        activePattern: null,
        candleHistory: [],
      };
    });

    // Initialize additional symbols
    ADDITIONAL_SYMBOLS.forEach(({ symbol, basePrice }) => {
      const previousClose = basePrice + (Math.random() - 0.5) * 50;
      this.symbolsData[symbol] = {
        symbol,
        currentPrice: basePrice,
        previousClose,
        change: 0,
        changePercent: 0,
        trend: 'range', // 'up', 'down', 'range'
        ema200: basePrice * 0.99,
        support: basePrice * 0.97,
        resistance: basePrice * 1.03,
        volatilityIndex: 1,
        volatilityLabel: 'Slow',
        volatilityColor: '#32CD32',
        activePattern: null,
        candleHistory: [],
      };
    });
  }

  // Subscribe to market updates
  subscribe(callback) {
    this.subscribers.add(callback);
    // Immediately send current state
    callback(this.symbolsData);
    
    // Start ticking if not already running
    if (!this.intervalId) {
      this.startTicking();
    }
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
      // Stop ticking if no subscribers
      if (this.subscribers.size === 0) {
        this.stopTicking();
      }
    };
  }

  // Start the ticking simulation
  startTicking() {
    if (this.intervalId) return;
    
    this.intervalId = setInterval(() => {
      this.tick();
    }, this.tickInterval);
  }

  // Stop the ticking simulation
  stopTicking() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Main tick function - updates all prices
  tick() {
    Object.keys(this.symbolsData).forEach((symbol) => {
      const data = this.symbolsData[symbol];
      const config = SYMBOL_CONFIG[symbol];
      this.updateSymbolPrice(symbol, data, config);
    });
    
    this.notifySubscribers();
  }

  // Update individual symbol price
  updateSymbolPrice(symbol, data, config) {
    // Generate random movement (biased to follow trend)
    let priceMovement = (Math.random() - 0.5) * (config?.volatility || 30);
    
    // Add some trend bias
    if (data.trend === 'up') {
      priceMovement += (config?.trendStrength || 1.0) * 5;
    } else if (data.trend === 'down') {
      priceMovement -= (config?.trendStrength || 1.0) * 5;
    }
    
    // Update current price
    const newPrice = Math.max(data.currentPrice + priceMovement, 0.01);
    data.currentPrice = newPrice;
    
    // Update change values
    data.change = newPrice - data.previousClose;
    data.changePercent = (data.change / data.previousClose) * 100;
    
    // Determine trend
    if (data.changePercent > 0.1) {
      data.trend = 'up';
    } else if (data.changePercent < -0.1) {
      data.trend = 'down';
    } else {
      data.trend = 'range';
    }
    
    // Update technical indicators (simplified)
    data.ema200 = data.ema200 * 0.99 + newPrice * 0.01;
    data.support = Math.min(data.support, newPrice * 0.97);
    data.resistance = Math.max(data.resistance, newPrice * 1.03);
    
    // Update candle history
    data.candleHistory.push({
      time: Date.now(),
      open: data.currentPrice,
      high: data.currentPrice * 1.001,
      low: data.currentPrice * 0.999,
      close: data.currentPrice,
    });
    
    // Keep only last 200 candles
    if (data.candleHistory.length > 200) {
      data.candleHistory.shift();
    }
  }

  // Get data for a specific symbol
  getSymbolData(symbol) {
    return this.symbolsData[symbol];
  }

  // Manually set symbol data (for simulation engine)
  setSymbolData(symbol, data) {
    if (this.symbolsData[symbol]) {
      this.symbolsData[symbol] = { ...this.symbolsData[symbol], ...data };
      this.notifySubscribers();
    }
  }

  // Notify all subscribers of updates
  notifySubscribers() {
    this.subscribers.forEach((callback) => {
      callback(this.symbolsData);
    });
  }
}

// Singleton instance
export const marketStore = new MarketStore();
