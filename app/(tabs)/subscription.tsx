import React, { useEffect, useMemo } from "react";
import {
  ScrollView,
  Text,
  View,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut, LogIn } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { THEME } from "@/constants/theme";
import { usePlanStore } from "@/store/planStore";
import { useAuthStore } from "@/store/authStore";
import PlanCard from "@/components/ui/PlanCard";
import UsageProgressBar from "@/components/ui/UsageProgressBar";
import UpgradeModal from "@/components/modals/UpgradeModal";
import AuthModal from "@/components/ui/AuthModal";
import { getPlanFeatures } from "@/utils/planFeatures";

export default function SubscriptionScreen() {
  const {
    planType,
    usage,
    status,
    currentPeriodEnd,
    loading,
    fetchPlanStatus,
    cancelSubscription,
    limits,
  } = usePlanStore();
  const { user, logout } = useAuthStore();
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const isPro = planType === "pro";

  const planFeatures = useMemo(
    () => getPlanFeatures(limits || { doubts: 2, questions: 1, notes: 1 }),
    [limits]
  );

  useEffect(() => {
    fetchPlanStatus();
  }, []);

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

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (err) {
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#121212]">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={["#2563eb", "#9333ea"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="px-6 py-8 border-b border-gray-700"
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-bold text-white">Subscription</Text>
            {user ? (
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center px-4 py-2 bg-red-500/20 rounded-lg"
              >
                <LogOut size={18} color="#ef4444" />
                <Text className="ml-2 text-sm font-medium text-red-400">
                  Logout
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setShowAuthModal(true)}
                className="flex-row items-center px-4 py-2 bg-blue-500/20 rounded-lg"
              >
                <LogIn size={18} color="#60a5fa" />
                <Text className="ml-2 text-sm font-medium text-blue-400">
                  Login
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-base text-gray-200">
            {isPro
              ? "You're on the Pro plan with unlimited access"
              : "Manage your plan and upgrade anytime"}
          </Text>
        </LinearGradient>

        {/* Current Usage (Free users only) */}
        {!isPro && (
          <View
            style={{ backgroundColor: THEME.colors.background.secondary }}
            className="px-6 py-6 border-b border-gray-700"
          >
            <Text className="mb-4 text-lg font-semibold text-gray-100">
              Today&apos;s Usage
            </Text>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-300">
                Doubts
              </Text>
              <UsageProgressBar
                feature="doubts"
                showLabel={false}
                showRemaining={false}
              />
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-300">
                Questions
              </Text>
              <UsageProgressBar
                feature="questions"
                showLabel={false}
                showRemaining={false}
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-gray-300">
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
        <View
          style={{ backgroundColor: THEME.colors.background.primary }}
          className="px-6 py-6"
        >
          <Text className="mb-4 text-xl font-semibold text-gray-100">
            Choose Your Plan
          </Text>

          {/* Pro Plan Card */}
          <PlanCard
            planType="pro"
            isCurrentPlan={isPro}
            features={planFeatures}
            onSelectPlan={handleUpgradePress}
            onCancel={isPro ? handleCancelSubscription : undefined}
          />

          {/* Free Plan Card */}
          <PlanCard
            planType="free"
            isCurrentPlan={!isPro}
            features={planFeatures}
          />
        </View>

        {/* FAQ Section */}
        <View
          style={{ backgroundColor: THEME.colors.background.secondary }}
          className="px-6 py-6 border-t border-gray-700"
        >
          <Text className="mb-4 text-lg font-semibold text-gray-100">
            Frequently Asked Questions
          </Text>

          <View className="mb-4">
            <Text className="mb-1 text-base font-semibold text-gray-200">
              Can I cancel anytime?
            </Text>
            <Text className="text-sm text-gray-400">
              Yes! You can cancel your subscription at any time. You&apos;ll
              continue to have Pro access until the end of your billing period.
            </Text>
          </View>

          <View className="mb-4">
            <Text className="mb-1 text-base font-semibold text-gray-200">
              What happens after the free trial?
            </Text>
            <Text className="text-sm text-gray-400">
              After 7 days, you&apos;ll be charged ₹199/month automatically.
              Cancel before the trial ends to avoid charges.
            </Text>
          </View>

          <View className="mb-4">
            <Text className="mb-1 text-base font-semibold text-gray-200">
              How do daily limits reset?
            </Text>
            <Text className="text-sm text-gray-400">
              Free plan limits reset every day at midnight (IST). Pro users have
              no limits.
            </Text>
          </View>

          <View>
            <Text className="mb-1 text-base font-semibold text-gray-200">
              Do I need an account?
            </Text>
            <Text className="text-sm text-gray-400">
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
