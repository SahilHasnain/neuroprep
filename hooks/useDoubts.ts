// MVP_BYPASS: Simplified hook - removed auth checks, treat all as guests, use ComingSoonModal for limits
import { useState, useEffect } from "react";
import { doubtsService } from "@/services/api/doubts.service";
import { loadDoubtsFromStorage } from "@/services/storage/doubts.storage";
import { Doubt } from "@/lib/models";
import type { Message } from "@/lib/types";
import { parseApiError, type ApiError } from "@/utils/errorHandler";
import {
  checkGuestLimit,
  incrementGuestUsage,
  getRemainingUses,
  getGuestLimits,
  getGuestUsage,
} from "@/utils/guestUsageTracker";
import { usePlanStore } from "@/store/planStore";

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

  useEffect(() => {
    // MVP_BYPASS: Always load as guest, no auth checks
    loadGuestUsage();
  }, []);

  const loadGuestUsage = async () => {
    const usage = await getGuestUsage();
    const limits = getGuestLimits();
    setLimitInfo({
      used: usage.doubts,
      limit: limits.doubts,
      allowed: usage.doubts < limits.doubts,
    });
  };

  const askDoubt = async (doubtText: string) => {
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
      const response = await doubtsService.askDoubt(doubtText);

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
        aiData.explanation.forEach((step: string, idx: number) => {
          formattedResponse += `${step}\n\n`;
        });
      }

      if (aiData.intuition) {
        formattedResponse += `**💡 Intuition:**\n${aiData.intuition}\n\n`;
      }

      if (aiData.revisionTip) {
        formattedResponse += `**📝 Revision Tip:**\n${aiData.revisionTip}`;
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
  };
};
