import React from "react";

const PATTERN_EXPLANATIONS = {
  "Double Bottom": "Double Bottom Detected - Bullish Reversal Pattern",
  "Double Top": "Double Top Detected - Bearish Reversal Pattern",
  "Bull Flag": "Bull Flag Detected - Trend Continuation Pattern",
  "Bear Flag": "Bear Flag Detected - Trend Continuation Pattern",
  "Head & Shoulders": "Head & Shoulders Detected - Bearish Reversal Pattern",
};

export default function TradingTipsPanel({ simData }) {
  const { currentPrice, ema200, support, resistance, activePattern, marketState } = simData;

  const getEmaPosition = () => {
    if (!ema200 || !currentPrice) return "---";
    return currentPrice > ema200 ? "Above EMA200 (Bullish)" : "Below EMA200 (Bearish)";
  };

  const getExplanation = () => {
    if (activePattern) {
      return PATTERN_EXPLANATIONS[activePattern] || "Pattern detected - watch for follow-through";
    }

    if (!ema200 || !support || !resistance) {
      return "Collecting initial market data...";
    }

    const aboveEma = currentPrice > ema200;
    const nearSupport = support && currentPrice - support < 30;
    const nearResistance = resistance && resistance - currentPrice < 30;

    if (aboveEma) {
      if (nearSupport) {
        return "Price is above EMA200 and near support - potential buying opportunity";
      } else if (nearResistance) {
        return "Price is above EMA200 and near resistance - watch for breakout or rejection";
      } else {
        return "Price is trading above EMA200 - bullish momentum remains strong";
      }
    } else {
      if (nearResistance) {
        return "Price is below EMA200 and near resistance - potential selling opportunity";
      } else if (nearSupport) {
        return "Price is below EMA200 and near support - watch for breakdown or bounce";
      } else {
        return "Price is trading below EMA200 - bearish momentum remains strong";
      }
    }
  };

  return (
    <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-4 mt-4">
      <h3 className="text-white font-bold text-lg mb-4">Trading Tips</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div>
            <span className="text-gray-400 text-sm">Current Trend:</span>
            <span className="text-white ml-2">{marketState || "---"}</span>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Current Pattern:</span>
            <span className="text-white ml-2">{activePattern || "No pattern detected"}</span>
          </div>
          <div>
            <span className="text-gray-400 text-sm">EMA Position:</span>
            <span className="text-white ml-2">{getEmaPosition()}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <span className="text-gray-400 text-sm">Support:</span>
            <span className="text-[#32CD32] ml-2">{support ? support.toFixed(2) : "---"}</span>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Resistance:</span>
            <span className="text-[#FF4D4D] ml-2">{resistance ? resistance.toFixed(2) : "---"}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 p-3 bg-[#1A1F3A] rounded-xl border border-white/10">
        <p className="text-gray-300 text-sm">{getExplanation()}</p>
      </div>
    </div>
  );
}
