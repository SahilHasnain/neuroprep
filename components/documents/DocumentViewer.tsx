import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { WebView } from "react-native-webview";
import {
  ArrowLeft,
  MoreVertical,
  Sparkles,
  Trash2,
  FileQuestion,
  NotebookPen,
} from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import type { Document, DocumentGenerationState } from "@/types/document";
import GenerationStatusCard from "./GenerationStatusCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface DocumentViewerProps {
  document: Document;
  onBack: () => void;
  onDelete: () => void;
  onGenerateQuestions: () => void;
  onGenerateNotes: () => void;
  onViewQuestions?: () => void;
  onViewNotes?: () => void;
  generationState?: DocumentGenerationState;
  isLoading?: boolean;
}

export default function DocumentViewer({
  document,
  onBack,
  onDelete,
  onGenerateQuestions,
  onGenerateNotes,
  onViewQuestions,
  onViewNotes,
  generationState,
  isLoading = false,
}: DocumentViewerProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isPDF = document.type === "pdf";

  const questionsState = generationState?.questions || {
    status: "idle",
    progress: 0,
  };
  const notesState = generationState?.notes || { status: "idle", progress: 0 };

  // Check if document has no OCR text
  const hasNoText = !document.ocrText || document.ocrText.trim().length === 0;
  const hasShortText = document.ocrText && document.ocrText.length < 50;
  const canGenerate = !hasNoText && !hasShortText;

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this document? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: onDelete,
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title} numberOfLines={1}>
              Loading...
            </Text>
          </View>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.blue} />
          <Text style={styles.loadingText}>Loading document...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title} numberOfLines={1}>
            {document.title}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setMenuVisible(!menuVisible)}
          activeOpacity={0.7}
        >
          <MoreVertical size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Generation Progress Banner */}
      {(questionsState.status === "generating" ||
        notesState.status === "generating") && (
        <View style={styles.generationBanner}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.generationBannerText}>
            {questionsState.status === "generating" &&
            notesState.status === "generating"
              ? "AI is generating questions and notes..."
              : questionsState.status === "generating"
                ? "AI is generating questions..."
                : "AI is generating notes..."}
          </Text>
        </View>
      )}

      {/* Menu Dropdown */}
      {menuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Trash2 size={20} color={COLORS.status.error} />
            <Text style={[styles.menuText, { color: COLORS.status.error }]}>
              Delete Document
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Document Content */}
      <View style={styles.content}>
        {isPDF ? (
          <WebView
            source={{ uri: document.fileUrl }}
            style={styles.webview}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.webviewLoading}>
                <ActivityIndicator size="large" color={COLORS.primary.blue} />
              </View>
            )}
            onError={() => {
              Alert.alert(
                "Error",
                "Failed to load PDF. Please try again later."
              );
            }}
          />
        ) : (
          <ScrollView
            style={styles.imageScroll}
            contentContainerStyle={styles.imageScrollContent}
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsVerticalScrollIndicator={false}
          >
            {!imageError ? (
              <Image
                source={{ uri: document.fileUrl }}
                style={styles.image}
                contentFit="contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load image</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Bottom Action Panel */}
      <View style={styles.bottomPanel}>
        {/* No Text Warning */}
        {hasNoText && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningTitle}>⚠️ Text Extraction Failed</Text>
            <Text style={styles.warningText}>
              Unable to extract text from this document. AI features like
              question and note generation won't work. Try uploading a clearer
              image or a text-based PDF.
            </Text>
          </View>
        )}
        {!hasNoText && hasShortText && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningTitle}>⚠️ Limited Text Content</Text>
            <Text style={styles.warningText}>
              Very little text was extracted from this document. AI-generated
              content may be limited or generic.
            </Text>
          </View>
        )}

        {/* Generation Status Cards */}
        {(questionsState.status !== "idle" || notesState.status !== "idle") && (
          <View style={styles.statusCards}>
            {questionsState.status !== "idle" && (
              <GenerationStatusCard
                type="questions"
                state={questionsState}
                onViewAll={onViewQuestions}
                onRetry={onGenerateQuestions}
                previewData={questionsState.data}
              />
            )}
            {notesState.status !== "idle" && (
              <GenerationStatusCard
                type="notes"
                state={notesState}
                onViewAll={onViewNotes}
                onRetry={onGenerateNotes}
                previewData={notesState.data}
              />
            )}
          </View>
        )}

        {/* Quick Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              (questionsState.status === "generating" || !canGenerate) &&
                styles.actionButtonDisabled,
            ]}
            onPress={onGenerateQuestions}
            disabled={questionsState.status === "generating" || !canGenerate}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: COLORS.primary.blue + "20" },
              ]}
            >
              {questionsState.status === "generating" ? (
                <ActivityIndicator size="small" color={COLORS.primary.blue} />
              ) : (
                <FileQuestion size={20} color={COLORS.primary.blue} />
              )}
            </View>
            <Text style={styles.actionButtonText}>
              {questionsState.status === "generating"
                ? "Generating..."
                : questionsState.status === "success"
                  ? "Regenerate Questions"
                  : "Generate Questions"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              notesState.status === "generating" && styles.actionButtonDisabled,
            ]}
            onPress={onGenerateNotes}
            disabled={notesState.status === "generating"}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: COLORS.accent.gold + "20" },
              ]}
            >
              {notesState.status === "generating" ? (
                <ActivityIndicator size="small" color={COLORS.accent.gold} />
              ) : (
                <NotebookPen size={20} color={COLORS.accent.gold} />
              )}
            </View>
            <Text style={styles.actionButtonText}>
              {notesState.status === "generating"
                ? "Generating..."
                : notesState.status === "success"
                  ? "Regenerate Notes"
                  : "Generate Notes"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text.primary,
    textAlign: "center",
  },
  generationBanner: {
    backgroundColor: COLORS.primary.blue,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  generationBannerText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  menu: {
    position: "absolute",
    top: 110,
    right: 16,
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: 8,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  webviewLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background.primary,
  },
  imageScroll: {
    flex: 1,
  },
  imageScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: SCREEN_WIDTH,
    height: "100%",
    minHeight: 400,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text.tertiary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.text.tertiary,
    textAlign: "center",
  },
  bottomPanel: {
    backgroundColor: COLORS.background.secondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    padding: 16,
    paddingBottom: 32,
  },
  statusCards: {
    gap: 12,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text.primary,
  },
  warningBanner: {
    backgroundColor: COLORS.status.warning + "20",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.status.warning + "40",
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.status.warning,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
});
