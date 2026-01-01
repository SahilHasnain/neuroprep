import React, { useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { COLORS } from "@/constants/theme";
import type { Document, DocumentGenerationState } from "@/types/document";
import DocumentHeader from "./DocumentHeader";
import FloatingActionMenu from "./FloatingActionMenu";
import DocumentInfoPanel from "./DocumentInfoPanel";
import DocumentContent from "./DocumentContent";
import StatusBanners from "./StatusBanners";
import ActionButtons from "./ActionButtons";
import GenerationStatusCard from "./GenerationStatusCard";

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
  const [showDocInfo, setShowDocInfo] = useState(false);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);

  const isPDF = document.type === "pdf";

  const questionsState = generationState?.questions || {
    status: "idle",
    progress: 0,
  };
  const notesState = generationState?.notes || { status: "idle", progress: 0 };

  // Check OCR status
  const isOcrPending = document.ocrStatus === "pending";
  const isOcrFailed = document.ocrStatus === "failed";
  const hasNoText = !document.ocrText || document.ocrText.trim().length === 0;
  const hasShortText = document.ocrText && document.ocrText.length < 50;
  const canGenerate = !isOcrPending && !hasNoText && !hasShortText;

  // Handlers
  const handleDelete = () => {
    setFabMenuOpen(false);
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

  const handleShare = () => {
    setFabMenuOpen(false);
    Alert.alert("Coming Soon", "Share functionality will be available soon!");
  };

  const handleInfo = () => {
    setFabMenuOpen(false);
    setShowDocInfo(!showDocInfo);
  };

  // Loading state
  if (isLoading) {
    return (
      <View
        className="flex-1"
        style={{ backgroundColor: COLORS.background.primary }}
      >
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
    <View
      className="flex-1"
      style={{ backgroundColor: COLORS.background.primary }}
    >
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
          style={{ backgroundColor: COLORS.primary.blue }}
        >
          <ActivityIndicator size="small" color={COLORS.text.primary} />
          <Text
            className="flex-1 text-sm font-medium"
            style={{ color: COLORS.text.primary }}
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

      {/* Bottom Panel */}
      <View
        className="p-4 pb-8 border-t"
        style={{
          backgroundColor: COLORS.background.secondary,
          borderTopColor: COLORS.border.default,
        }}
      >
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
