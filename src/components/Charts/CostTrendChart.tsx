import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { aggregateByDay, filterByDateRange, PROVIDERS } from "@/engine";
import { useStore } from "@/store";

export function CostTrendChart() {
  const records = useStore((s) => s.records);
  const { start, end } = useStore((s) => s.dateRange);

  const data = useMemo(() => {
    const filtered = filterByDateRange(records, start, end);
    const daily = aggregateByDay(filtered);
    return daily.map((d) => ({
      date: d.date.slice(5),
      ...Object.fromEntries(PROVIDERS.map((p) => [p.id, Math.round((d.byProvider[p.id] ?? 0) * 100) / 100])),
      total: Math.round(d.cost * 100) / 100,
    }));
  }, [records, start, end]);

  return (
    <div className="bg-surface-card rounded-xl border border-surface-border p-4">
      <h3 className="text-sm font-medium text-white/60 mb-3">Daily cost trend</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#666" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#666" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}`} width={50} />
          <Tooltip
            contentStyle={{ background: "#1a1d27", border: "1px solid #2a2d3a", borderRadius: 8, fontSize: 12 }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, undefined]}
            labelFormatter={(label: string) => `Date: ${label}`}
          />
          {PROVIDERS.map((p) => (
            <Area key={p.id} type="monotone" dataKey={p.id} stackId="1" stroke={p.color} fill={p.color} fillOpacity={0.4} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
