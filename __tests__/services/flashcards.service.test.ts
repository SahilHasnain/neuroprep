import { flashcardsService } from "@/services/api/flashcards.service";
import { apiClient } from "@/services/api/client";
import { API_ENDPOINTS } from "@/constants";
import type { FlashcardDeck, Flashcard } from "@/types/flashcard";

// Mock the API client
jest.mock("@/services/api/client");

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe("FlashcardsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listDecks", () => {
    it("should call API client with correct endpoint", async () => {
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

      mockApiClient.get.mockResolvedValue({
        success: true,
        data: mockDecks,
      });

      const result = await flashcardsService.listDecks();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.FLASHCARDS_LIST_DECKS
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDecks);
    });
  });

  describe("getDeck", () => {
    it("should call API client with correct endpoint and deckId", async () => {
      const mockDeck: FlashcardDeck = {
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
      };

      const mockCards: Flashcard[] = [
        {
          $id: "card1",
          deckId: "deck1",
          front: "What is Newton's First Law?",
          back: "An object at rest stays at rest...",
          order: 0,
          $createdAt: "2024-01-01T00:00:00.000Z",
          $updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ];

      mockApiClient.get.mockResolvedValue({
        success: true,
        data: { deck: mockDeck, cards: mockCards },
      });

      const result = await flashcardsService.getDeck("deck1");

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.FLASHCARDS_GET_DECK}?deckId=deck1`
      );
      expect(result.success).toBe(true);
      expect(result.data?.deck).toEqual(mockDeck);
      expect(result.data?.cards).toEqual(mockCards);
    });
  });

  describe("deleteDeck", () => {
    it("should call API client with correct endpoint and deckId", async () => {
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: { message: "Deck deleted successfully" },
      });

      const result = await flashcardsService.deleteDeck("deck1");

      expect(mockApiClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.FLASHCARDS_DELETE_DECK,
        { deckId: "deck1" }
      );
      expect(result.success).toBe(true);
      expect(result.data?.message).toBe("Deck deleted successfully");
    });
  });

  describe("generateFlashcards", () => {
    it("should call API client with correct endpoint and config", async () => {
      const config = {
        deckName: "Test Deck",
        subject: "Physics",
        topic: "Mechanics",
        cardCount: 5,
      };

      const mockResponse = {
        deckId: "new-deck-id",
        flashcards: [
          {
            $id: "card1",
            deckId: "new-deck-id",
            front: "What is Newton's First Law?",
            back: "An object at rest stays at rest...",
            order: 0,
            $createdAt: "2024-01-01T00:00:00.000Z",
            $updatedAt: "2024-01-01T00:00:00.000Z",
          },
        ],
        metadata: {
          method: "ai" as const,
          cached: false,
          responseTime: 1500,
        },
      };

      mockApiClient.post.mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const result = await flashcardsService.generateFlashcards(config);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.FLASHCARDS_GENERATE,
        config
      );
      expect(result.success).toBe(true);
      expect(result.data?.deckId).toBe("new-deck-id");
      expect(result.data?.metadata.method).toBe("ai");
    });

    it("should handle generation with document context", async () => {
      const config = {
        deckName: "Document Deck",
        subject: "Physics",
        topic: "Mechanics",
        cardCount: 5,
        documentContext: {
          documentId: "doc1",
          documentTitle: "Physics Notes",
          ocrText: "Newton's laws of motion...",
        },
      };

      mockApiClient.post.mockResolvedValue({
        success: true,
        data: {
          deckId: "new-deck-id",
          flashcards: [],
          metadata: {
            method: "ai" as const,
            cached: false,
            responseTime: 1500,
          },
        },
      });

      const result = await flashcardsService.generateFlashcards(config);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.FLASHCARDS_GENERATE,
        config
      );
      expect(result.success).toBe(true);
    });
  });
});
