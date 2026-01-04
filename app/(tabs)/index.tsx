// MVP_BYPASS: Simplified home screen - removed ProBanner, usage bars, and Pro Member status
import { router } from "expo-router";
import {
  FileQuestion,
  FileText,
  MessageCircleQuestion,
  Layers,
  FolderOpen,
} from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { THEME } from "@/constants/theme";
import QuickActionButton from "../../components/ui/QuickActionButton";

export default function HomeScreen() {
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
    {
      icon: Layers,
      label: "Flashcards",
      description: "Study efficiently",
      onPress: () => router.push("/flashcards"),
      bgColor: "bg-red-100",
      iconColor: "#ef4444",
    },
    {
      icon: FolderOpen,
      label: "Documents",
      description: "Process documents with AI",
      onPress: () => router.push("/documents"),
      bgColor: "bg-orange-100",
      iconColor: "#f97316",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-dark-bg-primary">
      <LinearGradient
        colors={["#0a0a0a", "#1a1a1a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="flex-1"
      >
        <ScrollView className="py-8">
          {/* MVP_BYPASS: Simplified welcome message without user name */}
          <View className="px-6 mb-6">
            <Text className="mb-1 text-3xl font-bold text-white">Welcome</Text>
            <Text className="text-lg text-gray-300">
              Ready to ace your exam?
            </Text>
          </View>

          {/* MVP_BYPASS: ProBanner removed */}

          {/* MVP_BYPASS: Only quick action buttons remain */}
          <View className="px-6 mb-8">
            <Text className="mb-4 text-xl font-semibold text-white">
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

          {/* MVP_BYPASS: Pro Member status card removed */}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
