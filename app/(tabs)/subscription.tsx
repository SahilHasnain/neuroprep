import React, { useState } from "react";
import { ScrollView, Text, View, RefreshControl, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePlanStore } from "@/store/planStore";
import { useAuthStore } from "@/store/authStore";
import PlanCard from "@/components/ui/PlanCard";
import UsageProgressBar from "@/components/ui/UsageProgressBar";
import UpgradeModal from "@/components/modals/UpgradeModal";
import AuthModal from "@/components/ui/AuthModal";
import { PLAN_FEATURES } from "@/constants";

export default function SubscriptionScreen() {
  const { planType, usage, status, currentPeriodEnd, loading, fetchPlanStatus, cancelSubscription } = usePlanStore();
  const { user } = useAuthStore();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isPro = planType === "pro";

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPlanStatus();
    setRefreshing(false);
  };

  const handleUpgradePress = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowUpgradeModal(true);
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancel Subscription",
      "You'll have access until the end of your billing period. Are you sure?",
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelSubscription();
              Alert.alert(
                "Subscription Cancelled",
                `You'll have Pro access until ${currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString() : "the end of your billing period"}`
              );
            } catch (err) {
              Alert.alert("Error", "Failed to cancel subscription");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View className="px-6 py-8 bg-white border-b border-gray-200">
          <Text className="mb-2 text-3xl font-bold text-gray-900">
            Subscription
          </Text>
          <Text className="text-base text-gray-600">
            {isPro
              ? "You're on the Pro plan with unlimited access"
              : "Manage your plan and upgrade anytime"}
          </Text>
        </View>

        {/* Current Usage (Free users only) */}
        {!isPro && (
          <View className="px-6 py-6 bg-white border-b border-gray-200">
            <Text className="mb-4 text-lg font-semibold text-gray-900">
              Today&apos;s Usage
            </Text>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Doubts
              </Text>
              <UsageProgressBar
                feature="doubts"
                showLabel={false}
                showRemaining={false}
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Questions
              </Text>
              <UsageProgressBar
                feature="questions"
                showLabel={false}
                showRemaining={false}
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-gray-700">
                Notes
              </Text>
              <UsageProgressBar
                feature="notes"
                showLabel={false}
                showRemaining={false}
              />
            </View>
          </View>
        )}

        {/* Plans */}
        <View className="px-6 py-6">
          <Text className="mb-4 text-xl font-semibold text-gray-900">
            Choose Your Plan
          </Text>

          {/* Pro Plan Card */}
          <PlanCard
            planType="pro"
            isCurrentPlan={isPro}
            features={PLAN_FEATURES}
            onSelectPlan={handleUpgradePress}
            onCancel={isPro ? handleCancelSubscription : undefined}
          />

          {/* Free Plan Card */}
          <PlanCard
            planType="free"
            isCurrentPlan={!isPro}
            features={PLAN_FEATURES}
          />
        </View>

        {/* FAQ Section */}
        <View className="px-6 py-6 bg-white border-t border-gray-200">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Frequently Asked Questions
          </Text>

          <View className="mb-4">
            <Text className="mb-1 text-base font-semibold text-gray-800">
              Can I cancel anytime?
            </Text>
            <Text className="text-sm text-gray-600">
              Yes! You can cancel your subscription at any time. You&apos;ll continue
              to have Pro access until the end of your billing period.
            </Text>
          </View>

          <View className="mb-4">
            <Text className="mb-1 text-base font-semibold text-gray-800">
              What happens after the free trial?
            </Text>
            <Text className="text-sm text-gray-600">
              After 7 days, you&apos;ll be charged ₹199/month automatically. Cancel
              before the trial ends to avoid charges.
            </Text>
          </View>

          <View className="mb-4">
            <Text className="mb-1 text-base font-semibold text-gray-800">
              How do daily limits reset?
            </Text>
            <Text className="text-sm text-gray-600">
              Free plan limits reset every day at midnight (IST). Pro users have
              no limits.
            </Text>
          </View>

          <View>
            <Text className="mb-1 text-base font-semibold text-gray-800">
              Do I need an account?
            </Text>
            <Text className="text-sm text-gray-600">
              You can use the app as a guest with free limits. To upgrade to
              Pro, you&apos;ll need to create an account.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </SafeAreaView>
  );
}
