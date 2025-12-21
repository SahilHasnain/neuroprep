export type PlanType = "free" | "pro";
export type SubscriptionStatus = "active" | "trial" | "cancelled" | "expired";

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
  status?: SubscriptionStatus;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
}

export type FeatureType = "doubts" | "questions" | "notes";

export interface SubscriptionData {
  subscriptionId: string;
  razorpaySubscriptionId: string;
  status: SubscriptionStatus;
  trialEndsAt?: string;
}

export interface PlanState extends PlanStatus {
  loading: boolean;
  error: string | null;
  fetchPlanStatus: () => Promise<void>;
  incrementUsage: (feature: FeatureType) => void;
  resetDailyUsage: () => Promise<void>;
  createSubscription: (userData: { name?: string; email?: string; contact?: string }) => Promise<SubscriptionData>;
  initiatePayment: (subscriptionId: string) => Promise<void>;
  verifyPayment: (paymentData: any) => Promise<void>;
  cancelSubscription: (reason?: string) => Promise<void>;
}
