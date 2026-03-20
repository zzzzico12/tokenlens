import type { UsageRecord, ProviderId } from "@/engine/types";
import { parseOpenAICSV } from "./openai";
import { parseAnthropicCSV } from "./anthropic";

/**
 * Auto-detect CSV format and parse into UsageRecord[].
 */
export function parseCSV(csvText: string): UsageRecord[] {
  const firstLine = csvText.split("\n")[0]?.toLowerCase() ?? "";

  if (firstLine.includes("n_context_tokens") || firstLine.includes("openai")) {
    return parseOpenAICSV(csvText);
  }
  if (firstLine.includes("anthropic") || firstLine.includes("claude")) {
    return parseAnthropicCSV(csvText);
  }

  return parseGenericCSV(csvText);
}

function parseGenericCSV(csvText: string): UsageRecord[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const header = lines[0]!.toLowerCase().split(",").map((h) => h.trim());
  const dateIdx = header.findIndex((h) => h.includes("date"));
  const modelIdx = header.findIndex((h) => h.includes("model"));
  const costIdx = header.findIndex((h) => h.includes("cost") || h.includes("spend") || h.includes("amount"));
  const inputIdx = header.findIndex((h) => h.includes("input") && h.includes("token"));
  const outputIdx = header.findIndex((h) => h.includes("output") && h.includes("token"));
  const providerIdx = header.findIndex((h) => h.includes("provider"));

  if (dateIdx < 0 || costIdx < 0) return [];

  const records: UsageRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i]!.split(",");

    const provider: ProviderId =
      providerIdx >= 0 ? (cols[providerIdx]?.trim().toLowerCase() as ProviderId) ?? "openai" : "openai";

    records.push({
      id: `csv-${i}`,
      provider,
      model: modelIdx >= 0 ? cols[modelIdx]?.trim() ?? "unknown" : "unknown",
      date: cols[dateIdx]?.trim() ?? "",
      inputTokens: inputIdx >= 0 ? parseInt(cols[inputIdx] ?? "0", 10) : 0,
      outputTokens: outputIdx >= 0 ? parseInt(cols[outputIdx] ?? "0", 10) : 0,
      totalTokens:
        (inputIdx >= 0 ? parseInt(cols[inputIdx] ?? "0", 10) : 0) +
        (outputIdx >= 0 ? parseInt(cols[outputIdx] ?? "0", 10) : 0),
      cost: parseFloat(cols[costIdx] ?? "0"),
    });
  }

  return records;
}
