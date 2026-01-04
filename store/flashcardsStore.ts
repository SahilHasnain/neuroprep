import { create } from "zustand";
import { flashcardsService } from "@/services/api/flashcards.service";
import type {
  FlashcardDeck,
  Flashcard,
  FlashcardGenerationConfig,
} from "@/types/flashcard";

interface FlashcardsState {
  decks: FlashcardDeck[];
  currentDeck: FlashcardDeck | null;
  currentCards: Flashcard[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDecks: () => Promise<void>;
  getDeck: (deckId: string) => Promise<void>;
  deleteDeck: (deckId: string) => Promise<boolean>;
  generateFlashcards: (config: FlashcardGenerationConfig) => Promise<{
    success: boolean;
    deckId?: string;
    error?: string;
  }>;
  setCurrentDeck: (deck: FlashcardDeck | null) => void;
  clearError: () => void;
}

export const useFlashcardsStore = create<FlashcardsState>((set, get) => ({
  decks: [],
  currentDeck: null,
  currentCards: [],
  isLoading: false,
  error: null,

  fetchDecks: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await flashcardsService.listDecks();
      if (result.success) {
        // Backend returns { data: { decks: [], total: number } }
        const decks = result.data?.decks || [];
        set({ decks, isLoading: false });
      } else {
        set({
          error: result.message || "Failed to fetch decks",
          isLoading: false,
          decks: [],
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      set({ error: errorMessage, isLoading: false, decks: [] });
    }
  },

  getDeck: async (deckId: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await flashcardsService.getDeck(deckId);
      if (result.success && result.data) {
        set({
          currentDeck: result.data.deck,
          currentCards: result.data.cards || [],
          isLoading: false,
        });
      } else {
        set({
          error: result.message || "Deck not found",
          isLoading: false,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      set({ error: errorMessage, isLoading: false });
    }
  },

  deleteDeck: async (deckId: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await flashcardsService.deleteDeck(deckId);
      if (result.success) {
        set((state) => ({
          decks: state.decks.filter((deck) => deck.$id !== deckId),
          isLoading: false,
        }));
        return true;
      } else {
        set({ error: result.message || "Delete failed", isLoading: false });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  generateFlashcards: async (config: FlashcardGenerationConfig) => {
    set({ isLoading: true, error: null });
    try {
      const result = await flashcardsService.generateFlashcards(config);
      if (result.success && result.data) {
        // Refresh decks list to include the new deck
        await get().fetchDecks();
        set({ isLoading: false });
        return { success: true, deckId: result.data.deckId };
      } else {
        set({
          error: result.message || "Generation failed",
          isLoading: false,
        });
        return { success: false, error: result.message };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  setCurrentDeck: (deck: FlashcardDeck | null) => {
    set({ currentDeck: deck });
  },

  clearError: () => {
    set({ error: null });
  },
}));
