import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import {
  FileText,
  Image as ImageIcon,
  FileQuestion,
  NotebookPen,
  Loader,
  CheckCircle,
  Sparkles,
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
      <View className="flex-1 m-2 bg-[#1e1e1e] rounded-2xl border border-gray-700 overflow-hidden">
        <View className="p-4">
          <View className="w-full h-32 bg-gray-700/30 rounded-xl mb-3 animate-pulse" />
          <View className="h-4 bg-gray-700/30 rounded w-4/5 mb-2 animate-pulse" />
          <View className="h-3 bg-gray-700/30 rounded w-1/2 animate-pulse" />
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      className="flex-1 m-2 bg-[#1e1e1e] rounded-2xl border border-gray-700 overflow-hidden shadow-lg shadow-black/20 active:scale-[0.98]"
      onPress={() => onPress(document)}
      activeOpacity={0.9}
    >
      <View className="p-4">
        {/* Thumbnail with enhanced styling */}
        <View className="relative mb-3">
          {document.thumbnailUrl ? (
            <Image
              source={{ uri: document.thumbnailUrl }}
              style={{ width: "100%", height: 128, borderRadius: 12 }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View className="w-full h-32 bg-gray-800/50 rounded-xl justify-center items-center border border-gray-700/50">
              <Icon size={48} color={COLORS.primary.blue} />
            </View>
          )}

          {/* Generation Status Badges - Top Right */}
          {(questionsStatus || notesStatus) && (
            <View className="absolute top-2 right-2 flex-row gap-1">
              {questionsStatus && questionsStatus !== "idle" && (
                <View
                  className={`flex-row items-center gap-1 px-2 py-1 rounded-full ${
                    questionsStatus === "generating"
                      ? "bg-blue-600"
                      : questionsStatus === "success"
                        ? "bg-green-500"
                        : "bg-red-500"
                  }`}
                >
                  {questionsStatus === "generating" ? (
                    <Loader size={10} color="#fff" />
                  ) : questionsStatus === "success" ? (
                    <CheckCircle size={10} color="#fff" />
                  ) : (
                    <FileQuestion size={10} color="#fff" />
                  )}
                  <Text className="text-[10px] font-semibold text-white">
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
                  className={`flex-row items-center gap-1 px-2 py-1 rounded-full ${
                    notesStatus === "generating"
                      ? "bg-blue-600"
                      : notesStatus === "success"
                        ? "bg-green-500"
                        : "bg-red-500"
                  }`}
                >
                  {notesStatus === "generating" ? (
                    <Loader size={10} color="#fff" />
                  ) : notesStatus === "success" ? (
                    <CheckCircle size={10} color="#fff" />
                  ) : (
                    <NotebookPen size={10} color="#fff" />
                  )}
                  <Text className="text-[10px] font-semibold text-white">
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
        </View>

        {/* Card Info */}
        <View className="gap-2">
          {/* Title */}
          <Text
            className="text-base font-semibold text-white leading-5"
            numberOfLines={2}
          >
            {document.title}
          </Text>

          {/* Meta Info */}
          <View className="flex-row items-center gap-1.5">
            <Icon size={12} color={COLORS.text.tertiary} />
            <Text className="text-xs text-gray-400">{relativeDate}</Text>
          </View>

          {/* Inline Generation Progress */}
          {questionsStatus === "generating" && (
            <View className="mt-1">
              <View className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <View
                  className="h-full bg-blue-600 rounded-full"
                  style={{
                    width: `${generationState?.questions?.progress || 0}%`,
                  }}
                />
              </View>
              <Text className="text-[10px] text-gray-500 mt-0.5">
                Generating Questions...
              </Text>
            </View>
          )}
          {notesStatus === "generating" && (
            <View className="mt-1">
              <View className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <View
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${generationState?.notes?.progress || 0}%` }}
                />
              </View>
              <Text className="text-[10px] text-gray-500 mt-0.5">
                Generating Notes...
              </Text>
            </View>
          )}

          {/* Ready Indicators */}
          {(questionsStatus === "success" || notesStatus === "success") && (
            <View className="flex-row gap-2 mt-1">
              {questionsStatus === "success" && (
                <View className="flex-row items-center gap-1 px-2 py-1 bg-blue-600/20 border border-blue-600/30 rounded-lg">
                  <FileQuestion size={11} color={COLORS.primary.blue} />
                  <Text className="text-[10px] text-blue-400 font-medium">
                    Questions Ready
                  </Text>
                </View>
              )}
              {notesStatus === "success" && (
                <View className="flex-row items-center gap-1 px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                  <NotebookPen size={11} color={COLORS.accent.gold} />
                  <Text className="text-[10px] text-amber-400 font-medium">
                    Notes Ready
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* OCR State Indicators */}
          {isPendingOcr ? (
            <View className="mt-2 py-2 px-2.5 bg-blue-600/15 border border-blue-600/30 rounded-lg flex-row items-center gap-1.5">
              <Sparkles size={12} color={COLORS.primary.blue} />
              <Text className="text-xs text-blue-400 font-medium flex-1">
                Processing PDF...
              </Text>
            </View>
          ) : (
            <>
              {isOcrFailed && (
                <View className="mt-2 py-1.5 px-2 bg-amber-500/20 border border-amber-500/40 rounded-lg">
                  <Text className="text-[11px] text-amber-400 font-medium">
                    ⚠️ No text extracted
                  </Text>
                </View>
              )}
              {!hasNoText && hasShortText && (
                <View className="mt-2 py-1.5 px-2 bg-amber-500/20 border border-amber-500/40 rounded-lg">
                  <Text className="text-[11px] text-amber-400 font-medium">
                    ⚠️ Limited text
                  </Text>
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

// Styles removed - using Tailwind classes
