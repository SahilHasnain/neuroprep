import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants";

export const notesService = {
  async generateNotes(params: {
    subject: string;
    topic: string;
    noteLength: string;
  }) {
    return apiClient.post(API_ENDPOINTS.NOTES, params);
  },
};
