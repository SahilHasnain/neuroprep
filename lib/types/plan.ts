export type PlanType = "free" | "pro";

export interface PlanLimits {
  doubts: number;
  questions: number;
  notes: number;
}

export interface PlanUsage {
  doubts: number;
  questions: number;
  notes: number;
  lastResetDate: string; // ISO date string for daily reset
}

export interface PlanStatus {
  planType: PlanType;
  limits: PlanLimits;
  usage: PlanUsage;
}

export interface PlanState extends PlanStatus {
  loading: boolean;
  error: string | null;
  fetchPlanStatus: () => Promise<void>;
  incrementUsage: (feature: keyof PlanUsage) => void;
  resetDailyUsage: () => Promise<void>;
  upgradePlan: () => Promise<void>;
  downgradeToFree: () => Promise<void>;
}
