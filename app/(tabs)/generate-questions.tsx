import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import InputTopic from "@/components/ui/InputTopic";
import QuestionCard from "@/components/ui/QuestionCard";
import { Sparkles } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Question {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
}

const subjects = [
  { label: "Physics", value: "physics" },
  { label: "Chemistry", value: "chemistry" },
  { label: "Biology", value: "biology" },
  { label: "Mathematics", value: "mathematics" },
];

const difficultyLevels = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

const questionCounts = [
  { label: "5 Questions", value: "5" },
  { label: "10 Questions", value: "10" },
  { label: "15 Questions", value: "15" },
  { label: "20 Questions", value: "20" },
];

export default function GenerateQuestionsScreen() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});

  const handleGenerateQuestions = async () => {
    // Validate inputs
    if (!subject || !topic || !difficulty || !questionCount) {
      return;
    }

    setLoading(true);
    setError(null);
    setQuestions([]);
    setSelectedAnswers({});

    try {
      const res = await fetch("https://69423cba001540dea615.fra.appwrite.run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          topic,
          difficulty,
          questionCount,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate questions: ${res.status}`);
      }

      const data = await res.json();

      // Validate response data
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error("Invalid response from server");
      }

      setQuestions(data);
    } catch (err) {
      console.error("Error generating questions:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate questions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleReset = () => {
    setQuestions([]);
    setSelectedAnswers({});
    setError(null);
    setSubject("");
    setTopic("");
    setDifficulty("");
    setQuestionCount("");
  };

  const canGenerate = subject && topic && difficulty && questionCount;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
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
                options={subjects}
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
                options={difficultyLevels}
                onSelect={setDifficulty}
                placeholder="Choose difficulty"
              />

              <Dropdown
                label="Number of Questions"
                value={questionCount}
                options={questionCounts}
                onSelect={setQuestionCount}
                placeholder="Choose count"
              />

              <View className="mt-6">
                <Button
                  title="Generate Questions"
                  onPress={handleGenerateQuestions}
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
                <Button title="Reset" onPress={handleReset} variant="outline" />
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
                      handleAnswerSelect(question.id, optionId)
                    }
                  />
                </View>
              ))}

              <View className="pb-6">
                <Button
                  title="Generate New Questions"
                  onPress={handleReset}
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
