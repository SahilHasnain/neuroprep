import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { WebView } from "react-native-webview";
import {
  ArrowLeft,
  MoreVertical,
  FileQuestion,
  NotebookPen,
  Trash2,
  Share2,
  Info,
  Edit3,
  Download,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
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
  const [showDocInfo, setShowDocInfo] = useState(false);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);

  const isPDF = document.type === "pdf";

  const questionsState = generationState?.questions || {
    status: "idle",
    progress: 0,
  };
  const notesState = generationState?.notes || { status: "idle", progress: 0 };

  // Check if OCR is still processing
  const isOcrPending = document.ocrStatus === "pending";
  const isOcrFailed = document.ocrStatus === "failed";
  // Check if document has no OCR text
  const hasNoText = !document.ocrText || document.ocrText.trim().length === 0;
  const hasShortText = document.ocrText && document.ocrText.length < 50;
  const canGenerate = !isOcrPending && !hasNoText && !hasShortText;

  // Helper to format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Helper to get OCR status label
  const getOcrStatusLabel = () => {
    switch (document.ocrStatus) {
      case "completed":
        return "✓ Completed";
      case "pending":
        return "⏳ Processing...";
      case "failed":
        return "✗ Failed";
      default:
        return "—";
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);
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
    setMenuVisible(false);
    setFabMenuOpen(false);
    Alert.alert("Coming Soon", "Share functionality will be available soon!");
  };

  const handleInfo = () => {
    setMenuVisible(false);
    setFabMenuOpen(false);
    setShowDocInfo(!showDocInfo);
  };

  const handleRename = () => {
    setMenuVisible(false);
    setFabMenuOpen(false);
    Alert.alert("Coming Soon", "Rename functionality will be available soon!");
  };

  const handleDownload = () => {
    setMenuVisible(false);
    setFabMenuOpen(false);
    Alert.alert(
      "Coming Soon",
      "Download functionality will be available soon!"
    );
  };

  if (isLoading) {
    return (
      <View
        className="flex-1"
        style={{ backgroundColor: COLORS.background.primary }}
      >
        <View
          className="px-5 pt-16 pb-4 border-b"
          style={{
            backgroundColor: COLORS.background.secondary,
            borderBottomColor: COLORS.border.default,
          }}
        >
          <TouchableOpacity
            className="items-center justify-center w-10 h-10 rounded-full active:opacity-70"
            style={{ backgroundColor: COLORS.background.card }}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text
            className="mt-3 text-lg font-semibold text-center"
            style={{ color: COLORS.text.primary }}
          >
            Loading...
          </Text>
        </View>
        <View className="items-center justify-center flex-1 gap-4">
          <ActivityIndicator size="large" color={COLORS.primary.blue} />
          <Text className="text-base" style={{ color: COLORS.text.tertiary }}>
            Loading document...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: COLORS.background.primary }}
    >
      {/* Enhanced Header */}
      <View
        className="px-5 pt-16 pb-4 border-b shadow-lg"
        style={{
          backgroundColor: COLORS.background.secondary,
          borderBottomColor: COLORS.border.default,
          shadowColor: "#000",
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        {/* Top Row: Back, Badge, Menu */}
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            className="items-center justify-center w-10 h-10 rounded-full active:scale-90"
            style={{ backgroundColor: COLORS.background.card }}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={COLORS.text.primary} />
          </TouchableOpacity>

          {/* Document Type Badge */}
          <View
            className="px-3 py-1 border rounded-full"
            style={{
              backgroundColor: COLORS.primary.blue + "33",
              borderColor: COLORS.primary.blue + "4D",
            }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: COLORS.primary.blue }}
            >
              {isPDF ? "PDF" : "IMAGE"}
            </Text>
          </View>

          {/* Menu Button */}
          <TouchableOpacity
            className="items-center justify-center w-10 h-10 rounded-full active:scale-90"
            style={{ backgroundColor: COLORS.background.card }}
            onPress={() => setMenuVisible(!menuVisible)}
            activeOpacity={0.7}
          >
            <MoreVertical size={20} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text
          className="px-4 text-xl font-bold text-center"
          style={{ color: COLORS.text.primary }}
          numberOfLines={2}
        >
          {document.title}
        </Text>

        {/* Metadata */}
        <View className="flex-row items-center justify-center gap-2 mt-2">
          <Text className="text-xs" style={{ color: COLORS.text.tertiary }}>
            {new Date(document.$createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

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

      {/* Enhanced Menu Dropdown */}
      {menuVisible && (
        <>
          {/* Backdrop */}
          <Pressable
            className="absolute inset-0 z-40 bg-black/50"
            onPress={() => setMenuVisible(false)}
          />

          {/* Menu */}
          <View
            className="absolute top-36 right-4 rounded-2xl border shadow-2xl overflow-hidden min-w-[200px] z-50"
            style={{
              backgroundColor: COLORS.background.secondary,
              borderColor: COLORS.border.default,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <TouchableOpacity
              className="flex-row items-center gap-3 p-4"
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Share2 size={20} color={COLORS.primary.blue} />
              <Text
                className="font-medium"
                style={{ color: COLORS.text.primary }}
              >
                Share
              </Text>
            </TouchableOpacity>

            <View
              className="h-px"
              style={{ backgroundColor: COLORS.border.default }}
            />

            <TouchableOpacity
              className="flex-row items-center gap-3 p-4"
              onPress={handleInfo}
              activeOpacity={0.7}
            >
              <Info size={20} color={COLORS.primary.blue} />
              <Text
                className="font-medium"
                style={{ color: COLORS.text.primary }}
              >
                Document Info
              </Text>
            </TouchableOpacity>

            <View
              className="h-px"
              style={{ backgroundColor: COLORS.border.default }}
            />

            <TouchableOpacity
              className="flex-row items-center gap-3 p-4"
              onPress={handleRename}
              activeOpacity={0.7}
            >
              <Edit3 size={20} color={COLORS.primary.blue} />
              <Text
                className="font-medium"
                style={{ color: COLORS.text.primary }}
              >
                Rename
              </Text>
            </TouchableOpacity>

            <View
              className="h-px"
              style={{ backgroundColor: COLORS.border.default }}
            />

            <TouchableOpacity
              className="flex-row items-center gap-3 p-4"
              onPress={handleDownload}
              activeOpacity={0.7}
            >
              <Download size={20} color={COLORS.primary.blue} />
              <Text
                className="font-medium"
                style={{ color: COLORS.text.primary }}
              >
                Download
              </Text>
            </TouchableOpacity>

            <View
              className="h-px"
              style={{ backgroundColor: COLORS.border.default }}
            />

            <TouchableOpacity
              className="flex-row items-center gap-3 p-4"
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Trash2 size={20} color={COLORS.status.error} />
              <Text
                className="font-medium"
                style={{ color: COLORS.status.error }}
              >
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Document Content */}
      <View className="flex-1">
        {isPDF ? (
          <WebView
            source={{ uri: document.fileUrl }}
            style={{ flex: 1, backgroundColor: COLORS.background.primary }}
            startInLoadingState
            renderLoading={() => (
              <View
                className="absolute inset-0 items-center justify-center"
                style={{ backgroundColor: COLORS.background.primary }}
              >
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
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsVerticalScrollIndicator={false}
          >
            {!imageError ? (
              <Image
                source={{ uri: document.fileUrl }}
                style={{ width: SCREEN_WIDTH, height: "100%", minHeight: 400 }}
                contentFit="contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <View className="items-center justify-center flex-1 p-10">
                <Text
                  className="text-base text-center"
                  style={{ color: COLORS.text.tertiary }}
                >
                  Failed to load image
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Floating Action Button Menu */}
      <View className="absolute z-50 bottom-6 right-6">
        {/* Menu Options (show when open) */}
        {fabMenuOpen && (
          <View className="gap-3 mb-3">
            <TouchableOpacity
              className="flex-row items-center gap-3 p-3 rounded-full shadow-lg active:scale-95"
              style={{
                backgroundColor: COLORS.background.card,
                shadowColor: "#000",
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
              onPress={handleInfo}
              activeOpacity={0.8}
            >
              <View
                className="items-center justify-center w-10 h-10 rounded-full"
                style={{ backgroundColor: COLORS.primary.blue + "20" }}
              >
                <Info size={20} color={COLORS.primary.blue} />
              </View>
              <Text
                className="pr-2 text-sm font-medium"
                style={{ color: COLORS.text.primary }}
              >
                Info
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-3 p-3 rounded-full shadow-lg active:scale-95"
              style={{
                backgroundColor: COLORS.background.card,
                shadowColor: "#000",
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <View
                className="items-center justify-center w-10 h-10 rounded-full"
                style={{ backgroundColor: COLORS.primary.blue + "20" }}
              >
                <Share2 size={20} color={COLORS.primary.blue} />
              </View>
              <Text
                className="pr-2 text-sm font-medium"
                style={{ color: COLORS.text.primary }}
              >
                Share
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center gap-3 p-3 rounded-full shadow-lg active:scale-95"
              style={{
                backgroundColor: COLORS.background.card,
                shadowColor: "#000",
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <View
                className="items-center justify-center w-10 h-10 rounded-full"
                style={{ backgroundColor: COLORS.status.error + "20" }}
              >
                <Trash2 size={20} color={COLORS.status.error} />
              </View>
              <Text
                className="pr-2 text-sm font-medium"
                style={{ color: COLORS.status.error }}
              >
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main FAB Button */}
        <TouchableOpacity
          className="items-center justify-center rounded-full shadow-lg w-14 h-14 active:scale-95"
          style={{
            backgroundColor: COLORS.primary.blue,
            shadowColor: COLORS.primary.blue,
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 8,
          }}
          onPress={() => setFabMenuOpen(!fabMenuOpen)}
          activeOpacity={0.8}
        >
          {fabMenuOpen ? (
            <X size={24} color={COLORS.text.primary} />
          ) : (
            <Plus size={24} color={COLORS.text.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Action Panel */}
      <View
        className="p-4 pb-8 border-t"
        style={{
          backgroundColor: COLORS.background.secondary,
          borderTopColor: COLORS.border.default,
        }}
      >
        {/* Collapsible Document Info Panel */}
        {showDocInfo && (
          <View
            className="p-4 mb-4 border rounded-2xl"
            style={{
              backgroundColor: COLORS.background.card,
              borderColor: COLORS.border.default,
            }}
          >
            <TouchableOpacity
              className="flex-row items-center justify-between mb-3"
              onPress={() => setShowDocInfo(false)}
              activeOpacity={0.7}
            >
              <Text
                className="text-base font-bold"
                style={{ color: COLORS.text.primary }}
              >
                Document Information
              </Text>
              <ChevronUp size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>

            {/* Document Details */}
            <View className="gap-2">
              <View
                className="flex-row items-center justify-between py-2 border-b"
                style={{ borderBottomColor: COLORS.border.default }}
              >
                <Text
                  className="text-sm"
                  style={{ color: COLORS.text.secondary }}
                >
                  Type
                </Text>
                <Text
                  className="text-sm font-medium"
                  style={{ color: COLORS.text.primary }}
                >
                  {isPDF ? "PDF Document" : "Image"}
                </Text>
              </View>

              <View
                className="flex-row items-center justify-between py-2 border-b"
                style={{ borderBottomColor: COLORS.border.default }}
              >
                <Text
                  className="text-sm"
                  style={{ color: COLORS.text.secondary }}
                >
                  Uploaded
                </Text>
                <Text
                  className="text-sm font-medium"
                  style={{ color: COLORS.text.primary }}
                >
                  {new Date(document.$createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>

              <View
                className="flex-row items-center justify-between py-2 border-b"
                style={{ borderBottomColor: COLORS.border.default }}
              >
                <Text
                  className="text-sm"
                  style={{ color: COLORS.text.secondary }}
                >
                  Size
                </Text>
                <Text
                  className="text-sm font-medium"
                  style={{ color: COLORS.text.primary }}
                >
                  {formatFileSize(document.fileSize)}
                </Text>
              </View>

              <View
                className="flex-row items-center justify-between py-2 border-b"
                style={{ borderBottomColor: COLORS.border.default }}
              >
                <Text
                  className="text-sm"
                  style={{ color: COLORS.text.secondary }}
                >
                  OCR Status
                </Text>
                <Text
                  className="text-sm font-medium"
                  style={{
                    color:
                      document.ocrStatus === "completed"
                        ? COLORS.status.success
                        : document.ocrStatus === "failed"
                          ? COLORS.status.error
                          : COLORS.status.warning,
                  }}
                >
                  {getOcrStatusLabel()}
                </Text>
              </View>

              {document.ocrText && (
                <View className="py-2">
                  <Text
                    className="mb-2 text-sm"
                    style={{ color: COLORS.text.secondary }}
                  >
                    Extracted Text Preview
                  </Text>
                  <View
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: COLORS.background.primary }}
                  >
                    <Text
                      className="text-xs leading-5"
                      style={{ color: COLORS.text.tertiary }}
                      numberOfLines={4}
                    >
                      {document.ocrText}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* OCR Processing Banner */}
        {isOcrPending && (
          <View
            className="gap-2 p-4 mb-4 border rounded-2xl"
            style={{
              backgroundColor: COLORS.primary.blue + "26",
              borderColor: COLORS.primary.blue + "4D",
            }}
          >
            <ActivityIndicator size="small" color={COLORS.primary.blue} />
            <Text className="mt-1 text-base font-semibold text-blue-400">
              ✨ Extracting text from document...
            </Text>
            <Text className="text-sm leading-5 text-gray-300">
              This happens in the background. You can view other documents while
              we process this one. Actions will be available once complete.
            </Text>
          </View>
        )}

        {/* No Text Warning (only on OCR failure) */}
        {isOcrFailed && hasNoText && (
          <View
            className="p-4 mb-4 border rounded-2xl"
            style={{
              backgroundColor: COLORS.status.warning + "33",
              borderColor: COLORS.status.warning + "66",
            }}
          >
            <Text
              className="mb-2 text-base font-semibold"
              style={{ color: COLORS.status.warning }}
            >
              ⚠️ Text Extraction Failed
            </Text>
            <Text
              className="text-sm leading-5"
              style={{ color: COLORS.text.secondary }}
            >
              Unable to extract text from this document. AI features like
              question and note generation won&apos;t work. Try uploading a
              clearer image or a text-based PDF.
            </Text>
          </View>
        )}
        {!hasNoText && hasShortText && (
          <View
            className="p-4 mb-4 border rounded-2xl"
            style={{
              backgroundColor: COLORS.status.warning + "33",
              borderColor: COLORS.status.warning + "66",
            }}
          >
            <Text
              className="mb-2 text-base font-semibold"
              style={{ color: COLORS.status.warning }}
            >
              ⚠️ Limited Text Content
            </Text>
            <Text
              className="text-sm leading-5"
              style={{ color: COLORS.text.secondary }}
            >
              Very little text was extracted from this document. AI-generated
              content may be limited or generic.
            </Text>
          </View>
        )}

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

        {/* Enhanced Quick Action Buttons */}
        <View className="gap-3">
          {/* Generate Questions Button */}
          <TouchableOpacity
            className="p-4 border rounded-2xl active:scale-95"
            style={{
              backgroundColor:
                canGenerate && questionsState.status !== "generating"
                  ? COLORS.primary.blue
                  : COLORS.background.card,
              borderColor:
                canGenerate && questionsState.status !== "generating"
                  ? COLORS.primary.blue
                  : COLORS.border.default,
              opacity:
                canGenerate && questionsState.status !== "generating" ? 1 : 0.5,
              shadowColor: COLORS.primary.blue,
              shadowOpacity:
                canGenerate && questionsState.status !== "generating" ? 0.3 : 0,
              shadowRadius: 8,
              elevation:
                canGenerate && questionsState.status !== "generating" ? 5 : 0,
            }}
            onPress={onGenerateQuestions}
            disabled={questionsState.status === "generating" || !canGenerate}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center gap-3">
              <View
                className="items-center justify-center w-12 h-12 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                {questionsState.status === "generating" ? (
                  <ActivityIndicator size="small" color={COLORS.text.primary} />
                ) : (
                  <FileQuestion size={24} color={COLORS.text.primary} />
                )}
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  {questionsState.status === "generating"
                    ? "Generating..."
                    : questionsState.status === "success"
                      ? "Regenerate Questions"
                      : "Generate Questions"}
                </Text>
                <Text
                  className="text-xs mt-0.5"
                  style={{ color: COLORS.text.primary, opacity: 0.8 }}
                >
                  AI-powered practice
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Generate Notes Button */}
          <TouchableOpacity
            className="p-4 border rounded-2xl active:scale-95"
            style={{
              backgroundColor:
                canGenerate && notesState.status !== "generating"
                  ? COLORS.accent.gold
                  : COLORS.background.card,
              borderColor:
                canGenerate && notesState.status !== "generating"
                  ? COLORS.accent.gold
                  : COLORS.border.default,
              opacity:
                canGenerate && notesState.status !== "generating" ? 1 : 0.5,
              shadowColor: COLORS.accent.gold,
              shadowOpacity:
                canGenerate && notesState.status !== "generating" ? 0.3 : 0,
              shadowRadius: 8,
              elevation:
                canGenerate && notesState.status !== "generating" ? 5 : 0,
            }}
            onPress={onGenerateNotes}
            disabled={notesState.status === "generating" || !canGenerate}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center gap-3">
              <View
                className="items-center justify-center w-12 h-12 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                {notesState.status === "generating" ? (
                  <ActivityIndicator size="small" color={COLORS.text.primary} />
                ) : (
                  <NotebookPen size={24} color={COLORS.text.primary} />
                )}
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-bold"
                  style={{ color: COLORS.text.primary }}
                >
                  {notesState.status === "generating"
                    ? "Generating..."
                    : notesState.status === "success"
                      ? "Regenerate Notes"
                      : "Generate Notes"}
                </Text>
                <Text
                  className="text-xs mt-0.5"
                  style={{ color: COLORS.text.primary, opacity: 0.8 }}
                >
                  Study summaries
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
