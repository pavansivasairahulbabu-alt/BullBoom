import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { orderApi } from "../../services/api.js";
import { marketStore } from "../../services/marketStore.js";

const isValidNumber = (value) =>
  value !== null && value !== undefined && !Number.isNaN(Number(value));

const formatPrice = (value) => {
  if (!isValidNumber(value)) return "-";
  return Number(value).toFixed(2);
};

const getSymbolSnapshot = (symbol) => {
  const symbolData = marketStore.getSymbolData(symbol);
  return symbolData ? { ...symbolData } : null;
};

const PARTICLES = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 2,
}));

export default function TradePage() {
  const { type, symbol } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const tradeData = useMemo(() => location.state || {}, [location.state]);

  const [quantity, setQuantity] = useState(1);
  const [targetPrice, setTargetPrice] = useState("");
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState(() => getSymbolSnapshot(symbol));
  const entryPrice = useMemo(
    () => tradeData.entryPrice ?? getSymbolSnapshot(symbol)?.currentPrice,
    [symbol, tradeData],
  );

  useEffect(() => {
    const unsubscribe = marketStore.subscribe((data) => {
      const symbolData = data[symbol];
      setMarketData(symbolData ? { ...symbolData } : null);
    });

    return unsubscribe;
  }, [symbol]);

  const liveTradeData = useMemo(() => {
    const currentPrice = marketData?.currentPrice ?? entryPrice;

    return {
      currentPrice,
      entryPrice,
      pattern: marketData ? marketData.activePattern : tradeData.pattern,
      support: marketData ? marketData.support : tradeData.support,
      resistance: marketData ? marketData.resistance : tradeData.resistance,
      ema200: marketData ? marketData.ema200 : tradeData.ema200,
    };
  }, [entryPrice, marketData, tradeData]);

  const totalAmount = isValidNumber(liveTradeData.currentPrice)
    ? Number(liveTradeData.currentPrice) * quantity
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // For BUY, use orderApi.buy which creates order and position
      if (type === "buy") {
        await orderApi.buy({
          symbol,
          quantity,
          exchange: "NSE",
          pattern: tradeData.pattern,
          support: tradeData.support,
          resistance: tradeData.resistance,
          ema200: tradeData.ema200,
          targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
          stopLossPrice: stopLossPrice ? parseFloat(stopLossPrice) : undefined,
        });
        toast.success("Order placed successfully!");
      } else if (type === "sell") {
        // For SELL, we'll handle this differently - but for now, navigate back
        toast.success(
          "Sell order functionality will be implemented from the Positions page!",
        );
      }
      navigate("/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] p-4 md:p-8">
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        {PARTICLES.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-[#32CD32] rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1220] border border-white/10 text-white hover:border-[#32CD32]/30 mb-6"
        >
          <FaArrowLeft /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0B1220] border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">
              {type === "buy" ? "Buy" : "Sell"} {symbol}
            </h1>
            <span
              className={`px-4 py-2 rounded-full font-bold ${
                type === "buy"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {type.toUpperCase()}
            </span>
          </div>

          <div className="space-y-6">
            <div className="bg-[#050816] rounded-xl p-4 border border-white/5">
              <h3 className="text-sm text-[#B8C0D4] mb-3">Trade Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[#B8C0D4]">Current Market Price</div>
                  <div className="text-white font-semibold">
                    {"\u20B9"}
                    {formatPrice(liveTradeData.currentPrice)}
                  </div>
                </div>
                <div>
                  <div className="text-[#B8C0D4]">Entry Price</div>
                  <div className="text-white font-semibold">
                    {"\u20B9"}
                    {formatPrice(liveTradeData.entryPrice)}
                  </div>
                </div>
                {liveTradeData.pattern && (
                  <div>
                    <div className="text-[#B8C0D4]">Pattern</div>
                    <div className="text-[#32CD32] font-semibold">
                      {liveTradeData.pattern}
                    </div>
                  </div>
                )}
                {isValidNumber(liveTradeData.ema200) && (
                  <div>
                    <div className="text-[#B8C0D4]">EMA200</div>
                    <div className="text-yellow-400 font-semibold">
                      {"\u20B9"}
                      {formatPrice(liveTradeData.ema200)}
                    </div>
                  </div>
                )}
                {isValidNumber(liveTradeData.support) && (
                  <div>
                    <div className="text-[#B8C0D4]">Support</div>
                    <div className="text-green-400 font-semibold">
                      {"\u20B9"}
                      {formatPrice(liveTradeData.support)}
                    </div>
                  </div>
                )}
                {isValidNumber(liveTradeData.resistance) && (
                  <div>
                    <div className="text-[#B8C0D4]">Resistance</div>
                    <div className="text-red-400 font-semibold">
                      {"\u20B9"}
                      {formatPrice(liveTradeData.resistance)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>
              {type === "buy" && (
                <>
                  <div>
                    <label className="text-xs text-[#B8C0D4] mb-1 block">
                      Target Price (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder="Enter target price"
                      className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#B8C0D4] mb-1 block">
                      Stop Loss (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={stopLossPrice}
                      onChange={(e) => setStopLossPrice(e.target.value)}
                      placeholder="Enter stop loss price"
                      className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                    />
                  </div>
                </>
              )}

              <div className="bg-[#050816] rounded-xl p-4 border border-white/5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#B8C0D4]">Total Amount</span>
                  <span className="text-white font-semibold">
                    {"\u20B9"}
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white hover:bg-[#050816]/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all ${
                    type === "buy"
                      ? "bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] hover:shadow-lg hover:shadow-green-500/25"
                      : "bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? "Processing..." : `Confirm ${type.toUpperCase()}`}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
