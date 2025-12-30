import { View, Text } from "react-native";
import { Lightbulb } from "lucide-react-native";

interface TipCardProps {
  tips: string[];
}

export default function TipCard({ tips }: TipCardProps) {
  // Validate and filter tips
  const safeTips = Array.isArray(tips)
    ? tips.filter((tip) => tip && typeof tip === "string" && tip.trim())
    : [];

  if (safeTips.length === 0) return null;

  return (
    <View className="p-5 mb-4 border-2 border-green-500/30 rounded-xl bg-green-500/10 shadow-sm">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <Lightbulb size={20} color="#4ade80" />
        <Text className="ml-2 text-base font-bold leading-tight text-green-300">
          Exam Tips
        </Text>
      </View>

      {/* Numbered Tips */}
      <View>
        {safeTips.map((tip, index) => (
          <View key={index} className="flex-row items-start mb-4 last:mb-0">
            {/* Number Badge */}
            <View className="items-center justify-center w-7 h-7 mr-3 rounded-full bg-gradient-to-r from-green-600 to-green-700 shadow-sm">
              <Text className="text-sm font-bold text-white">{index + 1}</Text>
            </View>

            {/* Tip Content */}
            <Text className="flex-1 text-sm leading-6 text-green-200">
              {tip}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
