import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import NoteCard from "@/components/ui/NoteCard";
import SearchBar from "@/components/ui/SearchBar";
import { BookOpen, Sparkles, X } from "lucide-react-native";
import { useState } from "react";
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

interface Note {
  id: string;
  title: string;
  subject: string;
  content: string;
  date: string;
}

const subjects = [
  { label: "Physics", value: "physics" },
  { label: "Chemistry", value: "chemistry" },
  { label: "Biology", value: "biology" },
  { label: "Mathematics", value: "mathematics" },
];

const topicsBySubject: Record<string, { label: string; value: string }[]> = {
  physics: [
    { label: "Mechanics", value: "mechanics" },
    { label: "Thermodynamics", value: "thermodynamics" },
    { label: "Optics", value: "optics" },
    { label: "Electromagnetism", value: "electromagnetism" },
    { label: "Modern Physics", value: "modern_physics" },
  ],
  chemistry: [
    { label: "Organic Chemistry", value: "organic" },
    { label: "Inorganic Chemistry", value: "inorganic" },
    { label: "Physical Chemistry", value: "physical" },
    { label: "Chemical Bonding", value: "bonding" },
  ],
  biology: [
    { label: "Cell Biology", value: "cell" },
    { label: "Genetics", value: "genetics" },
    { label: "Ecology", value: "ecology" },
    { label: "Human Physiology", value: "physiology" },
    { label: "Plant Physiology", value: "plant" },
  ],
  mathematics: [
    { label: "Calculus", value: "calculus" },
    { label: "Algebra", value: "algebra" },
    { label: "Trigonometry", value: "trigonometry" },
    { label: "Coordinate Geometry", value: "coordinate" },
    { label: "Vectors", value: "vectors" },
  ],
};

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

  const [generateConfig, setGenerateConfig] = useState({
    subject: "",
    topic: "",
    noteLength: "detailed",
  });

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
    if (!generateConfig.subject || !generateConfig.topic) {
      Alert.alert("Error", "Please select subject and topic");
      return;
    }

    setLoading(true);

    try {
      // Mock AI response - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const topicLabel =
        topicsBySubject[generateConfig.subject]?.find(
          (t) => t.value === generateConfig.topic
        )?.label || generateConfig.topic;

      const mockContent = generateMockNoteContent(
        generateConfig.subject,
        topicLabel,
        generateConfig.noteLength
      );

      const note: Note = {
        id: Date.now().toString(),
        title: topicLabel,
        subject: generateConfig.subject,
        content: mockContent,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };

      setNotes([note, ...notes]);
      setGenerateConfig({ subject: "", topic: "", noteLength: "detailed" });
      setIsModalVisible(false);
      Alert.alert("Success", "AI notes generated successfully!");
    } catch (err) {
      Alert.alert("Error", "Failed to generate notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateMockNoteContent = (
    subject: string,
    topic: string,
    length: string
  ): string => {
    const lengthMap = {
      brief: "Key concepts and formulas for quick revision.",
      detailed:
        "Comprehensive explanation with examples, derivations, and important concepts for NEET/JEE preparation.",
      exam: "Exam-focused notes with important questions, tips, and frequently asked concepts.",
    };

    return `📚 AI-Generated Notes on ${topic}

${lengthMap[length as keyof typeof lengthMap]}

## Introduction
This topic is crucial for NEET/JEE exams. Understanding the fundamental concepts and their applications is essential for scoring well.

## Key Concepts
• Fundamental principles and definitions
• Important formulas and equations
• Real-world applications
• Common misconceptions to avoid

## Important Points
✓ Master the basic concepts before moving to advanced topics
✓ Practice numerical problems regularly
✓ Understand the derivations, not just memorize
✓ Connect concepts with previous topics

## Exam Tips
• This topic appears in 3-5 questions every year
• Focus on conceptual clarity
• Practice previous year questions
• Time management is crucial

## Practice Questions
These concepts are frequently tested in:
- Multiple choice questions
- Numerical problems
- Assertion-reasoning questions

## Summary
Focus on understanding rather than memorization. Regular revision and practice will help you master this topic.`;
  };

  const handleDeleteNote = (id: string) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
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

  const topics = generateConfig.subject
    ? topicsBySubject[generateConfig.subject] || []
    : [];
  const canGenerate = generateConfig.subject && generateConfig.topic;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-6 py-4 bg-white border-b-[1px] border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <BookOpen size={28} color="#3b82f6" />
            <View className="flex-1 ml-3">
              <Text className="text-2xl font-bold text-gray-900">
                AI Notes
              </Text>
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
              options={[
                { label: "All Subjects", value: "" },
                ...subjects,
              ]}
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
        <View className="justify-end flex-1 bg-black/50">
          <View className="bg-white rounded-t-3xl">
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
                onSelect={(value) => {
                  setGenerateConfig({ ...generateConfig, subject: value, topic: "" });
                }}
                placeholder="Choose a subject"
              />

              {generateConfig.subject && (
                <Dropdown
                  label="Select Topic"
                  value={generateConfig.topic}
                  options={topics}
                  onSelect={(value) =>
                    setGenerateConfig({ ...generateConfig, topic: value })
                  }
                  placeholder="Choose a topic"
                />
              )}

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
              <Text className="flex-1 mr-3 text-xl font-bold text-gray-900" numberOfLines={1}>
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
                    <Text className="text-base leading-6 text-gray-700">
                      {selectedNote.content}
                    </Text>
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