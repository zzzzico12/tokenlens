import { create } from "zustand";
import type { UsageRecord } from "@/engine/types";
import { generateDemoData } from "@/engine/demo-data";

interface AppState {
  records: UsageRecord[];
  setRecords: (r: UsageRecord[]) => void;
  addRecords: (r: UsageRecord[]) => void;

  dateRange: { start: string; end: string };
  setDateRange: (start: string, end: string) => void;

  monthlyBudget: number;
  setMonthlyBudget: (b: number) => void;

  isDemo: boolean;
  loadDemo: () => void;

  importModalOpen: boolean;
  setImportModalOpen: (v: boolean) => void;
}

const now = new Date();
const end = now.toISOString().split("T")[0]!;
const start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
  .toISOString()
  .split("T")[0]!;

export const useStore = create<AppState>((set) => ({
  records: [],
  setRecords: (records) => set({ records }),
  addRecords: (r) => set((s) => ({
    records: s.isDemo ? r : [...s.records, ...r],
    isDemo: false,
  })),

  dateRange: { start, end },
  setDateRange: (start, end) => set({ dateRange: { start, end } }),

  monthlyBudget: 500,
  setMonthlyBudget: (b) => set({ monthlyBudget: b }),

  isDemo: false,
  loadDemo: () => set({ records: generateDemoData(90), isDemo: true }),

  importModalOpen: false,
  setImportModalOpen: (v) => set({ importModalOpen: v }),
}));
