import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import InputTopic from "@/components/ui/InputTopic";
import NoteCard from "@/components/ui/NoteCard";
import SearchBar from "@/components/ui/SearchBar";
import AuthModal from "@/components/ui/AuthModal";
import LimitReachedModal from "@/components/ui/LimitReachedModal";
import { useNotes } from "@/hooks/useNotes";
import { SUBJECTS, NOTE_LENGTHS } from "@/constants";
import { BookOpen, Sparkles, X, Crown, Lock, Plus } from "lucide-react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MathMarkdown from "@/components/shared/MathMarkdown";

export default function NotesScreen() {
  const router = useRouter();
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
    userPlan,
    quota,
    isNoteLengthLocked,
    error,
  } = useNotes();
  const [authVisible, setAuthVisible] = useState(false);

  const showUpgradeAlert = () => {
    Alert.alert(
      "Upgrade to Pro",
      "This feature is only available for Pro users. Upgrade now to unlock detailed and exam-focused notes!",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Upgrade", onPress: () => router.push("/(tabs)/subscription") },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <AuthModal visible={authVisible} onClose={() => setAuthVisible(false)} />
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
          <View className="flex-row items-center px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border-[1px] border-blue-200">
            {userPlan === "student_pro" && <Crown size={14} color="#3b82f6" />}
            <Text className="ml-1 text-xs font-semibold text-blue-600 uppercase">
              {userPlan === "student_pro" ? "Pro" : "Free"}
            </Text>
          </View>
        </View>
        {quota && (
          <View className="flex-row items-center justify-between px-3 py-2 mt-3 rounded-lg bg-gray-50">
            <Text className="text-sm text-gray-600">Daily Usage</Text>
            <Text className={`text-sm font-semibold ${quota.used >= quota.limit ? "text-red-600" : "text-gray-900"}`}>
              {quota.used}/{quota.limit}
            </Text>
          </View>
        )}
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
                if (isNoteLengthLocked(value)) {
                  showUpgradeAlert();
                } else {
                  setGenerateConfig({ ...generateConfig, noteLength: value });
                }
              }}
              onLockedPress={showUpgradeAlert}
              placeholder="Choose note type"
            />

            {loading ? (
              <View className="py-8">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-3 text-sm text-center text-gray-600">
                  AI is generating your notes...
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

      {/* View Note Modal */}
      <Modal
        visible={isViewModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsViewModalVisible(false)}
      >
        <View className="justify-end flex-1 bg-black/50">
          <View className="bg-white rounded-t-3xl">
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
              <Text
                className="flex-1 mr-3 text-xl font-bold text-gray-900"
                numberOfLines={1}
              >
                {selectedNote?.title}
              </Text>
              <Pressable
                onPress={() => setIsViewModalVisible(false)}
                className="p-2 rounded-full active:bg-gray-100"
              >
                <X size={24} color="#6b7280" />
              </Pressable>
            </View>

            <ScrollView className="px-6 py-4" style={{ maxHeight: 500 }}>
              {selectedNote && (
                <>
                  <View className="mb-4">
                    <Text className="mb-2 text-sm font-semibold text-gray-500">
                      Subject
                    </Text>
                    <View
                      className={`self-start px-4 py-2 rounded-full ${
                        selectedNote.subject === "physics"
                          ? "bg-blue-100"
                          : selectedNote.subject === "chemistry"
                            ? "bg-purple-100"
                            : selectedNote.subject === "biology"
                              ? "bg-green-100"
                              : "bg-orange-100"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          selectedNote.subject === "physics"
                            ? "text-blue-700"
                            : selectedNote.subject === "chemistry"
                              ? "text-purple-700"
                              : selectedNote.subject === "biology"
                                ? "text-green-700"
                                : "text-orange-700"
                        }`}
                      >
                        {SUBJECTS.find((s) => s.value === selectedNote.subject)
                          ?.label || selectedNote.subject}
                      </Text>
                    </View>
                  </View>

                  <View className="mb-4">
                    <Text className="mb-2 text-sm font-semibold text-gray-500">
                      Date Created
                    </Text>
                    <Text className="text-base text-gray-700">
                      {selectedNote.date}
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="mb-2 text-sm font-semibold text-gray-500">
                      Content
                    </Text>
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
                      {selectedNote.content}
                    </MathMarkdown>
                  </View>

                  <Button
                    title="Delete Note"
                    onPress={() => deleteNote(selectedNote.id)}
                    variant="outline"
                    fullWidth
                  />
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Limit Reached Modal */}
      <LimitReachedModal
        visible={error?.errorCode === 'DAILY_LIMIT_REACHED'}
        feature="notes"
        quota={quota}
        onUpgrade={showUpgradeAlert}
        onClose={() => {}}
      />

      {/* Floating Create Button */}
      <Pressable
        onPress={() => {
          if (quota.used >= quota.limit) {
            // Modal will show automatically via error state
          } else {
            setIsModalVisible(true);
          }
        }}
        className="absolute bottom-6 right-6 p-4 bg-blue-500 rounded-full shadow-lg active:bg-blue-600"
        style={{
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
        }}
      >
        <Plus size={28} color="#ffffff" strokeWidth={2.5} />
      </Pressable>
    </SafeAreaView>
  );
}
