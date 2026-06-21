import React from "react";

export default function ChartLegend() {
  return (
    <div className="bg-[#0B1220] border border-white/10 rounded-2xl p-3 mt-4 flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-1 bg-[#32CD32] rounded" style={{ border: "1px dashed #32CD32" }}></div>
        <span className="text-white text-sm">Support</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-1 bg-[#FF4D4D] rounded" style={{ border: "1px dashed #FF4D4D" }}></div>
        <span className="text-white text-sm">Resistance</span>
      </div>
    </div>
  );
}
