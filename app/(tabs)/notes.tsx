// MVP_BYPASS: Removed auth and upgrade prompts, using ComingSoonModal for limits
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import InputTopic from "@/components/ui/InputTopic";
import NoteCard from "@/components/ui/NoteCard";
import SearchBar from "@/components/ui/SearchBar";
import ComingSoonModal from "@/components/modals/ComingSoonModal";
import { NoteViewer } from "@/components/notes";
import { useNotes } from "@/hooks/useNotes";
import { SUBJECTS, NOTE_LENGTHS } from "@/constants";
import { BookOpen, Sparkles, X, Plus } from "lucide-react-native";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Keyboard,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import type {
  NoteContext,
  QuestionToNoteContext,
  DoubtToNoteContext,
} from "@/lib/types/domain.types";
import { Info } from "lucide-react-native";
import {
  validateQuestionToNoteContext,
  validateDoubtToNoteContext,
} from "@/utils/contextValidation";

// Motivational messages for loading state
const motivationalMessages = [
  "Breaking down complex concepts into simple ideas...",
  "Organizing key points for easy understanding...",
  "Creating exam-focused content just for you...",
  "Crafting clear explanations to boost your confidence...",
  "Preparing practical examples to help you learn...",
  "Structuring notes for quick revision...",
  "Making difficult topics easier to grasp...",
  "Building your personalized study guide...",
];

const getMotivationalMessage = () => {
  return motivationalMessages[
    Math.floor(Math.random() * motivationalMessages.length)
  ];
};

export default function NotesScreen() {
  const {
    notes,
    searchQuery,
    setSearchQuery,
    filterSubject,
    setFilterSubject,
    isModalVisible,
    setIsModalVisible,
    isViewModalVisible,
    setIsViewModalVisible,
    selectedNote,
    loading,
    generateConfig,
    setGenerateConfig,
    filteredNotes,
    generateNotes,
    deleteNote,
    viewNote,
    canGenerate,
    quota,
    isNoteLengthLocked,
    showComingSoon,
    setShowComingSoon,
  } = useNotes();

  const [questionContext, setQuestionContext] =
    useState<QuestionToNoteContext | null>(null);
  const [doubtContext, setDoubtContext] = useState<DoubtToNoteContext | null>(
    null
  );
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Get route params
  const params = useLocalSearchParams();

  // Keyboard listeners
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleGenerateNotes = async () => {
    await generateNotes();
    // Clear contexts after generating
    setQuestionContext(null);
    setDoubtContext(null);
  };

  const handleGenerateQuestions = (context: NoteContext) => {
    // Close the note viewer
    setIsViewModalVisible(false);

    // Navigate to generate-questions tab with note context
    router.push({
      pathname: "/(tabs)/generate-questions",
      params: {
        noteContext: JSON.stringify(context),
      },
    });
  };

  // Handle question context from navigation params
  useEffect(() => {
    if (params.questionContext) {
      try {
        const parsedContext = JSON.parse(params.questionContext as string);

        // Validate context before using it
        if (validateQuestionToNoteContext(parsedContext)) {
          setQuestionContext(parsedContext);

          // Auto-fill subject and topic from question context
          setGenerateConfig({
            subject: parsedContext.subject,
            topic: parsedContext.topic,
            noteLength: "medium",
          });

          // Open modal automatically
          setIsModalVisible(true);
        } else {
          console.error(
            "Invalid question context received, continuing without context"
          );
        }
      } catch (err) {
        console.error("Error parsing question context:", err);
        // Graceful degradation - continue without context
      }
    }
  }, [params.questionContext]);

  // Handle doubt context from navigation params
  useEffect(() => {
    if (params.doubtContext) {
      try {
        const parsedContext = JSON.parse(params.doubtContext as string);

        // Validate context before using it
        if (validateDoubtToNoteContext(parsedContext)) {
          setDoubtContext(parsedContext);

          // Auto-fill subject and topic from doubt context
          setGenerateConfig({
            subject: parsedContext.subject,
            topic: parsedContext.topic,
            noteLength: "medium",
          });

          // Open modal automatically
          setIsModalVisible(true);
        } else {
          console.error(
            "Invalid doubt context received, continuing without context"
          );
        }
      } catch (err) {
        console.error("Error parsing doubt context:", err);
        // Graceful degradation - continue without context
      }
    }
  }, [params.doubtContext]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* MVP_BYPASS: Removed AuthModal */}
      {/* MVP_BYPASS: Removed Free/Pro badge from header */}
      <View className="px-6 py-4 bg-white border-b-[1px] border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <BookOpen size={28} color="#3b82f6" />
            <View className="flex-1 ml-3">
              <Text className="text-2xl font-bold text-gray-900">AI Notes</Text>
              <Text className="mt-1 text-base text-gray-600">
                {notes.length} {notes.length === 1 ? "note" : "notes"} generated
              </Text>
            </View>
          </View>
        </View>
        {/* {quota && (
          <View className="flex-row items-center justify-between px-3 py-2 mt-3 rounded-lg bg-gray-50">
            <Text className="text-sm text-gray-600">Daily Usage</Text>
            <Text
              className={`text-sm font-semibold ${quota.used >= quota.limit ? "text-red-600" : "text-gray-900"}`}
            >
              {quota.used}/{quota.limit}
            </Text>
          </View>
        )} */}
      </View>

      <ScrollView className="flex-1">
        <View className="px-6 py-4">
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search notes..."
          />

          <View className="mb-4">
            <Dropdown
              label="Filter by Subject"
              value={filterSubject}
              options={[{ label: "All Subjects", value: "" }, ...SUBJECTS]}
              onSelect={setFilterSubject}
              placeholder="All Subjects"
            />
          </View>

          {filteredNotes.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Sparkles size={48} color="#d1d5db" />
              <Text className="mt-3 text-lg font-semibold text-gray-400">
                {searchQuery || filterSubject
                  ? "No notes found"
                  : "No AI notes yet"}
              </Text>
              <Text className="mt-1 text-sm text-center text-gray-400">
                {searchQuery || filterSubject
                  ? "Try adjusting your filters"
                  : "Generate your first AI-powered notes"}
              </Text>
            </View>
          ) : (
            <View className="pb-6">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  title={note.title}
                  subject={note.subject}
                  content={note.content}
                  date={note.date}
                  onPress={() => viewNote(note)}
                  onDelete={() => deleteNote(note.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Generate AI Notes Modal - Bottom Sheet */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View
          className="flex-1 bg-black/50"
          onTouchEnd={() => setIsModalVisible(false)}
        >
          <View className="flex-1" />
          <View
            className="bg-white rounded-t-3xl"
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View className="px-6 py-4 bg-white border-b-[1px] border-gray-200 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-900">
                Generate AI Notes
              </Text>
              <Pressable
                onPress={() => setIsModalVisible(false)}
                className="p-2"
              >
                <X size={24} color="#000" />
              </Pressable>
            </View>

            <ScrollView
              className="px-6 py-6"
              style={{ maxHeight: keyboardHeight > 0 ? 300 : 500 }}
            >
              {/* Context Indicator */}
              {(questionContext || doubtContext) && (
                <View className="mb-4 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg flex-row items-center">
                  <Info size={16} color="#2563eb" />
                  <Text className="ml-2 text-sm text-blue-700 flex-1">
                    From {questionContext ? "Questions" : "Doubts"}:{" "}
                    {questionContext?.topic || doubtContext?.topic}
                  </Text>
                </View>
              )}

              <Dropdown
                label="Select Subject"
                value={generateConfig.subject}
                options={SUBJECTS}
                onSelect={(value) =>
                  setGenerateConfig({ ...generateConfig, subject: value })
                }
                placeholder="Choose a subject"
              />

              <InputTopic
                label="Enter Topic"
                value={generateConfig.topic}
                onChangeText={(value) =>
                  setGenerateConfig({ ...generateConfig, topic: value })
                }
                placeholder="e.g., Thermodynamics, Cell Division"
              />

              <Dropdown
                label="Note Type"
                value={generateConfig.noteLength}
                options={NOTE_LENGTHS.map((option) => ({
                  ...option,
                  disabled: isNoteLengthLocked(option.value),
                }))}
                onSelect={(value) => {
                  // MVP_BYPASS: Removed upgrade alert, just set the value
                  setGenerateConfig({ ...generateConfig, noteLength: value });
                }}
                placeholder="Choose note type"
              />

              {loading ? (
                <View className="py-8">
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text className="mt-3 text-sm font-semibold text-center text-gray-900">
                    AI is generating your notes...
                  </Text>
                  <Text className="mt-2 text-xs text-center text-gray-600">
                    {getMotivationalMessage()}
                  </Text>
                </View>
              ) : (
                <View className="mt-6">
                  <Button
                    title="Generate Notes"
                    onPress={handleGenerateNotes}
                    loading={loading}
                    fullWidth
                  />
                </View>
              )}

              {!canGenerate && !loading && (
                <Text className="mt-3 text-sm text-center text-gray-500">
                  Please select subject and topic to generate notes
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* View Note Modal - Using new NoteViewer component */}
      <NoteViewer
        visible={isViewModalVisible}
        note={selectedNote}
        onClose={() => setIsViewModalVisible(false)}
        onGenerateQuestions={handleGenerateQuestions}
      />

      {/* MVP_BYPASS: Using ComingSoonModal instead of LimitReachedModal */}
      <ComingSoonModal
        visible={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        feature="notes"
      />

      <View className="px-6 py-4 bg-white border-t border-gray-200">
        <Button
          title="Generate Notes"
          onPress={() => {
            if (quota.used >= quota.limit) {
              return;
            }
            setIsModalVisible(true);
          }}
          fullWidth
          icon={<Plus size={20} color="#fff" />}
        />
      </View>
    </SafeAreaView>
  );
}
