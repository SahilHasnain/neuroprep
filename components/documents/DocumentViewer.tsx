import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/theme";
import type { Document, DocumentGenerationState } from "@/types/document";
import DocumentHeader from "./DocumentHeader";
import FloatingActionMenu from "./FloatingActionMenu";
import DocumentInfoPanel from "./DocumentInfoPanel";
import DocumentContent from "./DocumentContent";
import StatusBanners from "./StatusBanners";
import ActionButtons from "./ActionButtons";
import GenerationStatusCard from "./GenerationStatusCard";
import Toast, { ToastType } from "@/components/shared/Toast";

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

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.primary,
  },
  progressBanner: {
    backgroundColor: COLORS.primary.blue,
  },
  textPrimary: {
    color: COLORS.text.primary,
  },
  bottomPanel: {
    backgroundColor: COLORS.background.secondary,
    borderTopColor: COLORS.border.default,
  },
});

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
  const [showDocInfo, setShowDocInfo] = useState(false);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({
    visible: false,
    message: "",
    type: "info",
  });

  const isPDF = document.type === "pdf";

  const questionsState = generationState?.questions || {
    status: "idle",
    progress: 0,
  };
  const notesState = generationState?.notes || { status: "idle", progress: 0 };

  // Show toast on generation success
  useEffect(() => {
    if (questionsState.status === "success") {
      showToast("Questions generated successfully! 🎉", "success");
    } else if (questionsState.status === "error") {
      showToast("Failed to generate questions. Please try again.", "error");
    }
  }, [questionsState.status]);

  useEffect(() => {
    if (notesState.status === "success") {
      showToast("Notes generated successfully! 📝", "success");
    } else if (notesState.status === "error") {
      showToast("Failed to generate notes. Please try again.", "error");
    }
  }, [notesState.status]);

  const showToast = (message: string, type: ToastType) => {
    setToast({ visible: true, message, type });
  };

  // Check OCR status
  const isOcrPending = document.ocrStatus === "pending";
  const isOcrFailed = document.ocrStatus === "failed";
  const hasNoText = !document.ocrText || document.ocrText.trim().length === 0;
  const hasShortText = document.ocrText && document.ocrText.length < 50;
  const canGenerate = !isOcrPending && !hasNoText && !hasShortText;

  // Handlers
  const handleDelete = () => {
    setFabMenuOpen(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Document",
      "Are you sure you want to delete this document? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onDelete();
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    setFabMenuOpen(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await Share.share({
        message: `Check out this ${isPDF ? "PDF" : "image"}: ${document.title}`,
        url: document.fileUrl,
        title: document.title,
      });

      if (result.action === Share.sharedAction) {
        showToast("Document shared successfully!", "success");
      }
    } catch (error) {
      showToast("Failed to share document", "error");
    }
  };

  const handleInfo = () => {
    setFabMenuOpen(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDocInfo(!showDocInfo);
  };

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1" style={styles.container}>
        <DocumentHeader
          title="Loading..."
          isPDF={isPDF}
          createdAt={document.$createdAt}
          onBack={onBack}
        />
        <View className="items-center justify-center flex-1 gap-4">
          <ActivityIndicator size="large" color={COLORS.primary.blue} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={styles.container}>
      {/* Header */}
      <DocumentHeader
        title={document.title}
        isPDF={isPDF}
        createdAt={document.$createdAt}
        onBack={onBack}
      />

      {/* Generation Progress Banner */}
      {(questionsState.status === "generating" ||
        notesState.status === "generating") && (
        <View
          className="flex-row items-center gap-3 px-4 py-3"
          style={styles.progressBanner}
        >
          <ActivityIndicator size="small" color={COLORS.text.primary} />
          <Text
            className="flex-1 text-sm font-medium"
            style={styles.textPrimary}
          >
            {questionsState.status === "generating" &&
            notesState.status === "generating"
              ? "AI is generating questions and notes..."
              : questionsState.status === "generating"
                ? "AI is generating questions..."
                : "AI is generating notes..."}
          </Text>
        </View>
      )}

      {/* Document Content */}
      <DocumentContent fileUrl={document.fileUrl} isPDF={isPDF} />

      {/* Floating Action Menu */}
      <FloatingActionMenu
        isOpen={fabMenuOpen}
        onToggle={() => setFabMenuOpen(!fabMenuOpen)}
        onInfo={handleInfo}
        onShare={handleShare}
        onDelete={handleDelete}
      />

      {/* Toast Notifications */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      {/* Bottom Panel */}
      <View className="p-4 pb-8 border-t" style={styles.bottomPanel}>
        {/* Document Info Panel */}
        {showDocInfo && (
          <DocumentInfoPanel
            document={document}
            isPDF={isPDF}
            onClose={() => setShowDocInfo(false)}
          />
        )}

        {/* Status Banners */}
        <StatusBanners
          isOcrPending={isOcrPending}
          isOcrFailed={isOcrFailed}
          hasNoText={hasNoText}
          hasShortText={hasShortText}
        />

        {/* Generation Status Cards */}
        {(questionsState.status !== "idle" || notesState.status !== "idle") && (
          <View className="gap-3 mb-4">
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

        {/* Action Buttons */}
        <ActionButtons
          canGenerate={canGenerate}
          questionsState={questionsState}
          notesState={notesState}
          onGenerateQuestions={onGenerateQuestions}
          onGenerateNotes={onGenerateNotes}
        />
      </View>
    </View>
  );
}
