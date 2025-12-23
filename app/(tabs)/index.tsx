import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FileQuestion,
  FileText,
  MessageCircleQuestion,
  Crown,
} from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QuickActionButton from "../../components/ui/QuickActionButton";
import UsageProgressBar from "../../components/ui/UsageProgressBar";
import ProBanner from "../../components/ui/ProBanner";
import { usePlanStore } from "@/store/planStore";
import { useAuthStore } from "@/store/authStore";

const BANNER_DISMISSED_KEY = "@home_pro_banner_dismissed";

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { planType, usage, limits, fetchPlanStatus } = usePlanStore();
  const [showBanner, setShowBanner] = useState(false);

  const isPro = planType === "pro";
  const userName = user?.name || "Champ";

  useEffect(() => {
    fetchPlanStatus();
    checkBannerDismissed();
  }, []);

  const checkBannerDismissed = async () => {
    const dismissed = await AsyncStorage.getItem(BANNER_DISMISSED_KEY);
    setShowBanner(!dismissed && !isPro);
  };

  const handleDismissBanner = async () => {
    await AsyncStorage.setItem(BANNER_DISMISSED_KEY, "true");
    setShowBanner(false);
  };

  const handleUpgrade = () => {
    router.push("/subscription");
  };

  const quickActions = [
    {
      icon: MessageCircleQuestion,
      label: "Ask Doubt",
      description: "Get instant help",
      onPress: () => router.push("/ask-doubt"),
      bgColor: "bg-blue-100",
      iconColor: "#3b82f6",
    },
    {
      icon: FileQuestion,
      label: "Generate Questions",
      description: "Practice smarter",
      onPress: () => router.push("/generate-questions"),
      bgColor: "bg-green-100",
      iconColor: "#22c55e",
    },
    {
      icon: FileText,
      label: "Convert Notes",
      description: "Transform Notes",
      onPress: () => router.push("/notes"),
      bgColor: "bg-purple-100",
      iconColor: "#a855f7",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="py-8">
        <View className="px-6 mb-6">
          <Text className="mb-1 text-3xl font-bold text-gray-900">
            Welcome {userName}
          </Text>
          <Text className="text-lg text-gray-600">Ready to ace your exam?</Text>
        </View>

        {showBanner && (
          <ProBanner onUpgrade={handleUpgrade} onDismiss={handleDismissBanner} />
        )}

        <View className="px-6 mb-8">
          <Text className="mb-4 text-xl font-semibold text-gray-900">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((action, index) => (
              <QuickActionButton
                key={`action-${index}`}
                icon={action.icon}
                iconColor={action.iconColor}
                bgColor={action.bgColor}
                label={action.label}
                description={action.description}
                onPress={action.onPress}
              />
            ))}
          </View>
        </View>

        {isPro && (
          <View className="px-6">
            <View className="p-6 border bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-amber-200">
              <View className="flex-row items-center mb-2">
                <Crown size={24} color="#d97706" />
                <Text className="ml-2 text-xl font-bold text-amber-900">
                  Pro Member
                </Text>
              </View>
              <Text className="text-sm text-amber-700">
                You have unlimited access to all features!
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
