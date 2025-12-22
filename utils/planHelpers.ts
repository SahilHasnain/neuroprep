import { usePlanStore } from "@/store/planStore";

export type FeatureType = "doubts" | "questions" | "notes";

/**
 * Check if user has reached their daily limit for a feature
 */
export const hasReachedLimit = (feature: FeatureType): boolean => {
  const { usage, limits } = usePlanStore.getState();
  if (!usage || !limits) return false;
  return usage[feature] >= limits[feature];
};

/**
 * Get remaining usage count for a feature
 */
export const getRemainingUsage = (feature: FeatureType): number => {
  const { usage, limits } = usePlanStore.getState();
  if (!usage || !limits) return 0;
  const remaining = limits[feature] - usage[feature];
  return Math.max(0, remaining);
};

/**
 * Get usage percentage for a feature
 */
export const getUsagePercentage = (feature: FeatureType): number => {
  const { usage, limits } = usePlanStore.getState();
  if (!usage || !limits || limits[feature] === 0) return 0;
  return Math.min(100, (usage[feature] / limits[feature]) * 100);
};

/**
 * Format limit display (e.g., "5/10" or "Unlimited")
 */
export const formatLimitDisplay = (feature: FeatureType): string => {
  const { usage, limits, planType } = usePlanStore.getState();
  if (!usage || !limits) return "Loading...";
  if (planType === "pro" || limits[feature] >= 999) {
    return "Unlimited";
  }
  return `${usage[feature]}/${limits[feature]}`;
};

/**
 * Get user-friendly feature name
 */
export const getFeatureName = (feature: FeatureType): string => {
  const names: Record<FeatureType, string> = {
    doubts: "Doubts",
    questions: "Questions",
    notes: "Notes",
  };
  return names[feature];
};
