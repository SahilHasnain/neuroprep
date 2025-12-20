import React from "react";
import {
  Modal,
  Pressable,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { clsx } from "clsx";
import Button from "../ui/Button";
import { usePlanStore } from "@/store/planStore";
import { useAuthStore } from "@/store/authStore";
import { getFeatureName, type FeatureType } from "@/utils/planHelpers";

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  feature?: FeatureType;
  onUpgrade?: () => void;
}

const PRO_FEATURES = [
  {
    icon: "∞",
    title: "Unlimited Doubts",
    desc: "Ask as many doubts as you want",
  },
  {
    icon: "📝",
    title: "Unlimited Questions",
    desc: "Generate unlimited practice questions",
  },
  {
    icon: "📚",
    title: "Unlimited Notes",
    desc: "Create comprehensive study notes",
  },
  { icon: "⚡", title: "Priority Support", desc: "Get faster response times" },
  {
    icon: "🎯",
    title: "Advanced Analytics",
    desc: "Track your progress in detail",
  },
  {
    icon: "🔒",
    title: "Ad-Free Experience",
    desc: "Study without distractions",
  },
];

export default function UpgradeModal({
  visible,
  onClose,
  feature,
  onUpgrade,
}: UpgradeModalProps) {
  const { planType } = usePlanStore();
  const { user } = useAuthStore();
  const [showAuthPrompt, setShowAuthPrompt] = React.useState(false);

  const handleUpgrade = () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    onUpgrade?.();
    // In Phase 4, this will trigger payment flow
  };

  const handleClose = () => {
    setShowAuthPrompt(false);
    onClose();
  };

  // Don't show if already pro
  if (planType === "pro") {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="justify-end flex-1 bg-black/60">
        <ScrollView
          className="bg-white rounded-t-3xl max-h-5/6"
          showsVerticalScrollIndicator={false}
        >
          {/* Close button */}
          <View className="relative p-6 pb-0">
            <Pressable
              onPress={handleClose}
              className="absolute z-10 p-2 right-4 top-4"
            >
              <Text className="text-2xl text-gray-400">✕</Text>
            </Pressable>
          </View>

          {/* Header */}
          <View className="items-center px-6 pt-2 pb-6">
            <View className="items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
              <Text className="text-4xl">👑</Text>
            </View>

            {feature ? (
              <>
                <Text className="mb-2 text-2xl font-bold text-center text-gray-900">
                  Daily Limit Reached
                </Text>
                <Text className="text-center text-gray-600">
                  You've used all your {getFeatureName(feature).toLowerCase()}{" "}
                  for today. Upgrade to Pro for unlimited access!
                </Text>
              </>
            ) : (
              <>
                <Text className="mb-2 text-2xl font-bold text-center text-gray-900">
                  Upgrade to Pro
                </Text>
                <Text className="text-center text-gray-600">
                  Unlock unlimited access to all features
                </Text>
              </>
            )}
          </View>

          {/* Pricing */}
          <View className="px-6 mb-6">
            <View className="p-6 border-2 rounded-2xl border-amber-500 bg-amber-50">
              <View className="flex-row items-baseline justify-center mb-2">
                <Text className="text-4xl font-bold text-amber-700">₹199</Text>
                <Text className="ml-2 text-lg text-amber-600">/month</Text>
              </View>
              <Text className="text-sm text-center text-amber-600">
                First 7 days free trial
              </Text>
            </View>
          </View>

          {/* Features list */}
          <View className="px-6 mb-6">
            <Text className="mb-4 text-lg font-semibold text-gray-900">
              What you'll get:
            </Text>

            {PRO_FEATURES.map((item, index) => (
              <View key={index} className="flex-row items-start mb-4">
                <View className="items-center justify-center w-10 h-10 mr-3 rounded-full bg-amber-100">
                  <Text className="text-xl">{item.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-base font-semibold text-gray-900">
                    {item.title}
                  </Text>
                  <Text className="text-sm text-gray-600">{item.desc}</Text>
                </View>
                <Text className="mt-1 text-lg text-green-500">✓</Text>
              </View>
            ))}
          </View>

          {/* Auth prompt for guests */}
          {showAuthPrompt && !user && (
            <View className="px-6 mb-4">
              <View className="p-4 border border-blue-200 rounded-xl bg-blue-50">
                <Text className="mb-1 text-sm font-semibold text-blue-900">
                  Sign in required
                </Text>
                <Text className="text-sm text-blue-700">
                  Please log in or create an account to upgrade to Pro
                </Text>
              </View>
            </View>
          )}

          {/* CTA Buttons */}
          <View className="px-6 pb-8">
            <Button
              title={user ? "Upgrade to Pro" : "Sign In to Upgrade"}
              onPress={handleUpgrade}
              variant="primary"
              fullWidth
              className="mb-3 bg-gradient-to-r from-amber-500 to-orange-500"
            />

            <TouchableOpacity onPress={handleClose} className="py-3">
              <Text className="text-base font-medium text-center text-gray-600">
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>

          {/* Trust indicators */}
          <View className="px-6 pb-6 border-t border-gray-200">
            <View className="flex-row justify-around pt-4">
              <View className="items-center">
                <Text className="text-xl">🔒</Text>
                <Text className="mt-1 text-xs text-gray-600">Secure</Text>
              </View>
              <View className="items-center">
                <Text className="text-xl">↩️</Text>
                <Text className="mt-1 text-xs text-gray-600">
                  Cancel Anytime
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-xl">⚡</Text>
                <Text className="mt-1 text-xs text-gray-600">
                  Instant Access
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
