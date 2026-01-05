import clsx from "clsx";
import { CheckCircle2, Circle } from "lucide-react-native";
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
  // Determine if answer is revealed based on whether an answer has been selected
  const isAnswerRevealed = !!selectedAnswer || showAnswer;

  const handleOptionPress = (optionId: string) => {
    if (onAnswerSelect && !isAnswerRevealed) {
      onAnswerSelect(optionId);
    }
  };

  return (
    <View className="p-4 mb-4 bg-dark-surface-100 rounded-2xl border-[1px] border-dark-surface-300">
      <MathMarkdown
        style={{
          body: {
            color: "#f5f5f5",
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

          // Debug log for missing text
          if (!option.text) {
            console.error("⚠️ Option missing text:", {
              option,
              index,
              questionHasOptions: options.length,
            });
          }

          return (
            <TouchableOpacity
              key={option.id || `option-${index}`}
              onPress={() => handleOptionPress(option.id)}
              disabled={isAnswerRevealed || showAnswer}
              className={clsx(
                "flex-row items-center p-3 rounded-xl border-[1.5px] mb-2",
                shouldHighlight &&
                  isCorrectOption &&
                  "bg-success-bg border-success-border",
                shouldHighlight &&
                  isSelected &&
                  !isCorrectOption &&
                  "bg-error-bg border-error-border",
                !shouldHighlight &&
                  isSelected &&
                  "bg-info-bg border-info-border",
                !shouldHighlight &&
                  !isSelected &&
                  "bg-dark-surface-200 border-dark-surface-300"
              )}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className={clsx(
                    "w-6 h-6 rounded-full items-center justify-center mr-3 border-[1.5px]",
                    shouldHighlight &&
                      isCorrectOption &&
                      "bg-success-border border-success-border",
                    shouldHighlight &&
                      isSelected &&
                      !isCorrectOption &&
                      "bg-error-border border-error-border",
                    !shouldHighlight &&
                      isSelected &&
                      "bg-info-border border-info-border",
                    !shouldHighlight &&
                      !isSelected &&
                      "bg-dark-surface-100 border-dark-surface-300"
                  )}
                >
                  {shouldHighlight && isCorrectOption ? (
                    <CheckCircle2 size={16} color="#ffffff" />
                  ) : (
                    <Text
                      className={clsx(
                        "text-xs font-semibold",
                        isSelected && !shouldHighlight && "text-white",
                        !isSelected && "text-text-tertiary"
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
                            ? "#6ee7b7" // success-text
                            : isSelected
                              ? "#fca5a5" // error-text
                              : "#e5e5e5"
                          : "#e5e5e5",
                        fontWeight:
                          shouldHighlight && isCorrectOption ? "600" : "400",
                      },
                    }}
                  >
                    {option.text ||
                      `[Option ${String.fromCharCode(65 + index)} - Text Missing]`}
                  </MathMarkdown>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
