import { router } from "expo-router";
import {
  FileQuestion,
  FileText,
  MessageCircleQuestion,
  TrendingUp,
} from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QuickActionButton from "../../components/ui/QuickActionButton";
import StatsCard from "../../components/ui/StatsCard";

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
    icon: TrendingUp,
    label: "View Progress",
    description: "Track Growth",
    onPress: () => console.log("View Progress"),
    bgColor: "bg-orange-100",
    iconColor: "#f97316",
  },
];

const stats = [
  {
    value: "24",
    label: "Questions",
    sublabel: "Solved",
    color: "text-blue-600",
  },
  {
    value: "87%",
    label: "Accuracy",
    sublabel: "Rate",
    color: "text-green-600",
  },
  {
    value: "15",
    label: "Day Streak",
    sublabel: "Keep going!",
    color: "text-orange-600",
  },
];

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="px-6 py-8">
        <View className="mb-8">
          <Text className="mb-1 text-3xl font-bold text-gray-900">
            Welcome Champ
          </Text>
          <Text className="text-lg text-gray-600">Ready to ace your exam?</Text>
        </View>

        <View className="mb-8">
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

        <View>
          <Text className="mb-4 text-xl font-semibold text-gray-900">
            Today&apos;s Stats
          </Text>
          <StatsCard stats={stats} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
