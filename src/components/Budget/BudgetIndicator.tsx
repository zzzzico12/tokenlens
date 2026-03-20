import { useMemo } from "react";
import { useStore } from "@/store";
import { filterByDateRange, totalCost } from "@/engine";
import { AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";

export function BudgetIndicator() {
  const records = useStore((s) => s.records);
  const budget = useStore((s) => s.monthlyBudget);

  const { spent, daysElapsed, daysInMonth, projected, pct } = useMemo(() => {
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const today = now.toISOString().split("T")[0]!;
    const filtered = filterByDateRange(records, monthStart, today);
    const spent = totalCost(filtered);
    const daysElapsed = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dailyRate = daysElapsed > 0 ? spent / daysElapsed : 0;
    const projected = dailyRate * daysInMonth;
    const pct = budget > 0 ? (spent / budget) * 100 : 0;
    return { spent, daysElapsed, daysInMonth, projected, pct };
  }, [records, budget]);

  const isOver = pct > 100;
  const isWarning = pct > 75 && !isOver;
  const barColor = isOver ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500";
  const Icon = isOver ? AlertTriangle : isWarning ? TrendingUp : CheckCircle;

  return (
    <div className="bg-surface-card rounded-xl border border-surface-border p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-white/60">Monthly budget</h3>
        <Icon size={16} className={isOver ? "text-red-400" : isWarning ? "text-amber-400" : "text-emerald-400"} />
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-xl font-semibold text-white/90 tabular-nums">${spent.toFixed(2)}</span>
        <span className="text-sm text-white/30">/ ${budget}</span>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-white/30">
        <span>Day {daysElapsed}/{daysInMonth}</span>
        <span>Projected: ${projected.toFixed(2)}</span>
        <span>{Math.round(pct)}% used</span>
      </div>
    </div>
  );
}
