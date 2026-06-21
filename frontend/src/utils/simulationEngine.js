const BASE_PRICE = 22500;

// Market States
const MARKET_STATES = {
  TREND_UP: "TREND_UP",
  TREND_DOWN: "TREND_DOWN",
  RANGE: "RANGE",
  BREAKOUT_UP: "BREAKOUT_UP",
  BREAKOUT_DOWN: "BREAKOUT_DOWN",
};

class SimulationEngine {
  constructor() {
    this.candles = [];
    this.marketState = MARKET_STATES.RANGE;
    this.activePattern = null;
    this.support = null;
    this.resistance = null;
    this.ema200 = null;
    this.touchesAtResistance = 0;
    this.touchesAtSupport = 0;
  }

  reset() {
    this.candles = [];
    this.marketState = MARKET_STATES.RANGE;
    this.activePattern = null;
    this.support = null;
    this.resistance = null;
    this.ema200 = null;
    this.touchesAtResistance = 0;
    this.touchesAtSupport = 0;
  }

  generateInitialCandles(count = 200) {
    this.reset();
    let currentPrice = BASE_PRICE;
    let time = Math.floor(Date.now() / 1000) - count * 60;

    for (let i = 0; i < count; i++) {
      const candle = this._generateSingleCandle(currentPrice, time);
      this.candles.push(candle);
      currentPrice = candle.close;
      time += 60;
      this._updateIndicators();
      this._detectPatterns();
    }

    return [...this.candles];
  }

  generateNextCandle() {
    if (!this.candles.length) return null;
    const lastCandle = this.candles[this.candles.length - 1];
    const newCandle = this._generateSingleCandle(lastCandle.close, lastCandle.time + 60);
    this.candles.push(newCandle);
    this._updateIndicators();
    this._detectPatterns();
    return newCandle;
  }

  _generateSingleCandle(basePrice, time) {
    let bias = this._getBias();

    // Adjust bias for support/resistance
    const distanceToSupport = this.support ? basePrice - this.support : Infinity;
    const distanceToResistance = this.resistance ? this.resistance - basePrice : Infinity;
    if (distanceToSupport < 30) {
      if (distanceToSupport < 10) {
        this.touchesAtSupport++;
      }
      bias = Math.random() < 0.8 ? 1 : bias;
    }
    if (distanceToResistance < 30) {
      if (distanceToResistance < 10) {
        this.touchesAtResistance++;
      }
      bias = Math.random() < 0.8 ? -1 : bias;
    }

    // Breakout logic
    if (this.touchesAtResistance >= 3 && Math.random() < 0.3) {
      this.marketState = MARKET_STATES.BREAKOUT_UP;
      this.touchesAtResistance = 0;
    }
    if (this.touchesAtSupport >= 3 && Math.random() < 0.3) {
      this.marketState = MARKET_STATES.BREAKOUT_DOWN;
      this.touchesAtSupport = 0;
    }

    // Body size and trend adjustments
    let bodySize = 5 + Math.random() * 20;
    if (this.marketState === MARKET_STATES.BREAKOUT_UP) {
      bias = 1;
      bodySize *= 1.5 + Math.random();
      setTimeout(() => (this.marketState = MARKET_STATES.TREND_UP), 3000);
    }
    if (this.marketState === MARKET_STATES.BREAKOUT_DOWN) {
      bias = -1;
      bodySize *= 1.5 + Math.random();
      setTimeout(() => (this.marketState = MARKET_STATES.TREND_DOWN), 3000);
    }

    const wickSize = 2 + Math.random() * 8;

    const open = basePrice;
    const close = open + bias * bodySize;
    const high = Math.max(open, close) + wickSize;
    const low = Math.min(open, close) - wickSize;

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

    if (this.ema200) {
      const aboveEma = this.candles[this.candles.length - 1]?.close > this.ema200;
      if (aboveEma && Math.random() < 0.7) return 1;
      if (!aboveEma && Math.random() < 0.7) return -1;
    }
    return Math.random() > 0.5 ? 1 : -1;
  }

  _updateIndicators() {
    this.ema200 = this.calculateEMA200(this.candles);
    const sr = this.calculateSupportResistance(this.candles);
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

  calculateSupportResistance(candles) {
    if (candles.length < 50) return { support: null, resistance: null };
    const recent = candles.slice(-50);
    const support = Math.min(...recent.map((c) => c.low));
    const resistance = Math.max(...recent.map((c) => c.high));
    return {
      support: parseFloat(support.toFixed(2)),
      resistance: parseFloat(resistance.toFixed(2)),
    };
  }

  _detectPatterns() {
    if (this.candles.length < 50) return;

    const recent = this.candles.slice(-50);
    const lows = recent.map((c) => c.low);
    const highs = recent.map((c) => c.high);

    // Double Bottom
    const min1 = Math.min(...lows.slice(0, 25));
    const min2 = Math.min(...lows.slice(25));
    const min1Idx = lows.indexOf(min1);
    const min2Idx = 25 + lows.slice(25).indexOf(min2);
    if (Math.abs(min1 - min2) < 20 && min2Idx > min1Idx + 5) {
      const bounce = recent[recent.length - 1]?.close > min2 + 10;
      if (bounce) {
        this.activePattern = "Double Bottom";
        return;
      }
    }

    // Double Top
    const max1 = Math.max(...highs.slice(0, 25));
    const max2 = Math.max(...highs.slice(25));
    const max1Idx = highs.indexOf(max1);
    const max2Idx = 25 + highs.slice(25).indexOf(max2);
    if (Math.abs(max1 - max2) < 20 && max2Idx > max1Idx + 5) {
      const rejection = recent[recent.length - 1]?.close < max2 - 10;
      if (rejection) {
        this.activePattern = "Double Top";
        return;
      }
    }

    // Bull Flag
    const impulseCandles = recent.slice(-20, -10);
    const flagCandles = recent.slice(-10);
    const impulseUp = impulseCandles[impulseCandles.length - 1]?.close > impulseCandles[0]?.close + 30;
    const flagDown = flagCandles[flagCandles.length - 1]?.close < flagCandles[0]?.close && flagCandles[flagCandles.length - 1]?.close > impulseCandles[0]?.close;
    if (impulseUp && flagDown) {
      this.activePattern = "Bull Flag";
      return;
    }

    // Bear Flag
    const impulseDown = impulseCandles[impulseCandles.length - 1]?.close < impulseCandles[0]?.close - 30;
    const flagUp = flagCandles[flagCandles.length - 1]?.close > flagCandles[0]?.close && flagCandles[flagCandles.length - 1]?.close < impulseCandles[0]?.close;
    if (impulseDown && flagUp) {
      this.activePattern = "Bear Flag";
      return;
    }

    // Head & Shoulders - Simplified
    if (recent.length >= 30) {
      const p1 = Math.max(...highs.slice(0, 10));
      const p2 = Math.max(...highs.slice(10, 20));
      const p3 = Math.max(...highs.slice(20));
      if (p2 > p1 + 15 && p2 > p3 + 15 && Math.abs(p1 - p3) < 20) {
        this.activePattern = "Head & Shoulders";
        return;
      }
    }

    // Clear pattern after some time
    if (this.activePattern && Math.random() < 0.005) {
      this.activePattern = null;
    }
  }

  getStats() {
    return {
      currentPrice: this.candles[this.candles.length - 1]?.close || BASE_PRICE,
      ema200: this.ema200,
      ema200Data: this.calculateEmaLineData(),
      support: this.support,
      resistance: this.resistance,
      activePattern: this.activePattern,
      marketState: this.marketState,
    };
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
}

export const simulationEngine = new SimulationEngine();

export const generateInitialCandles = (count) => simulationEngine.generateInitialCandles(count);
export const generateNextCandle = () => simulationEngine.generateNextCandle();
export const calculateEMA200 = (candles) => simulationEngine.calculateEMA200(candles);
export const calculateSupportResistance = (candles) => simulationEngine.calculateSupportResistance(candles);
export const getStats = () => simulationEngine.getStats();
export const resetEngine = () => simulationEngine.reset();
