import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import {
  FileQuestion,
  NotebookPen,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCw,
} from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import type { GenerationState } from "@/types/document";

interface GenerationStatusCardProps {
  type: "questions" | "notes";
  state: GenerationState;
  onViewAll?: () => void;
  onRetry?: () => void;
  previewData?: any;
}

export default function GenerationStatusCard({
  type,
  state,
  onViewAll,
  onRetry,
  previewData,
}: GenerationStatusCardProps) {
  const isQuestions = type === "questions";
  const Icon = isQuestions ? FileQuestion : NotebookPen;
  const iconColor = isQuestions ? COLORS.primary.blue : COLORS.accent.gold;
  const title = isQuestions ? "Questions" : "Notes";

  const renderContent = () => {
    switch (state.status) {
      case "generating":
        return (
          <View className="gap-2">
            <View className="flex-row items-center gap-3">
              <View
                className="flex-1 h-2 overflow-hidden rounded-full"
                style={{ backgroundColor: COLORS.border.default }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${state.progress}%`,
                    backgroundColor: COLORS.primary.blue,
                  }}
                />
              </View>
              <Text
                className="w-10 text-xs"
                style={{ color: COLORS.text.tertiary }}
              >
                {state.progress}%
              </Text>
            </View>
            <Text className="text-sm" style={{ color: COLORS.text.tertiary }}>
              Generating {title.toLowerCase()}...
            </Text>
          </View>
        );

      case "success":
        const questionsCount = previewData?.length || state.data?.length || 0;
        return (
          <View className="gap-2.5">
            <View className="flex-row items-center gap-2">
              <CheckCircle2 size={16} color={COLORS.status.success} />
              <Text
                className="text-sm font-medium"
                style={{ color: COLORS.status.success }}
              >
                {isQuestions
                  ? `${questionsCount} questions ready`
                  : "Notes ready"}
              </Text>
            </View>
            {/* Preview Card */}
            {isQuestions && previewData && previewData.length > 0 && (
              <View
                className="p-3 border rounded-xl"
                style={{
                  backgroundColor: COLORS.background.primary,
                  borderColor: COLORS.border.default,
                }}
              >
                <Text
                  className="text-xs mb-1.5"
                  style={{ color: COLORS.text.tertiary }}
                >
                  Preview
                </Text>
                <Text
                  className="text-sm leading-5"
                  style={{ color: COLORS.text.primary }}
                  numberOfLines={2}
                >
                  Q1: {previewData[0]?.question || "Question generated"}
                </Text>
              </View>
            )}
            {!isQuestions && previewData?.content && (
              <View
                className="p-3 border rounded-xl"
                style={{
                  backgroundColor: COLORS.background.primary,
                  borderColor: COLORS.border.default,
                }}
              >
                <Text
                  className="text-xs mb-1.5"
                  style={{ color: COLORS.text.tertiary }}
                >
                  Preview
                </Text>
                <Text
                  className="text-sm leading-5"
                  style={{ color: COLORS.text.primary }}
                  numberOfLines={2}
                >
                  {previewData.content?.summary ||
                    previewData.content?.title ||
                    "Notes generated"}
                </Text>
              </View>
            )}
            {onViewAll && (
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2 py-3 rounded-xl active:scale-95"
                style={{
                  backgroundColor: isQuestions
                    ? COLORS.primary.blue
                    : COLORS.accent.gold,
                }}
                onPress={onViewAll}
                activeOpacity={0.8}
              >
                <Text
                  className="font-semibold"
                  style={{ color: COLORS.text.primary }}
                >
                  View All {title}
                </Text>
                <ChevronRight size={16} color={COLORS.text.primary} />
              </TouchableOpacity>
            )}
          </View>
        );

      case "error":
        return (
          <View className="gap-2.5">
            <View className="flex-row items-center gap-2">
              <XCircle size={16} color={COLORS.status.error} />
              <Text
                className="flex-1 text-sm"
                style={{ color: COLORS.status.error }}
              >
                {state.error || "Generation failed"}
              </Text>
            </View>
            {onRetry && (
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2 py-2.5 rounded-xl active:scale-95"
                style={{ backgroundColor: COLORS.primary.blue }}
                onPress={onRetry}
                activeOpacity={0.8}
              >
                <RefreshCw size={14} color={COLORS.text.primary} />
                <Text
                  className="font-medium"
                  style={{ color: COLORS.text.primary }}
                >
                  Retry
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (state.status === "idle") return null;

  return (
    <View
      className="p-5 border shadow-lg rounded-2xl"
      style={{
        backgroundColor: COLORS.background.card,
        borderColor: COLORS.border.default,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      {/* Enhanced Header */}
      <View className="flex-row items-center gap-3 mb-4">
        <View
          className="items-center justify-center w-12 h-12 rounded-full"
          style={{ backgroundColor: iconColor + "20" }}
        >
          {state.status === "generating" ? (
            <ActivityIndicator size="small" color={iconColor} />
          ) : (
            <Icon size={24} color={iconColor} />
          )}
        </View>
        <View className="flex-1">
          <Text
            className="text-lg font-bold"
            style={{ color: COLORS.text.primary }}
          >
            {title}
          </Text>
          {state.status === "success" && (
            <Text className="text-xs" style={{ color: COLORS.text.tertiary }}>
              Generation complete
            </Text>
          )}
        </View>
      </View>
      {renderContent()}
    </View>
  );
}
