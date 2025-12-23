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
import { checkGuestLimit, incrementGuestUsage, getRemainingUses, GUEST_LIMITS } from "@/utils/guestUsageTracker";
import { useAuthStore } from "@/store/authStore";
import { usePlanStore } from "@/store/planStore";

type UserPlan = "free" | "student_pro";

export const useQuestions = () => {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [userPlan, setUserPlan] = useState<UserPlan>("free");
  const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
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

    const { user } = useAuthStore.getState();

    // Guest limit check
    if (!user) {
      const canUse = await checkGuestLimit("questions");
      if (!canUse) {
        setQuota({ used: GUEST_LIMITS.questions, limit: GUEST_LIMITS.questions });
        setError({
          errorCode: "DAILY_LIMIT_REACHED",
          message: "Daily limit reached. Sign up to continue!",
        });
        return;
      }
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

      if (res.plan) {
        setUserPlan(res.plan as UserPlan);
      }
      if (res.quota) {
        setQuota({ used: res.quota.used, limit: res.quota.limit });
      }
      if (res.planLimits) {
        setPlanLimits(res.planLimits);
      }

      const data = res.data;

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error("Invalid response from server");
      }

      const questionModels = data.map(q => Question.fromApi(q));
      setQuestions(questionModels);
      setError(null);

      // Update usage
      if (!user) {
        // Guest: Increment AsyncStorage
        await incrementGuestUsage("questions");
        const remaining = await getRemainingUses("questions");
        setQuota({ used: GUEST_LIMITS.questions - remaining, limit: GUEST_LIMITS.questions });
      } else {
        // Logged-in: Refresh from backend
        await usePlanStore.getState().fetchPlanStatus();
      }

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
          errorCode: 'SERVER_ERROR',
          message: err instanceof Error ? err.message : "Failed to generate questions. Please try again."
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
    if (!planLimits) return false;
    return !planLimits.allowedDifficulties.includes(diff.toLowerCase());
  };

  const isQuestionCountLocked = (count: string) => {
    if (!planLimits) return false;
    return parseInt(count, 10) > planLimits.maxQuestions;
  };

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
    userPlan,
    quota,
    planLimits,
    isDifficultyLocked,
    isQuestionCountLocked,
    loadFromParams,
  };
};
