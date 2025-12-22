import { View, Text, ScrollView } from "react-native";
import Button from "@/components/ui/Button";
import QuestionCard from "@/components/ui/QuestionCard";
import type { Question } from "@/lib/types";

interface QuestionDisplayProps {
  questions: Question[];
  selectedAnswers: Record<string, string>;
  onAnswerSelect: (questionId: string, optionId: string) => void;
  onReset: () => void;
}

export default function QuestionDisplay({
  questions,
  selectedAnswers,
  onAnswerSelect,
  onReset,
}: QuestionDisplayProps) {
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
        <Button title="Back" onPress={onReset} variant="outline" />
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
        </View>
      ))}

      <View className="pb-6">
        <Button title="Back to History" onPress={onReset} fullWidth />
      </View>
    </ScrollView>
  );
}
