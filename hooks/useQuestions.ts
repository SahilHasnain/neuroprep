import { useState, useEffect } from "react";
import { questionsService } from "@/services/api/questions.service";
import {
  loadQuestionsFromStorage,
  saveQuestionsToStorage,
} from "@/services/storage/questions.storage";
import { Question } from "@/lib/models";
import type { Question as QuestionType } from "@/lib/types";
import { canAccessDifficulty, canAccessQuestionCount, type UserPlan } from "@/utils/planRestrictions";

export const useQuestions = () => {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [userPlan, setUserPlan] = useState<UserPlan>("free");
  const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const questionSets = await loadQuestionsFromStorage();
    if (questionSets.length > 0) {
      const latest = questionSets[0];
      setQuestions(latest.questions);
      setSubject(latest.subject);
      setTopic(latest.topic);
      setDifficulty(latest.difficulty);
      setQuestionCount(latest.questionCount.toString());
    }
  };

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
        throw new Error(res.message || "Failed to generate questions");
      }

      if (res.plan) {
        setUserPlan(res.plan as UserPlan);
      }
      if (res.quota) {
        setQuota({ used: res.quota.used, limit: res.quota.limit });
      }

      const data = res.data;

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error("Invalid response from server");
      }

      const questionModels = data.map(q => Question.fromApi(q));
      setQuestions(questionModels);

      await saveQuestionsToStorage(data, {
        subject,
        topic,
        difficulty,
        questionCount: parseInt(questionCount, 10),
      });
    } catch (err) {
      console.error("Error generating questions:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate questions. Please try again."
      );
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

  const isDifficultyLocked = (diff: string) => !canAccessDifficulty(userPlan, diff);
  const isQuestionCountLocked = (count: string) => !canAccessQuestionCount(userPlan, parseInt(count, 10));

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
    isDifficultyLocked,
    isQuestionCountLocked,
    loadFromParams,
  };
};
