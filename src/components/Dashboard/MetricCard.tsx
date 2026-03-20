import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  trend?: number;
}

export function MetricCard({ label, value, sub, icon, trend }: MetricCardProps) {
  return (
    <div className="bg-surface-card rounded-xl border border-surface-border p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
        {icon && <span className="text-white/20">{icon}</span>}
      </div>
      <span className="text-2xl font-semibold text-white/90 tabular-nums">{value}</span>
      <div className="flex items-center gap-2">
        {sub && <span className="text-xs text-white/30">{sub}</span>}
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trend > 0 ? "text-red-400" : "text-emerald-400"}`}>
            {trend > 0 ? "+" : ""}{trend.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
