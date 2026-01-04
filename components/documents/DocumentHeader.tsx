import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { COLORS } from "@/constants/theme";

interface DocumentHeaderProps {
  title: string;
  createdAt: string;
  onBack: () => void;
}

export default function DocumentHeader({
  title,
  createdAt,
  onBack,
}: DocumentHeaderProps) {
  return (
    <View
      className="flex-row items-center px-4 pt-12 pb-3 border-b"
      style={{
        backgroundColor: COLORS.background.secondary,
        borderBottomColor: COLORS.border.default,
      }}
    >
      {/* Back Button */}
      <TouchableOpacity
        className="items-center justify-center w-9 h-9 rounded-full active:scale-90"
        style={{ backgroundColor: COLORS.background.card }}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <ArrowLeft size={18} color={COLORS.text.primary} />
      </TouchableOpacity>

      {/* Title and Date */}
      <View className="flex-1 px-3">
        <Text
          className="text-base font-semibold"
          style={{ color: COLORS.text.primary }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          className="text-xs mt-0.5"
          style={{ color: COLORS.text.tertiary }}
        >
          {new Date(createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}
