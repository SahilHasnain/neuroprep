import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import {
  FileQuestion,
  NotebookPen,
  CheckCircle,
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
          <View style={styles.generatingContainer}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${state.progress}%` }]}
                />
              </View>
              <Text style={styles.progressText}>{state.progress}%</Text>
            </View>
            <Text style={styles.generatingText}>
              Generating {title.toLowerCase()}...
            </Text>
          </View>
        );

      case "success":
        const questionsCount = previewData?.length || state.data?.length || 0;
        return (
          <View style={styles.successContainer}>
            <View style={styles.successHeader}>
              <CheckCircle size={16} color={COLORS.status.success} />
              <Text style={styles.successText}>
                {isQuestions
                  ? `${questionsCount} questions ready`
                  : "Notes ready"}
              </Text>
            </View>
            {/* Preview */}
            {isQuestions && previewData && previewData.length > 0 && (
              <View style={styles.preview}>
                <Text style={styles.previewLabel}>Preview:</Text>
                <Text style={styles.previewText} numberOfLines={2}>
                  Q1: {previewData[0]?.question || "Question generated"}
                </Text>
              </View>
            )}
            {!isQuestions && previewData?.content && (
              <View style={styles.preview}>
                <Text style={styles.previewLabel}>Preview:</Text>
                <Text style={styles.previewText} numberOfLines={2}>
                  {previewData.content?.summary ||
                    previewData.content?.title ||
                    "Notes generated"}
                </Text>
              </View>
            )}
            {onViewAll && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={onViewAll}
              >
                <Text style={styles.viewAllText}>View All {title}</Text>
                <ChevronRight size={16} color={COLORS.primary.blue} />
              </TouchableOpacity>
            )}
          </View>
        );

      case "error":
        return (
          <View style={styles.errorContainer}>
            <View style={styles.errorHeader}>
              <XCircle size={16} color={COLORS.status.error} />
              <Text style={styles.errorText}>
                {state.error || "Generation failed"}
              </Text>
            </View>
            {onRetry && (
              <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                <RefreshCw size={14} color={COLORS.text.primary} />
                <Text style={styles.retryText}>Retry</Text>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View
          style={[styles.iconContainer, { backgroundColor: iconColor + "20" }]}
        >
          {state.status === "generating" ? (
            <ActivityIndicator size="small" color={iconColor} />
          ) : (
            <Icon size={18} color={iconColor} />
          )}
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  generatingContainer: {
    gap: 8,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border.default,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary.blue,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    width: 35,
  },
  generatingText: {
    fontSize: 13,
    color: COLORS.text.tertiary,
  },
  successContainer: {
    gap: 10,
  },
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  successText: {
    fontSize: 14,
    color: COLORS.status.success,
    fontWeight: "500",
  },
  preview: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 8,
    padding: 10,
  },
  previewLabel: {
    fontSize: 11,
    color: COLORS.text.tertiary,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    backgroundColor: COLORS.background.primary,
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary.blue,
    fontWeight: "500",
  },
  errorContainer: {
    gap: 10,
  },
  errorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.status.error,
    flex: 1,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    backgroundColor: COLORS.primary.blue,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: "500",
  },
});
