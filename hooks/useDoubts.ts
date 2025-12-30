// MVP_BYPASS: Simplified hook - removed auth checks, treat all as guests, use ComingSoonModal for limits
import { useState, useEffect } from "react";
import { doubtsService } from "@/services/api/doubts.service";
import type { Message, DoubtHistoryEntry, QuestionContext } from "@/lib/types";
import { parseApiError, type ApiError } from "@/utils/errorHandler";
import {
  checkGuestLimit,
  incrementGuestUsage,
  getRemainingUses,
  getGuestLimits,
  getGuestUsage,
} from "@/utils/guestUsageTracker";
import { usePlanStore } from "@/store/planStore";
import { DoubtHistoryManager } from "@/utils/doubtHistoryManager";

export const useDoubts = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI tutor. Ask me any doubt related to NEET/JEE and I'll help you understand it.",
      isUser: false,
      timeStamp: "Just Now",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{
    used: number;
    limit: number;
    allowed: boolean;
  } | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  // MVP_BYPASS: Added state for coming soon modal
  const [showComingSoon, setShowComingSoon] = useState(false);
  // State for guest history tracking
  const [guestHistory, setGuestHistory] = useState<DoubtHistoryEntry[]>([]);
  // State for current doubt context (for generating questions)
  const [currentDoubtContext, setCurrentDoubtContext] = useState<
    import("@/lib/types").DoubtContext | null
  >(null);

  useEffect(() => {
    // MVP_BYPASS: Always load as guest, no auth checks
    loadGuestUsage();
    // Load guest history on mount
    loadGuestHistory();
  }, []);

  const loadGuestHistory = async () => {
    try {
      const history = await DoubtHistoryManager.getGuestHistory();
      setGuestHistory(history);
    } catch (error) {
      console.error("Error loading guest history:", error);
      // Graceful degradation - continue without history
      setGuestHistory([]);
    }
  };

  const loadGuestUsage = async () => {
    const usage = await getGuestUsage();
    const limits = getGuestLimits();
    setLimitInfo({
      used: usage.doubts,
      limit: limits.doubts,
      allowed: usage.doubts < limits.doubts,
    });
  };

  const askDoubt = async (
    doubtText: string,
    questionContext?: QuestionContext,
    documentContext?: {
      documentId: string;
      documentTitle: string;
      ocrText: string;
    }
  ) => {
    // MVP_BYPASS: Always check guest limit, no auth user checks
    const canUse = await checkGuestLimit("doubts");
    if (!canUse) {
      const limits = getGuestLimits();
      setLimitInfo({
        used: limits.doubts,
        limit: limits.doubts,
        allowed: false,
      });
      // MVP_BYPASS: Show coming soon modal instead of upgrade prompt
      setShowComingSoon(true);
      setError({
        errorCode: "DAILY_LIMIT_REACHED",
        message: "Daily limit reached. More features coming soon!",
      });
      return;
    }
    const userMessage: Message = {
      id: Date.now().toString(),
      text: doubtText,
      isUser: true,
      timeStamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);

    const loadingMessage: Message = {
      id: "loading",
      text: "Thinking...",
      isUser: false,
      timeStamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, loadingMessage]);
    setLoading(true);

    try {
      // Retrieve guest history before API call
      let historyContext;
      try {
        const currentHistory = await DoubtHistoryManager.getGuestHistory();
        if (currentHistory.length > 0) {
          historyContext =
            DoubtHistoryManager.formatHistoryForAPI(currentHistory);
        }
      } catch (historyError) {
        console.error(
          "Error retrieving guest history for API call:",
          historyError
        );
        // Graceful degradation - continue without history
        historyContext = undefined;
      }

      // Include guest history in API request
      const response = await doubtsService.askDoubt(
        doubtText,
        historyContext,
        questionContext,
        documentContext
      );

      if (!response.success) {
        const apiError = parseApiError(response);
        if (apiError) {
          setError(apiError);
        }
        throw new Error(response.message || "Invalid response from server");
      }

      if (!response.data) {
        throw new Error("Invalid response from server");
      }

      if (response.limitInfo) {
        setLimitInfo(response.limitInfo);
      }

      // MVP_BYPASS: Removed plan state and free/pro badge logic
      setError(null);

      // MVP_BYPASS: Always increment guest usage, no auth checks
      await incrementGuestUsage("doubts");
      const remaining = await getRemainingUses("doubts");
      const limits = getGuestLimits();
      setLimitInfo({
        used: limits.doubts - remaining,
        limit: limits.doubts,
        allowed: true,
      });
      // Sync planStore for cross-screen consistency
      await usePlanStore.getState().fetchPlanStatus();

      const aiData = response.data.answer;
      let formattedResponse = "";

      if (aiData.explanation && Array.isArray(aiData.explanation)) {
        aiData.explanation.forEach((step: string) => {
          formattedResponse += `${step}\n\n`;
        });
      }

      if (aiData.intuition) {
        formattedResponse += `**💡 Intuition:**\n${aiData.intuition}\n\n`;
      }

      if (aiData.revisionTip) {
        formattedResponse += `**📝 Revision Tip:**\n${aiData.revisionTip}`;
      }

      // Extract doubt context for generating questions
      // Use default values for now - could be enhanced with AI extraction later
      const doubtContext: import("@/lib/types").DoubtContext = {
        doubtId: Date.now().toString(),
        doubtText: doubtText,
        subject: "General", // Default subject - could be enhanced with AI extraction
        topic: "General", // Default topic - could be enhanced with AI extraction
        difficulty: "medium", // Default difficulty
      };
      setCurrentDoubtContext(doubtContext);

      // Store AI response in AsyncStorage for guest users
      try {
        const newHistoryEntry: DoubtHistoryEntry = {
          id: Date.now().toString(),
          doubtText: doubtText,
          subject: "General", // Default subject - could be enhanced later
          topic: "General", // Default topic - could be enhanced later
          aiAnswer: {
            explanation: aiData.explanation || [],
            intuition: aiData.intuition || "",
            revisionTip: aiData.revisionTip || "",
          },
          timestamp: new Date().toISOString(),
          // Store question reference if provided
          questionContext: questionContext
            ? {
                questionId: questionContext.questionId,
                questionText: questionContext.questionText,
                correctAnswer: questionContext.correctAnswer,
              }
            : undefined,
        };

        await DoubtHistoryManager.addGuestDoubt(newHistoryEntry);

        // Update local state with new history
        const updatedHistory = await DoubtHistoryManager.getGuestHistory();
        setGuestHistory(updatedHistory);
      } catch (storageError) {
        console.error("Error storing doubt in AsyncStorage:", storageError);
        // Graceful degradation - continue even if storage fails
        // The doubt was answered successfully, storage is secondary
      }

      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== "loading");
        const aiResponse: Message = {
          id: Date.now().toString(),
          text: formattedResponse,
          isUser: false,
          timeStamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        return [...filtered, aiResponse];
      });
    } catch (err: any) {
      console.error("Error sending doubt:", err);

      // MVP_BYPASS: Show coming soon message for errors
      const errorText =
        error?.message ||
        "Sorry, I couldn't process your doubt. Please try again.";

      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== "loading");
        const errorResponse: Message = {
          id: Date.now().toString(),
          text: errorText,
          isUser: false,
          timeStamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        return [...filtered, errorResponse];
      });
    } finally {
      setLoading(false);
    }
  };

  // MVP_BYPASS: Return showComingSoon state for modal control
  return {
    messages,
    loading,
    askDoubt,
    limitInfo,
    error,
    showComingSoon,
    setShowComingSoon,
    currentDoubtContext,
  };
};
