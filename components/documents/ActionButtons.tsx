import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import { FileQuestion, NotebookPen, CheckCircle2 } from "lucide-react-native";
import { COLORS } from "@/constants/theme";
import type { GenerationState } from "@/types/document";

interface ActionButtonsProps {
  canGenerate: boolean;
  questionsState: GenerationState;
  notesState: GenerationState;
  onGenerateQuestions: () => void;
  onGenerateNotes: () => void;
}

const styles = StyleSheet.create({
  iconContainer: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  textPrimary: {
    color: COLORS.text.primary,
  },
  textPrimaryOpaque: {
    color: COLORS.text.primary,
    opacity: 0.8,
  },
  buttonDisabled: {
    backgroundColor: COLORS.background.card,
    borderColor: COLORS.border.default,
    opacity: 0.5,
  },
});

export default function ActionButtons({
  canGenerate,
  questionsState,
  notesState,
  onGenerateQuestions,
  onGenerateNotes,
}: ActionButtonsProps) {
  const questionsScale = useRef(new Animated.Value(1)).current;
  const notesScale = useRef(new Animated.Value(1)).current;

  // Success animation for questions
  useEffect(() => {
    if (questionsState.status === "success") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.sequence([
        Animated.spring(questionsScale, {
          toValue: 1.05,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(questionsScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [questionsState.status]);

  // Success animation for notes
  useEffect(() => {
    if (notesState.status === "success") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.sequence([
        Animated.spring(notesScale, {
          toValue: 1.05,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(notesScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [notesState.status]);

  const handleQuestionPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onGenerateQuestions();
  };

  const handleNotesPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onGenerateNotes();
  };

  return (
    <View className="gap-3">
      {/* Generate Questions Button */}
      <Animated.View style={{ transform: [{ scale: questionsScale }] }}>
        <TouchableOpacity
          className="p-4 border rounded-2xl active:scale-95"
          style={[
            canGenerate && questionsState.status !== "generating"
              ? {
                  backgroundColor: COLORS.primary.blue,
                  borderColor: COLORS.primary.blue,
                  shadowColor: COLORS.primary.blue,
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }
              : styles.buttonDisabled,
          ]}
          onPress={handleQuestionPress}
          disabled={questionsState.status === "generating" || !canGenerate}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center gap-3">
            <View
              className="items-center justify-center w-12 h-12 rounded-full"
              style={styles.iconContainer}
            >
              {questionsState.status === "generating" ? (
                <ActivityIndicator size="small" color={COLORS.text.primary} />
              ) : questionsState.status === "success" ? (
                <CheckCircle2 size={24} color={COLORS.text.primary} />
              ) : (
                <FileQuestion size={24} color={COLORS.text.primary} />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold" style={styles.textPrimary}>
                {questionsState.status === "generating"
                  ? "Generating..."
                  : questionsState.status === "success"
                    ? "✓ Questions Ready"
                    : "Generate Questions"}
              </Text>
              <Text className="text-xs mt-0.5" style={styles.textPrimaryOpaque}>
                {questionsState.status === "success"
                  ? "Tap to regenerate"
                  : "AI-powered practice"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Generate Notes Button */}
      <Animated.View style={{ transform: [{ scale: notesScale }] }}>
        <TouchableOpacity
          className="p-4 border rounded-2xl active:scale-95"
          style={[
            canGenerate && notesState.status !== "generating"
              ? {
                  backgroundColor: COLORS.accent.gold,
                  borderColor: COLORS.accent.gold,
                  shadowColor: COLORS.accent.gold,
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }
              : styles.buttonDisabled,
          ]}
          onPress={handleNotesPress}
          disabled={notesState.status === "generating" || !canGenerate}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center gap-3">
            <View
              className="items-center justify-center w-12 h-12 rounded-full"
              style={styles.iconContainer}
            >
              {notesState.status === "generating" ? (
                <ActivityIndicator size="small" color={COLORS.text.primary} />
              ) : notesState.status === "success" ? (
                <CheckCircle2 size={24} color={COLORS.text.primary} />
              ) : (
                <NotebookPen size={24} color={COLORS.text.primary} />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold" style={styles.textPrimary}>
                {notesState.status === "generating"
                  ? "Generating..."
                  : notesState.status === "success"
                    ? "✓ Notes Ready"
                    : "Generate Notes"}
              </Text>
              <Text className="text-xs mt-0.5" style={styles.textPrimaryOpaque}>
                {notesState.status === "success"
                  ? "Tap to regenerate"
                  : "Study summaries"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
