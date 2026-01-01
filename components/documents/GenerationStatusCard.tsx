import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  FileQuestion,
  NotebookPen,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCw,
  Share2,
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.card,
    borderColor: COLORS.border.default,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  textPrimary: {
    color: COLORS.text.primary,
  },
  textSecondary: {
    color: COLORS.text.secondary,
  },
  textTertiary: {
    color: COLORS.text.tertiary,
  },
  progressBar: {
    backgroundColor: COLORS.border.default,
  },
  progressFill: {
    backgroundColor: COLORS.primary.blue,
  },
  previewCard: {
    backgroundColor: COLORS.background.primary,
    borderColor: COLORS.border.default,
  },
  viewAllButton: {
    backgroundColor: COLORS.primary.blue,
  },
  retryButton: {
    backgroundColor: COLORS.primary.blue,
  },
  shareButton: {
    backgroundColor: COLORS.background.secondary,
    borderColor: COLORS.border.default,
  },
  errorText: {
    color: COLORS.status.error,
  },
});

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

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      let shareMessage = "";

      if (isQuestions && previewData) {
        shareMessage = `Check out my ${title}:\n\n`;
        if (Array.isArray(previewData)) {
          previewData.slice(0, 3).forEach((q: any, idx: number) => {
            shareMessage += `${idx + 1}. ${q.question || q}\n`;
          });
        }
      } else if (previewData) {
        shareMessage = `Check out my ${title}:\n\n${previewData.title || previewData.summary || "Generated study notes"}`;
      } else {
        shareMessage = `I just generated AI-powered ${title.toLowerCase()}!`;
      }

      await Share.share({
        message: shareMessage,
        title: `My ${title}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const renderContent = () => {
    switch (state.status) {
      case "generating":
        return (
          <View className="gap-2">
            <View className="flex-row items-center gap-3">
              <View
                className="flex-1 h-2 overflow-hidden rounded-full"
                style={styles.progressBar}
              >
                <View
                  className="h-full rounded-full"
                  style={[styles.progressFill, { width: `${state.progress}%` }]}
                />
              </View>
              <Text className="w-10 text-xs" style={styles.textTertiary}>
                {state.progress}%
              </Text>
            </View>
            <Text className="text-sm" style={styles.textTertiary}>
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
                style={styles.previewCard}
              >
                <Text className="text-xs mb-1.5" style={styles.textTertiary}>
                  Preview
                </Text>
                <Text
                  className="text-sm leading-5"
                  style={styles.textPrimary}
                  numberOfLines={2}
                >
                  Q1: {previewData[0]?.question || "Question generated"}
                </Text>
              </View>
            )}
            {!isQuestions && previewData?.content && (
              <View
                className="p-3 border rounded-xl"
                style={styles.previewCard}
              >
                <Text className="text-xs mb-1.5" style={styles.textTertiary}>
                  Preview
                </Text>
                <Text
                  className="text-sm leading-5"
                  style={styles.textPrimary}
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
                style={
                  isQuestions
                    ? styles.viewAllButton
                    : { backgroundColor: COLORS.accent.gold }
                }
                onPress={onViewAll}
                activeOpacity={0.8}
              >
                <Text className="font-semibold" style={styles.textPrimary}>
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
              <Text className="flex-1 text-sm" style={styles.errorText}>
                {state.error || "Generation failed"}
              </Text>
            </View>
            {onRetry && (
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2 py-2.5 rounded-xl active:scale-95"
                style={styles.retryButton}
                onPress={onRetry}
                activeOpacity={0.8}
              >
                <RefreshCw size={14} color={COLORS.text.primary} />
                <Text className="font-medium" style={styles.textPrimary}>
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
    <View className="p-5 border shadow-lg rounded-2xl" style={styles.card}>
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
          <Text className="text-lg font-bold" style={styles.textPrimary}>
            {title}
          </Text>
          {state.status === "success" && (
            <Text className="text-xs" style={styles.textTertiary}>
              Generation complete
            </Text>
          )}
        </View>
        {state.status === "success" && (
          <TouchableOpacity
            className="items-center justify-center w-10 h-10 border rounded-full active:scale-90"
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Share2 size={18} color={COLORS.text.primary} />
          </TouchableOpacity>
        )}
      </View>
      {renderContent()}
    </View>
  );
}
