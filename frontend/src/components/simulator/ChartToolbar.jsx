import React from 'react';

export default function ChartToolbar({ symbol, onReset, timeframe, onTimeframeChange }) {
  return (
    <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Symbol</span>
          <span className="text-white font-bold text-lg">{symbol}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Timeframe</span>
          <select 
            value={timeframe} 
            onChange={(e) => onTimeframeChange(Number(e.target.value))}
            className="bg-[#1A1F3A] text-white border border-white/10 rounded-md px-2 py-1 outline-none font-bold"
          >
            <option value={1}>1 Minute</option>
            <option value={5}>5 Minutes</option>
            <option value={15}>15 Minutes</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Status</span>
          <span className="text-[#32CD32] font-bold">Simulation Mode</span>
        </div>
      </div>
      <button
        onClick={onReset}
        className="px-4 py-2 rounded-xl bg-[#32CD32]/10 border border-[#32CD32]/30 text-[#32CD32] font-medium hover:bg-[#32CD32]/20 transition-colors"
      >
        Reset Simulation
      </button>
    </div>
  );
}
