import {
  validateDocumentContext,
  validateNoteContext,
  validateDoubtContext,
  parseContextFromParams,
  hasContext,
} from "@/utils/flashcardContext";
import type {
  DocumentContext,
  NoteContext,
  DoubtContext,
} from "@/types/flashcard";

describe("flashcardContext utilities", () => {
  describe("validateDocumentContext", () => {
    it("should validate valid document context", () => {
      const validContext: DocumentContext = {
        documentId: "doc123",
        documentTitle: "Physics Notes",
        ocrText: "Newton's laws of motion...",
      };

      expect(validateDocumentContext(validContext)).toBe(true);
    });

    it("should reject context with missing documentId", () => {
      const invalidContext = {
        documentTitle: "Physics Notes",
        ocrText: "Newton's laws of motion...",
      };

      expect(validateDocumentContext(invalidContext)).toBe(false);
    });

    it("should reject context with empty documentId", () => {
      const invalidContext = {
        documentId: "",
        documentTitle: "Physics Notes",
        ocrText: "Newton's laws of motion...",
      };

      expect(validateDocumentContext(invalidContext)).toBe(false);
    });

    it("should reject context with missing ocrText", () => {
      const invalidContext = {
        documentId: "doc123",
        documentTitle: "Physics Notes",
      };

      expect(validateDocumentContext(invalidContext)).toBe(false);
    });

    it("should reject null or undefined context", () => {
      expect(validateDocumentContext(null)).toBe(false);
      expect(validateDocumentContext(undefined)).toBe(false);
    });

    it("should reject non-object context", () => {
      expect(validateDocumentContext("string")).toBe(false);
      expect(validateDocumentContext(123)).toBe(false);
      expect(validateDocumentContext([])).toBe(false);
    });
  });

  describe("validateNoteContext", () => {
    it("should validate valid note context", () => {
      const validContext: NoteContext = {
        noteId: "note123",
        subject: "physics",
        topic: "Mechanics",
        content: "Newton's laws...",
      };

      expect(validateNoteContext(validContext)).toBe(true);
    });

    it("should reject context with missing noteId", () => {
      const invalidContext = {
        subject: "physics",
        topic: "Mechanics",
        content: "Newton's laws...",
      };

      expect(validateNoteContext(invalidContext)).toBe(false);
    });

    it("should reject context with empty subject", () => {
      const invalidContext = {
        noteId: "note123",
        subject: "",
        topic: "Mechanics",
        content: "Newton's laws...",
      };

      expect(validateNoteContext(invalidContext)).toBe(false);
    });

    it("should reject context with missing content", () => {
      const invalidContext = {
        noteId: "note123",
        subject: "physics",
        topic: "Mechanics",
      };

      expect(validateNoteContext(invalidContext)).toBe(false);
    });

    it("should reject null or undefined context", () => {
      expect(validateNoteContext(null)).toBe(false);
      expect(validateNoteContext(undefined)).toBe(false);
    });
  });

  describe("validateDoubtContext", () => {
    it("should validate valid doubt context", () => {
      const validContext: DoubtContext = {
        doubtId: "doubt123",
        doubtText: "What is Newton's First Law?",
        resolution: "An object at rest stays at rest...",
        subject: "physics",
        topic: "Mechanics",
      };

      expect(validateDoubtContext(validContext)).toBe(true);
    });

    it("should reject context with missing doubtId", () => {
      const invalidContext = {
        doubtText: "What is Newton's First Law?",
        resolution: "An object at rest stays at rest...",
        subject: "physics",
        topic: "Mechanics",
      };

      expect(validateDoubtContext(invalidContext)).toBe(false);
    });

    it("should reject context with empty resolution", () => {
      const invalidContext = {
        doubtId: "doubt123",
        doubtText: "What is Newton's First Law?",
        resolution: "",
        subject: "physics",
        topic: "Mechanics",
      };

      expect(validateDoubtContext(invalidContext)).toBe(false);
    });

    it("should reject context with missing topic", () => {
      const invalidContext = {
        doubtId: "doubt123",
        doubtText: "What is Newton's First Law?",
        resolution: "An object at rest stays at rest...",
        subject: "physics",
      };

      expect(validateDoubtContext(invalidContext)).toBe(false);
    });

    it("should reject null or undefined context", () => {
      expect(validateDoubtContext(null)).toBe(false);
      expect(validateDoubtContext(undefined)).toBe(false);
    });
  });

  describe("parseContextFromParams", () => {
    it("should parse valid document context from string", () => {
      const params = {
        documentContext: JSON.stringify({
          documentId: "doc123",
          documentTitle: "Physics Notes",
          ocrText: "Newton's laws...",
        }),
      };

      const result = parseContextFromParams(params);

      expect(result.documentContext).toBeDefined();
      expect(result.documentContext?.documentId).toBe("doc123");
      expect(result.noteContext).toBeUndefined();
      expect(result.doubtContext).toBeUndefined();
    });

    it("should parse valid note context from object", () => {
      const params = {
        noteContext: {
          noteId: "note123",
          subject: "physics",
          topic: "Mechanics",
          content: "Newton's laws...",
        },
      };

      const result = parseContextFromParams(params);

      expect(result.noteContext).toBeDefined();
      expect(result.noteContext?.noteId).toBe("note123");
      expect(result.documentContext).toBeUndefined();
      expect(result.doubtContext).toBeUndefined();
    });

    it("should parse valid doubt context", () => {
      const params = {
        doubtContext: JSON.stringify({
          doubtId: "doubt123",
          doubtText: "What is Newton's First Law?",
          resolution: "An object at rest stays at rest...",
          subject: "physics",
          topic: "Mechanics",
        }),
      };

      const result = parseContextFromParams(params);

      expect(result.doubtContext).toBeDefined();
      expect(result.doubtContext?.doubtId).toBe("doubt123");
      expect(result.documentContext).toBeUndefined();
      expect(result.noteContext).toBeUndefined();
    });

    it("should parse multiple contexts", () => {
      const params = {
        documentContext: JSON.stringify({
          documentId: "doc123",
          documentTitle: "Physics Notes",
          ocrText: "Newton's laws...",
        }),
        noteContext: JSON.stringify({
          noteId: "note123",
          subject: "physics",
          topic: "Mechanics",
          content: "Newton's laws...",
        }),
      };

      const result = parseContextFromParams(params);

      expect(result.documentContext).toBeDefined();
      expect(result.noteContext).toBeDefined();
      expect(result.doubtContext).toBeUndefined();
    });

    it("should handle invalid JSON gracefully", () => {
      const params = {
        documentContext: "invalid json {",
      };

      const result = parseContextFromParams(params);

      expect(result.documentContext).toBeUndefined();
      expect(result.noteContext).toBeUndefined();
      expect(result.doubtContext).toBeUndefined();
    });

    it("should reject invalid context structure", () => {
      const params = {
        documentContext: JSON.stringify({
          documentId: "doc123",
          // Missing required fields
        }),
      };

      const result = parseContextFromParams(params);

      expect(result.documentContext).toBeUndefined();
    });

    it("should return empty object for no params", () => {
      const result = parseContextFromParams({});

      expect(result.documentContext).toBeUndefined();
      expect(result.noteContext).toBeUndefined();
      expect(result.doubtContext).toBeUndefined();
    });
  });

  describe("hasContext", () => {
    it("should return true when document context exists", () => {
      const params = {
        documentContext: JSON.stringify({
          documentId: "doc123",
          documentTitle: "Physics Notes",
          ocrText: "Newton's laws...",
        }),
      };

      expect(hasContext(params)).toBe(true);
    });

    it("should return true when note context exists", () => {
      const params = {
        noteContext: JSON.stringify({
          noteId: "note123",
          subject: "physics",
          topic: "Mechanics",
          content: "Newton's laws...",
        }),
      };

      expect(hasContext(params)).toBe(true);
    });

    it("should return true when doubt context exists", () => {
      const params = {
        doubtContext: JSON.stringify({
          doubtId: "doubt123",
          doubtText: "What is Newton's First Law?",
          resolution: "An object at rest stays at rest...",
          subject: "physics",
          topic: "Mechanics",
        }),
      };

      expect(hasContext(params)).toBe(true);
    });

    it("should return true when multiple contexts exist", () => {
      const params = {
        documentContext: "{}",
        noteContext: "{}",
      };

      expect(hasContext(params)).toBe(true);
    });

    it("should return false when no context exists", () => {
      const params = {};

      expect(hasContext(params)).toBe(false);
    });

    it("should return false for null or undefined params", () => {
      expect(hasContext(null)).toBe(false);
      expect(hasContext(undefined)).toBe(false);
    });
  });
});
