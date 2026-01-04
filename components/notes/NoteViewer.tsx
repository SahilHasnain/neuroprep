import { View, Text, ScrollView, Pressable, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  X,
  FileQuestion,
  MessageCircleQuestion,
  BookMarked,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { THEME } from "@/constants/theme";
import { useState } from "react";
import { SUBJECTS } from "@/constants";
import { useRouter } from "expo-router";
import QuickSummary from "./QuickSummary";
import NoteSection from "./NoteSection";
import FormulaCard from "./FormulaCard";
import TipCard from "./TipCard";
import MathMarkdown from "@/components/shared/MathMarkdown";
import AskDoubtModal from "@/components/modals/AskDoubtModal";
import { useModalVisibility } from "@/hooks/useModalVisibility";
import type {
  NoteContext,
  DoubtContext,
  DoubtToNoteContext,
} from "@/lib/types/domain.types";

interface NoteViewerProps {
  visible: boolean;
  note: {
    id: string;
    title: string;
    subject: string;
    content: string;
    date: string;
  } | null;
  onClose: () => void;
  onGenerateQuestions?: (context: NoteContext) => void;
  onGenerateQuestionsFromDoubt?: (context: DoubtContext) => void;
  onGenerateNotesFromDoubt?: (context: DoubtToNoteContext) => void;
}

interface ParsedNote {
  quickSummary?: string;
  sections?: {
    heading: string;
    content: string;
    keyPoints: string[];
  }[];
  formulas?: {
    name: string;
    formula: string;
  }[];
  examTips?: string[];
}

export default function NoteViewer({
  visible,
  note,
  onClose,
  onGenerateQuestions,
  onGenerateQuestionsFromDoubt,
  onGenerateNotesFromDoubt,
}: NoteViewerProps) {
  const [doubtModalVisible, setDoubtModalVisible] = useState(false);
  const [noteContext, setNoteContext] = useState<NoteContext | null>(null);
  const router = useRouter();
  useModalVisibility("note-viewer-modal", visible);

  if (!note) return null;

  const handleGenerateQuestions = () => {
    if (onGenerateQuestions && note) {
      const context: NoteContext = {
        noteId: note.id,
        noteTitle: note.title,
        subject: note.subject,
        topic: note.title, // Using title as topic
        noteLength: "medium", // Default value
      };
      onGenerateQuestions(context);
    }
  };

  const handleCreateFlashcards = () => {
    if (note) {
      const noteContext = {
        noteId: note.id,
        subject: note.subject,
        topic: note.title,
        content: note.content,
      };

      // Navigate to flashcards tab with note context
      router.push({
        pathname: "/(tabs)/flashcards",
        params: {
          noteContext: JSON.stringify(noteContext),
        },
      });
    }
  };

  const handleAskDoubt = () => {
    if (note) {
      const context: NoteContext = {
        noteId: note.id,
        noteTitle: note.title,
        subject: note.subject,
        topic: note.title, // Using title as topic
        noteLength: "medium", // Default value
      };
      setNoteContext(context);
      setDoubtModalVisible(true);
    }
  };

  // Parse content to handle both new and old formats with error handling
  let parsedNote: ParsedNote = {};
  let isNewFormat = false;
  let fallbackContent = note.content || "";
  let parseError = false;

  try {
    // Try to parse as JSON (new format)
    const parsed = JSON.parse(note.content);
    parsedNote = parsed;
    isNewFormat = true;
  } catch {
    // Not JSON, treat as plain markdown (old format - backward compatibility)
    fallbackContent = note.content || "";
    // Check if content is empty or invalid
    if (!fallbackContent || fallbackContent.trim() === "") {
      parseError = true;
    }
  }

  // Validate parsed note has at least some content
  if (
    isNewFormat &&
    !parsedNote.quickSummary &&
    (!parsedNote.sections || parsedNote.sections.length === 0) &&
    (!parsedNote.formulas || parsedNote.formulas.length === 0) &&
    (!parsedNote.examTips || parsedNote.examTips.length === 0)
  ) {
    parseError = true;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="justify-end flex-1 bg-black/85">
        <SafeAreaView
          style={{
            backgroundColor: THEME.colors.background.primary,
            maxHeight: "90%",
          }}
          className="rounded-t-3xl"
          edges={["bottom"]}
        >
          {/* Sticky Header with Enhanced Visual Hierarchy */}
          <LinearGradient
            colors={["#2563eb", "#9333ea"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-4 py-3 border-b border-gray-700 rounded-t-2xl"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <View
                  className={`self-start px-2 py-1 mb-1 rounded-full bg-white/10`}
                >
                  <Text
                    className={`text-[11px] font-semibold uppercase tracking-wide text-white`}
                  >
                    {SUBJECTS.find((s) => s.value === note.subject)?.label ||
                      note.subject}
                  </Text>
                </View>
                <Text
                  className="text-lg font-bold leading-tight text-white"
                  numberOfLines={2}
                >
                  {note.title}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                className="p-1 rounded-md active:bg-white/10"
              >
                <X size={20} color="#ffffff" />
              </Pressable>
            </View>
          </LinearGradient>

          {/* Scrollable Content Area with Enhanced Spacing */}
          <ScrollView
            style={{ backgroundColor: THEME.colors.background.primary }}
            className="px-6 py-6"
          >
            {parseError ? (
              // Error state - show friendly message
              <View className="items-center justify-center py-12">
                <View className="items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-500/20">
                  <Text className="text-3xl">⚠️</Text>
                </View>
                <Text className="mb-2 text-lg font-bold text-center text-gray-100">
                  Unable to Display Note
                </Text>
                <Text className="mb-6 text-sm text-center text-gray-400 px-8">
                  This note appears to be incomplete or corrupted. Please try
                  generating it again.
                </Text>
                <Pressable
                  onPress={onClose}
                  className="px-6 py-3 rounded-lg overflow-hidden active:opacity-80"
                >
                  <LinearGradient
                    colors={["#2563eb", "#1d4ed8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="px-6 py-3"
                  >
                    <Text className="font-semibold text-white text-center">
                      Close
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : isNewFormat ? (
              <>
                {/* Quick Summary */}
                {parsedNote.quickSummary && (
                  <QuickSummary summary={parsedNote.quickSummary} />
                )}

                {/* Sections with Progressive Disclosure */}
                {parsedNote.sections && parsedNote.sections.length > 0 && (
                  <View className="mb-6">
                    {parsedNote.sections.map((section, index) => {
                      // Graceful degradation for malformed sections
                      if (!section || typeof section !== "object") {
                        return null;
                      }
                      return (
                        <NoteSection
                          key={index}
                          heading={section.heading || "Untitled Section"}
                          concept=""
                          content={section.content || ""}
                          keyPoints={
                            Array.isArray(section.keyPoints)
                              ? section.keyPoints
                              : []
                          }
                          example=""
                          defaultExpanded={index === 0}
                        />
                      );
                    })}
                  </View>
                )}

                {/* Formulas */}
                {parsedNote.formulas && parsedNote.formulas.length > 0 && (
                  <View className="mb-6">
                    <Text className="mb-4 text-lg font-bold text-gray-900">
                      🧮 Important Formulas
                    </Text>
                    {parsedNote.formulas.map((formula, index) => {
                      // Graceful degradation for malformed formulas
                      if (
                        !formula ||
                        typeof formula !== "object" ||
                        !formula.formula
                      ) {
                        return null;
                      }
                      return (
                        <FormulaCard
                          key={index}
                          name={formula.name || "Formula"}
                          formula={formula.formula}
                          whenToUse=""
                        />
                      );
                    })}
                  </View>
                )}

                {/* Exam Tips */}
                {parsedNote.examTips && parsedNote.examTips.length > 0 && (
                  <View className="mb-6">
                    <TipCard
                      tips={parsedNote.examTips.filter(
                        (tip) => tip && typeof tip === "string" && tip.trim()
                      )}
                    />
                  </View>
                )}

                {/* Fallback message if no content sections rendered */}
                {!parsedNote.quickSummary &&
                  (!parsedNote.sections || parsedNote.sections.length === 0) &&
                  (!parsedNote.formulas || parsedNote.formulas.length === 0) &&
                  (!parsedNote.examTips ||
                    parsedNote.examTips.length === 0) && (
                    <View className="items-center justify-center py-8">
                      <Text className="text-sm text-center text-gray-400">
                        This note appears to be empty. Try generating it again.
                      </Text>
                    </View>
                  )}
              </>
            ) : (
              // Fallback for old format - display as markdown
              <View className="mb-4">
                <MathMarkdown
                  style={{
                    body: {
                      color: "#e5e5e5",
                      fontSize: 15,
                      lineHeight: 24,
                    },
                    heading1: {
                      color: "#f5f5f5",
                      fontSize: 24,
                      fontWeight: "bold",
                      marginTop: 16,
                      marginBottom: 8,
                    },
                    heading2: {
                      color: "#e5e5e5",
                      fontSize: 20,
                      fontWeight: "bold",
                      marginTop: 14,
                      marginBottom: 6,
                    },
                    heading3: {
                      color: "#d4d4d4",
                      fontSize: 18,
                      fontWeight: "600",
                      marginTop: 12,
                      marginBottom: 4,
                    },
                    strong: { color: "#f5f5f5", fontWeight: "bold" },
                    em: { color: "#a3a3a3", fontStyle: "italic" },
                    code_inline: {
                      backgroundColor: "#1e1e1e",
                      color: "#60a5fa",
                      paddingHorizontal: 4,
                      paddingVertical: 2,
                      borderRadius: 4,
                      fontFamily: "monospace",
                    },
                    code_block: {
                      backgroundColor: "#1e1e1e",
                      color: "#e5e5e5",
                      padding: 12,
                      borderRadius: 8,
                      fontFamily: "monospace",
                      fontSize: 13,
                    },
                    fence: {
                      backgroundColor: "#1e1e1e",
                      color: "#e5e5e5",
                      padding: 12,
                      borderRadius: 8,
                      fontFamily: "monospace",
                      fontSize: 13,
                    },
                    blockquote: {
                      backgroundColor: "#1e3a8a",
                      borderLeftColor: "#3b82f6",
                      borderLeftWidth: 4,
                      paddingLeft: 12,
                      paddingVertical: 8,
                      marginVertical: 8,
                      borderRadius: 4,
                    },
                    bullet_list: { marginVertical: 4 },
                    ordered_list: { marginVertical: 4 },
                    list_item: { marginVertical: 2, color: "#e5e5e5" },
                    paragraph: {
                      marginVertical: 4,
                      color: "#d4d4d4",
                      lineHeight: 22,
                    },
                  }}
                >
                  {fallbackContent}
                </MathMarkdown>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons Section */}
          {!parseError && (
            <View
              style={{ backgroundColor: THEME.colors.background.secondary }}
              className="px-4 py-3 border-t border-gray-700"
            >
              <View className="flex-row gap-2 mb-2">
                <Pressable
                  onPress={handleGenerateQuestions}
                  className="flex-1 rounded-md overflow-hidden active:opacity-80"
                >
                  <LinearGradient
                    colors={["#2563eb", "#1d4ed8"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="flex-row items-center justify-center px-3 py-2"
                  >
                    <FileQuestion size={18} color="#fff" />
                    <Text className="ml-2 text-sm font-semibold text-white">
                      Generate Questions
                    </Text>
                  </LinearGradient>
                </Pressable>
                <Pressable
                  onPress={handleAskDoubt}
                  className="flex-1 flex-row items-center justify-center px-3 py-2 border border-blue-500 rounded-md bg-transparent active:bg-blue-500/10"
                >
                  <MessageCircleQuestion size={18} color="#60a5fa" />
                  <Text className="ml-2 text-sm font-semibold text-blue-400">
                    Ask Doubt
                  </Text>
                </Pressable>
              </View>
              <Pressable
                onPress={handleCreateFlashcards}
                className="rounded-md overflow-hidden active:opacity-80"
              >
                <LinearGradient
                  colors={["#9333ea", "#7e22ce"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="flex-row items-center justify-center px-3 py-2"
                >
                  <BookMarked size={18} color="#fff" />
                  <Text className="ml-2 text-sm font-semibold text-white">
                    Create Flashcards
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}
        </SafeAreaView>

        {/* Ask Doubt Modal */}
        {noteContext && (
          <AskDoubtModal
            visible={doubtModalVisible}
            onClose={() => setDoubtModalVisible(false)}
            noteContext={noteContext}
            onGenerateQuestions={onGenerateQuestionsFromDoubt}
            onGenerateNotes={onGenerateNotesFromDoubt}
          />
        )}
      </View>
    </Modal>
  );
}
