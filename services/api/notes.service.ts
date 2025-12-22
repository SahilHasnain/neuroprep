import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants";
import type { GenerateNotesRequest, GenerateNotesResponse, ApiResponse, Note } from "@/lib/types";

export const notesService = {
  async generateNotes(params: GenerateNotesRequest): Promise<ApiResponse<GenerateNotesResponse>> {
    return apiClient.post(API_ENDPOINTS.NOTES, params);
  },

  async getHistory(limit = 20, offset = 0): Promise<ApiResponse<Note[]>> {
    return apiClient.get<Note[]>(`${API_ENDPOINTS.NOTES_HISTORY}?limit=${limit}&offset=${offset}`);
  },
};
