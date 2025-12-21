import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants";
import type { AskDoubtRequest, AskDoubtResponse, ApiResponse } from "@/lib/types";

export const doubtsService = {
  async askDoubt(doubtText: string): Promise<ApiResponse<AskDoubtResponse>> {
    return apiClient.post<AskDoubtResponse>(API_ENDPOINTS.ASK_DOUBT, {
      doubtText,
    });
  },
};
