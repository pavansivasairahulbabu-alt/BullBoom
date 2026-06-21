import React, { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import TradingSimulator from "../components/simulator/TradingSimulator";
import ChartToolbar from "../components/simulator/ChartToolbar";
import SimulationStats from "../components/simulator/SimulationStats";
import TradingTipsPanel from "../components/simulator/TradingTipsPanel";
import ChartLegend from "../components/simulator/ChartLegend";

const PATTERN_TOASTS = {
  "Double Bottom": "📈 Double Bottom Detected - Bullish Reversal Pattern",
  "Double Top": "📉 Double Top Detected - Bearish Reversal Pattern",
  "Bull Flag": "🚀 Bull Flag Detected - Trend Continuation Pattern",
  "Bear Flag": "🔻 Bear Flag Detected - Trend Continuation Pattern",
  "Head & Shoulders": "⚠️ Head & Shoulders Detected - Bearish Reversal Pattern",
};

export default function Chart() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [simData, setSimData] = useState({
    currentPrice: 22500,
    ema200: 22500,
    support: 22400,
    resistance: 22600,
    activePattern: null,
    marketState: "RANGE",
  });
  const [resetKey, setResetKey] = useState(0);
  const prevPatternRef = useRef(null);

  const handleStatsUpdate = useCallback((stats) => {
    setSimData(stats);
  }, []);

  useEffect(() => {
    if (simData.activePattern && simData.activePattern !== prevPatternRef.current) {
      prevPatternRef.current = simData.activePattern;
      const message = PATTERN_TOASTS[simData.activePattern];
      if (message) {
        toast(message, {
          duration: 5000,
          style: {
          backgroundColor: "#0B1220",
          color: "white",
          border: "1px solid #FFD700",
          },
        });
      }
    }
  }, [simData.activePattern]);

  const handleReset = () => {
    setResetKey((prev) => prev + 1);
    prevPatternRef.current = null;
  };

  return (
    <div className="min-h-screen bg-[#050816] p-4 md:p-8">
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#32CD32] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1220] border border-white/10 text-white hover:border-[#32CD32]/30"
        >
          <FaArrowLeft /> Back
        </button>

        <ChartToolbar symbol={symbol} onReset={handleReset} />

        <SimulationStats
          currentPrice={simData.currentPrice}
          ema200={simData.ema200}
          support={simData.support}
          resistance={simData.resistance}
          activePattern={simData.activePattern}
        />

        <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <TradingSimulator key={resetKey} onStatsUpdate={handleStatsUpdate} />
          <ChartLegend />
          <TradingTipsPanel simData={simData} />
        </div>
      </div>
    </div>
  );
}
