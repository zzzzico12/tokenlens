import type { UsageRecord } from "@/engine/types";

/**
 * Fetches usage data from Anthropic's Usage API.
 * Stub — will be implemented with the Anthropic admin API.
 */
export async function fetchAnthropicUsage(
  _apiKey: string,
  _startDate: string,
  _endDate: string
): Promise<UsageRecord[]> {
  console.warn("[TokenLens] Anthropic Usage API integration not yet implemented. Use demo data.");
  return [];
}

/**
 * Parse an Anthropic usage CSV export into UsageRecord[].
 */
export function parseAnthropicCSV(csvText: string): UsageRecord[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const records: UsageRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i]!.split(",");
    if (cols.length < 6) continue;

    records.push({
      id: `anthropic-csv-${i}`,
      provider: "anthropic",
      model: cols[1]?.trim() ?? "unknown",
      date: cols[0]?.trim() ?? "",
      inputTokens: parseInt(cols[3] ?? "0", 10),
      outputTokens: parseInt(cols[4] ?? "0", 10),
      totalTokens: parseInt(cols[3] ?? "0", 10) + parseInt(cols[4] ?? "0", 10),
      cost: parseFloat(cols[5] ?? "0"),
    });
  }

  return records;
}
