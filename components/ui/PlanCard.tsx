import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { clsx } from "clsx";
import Button from "./Button";
import FeatureList from "./FeatureList";

interface PlanCardProps {
  planType: "free" | "pro";
  isCurrentPlan: boolean;
  onSelectPlan?: () => void;
  onCancel?: () => void;
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
  onCancel,
  features,
}: PlanCardProps) {
  const isPro = planType === "pro";

  return (
    <View
      className={clsx(
        "rounded-2xl p-6 mb-4",
        isPro
          ? "bg-gradient-to-br from-accent-orange/20 to-accent-orange/10 border-2 border-accent-orange"
          : "bg-dark-surface-100 border-2 border-dark-surface-300"
      )}
    >
      {/* Header */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text
            className={clsx(
              "text-2xl font-bold",
              isPro ? "text-accent-orange-light" : "text-text-primary"
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
              isPro ? "text-accent-orange" : "text-text-secondary"
            )}
          >
            {isPro ? "₹199" : "₹0"}
          </Text>
          <Text
            className={clsx(
              "ml-2 text-lg",
              isPro ? "text-accent-orange-light" : "text-text-tertiary"
            )}
          >
            /month
          </Text>
        </View>

        {isPro && (
          <View className="px-3 py-1 rounded-full bg-accent-orange/30 border border-accent-orange/50 self-start">
            <Text className="text-xs font-semibold text-accent-orange-light">
              7 days free trial
            </Text>
          </View>
        )}
      </View>

      {/* Current plan badge */}
      {isCurrentPlan && (
        <View className="px-3 py-2 mb-4 rounded-lg bg-info-bg border border-info-border">
          <Text className="text-sm font-semibold text-center text-info-text">
            ✓ Current Plan
          </Text>
        </View>
      )}

      {/* Features */}
      <View className="mb-6">
        <Text className="mb-3 text-sm font-semibold text-text-secondary uppercase">
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
        />
      )}

      {isCurrentPlan && isPro && onCancel && (
        <TouchableOpacity onPress={onCancel} className="py-3">
          <Text className="text-sm text-center text-error-border">
            Cancel Subscription
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
