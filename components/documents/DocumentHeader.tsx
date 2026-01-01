import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

interface DocumentHeaderProps {
  title: string;
  isPDF: boolean;
  createdAt: string;
  onBack: () => void;
}

export default function DocumentHeader({
  title,
  isPDF,
  createdAt,
  onBack,
}: DocumentHeaderProps) {
  return (
    <View
      className="px-5 pt-16 pb-4 border-b shadow-lg"
      style={{
        backgroundColor: COLORS.background.secondary,
        borderBottomColor: COLORS.border.default,
        shadowColor: "#000",
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      {/* Top Row: Back Button and Badge */}
      <View className="flex-row items-center justify-between mb-3">
        <TouchableOpacity
          className="items-center justify-center w-10 h-10 rounded-full active:scale-90"
          style={{ backgroundColor: COLORS.background.card }}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={COLORS.text.primary} />
        </TouchableOpacity>

        {/* Document Type Badge */}
        <View
          className="px-3 py-1 border rounded-full"
          style={{
            backgroundColor: COLORS.primary.blue + "33",
            borderColor: COLORS.primary.blue + "4D",
          }}
        >
          <Text
            className="text-xs font-medium"
            style={{ color: COLORS.primary.blue }}
          >
            {isPDF ? "PDF" : "IMAGE"}
          </Text>
        </View>

        {/* Spacer for symmetry */}
        <View className="w-10" />
      </View>

      {/* Title */}
      <Text
        className="px-4 text-xl font-bold text-center"
        style={{ color: COLORS.text.primary }}
        numberOfLines={2}
      >
        {title}
      </Text>

      {/* Metadata */}
      <View className="flex-row items-center justify-center gap-2 mt-2">
        <Text className="text-xs" style={{ color: COLORS.text.tertiary }}>
          {new Date(createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}
