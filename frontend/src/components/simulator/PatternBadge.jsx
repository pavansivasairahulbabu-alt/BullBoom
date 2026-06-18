import React from 'react';

const PATTERNS = [
  'Double Bottom',
  'Double Top',
  'Bull Flag',
  'Bear Flag',
  'Triangle',
  'Head & Shoulders',
];

export default function PatternBadge({ activePattern = null }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PATTERNS.map((p) => (
        <span
          key={p}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            activePattern === p
              ? 'bg-[#32CD32]/20 border-[#32CD32]/50 text-[#32CD32]'
              : 'bg-[#0B1220] border-white/10 text-gray-400'
          }`}
        >
          {p}
        </span>
      ))}
    </div>
  );
}
