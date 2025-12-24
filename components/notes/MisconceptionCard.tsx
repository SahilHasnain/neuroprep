import { View, Text } from "react-native";
import { AlertTriangle, CheckCircle, MessageCircle } from "lucide-react-native";

interface Misconception {
  wrong: string;
  right: string;
  why: string;
}

interface MisconceptionCardProps {
  misconceptions: Misconception[];
}

export default function MisconceptionCard({
  misconceptions,
}: MisconceptionCardProps) {
  // Validate and filter misconceptions
  const safeMisconceptions = Array.isArray(misconceptions)
    ? misconceptions.filter(
        (item) =>
          item &&
          typeof item === "object" &&
          (item.wrong || item.right || item.why)
      )
    : [];

  if (safeMisconceptions.length === 0) return null;

  return (
    <View className="p-5 mb-4 border-2 border-yellow-200 rounded-xl bg-yellow-50 shadow-sm">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <AlertTriangle size={20} color="#ca8a04" />
        <Text className="ml-2 text-base font-bold leading-tight text-yellow-900">
          Common Mistakes
        </Text>
      </View>

      {/* Misconceptions List */}
      <View>
        {safeMisconceptions.map((item, index) => {
          // Fallback values for each misconception
          const safeWrong = item.wrong || "Misconception not specified";
          const safeRight = item.right || "Correct understanding not specified";
          const safeWhy = item.why || "Explanation not provided";

          return (
            <View
              key={index}
              className="p-4 mb-4 last:mb-0 border-2 border-yellow-200 rounded-lg bg-white shadow-sm"
            >
              {/* Wrong Understanding */}
              {item.wrong && (
                <View className="mb-4">
                  <View className="flex-row items-start mb-2">
                    <View className="mt-0.5">
                      <AlertTriangle size={18} color="#dc2626" />
                    </View>
                    <Text className="ml-2 text-xs font-bold uppercase tracking-wide text-red-700">
                      Common Mistake:
                    </Text>
                  </View>
                  <Text className="text-sm leading-6 text-gray-800">
                    {safeWrong}
                  </Text>
                </View>
              )}

              {/* Correct Understanding */}
              {item.right && (
                <View className="mb-4">
                  <View className="flex-row items-start mb-2">
                    <View className="mt-0.5">
                      <CheckCircle size={18} color="#16a34a" />
                    </View>
                    <Text className="ml-2 text-xs font-bold uppercase tracking-wide text-green-700">
                      Correct Understanding:
                    </Text>
                  </View>
                  <Text className="text-sm leading-6 text-gray-800">
                    {safeRight}
                  </Text>
                </View>
              )}

              {/* Why Explanation */}
              {item.why && (
                <View className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <View className="flex-row items-start mb-2">
                    <View className="mt-0.5">
                      <MessageCircle size={16} color="#ca8a04" />
                    </View>
                    <Text className="ml-2 text-xs font-bold uppercase tracking-wide text-yellow-800">
                      Why:
                    </Text>
                  </View>
                  <Text className="ml-6 text-sm leading-5 text-yellow-900">
                    {safeWhy}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
