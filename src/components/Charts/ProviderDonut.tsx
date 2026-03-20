import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { aggregateByProvider, filterByDateRange, PROVIDERS } from "@/engine";
import { useStore } from "@/store";

export function ProviderDonut() {
  const records = useStore((s) => s.records);
  const { start, end } = useStore((s) => s.dateRange);

  const data = useMemo(() => {
    const filtered = filterByDateRange(records, start, end);
    return aggregateByProvider(filtered).map((p) => ({
      name: PROVIDERS.find((pr) => pr.id === p.provider)?.name ?? p.provider,
      value: Math.round(p.cost * 100) / 100,
      color: PROVIDERS.find((pr) => pr.id === p.provider)?.color ?? "#888",
    }));
  }, [records, start, end]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-surface-card rounded-xl border border-surface-border p-4">
      <h3 className="text-sm font-medium text-white/60 mb-3">By provider</h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="#1a1d27" strokeWidth={2}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#1a1d27", border: "1px solid #2a2d3a", borderRadius: 8, fontSize: 12 }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, undefined]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-1.5">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
              <span className="text-xs text-white/60">{d.name}</span>
              <span className="text-xs text-white/40 ml-auto tabular-nums">
                ${d.value.toFixed(2)} ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
