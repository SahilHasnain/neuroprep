import React, { useState } from "react";
import { ScrollView, Text, View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePlanStore } from "@/store/planStore";
import { useAuthStore } from "@/store/authStore";
import PlanCard from "@/components/ui/PlanCard";
import UsageProgressBar from "@/components/ui/UsageProgressBar";
import UpgradeModal from "@/components/modals/UpgradeModal";
import AuthModal from "@/components/ui/AuthModal";

const PLAN_FEATURES = [
  {
    text: "5 Doubts per day",
    freeIncluded: true,
    proIncluded: false,
  },
  {
    text: "10 Questions per day",
    freeIncluded: true,
    proIncluded: false,
  },
  {
    text: "20 Notes per day",
    freeIncluded: true,
    proIncluded: false,
  },
  {
    text: "Unlimited Doubts",
    freeIncluded: false,
    proIncluded: true,
    highlighted: true,
  },
  {
    text: "Unlimited Questions",
    freeIncluded: false,
    proIncluded: true,
    highlighted: true,
  },
  {
    text: "Unlimited Notes",
    freeIncluded: false,
    proIncluded: true,
    highlighted: true,
  },
  {
    text: "Priority Support",
    freeIncluded: false,
    proIncluded: true,
  },
  {
    text: "Advanced Analytics",
    freeIncluded: false,
    proIncluded: true,
  },
  {
    text: "Ad-Free Experience",
    freeIncluded: false,
    proIncluded: true,
  },
  {
    text: "Offline Access",
    freeIncluded: false,
    proIncluded: true,
  },
];

export default function SubscriptionScreen() {
  const { planType, usage, limits, loading, fetchPlanStatus } = usePlanStore();
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
              Today's Usage
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
              Yes! You can cancel your subscription at any time. You'll continue
              to have Pro access until the end of your billing period.
            </Text>
          </View>

          <View className="mb-4">
            <Text className="mb-1 text-base font-semibold text-gray-800">
              What happens after the free trial?
            </Text>
            <Text className="text-sm text-gray-600">
              After 7 days, you'll be charged ₹199/month automatically. Cancel
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
              Pro, you'll need to create an account.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          setShowUpgradeModal(false);
          // Payment flow will be added in Phase 4
        }}
      />

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </SafeAreaView>
  );
}
