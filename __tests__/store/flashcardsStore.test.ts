import { useFlashcardsStore } from "@/store/flashcardsStore";
import { flashcardsService } from "@/services/api/flashcards.service";
import type { FlashcardDeck, Flashcard } from "@/types/flashcard";

// Mock the flashcards service
jest.mock("@/services/api/flashcards.service");

const mockFlashcardsService = flashcardsService as jest.Mocked<
  typeof flashcardsService
>;

describe("FlashcardsStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useFlashcardsStore.setState({
      decks: [],
      currentDeck: null,
      currentCards: [],
      isLoading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  describe("fetchDecks", () => {
    it("should fetch decks successfully", async () => {
      const mockDecks: FlashcardDeck[] = [
        {
          $id: "deck1",
          userId: "user1",
          name: "Physics Deck",
          subject: "Physics",
          topic: "Mechanics",
          cardCount: 10,
          sourceType: "document",
          sourceId: "doc1",
          lastStudied: null,
          $createdAt: "2024-01-01T00:00:00.000Z",
          $updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ];

      mockFlashcardsService.listDecks.mockResolvedValue({
        success: true,
        data: mockDecks,
      });

      const { fetchDecks } = useFlashcardsStore.getState();
      await fetchDecks();

      const state = useFlashcardsStore.getState();
      expect(state.decks).toEqual(mockDecks);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should handle fetch decks error", async () => {
      mockFlashcardsService.listDecks.mockResolvedValue({
        success: false,
        data: [],
        message: "Failed to fetch decks",
      });

      const { fetchDecks } = useFlashcardsStore.getState();
      await fetchDecks();

      const state = useFlashcardsStore.getState();
      expect(state.decks).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe("Failed to fetch decks");
    });
  });

  describe("deleteDeck", () => {
    it("should delete deck successfully and update state", async () => {
      const mockDecks: FlashcardDeck[] = [
        {
          $id: "deck1",
          userId: "user1",
          name: "Physics Deck",
          subject: "Physics",
          topic: "Mechanics",
          cardCount: 10,
          sourceType: "document",
          sourceId: "doc1",
          lastStudied: null,
          $createdAt: "2024-01-01T00:00:00.000Z",
          $updatedAt: "2024-01-01T00:00:00.000Z",
        },
        {
          $id: "deck2",
          userId: "user1",
          name: "Chemistry Deck",
          subject: "Chemistry",
          topic: "Organic",
          cardCount: 5,
          sourceType: "note",
          sourceId: "note1",
          lastStudied: null,
          $createdAt: "2024-01-01T00:00:00.000Z",
          $updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ];

      useFlashcardsStore.setState({ decks: mockDecks });

      mockFlashcardsService.deleteDeck.mockResolvedValue({
        success: true,
        data: { message: "Deck deleted" },
      });

      const { deleteDeck } = useFlashcardsStore.getState();
      const result = await deleteDeck("deck1");

      expect(result).toBe(true);
      const state = useFlashcardsStore.getState();
      expect(state.decks).toHaveLength(1);
      expect(state.decks[0].$id).toBe("deck2");
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should handle delete deck error", async () => {
      mockFlashcardsService.deleteDeck.mockResolvedValue({
        success: false,
        data: { message: "" },
        message: "Delete failed",
      });

      const { deleteDeck } = useFlashcardsStore.getState();
      const result = await deleteDeck("deck1");

      expect(result).toBe(false);
      const state = useFlashcardsStore.getState();
      expect(state.error).toBe("Delete failed");
    });
  });

  describe("generateFlashcards", () => {
    it("should generate flashcards successfully", async () => {
      const mockDeckId = "new-deck-id";
      const mockFlashcards: Flashcard[] = [
        {
          $id: "card1",
          deckId: mockDeckId,
          front: "What is Newton's First Law?",
          back: "An object at rest stays at rest...",
          order: 0,
          $createdAt: "2024-01-01T00:00:00.000Z",
          $updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ];

      mockFlashcardsService.generateFlashcards.mockResolvedValue({
        success: true,
        data: {
          deckId: mockDeckId,
          flashcards: mockFlashcards,
          metadata: {
            method: "ai",
            cached: false,
            responseTime: 1500,
          },
        },
      });

      mockFlashcardsService.listDecks.mockResolvedValue({
        success: true,
        data: [],
      });

      const { generateFlashcards } = useFlashcardsStore.getState();
      const result = await generateFlashcards({
        deckName: "Test Deck",
        subject: "Physics",
        topic: "Mechanics",
        cardCount: 5,
      });

      expect(result.success).toBe(true);
      expect(result.deckId).toBe(mockDeckId);
      expect(mockFlashcardsService.listDecks).toHaveBeenCalled();
    });

    it("should handle generate flashcards error", async () => {
      mockFlashcardsService.generateFlashcards.mockResolvedValue({
        success: false,
        data: {
          deckId: "",
          flashcards: [],
          metadata: {
            method: "ai",
            cached: false,
            responseTime: 0,
          },
        },
        message: "Generation failed",
      });

      const { generateFlashcards } = useFlashcardsStore.getState();
      const result = await generateFlashcards({
        deckName: "Test Deck",
        subject: "Physics",
        topic: "Mechanics",
        cardCount: 5,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Generation failed");
      const state = useFlashcardsStore.getState();
      expect(state.error).toBe("Generation failed");
    });
  });
});
