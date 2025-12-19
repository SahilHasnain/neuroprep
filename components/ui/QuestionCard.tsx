import clsx from "clsx";
import { CheckCircle2, Circle } from "lucide-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import MathMarkdown from "@/components/shared/MathMarkdown";
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
        {question}
      </MathMarkdown>

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
                <View className="flex-1">
                  <MathMarkdown
                    style={{
                      body: {
                        fontSize: 15,
                        lineHeight: 20,
                        color: shouldHighlight
                          ? isCorrectOption
                            ? "#065f46" // green-900
                            : isSelected
                              ? "#7f1d1d" // red-900
                              : "#111827"
                          : "#111827",
                        fontWeight:
                          shouldHighlight && isCorrectOption ? "600" : "400",
                      },
                    }}
                  >
                    {option.text}
                  </MathMarkdown>
                </View>
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
