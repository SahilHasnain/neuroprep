import { View, Text, Pressable } from "react-native";
import { HelpCircle } from "lucide-react-native";
import MathMarkdown from "@/components/shared/MathMarkdown";
import type { QuestionContext } from "@/lib/types";

interface QuestionCardProps {
  question: {
    id: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
  };
  subject: string;
  topic: string;
  difficulty: string;
  onAskDoubt: (context: QuestionContext) => void;
}

export default function QuestionCard({
  question,
  subject,
  topic,
  difficulty,
  onAskDoubt,
}: QuestionCardProps) {
  const handleAskDoubt = () => {
    const context: QuestionContext = {
      questionId: question.id,
      questionText: question.questionText,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      subject,
      topic,
      difficulty,
    };
    onAskDoubt(context);
  };

  return (
    <View className="p-4 mb-4 bg-white rounded-2xl shadow-sm border-[1px] border-gray-200">
      {/* Question Text */}
      <MathMarkdown
        style={{
          body: {
            color: "#111827",
            fontSize: 16,
            lineHeight: 22,
            fontWeight: "600",
            marginBottom: 12,
          },
        }}
      >
        {question.questionText}
      </MathMarkdown>

      {/* Options */}
      <View className="mb-4">
        {question.options.map((option, index) => {
          const optionLetter = String.fromCharCode(65 + index);
          const isCorrect = question.correctAnswer === optionLetter;

          return (
            <View
              key={index}
              className={`flex-row items-center p-3 rounded-xl border-[1.5px] mb-2 ${
                isCorrect
                  ? "bg-green-50 border-green-500"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <View
                className={`w-6 h-6 rounded-full items-center justify-center mr-3 border-[1.5px] ${
                  isCorrect
                    ? "bg-green-500 border-green-500"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isCorrect ? "text-white" : "text-gray-600"
                  }`}
                >
                  {optionLetter}
                </Text>
              </View>
              <View className="flex-1">
                <MathMarkdown
                  style={{
                    body: {
                      fontSize: 15,
                      lineHeight: 20,
                      color: isCorrect ? "#065f46" : "#111827",
                      fontWeight: isCorrect ? "600" : "400",
                    },
                  }}
                >
                  {option}
                </MathMarkdown>
              </View>
            </View>
          );
        })}
      </View>

      {/* Correct Answer Indicator */}
      <View className="px-3 py-2 mb-3 rounded-lg bg-green-50 border-[1px] border-green-200">
        <Text className="text-sm font-semibold text-green-800">
          ✓ Correct Answer: {question.correctAnswer}
        </Text>
      </View>

      {/* Explanation */}
      {question.explanation && (
        <View className="px-3 py-2 mb-3 rounded-lg bg-blue-50 border-[1px] border-blue-200">
          <Text className="mb-1 text-sm font-semibold text-blue-800">
            💡 Explanation:
          </Text>
          <MathMarkdown
            style={{
              body: {
                fontSize: 14,
                lineHeight: 20,
                color: "#1e40af",
              },
            }}
          >
            {question.explanation}
          </MathMarkdown>
        </View>
      )}

      {/* Ask Doubt Button */}
      <Pressable
        onPress={handleAskDoubt}
        className="flex-row items-center justify-center px-4 py-3 mt-2 rounded-xl bg-blue-600 active:bg-blue-700"
      >
        <HelpCircle size={20} color="white" />
        <Text className="ml-2 text-base font-semibold text-white">
          Ask Doubt about this question
        </Text>
      </Pressable>
    </View>
  );
}
