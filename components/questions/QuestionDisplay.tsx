import { View, Text, ScrollView, Pressable } from "react-native";
import {
  HelpCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import { router } from "expo-router";
import { useState } from "react";
import Button from "@/components/ui/Button";
import QuestionCard from "@/components/ui/QuestionCard";
import AskDoubtModal from "@/components/modals/AskDoubtModal";
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [doubtModalVisible, setDoubtModalVisible] = useState(false);
  const [selectedQuestionContext, setSelectedQuestionContext] =
    useState<QuestionContext | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  const handleAskDoubt = (question: Question) => {
    const context: QuestionContext = {
      questionId: question.id,
      questionText: question.question,
      options: question.options.map((opt) => opt.text),
      correctAnswer: question.correctAnswer,
      subject,
      topic,
      difficulty,
    };

    setSelectedQuestionContext(context);
    setDoubtModalVisible(true);
  };

  const handleGenerateNotes = () => {
    const context: QuestionToNoteContext = {
      subject,
      topic,
      difficulty,
    };

    router.push({
      pathname: "/(tabs)/notes",
      params: {
        questionContext: JSON.stringify(context),
      },
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowAllQuestions(false);
  };

  // Single question view (default)
  if (!showAllQuestions) {
    return (
      <View className="flex-1">
        {/* Compact Header with Progress */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-medium text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={handleGenerateNotes}
                className="px-3 py-1.5 rounded-lg bg-gray-100 active:bg-gray-200"
              >
                <BookOpen size={16} color="#6b7280" />
              </Pressable>
              <Pressable
                onPress={onReset}
                className="px-3 py-1.5 rounded-lg bg-gray-100 active:bg-gray-200"
              >
                <Text className="text-sm font-medium text-gray-700">Exit</Text>
              </Pressable>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="h-2 overflow-hidden rounded-full bg-gray-200">
            <View
              className="h-full rounded-full bg-blue-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
          <Text className="mt-1 text-xs text-center text-gray-500">
            {answeredCount} of {questions.length} answered
          </Text>
        </View>

        {/* Question Card */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <QuestionCard
            question={currentQuestion.question}
            options={currentQuestion.options}
            correctAnswer={currentQuestion.correctAnswer}
            selectedAnswer={selectedAnswers[currentQuestion.id]}
            onAnswerSelect={(optionId) =>
              onAnswerSelect(currentQuestion.id, optionId)
            }
          />

          {/* Contextual Help - Only show after answering */}
          {selectedAnswers[currentQuestion.id] && (
            <Pressable
              onPress={() => handleAskDoubt(currentQuestion)}
              className="flex-row items-center justify-center px-4 py-3 mt-4 rounded-xl bg-blue-50 border-[1px] border-blue-200 active:bg-blue-100"
            >
              <HelpCircle size={18} color="#3b82f6" />
              <Text className="ml-2 text-sm font-medium text-blue-600">
                Need help with this?
              </Text>
            </Pressable>
          )}
        </ScrollView>

        {/* Navigation Footer */}
        <View className="pt-4 mt-4 border-t border-gray-200">
          <View className="flex-row items-center justify-between gap-3">
            <Pressable
              onPress={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`flex-row items-center justify-center px-4 py-3 rounded-xl flex-1 ${
                currentQuestionIndex === 0
                  ? "bg-gray-100"
                  : "bg-gray-200 active:bg-gray-300"
              }`}
            >
              <ChevronLeft
                size={20}
                color={currentQuestionIndex === 0 ? "#d1d5db" : "#374151"}
              />
              <Text
                className={`ml-1 text-sm font-semibold ${
                  currentQuestionIndex === 0 ? "text-gray-400" : "text-gray-700"
                }`}
              >
                Previous
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowAllQuestions(true)}
              className="px-4 py-3 rounded-xl bg-gray-100 active:bg-gray-200"
            >
              <Text className="text-sm font-medium text-gray-700">
                {currentQuestionIndex + 1}/{questions.length}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleNext}
              disabled={currentQuestionIndex === questions.length - 1}
              className={`flex-row items-center justify-center px-4 py-3 rounded-xl flex-1 ${
                currentQuestionIndex === questions.length - 1
                  ? "bg-gray-100"
                  : "bg-blue-600 active:bg-blue-700"
              }`}
            >
              <Text
                className={`mr-1 text-sm font-semibold ${
                  currentQuestionIndex === questions.length - 1
                    ? "text-gray-400"
                    : "text-white"
                }`}
              >
                Next
              </Text>
              <ChevronRight
                size={20}
                color={
                  currentQuestionIndex === questions.length - 1
                    ? "#d1d5db"
                    : "#ffffff"
                }
              />
            </Pressable>
          </View>
        </View>

        {/* Ask Doubt Modal */}
        {selectedQuestionContext && (
          <AskDoubtModal
            visible={doubtModalVisible}
            onClose={() => setDoubtModalVisible(false)}
            questionContext={selectedQuestionContext}
          />
        )}
      </View>
    );
  }

  // All questions overview
  return (
    <ScrollView className="flex-1">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">
          All Questions
        </Text>
        <Pressable
          onPress={() => setShowAllQuestions(false)}
          className="px-3 py-1.5 rounded-lg bg-gray-100 active:bg-gray-200"
        >
          <Text className="text-sm font-medium text-gray-700">
            Back to Practice
          </Text>
        </Pressable>
      </View>

      {/* Progress Summary */}
      <View className="p-4 mb-4 rounded-xl bg-blue-50 border-[1px] border-blue-200">
        <Text className="text-sm font-medium text-blue-900">
          Progress: {answeredCount}/{questions.length} completed
        </Text>
        <View className="h-2 mt-2 overflow-hidden rounded-full bg-blue-200">
          <View
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${progressPercentage}%` }}
          />
        </View>
      </View>

      {/* Question Grid */}
      <View className="flex-row flex-wrap gap-2 mb-4">
        {questions.map((question, index) => {
          const isAnswered = !!selectedAnswers[question.id];
          const isCurrent = index === currentQuestionIndex;

          return (
            <Pressable
              key={question.id}
              onPress={() => handleQuestionSelect(index)}
              className={`w-14 h-14 rounded-xl items-center justify-center border-[1.5px] ${
                isCurrent
                  ? "bg-blue-600 border-blue-600"
                  : isAnswered
                    ? "bg-green-50 border-green-500"
                    : "bg-gray-50 border-gray-300"
              }`}
            >
              <Text
                className={`text-base font-semibold ${
                  isCurrent
                    ? "text-white"
                    : isAnswered
                      ? "text-green-700"
                      : "text-gray-600"
                }`}
              >
                {index + 1}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row gap-2 pb-6">
        <Button
          title="Generate Notes"
          onPress={handleGenerateNotes}
          variant="outline"
          icon={<BookOpen size={16} color="#3b82f6" />}
          fullWidth
        />
        <Button title="Exit" onPress={onReset} variant="outline" fullWidth />
      </View>

      {/* Ask Doubt Modal */}
      {selectedQuestionContext && (
        <AskDoubtModal
          visible={doubtModalVisible}
          onClose={() => setDoubtModalVisible(false)}
          questionContext={selectedQuestionContext}
        />
      )}
    </ScrollView>
  );
}
