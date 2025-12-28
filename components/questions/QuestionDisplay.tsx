import { View, Text, ScrollView, Pressable } from "react-native";
import { HelpCircle, BookOpen } from "lucide-react-native";
import { router } from "expo-router";
import Button from "@/components/ui/Button";
import QuestionCard from "@/components/ui/QuestionCard";
import type {
  Question,
  QuestionContext,
  QuestionToNoteContext,
} from "@/lib/types";

interface QuestionDisplayProps {
  questions: Question[];
  selectedAnswers: Record<string, string>;
  onAnswerSelect: (questionId: string, optionId: string) => void;
  onReset: () => void;
  subject?: string;
  topic?: string;
  difficulty?: string;
}

export default function QuestionDisplay({
  questions,
  selectedAnswers,
  onAnswerSelect,
  onReset,
  subject = "",
  topic = "",
  difficulty = "",
}: QuestionDisplayProps) {
  const handleAskDoubt = (question: Question) => {
    const context: QuestionContext = {
      questionId: question.id,
      questionText: question.question,
      options: question.options.map((opt) => opt.text),
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      subject,
      topic,
      difficulty,
    };

    // Navigate to ask-doubt screen with question context
    router.push({
      pathname: "/(tabs)/ask-doubt",
      params: {
        questionContext: JSON.stringify(context),
      },
    });
  };

  const handleGenerateNotes = () => {
    const context: QuestionToNoteContext = {
      subject,
      topic,
      difficulty,
    };

    // Navigate to notes screen with question context
    router.push({
      pathname: "/(tabs)/notes",
      params: {
        questionContext: JSON.stringify(context),
      },
    });
  };

  return (
    <ScrollView className="flex-1">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-lg font-semibold text-gray-900">
            Your Questions
          </Text>
          <Text className="text-sm text-gray-600">
            {questions.length} questions
          </Text>
        </View>
        <View className="flex-row gap-2">
          <Button
            title="Generate Notes"
            onPress={handleGenerateNotes}
            variant="outline"
            icon={<BookOpen size={16} color="#3b82f6" />}
          />
          <Button title="Back" onPress={onReset} variant="outline" />
        </View>
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
            onAnswerSelect={(optionId) => onAnswerSelect(question.id, optionId)}
          />

          {/* Ask Doubt Button */}
          <Pressable
            onPress={() => handleAskDoubt(question)}
            className="flex-row items-center justify-center px-4 py-3 mt-2 mb-4 rounded-xl bg-blue-600 active:bg-blue-700"
          >
            <HelpCircle size={20} color="white" />
            <Text className="ml-2 text-base font-semibold text-white">
              Ask Doubt about this question
            </Text>
          </Pressable>
        </View>
      ))}

      <View className="pb-6">
        <Button title="Back to Question Sets" onPress={onReset} fullWidth />
      </View>
    </ScrollView>
  );
}
