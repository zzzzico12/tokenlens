import type { UsageRecord, ProviderId } from "@/engine/types";

// USD per million tokens (approximate, as of 2025)
const ANTHROPIC_PRICING: Record<string, { input: number; output: number }> = {
  "claude-3-5-sonnet": { input: 3,    output: 15 },
  "claude-3-5-haiku":  { input: 0.8,  output: 4 },
  "claude-3-opus":     { input: 15,   output: 75 },
  "claude-3-sonnet":   { input: 3,    output: 15 },
  "claude-3-haiku":    { input: 0.25, output: 1.25 },
  "claude-4-sonnet":   { input: 3,    output: 15 },
  "claude-4-opus":     { input: 15,   output: 75 },
};

function estimateAnthropicTokens(model: string, inputCost: number, outputCost: number) {
  const key = Object.keys(ANTHROPIC_PRICING).find((k) => model.includes(k)) ?? "claude-3-5-sonnet";
  const p = ANTHROPIC_PRICING[key] ?? { input: 3, output: 15 };
  return {
    input:  p.input  > 0 ? Math.round((inputCost  / p.input)  * 1_000_000) : 0,
    output: p.output > 0 ? Math.round((outputCost / p.output) * 1_000_000) : 0,
  };
}

const OPENAI_PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o":           { input: 2.5,  output: 10 },
  "gpt-4o-mini":      { input: 0.15, output: 0.6 },
  "gpt-4-turbo":      { input: 10,   output: 30 },
  "gpt-3.5-turbo":    { input: 0.5,  output: 1.5 },
  "o1":               { input: 15,   output: 60 },
  "o1-mini":          { input: 3,    output: 12 },
  "o1-preview":       { input: 15,   output: 60 },
  "o3":               { input: 10,   output: 40 },
  "o3-mini":          { input: 1.1,  output: 4.4 },
};

function estimateOpenAICost(model: string, input: number, output: number): number {
  const key = Object.keys(OPENAI_PRICING).find((k) => model.startsWith(k)) ?? "gpt-4o";
  const p = OPENAI_PRICING[key] ?? { input: 5, output: 15 };
  return (input * p.input + output * p.output) / 1_000_000;
}

/**
 * Auto-detect CSV format and parse into UsageRecord[].
 */
export function parseCSV(csvText: string): UsageRecord[] {
  // Strip BOM if present
  const text = csvText.replace(/^\uFEFF/, "").trim();
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];

  const headerCols = splitCSVLine(lines[0]!).map((h) => h.replace(/"/g, "").trim().toLowerCase());

  // OpenAI completions usage export (start_time, end_time_iso, model, input_tokens …)
  if (headerCols.includes("start_time_iso") || headerCols.includes("num_model_requests")) {
    return parseOpenAICompletionsCSV(lines, headerCols);
  }

  // OpenAI legacy export (date, model, usage_type, n_context_tokens, n_generated_tokens, cost)
  if (headerCols.some((c) => c.includes("n_context_tokens") || c.includes("n_generated_tokens"))) {
    return parseOpenAILegacyCSV(lines, headerCols);
  }

  // Anthropic cost export (usage_date_utc, model, token_type, cost_usd …)
  if (headerCols.includes("usage_date_utc") || headerCols.includes("token_type")) {
    return parseAnthropicCostCSV(lines, headerCols);
  }

  // Anthropic generic
  if (lines[0]!.toLowerCase().includes("anthropic") || lines[0]!.toLowerCase().includes("claude")) {
    return parseGenericCSV(lines, headerCols, "anthropic");
  }

  // Generic fallback
  return parseGenericCSV(lines, headerCols, "openai");
}

// Anthropic claude_api_cost_*.csv
// Columns: usage_date_utc, model, usage_type, context_window, token_type, cost_usd, …
// Each row is input OR output tokens — aggregate by date+model
function parseAnthropicCostCSV(lines: string[], header: string[]): UsageRecord[] {
  const idx = {
    date:      firstOf(header, ["usage_date_utc", "date"]),
    model:     firstOf(header, ["model"]),
    tokenType: firstOf(header, ["token_type"]),
    cost:      firstOf(header, ["cost_usd", "cost"]),
  };

  if (idx.date < 0 || idx.cost < 0) return [];

  const aggregated = new Map<string, { inputCost: number; outputCost: number }>();

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]!);
    if (cols.length < 2) continue;

    const date  = cols[idx.date]?.replace(/"/g, "").trim().split("T")[0] ?? "";
    const model = cols[idx.model]?.replace(/"/g, "").trim() ?? "unknown";
    const type  = idx.tokenType >= 0 ? cols[idx.tokenType]?.trim().toLowerCase() : "";
    const cost  = parseFloat(cols[idx.cost] ?? "0") || 0;

    if (!date) continue;

    const key = `${date}|${model}`;
    const agg = aggregated.get(key) ?? { inputCost: 0, outputCost: 0 };
    if (type === "input")  agg.inputCost  += cost;
    else                   agg.outputCost += cost;
    aggregated.set(key, agg);
  }

  const records: UsageRecord[] = [];
  let i = 0;
  for (const [key, { inputCost, outputCost }] of aggregated) {
    const [date, model] = key.split("|") as [string, string];
    const tokens = estimateAnthropicTokens(model, inputCost, outputCost);
    records.push({
      id: `anthropic-csv-${i++}`,
      provider: "anthropic",
      model,
      date,
      inputTokens:  tokens.input,
      outputTokens: tokens.output,
      totalTokens:  tokens.input + tokens.output,
      cost: inputCost + outputCost,
    });
  }
  return records;
}

// OpenAI completions_usage_*.csv
// Columns: start_time, end_time, start_time_iso, end_time_iso, project_id,
//          num_model_requests, user_id, api_key_id, model, batch, service_tier,
//          input_tokens, output_tokens, input_cached_tokens, output_reasoning_tokens, …
function parseOpenAICompletionsCSV(lines: string[], header: string[]): UsageRecord[] {
  const idx = {
    date:   firstOf(header, ["start_time_iso", "end_time_iso"]),
    model:  firstOf(header, ["model"]),
    input:  firstOf(header, ["input_tokens"]),
    output: firstOf(header, ["output_tokens"]),
    cost:   firstOf(header, ["cost", "cost_usd", "total_cost"]),
  };

  if (idx.date < 0 || idx.model < 0) return [];

  const records: UsageRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]!);
    if (cols.length < 2) continue;

    const rawDate = cols[idx.date]?.replace(/"/g, "").trim() ?? "";
    // start_time_iso may be "2026-02-18T00:00:00+00:00" or just "2026-02-18"
    const date = rawDate.split("T")[0] ?? rawDate;
    if (!date) continue;

    const model  = cols[idx.model]?.replace(/"/g, "").trim() ?? "unknown";
    const input  = parseInt(cols[idx.input]  ?? "0", 10) || 0;
    const output = parseInt(cols[idx.output] ?? "0", 10) || 0;
    const cost   = idx.cost >= 0
      ? parseFloat(cols[idx.cost] ?? "0") || 0
      : estimateOpenAICost(model, input, output);

    records.push({
      id: `openai-csv-${i}`,
      provider: "openai",
      model,
      date,
      inputTokens: input,
      outputTokens: output,
      totalTokens: input + output,
      cost,
    });
  }
  return records.filter((r) => r.date && r.model !== "unknown" || r.totalTokens > 0);
}

// OpenAI legacy: date, model, usage_type, n_context_tokens, n_generated_tokens, cost
function parseOpenAILegacyCSV(lines: string[], header: string[]): UsageRecord[] {
  const idx = {
    date:   firstOf(header, ["date"]),
    model:  firstOf(header, ["model", "snapshot_id"]),
    input:  firstOf(header, ["n_context_tokens", "input_tokens"]),
    output: firstOf(header, ["n_generated_tokens", "output_tokens"]),
    cost:   firstOf(header, ["cost", "cost (usd)"]),
  };

  if (idx.date < 0) return [];

  const records: UsageRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]!);
    if (cols.length < 2) continue;
    const input  = parseInt(cols[idx.input]  ?? "0", 10) || 0;
    const output = parseInt(cols[idx.output] ?? "0", 10) || 0;
    const model  = cols[idx.model]?.replace(/"/g, "").trim() ?? "unknown";
    const cost   = idx.cost >= 0
      ? parseFloat(cols[idx.cost] ?? "0") || 0
      : estimateOpenAICost(model, input, output);
    records.push({
      id: `openai-legacy-${i}`,
      provider: "openai",
      model,
      date: cols[idx.date]?.replace(/"/g, "").trim() ?? "",
      inputTokens: input,
      outputTokens: output,
      totalTokens: input + output,
      cost,
    });
  }
  return records.filter((r) => r.date);
}

function parseGenericCSV(lines: string[], header: string[], defaultProvider: ProviderId): UsageRecord[] {
  const idx = {
    date:     firstOf(header, ["date", "start_time_iso", "end_time_iso"]),
    model:    firstOf(header, ["model", "model_id"]),
    cost:     firstOf(header, ["cost", "cost (usd)", "cost_usd", "spend", "amount"]),
    input:    firstOf(header, ["input_tokens", "input tokens", "n_context_tokens", "prompt_tokens"]),
    output:   firstOf(header, ["output_tokens", "output tokens", "n_generated_tokens", "completion_tokens"]),
    provider: firstOf(header, ["provider"]),
  };

  if (idx.date < 0 || idx.cost < 0) return [];

  const records: UsageRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]!);
    if (cols.length < 2) continue;

    const provider: ProviderId =
      idx.provider >= 0
        ? ((cols[idx.provider]?.trim().toLowerCase() as ProviderId) ?? defaultProvider)
        : defaultProvider;

    const input  = idx.input  >= 0 ? parseInt(cols[idx.input]  ?? "0", 10) : 0;
    const output = idx.output >= 0 ? parseInt(cols[idx.output] ?? "0", 10) : 0;
    const date   = cols[idx.date]?.replace(/"/g, "").trim().split("T")[0] ?? "";

    if (!date) continue;

    records.push({
      id: `csv-${i}`,
      provider,
      model: idx.model >= 0 ? cols[idx.model]?.replace(/"/g, "").trim() ?? "unknown" : "unknown",
      date,
      inputTokens: input,
      outputTokens: output,
      totalTokens: input + output,
      cost: parseFloat(cols[idx.cost]?.replace(/"/g, "") ?? "0") || 0,
    });
  }
  return records;
}

function firstOf(header: string[], candidates: string[]): number {
  for (const c of candidates) {
    const i = header.indexOf(c);
    if (i >= 0) return i;
  }
  // partial match fallback
  for (const c of candidates) {
    const i = header.findIndex((h) => h.includes(c));
    if (i >= 0) return i;
  }
  return -1;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
