import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { COLORS } from "@/constants/theme";

interface StatusBannersProps {
  isOcrPending: boolean;
  isOcrFailed: boolean;
  hasNoText: boolean;
  hasShortText: boolean;
  documentCreatedAt?: string;
}

// Check if document is fresh (less than 5 minutes old)
function isFreshDocument(createdAt?: string): boolean {
  if (!createdAt) return true;
  const created = new Date(createdAt);
  const now = new Date();
  const diffMinutes = (now.getTime() - created.getTime()) / (1000 * 60);
  return diffMinutes < 5;
}

export default function StatusBanners({
  isOcrPending,
  isOcrFailed,
  hasNoText,
  hasShortText,
  documentCreatedAt,
}: StatusBannersProps) {
  const isFresh = isFreshDocument(documentCreatedAt);
  const isProcessing = isOcrPending;

  // Only show failure warnings for documents that have had time to process
  const shouldShowFailure = isOcrFailed && !isFresh;

  return (
    <>
      {/* Elegant Processing Banner */}
      {isProcessing && (
        <View
          className="gap-2 p-4 mb-4 border rounded-2xl"
          style={{
            backgroundColor: COLORS.primary.blue + "1A",
            borderColor: COLORS.primary.blue + "33",
          }}
        >
          <View className="flex-row items-center gap-3">
            <ActivityIndicator size="small" color={COLORS.primary.blue} />
            <View className="flex-1">
              <Text
                className="text-base font-semibold mb-1"
                style={{ color: COLORS.primary.blue }}
              >
                ✨ Processing in background
              </Text>
              <Text
                className="text-sm leading-5"
                style={{ color: COLORS.text.secondary }}
              >
                Text extraction is happening automatically. You can view other
                documents meanwhile.
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Failure Warning (only after reasonable wait) */}
      {shouldShowFailure && hasNoText && (
        <View
          className="p-4 mb-4 border rounded-2xl"
          style={{
            backgroundColor: COLORS.status.warning + "26",
            borderColor: COLORS.status.warning + "4D",
          }}
        >
          <Text
            className="mb-2 text-base font-semibold"
            style={{ color: COLORS.status.warning }}
          >
            ⚠️ Unable to Extract Text
          </Text>
          <Text
            className="text-sm leading-5"
            style={{ color: COLORS.text.secondary }}
          >
            Couldn't extract text from this document. Try uploading a clearer
            image. AI features won&apos;t work without text content.
          </Text>
        </View>
      )}

      {/* Limited Text Info (only if completed and not fresh) */}
      {!isFresh && !hasNoText && hasShortText && !isProcessing && (
        <View
          className="p-4 mb-4 border rounded-2xl"
          style={{
            backgroundColor: COLORS.primary.blue + "1A",
            borderColor: COLORS.primary.blue + "33",
          }}
        >
          <Text
            className="mb-2 text-base font-semibold"
            style={{ color: COLORS.primary.blue }}
          >
            💡 Short Content Detected
          </Text>
          <Text
            className="text-sm leading-5"
            style={{ color: COLORS.text.secondary }}
          >
            This document has limited text. AI-generated questions and notes may
            be brief.
          </Text>
        </View>
      )}
    </>
  );
}
