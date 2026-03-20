import { Eye, Database } from "lucide-react";
import { useStore } from "@/store";

export function Header() {
  const isDemo = useStore((s) => s.isDemo);
  const { start, end } = useStore((s) => s.dateRange);
  const setDateRange = useStore((s) => s.setDateRange);

  return (
    <header className="h-12 bg-surface-card border-b border-surface-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-accent-purple/20 flex items-center justify-center">
          <Eye size={14} className="text-accent-purple" />
        </div>
        <span className="text-sm font-semibold text-white/90 tracking-tight">TokenLens</span>
        <span className="text-[10px] text-white/20 font-mono">v0.1.0</span>
        {isDemo && (
          <span className="text-[10px] bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full font-medium">
            DEMO DATA
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <input
            type="date"
            value={start}
            onChange={(e) => setDateRange(e.target.value, end)}
            className="bg-surface border border-surface-border rounded-md px-2 py-1 text-xs text-white/70 outline-none focus:border-accent-purple/50"
          />
          <span>—</span>
          <input
            type="date"
            value={end}
            onChange={(e) => setDateRange(start, e.target.value)}
            className="bg-surface border border-surface-border rounded-md px-2 py-1 text-xs text-white/70 outline-none focus:border-accent-purple/50"
          />
        </div>
        <a
          href="https://github.com/zzzzico12/tokenlens"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/20 hover:text-white/40 transition-colors"
        >
          <Database size={14} />
        </a>
      </div>
    </header>
  );
}
