import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { COLORS } from "@/constants/theme";

interface StatusBannersProps {
  isOcrPending: boolean;
  isOcrFailed: boolean;
  hasNoText: boolean;
  hasShortText: boolean;
}

export default function StatusBanners({
  isOcrPending,
  isOcrFailed,
  hasNoText,
  hasShortText,
}: StatusBannersProps) {
  return (
    <>
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
          <Text
            className="mt-1 text-base font-semibold"
            style={{ color: COLORS.primary.blue }}
          >
            ✨ Extracting text from document...
          </Text>
          <Text
            className="text-sm leading-5"
            style={{ color: COLORS.text.secondary }}
          >
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
            Unable to extract text from this document. AI features like question
            and note generation won&apos;t work. Try uploading a clearer image
            or a text-based PDF.
          </Text>
        </View>
      )}

      {/* Limited Text Warning */}
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
    </>
  );
}
