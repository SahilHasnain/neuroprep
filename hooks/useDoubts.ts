import { useState, useEffect, use } from "react";
import { doubtsService } from "@/services/api/doubts.service";
import { loadDoubtsFromStorage } from "@/services/storage/doubts.storage";
import { Doubt } from "@/lib/models";
import type { Message } from "@/lib/types";
import type { PlanLimits } from "@/types/plan";
import { parseApiError, type ApiError } from "@/utils/errorHandler";
import { checkGuestLimit, incrementGuestUsage, getRemainingUses, GUEST_LIMITS } from "@/utils/guestUsageTracker";
import { useAuthStore } from "@/store/authStore";
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
  const [limitInfo, setLimitInfo] = useState<{ used: number; limit: number; allowed: boolean } | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const { user } = useAuthStore.getState();
    if (user) {
      loadPastDoubts();
    }
  }, []);

  const loadPastDoubts = async () => {
    const past = await loadDoubtsFromStorage();
    if (past.length > 0) {
      const doubts = past.map(d => Doubt.fromStorage(d));
      const mapped = doubts.flatMap(d => d.toMessages());
      setMessages((prev) => [...prev, ...mapped]);
    }
  };

  const askDoubt = async (doubtText: string) => {
    const { user } = useAuthStore.getState();

    // Guest limit check
    if (!user) {
      const canUse = await checkGuestLimit("doubts");
      if (!canUse) {
        const remaining = await getRemainingUses("doubts");
        setLimitInfo({ used: GUEST_LIMITS.doubts, limit: GUEST_LIMITS.doubts, allowed: false });
        setError({
          errorCode: "DAILY_LIMIT_REACHED",
          message: "Daily limit reached. Sign up to continue!",
        });
        return;
      }
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

      if (response.planLimits) {
        setPlanLimits(response.planLimits);
      }

      setPlan(response.plan || "free");
      setError(null);

      // Update usage
      if (!user) {
        // Guest: Increment AsyncStorage
        await incrementGuestUsage("doubts");
        const remaining = await getRemainingUses("doubts");
        setLimitInfo({ used: GUEST_LIMITS.doubts - remaining, limit: GUEST_LIMITS.doubts, allowed: true });
      } else {
        // Logged-in: Refresh from backend
        await usePlanStore.getState().fetchPlanStatus();
      }

      const aiData = response.data.answer;
      let formattedResponse = "";

      if (aiData.explanation && Array.isArray(aiData.explanation)) {
        aiData.explanation.forEach((step: string, idx: number) => {
          formattedResponse += `**Step ${idx + 1}:**\n${step}\n\n`;
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
      
      const errorText = error?.message || "Sorry, I couldn't process your doubt. Please try again.";

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

  return { messages, loading, askDoubt, limitInfo, plan, planLimits, error };
};
