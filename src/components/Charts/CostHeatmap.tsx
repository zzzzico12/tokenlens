import { useMemo } from "react";
import { aggregateByDay, filterByDateRange } from "@/engine";
import { useStore } from "@/store";

const CELL = 14;
const GAP = 2;
const WEEKS = 13;

export function CostHeatmap() {
  const records = useStore((s) => s.records);
  const { start, end } = useStore((s) => s.dateRange);

  const { cells, maxCost } = useMemo(() => {
    const filtered = filterByDateRange(records, start, end);
    const daily = aggregateByDay(filtered);
    const costMap = new Map(daily.map((d) => [d.date, d.cost]));
    const maxCost = Math.max(...daily.map((d) => d.cost), 0.01);

    const endDate = new Date(end);
    const cells: Array<{ date: string; cost: number; x: number; y: number }> = [];

    for (let w = WEEKS - 1; w >= 0; w--) {
      for (let dow = 0; dow < 7; dow++) {
        const d = new Date(endDate);
        d.setDate(d.getDate() - ((WEEKS - 1 - w) * 7 + (6 - dow)));
        if (d > endDate) continue;
        const dateStr = d.toISOString().split("T")[0]!;
        if (dateStr < start) continue;
        cells.push({
          date: dateStr,
          cost: costMap.get(dateStr) ?? 0,
          x: w * (CELL + GAP),
          y: dow * (CELL + GAP),
        });
      }
    }
    return { cells, maxCost };
  }, [records, start, end]);

  const width = WEEKS * (CELL + GAP);
  const height = 7 * (CELL + GAP);

  return (
    <div className="bg-surface-card rounded-xl border border-surface-border p-4">
      <h3 className="text-sm font-medium text-white/60 mb-3">Daily spend heatmap</h3>
      <div className="overflow-x-auto">
        <svg width={width} height={height}>
          {cells.map((c) => {
            const intensity = c.cost / maxCost;
            const r = Math.round(16 + intensity * (127 - 16));
            const g = Math.round(163 + intensity * (119 - 163));
            const b = Math.round(127 + intensity * (221 - 127));
            const fill = c.cost > 0 ? `rgb(${r},${g},${b})` : "#1e2028";
            return (
              <g key={c.date}>
                <rect x={c.x} y={c.y} width={CELL} height={CELL} rx={2} fill={fill} opacity={0.9}>
                  <title>{`${c.date}: $${c.cost.toFixed(2)}`}</title>
                </rect>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex items-center gap-2 mt-2 text-[10px] text-white/30">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((v) => {
          const r = Math.round(16 + v * (127 - 16));
          const g = Math.round(163 + v * (119 - 163));
          const b = Math.round(127 + v * (221 - 127));
          return <span key={v} className="w-3 h-3 rounded-sm" style={{ background: v === 0 ? "#1e2028" : `rgb(${r},${g},${b})` }} />;
        })}
        <span>More</span>
      </div>
    </div>
  );
}
