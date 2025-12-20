import React from "react";
import { View, Text } from "react-native";
import { clsx } from "clsx";
import { usePlanStore } from "@/store/planStore";
import {
  getUsagePercentage,
  getRemainingUsage,
  type FeatureType,
} from "@/utils/planHelpers";

interface UsageProgressBarProps {
  feature: FeatureType;
  showLabel?: boolean;
  showRemaining?: boolean;
  height?: number;
  className?: string;
}

export default function UsageProgressBar({
  feature,
  showLabel = true,
  showRemaining = true,
  height = 8,
  className,
}: UsageProgressBarProps) {
  const { planType, usage, limits } = usePlanStore();
  const usagePercentage = getUsagePercentage(feature);
  const remaining = getRemainingUsage(feature);
  const isPro = planType === "pro";
  const isNearLimit = usagePercentage >= 80 && !isPro;
  const isAtLimit = usage[feature] >= limits[feature] && !isPro;

  // Pro users don't need progress bars
  if (isPro) {
    return (
      <View className={clsx("flex-row items-center", className)}>
        {showLabel && (
          <Text className="mr-2 text-sm font-semibold text-amber-600">PRO</Text>
        )}
        <View className="flex-1 bg-amber-100 rounded-full px-3 py-1.5">
          <Text className="text-xs font-medium text-center text-amber-700">
            Unlimited Usage ∞
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className={clsx("w-full", className)}>
      {showLabel && (
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-medium text-gray-700">Daily Usage</Text>
          <Text
            className={clsx(
              "text-xs font-semibold",
              isAtLimit && "text-red-600",
              isNearLimit && !isAtLimit && "text-orange-600",
              !isNearLimit && "text-gray-600"
            )}
          >
            {usage[feature]} / {limits[feature]}
          </Text>
        </View>
      )}

      <View
        className="w-full overflow-hidden bg-gray-200 rounded-full"
        style={{ height }}
      >
        <View
          className={clsx(
            "h-full rounded-full transition-all duration-300",
            isAtLimit && "bg-red-500",
            isNearLimit && !isAtLimit && "bg-orange-500",
            !isNearLimit && "bg-blue-500"
          )}
          style={{ width: `${usagePercentage}%` }}
        />
      </View>

      {showRemaining && (
        <View className="mt-1">
          {isAtLimit ? (
            <Text className="text-xs font-medium text-red-600">
              Daily limit reached. Upgrade to Pro for unlimited access.
            </Text>
          ) : isNearLimit ? (
            <Text className="text-xs text-orange-600">
              {remaining} {remaining === 1 ? "use" : "uses"} remaining today
            </Text>
          ) : (
            <Text className="text-xs text-gray-500">
              {remaining} {remaining === 1 ? "use" : "uses"} remaining today
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
