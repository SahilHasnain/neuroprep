import clsx from "clsx";
import { CheckCircle2, Circle } from "lucide-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Button from "./Button";

interface Option {
  id: string;
  text: string;
  isCorrect?: boolean;
}

interface QuestionCardProps {
  question: string;
  options: Option[];
  correctAnswer?: string;
  showAnswer?: boolean;
  onAnswerSelect?: (optionId: string) => void;
  selectedAnswer?: string;
}

export default function QuestionCard({
  question,
  options,
  correctAnswer,
  showAnswer = false,
  onAnswerSelect,
  selectedAnswer,
}: QuestionCardProps) {
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const handleOptionPress = (optionId: string) => {
    if (onAnswerSelect && !isAnswerRevealed) {
      onAnswerSelect(optionId);
    }
  };

  const handleRevealAnswer = () => {
    setIsAnswerRevealed(true);
  };

  return (
    <View className="p-4 mb-4 bg-white rounded-2xl shadow-sm border-[1px] border-gray-200">
      <Text className="mb-4 text-base font-medium leading-6 text-gray-900">
        {question}
      </Text>

      <View className="space-y-2">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option.id;
          const isCorrectOption = correctAnswer === option.id;
          const shouldHighlight = isAnswerRevealed || showAnswer;

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleOptionPress(option.id)}
              disabled={isAnswerRevealed || showAnswer}
              className={clsx(
                "flex-row items-center p-3 rounded-xl border-[1.5px] mb-2",
                shouldHighlight &&
                  isCorrectOption &&
                  "bg-green-50 border-green-500",
                shouldHighlight &&
                  isSelected &&
                  !isCorrectOption &&
                  "bg-red-50 border-red-500",
                !shouldHighlight && isSelected && "bg-blue-50 border-blue-500",
                !shouldHighlight && !isSelected && "bg-gray-50 border-gray-200"
              )}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className={clsx(
                    "w-6 h-6 rounded-full items-center justify-center mr-3 border-[1.5px]",
                    shouldHighlight &&
                      isCorrectOption &&
                      "bg-green-500 border-green-500",
                    shouldHighlight &&
                      isSelected &&
                      !isCorrectOption &&
                      "bg-red-500 border-red-500",
                    !shouldHighlight &&
                      isSelected &&
                      "bg-blue-500 border-blue-500",
                    !shouldHighlight &&
                      !isSelected &&
                      "bg-white border-gray-300"
                  )}
                >
                  {shouldHighlight && isCorrectOption ? (
                    <CheckCircle2 size={16} color="#ffffff" />
                  ) : (
                    <Text
                      className={clsx(
                        "text-xs font-semibold",
                        isSelected && !shouldHighlight && "text-white",
                        !isSelected && "text-gray-600"
                      )}
                    >
                      {String.fromCharCode(65 + index)}
                    </Text>
                  )}
                </View>
                <Text
                  className={clsx(
                    "flex-1 text-base",
                    shouldHighlight &&
                      isCorrectOption &&
                      "text-green-900 font-medium",
                    shouldHighlight &&
                      isSelected &&
                      !isCorrectOption &&
                      "text-red-900",
                    !shouldHighlight && "text-gray-900"
                  )}
                >
                  {option.text}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {correctAnswer && !showAnswer && !isAnswerRevealed && selectedAnswer && (
        <TouchableOpacity
          onPress={handleRevealAnswer}
          className="items-center justify-center py-3 mt-4 bg-blue-500 rounded-xl"
        >
          <Text className="text-base font-semibold text-white">
            Show Answer
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
