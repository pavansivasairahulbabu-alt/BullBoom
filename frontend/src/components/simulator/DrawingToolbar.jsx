import {
  MousePointer2,
  TrendingUp,
  Minus,
  SeparatorVertical,
  Square,
  BadgePlus,
  BadgeMinus,
} from "lucide-react";

const tools = [
  { id: "cursor", label: "Cursor", Icon: MousePointer2 },
  { id: "trendline", label: "Trendline", Icon: TrendingUp },
  { id: "horizontal", label: "Horizontal Line", Icon: Minus },
  { id: "vertical", label: "Vertical Line", Icon: SeparatorVertical },
  { id: "rectangle", label: "Rectangle", Icon: Square },
  { divider: true },
  { id: "long-position", label: "Long Position", Icon: BadgePlus },
  { id: "short-position", label: "Short Position", Icon: BadgeMinus },
];

export default function DrawingToolbar({ activeTool, onToolChange }) {
  return (
    <div
      className="absolute z-30 right-full top-[250px] mr-3 -translate-y-1/2 max-md:right-auto max-md:left-1/2 max-md:top-auto max-md:bottom-[103px] max-md:mr-0 max-md:-translate-x-1/2 max-md:translate-y-0"
      aria-label="Chart drawing tools"
    >
      <div className="flex flex-col max-md:flex-row items-center gap-1 rounded-xl border border-white/10 bg-[#0B1220]/95 p-1.5 shadow-2xl backdrop-blur-xl">
        {tools.map((tool, index) => {
          if (tool.divider) {
            return <span key={index} className="my-1 h-px w-7 bg-white/10 max-md:mx-1 max-md:my-0 max-md:h-7 max-md:w-px" />;
          }
          const active = activeTool === tool.id;
          return (
            <div key={tool.id} className="group relative">
              <button
                type="button"
                title={tool.label}
                aria-label={tool.label}
                aria-pressed={active}
                onClick={() => onToolChange(tool.id)}
                className={`grid h-9 w-9 place-items-center rounded-lg transition-all ${
                  active
                    ? "bg-[#32CD32] text-[#050816] shadow-[0_0_16px_rgba(50,205,50,.28)]"
                    : "text-[#B8C0D4] hover:bg-white/10 hover:text-white"
                }`}
              >
                <tool.Icon size={18} strokeWidth={2} />
              </button>
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#050816] px-2 py-1 text-xs text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 max-md:bottom-full max-md:left-1/2 max-md:top-auto max-md:mb-2 max-md:ml-0 max-md:-translate-x-1/2 max-md:translate-y-0">
                {tool.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
