import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants";
import type { GenerateNotesRequest, GenerateNotesResponse, ApiResponse } from "@/lib/types";

export const notesService = {
  async generateNotes(params: GenerateNotesRequest): Promise<ApiResponse<GenerateNotesResponse>> {
    return apiClient.post(API_ENDPOINTS.NOTES, params);
  },
};
