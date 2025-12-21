import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants";

export const questionsService = {
  async generateQuestions(params: {
    subject: string;
    topic: string;
    difficulty: string;
    questionCount: string;
  }) {
    return apiClient.post(API_ENDPOINTS.GENERATE_QUESTIONS, params);
  },
};
