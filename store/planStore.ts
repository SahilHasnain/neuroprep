import { create } from "zustand";
import { PlanState, PlanType } from "@/lib/types/plan";

// Default limits for free plan
const FREE_PLAN_LIMITS = {
  doubts: 5,
  questions: 10,
  notes: 20,
};

// Default limits for pro plan
const PRO_PLAN_LIMITS = {
  doubts: 999, // Effectively unlimited
  questions: 999,
  notes: 999,
};

// Get today's date in ISO format (YYYY-MM-DD)
const getTodayDate = () => new Date().toISOString().split("T")[0];

// Check if usage should be reset (different day)
const shouldResetUsage = (lastResetDate: string): boolean => {
  return lastResetDate !== getTodayDate();
};

export const usePlanStore = create<PlanState>((set, get) => ({
  planType: "free",
  limits: FREE_PLAN_LIMITS,
  usage: {
    doubts: 0,
    questions: 0,
    notes: 0,
    lastResetDate: getTodayDate(),
  },
  loading: false,
  error: null,

  fetchPlanStatus: async () => {
    set({ loading: true, error: null });
    try {
      // Call backend to fetch user's plan status
      // This should be updated with your actual backend endpoint
      const response = await fetch(
        "https://cloud.appwrite.io/v1/functions/get-plan-status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-identity-type": "user", // Will be updated by the caller
            "x-identity-id": "", // Will be updated by the caller
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch plan status: ${response.statusText}`);
      }

      const data = await response.json();

      // Determine if daily reset is needed
      const shouldReset = shouldResetUsage(
        data.usage?.lastResetDate || getTodayDate()
      );

      set({
        planType: data.planType || "free",
        limits: data.planType === "pro" ? PRO_PLAN_LIMITS : FREE_PLAN_LIMITS,
        usage: shouldReset
          ? {
              doubts: 0,
              questions: 0,
              notes: 0,
              lastResetDate: getTodayDate(),
            }
          : data.usage,
        loading: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      set({ error: errorMessage, loading: false });
    }
  },

  incrementUsage: (
    feature: keyof Omit<PlanState["usage"], "lastResetDate">
  ) => {
    const state = get();

    // Check if daily reset is needed
    const shouldReset = shouldResetUsage(state.usage.lastResetDate);

    const currentUsage = shouldReset
      ? {
          doubts: 0,
          questions: 0,
          notes: 0,
          lastResetDate: getTodayDate(),
        }
      : { ...state.usage };

    // Increment the usage
    currentUsage[feature] = (currentUsage[feature] as number) + 1;

    set({ usage: currentUsage });
  },

  resetDailyUsage: async () => {
    set({
      usage: {
        doubts: 0,
        questions: 0,
        notes: 0,
        lastResetDate: getTodayDate(),
      },
    });
  },

  upgradePlan: async () => {
    set({ loading: true, error: null });
    try {
      // Call backend to upgrade plan
      const response = await fetch(
        "https://cloud.appwrite.io/v1/functions/upgrade-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-identity-type": "user",
            "x-identity-id": "",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to upgrade plan: ${response.statusText}`);
      }

      set({
        planType: "pro",
        limits: PRO_PLAN_LIMITS,
        loading: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      set({ error: errorMessage, loading: false });
    }
  },

  downgradeToFree: async () => {
    set({ loading: true, error: null });
    try {
      // Call backend to downgrade plan
      const response = await fetch(
        "https://cloud.appwrite.io/v1/functions/downgrade-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-identity-type": "user",
            "x-identity-id": "",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to downgrade plan: ${response.statusText}`);
      }

      set({
        planType: "free",
        limits: FREE_PLAN_LIMITS,
        usage: {
          doubts: 0,
          questions: 0,
          notes: 0,
          lastResetDate: getTodayDate(),
        },
        loading: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      set({ error: errorMessage, loading: false });
    }
  },
}));
