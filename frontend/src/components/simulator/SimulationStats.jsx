import React from 'react';
import PatternBadge from './PatternBadge';

export default function SimulationStats({
  currentPrice = 0,
  ema200 = 0,
  support = 0,
  resistance = 0,
  activePattern = null,
}) {
  return (
    <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-1">
        <p className="text-gray-400 text-sm">Current Price</p>
        <p className="text-white text-xl font-bold">{currentPrice.toFixed(2)}</p>
      </div>
      <div className="space-y-1">
        {/* <p className="text-gray-400 text-sm">EMA 200</p> */}
        <p className="text-white text-xl font-bold">{ema200 ? ema200.toFixed(2) : '---'}</p>
      </div>
      <div className="space-y-1">
        <p className="text-gray-400 text-sm">Support / Resistance</p>
        <p className="text-white text-xl font-bold">
          {support ? support.toFixed(2) : '---'} / {resistance ? resistance.toFixed(2) : '---'}
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-gray-400 text-sm">Active Pattern</p>
        <PatternBadge activePattern={activePattern} />
      </div>
    </div>
  );
}
