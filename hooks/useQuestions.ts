// MVP_BYPASS: Simplified hook - removed auth checks, treat all as guests, use ComingSoonModal for limits
import { useState, useEffect } from "react";
import { questionsService } from "@/services/api/questions.service";
import {
  loadQuestionsFromStorage,
  saveQuestionsToStorage,
} from "@/services/storage/questions.storage";
import { Question } from "@/lib/models";
import type { Question as QuestionType } from "@/lib/types";
import type { PlanLimits } from "@/types/plan";
import { parseApiError, type ApiError } from "@/utils/errorHandler";
import {
  checkGuestLimit,
  incrementGuestUsage,
  getRemainingUses,
  getGuestLimits,
} from "@/utils/guestUsageTracker";
import { usePlanStore } from "@/store/planStore";

export const useQuestions = () => {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  // MVP_BYPASS: Removed userPlan state, no free/pro badge logic
  const [quota, setQuota] = useState<{ used: number; limit: number } | null>(
    null
  );
  // MVP_BYPASS: Added state for coming soon modal
  const [showComingSoon, setShowComingSoon] = useState(false);
  const { limits } = usePlanStore();
  const loadFromParams = (data: {
    questions: QuestionType[];
    subject: string;
    topic: string;
    difficulty: string;
    questionCount: string;
  }) => {
    setQuestions(data.questions);
    setSubject(data.subject);
    setTopic(data.topic);
    setDifficulty(data.difficulty);
    setQuestionCount(data.questionCount);
    setSelectedAnswers({});
  };

  const generateQuestions = async () => {
    if (!subject || !topic || !difficulty || !questionCount) {
      return;
    }

    // MVP_BYPASS: Always check guest limit, no auth user checks
    const canUse = await checkGuestLimit("questions");
    if (!canUse) {
      const limits = getGuestLimits();
      setQuota({ used: limits.questions, limit: limits.questions });
      // MVP_BYPASS: Show coming soon modal instead of upgrade prompt
      setShowComingSoon(true);
      setError({
        errorCode: "DAILY_LIMIT_REACHED",
        message: "Daily limit reached. More features coming soon!",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setQuestions([]);
    setSelectedAnswers({});

    try {
      const res = await questionsService.generateQuestions({
        subject,
        topic,
        difficulty,
        questionCount,
      });

      if (!res.success) {
        const apiError = parseApiError(res);
        if (apiError) {
          setError(apiError);
        }
        throw new Error(res.message || "Failed to generate questions");
      }

      // MVP_BYPASS: Removed plan state logic
      if (res.quota) {
        setQuota({ used: res.quota.used, limit: res.quota.limit });
      }

      const data = res.data;

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error("Invalid response from server");
      }

      const questionModels = data.map((q) => Question.fromApi(q));
      setQuestions(questionModels);
      setError(null);

      // MVP_BYPASS: Always increment guest usage, no auth checks
      await incrementGuestUsage("questions");
      const remaining = await getRemainingUses("questions");
      const limits = getGuestLimits();
      setQuota({
        used: limits.questions - remaining,
        limit: limits.questions,
      });
      // Sync planStore for cross-screen consistency
      await usePlanStore.getState().fetchPlanStatus();

      await saveQuestionsToStorage(data, {
        subject,
        topic,
        difficulty,
        questionCount: parseInt(questionCount, 10),
      });
    } catch (err) {
      console.error("Error generating questions:", err);
      if (!error) {
        setError({
          errorCode: "SERVER_ERROR",
          message:
            err instanceof Error
              ? err.message
              : "Failed to generate questions. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const reset = () => {
    setQuestions([]);
    setSelectedAnswers({});
    setError(null);
    setSubject("");
    setTopic("");
    setDifficulty("");
    setQuestionCount("");
  };

  const canGenerate = subject && topic && difficulty && questionCount;

  const isDifficultyLocked = (diff: string) => {
    if (!limits) return false;
    return !limits.allowedDifficulties.includes(diff.toLowerCase());
  };

  const isQuestionCountLocked = (count: string) => {
    if (!limits) return false;
    return parseInt(count, 10) > limits.maxQuestions;
  };

  // MVP_BYPASS: Return showComingSoon state for modal control
  return {
    subject,
    setSubject,
    topic,
    setTopic,
    difficulty,
    setDifficulty,
    questionCount,
    setQuestionCount,
    questions,
    loading,
    error,
    selectedAnswers,
    generateQuestions,
    selectAnswer,
    reset,
    canGenerate,
    quota,
    isDifficultyLocked,
    isQuestionCountLocked,
    loadFromParams,
    showComingSoon,
    setShowComingSoon,
  };
};
