import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants";
import type { ApiResponse } from "@/lib/types";
import type {
  FlashcardDeck,
  Flashcard,
  FlashcardGenerationConfig,
} from "@/types/flashcard";

export const flashcardsService = {
  /**
   * List all flashcard decks for the current user
   */
  async listDecks(): Promise<
    ApiResponse<{ decks: FlashcardDeck[]; total: number }>
  > {
    return apiClient.get<{ decks: FlashcardDeck[]; total: number }>(
      API_ENDPOINTS.FLASHCARDS_LIST_DECKS
    );
  },

  /**
   * Get a specific deck with its flashcards
   */
  async getDeck(
    deckId: string
  ): Promise<ApiResponse<{ deck: FlashcardDeck; cards: Flashcard[] }>> {
    return apiClient.get<{ deck: FlashcardDeck; cards: Flashcard[] }>(
      `${API_ENDPOINTS.FLASHCARDS_GET_DECK}?deckId=${deckId}`
    );
  },

  /**
   * Delete a flashcard deck and all its cards
   */
  async deleteDeck(deckId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(
      API_ENDPOINTS.FLASHCARDS_DELETE_DECK,
      {
        deckId,
      }
    );
  },

  /**
   * Generate flashcards using AI
   */
  async generateFlashcards(config: FlashcardGenerationConfig): Promise<
    ApiResponse<{
      deckId: string;
      flashcards: Flashcard[];
      metadata: {
        method: "cache" | "template" | "ai";
        cached: boolean;
        responseTime: number;
      };
    }>
  > {
    const response = await apiClient.post<any>(
      API_ENDPOINTS.FLASHCARDS_GENERATE,
      config
    );

    // Backend returns data at root level, transform to match ApiResponse format
    if (response.success && response.deckId) {
      return {
        success: true,
        data: {
          deckId: response.deckId,
          flashcards: response.flashcards || [],
          metadata: response.metadata || {
            method: "ai",
            cached: false,
            responseTime: 0,
          },
        },
        plan: response.plan,
        quota: response.quota,
      };
    }

    return response;
  },
};
