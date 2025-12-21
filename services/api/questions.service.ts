import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants";
import type { GenerateQuestionsRequest, GenerateQuestionsResponse, ApiResponse } from "@/lib/types";

export const questionsService = {
  async generateQuestions(params: GenerateQuestionsRequest): Promise<ApiResponse<GenerateQuestionsResponse>> {
    return apiClient.post(API_ENDPOINTS.GENERATE_QUESTIONS, params);
  },
};
