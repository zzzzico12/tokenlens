import { useMemo } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { aggregateByModel, filterByDateRange, MODEL_COLORS, PROVIDERS } from "@/engine";
import { useStore } from "@/store";

export function CostTreemap() {
  const records = useStore((s) => s.records);
  const { start, end } = useStore((s) => s.dateRange);

  const data = useMemo(() => {
    const filtered = filterByDateRange(records, start, end);
    const byModel = aggregateByModel(filtered);

    const providerGroups = new Map<string, { name: string; children: Array<{ name: string; size: number; fill: string }> }>();

    for (const m of byModel) {
      const providerName = PROVIDERS.find((p) => p.id === m.provider)?.name ?? m.provider;
      if (!providerGroups.has(providerName)) {
        providerGroups.set(providerName, { name: providerName, children: [] });
      }
      providerGroups.get(providerName)!.children.push({
        name: m.model,
        size: Math.round(m.cost * 100) / 100,
        fill: MODEL_COLORS[m.model] ?? "#888",
      });
    }

    return Array.from(providerGroups.values());
  }, [records, start, end]);

  return (
    <div className="bg-surface-card rounded-xl border border-surface-border p-4">
      <h3 className="text-sm font-medium text-white/60 mb-3">Cost by model (treemap)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <Treemap
          data={data}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#1a1d27"
          content={<CustomTreemapNode />}
        >
          <Tooltip
            contentStyle={{ background: "#1a1d27", border: "1px solid #2a2d3a", borderRadius: 8, fontSize: 12 }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Cost"]}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}

function CustomTreemapNode(props: any) {
  const { x, y, width, height, name, fill, size } = props;
  if (width < 4 || height < 4) return null;

  const showLabel = width > 50 && height > 30;
  const showValue = width > 60 && height > 44;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={4} fill={fill ?? "#444"} fillOpacity={0.7} stroke="#1a1d27" strokeWidth={2} />
      {showLabel && (
        <text x={x + 8} y={y + 16} fill="#fff" fontSize={11} fontWeight={500} opacity={0.9}>
          {name}
        </text>
      )}
      {showValue && (
        <text x={x + 8} y={y + 30} fill="#fff" fontSize={10} opacity={0.5}>
          ${typeof size === "number" ? size.toFixed(2) : size}
        </text>
      )}
    </g>
  );
}
