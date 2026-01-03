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
  async listDecks(): Promise<ApiResponse<FlashcardDeck[]>> {
    return apiClient.get<FlashcardDeck[]>(API_ENDPOINTS.FLASHCARDS_LIST_DECKS);
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
    return apiClient.post(API_ENDPOINTS.FLASHCARDS_GENERATE, config);
  },
};
