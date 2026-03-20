import type { UsageRecord, DailySummary, ProviderId } from "./types";

export function aggregateByDay(records: UsageRecord[]): DailySummary[] {
  const map = new Map<string, DailySummary>();

  for (const r of records) {
    let day = map.get(r.date);
    if (!day) {
      day = { date: r.date, cost: 0, tokens: 0, byProvider: {} as Record<ProviderId, number>, byModel: {} };
      map.set(r.date, day);
    }
    day.cost += r.cost;
    day.tokens += r.totalTokens;
    day.byProvider[r.provider] = (day.byProvider[r.provider] ?? 0) + r.cost;
    day.byModel[r.model] = (day.byModel[r.model] ?? 0) + r.cost;
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function aggregateByModel(records: UsageRecord[]): Array<{ model: string; provider: ProviderId; cost: number; tokens: number }> {
  const map = new Map<string, { model: string; provider: ProviderId; cost: number; tokens: number }>();
  for (const r of records) {
    const existing = map.get(r.model);
    if (existing) {
      existing.cost += r.cost;
      existing.tokens += r.totalTokens;
    } else {
      map.set(r.model, { model: r.model, provider: r.provider, cost: r.cost, tokens: r.totalTokens });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.cost - a.cost);
}

export function aggregateByProvider(records: UsageRecord[]): Array<{ provider: ProviderId; cost: number; tokens: number }> {
  const map = new Map<ProviderId, { provider: ProviderId; cost: number; tokens: number }>();
  for (const r of records) {
    const existing = map.get(r.provider);
    if (existing) {
      existing.cost += r.cost;
      existing.tokens += r.totalTokens;
    } else {
      map.set(r.provider, { provider: r.provider, cost: r.cost, tokens: r.totalTokens });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.cost - a.cost);
}

export function aggregateByProject(records: UsageRecord[]): Array<{ project: string; cost: number; tokens: number }> {
  const map = new Map<string, { project: string; cost: number; tokens: number }>();
  for (const r of records) {
    const proj = r.project ?? "(untagged)";
    const existing = map.get(proj);
    if (existing) {
      existing.cost += r.cost;
      existing.tokens += r.totalTokens;
    } else {
      map.set(proj, { project: proj, cost: r.cost, tokens: r.totalTokens });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.cost - a.cost);
}

export function totalCost(records: UsageRecord[]): number {
  return records.reduce((sum, r) => sum + r.cost, 0);
}

export function totalTokens(records: UsageRecord[]): number {
  return records.reduce((sum, r) => sum + r.totalTokens, 0);
}

export function filterByDateRange(records: UsageRecord[], startDate: string, endDate: string): UsageRecord[] {
  return records.filter((r) => r.date >= startDate && r.date <= endDate);
}
