
// Market Data Provider - Enhanced Mock Implementation
// Ready for Upstox API integration

// Store simulated market data in memory for persistence
const simulatedMarketData = new Map();
const dayHigh = new Map();
const dayLow = new Map();
const previousClose = new Map();

// Initial prices for popular symbols
const initialPrices = {
  "NIFTY": 24500.25,
  "BANKNIFTY": 51200.45,
  "SENSEX": 74500.50,
  "RELIANCE": 2950.30,
  "INFY": 1820.75,
  "TCS": 4250.50,
  "HDFCBANK": 1950.40,
  "ICICIBANK": 1350.60,
  "SBIN": 980.35,
  "AXISBANK": 1280.25,
  "KOTAKBANK": 2150.70,
  "TATAMOTORS": 1050.80,
  "MARUTI": 12500.30,
  "TITAN": 3650.60,
  "ASIANPAINT": 3250.90,
  "HINDUNILVR": 2950.45,
  "BAJAJFINSV": 8500.30,
  "BAJFINANCE": 11000.50,
  "LICI": 1250.25,
  "ADANIGREEN": 1450.80,
  "ADANIENT": 3250.65
};

// Initialize market data
Object.keys(initialPrices).forEach(symbol => {
  const basePrice = initialPrices[symbol];
  simulatedMarketData.set(symbol, {
    price: basePrice,
    change: 0,
    changePercent: 0,
    open: basePrice
  });
  dayHigh.set(symbol, basePrice);
  dayLow.set(symbol, basePrice);
  previousClose.set(symbol, basePrice * (0.995 + Math.random() * 0.01)); // ±0.5% from base
});

// Update prices every 3 seconds for realism
setInterval(() => {
  for (const [symbol, data] of simulatedMarketData) {
    const volatility = 0.002; // ±0.2% volatility per tick for realism
    const changeFactor = 1 + (Math.random() - 0.5) * 2 * volatility;

    const newPrice = data.price * changeFactor;
    const priceChange = newPrice - previousClose.get(symbol);
    const changePercent = (priceChange / previousClose.get(symbol)) * 100;

    // Update day high/low
    if (newPrice > dayHigh.get(symbol)) {
      dayHigh.set(symbol, newPrice);
    }
    if (newPrice < dayLow.get(symbol)) {
      dayLow.set(symbol, newPrice);
    }

    // Update market data
    simulatedMarketData.set(symbol, {
      ...data,
      price: Number(newPrice.toFixed(2)),
      change: Number(priceChange.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2))
    });
  }
}, 3000); // Update every 3 seconds

export const getMarketData = async (symbol) => {
  const normalizedSymbol = symbol.toUpperCase().trim();

  // Check if we already have data
  if (simulatedMarketData.has(normalizedSymbol)) {
    return {
      symbol: normalizedSymbol,
      price: simulatedMarketData.get(normalizedSymbol).price,
      change: simulatedMarketData.get(normalizedSymbol).change,
      changePercent: simulatedMarketData.get(normalizedSymbol).changePercent,
      dayHigh: Number(dayHigh.get(normalizedSymbol).toFixed(2)),
      dayLow: Number(dayLow.get(normalizedSymbol).toFixed(2)),
      open: simulatedMarketData.get(normalizedSymbol).open,
      previousClose: Number(previousClose.get(normalizedSymbol).toFixed(2))
    };
  }

  // Generate random price for new symbols
  const basePrice = 500 + Math.random() * 5000;
  const prevClose = basePrice * (0.99 + Math.random() * 0.02);
  const priceChange = basePrice - prevClose;
  const changePercent = (priceChange / prevClose) * 100;

  // Store new symbol data
  simulatedMarketData.set(normalizedSymbol, {
    price: Number(basePrice.toFixed(2)),
    change: Number(priceChange.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    open: Number(basePrice.toFixed(2))
  });
  dayHigh.set(normalizedSymbol, basePrice);
  dayLow.set(normalizedSymbol, basePrice);
  previousClose.set(normalizedSymbol, prevClose);

  return {
    symbol: normalizedSymbol,
    price: Number(basePrice.toFixed(2)),
    change: Number(priceChange.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    dayHigh: Number(basePrice.toFixed(2)),
    dayLow: Number(basePrice.toFixed(2)),
    open: Number(basePrice.toFixed(2)),
    previousClose: Number(prevClose.toFixed(2))
  };
};

export const getMarketDataBulk = async (symbols) => {
  const results = {};
  for (const symbol of symbols) {
    results[symbol] = await getMarketData(symbol);
  }
  return results;
};

export default { getMarketData, getMarketDataBulk };
