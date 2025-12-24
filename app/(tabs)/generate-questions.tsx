// MVP_BYPASS: Removed auth and upgrade prompts, using ComingSoonModal for limits
import { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sparkles, Plus } from "lucide-react-native";
import { useQuestions } from "@/hooks/useQuestions";
import Button from "@/components/ui/Button";
import ComingSoonModal from "@/components/modals/ComingSoonModal";
import QuestionSetList from "@/components/questions/QuestionSetList";
import QuestionDisplay from "@/components/questions/QuestionDisplay";
import GenerateQuestionsModal from "@/components/questions/GenerateQuestionsModal";
import SearchBar from "@/components/ui/SearchBar";
import Dropdown from "@/components/ui/Dropdown";
import { SUBJECTS } from "@/constants";
import {
  loadQuestionsFromStorage,
  deleteQuestionFromStorage,
} from "@/services/storage/questions.storage";
import type { StoredQuestionSet } from "@/lib/types";

export default function GenerateQuestionsScreen() {
  const [questionSets, setQuestionSets] = useState<StoredQuestionSet[]>([]);
  const [loadingSets, setLoadingSets] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  const {
    subject,
    setSubject,
    topic,
    setTopic,
    difficulty,
    setDifficulty,
    questionCount,
    setQuestionCount,
    questions,
    loading,
    selectedAnswers,
    generateQuestions,
    selectAnswer,
    reset,
    canGenerate,
    quota,
    isDifficultyLocked,
    isQuestionCountLocked,
    loadFromParams,
    showComingSoon,
    setShowComingSoon,
  } = useQuestions();

  useEffect(() => {
    loadSets();
  }, []);

  const loadSets = async () => {
    setLoadingSets(true);
    const sets = await loadQuestionsFromStorage();
    setQuestionSets(sets);
    setLoadingSets(false);
  };

  const handleGenerate = async () => {
    await generateQuestions();
    setModalVisible(false);
    await loadSets();
  };

  const handleSelectSet = (set: StoredQuestionSet) => {
    loadFromParams({
      questions: set.questions,
      subject: set.subject,
      topic: set.topic,
      difficulty: set.difficulty,
      questionCount: set.questionCount.toString(),
    });
  };

  const handleDelete = async (id: string, label: string) => {
    await deleteQuestionFromStorage(id);
    await loadSets();
  };

  const handleReset = () => {
    reset();
    loadSets();
  };

  const filteredQuestionSets = questionSets.filter((set) => {
    const matchesSearch =
      set.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject =
      !filterSubject ||
      set.subject.toLowerCase() === filterSubject.toLowerCase();
    return matchesSearch && matchesSubject;
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* MVP_BYPASS: Removed AuthModal */}
      <GenerateQuestionsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        subject={subject}
        setSubject={setSubject}
        topic={topic}
        setTopic={setTopic}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        questionCount={questionCount}
        setQuestionCount={setQuestionCount}
        onGenerate={handleGenerate}
        loading={loading}
        canGenerate={Boolean(canGenerate)}
        isDifficultyLocked={isDifficultyLocked}
        isQuestionCountLocked={isQuestionCountLocked}
      />

      {/* MVP_BYPASS: Removed Free/Pro badge from header */}
      <View className="px-6 py-4 bg-white border-b-[1px] border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Sparkles size={28} color="#3b82f6" />
            <View className="flex-1 ml-3">
              <Text className="text-2xl font-bold text-gray-900">
                {questions.length > 0 ? "Practice Questions" : "Question Sets"}
              </Text>
              <Text className="mt-1 text-base text-gray-600">
                {questions.length > 0
                  ? `${questions.length} questions`
                  : `${questionSets.length} saved sets`}
              </Text>
            </View>
          </View>
        </View>
        {/* MVP_BYPASS: Usage progress bar commented out */}
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

      {questions.length === 0 ? (
        <ScrollView className="flex-1">
          <View className="px-6 py-4">
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search question sets..."
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

            {filteredQuestionSets.length === 0 && !loadingSets ? (
              <View className="items-center justify-center py-12">
                <Sparkles size={48} color="#d1d5db" />
                <Text className="mt-3 text-lg font-semibold text-gray-400">
                  {searchQuery || filterSubject
                    ? "No question sets found"
                    : "No question sets yet"}
                </Text>
                <Text className="mt-1 text-sm text-center text-gray-400">
                  {searchQuery || filterSubject
                    ? "Try adjusting your filters"
                    : "Generate your first question set"}
                </Text>
              </View>
            ) : (
              <View className="pb-6">
                <QuestionSetList
                  sets={filteredQuestionSets}
                  onSelect={handleSelectSet}
                  onDelete={handleDelete}
                  loading={loadingSets}
                />
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 px-6 py-6">
          <QuestionDisplay
            questions={questions}
            selectedAnswers={selectedAnswers}
            onAnswerSelect={selectAnswer}
            onReset={handleReset}
          />
        </View>
      )}

      <View className="px-6 py-4 bg-white border-t border-gray-200">
        <Button
          title="Generate New Questions"
          onPress={() => setModalVisible(true)}
          fullWidth
          icon={<Plus size={20} color="#fff" />}
        />
      </View>

      {/* MVP_BYPASS: Using ComingSoonModal instead of LimitReachedModal */}
      <ComingSoonModal
        visible={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        feature="questions"
      />
    </SafeAreaView>
  );
}
