import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { FileQuestion, NotebookPen } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import type { GenerationState } from "@/types/document";

interface ActionButtonsProps {
  canGenerate: boolean;
  questionsState: GenerationState;
  notesState: GenerationState;
  onGenerateQuestions: () => void;
  onGenerateNotes: () => void;
}

export default function ActionButtons({
  canGenerate,
  questionsState,
  notesState,
  onGenerateQuestions,
  onGenerateNotes,
}: ActionButtonsProps) {
  return (
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
          opacity: canGenerate && notesState.status !== "generating" ? 1 : 0.5,
          shadowColor: COLORS.accent.gold,
          shadowOpacity:
            canGenerate && notesState.status !== "generating" ? 0.3 : 0,
          shadowRadius: 8,
          elevation: canGenerate && notesState.status !== "generating" ? 5 : 0,
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
  );
}
