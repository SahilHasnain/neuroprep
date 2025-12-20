import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import InputTopic from "@/components/ui/InputTopic";
import NoteCard from "@/components/ui/NoteCard";
import SearchBar from "@/components/ui/SearchBar";
import AuthModal from "@/components/ui/AuthModal";
import { getIdentity } from "@/utils/identity";
import {
  loadNotesFromStorage,
  saveNoteToStorage,
  deleteNoteFromStorage,
  formatNotesContent,
  type Note,
} from "@/utils";
import { BookOpen, Sparkles, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MathMarkdown from "@/components/shared/MathMarkdown";

const subjects = [
  { label: "Physics", value: "physics" },
  { label: "Chemistry", value: "chemistry" },
  { label: "Biology", value: "biology" },
  { label: "Mathematics", value: "mathematics" },
];

const noteLengths = [
  { label: "Brief (Key Points)", value: "brief" },
  { label: "Detailed (Comprehensive)", value: "detailed" },
  { label: "Exam Focused", value: "exam" },
];

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);

  const [generateConfig, setGenerateConfig] = useState({
    subject: "",
    topic: "",
    noteLength: "detailed",
  });

  // Load notes from AsyncStorage on mount
  useEffect(() => {
    const loadNotes = async () => {
      const storedNotes = await loadNotesFromStorage();
      setNotes(storedNotes);
    };
    loadNotes();
  }, []);

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject
      ? note.subject === filterSubject
      : true;
    return matchesSearch && matchesSubject;
  });

  const handleGenerateNotes = async () => {
    if (!generateConfig.subject || !generateConfig.topic.trim()) {
      Alert.alert("Error", "Please select subject and enter topic");
      return;
    }

    setLoading(true);

    try {
      const identity = await getIdentity();
      const response = await fetch(
        "https://6942afbd002f2d29fdce.fra.appwrite.run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-identity-type": identity.type,
            "x-identity-id": identity.id,
          },
          body: JSON.stringify({
            subject: generateConfig.subject,
            topic: generateConfig.topic,
            noteLength: generateConfig.noteLength,
          }),
        }
      );

      if (response.status === 402) {
        Alert.alert(
          "Limit Reached",
          "You've reached your daily limit. Please upgrade."
        );
        setAuthVisible(true);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to generate notes: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.message || "Invalid response from server");
      }

      const apiNotes = data.data;
      const content = formatNotesContent(apiNotes);

      const note: Note = {
        id: apiNotes.id || Date.now().toString(),
        title: generateConfig.topic,
        subject: generateConfig.subject,
        content: content,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };

      // Save to AsyncStorage with structured format
      await saveNoteToStorage(note, {
        subject: generateConfig.subject,
        topic: generateConfig.topic,
        noteLength: generateConfig.noteLength,
      });

      setNotes([note, ...notes]);
      setGenerateConfig({ subject: "", topic: "", noteLength: "detailed" });
      setIsModalVisible(false);
      Alert.alert("Success", "AI notes generated and saved!");
    } catch (err) {
      console.error("Error generating notes:", err);
      Alert.alert(
        "Error",
        err instanceof Error
          ? err.message
          : "Failed to generate notes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          // Remove from AsyncStorage
          await deleteNoteFromStorage(id);
          // Update UI state
          setNotes(notes.filter((note) => note.id !== id));
          setIsViewModalVisible(false);
        },
      },
    ]);
  };

  const handleViewNote = (note: Note) => {
    setSelectedNote(note);
    setIsViewModalVisible(true);
  };

  const canGenerate = generateConfig.subject && generateConfig.topic.trim();

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
          <Pressable
            onPress={() => setIsModalVisible(true)}
            className="p-3 bg-blue-500 rounded-full active:bg-blue-600"
          >
            <Sparkles size={24} color="#ffffff" />
          </Pressable>
        </View>
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
              options={[{ label: "All Subjects", value: "" }, ...subjects]}
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
                  onPress={() => handleViewNote(note)}
                  onDelete={() => handleDeleteNote(note.id)}
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
              options={subjects}
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
              options={noteLengths}
              onSelect={(value) =>
                setGenerateConfig({ ...generateConfig, noteLength: value })
              }
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
                    onPress={handleGenerateNotes}
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
                        {subjects.find((s) => s.value === selectedNote.subject)
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
                    onPress={() => handleDeleteNote(selectedNote.id)}
                    variant="outline"
                    fullWidth
                  />
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
