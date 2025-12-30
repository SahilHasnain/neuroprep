import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  CheckCircle2,
} from "lucide-react-native";
import { useState, useEffect } from "react";
import MathMarkdown from "@/components/shared/MathMarkdown";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { THEME } from "@/constants/theme";

interface NoteSectionProps {
  heading: string;
  concept: string;
  content: string;
  keyPoints: string[];
  example: string;
  defaultExpanded?: boolean;
}

export default function NoteSection({
  heading,
  concept,
  content,
  keyPoints,
  example,
  defaultExpanded = false,
}: NoteSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const toggleExpand = () => {
    // Configure smooth animation
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        300,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity
      )
    );
    setIsExpanded(!isExpanded);
  };

  // Fallback values for missing data
  const safeHeading = heading || "Untitled Section";
  const safeConcept = concept || "No concept summary available";
  const safeContent = content || "";
  const safeKeyPoints = Array.isArray(keyPoints)
    ? keyPoints.filter((point) => point && typeof point === "string")
    : [];
  const safeExample = example || "";

  // Don't render if there's no meaningful content
  if (
    !safeHeading &&
    !safeConcept &&
    !safeContent &&
    safeKeyPoints.length === 0 &&
    !safeExample
  ) {
    return null;
  }

  return (
    <View
      style={{ backgroundColor: THEME.colors.background.secondary }}
      className="mb-5 overflow-hidden border-2 border-gray-700 rounded-xl shadow-sm"
    >
      {/* Header - Always Visible */}
      <Pressable
        onPress={toggleExpand}
        className="flex-row items-center justify-between p-4 active:bg-gray-800"
      >
        <View className="flex-1 mr-3">
          <Text className="text-base font-bold leading-tight text-gray-100">
            {safeHeading}
          </Text>
          {/* Concept line - visible when collapsed */}
          {!isExpanded && safeConcept && (
            <Text
              className="mt-2 text-sm leading-5 text-gray-400"
              numberOfLines={2}
            >
              {safeConcept}
            </Text>
          )}
        </View>
        <View className="p-1">
          {isExpanded ? (
            <ChevronDown size={22} color="#60a5fa" />
          ) : (
            <ChevronRight size={22} color="#9ca3af" />
          )}
        </View>
      </Pressable>

      {/* Expanded Content */}
      {isExpanded && (
        <View className="px-4 pb-4 pt-2">
          {/* Concept Explanation */}
          {safeConcept && (
            <View className="p-3 mb-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Text className="text-sm font-semibold leading-6 text-blue-300">
                {safeConcept}
              </Text>
            </View>
          )}

          {/* Main Content */}
          {safeContent && (
            <View className="mb-4">
              <MathMarkdown
                style={{
                  body: {
                    color: "#e5e5e5",
                    fontSize: 15,
                    lineHeight: 24,
                  },
                  paragraph: {
                    marginVertical: 4,
                    color: "#d4d4d4",
                    lineHeight: 22,
                  },
                  strong: { color: "#f5f5f5", fontWeight: "bold" },
                  em: { color: "#a3a3a3", fontStyle: "italic" },
                }}
              >
                {safeContent}
              </MathMarkdown>
            </View>
          )}

          {/* Key Points with Icons */}
          {safeKeyPoints.length > 0 && (
            <View className="mb-4">
              <Text className="mb-3 text-sm font-bold text-gray-200">
                Key Points:
              </Text>
              {safeKeyPoints.map((point, index) => (
                <View key={index} className="flex-row items-start mb-3">
                  <View className="mt-0.5 mr-2">
                    <CheckCircle2 size={18} color="#60a5fa" />
                  </View>
                  <Text className="flex-1 text-sm leading-6 text-gray-300">
                    {point}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Example */}
          {safeExample && (
            <View className="p-4 border-l-4 rounded-lg bg-amber-500/10 border-amber-500">
              <View className="flex-row items-center mb-2">
                <BookOpen size={18} color="#fbbf24" />
                <Text className="ml-2 text-sm font-bold text-amber-300">
                  Example:
                </Text>
              </View>
              <Text className="text-sm leading-6 text-amber-200">
                {safeExample}
              </Text>
            </View>
          )}

          {/* Fallback if no content in expanded view */}
          {!safeConcept &&
            !safeContent &&
            safeKeyPoints.length === 0 &&
            !safeExample && (
              <View className="py-4">
                <Text className="text-sm text-center text-gray-500">
                  No additional details available for this section.
                </Text>
              </View>
            )}
        </View>
      )}
    </View>
  );
}
