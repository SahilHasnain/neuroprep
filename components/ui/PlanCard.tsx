import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { clsx } from "clsx";
import Button from "./Button";
import FeatureList from "./FeatureList";

interface PlanCardProps {
  planType: "free" | "pro";
  isCurrentPlan: boolean;
  onSelectPlan?: () => void;
  features: Array<{
    text: string;
    freeIncluded: boolean;
    proIncluded: boolean;
    highlighted?: boolean;
  }>;
}

export default function PlanCard({
  planType,
  isCurrentPlan,
  onSelectPlan,
  features,
}: PlanCardProps) {
  const isPro = planType === "pro";

  return (
    <View
      className={clsx(
        "rounded-2xl p-6 mb-4",
        isPro
          ? "bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400"
          : "bg-white border-2 border-gray-200"
      )}
    >
      {/* Header */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text
            className={clsx(
              "text-2xl font-bold",
              isPro ? "text-amber-700" : "text-gray-900"
            )}
          >
            {isPro ? "Pro Plan" : "Free Plan"}
          </Text>
          {isPro && <Text className="text-2xl">👑</Text>}
        </View>

        {/* Pricing */}
        <View className="flex-row items-baseline mb-2">
          <Text
            className={clsx(
              "text-4xl font-bold",
              isPro ? "text-amber-600" : "text-gray-700"
            )}
          >
            {isPro ? "₹199" : "₹0"}
          </Text>
          <Text
            className={clsx(
              "ml-2 text-lg",
              isPro ? "text-amber-500" : "text-gray-500"
            )}
          >
            /month
          </Text>
        </View>

        {isPro && (
          <View className="px-3 py-1 rounded-full bg-amber-200 self-start">
            <Text className="text-xs font-semibold text-amber-800">
              7 days free trial
            </Text>
          </View>
        )}
      </View>

      {/* Current plan badge */}
      {isCurrentPlan && (
        <View className="px-3 py-2 mb-4 rounded-lg bg-blue-50 border border-blue-200">
          <Text className="text-sm font-semibold text-center text-blue-700">
            ✓ Current Plan
          </Text>
        </View>
      )}

      {/* Features */}
      <View className="mb-6">
        <Text className="mb-3 text-sm font-semibold text-gray-700 uppercase">
          Features
        </Text>
        <FeatureList features={features} planType={planType} />
      </View>

      {/* CTA Button */}
      {!isCurrentPlan && (
        <Button
          title={isPro ? "Upgrade to Pro" : "Downgrade to Free"}
          onPress={onSelectPlan || (() => {})}
          variant={isPro ? "primary" : "outline"}
          fullWidth
          className={isPro ? "bg-amber-500" : ""}
        />
      )}

      {isCurrentPlan && isPro && (
        <TouchableOpacity
          onPress={() => {
            /* Cancel subscription */
          }}
          className="py-3"
        >
          <Text className="text-sm text-center text-gray-600">
            Cancel Subscription
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
