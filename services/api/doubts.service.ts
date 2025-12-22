import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants";
import type { AskDoubtRequest, AskDoubtResponse, ApiResponse, Doubt } from "@/lib/types";

export const doubtsService = {
  async askDoubt(doubtText: string): Promise<ApiResponse<AskDoubtResponse>> {
    return apiClient.post<AskDoubtResponse>(API_ENDPOINTS.ASK_DOUBT, {
      doubtText,
    });
  },

  async getHistory(limit = 20, offset = 0): Promise<ApiResponse<Doubt[]>> {
    return apiClient.get<Doubt[]>(`${API_ENDPOINTS.DOUBTS_HISTORY}?limit=${limit}&offset=${offset}`);
  },
};
