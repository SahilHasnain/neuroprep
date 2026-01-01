import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import {
  FileText,
  Image as ImageIcon,
  FileQuestion,
  NotebookPen,
  Loader,
  CheckCircle,
} from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import type { Document, DocumentGenerationState } from "@/types/document";

interface DocumentCardProps {
  document: Document;
  onPress: (document: Document) => void;
  isLoading?: boolean;
  generationState?: DocumentGenerationState;
}

export default function DocumentCard({
  document,
  onPress,
  isLoading = false,
  generationState,
}: DocumentCardProps) {
  const isImage = document.type === "image";
  const Icon = isImage ? ImageIcon : FileText;
  const relativeDate = getRelativeDate(document.$createdAt);

  const questionsStatus = generationState?.questions?.status;
  const notesStatus = generationState?.notes?.status;

  // Check if document has no OCR text
  const hasNoText = !document.ocrText || document.ocrText.trim().length === 0;
  const hasShortText = document.ocrText && document.ocrText.length < 50;
  const isPendingOcr = document.ocrStatus === "pending";
  const isOcrFailed = document.ocrStatus === "failed";

  if (isLoading) {
    return (
      <View style={styles.card}>
        <View style={[styles.thumbnail, styles.loadingThumbnail]} />
        <View style={styles.cardInfo}>
          <View style={[styles.loadingText, { width: "80%" }]} />
          <View style={[styles.loadingText, { width: "50%", height: 12 }]} />
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(document)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {document.thumbnailUrl ? (
          <Image
            source={{ uri: document.thumbnailUrl }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.thumbnail}>
            <Icon size={40} color={COLORS.primary.blue} />
          </View>
        )}

        {/* Generation Status Badges */}
        {(questionsStatus || notesStatus) && (
          <View style={styles.statusBadges}>
            {questionsStatus && questionsStatus !== "idle" && (
              <View
                style={[
                  styles.badge,
                  questionsStatus === "generating" && styles.badgeGenerating,
                  questionsStatus === "success" && styles.badgeSuccess,
                  questionsStatus === "error" && styles.badgeError,
                ]}
              >
                {questionsStatus === "generating" ? (
                  <Loader size={10} color={COLORS.text.primary} />
                ) : questionsStatus === "success" ? (
                  <CheckCircle size={10} color={COLORS.text.primary} />
                ) : (
                  <FileQuestion size={10} color={COLORS.text.primary} />
                )}
                <Text style={styles.badgeText}>
                  {questionsStatus === "generating"
                    ? "..."
                    : questionsStatus === "success"
                      ? "Q"
                      : "!"}
                </Text>
              </View>
            )}
            {notesStatus && notesStatus !== "idle" && (
              <View
                style={[
                  styles.badge,
                  notesStatus === "generating" && styles.badgeGenerating,
                  notesStatus === "success" && styles.badgeSuccess,
                  notesStatus === "error" && styles.badgeError,
                ]}
              >
                {notesStatus === "generating" ? (
                  <Loader size={10} color={COLORS.text.primary} />
                ) : notesStatus === "success" ? (
                  <CheckCircle size={10} color={COLORS.text.primary} />
                ) : (
                  <NotebookPen size={10} color={COLORS.text.primary} />
                )}
                <Text style={styles.badgeText}>
                  {notesStatus === "generating"
                    ? "..."
                    : notesStatus === "success"
                      ? "N"
                      : "!"}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {document.title}
          </Text>
          <View style={styles.cardMeta}>
            <Icon size={14} color={COLORS.text.tertiary} />
            <Text style={styles.cardDate}>{relativeDate}</Text>
          </View>

          {/* Inline Generation Progress */}
          {questionsStatus === "generating" && (
            <View style={styles.inlineProgress}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${generationState?.questions?.progress || 0}%`,
                      backgroundColor: COLORS.primary.blue,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>Questions</Text>
            </View>
          )}
          {notesStatus === "generating" && (
            <View style={styles.inlineProgress}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${generationState?.notes?.progress || 0}%`,
                      backgroundColor: COLORS.accent.gold,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>Notes</Text>
            </View>
          )}

          {/* Ready Indicators */}
          {(questionsStatus === "success" || notesStatus === "success") && (
            <View style={styles.readyIndicators}>
              {questionsStatus === "success" && (
                <View style={styles.readyBadge}>
                  <FileQuestion size={12} color={COLORS.primary.blue} />
                  <Text style={styles.readyText}>Ready</Text>
                </View>
              )}
              {notesStatus === "success" && (
                <View style={styles.readyBadge}>
                  <NotebookPen size={12} color={COLORS.accent.gold} />
                  <Text style={styles.readyText}>Ready</Text>
                </View>
              )}
            </View>
          )}

          {/* OCR State Indicators */}
          {isPendingOcr ? (
            <View style={styles.processingBadge}>
              <Loader size={12} color={COLORS.primary.blue} />
              <Text style={styles.processingText}>
                ✨ Extracting text from PDF...
              </Text>
            </View>
          ) : (
            <>
              {isOcrFailed && (
                <View style={styles.warningBadge}>
                  <Text style={styles.warningText}>⚠️ No text extracted</Text>
                </View>
              )}
              {!hasNoText && hasShortText && (
                <View style={styles.warningBadge}>
                  <Text style={styles.warningText}>⚠️ Limited text</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function getRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    overflow: "hidden",
  },
  cardContent: {
    padding: 16,
  },
  thumbnail: {
    width: "100%",
    height: 120,
    backgroundColor: COLORS.border.default,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    position: "relative",
  },
  loadingThumbnail: {
    backgroundColor: COLORS.border.default,
  },
  statusBadges: {
    position: "absolute",
    top: 24,
    right: 24,
    flexDirection: "row",
    gap: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: COLORS.border.default,
  },
  processingBadge: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.primary.blue + "15",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary.blue + "30",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  processingText: {
    color: COLORS.primary.blue,
    fontSize: 12,
    fontWeight: "600",
  },
  badgeGenerating: {
    backgroundColor: COLORS.primary.blue,
  },
  badgeSuccess: {
    backgroundColor: COLORS.status.success,
  },
  badgeError: {
    backgroundColor: COLORS.status.error,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  cardInfo: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
  loadingText: {
    height: 16,
    backgroundColor: COLORS.border.default,
    borderRadius: 4,
  },
  inlineProgress: {
    marginTop: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: COLORS.border.default,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 10,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  readyIndicators: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  readyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
  },
  readyText: {
    fontSize: 11,
    color: COLORS.text.tertiary,
  },
  warningBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.status.warning + "20",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.status.warning + "40",
    marginTop: 4,
  },
  warningText: {
    fontSize: 11,
    color: COLORS.status.warning,
    fontWeight: "500",
  },
});
