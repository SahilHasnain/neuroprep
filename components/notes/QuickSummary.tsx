import { View, Text } from "react-native";
import { FileText } from "lucide-react-native";

interface QuickSummaryProps {
  summary: string;
}

export default function QuickSummary({ summary }: QuickSummaryProps) {
  // Fallback for missing summary
  const safeSummary = summary || "Summary not available";

  // Don't render if summary is empty
  if (!summary || !summary.trim()) {
    return null;
  }

  return (
    <View className="p-5 mb-6 rounded-xl bg-purple-50 border-2 border-purple-200 shadow-sm">
      <View className="flex-row items-center mb-3">
        <FileText size={20} color="#9333ea" />
        <Text className="ml-2 text-sm font-bold uppercase tracking-wide text-purple-900">
          Why This Matters
        </Text>
      </View>
      <Text className="text-sm leading-6 text-purple-800">{safeSummary}</Text>
    </View>
  );
}
