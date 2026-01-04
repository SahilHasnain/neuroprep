import { useEffect, useMemo, useState } from "react";
import { Alert, Share } from "react-native";
import * as Haptics from "expo-haptics";
import type { Document, DocumentGenerationState } from "@/types/document";
import type { ToastType } from "@/components/shared/Toast";

export interface UseDocumentViewerArgs {
  document: Document;
  generationState?: DocumentGenerationState;
  onDelete: () => void;
}

export function useDocumentViewer({
  document,
  generationState,
  onDelete,
}: UseDocumentViewerArgs) {
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

  const questionsState = generationState?.questions || {
    status: "idle" as const,
    progress: 0,
  };
  const notesState = generationState?.notes || {
    status: "idle" as const,
    progress: 0,
  };

  const showToast = (message: string, type: ToastType) => {
    setToast({ visible: true, message, type });
  };

  // Derivations for OCR with smart time-based logic
  const { isOcrPending, isOcrFailed, hasNoText, hasShortText, canGenerate } =
    useMemo(() => {
      const isProcessing =
        document.ocrStatus === "pending" || document.ocrStatus === "processing";
      const isCompleted = document.ocrStatus === "completed";
      const isFailed = document.ocrStatus === "failed";

      // Check if document is fresh (less than 5 minutes old)
      const created = new Date(document.$createdAt);
      const now = new Date();
      const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
      const isFresh = diffMinutes < 5;

      const hasNoText =
        !document.ocrText || document.ocrText.trim().length === 0;
      const hasShortText = !!document.ocrText && document.ocrText.length < 50;

      // Only show OCR as pending if actively processing
      const isOcrPending = isProcessing;

      // Only show failure if not fresh and actually failed
      const isOcrFailed = isFailed && !isFresh;

      // Can generate if:
      // - Not actively processing AND
      // - Has meaningful text (not empty, not too short) OR
      // - Completed successfully with some text
      const canGenerate =
        !isProcessing && !hasNoText && (!hasShortText || isCompleted);

      return {
        isOcrPending,
        isOcrFailed,
        hasNoText,
        hasShortText,
        canGenerate,
      };
    }, [document.ocrStatus, document.ocrText, document.$createdAt]);

  // React to generation status changes with toasts
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
        message: `Check out this image: ${document.title}`,
        url: document.fileUrl,
        title: document.title,
      });

      if (result.action === Share.sharedAction) {
        showToast("Document shared successfully!", "success");
      }
    } catch {
      showToast("Failed to share document", "error");
    }
  };

  const handleInfo = () => {
    setFabMenuOpen(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDocInfo((v) => !v);
  };

  const hideToast = () => setToast((t) => ({ ...t, visible: false }));

  // Progress banner flag & text
  const isGeneratingBannerVisible =
    questionsState.status === "generating" ||
    notesState.status === "generating";

  const bannerText = isGeneratingBannerVisible
    ? questionsState.status === "generating" &&
      notesState.status === "generating"
      ? "AI is generating questions and notes..."
      : questionsState.status === "generating"
        ? "AI is generating questions..."
        : "AI is generating notes..."
    : "";

  return {
    // state
    showDocInfo,
    setShowDocInfo,
    fabMenuOpen,
    setFabMenuOpen,
    toast,
    showToast,
    hideToast,

    // derived
    questionsState,
    notesState,
    isOcrPending,
    isOcrFailed,
    hasNoText,
    hasShortText,
    canGenerate,
    isGeneratingBannerVisible,
    bannerText,

    // handlers
    handleDelete,
    handleShare,
    handleInfo,
  };
}
