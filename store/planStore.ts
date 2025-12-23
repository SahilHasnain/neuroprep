import { create } from "zustand";
import { PlanState, FeatureType, PlanSubscriptionData } from "@/lib/types/plan";
import { subscriptionService } from "@/services/api/subscription.service";
import { openRazorpayCheckout } from "@/utils/razorpay";
import { getGuestUsage, setGuestLimits, getGuestLimits } from "@/utils/guestUsageTracker";
import { useAuthStore } from "./authStore";

// Default limits for pro plan
const PRO_PLAN_LIMITS = {
  doubts: 1000,
  questions: 1000,
  notes: 1000,
};

export const usePlanStore = create<PlanState>((set, get) => ({
  planType: "free",
  limits: { doubts: 2, questions: 1, notes: 1 }, // Default fallback
  usage: {
    doubts: 0,
    questions: 0,
    notes: 0,
    lastResetDate: new Date().toISOString().split("T")[0],
  },
  loading: false,
  error: null,

  fetchPlanStatus: async () => {
    set({ loading: true, error: null });
    try {
      const { user } = useAuthStore.getState();

      // Guest: Read from AsyncStorage
      if (!user) {
        const result = await subscriptionService.getPlanStatus();
        const data = result.data as any;
        
        // Set limits from backend
        if (data.limits) {
          setGuestLimits(data.limits);
        }
        
        const guestUsage = await getGuestUsage();
        set({
          planType: "free",
          limits: data.limits || getGuestLimits(),
          usage: {
            doubts: guestUsage.doubts,
            questions: guestUsage.questions,
            notes: guestUsage.notes,
            lastResetDate: guestUsage.date,
          },
          loading: false,
        });
        return;
      }

      // Logged-in: Fetch from backend
      const result = await subscriptionService.getPlanStatus();
      const data = result.data as any;

      set({
        planType: data.planType || "free",
        limits: data.limits || PRO_PLAN_LIMITS,
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
    const { user } = useAuthStore.getState();
    
    // Guests: handled by guestUsageTracker in hooks
    if (!user) return;

    // Logged-in users: update Zustand
    const state = get();
    if (!state.usage) return;

    const currentUsage = { ...state.usage };
    currentUsage[feature] = currentUsage[feature] + 1;
    set({ usage: currentUsage });
  },

  resetDailyUsage: async () => {
    const { user } = useAuthStore.getState();
    
    // Guests: handled by guestUsageTracker
    if (!user) return;

    // Logged-in users: reset Zustand
    set({
      usage: {
        doubts: 0,
        questions: 0,
        notes: 0,
        lastResetDate: new Date().toISOString().split("T")[0],
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
