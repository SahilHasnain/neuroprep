import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import QuestionCard from "@/components/ui/QuestionCard";
import { Sparkles } from "lucide-react-native";
import { useState } from "react";
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

const topicsBySubject: Record<string, { label: string; value: string }[]> = {
  physics: [
    { label: "Mechanics", value: "mechanics" },
    { label: "Thermodynamics", value: "thermodynamics" },
    { label: "Optics", value: "optics" },
    { label: "Electromagnetism", value: "electromagnetism" },
  ],
  chemistry: [
    { label: "Organic Chemistry", value: "organic" },
    { label: "Inorganic Chemistry", value: "inorganic" },
    { label: "Physical Chemistry", value: "physical" },
  ],
  biology: [
    { label: "Cell Biology", value: "cell" },
    { label: "Genetics", value: "genetics" },
    { label: "Ecology", value: "ecology" },
    { label: "Human Physiology", value: "physiology" },
  ],
  mathematics: [
    { label: "Calculus", value: "calculus" },
    { label: "Algebra", value: "algebra" },
    { label: "Trigonometry", value: "trigonometry" },
    { label: "Coordinate Geometry", value: "coordinate" },
  ],
};

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
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});

  const handleGenerateQuestions = async () => {
    if (!subject || !topic || !difficulty || !questionCount) {
      return;
    }

    setLoading(true);
    setQuestions([]);
    setSelectedAnswers({});

    // Simulate API call
    setTimeout(() => {
      const mockQuestions: Question[] = Array.from(
        { length: parseInt(questionCount) },
        (_, i) => ({
          id: `q${i + 1}`,
          question: `Sample ${difficulty} question ${i + 1} about ${topic} in ${subject}. What is the correct explanation for this concept?`,
          options: [
            { id: `q${i + 1}a`, text: "Option A: First possible answer" },
            { id: `q${i + 1}b`, text: "Option B: Second possible answer" },
            { id: `q${i + 1}c`, text: "Option C: Third possible answer" },
            { id: `q${i + 1}d`, text: "Option D: Fourth possible answer" },
          ],
          correctAnswer: `q${i + 1}${["a", "b", "c", "d"][Math.floor(Math.random() * 4)]}`,
        })
      );

      setQuestions(mockQuestions);
      setLoading(false);
    }, 2000);
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
    setSubject("");
    setTopic("");
    setDifficulty("");
    setQuestionCount("");
  };

  const topics = subject ? topicsBySubject[subject] || [] : [];
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
                onSelect={(value) => {
                  setSubject(value);
                  setTopic("");
                }}
                placeholder="Choose a subject"
              />

              {subject && (
                <Dropdown
                  label="Select Topic"
                  value={topic}
                  options={topics}
                  onSelect={setTopic}
                  placeholder="Choose a topic"
                />
              )}

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
                  disabled={!canGenerate}
                  loading={loading}
                  fullWidth
                />
              </View>

              {!canGenerate && (
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



