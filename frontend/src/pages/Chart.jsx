import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

// --- Symbol Mapping Utility ---
const getTradingViewSymbol = (symbol) => {
  const symbolMap = {
    NIFTY50: "NSE:NIFTY",
    NIFTY: "NSE:NIFTY",
    BANKNIFTY: "NSE:BANKNIFTY",
  };
  return symbolMap[symbol.toUpperCase()] || `NSE:${symbol.toUpperCase()}`;
};

// --- Script Loading Utility ---
let isScriptLoaded = false;

const loadTradingViewScript = () => {
  return new Promise((resolve, reject) => {
    if (window.TradingView) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      reject(new Error("TradingView script failed to load"));
    };

    document.body.appendChild(script);
  });
};

export default function Chart() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const widgetContainerRef = useRef(null);
  const widgetInstanceRef = useRef(null);
  const [loadingError, setLoadingError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeWidget = async () => {
      try {
        // --- 1. Safe checks ---
        if (!isMounted || !symbol || !widgetContainerRef.current) {
          return;
        }

        // --- 2. Clear existing widget if exists ---
        if (widgetContainerRef.current) {
          widgetContainerRef.current.innerHTML = "";
        }

        // --- 3. Load script ---
        await loadTradingViewScript();

        // --- 4. Verify prerequisites ---
        if (!isMounted || !widgetContainerRef.current || !window.TradingView) {
          if (isMounted && !window.TradingView) {
            setLoadingError(true);
          }
          return;
        }

        // --- 5. Initialize widget ---
        widgetInstanceRef.current = new window.TradingView.widget({
          width: "100%",
          height: "600px",
          symbol: getTradingViewSymbol(symbol),
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#050816",
          enable_publishing: false,
          allow_symbol_change: false,
          container_id: "tradingview-widget",

          hide_top_toolbar: true,
          hide_legend: false,
          save_image: false,
        });
        if (isMounted) {
          setLoadingError(false);
        }
      } catch (error) {
        console.error("TradingView widget error:", error);
        if (isMounted) {
          setLoadingError(true);
        }
      }
    };

    initializeWidget();

    // --- Cleanup function ---
    return () => {
      isMounted = false;
      if (widgetContainerRef.current) {
        try {
          widgetContainerRef.current.innerHTML = "";
        } catch (e) {
          // Ignore any errors during cleanup
        }
      }
      widgetInstanceRef.current = null;
    };
  }, [symbol]);

  return (
    <div className="min-h-screen bg-[#050816] p-4 md:p-8">
      {/* Animated Background */}
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
        <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl md:text-2xl font-bold">{symbol}</h1>
          </div>
          {loadingError ? (
            <div className="text-[#B8C0D4] text-center py-10">
              <p className="text-lg mb-2">Failed to load chart</p>
              <p>Please check your internet connection and refresh the page.</p>
            </div>
          ) : (
            <div
              id="tradingview-widget"
              ref={widgetContainerRef}
              className="rounded-xl overflow-hidden border border-white/10"
              style={{ minHeight: "600px" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
