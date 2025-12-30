import { View, Text } from "react-native";
import { Calculator } from "lucide-react-native";
import MathMarkdown from "@/components/shared/MathMarkdown";
import { THEME } from "@/constants/theme";

interface FormulaCardProps {
  name: string;
  formula: string;
  whenToUse: string;
}

export default function FormulaCard({
  name,
  formula,
  whenToUse,
}: FormulaCardProps) {
  // Fallback values for missing data
  const safeName = name || "Formula";
  const safeFormula = formula || "";
  const safeWhenToUse = whenToUse || "Application context not provided";

  // Don't render if no formula is provided
  if (!safeFormula) {
    return null;
  }

  return (
    <View className="p-5 mb-4 border-2 border-blue-500/30 rounded-xl bg-[#1e3a8a]/20 shadow-sm">
      {/* Formula Name */}
      <View className="flex-row items-center mb-4">
        <Calculator size={20} color="#60a5fa" />
        <Text className="ml-2 text-base font-bold leading-tight text-blue-300">
          {safeName}
        </Text>
      </View>

      {/* Formula Display */}
      <View
        style={{ backgroundColor: THEME.colors.background.secondary }}
        className="p-4 mb-4 rounded-lg border border-blue-500/20"
      >
        <MathMarkdown
          style={{
            body: {
              color: "#93c5fd",
              fontSize: 17,
              lineHeight: 26,
              textAlign: "center",
            },
            paragraph: {
              marginVertical: 0,
              textAlign: "center",
            },
            code_inline: {
              backgroundColor: "#1e3a8a",
              color: "#93c5fd",
              paddingHorizontal: 6,
              paddingVertical: 3,
              borderRadius: 4,
              fontFamily: "monospace",
              fontSize: 16,
            },
          }}
        >
          {safeFormula}
        </MathMarkdown>
      </View>

      {/* When to Use */}
      <View className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <Text className="mb-1 text-xs font-bold uppercase tracking-wide text-blue-400">
          When to use:
        </Text>
        <Text className="text-sm leading-6 text-blue-200">{safeWhenToUse}</Text>
      </View>
    </View>
  );
}
