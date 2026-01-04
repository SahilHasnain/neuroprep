import { View, Text, ScrollView, Pressable } from "react-native";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { THEME } from "@/constants/theme";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import Button from "@/components/ui/Button";
import QuestionCard from "@/components/ui/QuestionCard";
import ConnectionPanel from "@/components/shared/ConnectionPanel";
import ScoreCard from "@/components/questions/ScoreCard";
import { useConnectionContext } from "@/hooks/useConnectionContext";
import { useFlashcardsStore } from "@/store/flashcardsStore";
import type { ConnectionAction } from "@/hooks/useConnectionContext";
import type { Question } from "@/lib/types";

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
  const [showScore, setShowScore] = useState(false);

  // Connection Panel
  const { isOpen, context, openPanel, closePanel } = useConnectionContext();
  const [connectionLoading, setConnectionLoading] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercentage = (answeredCount / questions.length) * 100;

  // Calculate score
  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((question) => {
      const selectedAnswer = selectedAnswers[question.id];
      if (selectedAnswer === question.correctAnswer) {
        correctCount++;
      }
    });
    return correctCount;
  };

  // Open connection panel
  const handleOpenConnectionPanel = () => {
    openPanel({
      source: "question",
      subject: subject,
      topic: topic,
      metadata: {
        difficulty,
        questionCount: questions.length,
      },
    });
  };

  // Handle connection panel actions
  const handleConnectionAction = async (action: ConnectionAction) => {
    setConnectionLoading(true);

    try {
      switch (action) {
        case "notes":
          closePanel();
          router.push({
            pathname: "/(tabs)/notes",
            params: {
              questionContext: JSON.stringify({
                subject,
                topic,
                difficulty,
              }),
            },
          });
          break;

        case "flashcards":
          const result = await useFlashcardsStore
            .getState()
            .generateFlashcards({
              deckName: `${topic} - Practice Questions`,
              subject: subject,
              topic: topic,
              cardCount: Math.min(questions.length, 10),
            });

          closePanel();

          if (result.success) {
            Alert.alert(
              "Success!",
              "Flashcards created! View them in the Flashcards tab.",
              [{ text: "OK" }]
            );
          } else {
            Alert.alert(
              "Failed",
              result.error || "Failed to create flashcards.",
              [{ text: "OK" }]
            );
          }
          break;

        case "questions":
          // Already in questions, just close
          closePanel();
          Alert.alert(
            "Already Practicing",
            "You're already working on questions! Try generating notes or flashcards instead.",
            [{ text: "OK" }]
          );
          break;

        case "doubt":
          closePanel();
          // Navigate to Ask Doubt with question context
          const currentQ = questions[currentQuestionIndex];
          const doubtText = `I have a doubt about this question:

Question: ${currentQ.question}

Options:
${currentQ.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}) ${opt.text}`).join("\n")}

Correct Answer: ${currentQ.correctAnswer}

My question: `;

          router.push({
            pathname: "/(tabs)/ask-doubt",
            params: {
              questionContext: JSON.stringify({
                questionId: currentQ.id,
                questionText: currentQ.question,
                options: currentQ.options.map((opt) => opt.text),
                correctAnswer: currentQ.correctAnswer,
                subject,
                topic,
                difficulty,
                prefilledDoubt: doubtText,
              }),
            },
          });
          break;
      }
    } catch (error) {
      console.error("Connection action error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setConnectionLoading(false);
    }
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

  const handleRetry = () => {
    setShowScore(false);
    setCurrentQuestionIndex(0);
    onReset();
  };

  // Show score card when all questions are answered
  if (showScore) {
    return (
      <ScoreCard
        score={calculateScore()}
        totalQuestions={questions.length}
        onRetry={handleRetry}
        onExit={onReset}
      />
    );
  }

  // Single question view (default)
  if (!showAllQuestions) {
    return (
      <View className="flex-1">
        {/* Compact Header with Progress */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-medium text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={handleOpenConnectionPanel}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/40 active:opacity-80 flex-row items-center"
              >
                <Sparkles size={14} color="#60a5fa" />
                <Text className="text-xs font-medium text-blue-300 ml-1">
                  Connect
                </Text>
              </Pressable>
              <Pressable
                onPress={onReset}
                className="px-3 py-1.5 rounded-lg bg-gray-800 active:bg-gray-700"
              >
                <Text className="text-sm font-medium text-gray-300">Exit</Text>
              </Pressable>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="h-2 overflow-hidden rounded-full bg-gray-700">
            <LinearGradient
              colors={THEME.gradients.progress}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-full rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
          <Text className="mt-1 text-xs text-center text-gray-400">
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
              onPress={handleOpenConnectionPanel}
              className="flex-row items-center justify-center px-4 py-3 mt-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-[1px] border-blue-500/40 active:opacity-80"
            >
              <Sparkles size={18} color="#60a5fa" />
              <Text className="ml-2 text-sm font-semibold text-blue-300">
                Create Notes or Flashcards
              </Text>
            </Pressable>
          )}
        </ScrollView>

        {/* Navigation Footer */}
        <View className="pt-4 mt-4 border-t border-gray-700">
          <View className="flex-row items-center justify-between gap-3">
            <Pressable
              onPress={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`flex-row items-center justify-center px-4 py-3 rounded-xl flex-1 ${
                currentQuestionIndex === 0
                  ? "bg-gray-800"
                  : "bg-gray-700 active:bg-gray-600"
              }`}
            >
              <ChevronLeft
                size={20}
                color={currentQuestionIndex === 0 ? "#4b5563" : "#e5e5e5"}
              />
              <Text
                className={`ml-1 text-sm font-semibold ${
                  currentQuestionIndex === 0 ? "text-gray-600" : "text-gray-200"
                }`}
              >
                Previous
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowAllQuestions(true)}
              className="px-4 py-3 rounded-xl bg-gray-800 active:bg-gray-700"
            >
              <Text className="text-sm font-medium text-gray-300">
                {currentQuestionIndex + 1}/{questions.length}
              </Text>
            </Pressable>

            {/* Show Finish button on last question if answered, otherwise Next */}
            {currentQuestionIndex === questions.length - 1 &&
            selectedAnswers[currentQuestion.id] ? (
              <Pressable
                onPress={() => setShowScore(true)}
                className="flex-1 rounded-xl overflow-hidden active:opacity-80"
              >
                <LinearGradient
                  colors={THEME.gradients.green}
                  start={THEME.gradientConfig.start}
                  end={{ x: 1, y: 0 }}
                  className="flex-row items-center justify-center px-4 py-3"
                >
                  <Text className="text-sm font-semibold text-white">
                    Finish
                  </Text>
                </LinearGradient>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleNext}
                disabled={currentQuestionIndex === questions.length - 1}
                className={`flex-row items-center justify-center px-4 py-3 rounded-xl flex-1 ${
                  currentQuestionIndex === questions.length - 1
                    ? "bg-gray-800"
                    : "overflow-hidden"
                }`}
              >
                {currentQuestionIndex === questions.length - 1 ? (
                  <>
                    <Text className="mr-1 text-sm font-semibold text-gray-600">
                      Next
                    </Text>
                    <ChevronRight size={20} color="#4b5563" />
                  </>
                ) : (
                  <LinearGradient
                    colors={THEME.gradients.primaryButton}
                    start={THEME.gradientConfig.start}
                    end={{ x: 1, y: 0 }}
                    className="flex-row items-center justify-center px-4 py-3 absolute inset-0"
                  >
                    <Text className="mr-1 text-sm font-semibold text-white">
                      Next
                    </Text>
                    <ChevronRight size={20} color={THEME.colors.text.primary} />
                  </LinearGradient>
                )}
              </Pressable>
            )}
          </View>
        </View>

        {/* Connection Panel */}
        <ConnectionPanel
          visible={isOpen}
          context={context}
          onClose={closePanel}
          onActionSelect={handleConnectionAction}
          loading={connectionLoading}
        />
      </View>
    );
  }

  // All questions overview
  return (
    <ScrollView className="flex-1">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-100">
          All Questions
        </Text>
        <Pressable
          onPress={() => setShowAllQuestions(false)}
          className="px-3 py-1.5 rounded-lg bg-gray-800 active:bg-gray-700"
        >
          <Text className="text-sm font-medium text-gray-300">
            Back to Practice
          </Text>
        </Pressable>
      </View>

      {/* Progress Summary */}
      <View
        className={`p-4 mb-4 rounded-xl border-[1px] ${
          answeredCount === questions.length
            ? "bg-green-500/10 border-green-500/30"
            : "bg-blue-500/10 border-blue-500/30"
        }`}
      >
        <Text
          className={`text-sm font-medium ${
            answeredCount === questions.length
              ? "text-green-300"
              : "text-blue-300"
          }`}
        >
          {answeredCount === questions.length
            ? "🎉 All questions completed!"
            : `Progress: ${answeredCount}/${questions.length} completed`}
        </Text>
        <View
          className={`h-2 mt-2 overflow-hidden rounded-full ${
            answeredCount === questions.length
              ? "bg-green-500/20"
              : "bg-blue-500/20"
          }`}
        >
          <LinearGradient
            colors={
              answeredCount === questions.length
                ? THEME.gradients.green
                : THEME.gradients.progress
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="h-full rounded-full"
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
              className={`w-14 h-14 rounded-xl items-center justify-center border-[1.5px] overflow-hidden ${
                isCurrent
                  ? "border-blue-500"
                  : isAnswered
                    ? "bg-green-500/10 border-green-500"
                    : "bg-gray-800 border-gray-600"
              }`}
            >
              {isCurrent && (
                <LinearGradient
                  colors={THEME.gradients.primaryButton}
                  start={THEME.gradientConfig.start}
                  end={{ x: 1, y: 0 }}
                  className="absolute inset-0"
                />
              )}
              <Text
                className={`text-base font-semibold ${
                  isCurrent
                    ? "text-white"
                    : isAnswered
                      ? "text-green-400"
                      : "text-gray-400"
                }`}
              >
                {index + 1}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row gap-2 pb-6">
        {answeredCount === questions.length && (
          <Button
            title="View Score"
            onPress={() => setShowScore(true)}
            variant="primary"
            fullWidth
          />
        )}
        <Button
          title="Connect & Create"
          onPress={handleOpenConnectionPanel}
          variant="outline"
          icon={<Sparkles size={16} color="#60a5fa" />}
          fullWidth
        />
        <Button title="Exit" onPress={onReset} variant="outline" fullWidth />
      </View>

      {/* Connection Panel */}
      <ConnectionPanel
        visible={isOpen}
        context={context}
        onClose={closePanel}
        onActionSelect={handleConnectionAction}
        loading={connectionLoading}
      />
    </ScrollView>
  );
}
