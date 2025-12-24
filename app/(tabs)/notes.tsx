// MVP_BYPASS: Removed auth and upgrade prompts, using ComingSoonModal for limits
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

      {/* Generate AI Notes Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-white rounded-t-3xl">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <View className="flex-row items-center flex-1">
              <Sparkles size={24} color="#3b82f6" />
              <Text className="ml-2 text-xl font-bold text-gray-900">
                Generate AI Notes
              </Text>
            </View>
            <Pressable
              onPress={() => setIsModalVisible(false)}
              className="p-2 rounded-full active:bg-gray-100"
            >
              <X size={24} color="#6b7280" />
            </Pressable>
          </View>

          <ScrollView className="px-6 py-4" style={{ maxHeight: 500 }}>
            <View className="p-4 mb-4 rounded-xl bg-blue-50">
              <Text className="text-sm leading-5 text-blue-700">
                AI will generate comprehensive notes on your selected topic,
                tailored for NEET/JEE preparation.
              </Text>
            </View>

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
              <View className="flex-row gap-3 mt-2">
                <View className="flex-1">
                  <Button
                    title="Cancel"
                    onPress={() => setIsModalVisible(false)}
                    variant="outline"
                    fullWidth
                  />
                </View>
                <View className="flex-1">
                  <Button
                    title="Generate Notes"
                    onPress={generateNotes}
                    fullWidth
                    disabled={!canGenerate}
                  />
                </View>
              </View>
            )}

            {!canGenerate && !loading && (
              <Text className="mt-2 text-xs text-center text-gray-500">
                Please select subject and topic to generate notes
              </Text>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* View Note Modal - Using new NoteViewer component */}
      <NoteViewer
        visible={isViewModalVisible}
        note={selectedNote}
        onClose={() => setIsViewModalVisible(false)}
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
