import { create } from "zustand";
import { PlanState, FeatureType, PlanSubscriptionData } from "@/lib/types/plan";
import { subscriptionService } from "@/services/api/subscription.service";
import { openRazorpayCheckout } from "@/utils/razorpay";

// Default limits for free plan
const FREE_PLAN_LIMITS = {
  doubts: 2,
  questions: 1,
  notes: 1,
};

// Default limits for pro plan
const PRO_PLAN_LIMITS = {
  doubts: 1000,
  questions: 1000,
  notes: 1000,
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
      const result = await subscriptionService.getPlanStatus();
      const data = result.data as any;

      set({
        planType: data.planType || "free",
        limits: data.planType === "pro" ? PRO_PLAN_LIMITS : FREE_PLAN_LIMITS,
        usage: data.usage,
        status: data.status,
        trialEndsAt: data.trialEndsAt,
        currentPeriodEnd: data.currentPeriodEnd,
        loading: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      set({ error: errorMessage, loading: false });
    }
  },

  incrementUsage: (feature: FeatureType) => {
    const state = get();

    // Ensure usage exists
    if (!state.usage) {
      set({
        usage: {
          doubts: 0,
          questions: 0,
          notes: 0,
          lastResetDate: getTodayDate(),
        },
      });
      return;
    }

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
    currentUsage[feature] = currentUsage[feature] + 1;

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

  createSubscription: async (userData) => {
    set({ loading: true, error: null });
    try {
      const result = await subscriptionService.createSubscription({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.contact || "",
      });
      set({ loading: false });
      return {
        subscriptionId: result.data.subscriptionId,
        razorpaySubscriptionId: result.data.planId,
        status: result.data.status as any,
      } as PlanSubscriptionData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  initiatePayment: async (subscriptionId) => {
    set({ loading: true, error: null });
    try {
      const paymentData = await openRazorpayCheckout({ subscriptionId });
      await get().verifyPayment(paymentData);
      set({ loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment cancelled";
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  verifyPayment: async (paymentData) => {
    set({ loading: true, error: null });
    try {
      await subscriptionService.verifyPayment(paymentData);
      await get().fetchPlanStatus();
      set({ loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  cancelSubscription: async (reason) => {
    set({ loading: true, error: null });
    try {
      await subscriptionService.cancelSubscription(reason);
      await get().fetchPlanStatus();
      set({ loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },
}));
