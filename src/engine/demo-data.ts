import type { UsageRecord, ProviderId } from "./types";

interface ModelDef {
  provider: ProviderId;
  model: string;
  inputPrice: number;   // per 1M tokens
  outputPrice: number;  // per 1M tokens
  weight: number;       // relative usage frequency
}

const MODELS: ModelDef[] = [
  { provider: "openai", model: "gpt-4o", inputPrice: 2.5, outputPrice: 10, weight: 30 },
  { provider: "openai", model: "gpt-4o-mini", inputPrice: 0.15, outputPrice: 0.6, weight: 25 },
  { provider: "openai", model: "gpt-4-turbo", inputPrice: 10, outputPrice: 30, weight: 5 },
  { provider: "openai", model: "o3-mini", inputPrice: 1.1, outputPrice: 4.4, weight: 8 },
  { provider: "anthropic", model: "claude-4-sonnet", inputPrice: 3, outputPrice: 15, weight: 20 },
  { provider: "anthropic", model: "claude-3.5-haiku", inputPrice: 0.8, outputPrice: 4, weight: 15 },
  { provider: "anthropic", model: "claude-4-opus", inputPrice: 15, outputPrice: 75, weight: 4 },
  { provider: "google", model: "gemini-2.0-flash", inputPrice: 0.1, outputPrice: 0.4, weight: 12 },
  { provider: "google", model: "gemini-1.5-pro", inputPrice: 1.25, outputPrice: 5, weight: 6 },
];

const PROJECTS = ["chatbot", "code-review", "docs-gen", "data-pipeline", "internal-tools"];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickWeighted(models: ModelDef[]): ModelDef {
  const totalWeight = models.reduce((sum, m) => sum + m.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const m of models) {
    rand -= m.weight;
    if (rand <= 0) return m;
  }
  return models[0]!;
}

export function generateDemoData(days: number = 90): UsageRecord[] {
  const records: UsageRecord[] = [];
  const now = new Date();

  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split("T")[0]!;

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const callsPerDay = isWeekend ? randomInt(5, 20) : randomInt(15, 60);

    const dayMultiplier = 1 + (days - d) * 0.008 + Math.sin(d * 0.3) * 0.2;

    for (let i = 0; i < callsPerDay; i++) {
      const model = pickWeighted(MODELS);
      const inputTokens = Math.round(randomInt(200, 8000) * dayMultiplier);
      const outputTokens = Math.round(randomInt(100, 4000) * dayMultiplier);
      const totalTokens = inputTokens + outputTokens;
      const cost =
        (inputTokens / 1_000_000) * model.inputPrice +
        (outputTokens / 1_000_000) * model.outputPrice;

      records.push({
        id: `${dateStr}-${model.model}-${i}`,
        provider: model.provider,
        model: model.model,
        date: dateStr,
        inputTokens,
        outputTokens,
        totalTokens,
        cost: Math.round(cost * 1_000_000) / 1_000_000,
        project: PROJECTS[randomInt(0, PROJECTS.length - 1)],
      });
    }
  }

  return records;
}
