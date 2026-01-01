import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronUp } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import type { Document } from "@/types/document";

interface DocumentInfoPanelProps {
  document: Document;
  isPDF: boolean;
  onClose: () => void;
}

export default function DocumentInfoPanel({
  document,
  isPDF,
  onClose,
}: DocumentInfoPanelProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

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

  const getOcrStatusColor = () => {
    switch (document.ocrStatus) {
      case "completed":
        return COLORS.status.success;
      case "failed":
        return COLORS.status.error;
      case "pending":
        return COLORS.status.warning;
      default:
        return COLORS.text.tertiary;
    }
  };

  return (
    <View
      className="p-4 mb-4 border rounded-2xl"
      style={{
        backgroundColor: COLORS.background.card,
        borderColor: COLORS.border.default,
      }}
    >
      <TouchableOpacity
        className="flex-row items-center justify-between mb-3"
        onPress={onClose}
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
          <Text className="text-sm" style={{ color: COLORS.text.secondary }}>
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
          <Text className="text-sm" style={{ color: COLORS.text.secondary }}>
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
          <Text className="text-sm" style={{ color: COLORS.text.secondary }}>
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
          <Text className="text-sm" style={{ color: COLORS.text.secondary }}>
            OCR Status
          </Text>
          <Text
            className="text-sm font-medium"
            style={{ color: getOcrStatusColor() }}
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
  );
}
