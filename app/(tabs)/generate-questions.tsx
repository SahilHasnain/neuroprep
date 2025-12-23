import { useState, useEffect } from "react";
import { View, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sparkles, Crown, Plus } from "lucide-react-native";
import { useQuestions } from "@/hooks/useQuestions";
import Button from "@/components/ui/Button";
import AuthModal from "@/components/ui/AuthModal";
import LimitReachedModal from "@/components/ui/LimitReachedModal";
import QuestionSetList from "@/components/questions/QuestionSetList";
import QuestionDisplay from "@/components/questions/QuestionDisplay";
import GenerateQuestionsModal from "@/components/questions/GenerateQuestionsModal";
import { loadQuestionsFromStorage, deleteQuestionFromStorage } from "@/services/storage/questions.storage";
import type { StoredQuestionSet } from "@/lib/types";

export default function GenerateQuestionsScreen() {
  const [questionSets, setQuestionSets] = useState<StoredQuestionSet[]>([]);
  const [loadingSets, setLoadingSets] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);

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
    error,
    selectedAnswers,
    generateQuestions,
    selectAnswer,
    reset,
    canGenerate,
    userPlan,
    quota,
    isDifficultyLocked,
    isQuestionCountLocked,
    loadFromParams,
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

  const showUpgradeAlert = () => {
    Alert.alert(
      "Upgrade to Pro",
      "Unlock all features with Pro plan",
      [
        { text: "Maybe Later", style: "cancel" },
        { text: "Upgrade Now", onPress: () => setAuthVisible(true) },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <AuthModal visible={authVisible} onClose={() => setAuthVisible(false)} />
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
        error={error}
        canGenerate={Boolean(canGenerate)}
        userPlan={userPlan}
        isDifficultyLocked={isDifficultyLocked}
        isQuestionCountLocked={isQuestionCountLocked}
        onUpgradePress={showUpgradeAlert}
      />

      <View className="px-6 py-4 bg-white border-b-[1px] border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Sparkles size={28} color="#3b82f6" />
            <View className="flex-1 ml-3">
              <Text className="text-2xl font-bold text-gray-900">
                {questions.length > 0 ? "Practice Questions" : "Question Sets"}
              </Text>
              <Text className="mt-1 text-base text-gray-600">
                {questions.length > 0 ? `${questions.length} questions` : `${questionSets.length} saved sets`}
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

      <View className="flex-1 px-6 py-6">
        {questions.length === 0 ? (
          <>
            <View className="mb-4">
              <Button
                title="Generate New Questions"
                onPress={() => setModalVisible(true)}
                fullWidth
                icon={<Plus size={20} color="#fff" />}
              />
            </View>
            <QuestionSetList
              sets={questionSets}
              onSelect={handleSelectSet}
              onDelete={handleDelete}
              loading={loadingSets}
            />
          </>
        ) : (
          <QuestionDisplay
            questions={questions}
            selectedAnswers={selectedAnswers}
            onAnswerSelect={selectAnswer}
            onReset={handleReset}
          />
        )}
      </View>

      {/* Limit Reached Modal */}
      <LimitReachedModal
        visible={error?.errorCode === 'DAILY_LIMIT_REACHED'}
        feature="questions"
        quota={quota || { used: 0, limit: 0 }}
        onUpgrade={showUpgradeAlert}
        onClose={() => {}}
      />
    </SafeAreaView>
  );
}
