import React, { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";

import {
  generateInitialCandles,
  generateNextCandle,
  getStats,
  resetEngine,
  setTimeframe
} from "../../utils/simulationEngine";

const MARKET_STATE_LABELS = {
  TREND_UP: { text: "Uptrend", color: "#32CD32" },
  TREND_DOWN: { text: "Downtrend", color: "#FF4D4D" },
  RANGE: { text: "Range", color: "#FFD700" },
  BREAKOUT_UP: { text: "Breakout Up", color: "#32CD32" },
  BREAKOUT_DOWN: { text: "Breakout Down", color: "#FF4D4D" },
};

export default function TradingSimulator({ onStatsUpdate, timeframe = 1 }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const intervalRef = useRef(null);
  const prevPatternRef = useRef(null);

  useEffect(() => {
    resetEngine();
    setTimeframe(timeframe);
    if (!chartContainerRef.current) return;

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

    const emaSeries = chart.addSeries(LineSeries, {
      color: "#FFD700",
      lineWidth: 2,
    });

    let supportLine = null;
    let resistanceLine = null;

    chartRef.current = { chart, candlestickSeries, emaSeries };

    // Initialize candles
    const initialCandles = generateInitialCandles(200);
    candlestickSeries.setData(initialCandles);

    const initialStats = getStats();
    if (onStatsUpdate) {
      onStatsUpdate(initialStats);
    }

    if (initialStats.ema200Data.length) {
      emaSeries.setData(initialStats.ema200Data);
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

    // Live simulation
    intervalRef.current = setInterval(() => {
      const newCandle = generateNextCandle();
      const stats = getStats();

      if (newCandle && chartRef.current?.candlestickSeries) {
        chartRef.current.candlestickSeries.update(newCandle);
      }

      if (chartRef.current?.emaSeries && stats.ema200Data.length) {
        emaSeries.setData(stats.ema200Data);
      }

      // Update support/resistance lines
      if (supportLine) candlestickSeries.removePriceLine(supportLine);
      if (resistanceLine) candlestickSeries.removePriceLine(resistanceLine);

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

      // Update badge
      const state = MARKET_STATE_LABELS[stats.marketState] || MARKET_STATE_LABELS.RANGE;
      badgeContainer.textContent = state.text;
      badgeContainer.style.backgroundColor = `${state.color}33`;
      badgeContainer.style.border = `2px solid ${state.color}`;
      badgeContainer.style.color = state.color;

      // Pattern detection for toasts
      if (stats.activePattern && stats.activePattern !== prevPatternRef.current) {
        prevPatternRef.current = stats.activePattern;
        // We'll handle toast in parent
      }

      if (onStatsUpdate) {
        onStatsUpdate({ ...stats, newPattern: stats.activePattern !== prevPatternRef.current && stats.activePattern ? stats.activePattern : null });
        if (stats.activePattern) prevPatternRef.current = stats.activePattern;
      }
    }, 1000);

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
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
  }, [onStatsUpdate]);

  return (
    <div
      ref={chartContainerRef}
      className="relative w-full h-[500px] rounded-xl border border-white/10 overflow-hidden"
    />
  );
}
