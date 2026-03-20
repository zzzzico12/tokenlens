import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { aggregateByProject, filterByDateRange } from "@/engine";
import { useStore } from "@/store";

const BAR_COLORS = ["#7F77DD", "#1D9E75", "#D85A30", "#EF9F27", "#378ADD", "#D4537E", "#639922"];

export function ProjectBreakdown() {
  const records = useStore((s) => s.records);
  const { start, end } = useStore((s) => s.dateRange);

  const data = useMemo(() => {
    const filtered = filterByDateRange(records, start, end);
    return aggregateByProject(filtered).map((p, i) => ({
      project: p.project,
      cost: Math.round(p.cost * 100) / 100,
      fill: BAR_COLORS[i % BAR_COLORS.length],
    }));
  }, [records, start, end]);

  return (
    <div className="bg-surface-card rounded-xl border border-surface-border p-4">
      <h3 className="text-sm font-medium text-white/60 mb-3">Cost by project</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#666" }} tickFormatter={(v: number) => `$${v}`} />
          <YAxis type="category" dataKey="project" tick={{ fontSize: 11, fill: "#999" }} width={100} />
          <Tooltip
            contentStyle={{ background: "#1a1d27", border: "1px solid #2a2d3a", borderRadius: 8, fontSize: 12 }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Cost"]}
          />
          <Bar dataKey="cost" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import { Cell } from "recharts";
