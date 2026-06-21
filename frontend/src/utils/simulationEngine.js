// Market States
const MARKET_STATES = {
  TREND_UP: "TREND_UP",
  TREND_DOWN: "TREND_DOWN",
  RANGE: "RANGE",
  CONSOLIDATION: "CONSOLIDATION",
  BREAKOUT_UP: "BREAKOUT_UP",
  BREAKOUT_DOWN: "BREAKOUT_DOWN",
};

// Market Phases (from requirement 5)
const MARKET_PHASES = [
  MARKET_STATES.RANGE,
  MARKET_STATES.TREND_UP,
  MARKET_STATES.TREND_DOWN,
  MARKET_STATES.CONSOLIDATION,
  MARKET_STATES.BREAKOUT_UP,
  MARKET_STATES.BREAKOUT_DOWN,
];

// Realistic Symbol Configurations
const SYMBOL_CONFIG = {
  NIFTY: {
    dailyRangeMin: 0.008, // 0.8%
    dailyRangeMax: 0.015, // 1.5%
    supportMin: 80, // points
    supportMax: 150, // points
    resistanceMin: 80, // points
    resistanceMax: 150, // points
    trendStrength: 1.0,
    breakoutStrength: 1.5,
    basePrice: 23500,
    minPrice: 23000,
    maxPrice: 25000,
    volatility: 30, // per candle
    wickSize: 10,
  },
  BANKNIFTY: {
    dailyRangeMin: 0.015, // 1.5%
    dailyRangeMax: 0.025, // 2.5%
    supportMin: 200,
    supportMax: 400,
    resistanceMin: 200,
    resistanceMax: 400,
    trendStrength: 1.4,
    breakoutStrength: 2.5,
    basePrice: 50000,
    minPrice: 48000,
    maxPrice: 56000,
    volatility: 80,
    wickSize: 25,
  },
  SENSEX: {
    dailyRangeMin: 0.008,
    dailyRangeMax: 0.015,
    supportMin: 150,
    supportMax: 300,
    resistanceMin: 150,
    resistanceMax: 300,
    trendStrength: 1.1,
    breakoutStrength: 1.8,
    basePrice: 74500,
    minPrice: 74000,
    maxPrice: 75000,
    volatility: 45,
    wickSize: 15,
  },
  RELIANCE: {
    dailyRangeMin: 0.01,
    dailyRangeMax: 0.02,
    supportMin: 20,
    supportMax: 50,
    resistanceMin: 20,
    resistanceMax: 50,
    trendStrength: 0.8,
    breakoutStrength: 1.2,
    basePrice: 2850,
    minPrice: 2700,
    maxPrice: 3000,
    volatility: 8,
    wickSize: 3,
  },
  INFY: {
    dailyRangeMin: 0.01,
    dailyRangeMax: 0.02,
    supportMin: 10,
    supportMax: 30,
    resistanceMin: 10,
    resistanceMax: 30,
    trendStrength: 0.7,
    breakoutStrength: 1.1,
    basePrice: 1850,
    minPrice: 1700,
    maxPrice: 2000,
    volatility: 5,
    wickSize: 2,
  },
  TCS: {
    dailyRangeMin: 0.01,
    dailyRangeMax: 0.02,
    supportMin: 20,
    supportMax: 40,
    resistanceMin: 20,
    resistanceMax: 40,
    trendStrength: 0.7,
    breakoutStrength: 1.1,
    basePrice: 4250,
    minPrice: 4100,
    maxPrice: 4400,
    volatility: 6,
    wickSize: 2,
  },
};

class SimulationEngine {
  constructor() {
    this.candles = [];
    this.marketState = MARKET_STATES.RANGE;
    this.activePattern = null;
    this.patternConfidence = 0;
    this.support = null;
    this.resistance = null;
    this.ema200 = null;
    this.emaSeries = []; // stores EMA history for plotting
    this.touchesAtResistance = 0;
    this.touchesAtSupport = 0;
    this.timeframe = 1; // minutes
    this.symbol = "NIFTY";
    this.basePrice = 23500;
    this.minPrice = 23000;
    this.maxPrice = 25000;
    this.symbolConfig = SYMBOL_CONFIG.NIFTY;
    this.swingHighs = [];
    this.swingLows = [];
    this.phaseTimer = 0; // tracks how long we've been in current phase
    this.phaseDuration = 50; // candles to 100 candles per phase
    this.previousClose = null;
  }

  reset() {
    this.candles = [];
    this.marketState = MARKET_STATES.RANGE;
    this.activePattern = null;
    this.patternConfidence = 0;
    this.support = null;
    this.resistance = null;
    this.ema200 = null;
    this.emaSeries = [];
    this.touchesAtResistance = 0;
    this.touchesAtSupport = 0;
    this.swingHighs = [];
    this.swingLows = [];
    this.phaseTimer = 0;
    this.phaseDuration = 50 + Math.random() * 50;
    this.previousClose = null;
  }

  setTimeframe(minutes) {
    this.timeframe = minutes;
  }

  setSymbol(symbol) {
    const sym = (symbol || "").toUpperCase();
    this.symbol = sym;
    const config = SYMBOL_CONFIG[sym] || {
      dailyRangeMin: 0.01,
      dailyRangeMax: 0.02,
      supportMin: 20,
      supportMax: 50,
      resistanceMin: 20,
      resistanceMax: 50,
      trendStrength: 1.0,
      breakoutStrength: 1.5,
      basePrice: 22500,
      minPrice: 0,
      maxPrice: Infinity,
      volatility: 30,
      wickSize: 10,
    };
    this.symbolConfig = config;
    this.basePrice = config.basePrice;
    this.minPrice = config.minPrice;
    this.maxPrice = config.maxPrice;
  }

  generateInitialCandles(count = 200) {
    this.reset();
    let currentPrice = this.basePrice;
    let time = Math.floor(Date.now() / 1000) - count * 60 * this.timeframe;

    for (let i = 0; i < count; i++) {
      const candle = this._generateSingleCandle(currentPrice, time);
      this.candles.push(candle);
      currentPrice = candle.close;
      time += 60 * this.timeframe;
      this._updateIndicators();
      this._updateSwingPoints();
      this._detectPatterns();
      this._updateMarketPhase();
    }

    return [...this.candles];
  }

  generateNextCandle() {
    if (!this.candles.length) return null;
    const lastCandle = this.candles[this.candles.length - 1];
    const newCandle = this._generateSingleCandle(
      lastCandle.close,
      lastCandle.time + 60 * this.timeframe,
    );
    this.candles.push(newCandle);
    this._updateIndicators();
    this._updateSwingPoints();
    this._detectPatterns();
    this._updateMarketPhase();
    return newCandle;
  }

  _generateSingleCandle(basePrice, time) {
    let bias = this._getBias();

    // Respect price limits
    const distanceToMin = basePrice - this.minPrice;
    const distanceToMax = this.maxPrice - basePrice;

    // If near limits, increase reversal chance
    if (distanceToMin < this.symbolConfig.volatility * 2) bias = 1;
    if (distanceToMax < this.symbolConfig.volatility * 2) bias = -1;

    // Calculate candle body size based on market phase
    let volatility = this.symbolConfig.volatility;
    let bodySize = (Math.random() - 0.5) * volatility;
    if (this.marketState.includes("TREND_UP"))
      bodySize *= this.symbolConfig.trendStrength;
    if (this.marketState.includes("TREND_DOWN"))
      bodySize *= this.symbolConfig.trendStrength;
    if (this.marketState.includes("BREAKOUT"))
      bodySize *= this.symbolConfig.breakoutStrength;
    if (this.marketState.includes("CONSOLIDATION")) bodySize *= 0.5;

    let wickSize = Math.random() * this.symbolConfig.wickSize;

    const open = basePrice;
    let close = open + bias * bodySize;

    // Apply phase-based behavior
    if (this.marketState === MARKET_STATES.TREND_UP && this.ema200) {
      if (close > this.ema200) {
        bodySize *= 1.2;
        close = open + bias * bodySize;
      }
    }
    if (this.marketState === MARKET_STATES.TREND_DOWN && this.ema200) {
      if (close < this.ema200) {
        bodySize *= 1.2;
        close = open + bias * bodySize;
      }
    }

    // Enforce bounds
    if (close > this.maxPrice) close = this.maxPrice - Math.random() * 5;
    if (close < this.minPrice) close = this.minPrice + Math.random() * 5;

    let high = Math.max(open, close) + wickSize;
    let low = Math.min(open, close) - wickSize;

    if (high > this.maxPrice) high = this.maxPrice;
    if (low < this.minPrice) low = this.minPrice;

    // Breakout logic
    if (this.touchesAtResistance >= 3 && Math.random() < 0.3) {
      this.marketState = MARKET_STATES.BREAKOUT_UP;
      this.touchesAtResistance = 0;
      // Reset breakout after some time
      setTimeout(() => {
        if (this.marketState === MARKET_STATES.BREAKOUT_UP) {
          this.marketState = MARKET_STATES.TREND_UP;
        }
      }, 3000);
    }
    if (this.touchesAtSupport >= 3 && Math.random() < 0.3) {
      this.marketState = MARKET_STATES.BREAKOUT_DOWN;
      this.touchesAtSupport = 0;
      setTimeout(() => {
        if (this.marketState === MARKET_STATES.BREAKOUT_DOWN) {
          this.marketState = MARKET_STATES.TREND_DOWN;
        }
      }, 3000);
    }

    return {
      time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    };
  }

  _getBias() {
    if (this.activePattern === "Double Bottom") return 1;
    if (this.activePattern === "Double Top") return -1;
    if (this.activePattern === "Bull Flag") return 1;
    if (this.activePattern === "Bear Flag") return -1;
    if (this.activePattern === "Head & Shoulders") return -1;
    if (this.activePattern === "Triangle") return Math.random() > 0.5 ? 1 : -1;

    if (this.marketState === MARKET_STATES.TREND_UP) return 1;
    if (this.marketState === MARKET_STATES.TREND_DOWN) return -1;

    // Adjust bias for support/resistance
    const currentPrice =
      this.candles[this.candles.length - 1]?.close || this.basePrice;
    const distanceToSupport = this.support
      ? currentPrice - this.support
      : Infinity;
    const distanceToResistance = this.resistance
      ? this.resistance - currentPrice
      : Infinity;

    if (distanceToSupport < 30) {
      if (distanceToSupport < 10) {
        this.touchesAtSupport++;
      }
      return Math.random() < 0.8 ? 1 : -1;
    }
    if (distanceToResistance < 30) {
      if (distanceToResistance < 10) {
        this.touchesAtResistance++;
      }
      return Math.random() < 0.8 ? -1 : 1;
    }

    if (this.ema200) {
      const aboveEma = currentPrice > this.ema200;
      if (aboveEma && Math.random() < 0.65) return 1;
      if (!aboveEma && Math.random() < 0.65) return -1;
    }

    return Math.random() > 0.5 ? 1 : -1;
  }

  _updateIndicators() {
    this.ema200 = this.calculateEMA200(this.candles);
    this.emaSeries = this.calculateEmaLineData();
    const sr = this.calculateSupportResistance();
    this.support = sr.support;
    this.resistance = sr.resistance;
  }

  calculateEMA200(candles) {
    if (candles.length < 200) return null;
    const k = 2 / (200 + 1);
    let ema = candles[0].close;
    for (let i = 1; i < candles.length; i++) {
      ema = candles[i].close * k + ema * (1 - k);
    }
    return parseFloat(ema.toFixed(2));
  }

  calculateSupportResistance() {
    if (this.candles.length < 20) return { support: null, resistance: null };

    let support = null;
    let resistance = null;

    if (this.swingLows.length > 0) {
      const recentLows = this.swingLows.slice(-5);
      support = Math.min(...recentLows.map((l) => l.price));
    }

    if (this.swingHighs.length > 0) {
      const recentHighs = this.swingHighs.slice(-5);
      resistance = Math.max(...recentHighs.map((h) => h.price));
    }

    return {
      support: support ? parseFloat(support.toFixed(2)) : null,
      resistance: resistance ? parseFloat(resistance.toFixed(2)) : null,
    };
  }

  // Find swing highs and lows (for S/R calculation)
  _updateSwingPoints() {
    if (this.candles.length < 5) return;

    const recent = this.candles.slice(-10);
    const i = recent.length - 3;
    if (i < 2) return;

    // Check if current candle is a swing high
    if (
      recent[i].high > recent[i - 1].high &&
      recent[i].high > recent[i - 2].high &&
      recent[i].high > recent[i + 1].high &&
      recent[i].high > recent[i + 2].high
    ) {
      this.swingHighs.push({
        price: recent[i].high,
        time: recent[i].time,
      });
    }
    // Only keep last 20
    if (this.swingHighs.length > 20) this.swingHighs.shift();

    // Detect swing low
    if (
      recent[i].low < recent[i - 1].low &&
      recent[i].low < recent[i - 2].low &&
      recent[i].low < recent[i + 1].low &&
      recent[i].low < recent[i + 2].low
    ) {
      this.swingLows.push({
        price: recent[i].low,
        time: recent[i].time,
      });
    }
    if (this.swingLows.length > 20) this.swingLows.shift();
  }

  _updateMarketPhase() {
    this.phaseTimer++;
    if (this.phaseTimer >= this.phaseDuration) {
      this.phaseTimer = 0;
      this.phaseDuration = 50 + Math.random() * 50;

      const stateWeights = {
        [MARKET_STATES.RANGE]: 0.3,
        [MARKET_STATES.TREND_UP]: 0.2,
        [MARKET_STATES.TREND_DOWN]: 0.2,
        [MARKET_STATES.CONSOLIDATION]: 0.2,
        [MARKET_STATES.BREAKOUT_UP]: 0.05,
        [MARKET_STATES.BREAKOUT_DOWN]: 0.05,
      };

      let currentState = this.marketState;
      let nextState;
      const rand = Math.random();
      let cumulative = 0;

      for (let state in stateWeights) {
        cumulative += stateWeights[state];
        if (rand < cumulative) {
          nextState = state;
          break;
        }
      }

      if (nextState !== currentState) {
        this.marketState = nextState;
      }
    }
  }

  _detectPatterns() {
    if (this.candles.length < 50) return;
    this.activePattern = null;
    this.patternConfidence = 0;

    const recent = this.candles.slice(-50);

    // Bull Flag
    let confidence = 0;
    const impulseStart = recent.slice(-30, -15);
    const flag = recent.slice(-15);

    const impulseUp =
      impulseStart.length > 0 &&
      impulseStart[impulseStart.length - 1].close >
        impulseStart[0].close * 1.01;
    const flagDown =
      flag.length > 0 &&
      flag[flag.length - 1].close < flag[0].close &&
      flag[flag.length - 1].close > impulseStart[0].close;

    if (impulseUp && flagDown) {
      confidence += 40;
      if (this.ema200 && flag.every((c) => c.close > this.ema200))
        confidence += 20;
      if (this.support && this.resistance) confidence += 20;
      this.activePattern = "Bull Flag";
      this.patternConfidence = confidence;
      return;
    }

    // Bear Flag
    const impulseDown =
      impulseStart.length > 0 &&
      impulseStart[impulseStart.length - 1].close <
        impulseStart[0].close * 0.99;
    const flagUp =
      flag.length > 0 &&
      flag[flag.length - 1].close > flag[0].close &&
      flag[flag.length - 1].close < impulseStart[0].close;
    if (impulseDown && flagUp) {
      confidence += 40;
      if (this.ema200 && flag.every((c) => c.close < this.ema200))
        confidence += 20;
      if (this.support && this.resistance) confidence += 20;
      this.activePattern = "Bear Flag";
      this.patternConfidence = confidence;
      return;
    }

    // Double Bottom
    const lows = recent.map((c) => c.low);
    const firstLow = Math.min(...lows.slice(0, 25));
    const secondLow = Math.min(...lows.slice(25));
    if (Math.abs(firstLow - secondLow) < 50) {
      confidence += 50;
      if (recent[recent.length - 1].close > secondLow * 1.005) confidence += 20;
      if (this.ema200 && recent[recent.length - 1].close > this.ema200)
        confidence += 20;
      this.activePattern = "Double Bottom";
      this.patternConfidence = confidence;
      return;
    }

    // Double Top
    const highs = recent.map((c) => c.high);
    const firstHigh = Math.max(...highs.slice(0, 25));
    const secondHigh = Math.max(...highs.slice(25));
    if (Math.abs(firstHigh - secondHigh) < 50) {
      confidence += 50;
      if (recent[recent.length - 1].close < secondHigh * 0.995)
        confidence += 20;
      if (this.ema200 && recent[recent.length - 1].close < this.ema200)
        confidence += 20;
      this.activePattern = "Double Top";
      this.patternConfidence = confidence;
      return;
    }

    // Head & Shoulders
    if (recent.length > 40) {
      const left = Math.max(...highs.slice(0, 15));
      const head = Math.max(...highs.slice(15, 30));
      const right = Math.max(...highs.slice(30));
      if (
        head > left + 20 &&
        head > right + 20 &&
        Math.abs(left - right) < 30
      ) {
        confidence += 60;
        this.activePattern = "Head & Shoulders";
        this.patternConfidence = confidence;
        return;
      }
    }
  }

  calculateEmaLineData() {
    if (this.candles.length < 200) return [];
    const data = [];
    const k = 2 / (200 + 1);
    let ema = this.candles[0].close;

    for (let i = 0; i < this.candles.length; i++) {
      ema = this.candles[i].close * k + ema * (1 - k);
      if (i >= 199) {
        data.push({
          time: this.candles[i].time,
          value: parseFloat(ema.toFixed(2)),
        });
      }
    }
    return data;
  }

  getStats() {
    const currentClose =
      this.candles[this.candles.length - 1]?.close || this.basePrice;
    const previousClose =
      this.candles.length > 1
        ? this.candles[this.candles.length - 2].close
        : this.basePrice;
    const change = currentClose - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      currentPrice: currentClose,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      ema200: this.ema200,
      ema200Data: this.emaSeries,
      support: this.support,
      resistance: this.resistance,
      activePattern: this.activePattern,
      patternConfidence: Math.min(this.patternConfidence, 100),
      marketState: this.marketState,
      touchesAtSupport: this.touchesAtSupport,
      touchesAtResistance: this.touchesAtResistance,
    };
  }
}

export const simulationEngine = new SimulationEngine();

export const generateInitialCandles = (count) =>
  simulationEngine.generateInitialCandles(count);
export const generateNextCandle = () => simulationEngine.generateNextCandle();
export const calculateEMA200 = (candles) =>
  simulationEngine.calculateEMA200(candles);
export const calculateSupportResistance = () =>
  simulationEngine.calculateSupportResistance();
export const getStats = () => simulationEngine.getStats();
export const resetEngine = () => simulationEngine.reset();
export const setTimeframe = (minutes) => simulationEngine.setTimeframe(minutes);
export const setSymbol = (symbol) => simulationEngine.setSymbol(symbol);
