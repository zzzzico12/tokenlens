import type { UsageRecord } from "@/engine/types";

/**
 * Parse an OpenAI usage CSV export into UsageRecord[].
 * CSV columns: date, model, usage_type, n_context_tokens, n_generated_tokens, cost
 */
export function parseOpenAICSV(csvText: string): UsageRecord[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const records: UsageRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i]!.split(",");
    if (cols.length < 6) continue;

    records.push({
      id: `openai-csv-${i}`,
      provider: "openai",
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
