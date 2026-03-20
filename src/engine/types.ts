export type ProviderId = "openai" | "anthropic" | "google" | "bedrock" | "azure";

export interface UsageRecord {
  id: string;
  provider: ProviderId;
  model: string;
  date: string;           // YYYY-MM-DD
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;           // USD
  project?: string;
  feature?: string;
}

export interface DailySummary {
  date: string;
  cost: number;
  tokens: number;
  byProvider: Record<ProviderId, number>;
  byModel: Record<string, number>;
}

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  color: string;
  apiKeyPrefix: string;
  enabled: boolean;
}

export const PROVIDERS: ProviderConfig[] = [
  { id: "openai", name: "OpenAI", color: "#10A37F", apiKeyPrefix: "sk-", enabled: false },
  { id: "anthropic", name: "Anthropic", color: "#D4A574", apiKeyPrefix: "sk-ant-", enabled: false },
  { id: "google", name: "Google AI", color: "#4285F4", apiKeyPrefix: "AI", enabled: false },
  { id: "bedrock", name: "AWS Bedrock", color: "#FF9900", apiKeyPrefix: "AKIA", enabled: false },
  { id: "azure", name: "Azure OpenAI", color: "#0078D4", apiKeyPrefix: "", enabled: false },
];

export const MODEL_COLORS: Record<string, string> = {
  "gpt-4o": "#10A37F",
  "gpt-4o-mini": "#1D9E75",
  "gpt-4-turbo": "#0F6E56",
  "gpt-3.5-turbo": "#5DCAA5",
  "o1": "#085041",
  "o3-mini": "#04342C",
  "claude-3.5-sonnet": "#D4A574",
  "claude-3.5-haiku": "#D85A30",
  "claude-3-opus": "#993C1D",
  "claude-4-sonnet": "#EF9F27",
  "claude-4-opus": "#BA7517",
  "gemini-2.0-flash": "#4285F4",
  "gemini-1.5-pro": "#185FA5",
};
