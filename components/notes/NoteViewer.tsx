import { View, Text, ScrollView, Pressable, Modal } from "react-native";
import { X } from "lucide-react-native";
import { SUBJECTS } from "@/constants";
import QuickSummary from "./QuickSummary";
import NoteSection from "./NoteSection";
import FormulaCard from "./FormulaCard";
import TipCard from "./TipCard";
import MathMarkdown from "@/components/shared/MathMarkdown";

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
}

interface ParsedNote {
  quickSummary?: string;
  sections?: Array<{
    heading: string;
    content: string;
    keyPoints: string[];
  }>;
  formulas?: Array<{
    name: string;
    formula: string;
  }>;
  examTips?: string[];
}

export default function NoteViewer({
  visible,
  note,
  onClose,
}: NoteViewerProps) {
  if (!note) return null;

  // Subject color mapping
  const subjectColors: Record<string, { bg: string; text: string }> = {
    physics: { bg: "bg-blue-100", text: "text-blue-700" },
    chemistry: { bg: "bg-purple-100", text: "text-purple-700" },
    biology: { bg: "bg-green-100", text: "text-green-700" },
    mathematics: { bg: "bg-orange-100", text: "text-orange-700" },
  };

  const colors = subjectColors[note.subject?.toLowerCase()] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
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
  } catch (error) {
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
      <View className="justify-end flex-1 bg-black/50">
        <View className="bg-white rounded-t-3xl" style={{ maxHeight: "90%" }}>
          {/* Sticky Header with Enhanced Visual Hierarchy */}
          <View className="px-6 py-4 bg-white border-b-2 border-gray-100 rounded-t-3xl shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <View
                  className={`self-start px-3 py-1.5 mb-2 rounded-full ${colors.bg} shadow-sm`}
                >
                  <Text
                    className={`text-xs font-bold uppercase tracking-wide ${colors.text}`}
                  >
                    {SUBJECTS.find((s) => s.value === note.subject)?.label ||
                      note.subject}
                  </Text>
                </View>
                <Text
                  className="text-xl font-bold leading-tight text-gray-900"
                  numberOfLines={2}
                >
                  {note.title}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                className="p-2 rounded-full active:bg-gray-100"
              >
                <X size={24} color="#6b7280" />
              </Pressable>
            </View>
          </View>

          {/* Scrollable Content Area with Enhanced Spacing */}
          <ScrollView className="px-6 py-6">
            {parseError ? (
              // Error state - show friendly message
              <View className="items-center justify-center py-12">
                <View className="items-center justify-center w-16 h-16 mb-4 rounded-full bg-red-100">
                  <Text className="text-3xl">⚠️</Text>
                </View>
                <Text className="mb-2 text-lg font-bold text-center text-gray-900">
                  Unable to Display Note
                </Text>
                <Text className="mb-6 text-sm text-center text-gray-600 px-8">
                  This note appears to be incomplete or corrupted. Please try
                  generating it again.
                </Text>
                <Pressable
                  onPress={onClose}
                  className="px-6 py-3 rounded-lg bg-blue-600 active:bg-blue-700"
                >
                  <Text className="font-semibold text-white">Close</Text>
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
                      <Text className="text-sm text-center text-gray-500">
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
                      color: "#374151",
                      fontSize: 15,
                      lineHeight: 24,
                    },
                    heading1: {
                      color: "#111827",
                      fontSize: 24,
                      fontWeight: "bold",
                      marginTop: 16,
                      marginBottom: 8,
                    },
                    heading2: {
                      color: "#1f2937",
                      fontSize: 20,
                      fontWeight: "bold",
                      marginTop: 14,
                      marginBottom: 6,
                    },
                    heading3: {
                      color: "#374151",
                      fontSize: 18,
                      fontWeight: "600",
                      marginTop: 12,
                      marginBottom: 4,
                    },
                    strong: { color: "#1f2937", fontWeight: "bold" },
                    em: { color: "#4b5563", fontStyle: "italic" },
                    code_inline: {
                      backgroundColor: "#f3f4f6",
                      color: "#dc2626",
                      paddingHorizontal: 4,
                      paddingVertical: 2,
                      borderRadius: 4,
                      fontFamily: "monospace",
                    },
                    code_block: {
                      backgroundColor: "#f9fafb",
                      color: "#111827",
                      padding: 12,
                      borderRadius: 8,
                      fontFamily: "monospace",
                      fontSize: 13,
                    },
                    fence: {
                      backgroundColor: "#f9fafb",
                      color: "#111827",
                      padding: 12,
                      borderRadius: 8,
                      fontFamily: "monospace",
                      fontSize: 13,
                    },
                    blockquote: {
                      backgroundColor: "#dbeafe",
                      borderLeftColor: "#3b82f6",
                      borderLeftWidth: 4,
                      paddingLeft: 12,
                      paddingVertical: 8,
                      marginVertical: 8,
                      borderRadius: 4,
                    },
                    bullet_list: { marginVertical: 4 },
                    ordered_list: { marginVertical: 4 },
                    list_item: { marginVertical: 2, color: "#374151" },
                    paragraph: {
                      marginVertical: 4,
                      color: "#4b5563",
                      lineHeight: 22,
                    },
                  }}
                >
                  {fallbackContent}
                </MathMarkdown>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
