import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants";

interface AiAnswer {
  explanation: string[];
  intuition: string;
  revisionTip: string;
}

interface AskDoubtResponse {
  answer: AiAnswer;
}

export const doubtsService = {
  async askDoubt(doubtText: string) {
    return apiClient.post<AskDoubtResponse>(API_ENDPOINTS.ASK_DOUBT, {
      doubtText,
    });
  },
};
