import { View, Text, TouchableOpacity } from "react-native";
import { Crown, X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { THEME } from "@/constants/theme";

interface ProBannerProps {
  onUpgrade: () => void;
  onDismiss: () => void;
}

export default function ProBanner({ onUpgrade, onDismiss }: ProBannerProps) {
  return (
    <View className="mx-6 mb-6 overflow-hidden rounded-xl">
      <LinearGradient
        colors={THEME.gradients.gold}
        start={THEME.gradientConfig.start}
        end={THEME.gradientConfig.end}
        className="relative p-4"
      >
        <TouchableOpacity
          onPress={onDismiss}
          className="absolute top-2 right-2 z-10 p-1"
        >
          <X size={18} color="#fff" />
        </TouchableOpacity>

        <View className="flex-row items-center mb-2">
          <Crown size={24} color="#fff" />
          <Text className="ml-2 text-lg font-bold text-white">
            Upgrade to Pro
          </Text>
        </View>

        <Text className="mb-3 text-sm text-white/90">
          Get unlimited doubts, questions & notes. No daily limits!
        </Text>

        <TouchableOpacity
          onPress={onUpgrade}
          className="self-start px-4 py-2 bg-white rounded-lg"
        >
          <Text className="text-sm font-semibold text-amber-600">
            Start Free Trial
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}
