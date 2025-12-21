import { useState, useEffect } from "react";
import { doubtsService } from "@/services/api/doubts.service";
import { loadDoubtsFromStorage, saveDoubtToStorage } from "@/services/storage/doubts.storage";
import { Doubt } from "@/lib/models";
import type { Message } from "@/lib/types";

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

  useEffect(() => {
    loadPastDoubts();
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

      if (!response.success || !response.data) {
        throw new Error(response.message || "Invalid response from server");
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

        saveDoubtToStorage(doubtText, formattedResponse).catch((err) => {
          console.warn("Failed to save doubt:", err);
        });

        return [...filtered, aiResponse];
      });
    } catch (err) {
      console.error("Error sending doubt:", err);
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== "loading");
        const errorResponse: Message = {
          id: Date.now().toString(),
          text: "Sorry, I couldn't process your doubt. Please try again.",
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

  return { messages, loading, askDoubt };
};
