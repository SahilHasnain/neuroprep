/**
 * Flashcard Types
 */

export interface FlashcardDeck {
  $id: string;
  userId: string;
  name: string;
  subject: string;
  topic: string;
  cardCount: number;
  sourceType: "document" | "note" | "doubt" | "manual";
  sourceId: string | null;
  lastStudied: string | null;
  $createdAt: string;
  $updatedAt: string;
}

export interface Flashcard {
  $id: string;
  deckId: string;
  front: string;
  back: string;
  order: number;
  $createdAt: string;
  $updatedAt: string;
}

export interface FlashcardGenerationConfig {
  deckName: string;
  subject: string;
  topic: string;
  cardCount: number;
  documentContext?: DocumentContext;
  noteContext?: NoteContext;
  doubtContext?: DoubtContext;
}

export interface DocumentContext {
  documentId: string;
  documentTitle: string;
  ocrText: string;
}

export interface NoteContext {
  noteId: string;
  subject: string;
  topic: string;
  content: string;
}

export interface DoubtContext {
  doubtId: string;
  doubtText: string;
  resolution: string;
  subject: string;
  topic: string;
}
