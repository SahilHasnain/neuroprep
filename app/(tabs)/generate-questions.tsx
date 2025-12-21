import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import InputTopic from "@/components/ui/InputTopic";
import QuestionCard from "@/components/ui/QuestionCard";
import AuthModal from "@/components/ui/AuthModal";
import { useQuestions } from "@/hooks/useQuestions";
import { SUBJECTS, DIFFICULTY_LEVELS, QUESTION_COUNTS } from "@/constants";
import { Sparkles } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GenerateQuestionsScreen() {
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
  } = useQuestions();
  const [authVisible, setAuthVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <AuthModal visible={authVisible} onClose={() => setAuthVisible(false)} />
      <ScrollView className="flex-1">
        <View className="px-6 py-4 bg-white border-b-[1px] border-gray-200">
          <View className="flex-row items-center">
            <Sparkles size={28} color="#3b82f6" />
            <View className="flex-1 ml-3">
              <Text className="text-2xl font-bold text-gray-900">
                Generate Questions
              </Text>
              <Text className="mt-1 text-base text-gray-600">
                Create custom practice questions
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 py-6">
          {questions.length === 0 ? (
            <View>
              <Text className="mb-4 text-lg font-semibold text-gray-900">
                Configure Your Questions
              </Text>

              <Dropdown
                label="Select Subject"
                value={subject}
                options={SUBJECTS}
                onSelect={setSubject}
                placeholder="Choose a subject"
              />

              <InputTopic
                label="Enter Topic"
                value={topic}
                onChangeText={setTopic}
                placeholder="e.g., Newton's Laws, Organic Reactions"
              />

              <Dropdown
                label="Difficulty Level"
                value={difficulty}
                options={DIFFICULTY_LEVELS}
                onSelect={setDifficulty}
                placeholder="Choose difficulty"
              />

              <Dropdown
                label="Number of Questions"
                value={questionCount}
                options={QUESTION_COUNTS}
                onSelect={setQuestionCount}
                placeholder="Choose count"
              />

              <View className="mt-6">
                <Button
                  title="Generate Questions"
                  onPress={generateQuestions}
                  loading={loading}
                  fullWidth
                />
              </View>

              {error && (
                <View className="mt-3 p-3 bg-red-50 rounded-xl border-[1px] border-red-200">
                  <Text className="text-sm text-center text-red-600">
                    {error}
                  </Text>
                </View>
              )}

              {!canGenerate && !error && (
                <Text className="mt-3 text-sm text-center text-gray-500">
                  Please fill all fields to generate questions
                </Text>
              )}
            </View>
          ) : (
            <View>
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-lg font-semibold text-gray-900">
                    Your Questions
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {questions.length} questions generated
                  </Text>
                </View>
                <Button title="Reset" onPress={reset} variant="outline" />
              </View>

              {questions.map((question, index) => (
                <View key={question.id} className="mb-2">
                  <Text className="mb-2 text-sm font-medium text-gray-600">
                    Question {index + 1} of {questions.length}
                  </Text>
                  <QuestionCard
                    question={question.question}
                    options={question.options}
                    correctAnswer={question.correctAnswer}
                    selectedAnswer={selectedAnswers[question.id]}
                    onAnswerSelect={(optionId) =>
                      selectAnswer(question.id, optionId)
                    }
                  />
                </View>
              ))}

              <View className="pb-6">
                <Button
                  title="Generate New Questions"
                  onPress={reset}
                  fullWidth
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
