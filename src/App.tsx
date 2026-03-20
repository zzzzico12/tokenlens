import { useEffect, useMemo, useCallback } from "react";
import { Header } from "@/components/Header";
import { MetricCard } from "@/components/Dashboard";
import { CostTrendChart, CostTreemap, CostHeatmap, ProviderDonut, ProjectBreakdown } from "@/components/Charts";
import { BudgetIndicator } from "@/components/Budget";
import { useStore } from "@/store";
import { filterByDateRange, totalCost, totalTokens, aggregateByModel } from "@/engine";
import { parseCSV } from "@/providers";
import { DollarSign, Coins, Layers, TrendingUp } from "lucide-react";

export default function App() {
  const records = useStore((s) => s.records);
  const loadDemo = useStore((s) => s.loadDemo);
  const addRecords = useStore((s) => s.addRecords);
  const { start, end } = useStore((s) => s.dateRange);

  useEffect(() => {
    if (records.length === 0) loadDemo();
  }, [records.length, loadDemo]);

  const filtered = useMemo(() => filterByDateRange(records, start, end), [records, start, end]);
  const cost = useMemo(() => totalCost(filtered), [filtered]);
  const tokens = useMemo(() => totalTokens(filtered), [filtered]);
  const topModel = useMemo(() => aggregateByModel(filtered)[0], [filtered]);

  const dayCount = useMemo(() => {
    if (!start || !end) return 1;
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / 86400000;
    return Math.max(diff, 1);
  }, [start, end]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length > 0) addRecords(parsed);
      };
      reader.readAsText(file);
    },
    [addRecords]
  );

  const isEmpty = records.length === 0;

  if (isEmpty) {
    return (
      <div className="h-screen flex flex-col bg-surface">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/40 text-sm mb-4">Loading demo data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col bg-surface"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Header />
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="Total spend"
            value={`$${cost.toFixed(2)}`}
            sub={`${Math.round(dayCount)} days`}
            icon={<DollarSign size={14} />}
          />
          <MetricCard
            label="Total tokens"
            value={formatNumber(tokens)}
            sub={`${formatNumber(Math.round(tokens / dayCount))}/day`}
            icon={<Coins size={14} />}
          />
          <MetricCard
            label="Top model"
            value={topModel?.model ?? "—"}
            sub={topModel ? `$${topModel.cost.toFixed(2)}` : ""}
            icon={<Layers size={14} />}
          />
          <MetricCard
            label="Daily average"
            value={`$${(cost / dayCount).toFixed(2)}`}
            sub="per day"
            icon={<TrendingUp size={14} />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            <CostTrendChart />
          </div>
          <BudgetIndicator />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <CostTreemap />
          <div className="space-y-3">
            <ProviderDonut />
            <CostHeatmap />
          </div>
        </div>

        <ProjectBreakdown />

        <div className="text-center py-6 border-t border-surface-border">
          <p className="text-xs text-white/20">
            Drop a CSV file anywhere to import usage data. All data stays in your browser.
          </p>
        </div>
      </main>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
