import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants/theme";
import type { Document, DocumentGenerationState } from "@/types/document";
import DocumentHeader from "./DocumentHeader";
import FloatingActionMenu from "./FloatingActionMenu";
import DocumentInfoPanel from "./DocumentInfoPanel";
import DocumentContent from "./DocumentContent";
import StatusBanners from "./StatusBanners";
import ActionButtons from "./ActionButtons";
import GenerationStatusCard from "./GenerationStatusCard";
import DismissibleBottomSheet from "./DismissibleBottomSheet";
import Toast from "@/components/shared/Toast";
import { useDocumentViewer } from "./useDocumentViewer";

interface DocumentViewerProps {
  document: Document;
  onBack: () => void;
  onDelete: () => void;
  onGenerateQuestions: () => void;
  onGenerateNotes: () => void;
  onGenerateFlashcards?: () => void;
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
  onGenerateFlashcards,
  onViewQuestions,
  onViewNotes,
  generationState,
  isLoading = false,
}: DocumentViewerProps) {
  const [bottomSheetVisible, setBottomSheetVisible] = useState(true);

  const {
    // state
    showDocInfo,
    setShowDocInfo,
    fabMenuOpen,
    setFabMenuOpen,
    toast,
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
  } = useDocumentViewer({ document, generationState, onDelete });

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={styles.container}>
        <DocumentHeader
          title="Loading..."
          createdAt={document.$createdAt}
          onBack={onBack}
        />
        <View className="items-center justify-center flex-1 gap-4">
          <ActivityIndicator size="large" color={COLORS.primary.blue} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={styles.container}>
      {/* Compact Header */}
      <DocumentHeader
        title={document.title}
        createdAt={document.$createdAt}
        onBack={onBack}
      />

      {/* Generation Progress Banner */}
      {isGeneratingBannerVisible && (
        <View
          className="flex-row items-center gap-3 px-4 py-2"
          style={styles.progressBanner}
        >
          <ActivityIndicator size="small" color={COLORS.text.primary} />
          <Text
            className="flex-1 text-xs font-medium"
            style={styles.textPrimary}
          >
            {bannerText}
          </Text>
        </View>
      )}

      {/* Document Content with inline controls */}
      <DocumentContent fileUrl={document.fileUrl} />

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
        onHide={hideToast}
      />

      {/* Dismissible Bottom Sheet */}
      <DismissibleBottomSheet
        isVisible={bottomSheetVisible}
        onToggle={() => setBottomSheetVisible(!bottomSheetVisible)}
      >
        {/* Document Info Panel */}
        {showDocInfo && (
          <DocumentInfoPanel
            document={document}
            onClose={() => setShowDocInfo(false)}
          />
        )}

        {/* Status Banners */}
        <StatusBanners
          isOcrPending={isOcrPending}
          isOcrFailed={isOcrFailed}
          hasNoText={hasNoText}
          hasShortText={hasShortText}
          documentCreatedAt={document.$createdAt}
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
          onGenerateFlashcards={onGenerateFlashcards}
        />
      </DismissibleBottomSheet>
    </SafeAreaView>
  );
}
