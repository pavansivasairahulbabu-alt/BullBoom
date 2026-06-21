import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowUp, FaArrowDown, FaTimes } from "react-icons/fa";
import {
  generateInitialCandles,
  generateNextCandle,
  getStats,
  resetEngine,
  setSymbol,
  setTimeframe,
} from "../../utils/simulationEngine";
import { marketStore } from "../../services/marketStore";

const MARKET_STATE_LABELS = {
  TREND_UP: { text: "Uptrend", color: "#32CD32" },
  TREND_DOWN: { text: "Downtrend", color: "#FF4D4D" },
  RANGE: { text: "Range", color: "#FFD700" },
  CONSOLIDATION: { text: "Consolidation", color: "#FFD700" },
  BREAKOUT_UP: { text: "Breakout Up", color: "#32CD32" },
  BREAKOUT_DOWN: { text: "Breakout Down", color: "#FF4D4D" },
};

const isMobile = () => window.innerWidth < 768;
const isTablet = () => window.innerWidth >= 768 && window.innerWidth < 1024;

export default function TradingSimulator({
  onStatsUpdate,
  timeframe = 1,
  symbol = "NIFTY",
}) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const intervalRef = useRef(null);
  const prevPatternRef = useRef(null);
  const initialCandlesRef = useRef([]);

  const [selectedCandle, setSelectedCandle] = useState(null);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
  const [hoverCandle, setHoverCandle] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [trades, setTrades] = useState([]);
  const [isMobileDevice, setIsMobileDevice] = useState(isMobile());
  const navigate = useNavigate();

  // Handle window resize for responsive checks
  useEffect(() => {
    const handleResize = () => {
      setIsMobileDevice(isMobile());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Reset engine and set symbol/timeframe
    resetEngine();
    setSymbol(symbol);
    setTimeframe(timeframe);
    setTrades([]);

    if (!chartContainerRef.current) return;

    let lastShownDate = null;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: "solid", color: "#050816" },
        textColor: "#FFFFFF",
      },
      grid: {
        vertLines: { color: "#1A1F3A" },
        horzLines: { color: "#1A1F3A" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "#1A1F3A",
      },
      timeScale: {
        borderColor: "#1A1F3A",
        tickMarkFormatter: (time, tickMarkType, locale) => {
          const date = new Date(time * 1000);
          const day = date.getDate();
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");

          const showDate = lastShownDate !== day;

          if (showDate) {
            lastShownDate = day;
            return `${day} ${hours}:${minutes}`;
          }
          return `${hours}:${minutes}`;
        },
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#32CD32",
      downColor: "#FF4D4D",
      borderUpColor: "#32CD32",
      borderDownColor: "#FF4D4D",
      wickUpColor: "#32CD32",
      wickDownColor: "#FF4D4D",
    });

    let supportLine = null;
    let resistanceLine = null;
    let emaLine = null;

    chartRef.current = { chart, candlestickSeries };

    // Initialize candles
    const initialCandles = generateInitialCandles(200);
    initialCandlesRef.current = initialCandles;
    candlestickSeries.setData(initialCandles);

    const initialStats = getStats();
    if (onStatsUpdate) {
      onStatsUpdate(initialStats);
    }

    // Create badge container
    const badgeContainer = document.createElement("div");
    badgeContainer.style.position = "absolute";
    badgeContainer.style.top = "10px";
    badgeContainer.style.right = "10px";
    badgeContainer.style.padding = "8px 16px";
    badgeContainer.style.borderRadius = "8px";
    badgeContainer.style.fontSize = "14px";
    badgeContainer.style.fontWeight = "bold";
    badgeContainer.style.zIndex = "1000";
    chartContainerRef.current.appendChild(badgeContainer);

    // Chart click handler
    chart.subscribeClick((param) => {
      if (!param.time) return;

      const candle = initialCandlesRef.current.find(
        (c) => c.time === param.time,
      );
      if (candle) {
        setSelectedCandle(candle);

        if (!isMobileDevice) {
          // Calculate panel position for desktop/tablet
          const rect = chartContainerRef.current.getBoundingClientRect();
          const x = param.point.x;
          const y = param.point.y;

          const panelWidth = isTablet() ? 280 : 320;
          const panelHeight = 350;

          // Adjust position to keep panel inside container
          let left = x + 20;
          let top = y - panelHeight / 2;

          if (left + panelWidth > rect.width) {
            left = x - panelWidth - 20;
          }
          if (top < 10) {
            top = 10;
          }
          if (top + panelHeight > rect.height) {
            top = rect.height - panelHeight - 10;
          }

          setPanelPosition({ top, left, width: panelWidth });
        }
      }
    });

    // Chart hover handler for tooltip
    chart.subscribeCrosshairMove((param) => {
      if (!param.time) {
        setHoverCandle(null);
        return;
      }

      const candle = initialCandlesRef.current.find(
        (c) => c.time === param.time,
      );
      if (candle && param.point) {
        setHoverCandle(candle);
        setHoverPosition({ x: param.point.x, y: param.point.y });
      } else {
        setHoverCandle(null);
      }
    });

    // Live simulation
    intervalRef.current = setInterval(() => {
      const newCandle = generateNextCandle();
      const stats = getStats();

      if (newCandle && chartRef.current?.candlestickSeries) {
        chartRef.current.candlestickSeries.update(newCandle);
        initialCandlesRef.current.push(newCandle);

        // Update market store
        marketStore.setSymbolData(symbol, {
          currentPrice: newCandle.close,
          change: stats.change,
          changePercent: stats.changePercent,
          trend: stats.marketState,
          ema200: stats.ema200,
          support: stats.support,
          resistance: stats.resistance,
          activePattern: stats.activePattern,
          patternConfidence: stats.patternConfidence,
        });
      }

      // Update support/resistance lines
      if (supportLine) candlestickSeries.removePriceLine(supportLine);
      if (resistanceLine) candlestickSeries.removePriceLine(resistanceLine);
      if (emaLine) candlestickSeries.removePriceLine(emaLine);

      if (stats.support) {
        supportLine = candlestickSeries.createPriceLine({
          price: stats.support,
          color: "#32CD32",
          lineWidth: 2,
          lineStyle: 2,
          axisLabelVisible: true,
          title: "Support",
        });
      }

      if (stats.resistance) {
        resistanceLine = candlestickSeries.createPriceLine({
          price: stats.resistance,
          color: "#FF4D4D",
          lineWidth: 2,
          lineStyle: 2,
          axisLabelVisible: true,
          title: "Resistance",
        });
      }

      if (stats.ema200) {
        emaLine = candlestickSeries.createPriceLine({
          price: stats.ema200,
          color: "#FFD700",
          lineWidth: 1,
          lineStyle: 1,
          axisLabelVisible: true,
          title: "EMA200",
        });
      }

      // Update badge
      const state =
        MARKET_STATE_LABELS[stats.marketState] || MARKET_STATE_LABELS.RANGE;
      badgeContainer.textContent = state.text;
      badgeContainer.style.backgroundColor = `${state.color}33`;
      badgeContainer.style.border = `2px solid ${state.color}`;
      badgeContainer.style.color = state.color;

      // Pattern detection for toasts
      if (
        stats.activePattern &&
        stats.activePattern !== prevPatternRef.current
      ) {
        prevPatternRef.current = stats.activePattern;
        // We'll handle toast in parent
      }

      if (onStatsUpdate) {
        onStatsUpdate({
          ...stats,
          newPattern:
            stats.activePattern !== prevPatternRef.current &&
            stats.activePattern
              ? stats.activePattern
              : null,
        });
        if (stats.activePattern) prevPatternRef.current = stats.activePattern;
      }
    }, 1000);

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      setIsMobileDevice(isMobile());
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (intervalRef.current) clearInterval(intervalRef.current);
      chart.remove();
      if (badgeContainer && chartContainerRef.current) {
        chartContainerRef.current.removeChild(badgeContainer);
      }
    };
  }, [onStatsUpdate, symbol, timeframe]);

  const handleBuy = () => {
    if (!selectedCandle) return;
    const stats = getStats();
    setTrades([...trades, { ...selectedCandle, type: "buy" }]);
    navigate(`/trade/buy/${symbol}`, {
      state: {
        entryPrice: selectedCandle.close,
        pattern: stats.activePattern,
        support: stats.support,
        resistance: stats.resistance,
        ema200: stats.ema200,
        entryTime: new Date(selectedCandle.time * 1000).toISOString(),
      },
    });
  };

  const handleSell = () => {
    if (!selectedCandle) return;
    const stats = getStats();
    setTrades([...trades, { ...selectedCandle, type: "sell" }]);
    navigate(`/trade/sell/${symbol}`, {
      state: {
        entryPrice: selectedCandle.close,
        pattern: stats.activePattern,
        support: stats.support,
        resistance: stats.resistance,
        ema200: stats.ema200,
        entryTime: new Date(selectedCandle.time * 1000).toISOString(),
      },
    });
  };

  const stats = getStats();

  // Format date for header
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    return {
      date: `${day} ${month}`,
      time: `${displayHours}:${minutes} ${ampm}`,
    };
  };

  const getConfidence = () => stats.patternConfidence || 0;

  const getEmaStatus = () => {
    if (!selectedCandle || !stats.ema200) return null;
    return selectedCandle.close > stats.ema200 ? "Above" : "Below";
  };

  return (
    <div
      ref={chartContainerRef}
      className="relative w-full h-[500px] rounded-xl border border-white/10 overflow-hidden"
    >
      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoverCandle && !selectedCandle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              left: hoverPosition.x + 15,
              top: hoverPosition.y - 40,
              pointerEvents: "none",
            }}
            className="absolute z-40 bg-[#0B1220]/90 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 text-xs shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-green-400 font-semibold">
                <FaArrowUp size={10} />
                BUY
              </div>
              <div className="flex items-center gap-1 text-red-400 font-semibold">
                <FaArrowDown size={10} />
                SELL
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop/Tablet Popup */}
      <AnimatePresence>
        {selectedCandle && !isMobileDevice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              top: panelPosition.top,
              left: panelPosition.left,
              width: panelPosition.width,
            }}
            className="absolute z-50 bg-[#0B1220]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedCandle(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors p-1"
            >
              <FaTimes size={16} />
            </button>

            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="text-xs text-[#B8C0D4] mb-1">
                {formatDate(selectedCandle.time).date} |{" "}
                {formatDate(selectedCandle.time).time}
              </div>
              {stats.activePattern && (
                <div className="text-sm text-[#32CD32] font-bold">
                  {stats.activePattern}
                </div>
              )}
            </div>

            {/* Content with scroll */}
            <div className="p-4 space-y-3 overflow-y-auto max-h-[220px]">
              {/* OHLC */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-[#050816]/50 rounded-lg p-2 border border-white/5">
                  <div className="text-[#B8C0D4]">Open</div>
                  <div className="text-white font-semibold">
                    {selectedCandle.open.toFixed(2)}
                  </div>
                </div>
                <div className="bg-[#050816]/50 rounded-lg p-2 border border-white/5">
                  <div className="text-[#B8C0D4]">High</div>
                  <div className="text-green-400 font-semibold">
                    {selectedCandle.high.toFixed(2)}
                  </div>
                </div>
                <div className="bg-[#050816]/50 rounded-lg p-2 border border-white/5">
                  <div className="text-[#B8C0D4]">Low</div>
                  <div className="text-red-400 font-semibold">
                    {selectedCandle.low.toFixed(2)}
                  </div>
                </div>
                <div className="bg-[#050816]/50 rounded-lg p-2 border border-white/5">
                  <div className="text-[#B8C0D4]">Close</div>
                  <div className="text-white font-semibold">
                    {selectedCandle.close.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#050816]/50 rounded-lg p-3 border border-white/5">
                  <div className="text-[#B8C0D4] text-xs mb-1">
                    Pattern Confidence
                  </div>
                  <div className="text-yellow-400 font-bold text-sm">
                    {getConfidence()}%
                  </div>
                </div>
                <div className="bg-[#050816]/50 rounded-lg p-3 border border-white/5">
                  <div className="text-[#B8C0D4] text-xs mb-1">EMA200</div>
                  <div
                    className={`font-bold text-sm ${getEmaStatus() === "Above" ? "text-green-400" : "text-red-400"}`}
                  >
                    {getEmaStatus() || "-"}
                  </div>
                </div>
                <div className="bg-[#050816]/50 rounded-lg p-3 border border-white/5">
                  <div className="text-[#B8C0D4] text-xs mb-1">Support</div>
                  <div className="text-green-400 font-bold text-sm">
                    {stats.support?.toFixed(2) || "-"}
                  </div>
                </div>
                <div className="bg-[#050816]/50 rounded-lg p-3 border border-white/5">
                  <div className="text-[#B8C0D4] text-xs mb-1">Resistance</div>
                  <div className="text-red-400 font-bold text-sm">
                    {stats.resistance?.toFixed(2) || "-"}
                  </div>
                </div>
              </div>

              <div className="bg-[#050816]/50 rounded-lg p-3 border border-white/5">
                <div className="text-[#B8C0D4] text-xs mb-1">
                  Trend Direction
                </div>
                <div
                  className={`font-bold text-sm ${stats.marketState?.includes("UP") || stats.marketState?.includes("BREAKOUT_UP") ? "text-green-400" : stats.marketState?.includes("DOWN") || stats.marketState?.includes("BREAKOUT_DOWN") ? "text-red-400" : "text-yellow-400"}`}
                >
                  {MARKET_STATE_LABELS[stats.marketState]?.text || "Range"}
                </div>
              </div>
            </div>

            {/* Sticky Buttons */}
            <div className="p-4 pt-2 mt-auto border-t border-white/10">
              <div className="flex gap-2">
                <button
                  onClick={handleBuy}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-bold py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-green-500/40 transition-all"
                >
                  <FaArrowUp size={14} />
                  BUY
                </button>
                <button
                  onClick={handleSell}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-red-500/40 transition-all"
                >
                  <FaArrowDown size={14} />
                  SELL
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Sheet */}
      <AnimatePresence>
        {selectedCandle && isMobileDevice && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B1220]/98 backdrop-blur-xl border-t border-white/10 rounded-t-3xl shadow-2xl"
          >
            {/* Drag Indicator */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedCandle(null)}
              className="absolute top-3 right-4 text-gray-400 hover:text-white transition-colors p-1"
            >
              <FaTimes size={20} />
            </button>

            {/* Header */}
            <div className="px-6 pb-4 pt-2">
              <div className="text-sm text-[#B8C0D4] mb-1">
                {formatDate(selectedCandle.time).date} |{" "}
                {formatDate(selectedCandle.time).time}
              </div>
              {stats.activePattern && (
                <div className="text-lg text-[#32CD32] font-bold">
                  {stats.activePattern}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="px-6 pb-4 space-y-3 overflow-y-auto max-h-[40vh]">
              {/* OHLC */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-[#050816]/50 rounded-lg p-3 border border-white/5">
                  <div className="text-[#B8C0D4]">Open</div>
                  <div className="text-white font-semibold">
                    {selectedCandle.open.toFixed(2)}
                  </div>
                </div>
                <div className="bg-[#050816]/50 rounded-lg p-3 border border-white/5">
                  <div className="text-[#B8C0D4]">High</div>
                  <div className="text-green-400 font-semibold">
                    {selectedCandle.high.toFixed(2)}
                  </div>
                </div>
                <div className="bg-[#050816]/50 rounded-lg p-3 border border-white/5">
                  <div className="text-[#B8C0D4]">Low</div>
                  <div className="text-red-400 font-semibold">
                    {selectedCandle.low.toFixed(2)}
                  </div>
                </div>
                <div className="bg-[#050816]/50 rounded-lg p-3 border border-white/5">
                  <div className="text-[#B8C0D4]">Close</div>
                  <div className="text-white font-semibold">
                    {selectedCandle.close.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#050816]/50 rounded-lg p-3 border border-white/5">
                  <div className="text-[#B8C0D4] text-xs mb-1">
                    Pattern Confidence
                  </div>
                  <div className="text-yellow-400 font-bold text-sm">
                    {getConfidence()}%
                  </div>
                </div>
                <div className="bg-[#050816]/50 rounded-lg p-3 border border-white/5">
                  <div className="text-[#B8C0D4] text-xs mb-1">EMA200</div>
                  <div
                    className={`font-bold text-sm ${getEmaStatus() === "Above" ? "text-green-400" : "text-red-400"}`}
                  >
                    {getEmaStatus() || "-"}
                  </div>
                </div>
                <div className="bg-[#050816]/50 rounded-lg p-3 border border-white/5">
                  <div className="text-[#B8C0D4] text-xs mb-1">Support</div>
                  <div className="text-green-400 font-bold text-sm">
                    {stats.support?.toFixed(2) || "-"}
                  </div>
                </div>
                <div className="bg-[#050816]/50 rounded-lg p-3 border border-white/5">
                  <div className="text-[#B8C0D4] text-xs mb-1">Resistance</div>
                  <div className="text-red-400 font-bold text-sm">
                    {stats.resistance?.toFixed(2) || "-"}
                  </div>
                </div>
              </div>

              <div className="bg-[#050816]/50 rounded-lg p-3 border border-white/5">
                <div className="text-[#B8C0D4] text-xs mb-1">
                  Trend Direction
                </div>
                <div
                  className={`font-bold text-sm ${stats.marketState?.includes("UP") || stats.marketState?.includes("BREAKOUT_UP") ? "text-green-400" : stats.marketState?.includes("DOWN") || stats.marketState?.includes("BREAKOUT_DOWN") ? "text-red-400" : "text-yellow-400"}`}
                >
                  {MARKET_STATE_LABELS[stats.marketState]?.text || "Range"}
                </div>
              </div>
            </div>

            {/* Sticky Buttons */}
            <div className="p-6 pt-2 border-t border-white/10">
              <div className="flex gap-3">
                <button
                  onClick={handleBuy}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-green-500/40 transition-all text-lg"
                >
                  <FaArrowUp size={16} />
                  BUY
                </button>
                <button
                  onClick={handleSell}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-red-500/40 transition-all text-lg"
                >
                  <FaArrowDown size={16} />
                  SELL
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
