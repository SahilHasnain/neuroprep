import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants";
import type {
  AskDoubtRequest,
  AskDoubtResponse,
  ApiResponse,
  Doubt,
  QuestionContext,
} from "@/lib/types";

export const doubtsService = {
  async askDoubt(
    doubtText: string,
    historyContext?: Array<{
      doubtText: string;
      subject: string;
      topic: string;
      aiAnswer?: string;
    }>,
    questionContext?: QuestionContext,
    documentContext?: {
      documentId: string;
      documentTitle: string;
      ocrText: string;
    }
  ): Promise<ApiResponse<AskDoubtResponse>> {
    const payload: AskDoubtRequest = {
      doubtText,
    };

    if (historyContext && historyContext.length > 0) {
      payload.historyContext = historyContext;
    }

    if (questionContext) {
      payload.questionContext = questionContext;
    }

    if (documentContext) {
      payload.documentContext = documentContext;
    }

    return apiClient.post<AskDoubtResponse>(API_ENDPOINTS.ASK_DOUBT, payload);
  },

  async getHistory(limit = 20, offset = 0): Promise<ApiResponse<Doubt[]>> {
    return apiClient.get<Doubt[]>(
      `${API_ENDPOINTS.DOUBTS_HISTORY}?limit=${limit}&offset=${offset}`
    );
  },
};
