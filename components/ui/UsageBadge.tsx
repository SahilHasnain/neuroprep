import React from "react";
import { View, Text } from "react-native";
import { clsx } from "clsx";
import { usePlanStore } from "@/store/planStore";
import {
  formatLimitDisplay,
  getUsagePercentage,
  type FeatureType,
} from "@/utils/planHelpers";

interface UsageBadgeProps {
  feature: FeatureType;
  variant?: "compact" | "detailed";
  className?: string;
}

export default function UsageBadge({
  feature,
  variant = "compact",
  className,
}: UsageBadgeProps) {
  const { planType, usage, limits } = usePlanStore();
  const usagePercentage = getUsagePercentage(feature);
  const displayText = formatLimitDisplay(feature);
  const isPro = planType === "pro";
  const isNearLimit = usagePercentage >= 80 && !isPro;
  const isAtLimit = usage[feature] >= limits[feature] && !isPro;

  if (variant === "compact") {
    return (
      <View
        className={clsx(
          "px-3 py-1.5 rounded-full flex-row items-center",
          isPro && "bg-amber-100",
          !isPro && isAtLimit && "bg-red-100",
          !isPro && isNearLimit && !isAtLimit && "bg-orange-100",
          !isPro && !isNearLimit && "bg-gray-100",
          className
        )}
      >
        {isPro ? (
          <>
            <Text className="text-amber-700 text-xs font-semibold mr-1">
              PRO
            </Text>
            <Text className="text-amber-600 text-xs">∞</Text>
          </>
        ) : (
          <Text
            className={clsx(
              "text-xs font-medium",
              isAtLimit && "text-red-700",
              isNearLimit && !isAtLimit && "text-orange-700",
              !isNearLimit && "text-gray-700"
            )}
          >
            {displayText}
          </Text>
        )}
      </View>
    );
  }

  // Detailed variant
  return (
    <View
      className={clsx(
        "px-4 py-2 rounded-lg border",
        isPro && "bg-amber-50 border-amber-200",
        !isPro && isAtLimit && "bg-red-50 border-red-200",
        !isPro && isNearLimit && !isAtLimit && "bg-orange-50 border-orange-200",
        !isPro && !isNearLimit && "bg-white border-gray-200",
        className
      )}
    >
      <View className="flex-row items-center justify-between mb-1">
        <Text
          className={clsx(
            "text-sm font-semibold",
            isPro && "text-amber-700",
            !isPro && isAtLimit && "text-red-700",
            !isPro && isNearLimit && !isAtLimit && "text-orange-700",
            !isPro && !isNearLimit && "text-gray-700"
          )}
        >
          {isPro ? "Pro Plan" : "Free Plan"}
        </Text>
        <Text
          className={clsx(
            "text-sm font-bold",
            isPro && "text-amber-600",
            !isPro && isAtLimit && "text-red-600",
            !isPro && isNearLimit && !isAtLimit && "text-orange-600",
            !isPro && !isNearLimit && "text-gray-600"
          )}
        >
          {displayText}
        </Text>
      </View>

      {!isPro && (
        <View className="flex-row items-center">
          <Text className="text-xs text-gray-500 mr-2">Usage:</Text>
          <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className={clsx(
                "h-full rounded-full",
                isAtLimit && "bg-red-500",
                isNearLimit && !isAtLimit && "bg-orange-500",
                !isNearLimit && "bg-blue-500"
              )}
              style={{ width: `${usagePercentage}%` }}
            />
          </View>
        </View>
      )}

      {isAtLimit && (
        <Text className="text-xs text-red-600 mt-1">Daily limit reached</Text>
      )}
    </View>
  );
}
