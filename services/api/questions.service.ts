import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants";
import type { GenerateQuestionsRequest, GenerateQuestionsResponse, ApiResponse, StoredQuestionSet } from "@/lib/types";

export const questionsService = {
  async generateQuestions(params: GenerateQuestionsRequest): Promise<ApiResponse<GenerateQuestionsResponse>> {
    return apiClient.post(API_ENDPOINTS.GENERATE_QUESTIONS, params);
  },

  async getHistory(limit = 10, offset = 0): Promise<ApiResponse<StoredQuestionSet[]>> {
    return apiClient.get<StoredQuestionSet[]>(`${API_ENDPOINTS.QUESTIONS_HISTORY}?limit=${limit}&offset=${offset}`);
  },
};
