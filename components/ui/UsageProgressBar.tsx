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

  // Guard against undefined values
  if (!usage || !limits) {
    return null;
  }

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
          <Text className="mr-2 text-sm font-semibold text-amber-400">PRO</Text>
        )}
        <View className="flex-1 bg-amber-500/20 rounded-full px-3 py-1.5">
          <Text className="text-xs font-medium text-center text-amber-300">
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
          <Text className="text-sm font-medium text-gray-300">Daily Usage</Text>
          <Text
            className={clsx(
              "text-xs font-semibold",
              isAtLimit && "text-red-400",
              isNearLimit && !isAtLimit && "text-orange-400",
              !isNearLimit && "text-gray-400"
            )}
          >
            {usage[feature]} / {limits[feature]}
          </Text>
        </View>
      )}

      <View
        className="w-full overflow-hidden bg-gray-800 rounded-full"
        style={{ height }}
      >
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

      {showRemaining && (
        <View className="mt-1">
          {isAtLimit ? (
            <Text className="text-xs font-medium text-red-400">
              Daily limit reached. Upgrade to Pro for unlimited access.
            </Text>
          ) : isNearLimit ? (
            <Text className="text-xs text-orange-400">
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
